import { describe, it, expect, vi } from 'vitest';
vi.mock('../../prismaClient', async () => ({ default: (await import('./fakePrisma.js')).default }));
import request from 'supertest';
import { app } from '../../index';

async function criarConta(nome: string) {
  const email = `${nome}@teste.pt`;
  const r = await request(app).post('/api/auth/register').send({ nome, email, password: 'SenhaForte123!' });
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  const l = await request(app).post('/api/auth/login').send({ email, password: 'SenhaForte123!' });
  expect(l.status, JSON.stringify(l.body)).toBe(200);
  const token = l.body.token ?? l.body.dados?.token;
  return { id: r.body.dados?.id ?? r.body.id, token };
}

describe('Fluxos principais e permissões (revisão do portefólio)', () => {
  it('registo, login, threads, memórias e controlo de acesso', async () => {
    const ana = await criarConta('ana');
    const rui = await criarConta('rui');
    expect(ana.token).toBeTruthy();

    // Ana cria uma thread
    const th = await request(app).post('/api/threads').set('Authorization', `Bearer ${ana.token}`).send({ titulo: 'Viagem', descricao: 'Férias' });
    expect(th.status, JSON.stringify(th.body)).toBe(201);
    const threadId = th.body.dados?.id ?? th.body.id;

    // Rui não pode editar nem apagar a thread da Ana
    expect((await request(app).put(`/api/threads/${threadId}`).set('Authorization', `Bearer ${rui.token}`).send({ titulo: 'hack' })).status).toBe(403);
    expect((await request(app).delete(`/api/threads/${threadId}`).set('Authorization', `Bearer ${rui.token}`)).status).toBe(403);

    // Ana edita a sua thread; id_criador enviado no corpo é ignorado
    const ed = await request(app).put(`/api/threads/${threadId}`).set('Authorization', `Bearer ${ana.token}`).send({ titulo: 'Viagem 2026', id_criador: rui.id });
    expect(ed.status, JSON.stringify(ed.body)).toBe(200);
    expect(ed.body.dados.id_criador).toBe(ana.id);

    // Ana adiciona o Rui como membro; ambos publicam memórias
    const add = await request(app).post(`/api/threads/${threadId}/members`).set('Authorization', `Bearer ${ana.token}`).send({ id_utilizador: rui.id });
    expect(add.status, JSON.stringify(add.body)).toBeLessThan(300);
    const mAna = await request(app).post(`/api/threads/${threadId}/memories`).set('Authorization', `Bearer ${ana.token}`).send({ texto: 'Chegámos!' });
    expect(mAna.status, JSON.stringify(mAna.body)).toBe(201);
    const memId = mAna.body.dados?.id ?? mAna.body.id;

    // Rui não pode editar nem apagar a memória da Ana
    expect((await request(app).put(`/api/memories/${memId}`).set('Authorization', `Bearer ${rui.token}`).send({ texto: 'x' })).status).toBe(403);
    expect((await request(app).delete(`/api/memories/${memId}`).set('Authorization', `Bearer ${rui.token}`)).status).toBe(403);
    // Ana pode
    expect((await request(app).put(`/api/memories/${memId}`).set('Authorization', `Bearer ${ana.token}`).send({ texto: 'Editado' })).status).toBe(200);
    expect((await request(app).delete(`/api/memories/${memId}`).set('Authorization', `Bearer ${ana.token}`)).status).toBe(200);

    // Perfil: sem token -> 401; editar o perfil de outro -> 403; o próprio -> 200
    expect((await request(app).put(`/api/auth/${ana.id}`).send({ nome: 'Nome Alterado' })).status).toBe(401);
    expect((await request(app).put(`/api/auth/${ana.id}`).set('Authorization', `Bearer ${rui.token}`).send({ nome: 'Nome Alterado' })).status).toBe(403);
    expect((await request(app).put(`/api/auth/${rui.id}`).set('Authorization', `Bearer ${rui.token}`).send({ nome: 'Rui Silva' })).status).toBe(200);

    // Ana apaga a sua thread
    expect((await request(app).delete(`/api/threads/${threadId}`).set('Authorization', `Bearer ${ana.token}`)).status).toBe(200);
  });

  it('upload recusa ficheiros que não são imagem/vídeo', async () => {
    const u = await criarConta('eva');
    const r = await request(app).put('/api/feed/foto-perfil').set('Authorization', `Bearer ${u.token}`)
      .attach('imagem', Buffer.from('<script>alert(1)</script>'), { filename: 'x.html', contentType: 'text/html' });
    expect(r.status).toBeGreaterThanOrEqual(400);
    const ok = await request(app).put('/api/feed/foto-perfil').set('Authorization', `Bearer ${u.token}`)
      .attach('imagem', Buffer.from([0x89, 0x50, 0x4e, 0x47]), { filename: 'f.png', contentType: 'image/png' });
    expect(ok.status, JSON.stringify(ok.body)).toBeLessThan(300);
  });
});
