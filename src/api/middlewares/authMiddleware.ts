import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AuthenticationError } from '../../errors';

/**
 * Protege rutas: exige un header "Authorization: Bearer <token>" válido
 * y agrega el usuario autenticado en req.user.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AuthenticationError('Token no proporcionado'));
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    req.user = { id: Number(payload.sub), email: payload.email as string };
    next();
  } catch {
    next(new AuthenticationError('Token inválido o expirado'));
  }
}