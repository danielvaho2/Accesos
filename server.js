import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    instanceName: process.env.DB_INSTANCE,
    encrypt: false,
    trustServerCertificate: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on("connect", () => {
  console.log("✅ Conectado a SQL Server Express correctamente");
});

pool.on("error", err => {
  console.error("❌ Error en conexión SQL:", err);
});

export { pool, poolConnect };