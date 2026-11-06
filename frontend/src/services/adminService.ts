import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

// Interfaz basada en tu tabla 'users' del MER
export interface UserData {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    roles_id: number;
    role_name?: string;
    state: number; // 1 = Activo, 0 = Suspendido
}

export interface MedicineData {
    id: number;
    name: string;
    description: string;
}

export interface ReportsData {
    id: number;
    caregiver_id: number;
    titulo: string;
    descripcion: string;
    categoria: string;
    estado: number; // 0=pendiente, 1=revisado, 2=resuelto
    created_at: string;
    imagen?: string | null; // captura de pantalla adjunta (data URI)
    first_name?: string | null;
    last_name?: string | null;
    username?: string;
    email?: string;
}
export interface ClinicData {
    id: number;
    name: string;
    address?: string;
}

export interface DoctorData {
    id: number;
    first_name?: string;
    last_name?: string;
    email: string;
    clinica?: string;
    state: number;
}

export interface AdminResponse {
    success: boolean;
    message?: string;
    users?: UserData[];
}

export interface AdminSummaryData {
    activeUsers: number;
    appointments: number;
    reminders: number;
    alarms: number;
}


// 1. Obtener todos los usuarios
export const getAllUsersProvider = async (): Promise<AdminResponse> => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, message: errorData.message || "Error al obtener usuarios" };
        }

        return await response.json();
    } catch (error) {
        console.error("Error en getAllUsersProvider:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

/**
 * 2. ACTUALIZAR USUARIO (Corregido con la ruta /update)
 */
export const updateUserProvider = async (userId: number, userData: Partial<UserData>): Promise<{success: boolean, message?: string}> => {
    try {
        // CORRECCIÓN: Usamos /update/${userId} porque así está en tu authRoutes.js
        const url = `${API_URL}/update/${userId}`;
        
        console.log("Petición PUT a:", url); 

        const response = await fetch(url, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData),
        });

        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return { 
                success: response.ok, 
                message: data.message || (response.ok ? "Usuario actualizado" : "Error al actualizar") 
            };
        } else {
            // Manejo de error si el servidor devuelve HTML (Ruta no encontrada)
            const textError = await response.text();
            console.error("Error 404/500 - El servidor no encontró la ruta:", textError);
            return { success: false, message: "Ruta de actualización no encontrada en el servidor." };
        }
    } catch (error) {
        console.error("Error en updateUserProvider:", error);
        return { success: false, message: "Error de conexión al intentar guardar cambios." };
    }
};

// 3. Suspender/Activar usuario
export const toggleUserStatusProvider = async (userId: number, newState: number): Promise<{success: boolean}> => {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/state`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: newState }),
        });

        return await response.json();
    } catch (error) {
        console.error("Error en toggleUserStatusProvider:", error);
        return { success: false };
    }
};

// --- FUNCIONES DE MEDICAMENTOS ---
// 4. Obtener Catálogo (Usa /api/catalog)
export const getAllMedicinesProvider = async (): Promise<{success: boolean, medicines?: MedicineData[], message?: string}> => {
    try {
        const response = await fetch(`${API_URL}/catalog`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) return { success: false, message: "No se pudo obtener el catálogo" };

        const data = await response.json();

        // Manejo flexible de la respuesta (array o objeto con propiedad medicines)
        if (data && data.medicines) {
            return { success: true, medicines: data.medicines };
        }
        
        if (Array.isArray(data)) {
            return { success: true, medicines: data };
        }

        return { success: false, message: "Formato no reconocido" };
    } catch (error) {
        console.error("Error en getAllMedicinesProvider:", error);
        return { success: false, message: "Error de red" };
    }
};

// 5. Reportes
export const getAllReportsProvider = async (): Promise<{success: boolean, reports?: ReportsData[], message?: string}> => {
    try {
        const response = await fetch(`${API_URL}/reportes`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await response.json();
    } catch (error) {
        console.error("Error en getAllReportsProvider:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

export const updateReporteEstadoProvider = async (reporteId: number, estado: number): Promise<{success: boolean, message?: string}> => {
    try {
        const response = await fetch(`${API_URL}/reportes/${reporteId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error en updateReporteEstadoProvider:", error);
        return { success: false, message: "Error de conexión." };
    }
};
//5. clinicas y medicos
export const getClinicsAndDoctorsProvider = async (): Promise<{
    success: boolean;
    clinics?: ClinicData[];
    doctors?: DoctorData[];
    message?: string;
}> => {
    try {
        const response = await fetch(`${API_URL}/external/catalog`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            return { success: false, message: 'No se pudo obtener el listado de clínicas y médicos' };
        }

        const data = await response.json();
        return {
            success: Boolean(data?.success),
            clinics: data?.clinics || [],
            doctors: data?.doctors || [],
            message: data?.message,
        };
    } catch (error) {
        console.error('Error en getClinicsAndDoctorsProvider:', error);
        return { success: false, message: 'Error de conexión' };
    }
};

export const getAdminSummaryProvider = async (
    filter: 'Mensual' | 'Semanal' | 'Hoy'
): Promise<{ success: boolean; summary?: AdminSummaryData; message?: string }> => {
    try {
        const response = await fetch(`${API_URL}/admin/summary?filter=${encodeURIComponent(filter)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            return { success: false, message: 'No se pudo obtener el resumen del administrador' };
        }

        const data = await response.json();
        if (data?.success && data?.summary) {
            return { success: true, summary: data.summary };
        }

        return { success: false, message: data?.message || 'Respuesta inválida del servidor' };
    } catch (error) {
        console.error('Error en getAdminSummaryProvider:', error);
        return { success: false, message: 'Error de conexión' };
    }
};