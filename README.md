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

Descripción General

Accesos es una aplicación web desarrollada con Node.js y Express que permite importar registros de asistencia desde archivos Excel (.xlsx), almacenarlos en PostgreSQL y calcular automáticamente horas laboradas, horas extra diurnas y nocturnas según reglas de negocio predefinidas. La interfaz utiliza EJS como motor de plantillas para la visualización de la información.

Requisitos Previos:

Antes de ejecutar la aplicación, es necesario contar con:

Node.js (versión 18 o superior recomendada)
PostgreSQL (local o en la nube, por ejemplo Supabase)
Gestor de paquetes npm

Dependencias Principales:
La aplicación utiliza las siguientes librerías:

express → Framework backend para la creación del servidor HTTP.
ejs → Motor de plantillas para renderizar vistas dinámicas.
postgres → Cliente ligero para conexión a PostgreSQL.
multer → Manejo de carga de archivos.
xlsx → Lectura y procesamiento de archivos Excel.
dotenv → Gestión de variables de entorno.
morgan → Middleware de logging HTTP.
csv-parser → Procesamiento opcional de archivos CSV.

Instalación:

Clonar el repositorio:

git clone <URL_DEL_REPOSITORIO>
cd accesos


Instalar dependencias:

npm install


Configurar variables de entorno:
Crear un archivo .env en la raíz del proyecto con la cadena de conexión a la base de datos:

DATABASE_URL=postgres://usuario:password@host:puerto/database


Ejecutar la aplicación en entorno de desarrollo:

npm run dev


Acceder desde el navegador:

http://localhost:3000

Funcionamiento

La aplicación permite:

Cargar archivos Excel con registros de empleados.
Insertar automáticamente los datos en la base de datos PostgreSQL.
Calcular horas laboradas dentro del horario establecido.
Determinar horas extra diurnas y nocturnas según condiciones definidas.
Visualizar los resultados en una interfaz web dinámica.
Ejecución de desarrollo:

```bash
npm run dev
```

Asegúrate de definir la variable de entorno `DATABASE_URL` antes de ejecutar.
