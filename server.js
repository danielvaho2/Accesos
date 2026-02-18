/**
 * server.js
 * Cliente de conexión a la base de datos usando `postgres`.
 *
 * Configuración:
 * - Lee la variable de entorno `DATABASE_URL` mediante `dotenv`.
 * - Configura SSL con `require` (útil para despliegues en servicios que exigen TLS).
 *
 * Exporta `sql` para ser usado por los módulos de rutas.
 */
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
});

export default sql;
