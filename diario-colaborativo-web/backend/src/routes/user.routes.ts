// No teu src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../schemas/validate';
import { authMiddleware } from '../middlewares/auth.middleware';
import { registerUserSchema, loginSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();
const userController = new UserController();

router.post('/register', validate(registerUserSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.get('/:id', userController.getProfile);

router.put('/:id', authMiddleware, validate(updateUserSchema), userController.update);

export default router;