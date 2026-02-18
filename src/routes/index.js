/**
 * src/routes/index.js
 * Router principal que maneja la ruta GET `/`.
 *
 * Comportamiento:
 * - Ejecuta una consulta SQL compleja para calcular horas trabajadas
 *   y tramos de horas extras (diurna/nocturna) desde la tabla
 *   `public.USUARIOS`.
 * - Formatea los resultados para la vista `index` y renderiza la plantilla
 *   EJS con la variable `usuarios`.
 *
 * Nota: Este archivo contiene sólo la capa de enrutamiento y presentación;
 * la consulta SQL está embebida aquí por claridad del ejemplo.
 */
import { Router } from "express";
import sql from "../../server.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const usuarios = await sql`
     WITH base AS (
  SELECT
    "Nombre",
    "Dia",
    "Hora_entrada",
    "Hora_salida",

    ("Hora_salida" - "Hora_entrada" - INTERVAL '1 hour') AS horas_reales
  FROM public."USUARIOS"
),
extras AS (
  SELECT *,
    CASE 
      WHEN horas_reales >= INTERVAL '8 hours'
      THEN horas_reales - INTERVAL '8 hours'
      ELSE INTERVAL '0'
    END AS total_extra
  FROM base
),
tramos AS (
  SELECT *,
    -- Extra antes de 08:30
    CASE
      WHEN "Hora_entrada" < TIME '08:30'
      THEN LEAST(TIME '08:30', "Hora_salida") - "Hora_entrada"
      ELSE INTERVAL '0'
    END AS extra_manana,

    -- Extra después de 17:30
    CASE
      WHEN "Hora_salida" > TIME '17:30'
      THEN LEAST("Hora_salida", TIME '21:00') - GREATEST("Hora_entrada", TIME '17:30')
      ELSE INTERVAL '0'
    END AS extra_tarde,

    -- Extra nocturna
    CASE
      WHEN "Hora_salida" > TIME '21:00'
      THEN "Hora_salida" - GREATEST("Hora_entrada", TIME '21:00')
      ELSE INTERVAL '0'
    END AS extra_noche
  FROM extras
)
SELECT
  "Nombre",
  TO_CHAR("Dia", 'DD/MM/YYYY') AS "Dia",
  "Hora_entrada",
  "Hora_salida",

  LEAST(horas_reales, INTERVAL '8 hours') AS horas_laboradas,

  CASE
    WHEN total_extra = INTERVAL '0' THEN INTERVAL '0'
    ELSE LEAST(total_extra, extra_manana + extra_tarde)
  END AS extra_diurna_total,

  CASE
    WHEN total_extra = INTERVAL '0' THEN INTERVAL '0'
    ELSE LEAST(total_extra - LEAST(total_extra, extra_manana + extra_tarde), extra_noche)
  END AS extra_nocturna

FROM tramos;
    `;

    // Formatea campos de intervalo a HH:MM:SS para la vista
    const usuariosFormateados = usuarios.map((u) => ({
      ...u,
      horas_laboradas: u.horas_laboradas
        ? u.horas_laboradas.toString().slice(0, 8)
        : "00:00:00",
      extra_diurna_total: u.extra_diurna_total
        ? u.extra_diurna_total.toString().slice(0, 8)
        : "00:00:00",
      extra_nocturna: u.extra_nocturna
        ? u.extra_nocturna.toString().slice(0, 8)
        : "00:00:00",
    }));

    res.render("index", { usuarios: usuariosFormateados });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error obteniendo datos");
  }
});

export default router;
