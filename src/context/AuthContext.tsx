'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isMockMode, supabase, db, UserProfile } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateConsent: (consent: { text: boolean; voice: boolean; video: boolean }) => Promise<boolean>;
  updateEmergencyContact: (contact: { name: string; phone: string; optIn: boolean }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_SESSION_KEY = 'saathi_mock_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      if (isMockMode) {
        // Mock Mode Initialization
        if (typeof window !== 'undefined') {
          const storedSession = localStorage.getItem(MOCK_SESSION_KEY);
          if (storedSession) {
            try {
              const sessionUser = JSON.parse(storedSession) as AuthUser;
              setUser(sessionUser);
              const userProfile = await db.getProfile(sessionUser.id);
              setProfile(userProfile);
            } catch (e) {
              localStorage.removeItem(MOCK_SESSION_KEY);
            }
          }
        }
        setLoading(false);
      } else {
        // Real Supabase Mode Initialization
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
          };
          setUser(authUser);
          let userProfile = await db.getProfile(session.user.id);
          if (!userProfile) {
            userProfile = await db.createProfile({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              role: 'user',
              language: 'en',
              consent_text: true,
              consent_voice: false,
              consent_video: false,
              emergency_contact_opt_in: false,
              created_at: new Date().toISOString(),
            });
          }
          setProfile(userProfile);
        }

        // Listen for auth changes (including Google OAuth redirects)
        const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
            };
            setUser(authUser);
            let userProfile = await db.getProfile(session.user.id);
            if (!userProfile) {
              userProfile = await db.createProfile({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                role: 'user',
                language: 'en',
                consent_text: true,
                consent_voice: false,
                consent_video: false,
                emergency_contact_opt_in: false,
                created_at: new Date().toISOString(),
              });
            }
            setProfile(userProfile);

            // On successful login/OAuth, smoothly navigate to dashboard
            if (event === 'SIGNED_IN' && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
              router.push('/dashboard');
            }
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    };

    initializeAuth();
  }, [pathname, router]);

  // Route protection rules (Client-Side Guards)
  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/', '/login', '/signup', '/detect', '/arcade', '/resources', '/history'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      // Not logged in -> Redirect to login
      router.push('/login');
    } else if (user && profile) {
      // If logged in and on login/signup page, redirect to dashboard
      if (pathname === '/login' || pathname === '/signup') {
        router.push('/dashboard');
      } else if (pathname === '/counsellor' && profile.role !== 'counsellor') {
        router.push('/dashboard');
      } else if (pathname === '/admin' && profile.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, pathname, router]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      if (isMockMode) {
        // Pre-defined seed accounts
        let matchedId = '';
        let matchedEmail = email.toLowerCase().trim();

        if (matchedEmail === 'user@saathi.org') {
          matchedId = 'user-id-1';
        } else if (matchedEmail === 'priya@saathi.org') {
          matchedId = 'user-id-2';
        } else if (matchedEmail === 'counsellor@saathi.org') {
          matchedId = 'counsellor-id-1';
        } else if (matchedEmail === 'counsellor2@saathi.org') {
          matchedId = 'counsellor-id-2';
        } else if (matchedEmail === 'admin@saathi.org') {
          matchedId = 'admin-id-1';
        } else {
          // Dynamic mock login
          matchedId = 'user-mock-' + Math.floor(Math.random() * 1000);
        }

        const sessionUser: AuthUser = { id: matchedId, email: matchedEmail };
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(sessionUser));
        setUser(sessionUser);

        // Fetch or create profile
        let userProfile = await db.getProfile(matchedId);
        if (!userProfile) {
          userProfile = await db.createProfile({
            id: matchedId,
            full_name: email.split('@')[0].toUpperCase(),
            role: email.includes('counsellor') ? 'counsellor' : email.includes('admin') ? 'admin' : 'user',
            language: 'en',
            consent_text: email.includes('counsellor') || email.includes('admin'), // staff don't need onboarding consent screen
            consent_voice: false,
            consent_video: false,
            emergency_contact_opt_in: false,
            created_at: new Date().toISOString(),
          });
        }
        setProfile(userProfile);
        
        // Navigation helper
        if (userProfile.role === 'counsellor') {
          router.push('/counsellor');
        } else if (userProfile.role === 'admin') {
          router.push('/admin');
        } else if (!userProfile.consent_text) {
          router.push('/onboarding/consent');
        } else {
          router.push('/dashboard');
        }
        
        return { success: true };
      } else {
        // Supabase Auth Login
        const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        
        if (data.user) {
          const authUser = { id: data.user.id, email: data.user.email || '' };
          setUser(authUser);
          let userProfile = await db.getProfile(data.user.id);
          if (!userProfile) {
            userProfile = await db.createProfile({
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || email.split('@')[0] || 'User',
              role: 'user',
              language: 'en',
              consent_text: true,
              consent_voice: false,
              consent_video: false,
              emergency_contact_opt_in: false,
              created_at: new Date().toISOString(),
            });
          }
          setProfile(userProfile);
          router.push('/dashboard');
        }
        return { success: true };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
  };

  // Signup
  const signup = async (email: string, password: string, fullName: string) => {
    try {
      if (isMockMode) {
        const userId = 'user-mock-' + Math.floor(Math.random() * 10000);
        const sessionUser: AuthUser = { id: userId, email: email.toLowerCase().trim() };
        localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(sessionUser));
        setUser(sessionUser);

        // Determine role from email naming
        let role: 'user' | 'counsellor' | 'admin' = 'user';
        if (email.toLowerCase().includes('counsellor')) role = 'counsellor';
        else if (email.toLowerCase().includes('admin')) role = 'admin';

        const newProfile = await db.createProfile({
          id: userId,
          full_name: fullName,
          role,
          language: 'en',
          consent_text: true,
          consent_voice: false,
          consent_video: false,
          emergency_contact_opt_in: false,
          created_at: new Date().toISOString(),
        });
        setProfile(newProfile);

        if (role === 'counsellor') router.push('/counsellor');
        else if (role === 'admin') router.push('/admin');
        else router.push('/dashboard');

        return { success: true };
      } else {
        // Supabase Signup
        const { data, error } = await supabase!.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        if (error) return { success: false, error: error.message };

        if (data.user) {
          const authUser = { id: data.user.id, email: data.user.email || '' };
          setUser(authUser);

          const newProfile = await db.createProfile({
            id: data.user.id,
            full_name: fullName,
            role: 'user',
            language: 'en',
            consent_text: true,
            consent_voice: false,
            consent_video: false,
            emergency_contact_opt_in: false,
            created_at: new Date().toISOString(),
          });
          setProfile(newProfile);

          if (data.session) {
            router.push('/dashboard');
          } else {
            return {
              success: true,
              error: 'Account created! If email confirmation is enabled in Supabase, please verify your email. Otherwise, sign in directly.'
            };
          }
        }

        return { success: true };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      if (isMockMode) {
        if (typeof window !== 'undefined') {
          const confirmLogin = window.confirm(
            "GOOGLE SANDBOX LOGIN:\nSign in using Google account 'rahul.sharma@gmail.com'?"
          );
          if (!confirmLogin) return { success: false, error: "Google sign-in cancelled by user." };
          
          const sessionUser = { id: 'user-id-1', email: 'rahul.sharma@gmail.com' };
          localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(sessionUser));
          setUser(sessionUser);
          
          let userProfile = await db.getProfile('user-id-1');
          if (!userProfile) {
            userProfile = await db.createProfile({
              id: 'user-id-1',
              full_name: 'Rahul Sharma',
              role: 'user',
              language: 'en',
              consent_text: false,
              consent_voice: false,
              consent_video: false,
              emergency_contact_name: 'Amit Sharma (Father)',
              emergency_contact_phone: '+91 9876543210',
              emergency_contact_opt_in: true,
              created_at: new Date().toISOString(),
            });
          }
          setProfile(userProfile);
          
          if (!userProfile.consent_text) {
            router.push('/onboarding/consent');
          } else {
            router.push('/dashboard');
          }
          return { success: true };
        }
        return { success: false };
      } else {
        const { error } = await supabase!.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Google Auth failed.' };
    }
  };

  // Logout
  const logout = async () => {
    if (isMockMode) {
      localStorage.removeItem(MOCK_SESSION_KEY);
      setUser(null);
      setProfile(null);
      router.push('/login');
    } else {
      await supabase!.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push('/login');
    }
  };

  // Update consent flags
  const updateConsent = async (consent: { text: boolean; voice: boolean; video: boolean }) => {
    if (!user) return false;
    const updated = await db.updateProfile(user.id, {
      consent_text: consent.text,
      consent_voice: consent.voice,
      consent_video: consent.video,
    });
    if (updated) {
      setProfile(updated);
      return true;
    }
    return false;
  };

  // Update emergency contact
  const updateEmergencyContact = async (contact: { name: string; phone: string; optIn: boolean }) => {
    if (!user) return false;
    const updated = await db.updateProfile(user.id, {
      emergency_contact_name: contact.name,
      emergency_contact_phone: contact.phone,
      emergency_contact_opt_in: contact.optIn,
    });
    if (updated) {
      setProfile(updated);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateConsent,
        updateEmergencyContact,
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
