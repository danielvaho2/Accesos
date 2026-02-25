import { Router } from "express";
import { pool } from "../../server.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // Ejecuta la consulta
    const result = await pool.request().query(`
WITH base AS (
    SELECT
        Nombre,
        Dia,
        Hora_entrada,
        Hora_salida,
        DATEADD(SECOND, DATEDIFF(SECOND, Hora_entrada, Hora_salida) - 3600, 0) AS horas_reales,
        DATEPART(WEEKDAY, Dia) AS dia_num
    FROM USUARIOS
),
limites AS (
    SELECT *,
        CASE 
            WHEN dia_num = 2 THEN 7*3600      -- Lunes
            WHEN dia_num = 7 THEN 5*3600      -- Sábado
            WHEN dia_num = 1 THEN 0           -- Domingo
            ELSE 8*3600                       -- Martes a Viernes
        END AS limite_segundos
    FROM base
),
extras AS (
    SELECT *,
        CASE
            WHEN DATEDIFF(SECOND, 0, horas_reales) > limite_segundos
                THEN DATEDIFF(SECOND, 0, horas_reales) - limite_segundos
            ELSE 0
        END AS total_extra_seg
    FROM limites
),
tramos AS (
    SELECT *,
        -- Extra nocturna (después de 21:00)
        CASE
            WHEN Hora_salida > '21:00:00'
                THEN DATEDIFF(
                        SECOND,
                        CASE WHEN Hora_entrada > '21:00:00' THEN Hora_entrada ELSE '21:00:00' END,
                        Hora_salida
                     )
            ELSE 0
        END AS extra_noche_seg
    FROM extras
)
SELECT
    Nombre,
    FORMAT(Dia, 'dd/MM/yyyy') AS Dia,
    Hora_entrada,
    Hora_salida,

    -- Horas normales
    DATEADD(SECOND,
        CASE 
            WHEN DATEDIFF(SECOND, 0, horas_reales) > limite_segundos
                THEN limite_segundos
            ELSE DATEDIFF(SECOND, 0, horas_reales)
        END,
    0) AS horas_laboradas,

    -- Extra nocturna
    DATEADD(SECOND,
        CASE 
            WHEN extra_noche_seg > total_extra_seg THEN total_extra_seg
            ELSE extra_noche_seg
        END,
    0) AS extra_nocturna,

    -- Extra diurna = total extra - nocturna
    DATEADD(SECOND,
        total_extra_seg -
        CASE 
            WHEN extra_noche_seg > total_extra_seg THEN total_extra_seg
            ELSE extra_noche_seg
        END,
    0) AS extra_diurna_total

FROM tramos
`);

    // Accede al array real
    const usuarios = result.recordset;

    // Formatea campos de intervalo a HH:MM:SS para la vista
   function formatearHora(dateObj) {
  if (!dateObj) return "00:00:00";

  const horas = String(dateObj.getHours()).padStart(2, "0");
  const minutos = String(dateObj.getMinutes()).padStart(2, "0");
  const segundos = String(dateObj.getSeconds()).padStart(2, "0");

  return dateObj.toISOString().substring(11, 19);
}

const usuariosFormateados = usuarios.map((u) => ({
  ...u,
  Hora_entrada: formatearHora(u.Hora_entrada),
  Hora_salida: formatearHora(u.Hora_salida),
  horas_laboradas: formatearHora(u.horas_laboradas),
  extra_diurna_total: formatearHora(u.extra_diurna_total),
  extra_nocturna: formatearHora(u.extra_nocturna),
}));
    res.render("index", { usuarios: usuariosFormateados });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error obteniendo datos");
  }
});

export default router;