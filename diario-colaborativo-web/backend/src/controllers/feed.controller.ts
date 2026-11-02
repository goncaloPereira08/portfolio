import { Request, Response } from 'express';
import prisma from '../prismaClient';

export class FeedController {
  
  // 1. Obter o Feed (AGORA FILTRADO PELO TEU UTILIZADOR)
  getFeed = async (req: Request, res: Response): Promise<void> => {
    try {
      const reqAny = req as any;
      const userId = reqAny.user.id; // Vai buscar quem tu és ao token

      const posts = await prisma.memory.findMany({
        where: {
          // 🚨 A MAGIA ESTÁ AQUI: Mostra se fores o autor OU se fores membro da Thread
          OR: [
            { id_autor: userId },
            { 
              thread: { 
                membros: { some: { id_utilizador: userId } } 
              } 
            }
          ]
        },
        orderBy: { criado_em: 'desc' },
        include: {
          autor: { select: { id: true, nome: true, foto_perfil: true } },
          likes: true,
          comentarios: { 
            include: { user: { select: { nome: true, foto_perfil: true } } },
            orderBy: { criado_em: 'asc' }
          }
        }
      });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao carregar o feed" });
    }
  };

  // 2. Criar Post com Imagem/Vídeo
  createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { texto, id_thread } = req.body;
      const reqAny = req as any; 
      const userId = reqAny.user.id;
      const file = reqAny.file; 

      let threadIdAlvo = Number(id_thread);
      if (!threadIdAlvo) {
        const userThread = await prisma.threadMember.findFirst({ where: { id_utilizador: userId }});
        if (!userThread) { 
          res.status(400).json({ erro: "Precisas de criar uma Thread primeiro!" }); 
          return; 
        }
        threadIdAlvo = userThread.id_thread;
      }

      const anexo_url = file ? `/uploads/${file.filename}` : null;
      const tipo_anexo = file ? (file.mimetype.startsWith('video') ? 'video' : 'imagem') : null;

      const novaMemoria = await prisma.memory.create({
        data: { 
          texto: texto || "", 
          anexo_url, 
          tipo_anexo, 
          id_autor: userId, 
          id_thread: threadIdAlvo 
        },
        include: { autor: { select: { nome: true, foto_perfil: true } }, likes: true, comentarios: true }
      });

      res.status(201).json(novaMemoria);
    } catch (error) {
      console.error("Erro no createPost:", error);
      res.status(500).json({ erro: "Erro ao publicar no feed." });
    }
  };

  // 3. Dar ou Tirar Gosto
  toggleLike = async (req: Request, res: Response): Promise<void> => {
    try {
      const memoryId = Number(req.params.id);
      const userId = (req as any).user.id;

      const likeExiste = await prisma.like.findUnique({
        where: { id_user_id_memory: { id_user: userId, id_memory: memoryId } }
      });

      if (likeExiste) {
        await prisma.like.delete({ where: { id: likeExiste.id } });
        res.json({ liked: false });
      } else {
        await prisma.like.create({ data: { id_user: userId, id_memory: memoryId } });
        res.json({ liked: true });
      }
    } catch (error) {
      res.status(500).json({ erro: "Erro ao processar gosto" });
    }
  };

  // 4. Comentar
  addComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const memoryId = Number(req.params.id);
      const userId = (req as any).user.id;
      const { texto } = req.body;

      const comentario = await prisma.comentario.create({
        data: { texto, id_user: userId, id_memory: memoryId },
        include: { user: { select: { nome: true, foto_perfil: true } } }
      });
      res.status(201).json(comentario);
    } catch (error) {
      res.status(500).json({ erro: "Erro ao comentar" });
    }
  };

  // 5. Atualizar Foto de Perfil
  updateProfilePic = async (req: Request, res: Response): Promise<void> => {
    try {
      const reqAny = req as any;
      const userId = reqAny.user.id;
      const file = reqAny.file;
      
      if (!file) { 
        res.status(400).json({ erro: "Nenhuma imagem enviada." }); 
        return; 
      }

      const path = `/uploads/${file.filename}`;

      await prisma.user.update({
        where: { id: userId },
        data: { foto_perfil: path } 
      });

      res.json({ 
        mensagem: "Foto de perfil atualizada!", 
        foto: path 
      });
    } catch (error) {
      res.status(500).json({ erro: "Erro ao atualizar foto." });
    }
  };
}