import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingScreen } from './LoadingScreen';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if auth is fully initialized and there's no user
    if (initialized && !loading && !user) {
      console.log('🔒 No authenticated user, redirecting to landing page');
      navigate('/', { replace: true });
    }
  }, [user, loading, initialized, navigate]);

  // Show loading screen while auth is initializing or loading
  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  // If auth is initialized and we have a user, render children
  // If no user, the useEffect will handle the redirect
  return user ? <>{children}</> : <LoadingScreen />;
}