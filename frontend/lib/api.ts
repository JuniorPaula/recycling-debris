export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL! ?? 'http://localhost:5001/api';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}