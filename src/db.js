import sql from "mssql";

const dbConfig = {
  server: "VAHOS\\SQLEXPRESS",
  database: "Empleados",
  user: "accesos_user",
  password: "123456",
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

let pool;

async function conectarDB() {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
      console.log("✅ Conectado a SQL Server");
    }
    return pool;
  } catch (err) {
    console.error("❌ Error al conectar a SQL Server:", err);
    process.exit(1);
  }
}

export { pool, conectarDB };