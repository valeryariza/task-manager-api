import { Request } from 'express';
import { AuthenticationError, ValidationError } from '../errors';

/** Obtiene el id del usuario autenticado. */
export function getUserId(req: Request): number {
  if (!req.user) {
    throw new AuthenticationError();
  }
  return req.user.id;
}

/**
 * Convierte el parámetro :id en un entero positivo.
 * @throws ValidationError si no es un entero positivo.
 */
export function parseId(value: unknown): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new ValidationError('El id debe ser un número entero positivo');
  }
  const id = Number(value);
  if (id <= 0) {
    throw new ValidationError('El id debe ser un número entero positivo');
  }
  return id;
}