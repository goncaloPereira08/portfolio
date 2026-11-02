import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
const feedController = new FeedController();

// 1. Obter o Feed
router.get('/', authMiddleware, feedController.getFeed);

// 2. Criar Publicação/Memória
router.post('/criar', authMiddleware, upload.single('imagem'), feedController.createPost);

// 3. Atualizar Foto de Perfil
router.put('/foto-perfil', authMiddleware, upload.single('imagem'), feedController.updateProfilePic);

// 4. Interações (Gostos e Comentários)
router.post('/:id/like', authMiddleware, feedController.toggleLike);
router.post('/:id/comment', authMiddleware, feedController.addComment);

export default router;