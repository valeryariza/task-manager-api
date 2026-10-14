import express from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './api/routes/authRoutes';
import taskRoutes from './api/routes/taskRoutes';
import { errorHandler } from './api/middlewares/errorHandler';
import { swaggerSpec } from './config/swagger';
import { NotFoundError } from './errors';

// Recursos de Swagger UI desde CDN: en Vercel los archivos de node_modules no se sirven.
const SWAGGER_CDN = 'https://unpkg.com/swagger-ui-dist@5';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: `${SWAGGER_CDN}/swagger-ui.css`,
    customJs: [
      `${SWAGGER_CDN}/swagger-ui-bundle.js`,
      `${SWAGGER_CDN}/swagger-ui-standalone-preset.js`,
    ],
  }),
);
app.get('/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// Cualquier ruta que no exista
app.use((_req, _res, next) => {
  next(new NotFoundError('Ruta no encontrada'));
});

// Siempre al final
app.use(errorHandler);

export default app;