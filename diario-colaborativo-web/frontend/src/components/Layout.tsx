import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function Layout() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nome: '', foto: '', id: '' });

  const carregarDados = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Vai buscar os dados mais recentes ao servidor (frescos!)
      const res = await fetch(`http://localhost:3000/api/auth/${payload.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const corpo = await res.json();
        setUser({ 
          id: corpo.dados.id,
          nome: corpo.dados.nome, 
          foto: corpo.dados.foto_perfil || '' 
        });
      }
    } catch (e) { console.error("Erro ao carregar dados do utilizador"); }
  };

  useEffect(() => { carregarDados(); }, []);

  const avatarUrl = user.foto 
    ? `http://localhost:3000${user.foto}?t=${new Date().getTime()}` // O ?t= evita que o browser use a foto antiga em cache
    : `https://api.dicebear.com/7.x/initials/svg?seed=${user.nome || 'U'}`;

  return (
    // Adicionada uma fonte mais moderna genérica ao wrapper principal
    <div style={{ display: 'flex', minHeight: '100vh', margin: 0, fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>
      {/* Cor de fundo alterada de #000 para um Azul/Cinzento muito escuro (#0f172a) */}
      <aside style={{ width: '250px', backgroundColor: '#0f172a', color: 'white', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px', padding: '15px 10px' }}>
          {/* Avatar sem bordas grossas, com sombra suave */}
          <img src={avatarUrl} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }} />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{user.nome || '...'}</h3>
          <small style={{ color: '#94a3b8' }}>#{user.id}</small>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {/* Links mais limpos, sem fundo branco gigante */}
          <Link to="/" style={{ color: '#f8fafc', padding: '12px 16px', textDecoration: 'none', fontWeight: '500', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }}>🌍 Feed Global</Link>
          <Link to="/perfil" style={{ color: '#f8fafc', padding: '12px 16px', textDecoration: 'none', fontWeight: '500', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }}>📁 As Minhas Threads</Link>
          <Link to="/definicoes" style={{ color: '#f8fafc', padding: '12px 16px', textDecoration: 'none', fontWeight: '500', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }}>⚙️ Definições</Link>
        </nav>

        {/* Botão sair com um vermelho mais suave e cantos redondos */}
        <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} style={{ marginTop: 'auto', backgroundColor: '#ef4444', color: 'white', padding: '12px', fontWeight: '600', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
          Sair da Conta
        </button>
      </aside>

      <main style={{ flex: 1, backgroundColor: '#f8fafc', padding: '40px' }}>
        <Outlet />
      </main>
    </div>
  );
}