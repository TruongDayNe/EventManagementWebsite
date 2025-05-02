import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

interface RequiredAuthProps {
  allowedRoles: string[];
}

const RequiredAuth: React.FC<RequiredAuthProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, token } = useAuth();
  const location = useLocation();

  // Helper function to decode JWT and check expiry
  const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
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
      const exp = decoded.exp || 0;
      const currentTime = Math.floor(Date.now() / 1000);
      return exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Check if the user is authenticated and the token is not expired
  const isValidSession = isAuthenticated && token && !isTokenExpired(token);

  // Check if the user has a required role
  const hasRequiredRole = user?.role && allowedRoles.includes(user.role);

  if (!isValidSession) {
    // Redirect to /signin if not authenticated or token is expired
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole) {
    // Redirect to NotFound page if the user lacks the required role
    return <Navigate to="/*" state={{ from: location }} replace />;
  }

  // Render child routes if authorized
  return <Outlet />;
};

export default RequiredAuth;