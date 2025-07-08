
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  id: string;
  user_type: 'client' | 'provider';
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with delay to avoid deadlock
          setTimeout(async () => {
            try {
              console.log('Fetching profile for user:', session.user.id);
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching profile:', error);
              } else {
                console.log('Profile fetched successfully:', profileData);
                setProfile(profileData);
              }
            } catch (err) {
              console.error('Exception fetching profile:', err);
            }
          }, 100);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('Attempting sign up for:', email, 'with user type:', userData.user_type);
    
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            user_type: userData.user_type
          }
        }
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration"
        });
      } else if (data.session) {
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully"
        });
      }

      return { error };
    } catch (err) {
      console.error('Sign up exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in response:', { data, error });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully"
        });
      }

      return { error };
    } catch (err) {
      console.error('Sign in exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: err };
    }
  };

  const signOut = async () => {
    console.log('Signing out user');
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
