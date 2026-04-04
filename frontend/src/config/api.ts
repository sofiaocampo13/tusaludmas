/**
 * Configuración central del API backend.
 * IMPORTANTE: Cambia esta IP según tu red local donde corre el backend.
 * Debe ser la IP de tu PC en la red (ej: 192.168.1.x o 192.168.80.x)
 */
export const API_BASE_URL = 'http://192.168.1.55:3000/api';

export const ENDPOINTS ={
    register: `${API_BASE_URL}/register`
}