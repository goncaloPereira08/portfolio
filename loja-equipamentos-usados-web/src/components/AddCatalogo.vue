<template>
  <div>
    <header>
      <h1>FromU2Me</h1>
      <nav>
        <ul>
          <li><router-link to="/home">Início</router-link></li>
          <li><a href="#produtos">Produtos</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
      </nav>
    </header>

    <section class="banner">
      <!-- Formulário de Categoria -->
      <div>
        <h2>{{ editandoCategoriaId ? 'Editar Categoria' : 'Adicionar Categoria' }}</h2>
        <form @submit.prevent="adicionarCategoria">
          <input type="text" v-model="novaCategoria.nome" placeholder="Nome da categoria" required />
          <textarea v-model="novaCategoria.descricao" placeholder="Descrição da categoria"></textarea>
          <button type="submit">Salvar</button>
        </form>
      </div>

      <!-- Lista de Categorias -->
      <div>
        <h3>Categorias Existentes</h3>
        <ul>
          <li v-for="categoria in categorias" :key="categoria._id">
            {{ categoria.nome }} - {{ categoria.descricao }}
            <button @click="editarCategoria(categoria)">Editar</button>
            <button @click="apagarCategoria(categoria._id)">Apagar</button>
          </li>
        </ul>
      </div>

      <!-- Formulário de Tipo -->
      <div style="margin-top: 30px;">
        <h2>{{ editandoTipoId ? 'Editar Tipo' : 'Adicionar Tipo' }}</h2>
        <form @submit.prevent="adicionarTipo">
          <input type="text" v-model="novoTipo.nome" placeholder="Nome do tipo" required />
          <textarea v-model="novoTipo.descricao" placeholder="Descrição do tipo"></textarea>
          <button type="submit">Salvar</button>
        </form>
      </div>

      <!-- Lista de Tipos -->
      <div>
        <h3>Tipos Existentes</h3>
        <ul>
          <li v-for="tipo in tipos" :key="tipo._id">
            {{ tipo.nome }} - {{ tipo.descricao }}
            <button @click="editarTipo(tipo)">Editar</button>
            <button @click="apagarTipo(tipo._id)">Apagar</button>
          </li>
        </ul>
      </div>
    </section>

    <div v-if="mensagem" :class="['mensagem', tipoMensagem]">
      {{ mensagem }}
  
    </div>

    <section id="contato" class="contato">
      <h2>Entre em contato</h2>
      <p>Email: contato@fromu2me.com</p>
      <p>Telefone: (11) 99999-9999</p>
    </section>

    <footer>
      <p>&copy; 2025 Loja Tech - Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

  
<script>
import { API_URL } from '@/config';
export default {
  data() {
    return {
      novaCategoria: { nome: '', descricao: '' },
      novoTipo: { nome: '', descricao: '' },
      categorias: [],
      tipos: [],
      editandoCategoriaId: null,
      editandoTipoId: null,
      mensagem: '',
      tipoMensagem: ''
    };
  },
  mounted() {
    this.carregarCategorias();
    this.carregarTipos();
  },
  methods: {
    async carregarCategorias() {
      const res = await fetch(`${API_URL}/categorias`);
      this.categorias = await res.json();
    },

    async carregarTipos() {
      const res = await fetch(`${API_URL}/tipos`);
      this.tipos = await res.json();
    },

    async adicionarCategoria() {
      const url = this.editandoCategoriaId
        ? `${API_URL}/categorias/${this.editandoCategoriaId}`
        : `${API_URL}/categorias`;

      const method = this.editandoCategoriaId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.novaCategoria)
        });

        const body = await res.json();
        if (!res.ok) throw new Error(body.message || res.statusText);

        this.mensagem = this.editandoCategoriaId
          ? 'Categoria atualizada com sucesso!'
          : 'Categoria adicionada com sucesso!';
        this.tipoMensagem = 'sucesso';

        this.novaCategoria = { nome: '', descricao: '' };
        this.editandoCategoriaId = null;
        this.carregarCategorias();
      } catch (err) {
        this.mensagem = err.message;
        this.tipoMensagem = 'erro';
      }
    },

    editarCategoria(categoria) {
      this.novaCategoria = { ...categoria };
      this.editandoCategoriaId = categoria._id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async apagarCategoria(id) {
      if (confirm('Deseja realmente apagar esta categoria?')) {
        try {
          const res = await fetch(`${API_URL}/categorias/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Erro ao apagar categoria');
          this.mensagem = 'Categoria apagada com sucesso!';
          this.tipoMensagem = 'sucesso';
          this.carregarCategorias();
        } catch (err) {
          this.mensagem = err.message;
          this.tipoMensagem = 'erro';
        }
      }
    },

    async adicionarTipo() {
      const url = this.editandoTipoId
        ? `${API_URL}/tipos/${this.editandoTipoId}`
        : `${API_URL}/tipos`;

      const method = this.editandoTipoId ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.novoTipo)
        });

        const body = await res.json();
        if (!res.ok) throw new Error(body.message || res.statusText);

        this.mensagem = this.editandoTipoId
          ? 'Tipo atualizado com sucesso!'
          : 'Tipo adicionado com sucesso!';
        this.tipoMensagem = 'sucesso';

        this.novoTipo = { nome: '', descricao: '' };
        this.editandoTipoId = null;
        this.carregarTipos();
      } catch (err) {
        this.mensagem = err.message;
        this.tipoMensagem = 'erro';
      }
    },

    editarTipo(tipo) {
      this.novoTipo = { ...tipo };
      this.editandoTipoId = tipo._id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async apagarTipo(id) {
      if (confirm('Deseja realmente apagar este tipo?')) {
        try {
          const res = await fetch(`${API_URL}/tipos/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Erro ao apagar tipo');
          this.mensagem = 'Tipo apagado com sucesso!';
          this.tipoMensagem = 'sucesso';
          this.carregarTipos();
        } catch (err) {
          this.mensagem = err.message;
          this.tipoMensagem = 'erro';
        }
      }
    }
  }
};
</script>

  
  

