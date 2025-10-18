import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { getCurrentUser } from '@/utils/authCache';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, currentSession) => {
      setSession(currentSession);
      // Use the cached user value which is already updated by the listener in authCache.ts
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    });

    // Then check for existing session and user
    const initializeAuth = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  // Update user activity timestamp periodically
  useEffect(() => {
    if (!user) return;

    const updateActivity = async () => {
      await supabase
        .from('profiles')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', user.id);
    };

    // Update activity immediately when user becomes active
    updateActivity();

    // Update activity every 5 minutes while user is active
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const sendMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/threads`,
        },
      });
      if (error) {
        toast('Error sending magic link', {
          description: error.message,
        });
        throw error;
      }
      toast('Check your email!', {
        description:
          'A magic link has been sent to your email to complete sign in.',
      });
    } catch (error) {
      logger.error('Error sending magic link', error);
      throw error;
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast('Login failed', {
          description: error.message,
        });
        throw error;
      }
      toast('Signed in successfully!');
    } catch (error) {
      logger.error('Error signing in with password', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // First check if we have a valid session before attempting to sign out
      const { data } = await supabase.auth.getSession();

      // If there's no session, just update the local state
      if (!data.session) {
        setSession(null);
        setUser(null);
        toast('Signed out', {
          description: 'You have successfully signed out.',
        });
        return;
      }

      // Otherwise proceed with normal sign out
      // Using scope: 'global' ensures tokens are removed from all tabs/windows
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        logger.error('Error during sign out', error);
        toast('Error signing out', {
          description: error.message,
        });
        throw error;
      }

      // Explicitly clear the state
      setSession(null);
      setUser(null);

      toast('Signed out', {
        description: 'You have successfully signed out.',
      });
    } catch (error) {
      logger.error('Error signing out', error);
      // Even if there's an error, we should try to reset the local state
      setSession(null);
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        sendMagicLink,
        signInWithPassword,
        signOut,
      }}
    >
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
