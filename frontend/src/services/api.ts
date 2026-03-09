import Constants from 'expo-constants';

// Prioridad:
// - EXPO_PUBLIC_API_URL (app.config / app.json)
// - API_URL (compatibilidad)
// - fallback al que ya usabas en authService
export const API_URL: string =
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL as string) ||
  (Constants.expoConfig?.extra?.API_URL as string) ||
  'http://192.168.1.18:3000/api';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

