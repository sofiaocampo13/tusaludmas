import { apiGet, apiPost } from './api';
import type { User, Medicine, PatientLinked } from '../types/database';

export async function getUserById(id: number) {
  return apiGet<{ success: boolean; user: User }>(`/users/${id}`);
}

export async function getCaregiverPatients(caregiverId: number) {
  return apiGet<{ success: boolean; patients: PatientLinked[] }>(`/caregivers/${caregiverId}/patients`);
}

export async function listMedicinesCatalog() {
  return apiGet<{ success: boolean; medicines: Medicine[] }>(`/medicines`);
}

export async function createMedicineCatalog(payload: { name: string; description?: string | null }) {
  return apiPost<{ success: boolean; id: number }>(`/medicines`, payload);
}

export async function listPatientMedicines(patientId: number) {
  return apiGet<{ success: boolean; patient_medicines: any[] }>(`/patients/${patientId}/medicines`);
}

export async function createPatientMedicine(
  patientId: number,
  payload: {
    medicine_id: number;
    dose?: string | null;
    frequency?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    alarm_datetime?: string | null;
    alarm_title?: string | null;
  }
) {
  return apiPost<{ success: boolean; id: number; warning?: string }>(`/patients/${patientId}/medicines`, payload);
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

