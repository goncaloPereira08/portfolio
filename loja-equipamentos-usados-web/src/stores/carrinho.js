import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCarrinhoStore = defineStore('carrinho', () => {
  const equipamentos = ref([]);

  function adicionarAoCarrinho(equipamento) {
    equipamentos.value.push(equipamento);
  }

  function contar() {
    return equipamentos.value.length;
  }

  function limparCarrinho() {
    equipamentos.value = [];
    localStorage.removeItem('carrinho');
  }


  return {
    equipamentos,
    adicionarAoCarrinho,
    contar,
    limparCarrinho
  };
});
