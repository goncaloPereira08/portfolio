import { Router } from 'express';
import { ThreadController } from '../controllers/thread.controller';
import { createThreadSchema } from '../schemas/thread.schema';
import { validate } from '../schemas/validate';
import { MemoryController } from '../controllers/memory.controller';
import { createMemorySchema } from '../schemas/memory.schema';
import { addMemberSchema, removeMemberSchema } from '../schemas/thread.schema';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const threadController = new ThreadController();
const memoryController = new MemoryController();

router.get('/:id/memories', memoryController.getByThread);
router.get('/', authMiddleware, threadController.getAll);

router.post('/', authMiddleware, validate(createThreadSchema), threadController.create);
router.post('/:id/memories', authMiddleware, validate(createMemorySchema), memoryController.create);
router.post('/:id/members', authMiddleware, validate(addMemberSchema), threadController.addMember);
router.get('/:id', authMiddleware, threadController.getById);

router.put('/:id', authMiddleware, threadController.update);
router.delete('/:id', authMiddleware, threadController.delete);
router.delete('/:id/members/:userId', authMiddleware, validate(removeMemberSchema), threadController.removeMember);

export default router;