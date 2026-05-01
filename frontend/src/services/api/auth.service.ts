import { apiRequest } from './client';
import { clearAccessToken, setAccessToken } from './storage';

export type OtpContext = 'signup' | 'forgot-password' | 'forgot-username';
export type SocialProvider = 'google' | 'facebook' | 'instagram';
export type OtpDeliveryMode = 'smtp' | 'console';

export interface AuthUser {
  email: string;
  id?: string;
  nickname?: string;
  username?: string | null;
}

export interface AuthResponse {
  success: boolean;
  accessToken?: string;
  message?: string;
  deliveryMode?: OtpDeliveryMode;
  isNewUser?: boolean;
  otpPreview?: string;
  provider?: SocialProvider;
  user?: AuthUser;
}

export interface RequestOtpPayload {
  context: OtpContext;
  email: string;
  password?: string;
  username?: string;
}

export interface VerifyOtpPayload extends RequestOtpPayload {
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SocialLoginPayload {
  provider: SocialProvider;
  email?: string;
  displayName?: string;
  providerUserId?: string;
}

function persistToken(accessToken?: string): void {
  if (accessToken) {
    setAccessToken(accessToken);
  }
}

export async function requestOtp(
  payload: RequestOtpPayload,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/v1/auth/request-otp', {
    method: 'POST',
    body: payload,
  });
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/v1/auth/verify-otp', {
    method: 'POST',
    body: payload,
  });

  persistToken(response.accessToken);
  return response;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: payload,
  });

  persistToken(response.accessToken);
  return response;
}

export async function socialLogin(
  payload: SocialLoginPayload,
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/v1/auth/social-login', {
    method: 'POST',
    body: payload,
  });

  persistToken(response.accessToken);
  return response;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/api/v1/auth/logout', {
      method: 'POST',
      auth: true,
    });
  } finally {
    clearAccessToken();
  }
}

export function clearSession(): void {
  clearAccessToken();
}
