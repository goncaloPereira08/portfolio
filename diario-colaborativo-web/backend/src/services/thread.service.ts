import prisma from '../prismaClient';
import { AddMemberInput } from '../schemas/thread.schema';

interface CreateThreadData {
  titulo: string;
  descricao?: string;
  id_criador: number;
}

export class ThreadService {
  
  async createThread(data: CreateThreadData) {
    // 1. Verificar se o criador existe (Segurança) 
    const userExists = await prisma.user.findUnique({
      where: { id: data.id_criador }
    });

    if (!userExists) {
      throw new Error("Utilizador (Criador) não encontrado.");
    }

    const newThread = await prisma.thread.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        id_criador: data.id_criador,
        membros: {
          create: {
            id_utilizador: data.id_criador,
            cargo: "ADMIN" 
          }
        }
      },
      include: {
        membros: true
      }
    });

    return newThread;
  }

  async getAllThreads(userId: number) {
    return await prisma.thread.findMany({
      where: {
        membros: {
          some: { id_utilizador: userId }
        }
      },
      include: {
        criador: { select: { nome: true } },
        _count: { select: { membros: true, memories: true } }
      },
      orderBy: { criado_em: 'desc' }
    });
  }

  async addMember(threadId: number, data: AddMemberInput) {
    const userExists = await prisma.user.findUnique({ where: { id: data.id_utilizador } });
    if (!userExists) throw new Error("Utilizador não encontrado.");

    const alreadyMember = await prisma.threadMember.findUnique({
      where: { id_thread_id_utilizador: { id_thread: threadId, id_utilizador: data.id_utilizador } }
    });
    if (alreadyMember) throw new Error("Este utilizador já faz parte desta Thread.");

    return await prisma.threadMember.create({
      data: {
        id_thread: threadId,
        id_utilizador: data.id_utilizador,
        cargo: data.cargo
      },
      include: { utilizador: { select: { nome: true, email: true } } }
    });
  }

  async updateThread(id: number, data: { titulo?: string; descricao?: string }) {
    return await prisma.thread.update({
      where: { id },
      data: data
    });
  }

  async deleteThread(id: number) {
    // 1. Obter IDs de todas as memórias desta thread
    const memorias = await prisma.memory.findMany({ where: { id_thread: id } });
    const memoriaIds = memorias.map(m => m.id);

    // 2. Apagar Likes e Comentários associados a estas memórias (se existirem)
    if (memoriaIds.length > 0) {
      await prisma.like.deleteMany({ where: { id_memory: { in: memoriaIds } } });
      await prisma.comentario.deleteMany({ where: { id_memory: { in: memoriaIds } } });
    }

    // 3. Apagar as próprias memórias da Thread
    await prisma.memory.deleteMany({ where: { id_thread: id } });

    // 4. Remover todos os membros associados à Thread
    await prisma.threadMember.deleteMany({ where: { id_thread: id } });

    // 5. Finalmente, com a "casa limpa", apagar a Thread!
    return await prisma.thread.delete({ where: { id } });
  }

  async removeMember(threadId: number, userId: number) {
    const member = await prisma.threadMember.findUnique({
      where: {
        id_thread_id_utilizador: { id_thread: threadId, id_utilizador: userId }
      }
    });

    if (!member) throw new Error("Este utilizador não é membro desta Thread.");

    return await prisma.threadMember.delete({
      where: {
        id_thread_id_utilizador: { id_thread: threadId, id_utilizador: userId }
      }
    });
  }

  async getThreadById(id: number) {
    return await prisma.thread.findUnique({
      where: { id }
    });
  }
}