<style scoped>
/* Header */
header {
  background: #0d6efd;
  padding: 20px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 0 0 10px 10px;
  margin-bottom: 30px;
}

h1 {
  margin: 10;
  font-weight: 700;
  font-size: 1.8rem;
  color: #ffffff;
}

/* Botão "Criar Conta" fora da barra central */
.top-create-btn {
  position: absolute;
  top: auto;
  right: 20px;
  background-color: white;
  color: #0d6efd;
  border: 2px solid white;
  padding: 8px 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  width: auto !important;
}

.top-create-btn:hover {
  background-color: #0d6efd;
  color: white;
  border-color: #ffffff;
}

/* Barra central de navegação */
nav.nav-container {
  max-width: max-content;
  margin: 0 auto 40px auto;
  background: #0d6efd;
  border: 2px solid white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  box-sizing: border-box;
}

ul.nav-center {
  list-style: none;
  display: flex;
  gap: auto;
  margin: 0;
  padding: 0;
  flex-grow: 1;
  justify-content: center;
}

ul.nav-center li a {
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  padding: 10px 15px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

ul.nav-center li a:hover {
  background-color: #084298;
  cursor: pointer;
}





.nav-right {
  margin-left: auto;
}

.nav-right button {
  background-color: white;
  color: #0d6efd;
  border: 3px solid #0d6efd;
  padding: 12px 25px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-right button:hover {
  background-color: #0d6efd;
  color: white;
  border-color: white;
}
/* Banner */
.banner {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(to right, #0d6efd, #6610f2);
  color: #fff;
}

/* Botão de registo extra no banner */
.botao-registar {
  margin-top: 20px;
}

.botao-registar button {
  background-color: white;
  color: #0d6efd;
  border: 3px solid white;
  padding: 12px 25px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.botao-registar button:hover {
  background-color: #0d6efd;
  color: white;
  border-color: white;
}

/* Produtos */
.produtos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.produto {
  background: #fff;
  padding: 15px;
  text-align: center;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.produto img {
  max-width: 100%;
  border-radius: 5px;
}

/* Contato */
.contato {
  text-align: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
}

/* Footer */
footer {
  background: #0d6efd;
  color: white;
  text-align: center;
  padding: 20px;
  font-size: 14px;
  margin-top: 40px;
  border-radius: 10px 10px 0 0;
}

/* Responsividade */
@media (max-width: 600px) {
  nav.nav-container {
    flex-direction: column;
    gap: 10px;
  }

  ul.nav-center {
    justify-content: center;
  }

  .nav-right {
    margin-left: 0;
  }

  .nav-right button {
    width: 100%;
  }
}
.mensagem {
  margin: 20px auto;
  padding: 15px;
  width: fit-content;
  border-radius: 5px;
  font-weight: bold;
  text-align: center;
  max-width: 400px;
}

.mensagem.sucesso {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.mensagem.erro {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

</style>
