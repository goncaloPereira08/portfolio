# Loja Online de Equipamentos Usados

> Projeto de grupo · Projeto de Tecnologias de Redes / Projeto de Tecnologias de Informação · LTI, FCUL · 2024/2025
>
> **Stack:** Node.js · Express 5 · MongoDB/Mongoose · Vue 3 · Vue Router · Pinia · JWT · bcrypt · Helmet · Multer

Aplicação web onde as lojas registam equipamentos usados (com estado, preço, categoria e imagem) para os clientes comprarem. O modelo de dados também prevê doações a entidades sem fins lucrativos e a projetos beneficentes. Inclui:
- registo e autenticação com JWT; passwords guardadas com bcrypt
- perfis com várias roles (`cliente`, `doador`, `organizador`, `empregado`, `admin`) e uma página de gestão de utilizadores para admins e empregados
- catálogo com pesquisa, página de produto, carrinho (Pinia + `localStorage`) e registo de transações
- gestão de lojas, catálogos, categorias e tipos de equipamento
- upload de imagens com Multer

A aplicação foi instalada numa máquina virtual na cloud durante o projeto.

## Executar
```bash
cp .env.example .env      # preencher MONGO_URI e os segredos
npm install
node server.js            # API em http://localhost:3000/api
npm run serve             # frontend Vue em http://localhost:8080
```

## Estrutura
```
server.js              # API Express
routes/ controllers/   # endpoints REST
models/                # esquemas Mongoose
middlewares/           # autenticação JWT
src/                   # frontend Vue 3 (components/, router/, stores/)
```

## Revisão para o portefólio
- **Gestão de utilizadores:** `GET/PUT/DELETE /api/utilizadores` não exigiam autenticação e devolviam as hashes das passwords e dados pessoais (NIF, NIC). Agora exigem um token válido e a role `admin` ou `empregado`, e nunca devolvem a password. Um utilizador pode editar o próprio perfil.
- **Escalada de privilégios:** era possível criar uma conta já como `admin` enviando `role` no registo, ou promover-se através do `PUT`. No registo só são aceites roles sem privilégios. Só gestores podem alterar roles, e só um admin pode atribuir `admin` ou `empregado`.
- **Login:** a resposta já não revela se o nome de utilizador existe.
- **Configuração:** o IP do servidor usado na entrega estava escrito diretamente em todo o frontend. Passou a vir de `VUE_APP_API_URL`, e as origens CORS de `CORS_ORIGINS`.
- **Catálogos:** as rotas `/api/catalogos` existiam mas não estavam montadas no servidor, por isso o formulário de registo de equipamentos não carregava os catálogos.
- O servidor deixa de arrancar sem `JWT_SECRET`. Foi removido código morto (ligação SQLite não utilizada).
