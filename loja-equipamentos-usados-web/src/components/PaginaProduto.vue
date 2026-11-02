<template>
  <div class="detalhes">
    <header>
      <h1>Detalhes do Produto</h1>
      <button @click="voltar">← Voltar</button>
    </header>

    <template v-if="produto">
      <div class="produto-info">

      <img :src="produto.imagem" alt="Imagem do produto" />
      <h2>{{ produto.nome }}</h2>
      <p><strong>Marca:</strong> {{ produto.marca }}</p>
      <p><strong>Modelo:</strong> {{ produto.modelo }}</p>
      <p><strong>Estado:</strong> {{ produto.estado }}</p>
      <p><strong>Preço:</strong> € {{ Number(produto.preco).toLocaleString('pt-PT', { minimumFractionDigits: 2 }) }}</p>

     <button class="comprar-btn" @click="comprarProduto">Adicionar ao Carrinho</button>
     <button class="finalizar-btn" @click="finalizarCompra">Finalizar Compra</button>

<p v-if="alertaVisivel" class="alerta-carrinho">
  Produto adicionado ao carrinho! Total: {{ carrinhoStore.equipamentos.length }} item(ns)
</p>

   <!-- conteúdo do produto -->
      </div>
    </template>

    <template v-else>
      <div class="carregando">
        <p>Carregando detalhes do produto...</p>
      </div>
    </template>

    

  </div>
</template>

  <script setup>
import { API_URL } from '@/config';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useCarrinhoStore } from '@/stores/carrinho'; // caminho pode variar

const route = useRoute();
const router = useRouter();
const produto = ref(null);

const carrinhoStore = useCarrinhoStore();
const alertaVisivel = ref(false);

function voltar() {
  router.back();
}

function comprarProduto() {
  carrinhoStore.adicionarAoCarrinho(produto.value);
  alertaVisivel.value = true;

  setTimeout(() => {
    alertaVisivel.value = false;
  }, 2000);
}

function finalizarCompra() {
  router.push('/comprar');
}


onMounted(async () => {
  try {
    const id = route.params.id;
    const res = await axios.get(`${API_URL}/equipamentos/${id}`);
    produto.value = res.data;
    console.log(produto.value.imagem)
  } catch (err) {
    console.error('Erro ao carregar produto:', err);
  }
});
</script>

  
  <style scoped>

  .finalizar-btn {
  margin-top: 12px;
  background-color: #0d6efd;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.finalizar-btn:hover {
  background-color: #084298;
}


  .alerta-carrinho {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
}

  .comprar-btn {
  margin-top: 20px;
  background-color: #198754;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.comprar-btn:hover {
  background-color: #146c43;
}

  .detalhes {
  max-width: 1000px;
  margin: 40px auto;
  padding: 30px;
  background: linear-gradient(to bottom right, #ffffff, #f0f4ff);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #0d6efd;
  padding-bottom: 10px;
}

header h1 {
  font-size: 28px;
  color: #0d6efd;
  margin: 0;
}

button {
  background-color: #0d6efd;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #084298;
}

.produto-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.produto-info img {
  max-width: 100%;
  width: 300px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-bottom: 25px;
  object-fit: cover;
}

.produto-info h2 {
  font-size: 26px;
  color: #333;
  margin-bottom: 15px;
}

p {
  font-size: 18px;
  color: #444;
  margin: 8px 0;
  line-height: 1.5;
}

strong {
  color: #222;
}

.carregando {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-top: 40px;
}

  </style>
  