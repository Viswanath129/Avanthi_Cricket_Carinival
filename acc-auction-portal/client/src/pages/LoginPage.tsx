import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Shield, Users, User, ArrowRight, RefreshCw, KeyRound, AlertCircle, CheckCircle2, Lock, ExternalLink } from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'PLAYER' | 'FRANCHISE' | 'ADMIN'>('PLAYER');

  // Admin form state
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    user, 
    userDoc, 
    authState, 
    loading, 
    unregisteredGoogleUser, 
    signInWithGoogle, 
    signInAdmin, 
    switchGoogleAccount, 
    sendAdminPasswordReset, 
    refreshUserDoc, 
    clearUnregisteredGoogleUser, 
    signOut 
  } = useAuth();

  const [, setLocation] = useLocation();

  // Automatic routing upon authenticated and active role resolution
  useEffect(() => {
    if (user && userDoc) {
      const status = userDoc.accountStatus || (userDoc.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
      if (status === 'ACTIVE' || status === 'APPROVED') {
        switch (userDoc.role) {
          case 'SUPER_ADMIN':
            setLocation('/admin');
            break;
          case 'ADMIN':
            setLocation('/operator');
            break;
          case 'FRANCHISE_COORDINATOR':
          case 'FRANCHISE_TEAM_LEADER':
            setLocation('/franchise/bid');
            break;
          case 'PLAYER':
            setLocation('/player');
            break;
          default:
            setLocation('/');
        }
      }
    }
  }, [user, userDoc, setLocation]);

  // Google Login Handler for Player & Franchise
  const handleGoogleSignIn = async (roleIntent: 'PLAYER' | 'FRANCHISE') => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      const res = await signInWithGoogle(roleIntent);
      if (res.success && res.userDoc) {
        // Redirection will occur naturally via useEffect
      }
    } catch (err: any) {
      setLocalError(err.message || 'Google authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Email & Password Login Handler
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!adminIdentifier.trim()) {
      setLocalError('Please enter your administrator username or email.');
      return;
    }
    if (!adminPassword.trim()) {
      setLocalError('Please enter your administrator password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInAdmin(adminIdentifier, adminPassword);
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password reset handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!resetEmail.trim()) {
      setLocalError('Please enter your registered email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendAdminPasswordReset(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render "GOOGLE ACCOUNT NOT REGISTERED" Screen (Point 23)
  if (authState === 'UNREGISTERED_GOOGLE' && unregisteredGoogleUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-white">Google Account Not Registered</h1>
            <p className="text-xs text-slate-400">
              Authenticated Identity: <span className="font-mono text-amber-400 font-semibold">{unregisteredGoogleUser.email}</span>
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 text-xs text-amber-200/90 leading-relaxed">
              This Google identity proves who you are, but it is not linked to any active ACC 2026 player profile or authorized franchise.
              Arbitrary Google logins do not automatically receive role privileges.
            </div>

            <div className="space-y-3 pt-2">
              <Link href="/player/register">
                <button className="w-full min-h-[48px] px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40">
                  <span>Register as ACC Player</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <Link href="/franchise/register">
                <button className="w-full min-h-[48px] px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40">
                  <span>Register New Franchise Team</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <button 
                onClick={() => switchGoogleAccount(activeTab === 'ADMIN' ? 'PLAYER' : activeTab)}
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-600/60 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Use Another Google Account</span>
              </button>

              <button 
                onClick={signOut}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 pt-2 transition-colors"
              >
                Cancel & Return to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render "ACCOUNT PENDING ADMIN APPROVAL" Screen (Points 7, 22)
  if (authState === 'PENDING_APPROVAL' && userDoc) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-white">Account Pending Approval</h1>
            <p className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-semibold">
              ACC 2026 \u00B7 Verification in Progress
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Account Role:</span>
                <span className="font-mono font-bold text-white">{userDoc.role}</span>
              </div>
              {userDoc.playerId && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Player ID / Roll:</span>
                  <span className="font-mono font-bold text-emerald-400">{userDoc.playerId}</span>
                </div>
              )}
              {userDoc.franchiseId && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Franchise ID:</span>
                  <span className="font-mono font-bold text-blue-400">{userDoc.franchiseId}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-400">
                <span>Approval Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {userDoc.approvalStatus || 'PENDING_APPROVAL'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Authenticated Email:</span>
                <span className="font-mono text-slate-300">{user?.email}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed text-center">
              Your identity has been authenticated via Google. Full portal access is unlocked once your registration is reviewed and approved by the Super Admin or Tournament Directorate.
            </p>

            <div className="space-y-3 pt-2">
              <button 
                onClick={refreshUserDoc}
                className="w-full min-h-[46px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Approval Status</span>
              </button>

              <button 
                onClick={signOut}
                className="w-full min-h-[44px] px-4 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-600/60 transition-all"
              >
                Sign Out / Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render "ACCOUNT SUSPENDED / BLOCKED" Screen (Point 22)
  if (authState === 'BLOCKED' && userDoc) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-2">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-white">Account Suspended</h1>
            <p className="text-xs uppercase tracking-widest font-mono text-rose-400 font-semibold">
              Access Restricted
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl backdrop-blur-xl">
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 text-xs text-rose-200/90 leading-relaxed">
              This account has been flagged, disabled, or archived by tournament administration. 
              Further dashboard actions and bidding access are suspended.
            </div>

            <button 
              onClick={signOut}
              className="w-full min-h-[46px] px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-serif font-bold text-lg flex items-center justify-center shadow-sm">
              ACC
            </span>
            <span className="font-serif font-bold text-xl tracking-tight text-white">
              Avanthi Cricket Carnival
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl text-white">
            SIGN IN
          </h1>
          <p className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-semibold">
            ACC 2026 \u00B7 Unified Auction Terminal
          </p>
        </div>

        {/* Card Surface */}
        <div className="backdrop-blur-2xl bg-slate-800/85 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 space-y-6">
          {/* Role Navigation Selector Tabs: Intent Selection Only (Point 19 & 20) */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900/80 border border-slate-700/50 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('PLAYER'); setLocalError(null); }}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'PLAYER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>PLAYER</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('FRANCHISE'); setLocalError(null); }}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'FRANCHISE'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>FRANCHISE</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('ADMIN'); setLocalError(null); }}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ADMIN'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </button>
          </div>

          {/* Error Banner */}
          {localError && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{localError}</span>
            </div>
          )}

          {/* PLAYER TAB CONTENT (Google Auth Only) */}
          {activeTab === 'PLAYER' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-4 text-xs text-emerald-200/90 leading-relaxed">
                <span className="font-bold text-white">PLAYER AUTHENTICATION: </span>
                Sign in with your authorized Google account linked to your college roll number during player registration.
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('PLAYER')}
                  disabled={isSubmitting || loading}
                  className="w-full min-h-[50px] px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{isSubmitting ? 'Authenticating...' : 'Continue with Google'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-700/60 text-center">
                <p className="text-xs text-slate-400">
                  First time player?{' '}
                  <Link href="/player/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Register for ACC 2026 \u2192
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* FRANCHISE TAB CONTENT (Google Auth Only) */}
          {activeTab === 'FRANCHISE' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-blue-950/30 border border-blue-800/50 rounded-2xl p-4 text-xs text-blue-200/90 leading-relaxed">
                <span className="font-bold text-white">FRANCHISE TERMINAL AUTH: </span>
                Faculty Coordinators (Primary Login) and authorized Team Leaders sign in with their registered Google account linked to their franchise.
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('FRANCHISE')}
                  disabled={isSubmitting || loading}
                  className="w-full min-h-[50px] px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{isSubmitting ? 'Authenticating...' : 'Continue with Google'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-700/60 text-center">
                <p className="text-xs text-slate-400">
                  New franchise coordinator?{' '}
                  <Link href="/franchise/register" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    Register Departmental Franchise \u2192
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ADMIN TAB CONTENT (Dedicated Email/Password Only - NO Google Auth) */}
          {activeTab === 'ADMIN' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-4 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold text-white">ADMINISTRATIVE DIRECTORY: </span>
                Tournament Directors & Auction Floor Handlers authenticate through dedicated enterprise credentials. Google Sign-In is intentionally blocked from administrative elevation.
              </div>

              <form onSubmit={handleAdminSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Admin Username or Email
                  </label>
                  <input
                    type="text"
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    placeholder="e.g. superadmin@acc.edu or handler"
                    autoComplete="username"
                    required
                    className="w-full min-h-[48px] px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setForgotPasswordOpen(true); setResetSent(false); }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                      autoComplete="current-password"
                      required
                      className="w-full min-h-[48px] px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-inner pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-semibold px-2 py-1"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full min-h-[48px] px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-950/40 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Public Access Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            \u2190 Return to Public Home (No login required)
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal (Firebase sendPasswordResetEmail) */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="font-serif font-bold text-lg text-white">Reset Admin Password</h3>
              <button 
                onClick={() => setForgotPasswordOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                \u2715
              </button>
            </div>

            {resetSent ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs leading-relaxed">
                  A real Firebase password reset link has been dispatched to <span className="font-mono font-bold text-white">{resetEmail}</span>. Please check your inbox and spam folder.
                </div>
                <button
                  onClick={() => setForgotPasswordOpen(false)}
                  className="w-full min-h-[44px] px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Enter your registered administrator email address to receive an official Firebase recovery link.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. director@acc.edu"
                    required
                    className="w-full min-h-[46px] px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-600/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Recovery Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
