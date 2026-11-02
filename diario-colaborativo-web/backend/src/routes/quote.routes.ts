import { Router } from 'express';
import { QuoteController } from '../controllers/quote.controller';

const router = Router();
const quoteController = new QuoteController();

// Esta rota vai ser PÚBLICA (sem authMiddleware) porque é usada na página de Login
router.get('/random', quoteController.getRandom);

export default router;