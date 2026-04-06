import { apiGet, apiPost, apiPut, apiDelete } from './cuidadorService';
import type { User, Medicine, PatientLinked } from '../types/database';

export async function getUserById(id: number) {
  return apiGet<{ success: boolean; user: User }>(`/users/${id}`);
}

export async function getCaregiverPatients(caregiverId: number) {
  return apiGet<{ success: boolean; patients: PatientLinked[] }>(`/caregivers/${caregiverId}/patients`);
}

export async function searchMedicines(term: string) {
  return apiGet<Medicine[]>(`/medicines/search?term=${encodeURIComponent(term)}`);
}

export async function createPatientMedicine(patientId: number, payload: any) {
  return apiPost<{ success: boolean; id: number }>(`/patients/${patientId}/medicines`, payload);
}

export async function listPatientMedicines(patientId: number) {
  return apiGet<{ success: boolean; patient_medicines: any[] }>(`/patients/${patientId}/medicines`);
}

export async function createAlarm(payload: any) {
  return apiPost<{ success: boolean; id: number }>(`/alarms`, payload);
}


export async function listPatientAppointments(patientId: number) {
  return apiGet<{ success: boolean; appointments: any[] }>(`/patients/${patientId}/appointments`);
}

export async function createPatientAppointment(
  patientId: number,
  payload: {
    description?: string | null;
    status?: string | null;
    appointment_datetime: string;
    location_name?: string | null;
    location_address?: string | null;
    location_latitude?: number | null;
    location_longitude?: number | null;
    alarm_datetime?: string | null;
    alarm_title?: string | null;
  }
) {
  return apiPost<{ success: boolean; id: number; warning?: string }>(`/patients/${patientId}/appointments`, payload);
}

export async function listPatientAlarmas(patientId: number) {
  return apiGet<{ success: boolean; alarmas: any[] }>(`/patients/${patientId}/alarmas`);
}

export async function omitirAlarma(alarmId: number) {
  return apiPut<{ success: boolean }>(`/alarms/${alarmId}`, { state: 2 });
}

export async function editarAlarma(alarmId: number, alarm_datetime: string) {
  return apiPut<{ success: boolean }>(`/alarms/${alarmId}`, { alarm_datetime });
}

export async function eliminarAlarma(alarmId: number) {
  return apiDelete<{ success: boolean }>(`/alarms/${alarmId}`);
}

export async function getClinics() {
  return apiGet<{ success: boolean; clinics: { id: number; name: string; address: string }[] }>('/external/clinics');
}

export async function linkPatientToCaregiver(caregiverId: number, link_code: string) {
  return apiPost<{ success: boolean; message?: string; patientId?: number }>(
    `/caregivers/${caregiverId}/link-patient`,
    { link_code }
  );
}

export async function createReporte(payload: {
  caregiver_id: number;
  titulo: string;
  descripcion: string;
  categoria?: string;
}) {
  return apiPost<{ success: boolean; id: number }>('/reportes', payload);
}

export async function updateUserProfile(
  userId: number,
  data: { first_name: string; last_name: string; email: string; phone: string }
) {
  return apiPut<{ success: boolean; message?: string }>(`/update/${userId}`, data);
}