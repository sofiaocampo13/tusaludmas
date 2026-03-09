/**
 * Tipos alineados con el esquema de la base de datos tusaludmas.
 * Usar estos campos en la UI en lugar de nombres de mockups.
 */

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  roles_id: number;
  state: boolean;
  twoFA: boolean;
  link_code: string | null;
  cuidador_id: number | null;
}

export interface Medicine {
  id: number;
  name: string;
  description: string | null;
}

export interface PatientMedicine {
  id: number;
  users_id: number;
  medicine_id: number;
  dose: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface Location {
  id: number;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Appointment {
  id: number;
  users_id: number;
  location_id: number | null;
  appointment_datetime: string | null;
  description: string | null;
  status: string | null;
}

/**
 * alarmas: cada fila es un recordatorio (toma de medicamento o cita).
 * - Si patient_medicine_id != null → recordatorio de medicina (toma).
 * - Si appointment_id != null → recordatorio de cita.
 */
export interface Alarma {
  id: number;
  users_id: number;
  appointment_id: number | null;
  patient_medicine_id: number | null;
  title: string | null;
  alarm_datetime: string | null;
  state: boolean;
}

export interface CaregiverPatient {
  caregiver_id: number;
  patient_id: number;
}

/** Para la pantalla del cuidador: usuario logueado (cuidador) con nombre para mostrar */
export type CuidadorUser = Pick<User, 'id' | 'first_name' | 'last_name' | 'username' | 'roles_id'> & {
  fullName?: string; // derivado: first_name + last_name (compatibilidad con login)
  profile_picture?: string | null; // URL de la foto de perfil
};

/** Paciente vinculado al cuidador (caregiver_patient + users) */
export interface PatientLinked {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username?: string;
}

/**
 * Item de notificación emergente en Inicio, derivado de alarmas (+ joins).
 * type: 'toma' si alarma.patient_medicine_id; 'cita' si alarma.appointment_id.
 * (Estado confirmada/pospuesta/no confirmó puede añadirse cuando exista en BD.)
 */
export interface NotificacionEmergente {
  id: number;
  type: 'toma' | 'cita';
  title: string;
  detail: string;       // ej. medicine.name + dose, o appointment.description
  alarm_datetime: string;
  patient_medicine_id?: number | null;
  appointment_id?: number | null;
}
