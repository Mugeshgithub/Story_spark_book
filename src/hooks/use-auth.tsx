
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from './use-toast';
import { LoaderCircle } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        toast({
            title: "Account Created!",
            description: "Welcome! You have been successfully signed up.",
        });
    } catch (error: any) {
        console.error("Sign-up Error:", error);
        toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: error.message.includes('email-already-in-use') 
                ? "This email is already in use." 
                : (error.message || "An unexpected error occurred."),
        });
    }
  }

  const signInWithEmail = async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        toast({
            title: "Welcome Back!",
            description: "You have successfully signed in.",
        });
    } catch (error: any) {
        console.error("Sign-in Error:", error);
        toast({
            variant: "destructive",
            title: "Sign-in Failed",
            description: "Invalid email or password. Please try again.",
        });
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: "Signed Out",
        description: "You have successfully signed out.",
      });
      // Redirection will be handled by the page components
    } catch (error: any) {
        console.error("Sign-Out Error:", error);
        toast({
            variant: "destructive",
            title: "Sign-out Failed",
            description: "An error occurred while signing out.",
        });
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, signUpWithEmail, signInWithEmail, signOut }}>
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
