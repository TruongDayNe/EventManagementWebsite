import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Define the type for the auth object returned by useAuth
interface AuthContextValue {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string; role?: string } | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  googleLogin: (googleData: { email: string; name: string; id: string }) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context.auth;
};