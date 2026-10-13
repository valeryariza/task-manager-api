/**
 * Error base de la aplicación. Todos los errores controlados heredan de esta clase.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** Datos de entrada inválidos (400). */
export class ValidationError extends AppError {
  constructor(message = 'Datos inválidos', details?: unknown) {
    super(400, message, details);
  }
}

/** No autenticado o credenciales incorrectas (401). */
export class AuthenticationError extends AppError {
  constructor(message = 'No autenticado') {
    super(401, message);
  }
}

/** Recurso no encontrado (404). */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
  }
}

/** Conflicto con el estado actual, ej. email ya registrado (409). */
export class ConflictError extends AppError {
  constructor(message = 'Conflicto') {
    super(409, message);
  }
}