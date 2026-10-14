import { Router } from 'express';
import { authController } from '../../controllers/authController';
import { validateBody } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);

export default router;