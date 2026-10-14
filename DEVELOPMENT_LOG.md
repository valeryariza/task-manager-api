# Bitácora de desarrollo

## Resumen del proceso

Desarrollé la API en aproximadamente 3 horas de trabajo, el 13 de octubre de 2026. Organicé el trabajo en seis bloques y no pasaba al siguiente hasta que el anterior funcionara y estuviera subido a GitHub:

1. Configuración base: TypeScript, Express, PostgreSQL y configuración con patrón Singleton.
2. Autenticación: registro, login con JWT y middleware de protección de rutas.
3. CRUD de tareas restringido al usuario dueño.
4. Validación de entradas con AJV.
5. Documentación con Swagger y JSDoc.
6. README y esta bitácora.

Para probar usé `curl` desde la terminal durante los bloques 1 a 4, y Swagger UI desde el bloque 5. Al terminar cada bloque hice commits separados siguiendo Conventional Commits.

---

## Uso de asistentes de IA

**Herramienta utilizada:** Claude (Anthropic), en formato de conversación.

**Forma de trabajo:** le compartí el PDF de la prueba y le pedí un plan para terminarla en menos de 30 horas. El asistente propuso dividirla en seis bloques. Después le pedí cada bloque por separado. Por cada bloque copié el código en mi proyecto, lo ejecuté, lo probé y, cuando algo fallaba, le compartía la captura del error para analizar la causa antes de corregirlo.

La IA generó la mayor parte del código base. Mi trabajo fue integrarlo en el proyecto, entender cada parte, probarla con casos válidos e inválidos y corregir los problemas que aparecieron en mi entorno (Windows, PostgreSQL 18, Express 5).

### 1. Configuración inicial y conexión a la base de datos

**Prompts utilizados:**
> *(Adjuntando el PDF)* "tengo una entrevista y me mandaron a hacer eso, que opinas"
>
> "quiero hacer todo en menos de 30 horas"
>
> "si, bloque 1"

**Qué se aceptó y por qué:**
- **Estructura de carpetas en capas** (`api`, `controllers`, `services`, `persistence`, `config`, `errors`, `utils`), porque es la que pide la prueba y separa responsabilidades: cada capa solo habla con la siguiente.
- **Clase `Config` con patrón Singleton.** El constructor es privado, así que la única forma de obtener la configuración es `getInstance()`, que la crea la primera vez y después devuelve siempre la misma instancia. Las variables de entorno se leen una sola vez.
- **Función `required()`**, que detiene la aplicación al arrancar si falta una variable de entorno. Prefiero que falle de inmediato con un mensaje claro a que falle más tarde con un error confuso.
- **Pool de conexiones de `pg`**, que reutiliza conexiones en vez de abrir una nueva en cada petición.
- **Esquema SQL con restricciones en la base de datos:** `CHECK` para los estados válidos, `UNIQUE` en el email, `ON DELETE CASCADE` para borrar las tareas de un usuario eliminado, y un índice en `user_id` porque todas las consultas de tareas filtran por esa columna.
- **Separar `app.ts` de `server.ts`**, para poder importar la aplicación en pruebas sin levantar el servidor.
- **`strict: true` en `tsconfig.json`**, que más adelante me ayudó a detectar un error en el código generado (ver bloque 3).

**Qué se rechazó o modificó:**
- El asistente propuso el puerto `3000`; yo usé `8000` en mi `.env`. El código lee el puerto desde la configuración, así que no hubo que cambiar nada más.

**Verificación realizada:**
- El endpoint `/health` respondió `{"status":"ok"}`.
- El servidor mostró "Conectado a PostgreSQL" al arrancar.
- Ejecuté `schema.sql` y confirmé que se crearon las tablas `users` y `tasks` y el índice.
- Antes del primer commit revisé con `git status` que el `.env` y `node_modules` no se subieran.

### 2. Autenticación (registro, login y JWT)

**Prompt utilizado:** este bloque lo generó el asistente como siguiente paso del plan, después de confirmar con capturas que el bloque 1 funcionaba y estaba subido a GitHub.

