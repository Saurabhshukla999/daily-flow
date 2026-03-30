export const AUTH_TOKEN_CHANGED_EVENT = 'auth-token-changed';

export interface User {
  id: string;
  email: string;
  created_at: Date;
}

interface TokenPayload {
  userId?: string;
  email?: string;
  exp?: number;
  created_at?: string;
}

// Simple JWT token parsing for client-side (no verification needed as server handles it)
export function parseToken(token: string): TokenPayload | null {
  try {
    // JWT tokens are base64 encoded, split into 3 parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as TokenPayload;
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const decoded = parseToken(token);
    if (!decoded) return null;

    return {
      id: decoded.userId,
      email: decoded.email,
      created_at: new Date(decoded.created_at || Date.now())
    };
  } catch (error) {
    localStorage.removeItem('auth_token');
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
  }
}
