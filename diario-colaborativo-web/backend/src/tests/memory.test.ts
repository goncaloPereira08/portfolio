import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index'; 

describe('Suite de Testes - Memórias', () => {

  // Cenário de Segurança: Apagar memórias de outros
  it('Deve impedir a eliminação de uma memória sem estar autenticado (401)', async () => {
    const response = await request(app).delete('/api/memories/1');
    
    // Prova que o middleware de segurança protege até as rotas de eliminação (DELETE)
    expect(response.status).toBe(401);
  });

  // Cenário de Validação: Atualizar com dados inválidos
  it('Deve retornar erro de validação/autorização ao tentar editar memória sem dados obrigatórios', async () => {
    const response = await request(app)
      .put('/api/memories/1')
      .send({
        // Omitimos todos os dados de propósito
      });
    
    // Tem de ser barrado logo à porta (ou pelo Auth ou pelo Zod)
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});