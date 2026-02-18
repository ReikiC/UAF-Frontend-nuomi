import { useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authStore } from '@/stores/auth.store';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, accessToken } = authStore();

  // Check if tokens exist in localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken && !accessToken) {
      authStore.setState({
        accessToken: storedToken,
        isAuthenticated: true,
      });
    }
  }, [accessToken]);

  if (!isAuthenticated && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
