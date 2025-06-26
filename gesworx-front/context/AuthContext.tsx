'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

// Mock user data for demo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@gesworx.com',
    name: 'Super Admin',
    role: 'superadmin',
    avatar: 'SA',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'manager@gesworx.com',
    name: 'Warehouse Manager',
    role: 'admin',
    avatar: 'WM',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'worker@gesworx.com',
    name: 'Field Worker',
    role: 'user',
    assignedVan: 'ABC-123',
    avatar: 'FW',
    isActive: true,
    createdAt: new Date(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('gesworx_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('gesworx_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gesworx_user');
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