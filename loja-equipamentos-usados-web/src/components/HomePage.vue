<template>
  <div>
    <header>

      <h1>FromU2Me</h1>
      <nav>
        <ul>
          <li><router-link to="/home">Início</router-link></li>
          <li><a href="#produtos">Produtos</a></li>
          <li><a href="#contato">Contato</a></li>
          
          <button type="button" id="regisbtn" 
          v-if="user && (user.role === 'admin' || user.role === 'empregado' )"
          @click="goToRegistro">Gerir equipamentos</button>
          
          <button type="button" id="catalogbtn"
           v-if="user && (user.role === 'admin' || user.role === 'empregado' )"
          @click="goToAddCatalog">ADDCatalogo</button>

          <button type="button" id="infobtn"  
         
          @click="router.push('/infoUtilizador')">Info do utilizador</button>
          
          <button type="button" id="infobtn" 
          v-if="user && (user.role === 'admin' )"
          @click="router.push('/criarLoja') ">Criar Loja</button>
          
          
          <button
            type="button"
            id="chrbtn"
            v-if="user && (user.role === 'admin' || user.role === 'empregado')"
            @click="router.push('/changerole')"
          >
            Alterar a Role
          </button>



        </ul>
        
      </nav>


     <button @click="finalizarCompra()" id="carrinhoBtn">
  🛒 Carrinho ({{ carrinhoCount }})
</button>





    </header>

    <section class="banner">
      <h2>Os melhores equipamentos eletrônicos para você!</h2>
      <p>Confira nossas ofertas e garanta já o seu.</p>
    </section>


     <section id="produtos" class="produtos">
        <router-link
        class="produto"
        v-for="equipamento in equipamentos"
        :key="equipamento._id"
        :to="`/produto/${equipamento._id}`"
      >
        <img :src="equipamento.imagem ? equipamento.imagem : '/images/default.jpg'" alt="Imagem do equipamento">
        <h3>{{ equipamento.nome }}</h3>
        <p>{{ equipamento.modelo }} - {{ equipamento.marca }}</p>
            <p v-if="getQuantidade(equipamento._id) > 0">
      Já no carrinho: {{ getQuantidade(equipamento._id) }}x
    </p>

        <span>Euros {{ Number(equipamento.preco).toLocaleString('pt-Pt', { minimumFractionDigits: 2 }) }}</span>
      </router-link>

    </section>

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

<script setup>
import { API_URL } from '@/config';

import { ref, onMounted,  computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useCarrinhoStore } from '@/stores/carrinho';


// Store e router
const carrinhoStore = useCarrinhoStore();


// Computed: lista e total
const carrinho = computed(() => carrinhoStore.equipamentos);

const router = useRouter();
const equipamentos = ref([]);
const token = localStorage.getItem('token');
const user = ref(null);
const carrinhoCount = computed(() =>
  carrinho.value.reduce((total, item) => total + (item.quantidade || 1), 0)
);





function finalizarCompra() {
  router.push('/comprar');
}

function getQuantidade(id) {
  const item = carrinho.value.find(p => p._id === id);
  return item ? item.quantidade : 0;
}


onMounted(async () => {

  try {
    const res = await axios.get(`${API_URL}/equipamentos`);
    equipamentos.value = res.data;


    const resUser = await axios.get(`${API_URL}/perfil`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
  });

  console.log('Usuário carregado:', user.value);

   user.value = resUser.data;

  } catch (err) {
    console.error('Erro ao buscar equipamentos:', err);
  }
});

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



 #carrinhoBtn, #checkoutBtn {
  padding: 10px 20px;
  background-color: #198754;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px;
}

#carrinhoBtn:hover, #checkoutBtn:hover {
  background-color: #157347;
}

  header {
    background: #0d6efd;
    color: #fff;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
</style>