import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const aiController = new AIController();

router.post('/summarize', authMiddleware, aiController.summarize);

export default router;