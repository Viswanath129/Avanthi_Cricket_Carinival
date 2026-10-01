import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Link } from 'wouter';
import { UserRole } from '@shared/types';
import { ShieldAlert, Clock, Lock, RefreshCw, ArrowLeft } from 'lucide-react';

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
  const { user, userDoc, loading, refreshUserDoc, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6">
        <div className="flex flex-col items-center space-y-4">
          <img src="/cricket-loader.svg" alt="ACC 2026 Cricket Loader" className="w-48 h-48 drop-shadow-xl" />
          <p className="text-center font-mono text-xs text-slate-400">
            Resolving server-authoritative role & permissions...
          </p>
        </div>
      </div>
    );
  }

  // 1. Not authenticated in Firebase Auth
  if (!user) {
    return <Redirect to={redirectTo} />;
  }

  // 2. Authenticated with Google/Firebase, but no ACC record in /users/{uid}
  if (!userDoc) {
    return <Redirect to="/login" />;
  }

  // 3. Account Suspended / Blocked
  const accountStatus = userDoc.accountStatus || (userDoc.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
  if (accountStatus === 'BLOCKED' || accountStatus === 'DISABLED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-red-900/50 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-white">Account Suspended</h2>
            <p className="text-xs font-mono uppercase tracking-widest text-red-400 font-semibold mt-1">
              ACC 2026 \u00B7 Operational Suspension
            </p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account ({user.email}) has been locked or disabled by tournament administration. You cannot access this dashboard.
          </p>
          <button
            onClick={signOut}
            className="w-full min-h-[46px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // 4. Account Pending Admin Approval (Points 7, 22)
  if (accountStatus === 'PENDING' || userDoc.approvalStatus === 'PENDING_APPROVAL') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-white">Account Pending Approval</h2>
            <p className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold mt-1">
              Status: {userDoc.approvalStatus || 'PENDING_APPROVAL'}
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Account Role:</span>
              <span className="font-mono font-bold text-white">{userDoc.role}</span>
            </div>
            {userDoc.playerId && (
              <div className="flex justify-between text-slate-400">
                <span>Player Roll:</span>
                <span className="font-mono font-bold text-emerald-400">{userDoc.playerId}</span>
              </div>
            )}
            {userDoc.franchiseId && (
              <div className="flex justify-between text-slate-400">
                <span>Franchise ID:</span>
                <span className="font-mono font-bold text-blue-400">{userDoc.franchiseId}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your registration is currently under review by the Tournament Directorate. Protected workspace features will be unlocked once approved.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => refreshUserDoc()}
              className="flex-1 min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={signOut}
              className="flex-1 min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Role mismatch / Unauthorized Workspace (Points 50, 51)
  if (!allowedRoles.includes(userDoc.role)) {
    let targetLink = '/';
    let targetLabel = 'Return Home';
    if (userDoc.role === 'PLAYER') {
      targetLink = '/player';
      targetLabel = 'Go to Player Dashboard';
    } else if (userDoc.role === 'FRANCHISE_COORDINATOR' || userDoc.role === 'FRANCHISE_TEAM_LEADER') {
      targetLink = '/franchise/bid';
      targetLabel = 'Go to Franchise Terminal';
    } else if (userDoc.role === 'SUPER_ADMIN') {
      targetLink = '/admin';
      targetLabel = 'Go to Super Admin Console';
    } else if (userDoc.role === 'ADMIN') {
      targetLink = '/operator';
      targetLabel = 'Go to Operator Desk';
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-white">ACCESS DENIED</h2>
            <p className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold mt-1">
              Role Mismatch & Unauthorized Access
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-left space-y-2">
            <p className="text-slate-400">
              Your authorized database role is <span className="font-mono font-bold text-white">{userDoc.role}</span>.
            </p>
            <p className="text-slate-400">
              This protected route requires: <span className="font-mono font-bold text-rose-400">{allowedRoles.join(', ')}</span>.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link href={targetLink}>
              <button className="w-full min-h-[46px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
                {targetLabel}
              </button>
            </Link>
            <button
              onClick={signOut}
              className="w-full min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-xs rounded-xl transition-all"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
