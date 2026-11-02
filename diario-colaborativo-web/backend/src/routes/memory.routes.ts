import { Router } from 'express';
import { MemoryController } from '../controllers/memory.controller';
import { validate } from '../schemas/validate';
import { deleteMemorySchema } from '../schemas/memory.schema';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const memoryController = new MemoryController();

// Apenas as rotas COM o authMiddleware (Protegidas)
router.delete('/:id', authMiddleware, validate(deleteMemorySchema), memoryController.delete);
router.put('/:id', authMiddleware, memoryController.update);

export default router;