import { Router } from 'express';
import { taskController } from '../../controllers/taskController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validate';
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchemas';

const router = Router();

router.use(authenticate);

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', validateBody(createTaskSchema), taskController.create);
router.put('/:id', validateBody(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.delete);

export default router;