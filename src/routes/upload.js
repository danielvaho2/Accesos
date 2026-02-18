/**
 * src/routes/upload.js
 * Ruta POST `/upload` para subir un archivo XLSX y volcar su contenido
 * en la tabla `public.USUARIOS`.
 *
 * Funcionalidad principal:
 * - Recibe el archivo con `multer` (campo `file`).
 * - Lee la primera hoja del XLSX con `xlsx`.
 * - Convierte las fechas y horas de Excel a formatos compatibles con la DB.
 * - Inserta cada fila en la tabla `USUARIOS` y elimina el archivo temporal.
 */
import { Router } from "express";
import multer from "multer";
import XLSX from "xlsx";
import fs from "fs";
import sql from "../../server.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

/**
 * Convierte el valor decimal de hora de Excel a una cadena HH:MM:SS.
 * Si ya es una cadena, la devuelve tal cual.
 *
 * @param {number|string} decimal - Valor de hora de Excel.
 * @returns {string} Hora en formato `HH:MM:SS`.
 */
function decimalToTime(decimal) {
  if (typeof decimal === "string") return decimal;
  const totalSeconds = Math.round(decimal * 24 * 3600);
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/**
 * Convierte la fecha serial de Excel a una fecha ISO `YYYY-MM-DD`.
 * Usa la utilidad interna de `xlsx` para parsear correctamente día/mes/año.
 *
 * @param {number} serial - Fecha serial de Excel.
 * @returns {string} Fecha en formato `YYYY-MM-DD`.
 */
function excelDateToJSDate(serial) {
  const date = XLSX.SSF.parse_date_code(serial);
  const jsDate = new Date(date.y, date.m - 1, date.d);
  return jsDate.toISOString().split("T")[0];
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const dia =
        typeof row.Dia === "number" ? excelDateToJSDate(row.Dia) : row.Dia;

      await sql`
        INSERT INTO public."USUARIOS" ("Nombre", "Dia", "Hora_entrada", "Hora_salida")
        VALUES (
          ${row.Nombre},
          ${dia},
          ${decimalToTime(row.Hora_entrada)},
          ${decimalToTime(row.Hora_salida)}
        )
      `;
    }

    fs.unlinkSync(req.file.path);
    res.send("Archivo XLSX importado correctamente!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error subiendo XLSX");
  }
});

export default router;
