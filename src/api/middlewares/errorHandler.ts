import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../errors';

/**
 * Middleware central de errores. Convierte cualquier error en una respuesta JSON consistente.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { name: err.name, message: err.message, details: err.details },
    });
    return;
  }

  // JSON mal formado en el body
  if (err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed') {
    res.status(400).json({
      error: { name: 'ValidationError', message: 'El cuerpo de la petición no es un JSON válido' },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: { name: 'InternalServerError', message: 'Error interno del servidor' },
  });
}