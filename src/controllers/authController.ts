import { Request, Response } from 'express';
import { authService } from '../services/authService';

/** Controlador de los endpoints de autenticación. */
export const authController = {
  /** POST /auth/register */
  async register(req: Request, res: Response): Promise<void> {
    const { nombre, email, password } = req.body;
    const user = await authService.register(nombre, email, password);
    res.status(201).json({ user });
  },

  /** POST /auth/login */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  },
};