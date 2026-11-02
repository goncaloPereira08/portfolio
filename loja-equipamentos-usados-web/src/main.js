import { API_URL } from './config';
import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/HomePage.vue';
import LoginPage from './components/LoginPage.vue';
import RegisEquipamento from './components/RegistrarEquipamento.vue';
import Inicio from './components/PaginaInicio.vue';
import CriarConta from './components/CriarConta.vue';
import ADDCatalogo from './components/AddCatalogo.vue';
import InfoUser from './components/InfoUser.vue';
import PaginaProduto from './components/PaginaProduto.vue';
import Loja from './components/CriarLoja.vue';
import Change from './components/ChangeRole.vue';
import Compra from './components/CompraProduto.vue';
import Carrinho from './components/PaginaCarrinho.vue'
import { createPinia } from 'pinia';






import axios from 'axios';
// Configuração das rotas
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginPage },  // Rota para a página de login
    { path: '/home', component: HomePage },  // Rota para a página inicial
    { path: '/registroEquipamento', component: RegisEquipamento },

    { path: '/', component: Inicio },
    { path: '/criar_conta', component: CriarConta },
    { path: '/addToCatalog', component: ADDCatalogo },
    { path: '/infoUtilizador', component: InfoUser },

    { path: '/produto/:id', name: 'DetalhesProduto', component: PaginaProduto},
     { path: '/criarLoja', component: Loja },
      { path: '/changerole', component: Change },
    { path: '/comprar', component: Compra },
     { path: '/carrinho', component: Carrinho },
     

    
  ],
});

axios.defaults.baseURL = `${API_URL}`;

// Adiciona o token automaticamente em cada requisição
axios.interceptors.request.use(config => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const token = storedUser?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Criando a instância do Vue
const app = createApp(App);
app.use(router); // Registrando o Vue Router
app.mount('#app'); // Montando o app

const pinia = createPinia();
app.use(pinia);



