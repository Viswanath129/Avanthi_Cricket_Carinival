import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';

type LoginRole = 'SUPER_ADMIN' | 'ADMIN' | 'FRANCHISE' | 'PLAYER' | null;

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<LoginRole>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, userDoc, loading, signIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && userDoc) {
      switch (userDoc.role) {
        case 'SUPER_ADMIN':
        case 'ADMIN':
          setLocation('/admin');
          break;
        case 'FRANCHISE_COORDINATOR':
        case 'FRANCHISE_TEAM_LEADER':
          setLocation('/franchise');
          break;
        case 'PLAYER':
          setLocation('/player');
          break;
        default:
          setLocation('/');
      }
    }
  }, [user, userDoc, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
        <span className="font-mono text-sm text-[var(--muted-foreground)]">Authenticating...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            {selectedRole ? 'Sign In' : 'Select Role'}
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            {selectedRole ? `Continue as ${selectedRole.replace('_', ' ')}` : 'Choose your account type to proceed'}
          </p>
        </div>

        {!selectedRole ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedRole('SUPER_ADMIN')}
              className="w-full p-4 border border-[var(--border)] rounded-sm bg-[var(--card)] hover:border-[var(--primary)] text-left transition-colors flex items-center justify-between group"
            >
              <span className="font-display font-medium text-white group-hover:text-[var(--primary)]">SUPER ADMIN</span>
              <span className="font-mono text-xs text-[var(--muted-foreground)] group-hover:text-[var(--primary)]">SYSTEM</span>
            </button>
            <button
              onClick={() => setSelectedRole('ADMIN')}
              className="w-full p-4 border border-[var(--border)] rounded-sm bg-[var(--card)] hover:border-[var(--primary)] text-left transition-colors flex items-center justify-between group"
            >
              <span className="font-display font-medium text-white group-hover:text-[var(--primary)]">ADMIN / HANDLER</span>
              <span className="font-mono text-xs text-[var(--muted-foreground)] group-hover:text-[var(--primary)]">MANAGEMENT</span>
            </button>
            <button
              onClick={() => setSelectedRole('FRANCHISE')}
              className="w-full p-4 border border-[var(--border)] rounded-sm bg-[var(--card)] hover:border-[var(--orange)] text-left transition-colors flex items-center justify-between group"
            >
              <span className="font-display font-medium text-white group-hover:text-[var(--orange)]">FRANCHISE</span>
              <span className="font-mono text-xs text-[var(--muted-foreground)] group-hover:text-[var(--orange)]">BIDDER</span>
            </button>
            <button
              onClick={() => setSelectedRole('PLAYER')}
              className="w-full p-4 border border-[var(--border)] rounded-sm bg-[var(--card)] hover:border-[var(--green)] text-left transition-colors flex items-center justify-between group"
            >
              <span className="font-display font-medium text-white group-hover:text-[var(--green)]">PLAYER</span>
              <span className="font-mono text-xs text-[var(--muted-foreground)] group-hover:text-[var(--green)]">PARTICIPANT</span>
            </button>
            
            <div className="pt-4 border-t border-[var(--border)] text-center">
              <Link href="/">
                <span className="font-mono text-sm text-[var(--muted-foreground)] hover:text-white transition-colors cursor-pointer inline-block mt-2">
                  CONTINUE AS PUBLIC
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-mono text-xs text-[var(--muted-foreground)] uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-transparent border border-[var(--border)] rounded-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-xs text-[var(--muted-foreground)] uppercase">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-transparent border border-[var(--border)] rounded-sm text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
                  required
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 border border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)] text-sm rounded-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'AUTHENTICATING...' : 'LOGIN'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSelectedRole(null);
                  setError('');
                }}
                className="w-full py-3 border border-[var(--border)] text-[var(--muted-foreground)] font-medium rounded-sm hover:text-white hover:border-[var(--muted-foreground)] transition-colors"
              >
                BACK TO ROLES
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
