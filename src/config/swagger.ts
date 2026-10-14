import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './index';

// En Windows path.join usa "\" y los patrones glob necesitan "/".
const routesGlob = path
  .join(__dirname, '../api/routes/*.{ts,js}')
  .replace(/\\/g, '/');

/** Especificación OpenAPI generada a partir de los comentarios @openapi de las rutas. */
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'API RESTful para registrar usuarios y gestionar sus tareas personales.',
    },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Valery' },
            email: { type: 'string', format: 'email', example: 'valery@test.com' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            titulo: { type: 'string', example: 'Terminar prueba técnica' },
            descripcion: { type: 'string', nullable: true, example: 'API de tareas' },
            fecha_vencimiento: { type: 'string', format: 'date', nullable: true, example: '2026-10-16' },
            estado: { type: 'string', enum: ['pendiente', 'en curso', 'completada'] },
            user_id: { type: 'integer', example: 1 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        TaskInput: {
          type: 'object',
          properties: {
            titulo: { type: 'string', minLength: 1, maxLength: 200, example: 'Terminar prueba técnica' },
            descripcion: { type: 'string', nullable: true, maxLength: 2000 },
            fecha_vencimiento: { type: 'string', format: 'date', nullable: true, example: '2026-10-16' },
            estado: { type: 'string', enum: ['pendiente', 'en curso', 'completada'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'ValidationError' },
                message: { type: 'string', example: 'Datos inválidos' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      campo: { type: 'string', example: 'email' },
                      mensaje: { type: 'string', example: 'debe coincidir con el formato "email"' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        ValidationError: {
          description: 'Datos de entrada inválidos',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Unauthorized: {
          description: 'Token ausente, inválido o expirado',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'La tarea no existe o pertenece a otro usuario',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
  },
  apis: [routesGlob],
});