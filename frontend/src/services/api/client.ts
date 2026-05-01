import { getAccessToken } from './storage';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type ApiRequestOptions = {
  auth?: boolean;
  body?: BodyInit | object;
  headers?: HeadersInit;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
};

function isPlainObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !(value instanceof FormData);
}

function extractMessage(data: unknown, fallback: string): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    const message = data.message.trim();

    if (
      message.startsWith('<!DOCTYPE html>') ||
      message.startsWith('<html')
    ) {
      return 'The request hit a web page instead of the backend API. Check NEXT_PUBLIC_API_URL and make sure the frontend and backend are running on different ports.';
    }

    return message;
  }

  return fallback;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function mapLegacyPath(
  path: string,
  method: ApiRequestOptions['method'] = 'GET',
) {
  if (path.startsWith('/api/v1/')) {
    return path;
  }

  if (path.startsWith('/api/notifications')) {
    return path.replace('/api/notifications', '/api/v1/notifications');
  }

  if (path === '/api/posts' && method === 'POST') {
    return '/api/v1/posts';
  }

  if (path.startsWith('/api/posts/feed')) {
    return path.replace('/api/posts/feed', '/api/v1/posts/feed');
  }

  if (
    /^\/api\/posts\/[^/]+\/(share|comments)(\?.*)?$/.test(path) ||
    /^\/api\/posts\/user\/[^/]+(\?.*)?$/.test(path) ||
    (method === 'GET' && /^\/api\/posts\/[^/]+(\?.*)?$/.test(path))
  ) {
    return path.replace('/api/posts', '/api/v1/posts');
  }

  const reactionsMatch = path.match(/^\/api\/posts\/([^/]+)\/reactions$/);
  if (
    reactionsMatch &&
    (method === 'POST' || method === 'DELETE')
  ) {
    return `/api/v1/posts/${reactionsMatch[1]}/like`;
  }

  return path;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    auth = false,
    body,
    headers,
    method = 'GET',
    token,
  } = options;
  const resolvedPath = mapLegacyPath(path, method);

  const resolvedToken = token ?? (auth ? getAccessToken() : null);
  const requestHeaders = new Headers(headers);

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    if (isPlainObject(body)) {
      requestHeaders.set('Content-Type', 'application/json');
      requestBody = JSON.stringify(body);
    } else {
      requestBody = body;
    }
  }

  if (resolvedToken) {
    requestHeaders.set('Authorization', `Bearer ${resolvedToken}`);
  }

  // Inject Audit Session ID if active (Super Admin Mode)
  if (typeof window !== 'undefined') {
    const auditSession = localStorage.getItem('active_audit_session');
    if (auditSession) {
      try {
        const session = JSON.parse(auditSession);
        if (session.id) {
          requestHeaders.set('x-audit-session-id', session.id);
        }
      } catch (e) {
        console.error('Error parsing audit session:', e);
      }
    }
  }

  const response = await fetch(`${API_BASE_URL}${resolvedPath}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
    cache: 'no-store',
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      extractMessage(data, response.statusText || 'Request failed'),
      response.status,
      data,
    );
  }

  return data as T;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
