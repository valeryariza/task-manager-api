import { pool } from './db';

export interface User {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

/** Usuario sin la contraseña, seguro para devolver al cliente. */
export type PublicUser = Omit<User, 'password_hash'>;

/** Acceso a datos de la tabla users. */
export const userRepository = {
  /** Busca un usuario por email. Devuelve null si no existe. */
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ?? null;
  },

  /** Crea un usuario y lo devuelve sin el hash de la contraseña. */
  async create(nombre: string, email: string, passwordHash: string): Promise<PublicUser> {
    const result = await pool.query<PublicUser>(
      `INSERT INTO users (nombre, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email, created_at`,
      [nombre, email, passwordHash],
    );
    return result.rows[0];
  },
};