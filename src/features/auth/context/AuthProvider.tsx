'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType, LoginCredentials } from '../types';
import { loginUser, logoutUser } from '../services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cargar usuario y token desde localStorage al montar
  useEffect(() => {
    const loadAuth = () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Función de login
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await loginUser(credentials);
      
      // Guardar en estado
      setUser(response.user);
      setToken(response.token);

      // Guardar en localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      // Redirigir según el rol
      if (response.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/client/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      await logoutUser();
      
      // Limpiar estado
      setUser(null);
      setToken(null);

      // Limpiar localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Redirigir al login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
