import { Request, Response } from 'express';
import { ThreadService } from '../services/thread.service';
import prisma from '../prismaClient';

const threadService = new ThreadService();

export class ThreadController {
  
  async create(req: Request, res: Response) {
    const { titulo, descricao } = req.body;
    const userId = (req as any).user.id; // ID do utilizador vindo do Token

    try {
      const novaThread = await prisma.thread.create({
        data: {
          titulo,
          descricao,
          id_criador: userId,
          // Criamos também o criador como o primeiro membro da thread
          membros: {
            create: { id_utilizador: userId, cargo: 'ADMIN' }
          }
        }
      });
      res.status(201).json(novaThread);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao criar a thread" });
    }
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const threadId = Number(req.params.id);
      
      const thread = await prisma.thread.findUnique({
        where: { id: threadId },
        include: { 
          memories: {
            orderBy: { criado_em: 'desc' }
          },
          //Vai buscar os membros também!
          membros: {
            include: {
              utilizador: { select: { id: true, nome: true, email: true, foto_perfil: true } }
            }
          }
        }
      });

      if (!thread) {
        res.status(404).json({ erro: "Thread não encontrada" });
        return;
      }
      res.json(thread);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao carregar a thread" });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id; // Extrai o ID do Token
      const threads = await threadService.getAllThreads(userId); // Passa o ID aqui
      res.status(200).json(threads);
    } catch (error: any) {
      res.status(500).json({ erro: "Erro ao buscar threads" });
    }
  }

  addMember = async (req: Request, res: Response) => {
    try {
        const threadId = Number(req.params.id);
        const requesterId = (req as any).user.id; 

        const thread = await threadService.getThreadById(threadId);

        if (!thread) {
          return res.status(404).json({ erro: "Thread não encontrada." });
        }

        if (thread.id_criador !== requesterId) {
          return res.status(403).json({ 
            erro: "Acesso negado: Apenas o administrador da Thread pode convidar novos membros." 
          });
        }

        const member = await threadService.addMember(threadId, req.body);

        res.status(201).json({ 
          mensagem: "Membro adicionado com sucesso!", 
          dados: member 
        });
    } catch (error: any) {
        res.status(400).json({ erro: error.message });
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const threadId = Number(req.params.id);
      const userId = (req as any).user.id;
      const existente = await threadService.getThreadById(threadId);
      if (!existente) {
        return res.status(404).json({ erro: "Thread não encontrada." });
      }
      if (existente.id_criador !== userId) {
        return res.status(403).json({ erro: "Acesso negado: Apenas o criador da Thread pode editá-la." });
      }
      // Só os campos editáveis são passados ao serviço (evita alterar id_criador, etc.)
      const { titulo, descricao } = req.body;
      const thread = await threadService.updateThread(threadId, { titulo, descricao });
      res.json({ mensagem: "Thread atualizada!", dados: thread });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  delete = async (req: Request, res: Response) => {
    try {
      const threadId = Number(req.params.id);
      const userId = (req as any).user.id;

      const thread = await threadService.getThreadById(threadId);

      if (!thread) {
        return res.status(404).json({ erro: "Thread não encontrada." });
      }

      if (thread.id_criador !== userId) {
        return res.status(403).json({ 
          erro: "Acesso negado: Apenas o criador da Thread pode apagá-la." 
        });
      }

      await threadService.deleteThread(threadId);
      res.status(200).json({ mensagem: "Thread eliminada com sucesso!" });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  };

  removeMember = async (req: Request, res: Response) => {
    try {
      const threadId = Number(req.params.id);
      const memberIdToRemove = Number(req.params.userId);
      const requesterId = (req as any).user.id; // Quem está a clicar no botão

      const thread = await threadService.getThreadById(threadId);

      if (!thread) return res.status(404).json({ erro: "Thread não encontrada." });

      // Pode remover se for o ADMIN OU se for o próprio utilizador a querer sair
      const isAdmin = thread.id_criador === requesterId;
      const isSelfLeaving = requesterId === memberIdToRemove;

      if (!isAdmin && !isSelfLeaving) {
        return res.status(403).json({ erro: "Não tens permissão para remover este membro." });
      }

      // Bloquear o Admin de sair da sua própria thread (ele deve apagá-la em vez disso)
      if (isAdmin && isSelfLeaving) {
        return res.status(400).json({ erro: "O Admin não pode sair da Thread. Deves apagá-la ou transferir o cargo." });
      }

      await threadService.removeMember(threadId, memberIdToRemove);
      res.status(200).json({ mensagem: isSelfLeaving ? "Saíste da thread." : "Membro removido!" });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  };
}