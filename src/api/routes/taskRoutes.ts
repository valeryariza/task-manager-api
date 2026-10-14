import { Router } from 'express';
import { taskController } from '../../controllers/taskController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas de tareas requieren autenticación
router.use(authenticate);

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.delete);

export default router;