**Qué se aceptó y por qué:**
- **`bcryptjs` en lugar de `bcrypt`.** Está escrito en JavaScript puro y no necesita compilar código nativo en Windows. Ofrece la misma seguridad; solo es un poco más lento, lo cual no importa en este proyecto.
- **Mismo mensaje de error ("Credenciales inválidas")** si el email no existe o si la contraseña es incorrecta, para que nadie pueda averiguar qué emails están registrados.
- **Normalizar el email** a minúsculas y sin espacios, para que `Valery@x.com` y `valery@x.com` no sean dos cuentas distintas.
- **Consultas SQL parametrizadas** (`$1`, `$2`) para evitar inyección SQL.
- **El JWT solo lleva el id y el email.** El token se puede decodificar (está firmado, no cifrado), así que no debe llevar datos sensibles.
- **`algorithms: ['HS256']` al verificar el token**, para que solo se acepte el algoritmo esperado.
- **Clases de error personalizadas** (`AppError` y sus derivadas) y un **middleware central de errores**. Los errores inesperados se registran en la consola, pero al cliente solo le llega un mensaje genérico, sin detalles internos.
- **Manejo del código `23505`** de PostgreSQL, que cubre el caso de dos registros simultáneos con el mismo email que pasen la primera verificación.

**Qué se rechazó o modificó:**
- En este bloque no rechacé código. Lo que hice fue verificar con cuidado cada caso, porque es la parte más sensible de la aplicación.

**Verificación realizada:**
- Registro de un usuario nuevo: respuesta 201, sin la contraseña en la respuesta.
- Registro con el mismo email: 409 "El email ya está registrado".
- Login correcto: devuelve un token.
- Login con contraseña incorrecta: 401 "Credenciales inválidas".
- Revisé en pgAdmin que la columna password_hash guarda un hash bcrypt y no la contraseña en texto plano.

### 3. CRUD de tareas

**Prompt utilizado:**
> "bloque 3 ahora"

**Qué se aceptó y por qué:**
- **Todas las consultas filtran por `user_id`**, y ese id sale siempre del token, nunca del body ni de la URL. Así un usuario no puede ver ni modificar tareas ajenas aunque adivine el id.
- **Si la tarea es de otro usuario, se responde 404 y no 403.** Un 403 confirmaría que la tarea existe; con 404 no se revela esa información. Además, la existencia y el dueño se validan en una sola consulta.
- **El `UPDATE` solo modifica los campos enviados.** Los nombres de columna salen de una lista fija (`UPDATABLE_FIELDS`) y los valores van como parámetros, así que el SQL dinámico sigue siendo seguro.
- **El controlador toma del body solo los campos permitidos**, de modo que un `user_id` enviado por el cliente no tiene efecto.
- **`DELETE` responde 204 No Content**, el código estándar cuando se elimina algo y no hay contenido que devolver.
- **Configurar `pg` para devolver las columnas `DATE` como texto** (`YYYY-MM-DD`). Por defecto el driver las convierte a objetos `Date` con zona horaria y, en Colombia (UTC-5), la fecha podría mostrarse corrida.
- **Función `getUserId(req)`** en lugar de usar `req.user!`. El `!` le dice a TypeScript que confíe sin comprobar; la función sí lo comprueba.

**Qué se rechazó o modificó:**
- **`parseId` tenía un error de tipos.** El código generado declaraba `parseId(value: string)`, pero con los tipos de Express 5, `req.params.id` no es exactamente `string`, y TypeScript marcó tres errores en el controlador. Lo detecté gracias a `strict: true`. En lugar de forzar el tipo con `as string`, que solo ocultaría el problema, cambié el parámetro a `unknown` y agregué una validación explícita: debe ser un texto con solo dígitos (`/^\d+$/`). La nueva versión además es más estricta que la original, porque rechaza valores como `1.0`, `1e2` o `" 5"`, que `Number()` sí aceptaba.

