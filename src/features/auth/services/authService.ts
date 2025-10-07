import { LoginCredentials, LoginResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Servicio de autenticación
 * TODO: Conectar con API real cuando esté disponible
 */

/**
 * Realiza el login del usuario
 * Por ahora simula el login, pero está preparado para API con JWT
 */
export async function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    // TODO: Descomentar cuando tengas la API
    // const response = await fetch(`${API_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials),
    // });
    // if (!response.ok) throw new Error('Credenciales inválidas');
    // return await response.json();

    // Simulación de login (Mock)
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula delay de red

    // Usuario de prueba - Admin
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      return {
        token: 'mock-jwt-token-admin-12345',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          name: 'Administrador',
        },
      };
    }

    // Usuario de prueba - Cliente
    if (credentials.username === 'cliente' && credentials.password === 'cliente123') {
      return {
        token: 'mock-jwt-token-client-67890',
        user: {
          id: '2',
          username: 'cliente',
          email: 'cliente@example.com',
          role: 'client',
          name: 'Juan Pérez',
        },
      };
    }

    throw new Error('Credenciales inválidas');
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
    // TODO: Descomentar cuando tengas la API
    // await fetch(`${API_URL}/auth/logout`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });

    // Por ahora solo limpia el localStorage
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
    // TODO: Descomentar cuando tengas la API
    // const response = await fetch(`${API_URL}/auth/verify`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });
    // return response.ok;

    // Mock: cualquier token es válido por ahora
    return token.startsWith('mock-jwt-token');
  } catch (error) {
    return false;
  }
}
