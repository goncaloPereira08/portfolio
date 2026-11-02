import express from 'express';
import dotenv from 'dotenv';
import prisma from './prismaClient';
import userRoutes from './routes/user.routes';
import threadRoutes from './routes/thread.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import memoryRoutes from './routes/memory.routes';
import aiRoutes from './routes/ai.routes';
import cors from 'cors';  
import feedRoutes from './routes/feed.routes';
import quoteRoutes from './routes/quote.routes';

// Importações de Segurança (TP7)
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Importações dos Middlewares (TP11)
import { requestLogger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

export const app = express();

const PORT = process.env.PORT || 3000;

// Middleware base
app.use(express.json());
app.use(cors());

// --- SEGURANÇA E PREVENÇÃO DE ATAQUES (TP7) ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Oculta metadados do Express e protege Headers
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 pedidos por IP (evita DDoS)
  message: { error: "Demasiados pedidos a partir deste IP, tente novamente mais tarde." }
});
app.use(limiter);
// ----------------------------------------------

// O Logger deve estar antes das rotas
app.use(requestLogger);

// Rotas da API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', userRoutes); 
app.use('/api/threads', threadRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/feed', feedRoutes);
app.use('/api/quotes', quoteRoutes);

// Rota de teste
app.get('/api/ping', async (req, res) => {
  try {
    const usersCount = await prisma.user.count();
    res.json({ 
      mensagem: 'Pong! O servidor do Life Threads está vivo!',
      utilizadores_registados: usersCount
    });
  } catch (error) {
    console.error("Erro ao contactar a BD:", error);
    res.status(500).json({ erro: 'Erro a conectar à base de dados.' });
  }
});

// Catch-all 404: Garante que rotas inventadas devolvem JSON e não HTML
app.use((_req, _res, next) => {
  const err: any = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error Handler global (Apanha todos os erros do Zod e da API)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor a correr na porta http://localhost:${PORT}`);
  });
}