declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado, agregado por el middleware de autenticación. */
      user?: { id: number; email: string };
    }
  }
}

export {};