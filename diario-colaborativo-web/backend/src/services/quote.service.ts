import NodeCache from 'node-cache';

// Guarda a citação na memória durante 1 hora (3600 segundos)
const cache = new NodeCache({ stdTTL: 3600 }); 

export class QuoteService {
  async getRandomQuote() {
    // 1. Verifica se já temos uma citação em Cache
    const cachedQuote = cache.get('daily_quote');
    if (cachedQuote) return cachedQuote;

    // 2. Prepara o Timeout de 3 segundos (Exigência TP8)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch('https://dummyjson.com/quotes/random', {
        signal: controller.signal
      });
      clearTimeout(timeoutId); // Limpa o temporizador se o pedido for rápido
      
      if (!response.ok) throw new Error("Erro ao contactar a API de citações.");
      
      const data = await response.json();
      
      // 3. Guarda na Cache para os próximos pedidos
      cache.set('daily_quote', data);
      return data;
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error("Timeout: A API externa demorou demasiado tempo.");
      }
      throw error;
    }
  }
}