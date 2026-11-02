<template>
  <div class="gestao-utilizadores">
    <div class="voltar-container">
  <button class="voltar-btn" @click="router.push('/home')">⬅ Voltar à Página Principal</button>
</div>

    <header>
      <h1>Gestão de Utilizadores</h1>
    </header>

    <div class="tabela-container">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in utilizadores" :key="u._id">
            <td>{{ u.nome }}</td>
            <td>{{ u.email }}</td>
            <td>
              <select v-model="u.role" @change="atualizarRole(u)">
                <option value="cliente">cliente</option>
                <option value="doador">doador</option>
                <option v-if="user.role === 'admin'" value="empregado">empregado</option>
                <option v-if="user.role === 'admin'" value="admin">admin</option>
              </select>
            </td>
            <td>
              <button @click="apagarUtilizador(u._id)">🗑 Apagar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="mensagem" class="mensagem">{{ mensagem }}</div>
    </div>
  </div>
</template>

<script setup>
import { API_URL } from '@/config';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
const router = useRouter();


const utilizadores = ref([]);
const mensagem = ref('');
const token = localStorage.getItem('token');
const user = ref(null);

onMounted(async () => {
  try {
    const perfil = await axios.get(`${API_URL}/perfil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    user.value = perfil.data;

    const res = await axios.get(`${API_URL}/utilizadores`);
    utilizadores.value = res.data;
  } catch (err) {
    console.error('Erro:', err);
  }
});

async function apagarUtilizador(id) {
  try {
    await axios.delete(`${API_URL}/utilizadores/${id}`);
    utilizadores.value = utilizadores.value.filter(u => u._id !== id);
    mensagem.value = 'Utilizador apagado com sucesso.';
  } catch (err) {
    mensagem.value = 'Erro ao apagar utilizador.';
  }
}

async function atualizarRole(utilizador) {
  try {
    await axios.put(`${API_URL}/utilizadores/${utilizador._id}`, {
      role: utilizador.role,
    });
    mensagem.value = 'Role atualizada com sucesso.';
  } catch (err) {
    mensagem.value = 'Erro ao atualizar role.';
  }
}
</script>

<style scoped>
.voltar-container {
  margin: 20px 0;
  text-align: left;
}

.voltar-btn {
  padding: 10px 20px;
  background-color: lightblue;
  color: black;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.voltar-btn:hover {
  background-color: #0d6efd;
  color: white;
}


.gestao-utilizadores {
  padding: 40px;
  max-width: 1000px;
  margin: auto;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
}

header {
  background-color: #0d6efd;
  color: white;
  padding: 20px;
  text-align: center;
  border-radius: 10px 10px 0 0;
}

.tabela-container {
  margin-top: 20px;
  background: white;
  border-radius: 10px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #0d6efd;
  color: white;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

select {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  padding: 6px 10px;
  background-color: crimson;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background-color: darkred;
}

.mensagem {
  margin-top: 20px;
  padding: 10px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 5px;
}
</style>
