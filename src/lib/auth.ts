import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  created_at: Date;
}

export interface AuthTokens {
  user: User;
  token: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateId(): string {
  return uuidv4();
}

// Simple JWT token parsing for client-side (no verification needed as server handles it)
export function parseToken(token: string): any {
  try {
    // JWT tokens are base64 encoded, split into 3 parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
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
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}
