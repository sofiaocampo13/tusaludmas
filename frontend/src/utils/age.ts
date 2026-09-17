/**
 * Cálculo de edad usando siempre la fecha y hora de Colombia (America/Bogota).
 *
 * Colombia está en UTC-5 fijo y no aplica horario de verano desde 1993, por eso
 * se usa el offset directo en lugar de Intl.DateTimeFormat: el soporte de zonas
 * horarias de Intl en Hermes/Android no es confiable.
 */

export const LEGAL_AGE = 18;

const COLOMBIA_UTC_OFFSET_MINUTES = -5 * 60;

export type CalendarDate = { year: number; month: number; day: number };

/** Día calendario actual en Colombia, sin importar la zona horaria del dispositivo. */
export const getColombiaToday = (now: Date = new Date()): CalendarDate => {
  const colombiaTime = new Date(now.getTime() + COLOMBIA_UTC_OFFSET_MINUTES * 60 * 1000);
  return {
    year: colombiaTime.getUTCFullYear(),
    month: colombiaTime.getUTCMonth() + 1,
    day: colombiaTime.getUTCDate(),
  };
};

/** Toma el día calendario tal como el usuario lo vio en el selector. */
const toCalendarDate = (value: Date | string): CalendarDate | null => {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() };
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
};

/** Edad cumplida al día de hoy en Colombia. Devuelve null si la fecha es inválida. */
export const calculateAge = (birthDate: Date | string, now: Date = new Date()): number | null => {
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
export const isAdult = (birthDate: Date | string, now: Date = new Date()): boolean => {
  const age = calculateAge(birthDate, now);
  return age !== null && age >= LEGAL_AGE;
};

/**
 * Última fecha de nacimiento válida para ser mayor de edad hoy en Colombia.
 * Se usa como `maximumDate` del selector para que no se pueda elegir un menor.
 */
export const getMaxBirthDateForAdult = (now: Date = new Date()): Date => {
  const today = getColombiaToday(now);
  return new Date(today.year - LEGAL_AGE, today.month - 1, today.day);
};
