import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';
import { UserRole } from '@shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, userDoc, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background,#0e1114)] p-6">
        <div className="w-full max-w-md space-y-4 animate-pulse">
          <div className="h-8 bg-white/10 rounded-md w-1/3 mx-auto"></div>
          <div className="h-4 bg-white/5 rounded-md w-2/3 mx-auto"></div>
          <div className="h-48 bg-white/5 rounded-xl border border-white/10 p-6 space-y-3">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-10 bg-white/10 rounded w-full mt-6"></div>
          </div>
          <p className="text-center font-mono text-xs text-[var(--muted-foreground,#8b9698)]">
            Verifying cryptographic credentials...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated at all -> redirect to login
  if (!user) {
    return <Redirect to={redirectTo} />;
  }

  // Authenticated, but user record missing or role not permitted -> redirect home
  if (!userDoc || !allowedRoles.includes(userDoc.role)) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
