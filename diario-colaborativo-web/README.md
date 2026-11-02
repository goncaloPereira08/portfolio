# Diário Colaborativo (Life Threads)

> Projeto de grupo (4 elementos) · Aplicações e Serviços na Web · LTI, FCUL · 2025/2026
>
> **Stack:** TypeScript · Node.js/Express 5 · Prisma + PostgreSQL · React + Vite · Socket.IO · Google Gemini · Docker · Vitest/Supertest

Este repositório contém a versão final e completa (Full-Stack) do projeto Life Threads, desenvolvido para a unidade curricular de Aplicações e Serviços na Web (2025/2026).

A plataforma atua como um diário digital colaborativo, permitindo aos utilizadores o registo de memórias, a criação de threads partilhadas (com atualizações em tempo real), e a organização de conteúdos através de inteligência artificial. Nesta fase final, o projeto foi totalmente orquestrado em contentores e reforçado com testes automáticos, sistemas de segurança e monitorização contínua.

## Requisitos Prévios

Graças à adoção de contentorização, não necessita de instalar bases de dados localmente. Certifique-se apenas de que tem instalado:

- Docker e Docker Desktop (em execução).

- Node.js (apenas necessário caso queira executar os testes automáticos fora do Docker).

## Instruções de Instalação e Execução

O projeto está configurado para inicializar toda a infraestrutura de forma automática (Backend, Frontend e Base de Dados). Siga estes passos na raiz do projeto:

0. Configurar segredos:
- Copiar `.env.example` para `.env` (na raiz) e preencher `JWT_SECRET` e `GEMINI_API_KEY`.

1. Iniciar a Aplicação:
- No diretório raiz (onde se encontra o ficheiro docker-compose.yml), execute o comando:
- docker-compose up -d --build

2. O que o Docker fará automaticamente:
   Inicia o servidor PostgreSQL.
   Aplica as migrações da base de dados via Prisma.
   Executa o Script de Seed, criando imediatamente utilizadores de teste.
   Inicia o Backend seguro na porta 3000 e o Frontend na porta 5173.

3. Para desligar a aplicação:
   No mesmo diretório, corra:
   docker-compose down


## Utilização e Credenciais de Teste:
Com os contentores a correr, a aplicação estará disponível nos seguintes endereços:

Frontend (Interface Web): http://localhost:5173

Backend (Documentação Swagger): http://localhost:3000/api-docs

## Credenciais Pré-Geradas:
Para facilitar a avaliação no Frontend ou na API, utilize as seguintes contas já criadas automaticamente:

Email: professor@lifethreads.pt | Password: SenhaForte123!

Email: aluno@lifethreads.pt | Password: SenhaForte123!

## Testes Automáticos

O projeto possui uma extensa suite de testes (Vitest + Supertest) que validam a lógica, a segurança (HTTP 401), os limites de validação (HTTP 400 pelo Zod) e a interface. Para executar os testes:

- No Backend:
cd backend
npm install
npm run test

- No Frontend:
cd frontend
npm install
npm run test

## Estrutura do Projeto

Nesta Fase 4, a estrutura foi expandida para suportar a arquitetura completa:

/backend/src/controllers e /services: Lógica de negócio da API.

/backend/src/middlewares: Segurança, Limite de Pedidos (Rate Limit) e Tratamento Global de Erros (errorHandler).

/backend/src/tests: Suites de testes automáticos.

/backend/logs: Ficheiros de monotorização (Winston) que registam toda a atividade (combined.log, error.log).

/backend/prisma/seed.ts: Script de injeção automática de dados.

/frontend/src: Componentes React/Vite, incluindo lógica de Polling no feed.

docker-compose.yml e Dockerfiles: Orquestração do sistema.
