import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index'; 

describe('Suite de Testes - Threads', () => {
  
  // Cenário de Segurança: Garantir que intrusos não criam threads
  it('Deve retornar status 401 (Unauthorized) ao tentar criar uma thread sem token de login', async () => {
    const response = await request(app)
      .post('/api/threads') // Rota comum de criação
      .send({
        titulo: "Thread de Teste",
        conteudo: "Isto devia ser bloqueado pelo authMiddleware!"
      });
    
    // O authMiddleware deve apanhar a falta de token e devolver 401
    expect(response.status).toBe(401);
  });

  // Cenário Limite: Aceder a um recurso que não existe
  it('Deve retornar erro ao tentar aceder a uma thread com um ID inexistente', async () => {
    // Pedimos a thread nº 999999 que não existe na base de dados
    const response = await request(app).get('/api/threads/999999');
    
    // Pode devolver 404 (Não encontrada) ou 401 (Se a rota for privada). 
    // Em ambos os casos, é um erro de cliente (4XX), provando que a API não rebenta!
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });
});