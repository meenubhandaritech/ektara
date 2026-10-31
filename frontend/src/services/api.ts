const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'same-origin' : 'http://localhost:8080');
const API_ORIGIN = API_BASE === 'same-origin' ? '' : API_BASE.replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type TokenGetter = () => Promise<string | null>;
let getToken: TokenGetter = async () => null;
export function setTokenGetter(fn: TokenGetter) {
  getToken = fn;
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth !== false) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_ORIGIN}/api${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the EKTARA server. Please check your connection and try again.');
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(data?.details) ? ': ' + data.details.map((d: any) => d.message).join(', ') : '';
    throw new ApiError(res.status, (data?.error ?? 'Request failed') + detail);
  }
  return data as T;
}