**Verificación realizada:**
- Crear, listar, consultar, actualizar (solo el estado) y eliminar tareas con mi usuario.
- La `fecha_vencimiento` se devuelve como `"2026-10-16"`, sin correrse de día.
- Petición sin token: 401 "Token no proporcionado".
- **Prueba de aislamiento entre usuarios:** registré un segundo usuario y, con su token, intenté consultar y eliminar una tarea del primero. Ambas peticiones respondieron 404, y su lista de tareas salió vacía.
- Eliminar con el usuario dueño: `HTTP/1.1 204 No Content`.

### 4. Validación de entradas

**Prompt utilizado:**
> "okay, bloque 4"

**Qué se aceptó y por qué:**
- **AJV con JSON Schema** y `ajv-formats` para validar `email` y `date` sin escribir expresiones regulares propias.
- **`allErrors: true`**, para devolver todos los errores en una sola respuesta.
- **`additionalProperties: false`**, que rechaza campos no esperados. Ahora, si alguien envía `"user_id": 99`, recibe un error claro en lugar de que el campo se ignore en silencio.
- **`pattern: '\\S'`** en nombre y título, para rechazar textos con solo espacios.
- **Contraseña con máximo 72 caracteres**, porque bcrypt solo usa los primeros 72 bytes y el resto se ignoraría sin avisar.
- **Mínimo de 8 caracteres solo en el registro**, no en el login, para no bloquear a usuarios creados antes de esa regla.
- **El esquema se compila una sola vez**, al definir la ruta, y no en cada petición.
- **El orden en las rutas:** primero `authenticate` y después la validación, para no darle detalles del formato del body a alguien sin token.
- Mantener también la validación de "al menos un campo" en el `taskService`, aunque el esquema ya lo cubre con `minProperties: 1`. Es defensa en profundidad: el servicio queda protegido si se reutiliza desde otro lugar.

**Qué se rechazó o modificó:**
- Al probar, los mensajes de AJV salían en inglés (`must match format "email"`), mezclados con mis mensajes en español. Agregué `ajv-i18n` para traducirlos y que toda la API responda en español.

**Verificación realizada:**

| Caso | Resultado |
|---|---|
| Email inválido y contraseña corta | 400 con los dos errores |
| Body vacío en el registro | 400 con los tres campos faltantes |
| Estado `"terminada"` | 400, valor no permitido |
| Fecha `2026-02-30` | 400, formato de fecha inválido |
| `user_id` en el body | 400, campo no permitido |
| Título con solo espacios | 400 |
| Update con `{}` | 400 |
| JSON mal formado | 400 "El cuerpo de la petición no es un JSON válido" |
| Tarea válida | 201 |

Ninguna de las pruebas produjo un error 500.

### 5. Swagger y JSDoc

**Prompt utilizado:**
> "bloque 5"

