import { useState, useEffect } from 'react';

export function Definicoes() {
  
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [novaFoto, setNovaFoto] = useState<File | null>(null);
  const [userId, setUserId] = useState('');
  
  const [dadosAtuais, setDadosAtuais] = useState({ nome: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  const carregarPerfil = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/auth/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const corpo = await res.json();
        if (corpo.dados) {
          // Guarda os dados originais para sabermos se houve alterações
          setDadosAtuais({ nome: corpo.dados.nome, email: corpo.dados.email });
          
          // Preenche imediatamente os campos de texto com os dados atuais!
          setNome(corpo.dados.nome);
          setEmail(corpo.dados.email);
        }
      }
    } catch (e) { console.error("Erro ao carregar perfil:", e); }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
      carregarPerfil(payload.id);
    }
  }, []);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem({ texto: '', tipo: '' });
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // 1. Enviar Nome e Email APENAS se foram alterados em relação ao original
      const payload: any = {};
      if (nome.trim() !== '' && nome !== dadosAtuais.nome) payload.nome = nome;
      if (email.trim() !== '' && email !== dadosAtuais.email) payload.email = email;

      let infoSucesso = true;
      if (Object.keys(payload).length > 0) {
        const resInfo = await fetch(`http://localhost:3000/api/auth/${userId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!resInfo.ok) infoSucesso = false;
      }

      // 2. Enviar a Fotografia nova, se existir
      let fotoSucesso = true;
      if (novaFoto) {
        const fd = new FormData();
        fd.append('imagem', novaFoto); 
        
        const resFoto = await fetch('http://localhost:3000/api/feed/foto-perfil', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }, 
          body: fd
        });
        if (!resFoto.ok) fotoSucesso = false;
      }

      if (infoSucesso && fotoSucesso) {
        setMensagem({ texto: 'Definições atualizadas com sucesso!', tipo: 'sucesso' });
        setNovaFoto(null);
        carregarPerfil(userId); // Recarrega os dados visuais
        
        // Atualiza a nova foto e o nome no token automaticamente fazendo reload à página após 1.5s
        setTimeout(() => window.location.reload(), 1500); 
      } else {
        setMensagem({ texto: 'Ocorreu um erro ao guardar algumas definições.', tipo: 'erro' });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro de ligação ao servidor.', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '550px', margin: '40px auto', padding: '40px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)', color: '#1e293b' }}>
      
      <h2 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginTop: 0, fontSize: '24px', color: '#0f172a' }}>
        ⚙️ Definições da Conta
      </h2>
      
      <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
        Atualiza as tuas informações pessoais. Podes editar os campos diretamente.
      </p>

      {mensagem.texto && (
        <div style={{ 
          padding: '16px', 
          marginBottom: '24px', 
          borderRadius: '8px', 
          fontSize: '15px', 
          fontWeight: '500', 
          backgroundColor: mensagem.tipo === 'sucesso' ? '#d1fae5' : '#fee2e2', 
          color: mensagem.tipo === 'sucesso' ? '#065f46' : '#991b1b', 
          border: `1px solid ${mensagem.tipo === 'sucesso' ? '#34d399' : '#f87171'}` 
        }}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Campo: NOME  */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>
            Nome
          </label>
          <input 
            type="text" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc' }} 
          />
        </div>
        
        {/* Campo: EMAIL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>
            E-mail
          </label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc' }} 
          />
        </div>
        
        {/* Campo: FOTO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>
            Alterar Fotografia de Perfil
          </label>
          <div style={{ border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => setNovaFoto(e.target.files?.[0] || null)} 
              style={{ fontSize: '14px', color: '#64748b', width: '100%' }}
            />
          </div>
        </div>
        
        {/* Botão de Guardar */}
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            marginTop: '16px', 
            padding: '16px', 
            backgroundColor: loading ? '#94a3b8' : '#10b981', 
            color: 'white', 
            fontWeight: '600', 
            fontSize: '15px',
            borderRadius: '8px', 
            border: 'none', 
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'A GUARDAR ALTERAÇÕES...' : 'GUARDAR ALTERAÇÕES'}
        </button>

      </form>
    </div>
  );
}