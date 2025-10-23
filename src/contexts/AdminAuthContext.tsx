import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; message?: string }>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load admin from localStorage
    const storedToken = localStorage.getItem('admin_token');
    const storedAdmin = localStorage.getItem('admin_data');
    
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
    
    setLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-register', {
        body: { name, email, password, confirmPassword }
      });

      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'server_error', 
        message: error.message || 'Registration failed' 
      };
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { email, password, rememberMe }
      });

      if (error) throw error;
      
      if (data.success) {
        setToken(data.token);
        setAdmin(data.admin);
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_data', JSON.stringify(data.admin));
      }

      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'server_error', 
        message: error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, register, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
