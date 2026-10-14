import { NextFunction, Request, Response } from 'express';
import { AnySchema, ErrorObject } from 'ajv';
import localize from 'ajv-i18n';
import { ValidationError } from '../../errors';
import { ajv } from '../../utils/ajv';

interface FieldError {
  campo: string;
  mensaje: string;
}

/** Convierte los errores de AJV en una lista simple de campo y mensaje. */
function formatErrors(errors: ErrorObject[] | null | undefined): FieldError[] {
  return (errors ?? []).map((error) => {
    if (error.keyword === 'required') {
      return { campo: error.params.missingProperty, mensaje: 'Es obligatorio' };
    }
    if (error.keyword === 'additionalProperties') {
      return { campo: error.params.additionalProperty, mensaje: 'Campo no permitido' };
    }
    return {
      campo: error.instancePath.replace(/^\//, '') || 'body',
      mensaje: error.message ?? 'Valor inválido',
    };
  });
}

/**
 * Crea un middleware que valida req.body contra un esquema JSON.
 * El esquema se compila una sola vez, al definir la ruta.
 */
export function validateBody(schema: AnySchema) {
  const validate = ajv.compile(schema);

  return (req: Request, _res: Response, next: NextFunction): void => {
    const body = req.body ?? {};

    if (!validate(body)) {
      localize.es(validate.errors);
      return next(new ValidationError('Datos inválidos', formatErrors(validate.errors)));
    }
    next();
  };
}