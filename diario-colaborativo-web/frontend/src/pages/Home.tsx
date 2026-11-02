import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

export function Home() {
  const navigate = useNavigate(); 
  const [feed, setFeed] = useState<any[]>([]);
  const [pesquisa, setPesquisa] = useState('');

  useEffect(() => {
    const carregarFeed = async () => {
      const token = localStorage.getItem('token');
      try {
        const resposta = await fetch('http://localhost:3000/api/feed', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resposta.ok) {
          const dados = await resposta.json();
          setFeed(dados);
        }
      } catch (err) { console.error('Erro ao carregar o feed', err); }
    };
    
    // 1. Carrega o feed imediatamente ao abrir a página
    carregarFeed();

    // 2. POLLING: A cada 30 segundos, vai buscar dados novos silenciosamente (Tempo Real)
    const timer = setInterval(carregarFeed, 30000);

    // 3. Limpa o ciclo se o utilizador sair da página Home
    return () => clearInterval(timer);
  }, []);

  const feedFiltrado = feed.filter(post => {
    const textoMemoria = (post.texto || "").toLowerCase();
    const nomeAutor = (post.autor?.nome || "").toLowerCase();
    const termo = pesquisa.toLowerCase();
    
    return textoMemoria.includes(termo) || nomeAutor.includes(termo);
  });

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', color: '#1e293b' }}>
      
      <h1 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '32px', color: '#0f172a', fontSize: '28px' }}>
        🌍 Feed Global
      </h1>
      
      <input 
        type="text" 
        placeholder="🔍 Pesquisar por texto ou por autor..." 
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '32px', boxSizing: 'border-box', fontSize: '15px', outline: 'none', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {feedFiltrado.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <p style={{ fontSize: '16px' }}>Nenhuma memória encontrada.</p>
          </div>
        ) : (
          feedFiltrado.map(post => (
            <div 
              key={post.id} 
              onClick={() => navigate(`/threads/${post.id_thread}`)}
              style={{ 
                padding: '24px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                backgroundColor: 'white', 
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
                
                <img 
                  src={post.autor?.foto_perfil ? `http://localhost:3000${post.autor.foto_perfil}` : 'https://api.dicebear.com/7.x/initials/svg?seed=' + (post.autor?.nome || 'U')} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #e2e8f0', objectFit: 'cover' }} 
                  alt="Autor"
                />
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a' }}>{post.autor?.nome || 'Utilizador Desconhecido'}</strong>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{new Date(post.criado_em).toLocaleString()}</span>
                </div>
              </div>
              
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#334155', margin: '0' }}>{post.texto}</p>
              
              {post.anexo_url && (
                <img 
                  src={`http://localhost:3000${post.anexo_url}`} 
                  alt="Anexo" 
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '16px' }} 
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}