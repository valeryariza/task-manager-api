import { Router } from 'express';
import { taskController } from '../../controllers/taskController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validate';
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchemas';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Lista las tareas del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Tasks]
 *     summary: Crea una tarea para el usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/TaskInput'
 *               - required: [titulo]
 *     responses:
 *       201:
 *         description: Tarea creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', taskController.getAll);
router.post('/', validateBody(createTaskSchema), taskController.create);

/**
 * @openapi
 * /tasks/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *   get:
 *     tags: [Tasks]
 *     summary: Obtiene una tarea del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Tasks]
 *     summary: Modifica una tarea del usuario autenticado
 *     description: Solo se actualizan los campos enviados. Se requiere al menos uno.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Tasks]
 *     summary: Elimina una tarea del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Tarea eliminada
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', taskController.getById);
router.put('/:id', validateBody(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.delete);

export default router;