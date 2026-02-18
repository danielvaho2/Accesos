# Proyecto Accesos

Breve documentación del proyecto y de los archivos principales.

- `src/index.js`: Punto de entrada del servidor Express. Configura vistas,
  monta rutas y arranca el servidor en el puerto 3000.
- `src/routes/index.js`: Router que atiende `GET /` y ejecuta la consulta
  para obtener usuarios y calcular horas trabajadas/horas extras.
- `src/routes/upload.js`: Router que atiende `POST /upload` para procesar
  archivos `.xlsx` y volcar filas en la tabla `public.USUARIOS`.
- `src/views/index.ejs`: Plantilla EJS que muestra la tabla de empleados y
  el formulario para subir un Excel.
- `server.js`: Cliente de conexión a la base de datos (usa `DATABASE_URL`).

Notas:

- No se modificó la lógica del código; solo se añadieron comentarios y
  documentación inline para facilitar el mantenimiento.
- `package.json` y `package-lock.json` no pueden llevar comentarios (JSON),
  por eso la documentación del proyecto se incluye en este `README.md`.

Ejecución de desarrollo:

```bash
npm run dev
```

Asegúrate de definir la variable de entorno `DATABASE_URL` antes de ejecutar.