**Qué se aceptó y por qué:**
- **`swagger-jsdoc` con `swagger-ui-express`**, para que la documentación viva en el mismo archivo que cada ruta y sea más fácil mantenerla actualizada.
- **Esquemas (`User`, `Task`, `TaskInput`, `Error`) y respuestas de error definidos una vez** en `components` y reutilizados con `$ref`.
- **El parámetro `id` declarado una sola vez** en `/tasks/{id}`, heredado por `GET`, `PUT` y `DELETE`.
- **Esquema de seguridad `bearerAuth`**, que activa el botón *Authorize* para probar rutas protegidas.
- **Endpoint `/docs.json`**, que expone la especificación y permite importarla en Postman.
- **Normalizar la ruta del glob con `.replace(/\\/g, '/')`.** En Windows, `path.join` genera rutas con `\`, pero los patrones glob necesitan `/`.
- Comentarios JSDoc con `@param`, `@returns` y `@throws` en los servicios, y comentarios descriptivos en el resto de funciones y clases.

**Qué se rechazó o modificó:**
- Nada del código de este bloque. Los problemas que aparecieron fueron de integración, descritos en *Retos y soluciones*.

**Verificación realizada:**
- Los 7 endpoints aparecen en `/docs`, agrupados en *Auth* y *Tasks*.
- Registro, login, autorización con el token y creación y listado de tareas probados desde Swagger.

### Decisiones tomadas sin asistencia de IA

**1. Usar PostgreSQL en lugar de MongoDB.**
Lo tenía decidido desde que leí la prueba, antes de empezar a trabajar con el asistente. La empresa lo indica como opción preferida y los datos de este proyecto son relacionales: cada tarea pertenece a un usuario. Con PostgreSQL esa relación queda garantizada por la propia base de datos con una llave foránea (`REFERENCES users(id)`), y reglas como los estados válidos o el email único se aplican con `CHECK` y `UNIQUE`, sin depender solo del código.

**2. Usar el puerto 8000 en lugar del 3000.**
El asistente propuso el puerto 3000, pero ese puerto ya lo uso en otro proyecto en mi equipo y los dos servidores no pueden escuchar en el mismo puerto al mismo tiempo. Como el puerto se lee desde el `.env` a través de la configuración centralizada, solo cambié esa variable y no tuve que modificar el código. Esto también me confirmó la utilidad de tener la configuración separada del código.

**3. Desplegar en Vercel.**
Elegí Vercel porque ya tengo experiencia desplegando proyectos en esa plataforma, lo que me permitía publicar la API rápido y concentrar el tiempo en el código. Como Vercel no puede conectarse a una base de datos local, usé una base PostgreSQL en la nube.

---

## Retos y soluciones

1. **Error al instalar los tipos de Node.** El primer intento falló con un 404 porque escribí `@type/node` en lugar de `@types/node`. Lo corregí revisando el mensaje de error.

2. **npm bloqueó el script de instalación de `esbuild`.** Mi versión de npm no ejecuta por defecto los scripts de instalación de los paquetes. Como `tsx` depende de `esbuild`, lo aprobé con `npm approve-scripts esbuild`.

3. **`psql` no se reconocía en la terminal.** Primero comprobé si PostgreSQL estaba instalado buscando su carpeta en `Program Files` (me equivoqué al escribir la ruta un par de veces antes de confirmar que no existía). Lo instalé (versión 18) y agregué su carpeta `bin` al PATH en el `.bashrc`.

4. **`psql` funcionaba en una terminal y en otra no.** La terminal UCRT64 (Bash) lee el `.bashrc`, pero la terminal integrada de VS Code (PowerShell) no. Decidí usar UCRT64 para `psql` y `git`, y VS Code para `npm run dev`.

5. **Error `28P01` al iniciar el servidor.** La contraseña del `.env` no coincidía con la del usuario `postgres`. El código de error indicaba un fallo de autenticación, no de conexión, así que el código funcionaba y el problema era solo la configuración.

6. **"Repository not found" al hacer `git push`.** `git remote add` solo guarda la dirección del repositorio; no lo crea. Creé el repositorio vacío en GitHub y el push funcionó.

7. **Error de tipos en `parseId` con Express 5.** Descrito en la sección 3 del uso de IA.

8. **Fragmentos de código pegados en el lugar equivocado.** En dos ocasiones reemplacé un archivo completo (`validate.ts` y `app.ts`) con un fragmento que solo indicaba dónde agregar líneas nuevas, y aparecieron varios errores de TypeScript. Lo corregí restaurando el archivo completo. Aprendí a leer con atención si el código es un archivo completo o un fragmento para agregar.

9. **Tildes mal guardadas al probar con `curl`.** La terminal UCRT64 no enviaba los caracteres en UTF-8, y una tarea quedó con el título "Tarea v•lida". No era un error de la API: con Swagger el texto se guarda correctamente.

10. **Errores al probar en Swagger.** Un 401 en el login, porque usé un usuario que no estaba registrado en la API; y un 400 por JSON inválido, porque pegué el cuerpo dentro de las llaves que Swagger ya traía y quedaron dos `{`. En los dos casos la API respondió correctamente, lo que también sirvió para comprobar el manejo de errores.

---

## Mejoras con más tiempo

- Pruebas unitarias y de integración con Vitest.
- Despliegue en un servicio en línea.
- Paginación y filtros en `GET /tasks`, por ejemplo por estado o fecha de vencimiento.
- Un script de npm para crear la base de datos y las tablas automáticamente.
