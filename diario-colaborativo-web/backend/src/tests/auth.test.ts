import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index'; 

describe('Suite de Testes - Segurança, Validação e Erros (TP7 e TP11)', () => {
  
  it('Deve retornar status 400 ao tentar registar utilizador sem email', async () => {
    const response = await request(app)
      .post('/api/auth/register') 
      .send({
        fullName: "Professor Avaliador",
        password: "PasswordSuperSegura123!"
      });
    
    expect(response.status).toBe(400);
    // Verifica a estrutura do errorHandler
    expect(response.body).toHaveProperty('error');
    // Verifica se os detalhes do Zod vieram na resposta (TP11 Ex. 3)
    expect(response.body).toHaveProperty('detalhes');
  });

  it('Deve retornar status 404 e erro normalizado para rotas que não existem', async () => {
    const response = await request(app).get('/api/rota-secreta-inexistente');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Not Found');
  });

  // Alterado: O teste agora certifica-se de que intrusos sem token recebem um 401!
  it('Deve retornar status 401 ao tentar aceder ao Feed sem estar autenticado', async () => {
    const response = await request(app).get('/api/feed');
    
    expect(response.status).toBe(401);
  });
});