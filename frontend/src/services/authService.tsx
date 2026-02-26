const API_URL = 'http://192.168.1.28:3000/api'; // Reemplaza con tu IP actual

// 1. Definimos qué esperamos recibir del servidor para que TS no sufra
interface AuthResponse {
    success: boolean;
    message?: string;
    user?: any;
}

// 2. Agregamos tipos (string) a los parámetros
export const loginProvider = async (username: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        // Retornamos la respuesta convertida a JSON
        return await response.json();
    } catch (error) {
        console.error("Error en loginProvider:", error);
        return { success: false, message: "Error de conexión con el servidor" };
    }
};

// 3. Lo mismo para el login por código
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