import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/** Instancia única de AJV compartida por todos los esquemas. */
export const ajv = new Ajv({
  allErrors: true,        // reporta todos los errores, no solo el primero
  allowUnionTypes: true,  // permite tipos como ["string", "null"]
});

addFormats(ajv);
