import app from './app';
import { config } from './config';
import { testConnection } from './persistence/db';

async function start(): Promise<void> {
  try {
    await testConnection();
    console.log('Conectado a PostgreSQL');

    app.listen(config.port, () => {
      console.log(`Servidor en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

start();