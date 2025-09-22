'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authAPI } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          console.log('Token found, fetching user data...');
          const userData = await authAPI.getCurrentUser();
          console.log('User data received:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          authAPI.logout();
        }
      } else {
        console.log('No token found, user not authenticated');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success) {
        console.log('Login successful, setting token and user data');
        authAPI.setToken(response.token);
        setUser(response.user);
        toast.success('Login successful!');
        console.log('Redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.isNetworkError) {
        toast.error('Unable to connect to server. Please make sure the backend is running on port 5000.');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Login failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.register({ username, email, password });
      
      if (response.success) {
        toast.success('Registration successful! Please login.');
        router.push('/login');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.isNetworkError) {
        toast.error('Unable to connect to server. Please make sure the backend is running on port 5000.');
      } else {
        toast.error(error.response?.data?.message || error.message || 'Registration failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      const response = await authAPI.forgotPassword({ email });
      
      if (response.success) {
        toast.success('OTP sent to your email!');
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to send OTP');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string, newPassword: string) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyOTP({ email, otp, newPassword });
      
      if (response.success) {
        toast.success('Password reset successful! Please login.');
        router.push('/login');
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to reset password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    verifyOTP,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

