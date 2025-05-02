import { createContext, useState, useEffect, ReactNode } from 'react';
import instance from '../api/axiosInstance'; // Adjust the path based on your project structure

interface User {
  id: string;
  email: string;
  name: string;
  userName: string;
  role?: string;
  [key: string]: any; // Cho phép user chứa thêm các field khác (ví dụ: iss, aud, ... trong JWT)
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
}

interface AuthContextType {
  auth: AuthState & {
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    googleLogin: (googleData: { email: string; name: string; id: string }) => Promise<void>;
    logout: () => void;
  };
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  auth: {
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    login: async () => {},
    register: async () => {},
    googleLogin: async () => {},
    logout: () => {},
  },
  setAuth: () => {},
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    loading: true,
  });

  // Decode JWT token to extract user details
  const decodeJWT = (token: string): User & { exp: number } => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      const user: User = {
        id: decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '',
        email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
        userName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
        name: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/givenname'] || '',
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || undefined,
        ...decoded, // thêm tất cả các field khác vào
      };

      return { ...user, exp: decoded.exp || 0 };
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return {
        id: '',
        email: '',
        userName: '',
        name: '',
        role: undefined,
        exp: 0,
      };
    }
  };

  // Check if token is expired
  const isTokenExpired = (exp: number): boolean => {
    const currentTime = Math.floor(Date.now() / 1000);
    return exp < currentTime;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const { exp } = decodeJWT(storedToken);

          if (isTokenExpired(exp)) {
            throw new Error('Token expired');
          }

          setAuth((prev) => ({
            ...prev,
            token: storedToken,
            user,
            isAuthenticated: true,
          }));

          await instance.get('/api/Auth/ValidateToken', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
          setAuth((prev) => ({
            ...prev,
            isAuthenticated: false,
            token: null,
            user: null,
          }));
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setAuth((prev) => ({ ...prev, loading: false }));
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await instance.post('/api/Auth/Login', { email, password });
      const { token: newToken, isAuthenticated } = response.data;

      if (!isAuthenticated) {
        throw new Error('Authentication failed');
      }

      const decodedUser = decodeJWT(newToken);

      if (isTokenExpired(decodedUser.exp)) {
        throw new Error('Token expired');
      }

      const { id, email: userEmail, userName, name, role, ...rest } = decodedUser;

      const user: User = { id, email: userEmail, userName, name, role, ...rest };

      setAuth((prev) => ({
        ...prev,
        isAuthenticated: true,
        token: newToken,
        user,
      }));

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await instance.post('/api/Auth/Register', {
        name: data.username,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      const { token: newToken, isAuthenticated } = response.data;

      if (!isAuthenticated) {
        throw new Error('Registration failed');
      }

      const decodedUser = decodeJWT(newToken);

      if (isTokenExpired(decodedUser.exp)) {
        throw new Error('Token expired');
      }

      const { id, email: userEmail, userName, name, role, ...rest } = decodedUser;

      const user: User = { id, email: userEmail, userName, name, role, ...rest };

      setAuth((prev) => ({
        ...prev,
        isAuthenticated: true,
        token: newToken,
        user,
      }));

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const googleLogin = async (googleData: { email: string; name: string; id: string }): Promise<void> => {
    try {
      try {
        const response = await instance.post('/api/Auth/Login', {
          email: googleData.email,
          password: googleData.id,
        });
        const { token: newToken, isAuthenticated } = response.data;

        if (isAuthenticated) {
          const decodedUser = decodeJWT(newToken);

          if (isTokenExpired(decodedUser.exp)) {
            throw new Error('Token expired');
          }

          const { id, email: userEmail, userName, name, role, ...rest } = decodedUser;

          const user: User = { id, email: userEmail, userName, name, role, ...rest };

          setAuth((prev) => ({
            ...prev,
            isAuthenticated: true,
            token: newToken,
            user,
          }));

          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(user));
          return;
        }
      } catch (loginError: any) {
        console.log('User not found, attempting to register:', loginError.message);
      }

      const response = await instance.post('/api/Auth/Register', {
        name: googleData.name,
        username: googleData.name.replace(/\s+/g, '').toLowerCase(),
        email: googleData.email,
        password: googleData.id,
      });
      const { token: newToken, isAuthenticated } = response.data;

      if (!isAuthenticated) {
        throw new Error('Google registration failed');
      }

      const decodedUser = decodeJWT(newToken);

      if (isTokenExpired(decodedUser.exp)) {
        throw new Error('Token expired');
      }

      const { id, email: userEmail, userName, name, role, ...rest } = decodedUser;

      const user: User = { id, email: userEmail, userName, name, role, ...rest };

      setAuth((prev) => ({
        ...prev,
        isAuthenticated: true,
        token: newToken,
        user,
      }));

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error: any) {
      console.error('Google login/registration failed:', error);
      throw new Error(error.response?.data?.message || 'Google login/registration failed');
    }
  };

  const logout = () => {
    setAuth((prev) => ({
      ...prev,
      isAuthenticated: false,
      token: null,
      user: null,
    }));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const authValue = {
    auth: {
      ...auth,
      login,
      register,
      googleLogin,
      logout,
    },
    setAuth,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;