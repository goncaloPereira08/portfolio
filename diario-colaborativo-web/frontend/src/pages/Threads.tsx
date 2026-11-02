import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Thread {
  id: number;
  titulo: string;
  descricao: string;
}

export function Threads() {
  const navigate = useNavigate();

  // --- 1. ESTADOS DA TUA LÓGICA ---
  const [threads, setThreads] = useState<Thread[]>([]);
  const [erro, setErro] = useState('');
  const [nomeUtilizador, setNomeUtilizador] = useState('...');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  // --- 2. FUNÇÕES DE ACESSO AOS DADOS ---
  const carregarThreads = async () => {
    const token = localStorage.getItem('token');
    try {
      const resposta = await fetch('http://localhost:3000/api/threads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resposta.ok) {
        const dados = await resposta.json();
        setThreads(dados);
      } else {
        setErro('Erro ao carregar as Threads.');
      }
    } catch (err) {
      setErro('Erro de ligação ao servidor.');
    }
  };

  useEffect(() => {
    carregarThreads();
    
    // Aproveitamos para ler o nome do utilizador do Token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadDecoded = JSON.parse(atob(payloadBase64));
        if (payloadDecoded.nome) {
          setNomeUtilizador(payloadDecoded.nome);
        } else if (payloadDecoded.email) {
          setNomeUtilizador(payloadDecoded.email);
        }
      } catch (e) {
        console.error("Erro a ler os dados do utilizador.");
      }
    }
  }, []);

  const criarThread = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const resposta = await fetch('http://localhost:3000/api/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ titulo, descricao })
      });

      if (resposta.ok) {
        setTitulo('');
        setDescricao('');
        setMostrarFormulario(false);
        carregarThreads(); 
      } else {
        setErro('Erro ao criar a Thread. Verifica os dados.');
      }
    } catch (err) {
      setErro('Erro de ligação ao servidor.');
    }
  };

  return (
    <div style={{ backgroundColor: 'transparent', color: '#1e293b', minHeight: '100vh' }}>
      
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px', color: '#0f172a' }}>
        Olá, {nomeUtilizador} 👋
      </h2>

      <div style={{ display: 'flex', width: '100%', marginBottom: '40px', alignItems: 'center', justifyContent: 'space-between' }}>
        

        <div style={{ display: 'flex', width: '60%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
          <input 
            type="text" 
            placeholder="Pesquisar nas tuas threads..." 
            style={{ 
              flex: 1, padding: '14px 16px', fontSize: '15px', border: '1px solid #cbd5e1', 
              borderRight: 'none', outline: 'none', borderRadius: '8px 0 0 8px', backgroundColor: 'white'
            }} 
          />
          <button style={{ 
            padding: '10px 20px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', 
            borderRadius: '0 8px 8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>


        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: mostrarFormulario ? '#f1f5f9' : '#3b82f6', 
            color: mostrarFormulario ? '#475569' : 'white', 
            padding: '12px 24px', fontSize: '15px', fontWeight: '600',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            boxShadow: mostrarFormulario ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nova Thread'}
        </button>

      </div>

      {erro && <p style={{ color: '#ef4444', fontWeight: 'bold', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>{erro}</p>}


      {mostrarFormulario && (
        <form onSubmit={criarThread} style={{ backgroundColor: 'white', padding: '32px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '40px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', color: '#1e293b' }}>Criar Nova Thread</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Título da Thread (ex: Roadtrip 2026)" 
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc' }}
            />
            <textarea 
              placeholder="Descrição curta (opcional)" 
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '120px', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc', resize: 'vertical' }}
            />
            <button type="submit" style={{ padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '160px', fontSize: '15px', marginTop: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>
              Guardar Thread
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gap: '24px' }}>
        {threads.map((thread) => (
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
            <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>{thread.descricao}</p>
          </div>
        ))}
        
        {threads.length === 0 && !erro && (
          <div style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: 'white', border: '2px dashed #cbd5e1', borderRadius: '16px', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '48px', marginBottom: '16px' }}>🗂️</span>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#334155', margin: '0 0 8px 0' }}>O teu diário está vazio</h3>
            <p style={{ margin: 0, fontSize: '16px' }}>Clica em <strong style={{color: '#3b82f6'}}>+ Nova Thread</strong> ali em cima para começares a criar coleções de memórias!</p>
          </div>
        )}
      </div>

    </div>
  );
}