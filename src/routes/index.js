import { Router } from "express";
import { pool } from "../../server.js";

const router = Router();

async function obtenerDatos(req, res, viewName) {
  try {
    const { fechaInicio, fechaFin, nombre } = req.query;

    const request = pool.request();
    let condiciones = [];

    if (fechaInicio && fechaFin) {
      request.input("fechaInicio", fechaInicio);
      request.input("fechaFin", fechaFin);
      condiciones.push("Dia BETWEEN @fechaInicio AND @fechaFin");
    }

    if (nombre) {
      request.input("nombre", `%${nombre}%`);
      condiciones.push("Nombre LIKE @nombre");
    }

    const whereClause =
      condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

    const hacerSumatoria = fechaInicio && fechaFin && nombre;

    const result = await request.query(`
WITH base AS (
    SELECT
        Nombre,
        Dia,
        Hora_entrada,
        Hora_salida,

        DATEADD(SECOND,
            DATEDIFF(SECOND, Hora_entrada, Hora_salida)
            - CASE 
                WHEN DATEPART(WEEKDAY, Dia) = 7 THEN 0   -- sábado NO descuenta
                ELSE 3600                                -- otros días sí
              END,
        0) AS horas_reales,

        DATEPART(WEEKDAY, Dia) AS dia_num
    FROM USUARIOS
    ${whereClause}
),
limites AS (
    SELECT *,
        CASE 
            WHEN dia_num = 2 THEN 7*3600
            WHEN dia_num = 7 THEN 5*3600
            WHEN dia_num = 1 THEN 0
            ELSE 8*3600
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
    CONVERT(VARCHAR, Hora_entrada, 108) AS Hora_entrada,
    CONVERT(VARCHAR, Hora_salida, 108) AS Hora_salida,
    DATEDIFF(SECOND, 0,
        DATEADD(SECOND,
            CASE 
                WHEN DATEDIFF(SECOND, 0, horas_reales) > limite_segundos
                    THEN limite_segundos
                ELSE DATEDIFF(SECOND, 0, horas_reales)
            END, 0)
    ) AS horas_seg,

    DATEDIFF(SECOND, 0,
        DATEADD(SECOND,
            total_extra_seg -
            CASE 
                WHEN extra_noche_seg > total_extra_seg THEN total_extra_seg
                ELSE extra_noche_seg
            END, 0)
    ) AS extra_diurna_seg,

    DATEDIFF(SECOND, 0,
        DATEADD(SECOND,
            CASE 
                WHEN extra_noche_seg > total_extra_seg THEN total_extra_seg
                ELSE extra_noche_seg
               
            END, 0)
    ) AS extra_nocturna_seg

FROM tramos
ORDER BY Dia ASC
`);

    let usuarios = result.recordset;

    function segundosAHHMMSS(seg) {
      const horas = Math.floor(seg / 3600);
      const minutos = Math.floor((seg % 3600) / 60);
      const segundos = seg % 60;
      return `${String(horas).padStart(2,"0")}:${String(minutos).padStart(2,"0")}:${String(segundos).padStart(2,"0")}`;
    }

    let totales = null;

    if (hacerSumatoria && usuarios.length > 0) {

      const totalHoras = usuarios.reduce((acc, u) => acc + u.horas_seg, 0);
      const totalExtraDiurna = usuarios.reduce((acc, u) => acc + u.extra_diurna_seg, 0);
      const totalExtraNocturna = usuarios.reduce((acc, u) => acc + u.extra_nocturna_seg, 0);

      totales = {
        horas: segundosAHHMMSS(totalHoras),
        extra_diurna: segundosAHHMMSS(totalExtraDiurna),
        extra_nocturna: segundosAHHMMSS(totalExtraNocturna)
      };
    }

    // Formatear detalle
    usuarios = usuarios.map(u => ({
      ...u,
      horas_laboradas: segundosAHHMMSS(u.horas_seg),
      extra_diurna_total: segundosAHHMMSS(u.extra_diurna_seg),
      extra_nocturna: segundosAHHMMSS(u.extra_nocturna_seg)
    }));

    res.render(viewName, {
      usuarios,
      fechaInicio,
      fechaFin,
      nombre,
      hacerSumatoria,
      totales
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error obteniendo datos");
  }
}

router.get("/", async (req, res) => {
  await obtenerDatos(req, res, "index");
});

router.get("/imprimir", async (req, res) => {
  await obtenerDatos(req, res, "imprimir");
});

export default router;