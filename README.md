# Task Manager API

API RESTful para que los usuarios se registren, inicien sesión y administren sus propias tareas. Construida con **Node.js, Express 5, TypeScript y PostgreSQL**.

## Características

- Registro e inicio de sesión con contraseñas hasheadas (bcrypt) y autenticación con JWT.
- CRUD de tareas: cada usuario solo puede ver y modificar sus propias tareas.
- Validación de entradas con JSON Schema (AJV) y mensajes de error en español.
- Manejo de errores centralizado con clases de error personalizadas.
- Documentación interactiva con Swagger en `/docs`.

## Arquitectura

El proyecto está organizado en capas, cada una con una responsabilidad:

```
src/
├── api/
│   ├── middlewares/   # autenticación, validación y manejo de errores
│   ├── routes/        # definición de endpoints y documentación Swagger
│   └── schemas/       # esquemas JSON para validar el body
├── controllers/       # reciben la petición y devuelven la respuesta
├── services/          # lógica de negocio
├── persistence/       # acceso a PostgreSQL (consultas SQL)
├── config/            # variables de entorno (Singleton) y Swagger
├── errors/            # clases de error personalizadas
├── types/             # extensiones de tipos de Express
├── utils/             # funciones auxiliares
├── app.ts             # configuración de Express
└── server.ts          # punto de entrada
database/
└── schema.sql         # creación de tablas
```

Flujo de una petición:

```
Ruta → authenticate → validateBody → Controller → Service → Persistence → PostgreSQL
                                                                   ↓
                         errorHandler ← (cualquier error lanzado en el camino)
```

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior

## Instalación local

1. Clonar el repositorio e instalar dependencias:

```bash
   git clone https://github.com/valeryariza/task-manager-api.git
   cd task-manager-api
   npm install
```

2. Crear la base de datos y las tablas:

```bash
   psql -U postgres -c "CREATE DATABASE task_manager;"
   psql -U postgres -d task_manager -f database/schema.sql
```

3. Configurar las variables de entorno (ver la sección siguiente).

4. Iniciar el servidor en modo desarrollo:

```bash
   npm run dev
```

## Configuración del archivo `.env`

Copiar el archivo de ejemplo y completar los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `8000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | |
| `DB_NAME` | Nombre de la base de datos | `task_manager` |
| `JWT_SECRET` | Clave para firmar los tokens | cadena larga y aleatoria |
| `JWT_EXPIRES_IN` | Duración del token | `1h` |

Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Si falta alguna variable obligatoria, la aplicación se detiene al arrancar con un mensaje que indica cuál.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor en desarrollo con recarga automática |
| `npm run build` | Compila TypeScript a JavaScript en `dist/` |
| `npm start` | Ejecuta la versión compilada |

## Endpoints

| Método | Ruta | Autenticación | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | No | Registrar usuario |
| `POST` | `/auth/login` | No | Iniciar sesión y obtener el JWT |
| `GET` | `/tasks` | Sí | Listar las tareas del usuario |
| `POST` | `/tasks` | Sí | Crear una tarea |
| `GET` | `/tasks/:id` | Sí | Consultar una tarea propia |
| `PUT` | `/tasks/:id` | Sí | Modificar una tarea propia |
| `DELETE` | `/tasks/:id` | Sí | Eliminar una tarea propia |

Las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

## Documentación

Con el servidor corriendo:

- **Swagger UI:** `http://localhost:8000/docs`
- **Especificación OpenAPI (JSON):** `http://localhost:8000/docs.json`

Para probar endpoints protegidos en Swagger: hacer login, copiar el token, hacer clic en **Authorize** y pegarlo.

## Formato de errores

Todas las respuestas de error tienen la misma estructura:

```json
{
  "error": {
    "name": "ValidationError",
    "message": "Datos inválidos",
    "details": [{ "campo": "email", "mensaje": "debe coincidir con el formato \"email\"" }]
  }
}
```

| Código | Error | Cuándo ocurre |
|---|---|---|
| 400 | `ValidationError` | Body inválido, id inválido o JSON mal formado |
| 401 | `AuthenticationError` | Token ausente, inválido o expirado; credenciales incorrectas |
| 404 | `NotFoundError` | La ruta o la tarea no existe, o la tarea pertenece a otro usuario |
| 409 | `ConflictError` | El email ya está registrado |
| 500 | `InternalServerError` | Error inesperado (el detalle solo se registra en el servidor) |

## Decisiones de seguridad

- Las contraseñas se guardan con hash bcrypt y nunca se devuelven en las respuestas.
- Todas las consultas de tareas filtran por el `user_id` del token, nunca por datos que envíe el cliente.
- Si una tarea pertenece a otro usuario se responde 404 y no 403, para no revelar que existe.
- El login responde el mismo mensaje si el email no existe o si la contraseña es incorrecta.
- Todas las consultas SQL son parametrizadas para evitar inyección SQL.
- Los esquemas rechazan campos no esperados (por ejemplo, un `user_id` enviado en el body).

## Bitácora de desarrollo

El proceso de desarrollo, los retos encontrados y el uso de asistentes de IA están documentados en [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md).
