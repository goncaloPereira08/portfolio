import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { AIService } from '../services/ai.service'; // Importamos o novo serviço

const aiService = new AIService();

export class AIController {
  summarize = async (req: Request, res: Response): Promise<void> => {
    try {
      const { threadId } = req.body; 
      const userId = (req as any).user.id;

      if (!threadId) {
        res.status(400).json({ erro: "É necessário fornecer o ID da Thread." });
        return;
      }

      // Procura as memórias
      const memories = await prisma.memory.findMany({
        where: {
          id_thread: Number(threadId),
          thread: { membros: { some: { id_utilizador: userId } } }
        },
        select: { texto: true, anexo_url: true, tipo_anexo: true },
        orderBy: { criado_em: 'asc' } 
      });

      if (memories.length === 0) {
        res.status(404).json({ erro: "Não foram encontradas memórias nesta thread para resumir." });
        return;
      }

      // Chama o serviço para fazer o trabalho do Gemini
      const resumo = await aiService.generateSummary(memories);
      
      // Devolve a resposta ao frontend
      res.json({ resumo });

    } catch (error) {
      console.error("Erro na IA:", error);
      res.status(500).json({ erro: "Erro ao gerar resumo. Verifica a tua API Key no .env" });
    }
  };
}