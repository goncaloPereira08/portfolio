import prisma from '../prismaClient';
import { CreateMemoryBody } from '../schemas/memory.schema';

export class MemoryService {
  
  async createMemory(threadId: number, userId: number, dados: CreateMemoryBody) {
    const isMember = await prisma.threadMember.findFirst({
      where: {
        id_thread: threadId,
        id_utilizador: userId
      }
    });

    if (!isMember) {
      throw new Error("Acesso negado: Não tens permissão para publicar nesta Thread.");
    }

    return await prisma.memory.create({
      data: {
        texto: dados.texto || "", // Corrige o erro "string | undefined"
        anexo_url: dados.media_url || null, // Atualizado para o novo nome na BD
        id_thread: threadId,
        id_autor: userId,
      },
      include: {
        autor: { select: { nome: true } }
      }
    });
  }

  async deleteMemory(memoryId: number) {
    const memory = await prisma.memory.findUnique({
      where: { id: memoryId }
    });

    if (!memory) {
      throw new Error("Memória não encontrada.");
    }

    // Limpeza de segurança: Apagar Likes e Comentários antes de apagar a memória
    await prisma.like.deleteMany({ where: { id_memory: memoryId } });
    await prisma.comentario.deleteMany({ where: { id_memory: memoryId } });

    // Agora sim, apagar a memória em segurança
    return await prisma.memory.delete({
      where: { id: memoryId }
    });
  }

  async updateMemory(id: number, texto: string) {
    const exists = await prisma.memory.findUnique({ where: { id } });
    if (!exists) throw new Error("Memória não encontrada.");

    return await prisma.memory.update({
      where: { id },
      data: { texto }
    });
  }

  async getMemoriesByThread(threadId: number) {
    return await prisma.memory.findMany({
      where: { id_thread: threadId },
      include: {
        autor: { select: { nome: true } }
      },
      orderBy: { criado_em: 'desc' } 
    });
  }
}