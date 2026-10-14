/** Esquema para POST /auth/register */
export const registerSchema = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100, pattern: '\\S' },
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string', minLength: 8, maxLength: 72 },
  },
  required: ['nombre', 'email', 'password'],
  additionalProperties: false,
} as const;

/** Esquema para POST /auth/login */
export const loginSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 1 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
} as const;