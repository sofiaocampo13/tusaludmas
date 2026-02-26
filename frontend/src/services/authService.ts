// frontend/src/services/authService.ts

const API_URL = 'http://10.212.34.155:3000/api';

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        roles_id: number; // Clave para la redirección
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
        
        // Verificamos si la respuesta es 200 OK antes de convertir a JSON
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