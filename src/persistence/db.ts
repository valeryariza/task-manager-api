import { Pool, types } from 'pg';
import { config } from '../config';

// Las columnas DATE se devuelven como texto 'YYYY-MM-DD'.
// Por defecto pg las convierte a Date con zona horaria y la fecha puede correrse un día.
types.setTypeParser(1082, (value: string) => value);


/** Pool de conexiones a PostgreSQL compartido por toda la aplicación. */
export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

/** Verifica que la base de datos responda. */
export async function testConnection(): Promise<void> {
  await pool.query('SELECT 1');
}