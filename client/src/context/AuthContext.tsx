'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  father_name?: string;
  surname: string;
  gotra: string;
  kuldevi: string;
  gender: string;
  dob?: string;
  marital_status?: string;
  native_village: string;
  native_taluka?: string;
  current_city: string;
  education?: string;
  occupation?: string;
  company_or_business?: string;
  blood_group?: string;
  photo_url?: string;
  phone_visible: boolean;
  address?: string;
  bio?: string;
}

export interface User {
  id: string;
  phone: string;
  role: 'super_admin' | 'president' | 'secretary' | 'treasurer' | 'committee' | 'member';
  is_approved: boolean;
  profile?: UserProfile | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  isAdmin: boolean;
  isApproved: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  isAdmin: false,
  isApproved: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('rbs_token');
      const storedUser = localStorage.getItem('rbs_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('rbs_token', newToken);
    localStorage.setItem('rbs_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rbs_token');
    localStorage.removeItem('rbs_user');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('rbs_user', JSON.stringify(updated));
  };

  const isAdmin = !!(
    user && ['super_admin', 'president', 'secretary', 'treasurer', 'committee'].includes(user.role)
  );

  const isApproved = !!(user && (user.is_approved || isAdmin));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        isAdmin,
        isApproved,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
