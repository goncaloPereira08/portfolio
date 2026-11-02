import { Request, Response, NextFunction} from 'express';
import { MemoryService } from '../services/memory.service';
import { CreateMemoryBody } from '../schemas/memory.schema';
import prisma from '../prismaClient';
import fs from 'fs';
import path from 'path';

const memoryService = new MemoryService();

export class MemoryController {
  
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const threadId = Number(req.params.id);
      const userId = (req as any).user.id;
      const ficheiro = req.file;

      const dados = {
        texto: req.body.texto,
        media_url: ficheiro ? `/uploads/${ficheiro.filename}` : req.body.media_url 
      };

      const novaMemoria = await memoryService.createMemory(threadId, userId, dados);

      res.status(201).json(novaMemoria);
    } catch (error: any) {
      // LIMPEZA DO MULTER
      if (req.file) {
        try {
          // Apaga o ficheiro físico que foi guardado pelo Multer antes do erro
          fs.unlinkSync(path.join(process.cwd(), req.file.path));
        } catch (unlinkError) {
          console.error("Erro ao apagar ficheiro lixo:", unlinkError);
        }
      }

      
      // Passa o erro original para o errorHandler tratar
      next(error); 
    }
  }

  delete = async (req: Request, res: Response) => {
    try {
      const memoryId = Number(req.params.id);
      const userId = (req as any).user.id;
      const memoria = await prisma.memory.findUnique({ where: { id: memoryId } });
      if (memoria && memoria.id_autor !== userId) {
        return res.status(403).json({ erro: "Acesso negado: Apenas o autor pode apagar esta memória." });
      }
      await memoryService.deleteMemory(memoryId);
      
      res.status(200).json({ 
        mensagem: "Memória removida com sucesso!" 
      });
    } catch (error: any) {
      res.status(404).json({ erro: error.message });
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const memoryId = Number(req.params.id);
      const userId = (req as any).user.id;
      const memoria = await prisma.memory.findUnique({ where: { id: memoryId } });
      if (memoria && memoria.id_autor !== userId) {
        return res.status(403).json({ erro: "Acesso negado: Apenas o autor pode editar esta memória." });
      }
      const memory = await memoryService.updateMemory(memoryId, req.body.texto);
      res.json({ mensagem: "Memória editada!", dados: memory });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  getByThread = async (req: Request, res: Response) => {
    try {
      const threadId = Number(req.params.id);
      const memories = await memoryService.getMemoriesByThread(threadId);
      
      res.status(200).json({ dados: memories });
    } catch (error: any) {
      res.status(500).json({ erro: "Erro ao buscar memórias desta thread." });
    }
  };
}