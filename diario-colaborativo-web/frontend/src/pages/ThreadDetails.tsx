import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function ThreadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [threadInfo, setThreadInfo] = useState<any>(null);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Estados para Nova Memória
  const [texto, setTexto] = useState('');
  const [ficheiro, setFicheiro] = useState<File | null>(null);

  // Estados para Edição
  const [editandoMemoriaId, setEditandoMemoriaId] = useState<number | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');
  const [editandoThread, setEditandoThread] = useState(false);
  const [tituloThread, setTituloThread] = useState('');

  // Estado para Adicionar Membro
  const [novoMembroId, setNovoMembroId] = useState('');

  //  NOVOS ESTADOS PARA A IA 
  const [resumoIA, setResumoIA] = useState('');
  const [gerandoResumo, setGerandoResumo] = useState(false);

  const carregar = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(Number(payload.id));
    }
    try {
      const res = await fetch(`http://localhost:3000/api/threads/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const dados = await res.json();
        setThreadInfo(dados);
        setTituloThread(dados.titulo);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { carregar(); }, [id]);

  const souAdmin = threadInfo?.id_criador === currentUserId;

  // --- GESTÃO DA THREAD ---
  const eliminarThread = async () => {
    const res = await fetch(`http://localhost:3000/api/threads/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) navigate('/perfil');
  };

  const salvarTituloThread = async () => {
    const res = await fetch(`http://localhost:3000/api/threads/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: tituloThread })
    });
    if (res.ok) { setEditandoThread(false); carregar(); }
  };

  const gerarResumoIA = async () => {
    // Verifica se há memórias carregadas antes de tentar resumir
    if (!threadInfo.memories || threadInfo.memories.length === 0) {
      return setMensagem({ texto: 'Adiciona memórias para a IA as poder ler!', tipo: 'erro' });
    }

    setGerandoResumo(true);
    setResumoIA('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:3000/api/ai/summarize', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        
        body: JSON.stringify({ threadId: id }) 
      });

      if (res.ok) {
        const dados = await res.json();
        setResumoIA(dados.resumo);
      } else {
        const erroSvr = await res.json();
        setMensagem({ texto: erroSvr.erro || 'Erro ao gerar resumo.', tipo: 'erro' });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro de ligação ao servidor.', tipo: 'erro' });
    } finally {
      setGerandoResumo(false);
    }
  };

  // --- CRIAR MEMÓRIA ---
  const submeterPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() && !ficheiro) return setMensagem({ texto: 'Escreve algo ou adiciona uma imagem!', tipo: 'erro' });
    
    const formData = new FormData();
    if (texto) formData.append('texto', texto);
    formData.append('id_thread', id!);
    if (ficheiro) formData.append('imagem', ficheiro);

    const res = await fetch('http://localhost:3000/api/feed/criar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });

    if (res.ok) { 
      setTexto(''); 
      setFicheiro(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setMensagem({ texto: 'Memória guardada!', tipo: 'sucesso' }); 
      carregar(); 
    } else { 
      setMensagem({ texto: 'Erro ao guardar a memória.', tipo: 'erro' }); 
    }
  };

  // --- GESTÃO DE MEMÓRIAS ---
  const eliminarMemoria = async (memId: number) => {
    const res = await fetch(`http://localhost:3000/api/memories/${memId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) carregar();
  };

  const salvarEdicaoMemoria = async (memId: number) => {
    const res = await fetch(`http://localhost:3000/api/memories/${memId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: textoEdicao })
    });
    if (res.ok) { setEditandoMemoriaId(null); carregar(); }
  };

  // --- GESTÃO DE MEMBROS ---
  const adicionarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:3000/api/threads/${id}/members`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_utilizador: Number(novoMembroId), cargo: 'LEITOR' })
    });
    if (res.ok) { setNovoMembroId(''); carregar(); setMensagem({ texto: 'Membro adicionado!', tipo: 'sucesso' }); }
    else { setMensagem({ texto: 'Erro ao adicionar.', tipo: 'erro' }); }
  };

  const removerMembro = async (userId: number) => {
    const res = await fetch(`http://localhost:3000/api/threads/${id}/members/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      if (userId === currentUserId) navigate('/perfil');
      else carregar();
      setMensagem({ texto: userId === currentUserId ? 'Saíste da thread' : 'Membro removido', tipo: 'sucesso' });
    }
  };

  if (!threadInfo || currentUserId === null) return <p style={{ padding: '40px', color: '#64748b' }}>A carregar a thread...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', color: '#1e293b' }}>
      
      {/* CABEÇALHO DA THREAD COM O BOTÃO DA IA */}
      <div style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          
          {editandoThread ? (
            <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center' }}>
              <input value={tituloThread} onChange={e => setTituloThread(e.target.value)} style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '18px', outline: 'none' }} />
              <button onClick={salvarTituloThread} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 20px', fontWeight: '600', cursor: 'pointer' }}>✓ Guardar</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>{threadInfo.titulo}</h1>
              {souAdmin && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditandoThread(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Editar Título">✏️</button>
                  <button onClick={eliminarThread} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Apagar Thread">🗑️</button>
                </div>
              )}
            </div>
          )}

          {/*  BOTÃO MÁGICO DA IA  */}
          {!editandoThread && (
            <button 
              onClick={gerarResumoIA}
              disabled={gerandoResumo}
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', 
                color: 'white', padding: '12px 24px', 
                border: 'none', borderRadius: '8px', fontWeight: '600', cursor: gerandoResumo ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 10px rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', gap: '8px',
                opacity: gerandoResumo ? 0.7 : 1, transition: 'all 0.2s'
              }}
            >
              {gerandoResumo ? '✨ A PENSAR...' : '✨ RESUMO IA'}
            </button>
          )}

        </div>
        <p style={{ color: '#475569', margin: 0, fontSize: '16px', lineHeight: '1.6' }}>{threadInfo.descricao}</p>
      </div>

      {/*  QUADRO DE EXIBIÇÃO DO RESUMO DA IA  */}
      {resumoIA && (
        <div style={{ border: '1px solid #ddd6fe', padding: '24px', backgroundColor: '#f5f3ff', borderRadius: '12px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
            ✨ A Nossa História (por IA)
          </h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '16px', margin: 0, color: '#4c1d95' }}>{resumoIA}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2', minWidth: '400px' }}>
          <button onClick={() => navigate('/perfil')} style={{ marginBottom: '24px', border: 'none', padding: '0', background: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>← Voltar</button>

          {mensagem.texto && (
            <div style={{ padding: '16px', marginBottom: '24px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', backgroundColor: mensagem.tipo === 'sucesso' ? '#d1fae5' : '#fee2e2', color: mensagem.tipo === 'sucesso' ? '#065f46' : '#991b1b', border: `1px solid ${mensagem.tipo === 'sucesso' ? '#34d399' : '#f87171'}` }}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={submeterPost} style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px', color: '#0f172a', marginBottom: '16px' }}>Nova Memória</h3>
            <textarea 
              value={texto} 
              onChange={e => setTexto(e.target.value)} 
              placeholder="O que aconteceu?" 
              style={{ width: '100%', minHeight: '100px', marginBottom: '16px', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none', fontSize: '15px', resize: 'vertical' }} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input id="file-upload" type="file" onChange={e => setFicheiro(e.target.files?.[0] || null)} style={{ fontSize: '14px', color: '#64748b' }} />
              <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>PUBLICAR</button>
            </div>
          </form>

          {/* LISTA DE MEMÓRIAS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(threadInfo.memories || []).length === 0 && (
              <p style={{ fontWeight: '500', color: '#64748b', textAlign: 'center', padding: '20px' }}>Ainda não há memórias aqui.</p>
            )}
            {threadInfo.memories?.map((m: any) => (
              <div key={m.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', background: 'white', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                
                {m.id_autor === currentUserId && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditandoMemoriaId(m.id); setTextoEdicao(m.texto); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✏️</button>
                    <button onClick={() => eliminarMemoria(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                  </div>
                )}

                {editandoMemoriaId === m.id ? (
                  <div>
                    <textarea value={textoEdicao} onChange={e => setTextoEdicao(e.target.value)} style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', boxSizing: 'border-box', minHeight: '100px', fontSize: '15px', outline: 'none' }} />
                    <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                      <button onClick={() => salvarEdicaoMemoria(m.id)} style={{ background: '#10b981', color: 'white', padding: '10px 16px', cursor: 'pointer', fontWeight: '600', border: 'none', borderRadius: '6px' }}>Guardar</button>
                      <button onClick={() => setEditandoMemoriaId(null)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 16px', cursor: 'pointer', fontWeight: '600', borderRadius: '6px' }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{ margin: '0 0 16px 0', paddingRight: '50px', fontSize: '15px', lineHeight: '1.6', color: '#334155' }}>{m.texto}</p>
                    {m.anexo_url && <img src={`http://localhost:3000${m.anexo_url}`} style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '10px' }} />}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PAINEL LATERAL DE MEMBROS E GESTÃO */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👥 Membros</h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
              {(threadInfo.membros || []).map((m: any) => (
                <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{m.utilizador.nome} {m.cargo === 'ADMIN' ? '👑' : ''}</span>
                  {souAdmin && m.utilizador.id !== currentUserId && (
                    <button onClick={() => removerMembro(m.utilizador.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Remover</button>
                  )}
                </li>
              ))}
            </ul>

            {souAdmin ? (
              <form onSubmit={adicionarMembro} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>CONVIDAR POR ID:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" value={novoMembroId} onChange={e => setNovoMembroId(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  <button type="submit" style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', fontWeight: '600', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>ADD</button>
                </div>
              </form>
            ) : (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <button 
                  onClick={() => removerMembro(currentUserId)} 
                  style={{ width: '100%', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: '600', borderRadius: '8px', cursor: 'pointer' }}
                >
                  SAIR DA THREAD
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}