// frontend/src/services/authService.ts
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

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
        // Si el servidor no tiene la ruta, responde HTML y no JSON: se distingue de un fallo de red
        const data = await response.json().catch(() => null);
        if (!data) {
            return {
                success: false,
                message: response.status === 404
                    ? "La recuperación de contraseña todavía no está disponible. Contacta al equipo de soporte."
                    : "El servidor respondió con un error inesperado. Intenta de nuevo más tarde.",
            };
        }
        return { success: response.ok, message: data.message };
    } catch (error) {
        return { success: false, message: "Error de conexión con el servidor" };
    }
};

export const resetPasswordProvider = async (
    email: string,
    code: string,
    newPassword: string
): Promise<{success: boolean, message?: string}> => {
    try {
        const response = await fetch(`${API_BASE_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, newPassword }),
        });
        const data = await response.json().catch(() => null);
        if (!data) return { success: false, message: "El servidor respondió con un error inesperado. Intenta de nuevo más tarde." };
        return { success: response.ok, message: data.message };
    } catch (error) {
        return { success: false, message: "Error de conexión con el servidor" };
    }
};