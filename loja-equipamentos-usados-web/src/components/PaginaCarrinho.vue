<template>
  <div class="carrinho-page">
    <h1>🛒 Carrinho de Compras</h1>

    <div v-if="carrinho.length === 0" class="vazio">
      <p>O carrinho está vazio.</p>
      <router-link to="/home">Voltar às compras</router-link>
    </div>

    <div v-else class="itens">
      <div
        v-for="(item, index) in carrinho"
        :key="index"
        class="item-carrinho"
      >
        <img :src="item.imagem || '/images/default.jpg'" alt="Imagem do produto" />
        <div>
          <h3>{{ item.nome }}</h3>
          <p>Preço: € {{ Number(item.preco).toFixed(2) }}</p>
          <p>Quantidade: {{ item.quantidade }}</p>
          <button @click="removerItem(index)">Remover</button>
        </div>
      </div>

      <div class="total">
        <h2>Total: € {{ totalCarrinho.toFixed(2) }}</h2>
        <button @click="finalizarCompra">Finalizar Compra</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const carrinho = ref([])
const router = useRouter()

function carregarCarrinho() {
  const dados = JSON.parse(localStorage.getItem('carrinho')) || []
  carrinho.value = dados
}

function removerItem(index) {
  carrinho.value.splice(index, 1)
  localStorage.setItem('carrinho', JSON.stringify(carrinho.value))
}

const totalCarrinho = computed(() =>
  carrinho.value.reduce((total, item) => total + item.preco * item.quantidade, 0)
)

function finalizarCompra() {
  router.push('/finalizar-compra')
}

onMounted(() => {
  carregarCarrinho()
})
</script>

<style scoped>
.carrinho-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.vazio {
  text-align: center;
  font-size: 18px;
}

.item-carrinho {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  gap: 20px;
}

.item-carrinho img {
  width: 100px;
  height: auto;
  border-radius: 5px;
}

.item-carrinho button {
  padding: 8px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.item-carrinho button:hover {
  background-color: #bb2d3b;
}

.total {
  text-align: right;
  margin-top: 30px;
}

.total button {
  padding: 10px 20px;
  background-color: #198754;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.total button:hover {
  background-color: #157347;
}
</style>
