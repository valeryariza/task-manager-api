const ESTADOS = ['pendiente', 'en curso', 'completada'];

const taskProperties = {
  titulo: { type: 'string', minLength: 1, maxLength: 200, pattern: '\\S' },
  descripcion: { type: ['string', 'null'], maxLength: 2000 },
  fecha_vencimiento: { type: ['string', 'null'], format: 'date' },
  estado: { type: 'string', enum: ESTADOS },
} as const;

/** Esquema para POST /tasks */
export const createTaskSchema = {
  type: 'object',
  properties: taskProperties,
  required: ['titulo'],
  additionalProperties: false,
} as const;

/** Esquema para PUT /tasks/:id (al menos un campo) */
export const updateTaskSchema = {
  type: 'object',
  properties: taskProperties,
  minProperties: 1,
  additionalProperties: false,
} as const;