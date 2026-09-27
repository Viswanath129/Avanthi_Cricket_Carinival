import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';
import { UserRole } from '@shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userDoc, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="font-mono text-sm text-[var(--muted-foreground)]">Loading...</span></div>;
  if (!user) return <Redirect to="/login" />;
  if (userDoc && !allowedRoles.includes(userDoc.role)) return <Redirect to="/" />;
  
  return <>{children}</>;
}
