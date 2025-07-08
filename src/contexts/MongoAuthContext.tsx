
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'provider' | 'admin';
  age?: number;
  bio?: string;
  location?: string;
  photos?: string[];
  isVerified?: boolean;
  verificationStatus?: string;
  rating?: number;
  totalReviews?: number;
  services?: any[];
  earnings?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
    age?: number;
    bio?: string;
    location?: string;
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const MongoAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('MongoAuth: Checking for existing session');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        console.log('MongoAuth: User authenticated', response.data);
        setUser(response.data);
      } else {
        console.log('MongoAuth: Invalid token, clearing storage');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('MongoAuth: Error checking auth status', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
    age?: number;
    bio?: string;
    location?: string;
  }) => {
    console.log('MongoAuth: Attempting sign up for:', userData.email);
    
    try {
      const response = await apiClient.register(userData);
      
      if (response.success && response.data) {
        console.log('MongoAuth: Sign up successful', response.data);
        
        // Store token and user data
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully"
        });
        
        return { error: null };
      } else {
        console.error('MongoAuth: Sign up failed', response.error);
        toast({
          title: "Sign up failed",
          description: response.error || 'Registration failed',
          variant: "destructive"
        });
        return { error: response.error };
      }
    } catch (error) {
      console.error('MongoAuth: Sign up exception', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('MongoAuth: Attempting sign in for:', email);
    
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        console.log('MongoAuth: Sign in successful', response.data);
        
        // Store token and user data
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully"
        });
        
        return { error: null };
      } else {
        console.error('MongoAuth: Sign in failed', response.error);
        toast({
          title: "Sign in failed",
          description: response.error || 'Invalid credentials',
          variant: "destructive"
        });
        return { error: response.error };
      }
    } catch (error) {
      console.error('MongoAuth: Sign in exception', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    console.log('MongoAuth: Signing out user');
    localStorage.removeItem('token');
    setUser(null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await apiClient.updateProfile(profileData);
      
      if (response.success && response.data) {
        setUser(response.data);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully"
        });
        return { error: null };
      } else {
        toast({
          title: "Update failed",
          description: response.error || 'Failed to update profile',
          variant: "destructive"
        });
        return { error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useMongoAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMongoAuth must be used within a MongoAuthProvider');
  }
  return context;
};
