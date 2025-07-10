
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
  profilePicture?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  rating?: number;
  totalReviews?: number;
  services?: any[];
  earnings?: number;
}

interface AuthResponse {
  token?: string;
  user?: User;
}

interface ProfilePictureResponse {
  profilePictureUrl: string;
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
  uploadProfilePicture: (file: File) => Promise<{ error: any }>;
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
      console.log('MongoAuth: No token found');
      setLoading(false);
      return;
    }

    try {
      console.log('MongoAuth: Validating existing token');
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        console.log('MongoAuth: User authenticated', response.data);
        setUser(response.data as User);
      } else {
        console.log('MongoAuth: Invalid token, clearing storage');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('MongoAuth: Error checking auth status', error);
      localStorage.removeItem('token');
      setUser(null);
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
        
        const authData = response.data as AuthResponse;
        
        // Store token and user data
        if (authData.token) {
          localStorage.setItem('token', authData.token);
        }
        if (authData.user) {
          setUser(authData.user);
        }
        
        toast({
          title: "Welcome to BodyConnect!",
          description: "Your account has been created successfully"
        });
        
        return { error: null };
      } else {
        console.error('MongoAuth: Sign up failed', response.error);
        toast({
          title: "Sign up failed",
          description: response.error || 'Registration failed. Please check your connection and try again.',
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
        
        const authData = response.data as AuthResponse;
        
        // Store token and user data
        if (authData.token) {
          localStorage.setItem('token', authData.token);
        }
        if (authData.user) {
          setUser(authData.user);
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
          description: response.error || 'Invalid credentials or server connection issue',
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
        setUser(response.data as User);
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

  const uploadProfilePicture = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await apiClient.uploadProfilePicture(formData);
      
      if (response.success && response.data) {
        const uploadResponse = response.data as ProfilePictureResponse;
        setUser(prev => prev ? { ...prev, profilePicture: uploadResponse.profilePictureUrl } : null);
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully"
        });
        return { error: null };
      } else {
        toast({
          title: "Upload failed",
          description: response.error || 'Failed to upload profile picture',
          variant: "destructive"
        });
        return { error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Upload failed",
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
      updateProfile,
      uploadProfilePicture
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
