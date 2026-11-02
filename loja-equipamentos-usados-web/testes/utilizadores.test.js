// Testes da gestão de utilizadores (registo, login, roles e permissões) sem MongoDB.
// Executar: node --test testes/
process.env.JWT_SECRET = 'segredo-de-teste';
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const express = require('express');
const { criarModelo } = require('./fakeModel');

// Substitui o modelo real (Mongoose) pelo modelo em memória
const modeloPath = require.resolve(path.join(__dirname, '../models/Utilizador.js'));
const Utilizador = criarModelo();
require.cache[modeloPath] = { id: modeloPath, filename: modeloPath, loaded: true, exports: Utilizador };

const app = express();
app.use(express.json());
app.use('/api', require('../routes/utilizadorRoutes'));

let base, server;
test.before(() => new Promise(ok => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}/api`; ok(); }); }));
test.after(() => server.close());

const req = (m, url, body, token) => fetch(base + url, { method: m, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
const dados = (nome, extra = {}) => ({ nome, email: `${nome}@t.pt`, senha: 'Pass123!', nif: nome + 'nif', nic: nome + 'nic', morada: 'Lisboa', genero: 'Outro', ...extra });
async function login(nome) { const r = await req('POST', '/login', { username: nome, password: 'Pass123!' }); assert.strictEqual(r.status, 200); return (await r.json()).token; }

test('registo ignora roles privilegiadas e não devolve a password', async () => {
  const r = await req('POST', '/criar', dados('mal', { role: 'admin' }));
  assert.strictEqual(r.status, 201);
  const b = await r.json();
  assert.strictEqual(b.utilizador.role, 'cliente');
  assert.ok(!('senha' in b.utilizador));
  assert.notStrictEqual(Utilizador._docs().find(d => d.nome === 'mal').senha, 'Pass123!'); // guardada com hash
});

test('login com password errada ou utilizador inexistente dá a mesma resposta', async () => {
  const a = await req('POST', '/login', { username: 'mal', password: 'errada' });
  const b = await req('POST', '/login', { username: 'naoexiste', password: 'x' });
  assert.strictEqual(a.status, 401); assert.strictEqual(b.status, 401);
  assert.deepStrictEqual(await a.json(), await b.json());
});

test('listar utilizadores exige gestor e nunca expõe passwords', async () => {
  await req('POST', '/criar', dados('chefe'));
  Utilizador._docs().find(d => d.nome === 'chefe').role = 'admin';
  assert.strictEqual((await req('GET', '/utilizadores')).status, 401);
  const tCliente = await login('mal');
  assert.strictEqual((await req('GET', '/utilizadores', null, tCliente)).status, 403);
  const tAdmin = await login('chefe');
  const r = await req('GET', '/utilizadores', null, tAdmin);
  assert.strictEqual(r.status, 200);
  for (const u of await r.json()) assert.ok(!('senha' in u));
});

test('cliente não se promove nem edita outros; admin altera roles', async () => {
  const tCliente = await login('mal');
  const eu = Utilizador._docs().find(d => d.nome === 'mal');
  const chefe = Utilizador._docs().find(d => d.nome === 'chefe');
  assert.strictEqual((await req('PUT', `/utilizadores/${eu._id}`, { role: 'admin' }, tCliente)).status, 403);
  assert.strictEqual((await req('PUT', `/utilizadores/${chefe._id}`, { nome: 'x' }, tCliente)).status, 403);
  const proprio = await req('PUT', `/utilizadores/${eu._id}`, { morada: 'Porto' }, tCliente);
  assert.strictEqual(proprio.status, 200);
  assert.strictEqual((await proprio.json()).morada, 'Porto');
  const tAdmin = await login('chefe');
  const promo = await req('PUT', `/utilizadores/${eu._id}`, { role: 'empregado' }, tAdmin);
  assert.strictEqual(promo.status, 200);
  assert.strictEqual((await promo.json()).role, 'empregado');
});

test('empregado não pode criar admins; só gestores apagam contas', async () => {
  const tEmp = await login('mal'); // agora é empregado (token novo traz a role atualizada)
  await req('POST', '/criar', dados('zé'));
  const ze = Utilizador._docs().find(d => d.nome === 'zé');
  assert.strictEqual((await req('PUT', `/utilizadores/${ze._id}`, { role: 'admin' }, tEmp)).status, 403);
  assert.strictEqual((await req('PUT', `/utilizadores/${ze._id}`, { role: 'doador' }, tEmp)).status, 200);
  const tZe = await login('zé');
  assert.strictEqual((await req('DELETE', `/utilizadores/${ze._id}`, null, tZe)).status, 403);
  assert.strictEqual((await req('DELETE', `/utilizadores/${ze._id}`, null, tEmp)).status, 200);
});
