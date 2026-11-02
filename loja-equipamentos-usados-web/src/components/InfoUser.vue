<template>
  <header>
        <div class="voltar-container">
  <button class="voltar-btn" @click="minhacCasa">⬅ Voltar à Página Principal</button>
</div>
  </header>
  <div class="perfil">
    <h2>Perfil do Utilizador</h2>
    <div v-if="!editando">
      <p><strong>Nome:</strong> {{ user.nome }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Telefone:</strong> {{ user.telefone }}</p>
      <p><strong>NIF:</strong> {{ user.nif }}</p>
      <p><strong>NIC:</strong> {{ user.nic }}</p>
      <p><strong>Morada:</strong> {{ user.morada }}</p>
      <p><strong>Gênero:</strong> {{ user.genero }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
      <button @click="editando = true">Editar</button>
    </div>

    <div v-else>
      <label>Nome: <input v-model="user.nome" /></label><br>
      <label>Email: <input v-model="user.email" /></label><br>
      <label>Telefone: <input v-model="user.telefone" /></label><br>
      <label>NIF: <input v-model="user.nif" /></label><br>
      <label>NIC: <input v-model="user.nic" /></label><br>
      <label>Morada: <input v-model="user.morada" /></label><br>
      <label>Gênero: 
        <select v-model="user.genero">
          <option>Masculino</option>
          <option>Feminino</option>
          <option>Outro</option>
        </select>
      </label><br>
      <button @click="salvarAlteracoes">Guardar</button>
      <button @click="editando = false">Cancelar</button>
    </div>
  </div>
</template>

<script>
import { API_URL } from '@/config';
import axios from 'axios';

export default {
  data() {
    return {
      user: {
        nome: '', email: '', telefone: '', nif: '', nic: '', morada: '',
        genero: '', role: '', id: ''
      },
      editando: false
    };
  },
  async mounted() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = storedUser?.token;

    try {
      const res = await axios.get(`${API_URL}/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.user = { ...res.data, id: res.data.id };
    } catch (err) {
      console.error('Erro ao carregar perfil:', err.response?.data || err.message);
    }
  },
  methods: {
    minhacCasa() {
      this.$router.push('/home');
    },
    async salvarAlteracoes() {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = storedUser?.token;
        const res = await axios.put(
          `${API_URL}/utilizadores/${this.user.id}`,
          this.user,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.user = res.data;
        this.editando = false;
        alert('Informações atualizadas com sucesso!');
      } catch (err) {
        alert('Erro ao atualizar informações');
      }
    }
  }
};
</script>




<style scoped>
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

.perfil {
  padding: 40px;
  text-align: center;
  background-color: #f0f2f5;
  margin: 20px auto;
  max-width: 600px;
  border-radius: 10px;
}

.perfil input,
.perfil select {
  padding: 8px;
  margin: 5px;
  width: 80%;
  border: 1px solid #ccc;
  border-radius: 4px;
}

</style>
