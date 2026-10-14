import dotenv from 'dotenv';
import type { PoolConfig } from 'pg';

dotenv.config();

/**
 * Lee una variable de entorno obligatoria.
 * @throws Error si la variable no está definida.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }
  return value;
}

/**
 * Configuración de la aplicación (patrón Singleton).
 * Carga las variables de entorno una sola vez y las expone tipadas.
 */
class Config {
  private static instance: Config;

  public readonly port: number;
  public readonly db: PoolConfig;
  public readonly jwt: {
    secret: string;
    expiresIn: string;
  };

  private constructor() {
    this.port = Number(process.env.PORT ?? 3000);

    // En producción (Neon) se usa una sola URL de conexión;
    // en local, las variables separadas.
    const databaseUrl = process.env.DATABASE_URL;
    this.db = databaseUrl
      ? { connectionString: databaseUrl }
      : {
          host: required('DB_HOST'),
          port: Number(required('DB_PORT')),
          user: required('DB_USER'),
          password: required('DB_PASSWORD'),
          database: required('DB_NAME'),
        };

    this.jwt = {
      secret: required('JWT_SECRET'),
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    };
  }

  /** Devuelve la única instancia de la configuración. */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}

export const config = Config.getInstance();