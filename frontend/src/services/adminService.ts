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
    userName: string;
    reason: string;
    date: string;
}

export interface AdminResponse {
    success: boolean;
    message?: string;
    users?: UserData[];
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

// 4. Medicinas
export const getAllMedicinesProvider = async (): Promise<{success: boolean, medicines?: MedicineData[], message?: string}> => {
    try {
        const response = await fetch(`${API_URL}/medicines`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: "Error de conexión con el inventario." };
    }
};

// 5. Reportes
export const getAllReportsProvider = async (): Promise<{success: boolean, reports?: ReportsData[], message?: string}> => {
    return { success: true, reports: []};
};