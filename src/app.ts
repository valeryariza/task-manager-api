import express from 'express';
import authRoutes from './api/routes/authRoutes';
import { errorHandler } from './api/middlewares/errorHandler';
import { NotFoundError } from './errors';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

// Cualquier ruta que no exista
app.use((_req, _res, next) => {
  next(new NotFoundError('Ruta no encontrada'));
});

// Siempre al final
app.use(errorHandler);

export default app;