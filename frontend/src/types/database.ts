/**
 * Tipos alineados con el esquema de la base de datos tusaludmas.
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
  password?: string; // Añadido por seguridad si lo usas en servicios
  email: string;
  phone: string | null;
  roles_id: number;
  state: boolean;
  twoFA: boolean;
  link_code: string | null;
  cuidador_id: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Medicine {
  id: number;
  name: string;
  principio_activo: string | null; // Cambiado de any a string | null
  concentracion: string | null;    // ¡NUEVO! Importante para la lógica de la pizarra
  forma_farmaceutica: string | null; // ¡NUEVO! Coincide con tu SQL
  titular: string | null;           // ¡NUEVO! Coincide con tu SQL
}

export interface PatientMedicine {
  id: number;
  users_id: number; // El paciente al que se le asigna
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
 * alarmas: sincronizado con tu ALTER TABLE
 */
export interface Alarma {
  id: number;
  users_id: number; // El cuidador que recibe la alerta
  appointment_id: number | null;
  patient_medicine_id: number | null;
  title: string | null;
  alarm_datetime: string | null;
  /**
   * state: 0: Pendiente, 1: Completada, 2: Omitida, 3: Incumplida
   * Según tu ALTER TABLE MODIFY COLUMN state TINYINT DEFAULT 0
   */
  state: number; 
  observation?: string | null; // ¡NUEVO! Por tu ALTER TABLE ADD COLUMN
}

export interface CaregiverPatient {
  caregiver_id: number;
  patient_id: number;
}

// --- TIPOS AUXILIARES PARA UI ---

export type CuidadorUser = Pick<User, 'id' | 'first_name' | 'last_name' | 'username' | 'roles_id'> & {
  fullName?: string;
  profile_picture?: string | null;
};

export interface PatientLinked {
  id: number;
  first_name: string | null;
  last_name: string | null;
  username?: string;
}

export interface NotificacionEmergente {
  id: number;
  type: 'toma' | 'cita';
  title: string;
  detail: string;
  alarm_datetime: string;
  patient_medicine_id?: number | null;
  appointment_id?: number | null;
  state: number; // Para saber si mostrar el check/equis en inicio
}