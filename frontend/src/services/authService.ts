// frontend/src/services/authService.ts
import { API_BASE_URL } from '../config/api';

<<<<<<< HEAD
const API_URL = API_BASE_URL;
=======
const API_URL = 'http://192.168.1.18:3000/api'; //SIEMPRE CORREGIR SEGÚN IP
>>>>>>> 9ffd24b (Cambios locales antes de sincronizar con main)

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        roles_id: number;
        link_code: string;
    };
}

export const loginProvider = async (username: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, message: errorData.message || "Credenciales incorrectas" };
        }

        return await response.json();
    } catch (error) {
        console.error("Error en loginProvider:", error);
        return { success: false, message: "No se pudo conectar con el servidor. Revisa tu red." };
    }
};

export const loginByCodeProvider = async (code: string): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_URL}/login-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });

        return await response.json();
    } catch (error) {
        console.error("Error en loginByCodeProvider:", error);
        return { success: false, message: "Error de conexión" };
    }
};
export const forgotPasswordProvider = async (email: string): Promise<{success: boolean, message?: string}> => {
    try {
        const response = await fetch(`${API_BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        return { success: response.ok, message: data.message };
    } catch (error) {
        return { success: false, message: "Error de conexión con el servidor" };
    }
};