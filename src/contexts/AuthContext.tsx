import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/userTypes';
import { authService, AuthCredentials, RegisterData, ResetPasswordData, UpdatePasswordData } from '@/services/auth/authService';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  updatePassword: (data: UpdatePasswordData) => Promise<void>;
  validateEmail: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
    } catch (error) {
        console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

    checkAuthStatus();
  }, []);

  const login = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    try {
      const user = await authService.signIn(credentials);
      setUser(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const user = await authService.register(data);
      setUser(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      toast({
        title: 'Logout Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
};

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      await authService.resetPassword(data);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for a link to reset your password.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      toast({
        title: 'Password Reset Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePassword = async (data: UpdatePasswordData) => {
    try {
      await authService.updatePassword(data);
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      toast({
        title: 'Password Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const validateEmail = (email: string) => {
    return authService.validateEmail(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        updatePassword,
        validateEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
