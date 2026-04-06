import { API_BASE_URL } from '../config/api';
const API_URL = API_BASE_URL;

export interface Appointment {
  id: number;
  users_id: number;
  location_id: number | null;
  appointment_datetime: string;
  description: string;
  status: string;
}

export interface Alarm {
  id: number;
  title: string;
  alarm_datetime: string;
  users_id: number;
  appointment_id: number | null;
  patient_medicine_id: number | null;
  state: number;
}

export interface DashboardData {
  appointments: Appointment[];
  alarms: Alarm[];
}

export const getPatientDashboard = async (patientId: number): Promise<DashboardData | null> => {
  try {
    const response = await fetch(`${API_URL}/patients/patient/dashboard/${patientId}`);
    const json = await response.json();

    if (!response.ok) {
      console.error('Error dashboard:', json);
      return null;
    }

    if (json.success && json.data) {
      return {
        appointments: json.data.appointments || [],
        alarms: json.data.alarms || []
      };
    }
    return null;
  } catch (error) {
    console.error('Error al cargar dashboard del paciente:', error);
    return null;
  }
};

/** state: 1 activo, 0 inactivo (p. ej. ya tomada / descartada en servidor) */
export const updateAlarmState = async (alarmId: number, state: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/alarms/${alarmId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
    const json = await response.json();
    return response.ok && json?.success === true;
  } catch (e) {
    console.error('Error al actualizar alarma:', e);
    return false;
  }
};