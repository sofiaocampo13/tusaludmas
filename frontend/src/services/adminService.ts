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

// Función para obtener todos los usuarios (usando fetch como tu authService)
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
        return { success: false, message: "Error de conexión con el servidor administrativo." };
    }
};

// Función para suspender/activar (actualizar el campo 'state')
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
export const getAllReportsProvider = async (): Promise<{success: boolean, reports?: ReportsData[], message?: string}> => {
    return { success: true, reports: []};
};