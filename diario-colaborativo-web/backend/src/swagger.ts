export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Life Threads API',
    version: '1.0.0',
    description: 'Documentação da API para o projeto Life Threads (ASW 2025/2026)',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor Local' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    // SCHEMAS: Define a estrutura dos teus dados para consulta
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nome: { type: 'string' },
          email: { type: 'string' }
        }
      },
      Thread: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          titulo: { type: 'string' },
          descricao: { type: 'string' },
          id_criador: { type: 'integer' }
        }
      },
      Memory: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          texto: { type: 'string' },
          media_url: { type: 'string' },
          id_thread: { type: 'integer' },
          id_autor: { type: 'integer' }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    // --- AUTENTICAÇÃO E UTILIZADORES ---
    '/api/auth/register': {
      post: {
        summary: 'Regista um novo utilizador',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { 
                  nome: { type: 'string', example: 'Gonçalo' }, 
                  email: { type: 'string', example: 'goncalo@exemplo.com' }, 
                  password: { type: 'string', example: 'password123' } 
                } 
              } 
            } 
          }
        },
        responses: { '201': { description: 'Utilizador criado' } }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Faz o login de um utilizador',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { 
                  email: { type: 'string', example: 'goncalo@exemplo.com' }, 
                  password: { type: 'string', example: 'password123' } 
                } 
              } 
            } 
          }
        },
        responses: { '200': { description: 'Login com sucesso e Token gerado' } }
      }
    },
    '/api/auth/{id}': {
      get: {
        summary: 'Ver perfil completo do utilizador',
        tags: ['Utilizadores'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Dados do perfil' } }
      },
      put: {
        summary: 'Atualizar dados (Nome/Email)',
        tags: ['Utilizadores'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { nome: { type: 'string' }, email: { type: 'string' } } 
              } 
            } 
          }
        },
        responses: { '200': { description: 'Perfil atualizado' } }
      }
    },

    // --- THREADS (DIÁRIOS) ---
    '/api/threads': {
      get: { 
        summary: 'Lista todas as Threads', 
        tags: ['Threads'], 
        responses: { '200': { description: 'Lista de threads' } } 
      },
      post: {
        summary: 'Cria uma nova Thread',
        description: 'O id_criador é definido automaticamente pelo Token.',
        tags: ['Threads'],
        requestBody: {
          required: true,
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { 
                  titulo: { type: 'string', example: 'Roadtrip 2026' }, 
                  descricao: { type: 'string', example: 'Viagem de grupo com amigos' }
                } 
              } 
            } 
          }
        },
        responses: { '201': { description: 'Thread criada' } }
      }
    },
    '/api/threads/{id}': {
      put: {
        summary: 'Editar título ou descrição da Thread',
        tags: ['Threads'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { 
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { titulo: { type: 'string' }, descricao: { type: 'string' } } 
              } 
            } 
          } 
        },
        responses: { '200': { description: 'Thread atualizada' } }
      },
      delete: {
        summary: 'Apagar uma Thread',
        tags: ['Threads'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Thread apagada' } }
      }
    },
    '/api/threads/{id}/members': {
      post: {
        summary: 'Convidar um membro para a Thread',
        tags: ['Threads'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { 
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { 
                  id_utilizador: { type: 'integer' }, 
                  cargo: { type: 'string', enum: ['ADMIN', 'EDITOR', 'LEITOR'] } 
                } 
              } 
            } 
          } 
        },
        responses: { '201': { description: 'Membro adicionado' } }
      }
    },
    '/api/threads/{id}/members/{userId}': {
      delete: {
        summary: 'Remover um membro da Thread',
        tags: ['Threads'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'userId', required: true, schema: { type: 'integer' } }
        ],
        responses: { '200': { description: 'Membro removido' } }
      }
    },

    // --- MEMÓRIAS ---
    '/api/threads/{id}/memories': {
      get: {
        summary: 'Listar todas as memórias de uma Thread',
        tags: ['Memórias'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Lista de memórias' } }
      },
      post: {
        summary: 'Publicar uma nova memória',
        description: 'O id_autor é definido automaticamente pelo Token.',
        tags: ['Memórias'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { 
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { 
                  texto: { type: 'string', example: 'A jantar em Paris!' }, 
                  media_url: { type: 'string', example: 'http://img.com/foto.jpg' },
                  tags: { type: 'array', items: { type: 'string' }, example: ['viagem', 'comida'] }
                } 
              } 
            } 
          } 
        },
        responses: { '201': { description: 'Memória criada' } }
      }
    },
    '/api/memories/{id}': {
      put: {
        summary: 'Editar o texto de uma memória',
        tags: ['Memórias'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { 
          content: { 
            'application/json': { 
              schema: { type: 'object', properties: { texto: { type: 'string' } } } 
            } 
          } 
        },
        responses: { '200': { description: 'Memória editada' } }
      },
      delete: {
        summary: 'Remover uma memória',
        tags: ['Memórias'],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Memória removida' } }
      }
    },

    // --- TAGS ---
    '/api/tags': {
      get: { summary: 'Listar todas as tags', tags: ['Tags'], responses: { '200': { description: 'Sucesso' } } }
    },
    '/api/tags/{tagName}/memories': {
      get: {
        summary: 'Pesquisar memórias por Tag',
        tags: ['Tags'],
        parameters: [{ in: 'path', name: 'tagName', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Lista de memórias' } }
      }
    },

    // --- INTELIGÊNCIA ARTIFICIAL ---
    '/api/ai/summarize': {
      post: {
        summary: 'Gerar resumo narrativo (IA)',
        tags: ['Inteligência Artificial'],
        requestBody: {
          required: true,
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { memoryIds: { type: 'array', items: { type: 'integer' } } } 
              } 
            } 
          }
        },
        responses: { '200': { description: 'Resumo gerado' } }
      }
    }
  }
};