import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Shield, Users, User, ArrowRight, RefreshCw, KeyRound, AlertCircle, CheckCircle2, Lock, ExternalLink, X } from 'lucide-react';

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

  // Render "GOOGLE ACCOUNT NOT REGISTERED" Screen
  if (authState === 'UNREGISTERED_GOOGLE' && unregisteredGoogleUser) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 md:p-6 font-sans overflow-hidden">
        {/* Ambient Gradient Blur Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-amber-400/15 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-blue-400/12 blur-[110px] pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 mb-2">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-slate-900">Google Account Not Registered</h1>
            <p className="text-xs text-slate-500">
              Authenticated Identity: <span className="font-mono text-amber-700 font-semibold">{unregisteredGoogleUser.email}</span>
            </p>
          </div>

          <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl shadow-slate-900/5">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
              This Google identity proves who you are, but it is not linked to any active ACC 2026 player profile or authorized franchise.
              Arbitrary Google logins do not automatically receive role privileges.
            </div>

            <div className="space-y-3 pt-2">
              <Link href="/player/register">
                <button className="w-full min-h-[48px] px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10">
                  <span>Register as ACC Player</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <Link href="/franchise/register">
                <button className="w-full min-h-[48px] px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-900/10">
                  <span>Register New Franchise Team</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <button 
                onClick={() => switchGoogleAccount(activeTab === 'ADMIN' ? 'PLAYER' : activeTab)}
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Use Another Google Account</span>
              </button>

              <button 
                onClick={signOut}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-2 transition-colors font-medium"
              >
                Cancel & Return to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render "ACCOUNT PENDING ADMIN APPROVAL" Screen
  if (authState === 'PENDING_APPROVAL' && userDoc) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 md:p-6 font-sans overflow-hidden">
        {/* Ambient Gradient Blur Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-emerald-400/15 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-blue-400/12 blur-[110px] pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-slate-900">Account Pending Approval</h1>
            <p className="text-xs uppercase tracking-widest font-mono text-emerald-600 font-semibold">
              ACC 2026 · Verification in Progress
            </p>
          </div>

          <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl shadow-slate-900/5">
            <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Account Role:</span>
                <span className="font-mono font-bold text-slate-900">{userDoc.role}</span>
              </div>
              {userDoc.playerId && (
                <div className="flex justify-between items-center text-slate-500">
                  <span>Player ID / Roll:</span>
                  <span className="font-mono font-bold text-emerald-600">{userDoc.playerId}</span>
                </div>
              )}
              {userDoc.franchiseId && (
                <div className="flex justify-between items-center text-slate-500">
                  <span>Franchise ID:</span>
                  <span className="font-mono font-bold text-blue-600">{userDoc.franchiseId}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-500">
                <span>Approval Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                  {userDoc.approvalStatus || 'PENDING_APPROVAL'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Authenticated Email:</span>
                <span className="font-mono text-slate-700">{user?.email}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed text-center">
              Your identity has been authenticated via Google. Full portal access is unlocked once your registration is reviewed and approved by the Super Admin or Tournament Directorate.
            </p>

            <div className="space-y-3 pt-2">
              <button 
                onClick={refreshUserDoc}
                className="w-full min-h-[46px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Approval Status</span>
              </button>

              <button 
                onClick={signOut}
                className="w-full min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-all"
              >
                Sign Out / Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render "ACCOUNT SUSPENDED / BLOCKED" Screen
  if (authState === 'BLOCKED' && userDoc) {
    return (
      <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 md:p-6 font-sans overflow-hidden">
        {/* Ambient Gradient Blur Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-rose-400/15 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-slate-400/12 blur-[110px] pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 mb-2">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="font-serif font-bold text-2xl text-slate-900">Account Suspended</h1>
            <p className="text-xs uppercase tracking-widest font-mono text-rose-600 font-semibold">
              Access Restricted
            </p>
          </div>

          <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl shadow-slate-900/5">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 leading-relaxed">
              This account has been flagged, disabled, or archived by tournament administration. 
              Further dashboard actions and bidding access are suspended.
            </div>

            <button 
              onClick={signOut}
              className="w-full min-h-[46px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 md:p-6 font-sans overflow-hidden">
      {/* Ambient Gradient Blur Orbs across Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-emerald-400/15 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[560px] h-[560px] rounded-full bg-blue-400/12 blur-[110px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-400/10 blur-[90px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 text-emerald-600 font-serif font-bold text-lg flex items-center justify-center shadow-sm">
              ACC
            </span>
            <span className="font-serif font-bold text-xl tracking-tight text-slate-900">
              Avanthi Cricket Carnival
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl text-slate-900">
            SIGN IN
          </h1>
          <p className="text-xs uppercase tracking-widest font-mono text-emerald-600 font-semibold">
            ACC 2026 · Unified Auction Terminal
          </p>
        </div>

        {/* Minimal Glass Card Surface */}
        <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-900/5 space-y-5">
          {/* Role Navigation Selector Tabs: Intent Selection Only */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('PLAYER'); setLocalError(null); }}
              className={`min-h-[42px] px-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'PLAYER'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
                  ? 'bg-white text-amber-700 shadow-sm border border-amber-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </button>
          </div>

          {/* Error Banner */}
          {localError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{localError}</span>
            </div>
          )}

          {/* PLAYER TAB CONTENT (Google Auth Only) */}
          {activeTab === 'PLAYER' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-900 leading-relaxed flex items-center gap-2.5">
                <User className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>Sign in with your registered Google account to view auction pool & verification status.</span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('PLAYER')}
                  disabled={isSubmitting || loading}
                  className="w-full min-h-[48px] px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-3 border border-slate-300 shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
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

              <div className="pt-2 border-t border-slate-200/80 text-center">
                <p className="text-xs text-slate-500">
                  First time player?{' '}
                  <Link href="/player/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Register for ACC 2026 →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* FRANCHISE TAB CONTENT (Google Auth Only) */}
          {activeTab === 'FRANCHISE' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-900 leading-relaxed flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0 text-blue-700" />
                <span>Faculty Coordinators & Team Leaders sign in with authorized Google credentials.</span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('FRANCHISE')}
                  disabled={isSubmitting || loading}
                  className="w-full min-h-[48px] px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-3 border border-slate-300 shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
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

              <div className="pt-2 border-t border-slate-200/80 text-center">
                <p className="text-xs text-slate-500">
                  New franchise coordinator?{' '}
                  <Link href="/franchise/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Register Departmental Franchise →
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ADMIN TAB CONTENT (Dedicated Email/Password Only - NO Google Auth) */}
          {activeTab === 'ADMIN' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 leading-relaxed flex items-center gap-2.5">
                <Shield className="w-4 h-4 shrink-0 text-amber-700" />
                <span>Tournament Directors & Floor Operators authenticate with verified credentials.</span>
              </div>

              <form onSubmit={handleAdminSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Admin Username or Email
                  </label>
                  <input
                    type="text"
                    value={adminIdentifier}
                    onChange={(e) => setAdminIdentifier(e.target.value)}
                    placeholder="e.g. superadmin@acc.edu or handler"
                    autoComplete="username"
                    required
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setForgotPasswordOpen(true); setResetSent(false); }}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-xs font-semibold px-2 py-1"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-900/10 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
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
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium">
            ← Return to Public Home (No login required)
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal (Firebase sendPasswordResetEmail) */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl shadow-slate-900/10">
            <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900">Reset Admin Password</h3>
              <button 
                onClick={() => setForgotPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSent ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
                  A real Firebase password reset link has been dispatched to <span className="font-mono font-bold text-emerald-950">{resetEmail}</span>. Please check your inbox and spam folder.
                </div>
                <button
                  onClick={() => setForgotPasswordOpen(false)}
                  className="w-full min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered administrator email address to receive an official Firebase recovery link.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. director@acc.edu"
                    required
                    className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl disabled:opacity-50 shadow-sm"
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
