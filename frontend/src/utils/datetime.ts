/**
 * Manejo de fechas y horas de la base de datos.
 *
 * El backend devuelve los DATETIME como texto plano "YYYY-MM-DD HH:mm:ss"
 * (ver `dateStrings` en backend/src/config/db.js). Ese texto es hora de pared:
 * no lleva zona horaria y no debe convertirse a ninguna. La hora que el cuidador
 * eligió en el reloj es la hora que se guarda y la que se muestra, en cualquier
 * dispositivo.
 *
 * Por eso aquí NO se usa `new Date(texto)` directamente: según el formato y el
 * motor (Hermes en Android, JSC en iOS), esa cadena puede interpretarse como
 * UTC o como local, y esa diferencia es justo la que desplazaba las horas.
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** Convierte "YYYY-MM-DD HH:mm:ss" en un Date local, sin conversión de zona. */
export const parseDbDateTime = (value: string): Date | null => {
  if (typeof value !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(
    Number(year), Number(month) - 1, Number(day),
    Number(hour), Number(minute), Number(second ?? 0), 0
  );
  return isNaN(date.getTime()) ? null : date;
};

/** Formatea un Date como "YYYY-MM-DD HH:mm:ss" usando sus componentes locales. */
export const formatDbDateTime = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

/** Formatea un Date como "YYYY-MM-DD" usando sus componentes locales. */
export const formatDbDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Parte de fecha ("YYYY-MM-DD") de un DATETIME de la base de datos. */
export const dbDateOnly = (value: string): string => value.slice(0, 10);

/** Milisegundos para ordenar y comparar. Las inválidas quedan de últimas. */
export const dbTime = (value: string): number =>
  parseDbDateTime(value)?.getTime() ?? Number.MAX_SAFE_INTEGER;

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** "8:15 p. m." — reloj de 12 horas con a. m./p. m., igual en todas las pantallas. */
export const formatHoraDate = (d: Date): string => {
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(d.getMinutes())} ${h < 12 ? 'a. m.' : 'p. m.'}`;
};

/** Igual que `formatHoraDate`, a partir del texto "YYYY-MM-DD HH:mm:ss" de la base de datos. */
export const formatHora = (value: string): string => {
  const d = parseDbDateTime(value);
  return d ? formatHoraDate(d) : value;
};

/** "25 sep" */
export const formatDiaCorto = (value: string): string => {
  const d = parseDbDateTime(value);
  return d ? `${d.getDate()} ${MESES[d.getMonth()]}` : value;
};

/** "Vie 25 sep 2026 · 20:15" */
export const formatFechaHora = (value: string): string => {
  const d = parseDbDateTime(value);
  if (!d) return value;
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()} · ${formatHora(value)}`;
};
