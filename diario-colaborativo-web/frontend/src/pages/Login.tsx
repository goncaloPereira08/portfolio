import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [isLogin, setIsLogin] = useState(true); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState(''); 
  
  const [erro, setErro] = useState('');
  const [citacao, setCitacao] = useState<{ texto: string; autor: string } | null>(null);

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/');

    const buscarCitacao = async () => {
      try {
        const resposta = await fetch('http://localhost:3000/api/quotes/random');
        const dados = await resposta.json();
        
        if(resposta.ok) {
           setCitacao({ texto: dados.quote, autor: dados.author });
        }
      } catch (error) {
        console.error("Erro ao buscar citação ao backend");
      }
    };
    buscarCitacao();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const endpoint = isLogin ? 'login' : 'register';
    const corpo = isLogin ? { email, password } : { nome, email, password };

    try {
      const resposta = await fetch(`http://localhost:3000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
      });
      
      const data = await resposta.json();

      if (resposta.ok) {
        if (isLogin) {
          
          const tokenFinal = data.dados ? data.dados.token : data.token;
          localStorage.setItem('token', tokenFinal);
          navigate('/');
        } else {
          setIsLogin(true);
          setNome('');
          setErro('');
        }
      } else {
        setErro(data.erro || data.error || 'Ocorreu um erro na operação.');
      }
    } catch {
      setErro('Erro ao contactar o servidor.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>
      
      <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '800', color: '#0f172a' }}>Life Threads</h1>
      <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '16px' }}>
        {isLogin ? 'Bem-vindo de volta!' : 'Junta-te à nossa comunidade.'}
      </p>

      {/* Citação  */}
      {citacao && (
        <div style={{ maxWidth: '400px', marginBottom: '32px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <p style={{ fontStyle: 'italic', color: '#475569', fontSize: '15px', margin: '0 0 8px 0', lineHeight: '1.5' }}>"{citacao.texto}"</p>
          <strong style={{ color: '#0f172a', fontSize: '13px' }}>— {citacao.autor}</strong>
        </div>
      )}

      {/* Formulário  */}
      <div style={{ width: '100%', maxWidth: '380px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' }}>
        
        {/* Separadores Visuais */}
        <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '2px solid #e2e8f0' }}>
          <button 
            onClick={() => { setIsLogin(true); setErro(''); }}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: isLogin ? '2px solid #3b82f6' : 'none', color: isLogin ? '#3b82f6' : '#64748b', fontWeight: isLogin ? 'bold' : '500', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', marginBottom: '-2px' }}
          >
            Entrar
          </button>
          <button 
            onClick={() => { setIsLogin(false); setErro(''); }}
            style={{ flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: !isLogin ? '2px solid #3b82f6' : 'none', color: !isLogin ? '#3b82f6' : '#64748b', fontWeight: !isLogin ? 'bold' : '500', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', marginBottom: '-2px' }}
          >
            Registar
          </button>
        </div>
        
        {erro && <p style={{ color: erro.includes('sucesso') ? '#059669' : '#ef4444', backgroundColor: erro.includes('sucesso') ? '#d1fae5' : '#fee2e2', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: '500', fontSize: '14px', marginBottom: '24px' }}>{erro}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="O teu nome" 
              value={nome} 
              onChange={e => setNome(e.target.value)} 
              required 
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc' }} 
            />
          )}

          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc' }} 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc' }} 
          />

          {isLogin && (
            <div style={{ textAlign: 'right' }}>
              <button type="button" style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>
                Esqueceste-te da password?
              </button>
            </div>
          )}

          <button type="submit" style={{ padding: '14px', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer', border: 'none', borderRadius: '8px', fontSize: '16px', marginTop: '8px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)', transition: 'background-color 0.2s' }}>
            {isLogin ? 'INICIAR SESSÃO' : 'CRIAR CONTA'}
          </button>
        </form>
      </div>
    </div>
  );
}