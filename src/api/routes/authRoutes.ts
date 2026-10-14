import { Router } from 'express';
import { authController } from '../../controllers/authController';
import { validateBody } from '../middlewares/validate';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra un usuario nuevo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Valery
 *               email:
 *                 type: string
 *                 format: email
 *                 example: valery@test.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 72
 *                 example: miClave123
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateBody(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Inicia sesión y devuelve un JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: valery@test.com
 *               password:
 *                 type: string
 *                 example: miClave123
 *     responses:
 *       200:
 *         description: Credenciales correctas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/login', validateBody(loginSchema), authController.login);

export default router;