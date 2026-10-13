import dotenv from 'dotenv';

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
  public readonly db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  public readonly jwt: {
    secret: string;
    expiresIn: string;
  };

  private constructor() {
    this.port = Number(process.env.PORT ?? 8000);
    this.db = {
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