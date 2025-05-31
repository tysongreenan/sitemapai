// src/components/layout/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; //

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth(); //
  const navigate = useNavigate(); //

  useEffect(() => {
    // Only navigate if loading is false, meaning the initial auth check is complete.
    // If loading is true, we are still checking the session, so don't redirect yet.
    if (!loading && !user) { //
      navigate('/', { replace: true }); //
    }
  }, [user, loading, navigate]); //

  // While loading, show a spinner.
  // Once loading is false, if user is null, the useEffect above will redirect.
  // If user is not null, it will render children.
  if (loading) { //
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not loading and user exists, render children.
  // If not loading and user does not exist, the useEffect above has already redirected.
  return user ? <>{children}</> : null; //
}