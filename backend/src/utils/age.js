/**
 * Cálculo de edad usando siempre la fecha y hora de Colombia (America/Bogota).
 *
 * Colombia está en UTC-5 fijo y no aplica horario de verano desde 1993, así que
 * el offset directo da el mismo resultado que la zona horaria y no depende de la
 * configuración regional del servidor.
 */

export const LEGAL_AGE = 18;

const COLOMBIA_UTC_OFFSET_MINUTES = -5 * 60;

/** Día calendario actual en Colombia, sin importar la zona horaria del servidor. */
export const getColombiaToday = (now = new Date()) => {
  const colombiaTime = new Date(now.getTime() + COLOMBIA_UTC_OFFSET_MINUTES * 60 * 1000);
  return {
    year: colombiaTime.getUTCFullYear(),
    month: colombiaTime.getUTCMonth() + 1,
    day: colombiaTime.getUTCDate(),
  };
};

/** Acepta 'YYYY-MM-DD' o un Date; devuelve el día calendario sin conversión de zona. */
const toCalendarDate = (value) => {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth() + 1,
      day: value.getUTCDate(),
    };
  }

  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
};

/** Edad cumplida al día de hoy en Colombia. Devuelve null si la fecha es inválida. */
export const calculateAge = (birthDate, now = new Date()) => {
  const birth = toCalendarDate(birthDate);
  if (!birth) return null;

  const today = getColombiaToday(now);
  let age = today.year - birth.year;

  const stillNotBirthday =
    today.month < birth.month || (today.month === birth.month && today.day < birth.day);
  if (stillNotBirthday) age--;

  return age;
};

/** true solo si la persona ya cumplió 18 años en Colombia. */
export const isAdult = (birthDate, now = new Date()) => {
  const age = calculateAge(birthDate, now);
  return age !== null && age >= LEGAL_AGE;
};
