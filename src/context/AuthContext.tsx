'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'FARMER' | 'VET';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  phone?: string;
  licenseNumber?: string;
  qualification?: string;
  specialization?: string;
  county?: string;
  subCounty?: string;
  farm?: {
    id: number;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    county: string;
    subCounty: string;
    ward: string;
    gpsLocation?: string;
  } | null;
  subscription?: {
    id: number;
    plan: 'BASIC' | 'STANDARD' | 'PREMIUM';
    status: 'ACTIVE' | 'EXPIRED';
    startDate: string;
    endDate: string;
    amountPaid: number;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isSubscribed: boolean;
  activePlan: 'BASIC' | 'STANDARD' | 'PREMIUM';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session fetch error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Compute subscription state
  const hasActiveSubscription = !!(
    user?.subscription &&
    user.subscription.status === 'ACTIVE' &&
    new Date(user.subscription.endDate) > new Date()
  );

  const activePlan = user?.role === 'FARMER'
    ? (hasActiveSubscription ? user.subscription!.plan : 'BASIC')
    : 'BASIC';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshSession,
        isSubscribed: user?.role === 'FARMER' ? (activePlan !== 'BASIC') : false,
        activePlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
