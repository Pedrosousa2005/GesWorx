'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedVan?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isLoading: true,
  hasPermission: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('gesworx_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (userData.token) {
          apiClient.setToken(userData.token);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('gesworx_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.error || !response.data) {
        console.error('Login failed:', response.error);
        return false;
      }

      const { token, user: userData } = response.data;
      
      const userWithToken: User = {
        id: userData.id.toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        isActive: true,
        createdAt: new Date(),
        token,
      };

      setUser(userWithToken);
      apiClient.setToken(token);
      localStorage.setItem('gesworx_user', JSON.stringify(userWithToken));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gesworx_user');
    apiClient.setToken('');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const permissions = {
      superadmin: [
        'manage_users', 
        'manage_vans', 
        'manage_materials', 
        'manage_tasks', 
        'load_vans',
        'view_all'
      ],
      admin: [
        'manage_vans', 
        'manage_materials', 
        'manage_tasks', 
        'load_vans',
        'view_materials'
      ],
      user: [
        'view_assigned_tasks', 
        'view_assigned_van_materials',
        'scan_qr'
      ],
    };
    
    return permissions[user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);