// src/features/auth/services/authService.ts
import { LoginCredentials, LoginResponse } from '../types';

/**
 * Servicio de autenticación - Usa API routes
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Credenciales inválidas');
    }

    return await response.json();

  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Cierra la sesión del usuario
 */
export async function logoutUser(): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  } catch (error) {
    console.error('Error en logout:', error);
  }
}

/**
 * Verifica si el token es válido
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    // Verificación simple del token
    const tokenData = decodeToken(token);
    return !!tokenData;
  } catch (error) {
    return false;
  }
}

/**
 * Decodifica el token
 */
function decodeToken(token: string): any {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  } catch (error) {
    return null;
  }
}