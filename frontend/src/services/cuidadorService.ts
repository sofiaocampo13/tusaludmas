import { API_BASE_URL } from '../config/api';

export const API_URL: string = API_BASE_URL;

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);

  if (!res.ok) {
    // Si falla (404 o 500), lanzamos el error con el status para debuggear
    throw new Error(`Error en servidor: ${res.status}`);
  }

  // Verificamos si la respuesta es realmente JSON antes de parsear
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return (await res.json()) as T;
  } else {
    throw new Error("El servidor no devolvió JSON. Posible error de ruta (404).");
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} ${res.status}`);
  return (await res.json()) as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path} ${res.status}`);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `POST ${path} ${res.status}`;

    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}

    throw new Error(msg);
  }

  return (await res.json()) as T;
}