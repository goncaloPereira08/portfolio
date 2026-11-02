import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Perfil() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<any[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [user, setUser] = useState({ id: '', nome: '' });
  
  // Novo estado para mostrar mensagens visuais de erro ou sucesso
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  const carregarThreads = async () => {
    const token = localStorage.getItem('token');
    try {
      const resposta = await fetch('http://localhost:3000/api/threads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setThreads(dados);
      }
    } catch (err) { console.error('Erro ao carregar as Threads.'); }
  };

  useEffect(() => { 
    carregarThreads(); 
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.id, nome: payload.nome });
    }
  }, []);

  const criarThread = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem({ texto: '', tipo: '' }); // Limpa mensagens anteriores
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch('http://localhost:3000/api/threads', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao })
      });
      
      if (resposta.ok) {
        setTitulo(''); setDescricao(''); setMostrarFormulario(false);
        carregarThreads(); 
        setMensagem({ texto: 'Thread criada com sucesso!', tipo: 'sucesso' });
        
        // Remove a mensagem de sucesso ao fim de 3 segundos
        setTimeout(() => setMensagem({ texto: '', tipo: '' }), 3000);
      } else {
        // AQUI CAPTURAMOS O ERRO DE VALIDAÇÃO (ex: título muito curto)
        const erroDados = await resposta.json();
        
        // O Zod envia os erros em formato de lista (Array)
        if (Array.isArray(erroDados)) {
          setMensagem({ texto: erroDados[0].message || 'Verifica os dados que preencheste.', tipo: 'erro' });
        } else {
          setMensagem({ texto: erroDados.erro || 'Erro ao criar thread.', tipo: 'erro' });
        }
      }
    } catch (err) { 
      setMensagem({ texto: 'Erro de ligação ao servidor.', tipo: 'erro' });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '850px', margin: '0 auto', color: '#1e293b' }}>
      
      {/* CABEÇALHO DO PERFIL */}
      <div style={{ padding: '32px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', borderRadius: '16px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>{user.nome}</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>Este é o teu perfil de utilizador.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>O TEU ID DE PARTILHA</p>
          <span style={{ fontSize: '20px', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', display: 'inline-block' }}>
            #{user.id}
          </span>
        </div>
      </div>

      {/* MENSAGENS VISUAIS GERAIS */}
      {mensagem.texto && !mostrarFormulario && (
        <div style={{ padding: '16px', marginBottom: '24px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', backgroundColor: mensagem.tipo === 'sucesso' ? '#d1fae5' : '#fee2e2', color: mensagem.tipo === 'sucesso' ? '#065f46' : '#991b1b', border: `1px solid ${mensagem.tipo === 'sucesso' ? '#34d399' : '#f87171'}` }}>
          {mensagem.texto}
        </div>
      )}

      {/* TÍTULO E BOTÃO "NOVA THREAD" */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a' }}>📚 As Minhas Threads</h2>
        <button 
          onClick={() => { setMostrarFormulario(!mostrarFormulario); setMensagem({ texto: '', tipo: '' }); }}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: mostrarFormulario ? '#f1f5f9' : '#3b82f6', 
            color: mostrarFormulario ? '#475569' : 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: '15px',
            boxShadow: mostrarFormulario ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nova Thread'}
        </button>
      </div>

      {/* FORMULÁRIO  */}
      {mostrarFormulario && (
        <form onSubmit={criarThread} style={{ backgroundColor: 'white', padding: '32px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '40px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
          
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', color: '#1e293b' }}>Criar Nova Thread</h3>

          {/* MENSAGEM DE ERRO DENTRO DO FORMULÁRIO */}
          {mensagem.texto && (
            <div style={{ padding: '16px', marginBottom: '20px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' }}>
              {mensagem.texto}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Título da Thread (mín. 3 letras)" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              required 
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} 
            />
            <textarea 
              placeholder="Descrição (opcional)" 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '120px', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc', resize: 'vertical', boxSizing: 'border-box' }} 
            />
            <button 
              type="submit" 
              style={{ padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '160px', fontSize: '15px', marginTop: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}
            >
              Guardar Thread
            </button>
          </div>
        </form>
      )}

      {/* LISTAGEM DE CARTÕES */}
      <div style={{ display: 'grid', gap: '24px' }}>
        {threads.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'transparent', border: '2px dashed #cbd5e1', borderRadius: '16px', color: '#64748b' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>🗂️</span>
            <p style={{ fontWeight: '500', fontSize: '16px', margin: 0 }}>Ainda não criaste nem foste adicionado a nenhuma Thread.</p>
          </div>
        ) : (
          threads.map(thread => (
            <div 
              key={thread.id} 
              onClick={() => navigate(`/threads/${thread.id}`)} 
              style={{ 
                padding: '24px', 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                cursor: 'pointer', 
                transition: 'transform 0.2s, box-shadow 0.2s' 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a' }}>{thread.titulo}</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>{thread.descricao || "Sem descrição disponível."}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}