import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index'; // Importa a tua app Express

describe('Suite de Testes - Estado da API', () => {
  it('Deve retornar status 200 e uma mensagem na rota GET /api/ping', async () => {
    const response = await request(app).get('/api/ping');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('mensagem');
    expect(response.body.mensagem).toBe('Pong! O servidor do Life Threads está vivo!');
  });
});