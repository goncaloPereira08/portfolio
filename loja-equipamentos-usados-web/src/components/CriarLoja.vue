<template>
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

  <div class="form-container">
    <h2>Criar Nova Loja</h2>
    <form @submit.prevent="criarLoja">
      <div class="form-group">
        <label for="nome">Nome da Loja</label>
        <input type="text" v-model="loja.nome" id="nome" required />
      </div>

      <div class="form-group">
        <label for="endereco">Endereço</label>
        <input type="text" v-model="loja.endereco" id="endereco" required />
      </div>

      <div class="form-group">
        <label for="telemovel">Telemóvel</label>
        <input type="text" v-model="loja.telemovel" id="telemovel" required />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" v-model="loja.email" id="email" required />
      </div>

      <button type="submit">{{ editandoId ? 'Atualizar Loja' : 'Criar Loja' }}</button>
    </form>

    <div v-if="mensagem" class="mensagem">{{ mensagem }}</div>


    <!-- Lista de lojas -->
    <div class="lojas-lista">
      <h2>Minhas Lojas</h2>
      <ul>
        <li v-for="loja in lojas" :key="loja._id">
          {{ loja.nome }} - {{ loja.email }}
          <button @click="editarLoja(loja)">Editar</button>
          <button @click="apagarLoja(loja._id)">Apagar</button>
        </li>
      </ul>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      loja: {
        nome: '',
        endereco: '',
        telemovel: '',
        email: '',
      },
      lojas: [],
      mensagem: '',
      editandoId: null,
      pesquisa: '',
    };
  },
  computed: {
    resultadoPesquisa() {
      const termo = this.pesquisa.toLowerCase();
      return this.lojas.filter(loja =>
        loja.nome.toLowerCase().includes(termo) || loja.email.toLowerCase().includes(termo)
      );
    }
  },
  mounted() {
    this.carregarLojas();
  },
  methods: {
    async carregarLojas() {
      const res = await axios.get('/lojas');
      this.lojas = res.data;
    },

    async criarLoja() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const responsavel_id = user?._id;

        if (this.editandoId) {
          await axios.put(`/lojas/${this.editandoId}`, this.loja);
          this.mensagem = 'Loja atualizada com sucesso!';
        } else {
          await axios.post('/lojas', { ...this.loja, responsavel_id });
          this.mensagem = 'Loja criada com sucesso!';
        }

        this.loja = { nome: '', endereco: '', telemovel: '', email: '' };
        this.editandoId = null;
        this.carregarLojas();
      } catch (error) {
        console.error(error);
        this.mensagem = 'Erro ao salvar loja.';
      }
    },

    editarLoja(loja) {
      this.loja = { ...loja };
      this.editandoId = loja._id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async apagarLoja(id) {
      if (confirm('Tem certeza que deseja apagar esta loja?')) {
        try {
          await axios.delete(`/lojas/${id}`);
          this.mensagem = 'Loja apagada com sucesso!';
          this.carregarLojas();
        } catch (error) {
          console.error(error);
          this.mensagem = 'Erro ao apagar loja.';
        }
      }
    }
  }
};
</script>


<style scoped>

.pesquisa-container {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
}

.pesquisa-container input {
  padding: 0.5rem;
  width: 100%;
  margin-bottom: 1rem;
}



  header {
    background: #0d6efd;
    color: #fff;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  #regisbtn {
    padding: 10px 20px;
    background-color: lightblue;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  #regisbtn:hover {
    background-color: #0d6efd;
    color: white;
  }

  nav ul {
    list-style: none;
    padding: 0;
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  nav ul li a {
    color: #fff;
    text-decoration: none;
    font-weight: bold;
  }

  .banner {
    text-align: center;
    padding: 60px 20px;
    background: linear-gradient(to right, #0d6efd, #6610f2);
    color: #fff;
  }

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

  .contato {
    text-align: center;
    padding: 40px 20px;
    background-color: #f8f9fa;
  }

  footer {
    background: #0d6efd;
    color: #fff;
    text-align: center;
    padding: 20px;
    margin-top: 40px;
    font-size: 14px;
  } 
.form-container {
  max-width: 500px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #0d6efd;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input[type="text"], input[type="email"] {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  width: 100%;
  background-color: #0d6efd;
  color: white;
  border: none;
  padding: 12px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0b5ed7;
}

.mensagem {
  margin-top: 15px;
  text-align: center;
  font-weight: bold;
}
</style>
