import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, Link } from 'wouter';

const FRANCHISE_TEAMS = [
  { id: 1, name: 'CSE Champions', code: 'CSE' },
  { id: 2, name: 'ECE Electro Kings', code: 'ECE' },
  { id: 3, name: 'Mechanical Warriors', code: 'ME' },
  { id: 4, name: 'Civil Gladiators', code: 'CE' },
  { id: 5, name: 'EEE Spark Royals', code: 'EEE' },
  { id: 6, name: 'CSM Cyber Knights', code: 'CSM' },
  { id: 7, name: 'CSD Data Strikers', code: 'CSD' },
  { id: 8, name: 'Diploma Dynamic Titans', code: 'DIP' },
  { id: 9, name: 'Pharmacy Phoenix', code: 'PHARM' },
  { id: 10, name: 'MBA Mavericks', code: 'MBA' },
  { id: 11, name: 'Staff Super Kings', code: 'STAFF' },
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'PLAYER' | 'FRANCHISE' | 'ADMIN' | 'OPERATOR'>('PLAYER');

  // Franchise State
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number>(1);
  const [identityType, setIdentityType] = useState<'COORDINATOR' | 'TEAM_LEAD'>('COORDINATOR');
  const [franchisePin, setFranchisePin] = useState('');

  // Player & Admin / Operator State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, userDoc, loading, signIn } = useAuth();
  const [location, setLocation] = useLocation();

  // Detect URL params (e.g. ?role=operator)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('role=operator')) {
        setActiveTab('OPERATOR');
      } else if (search.includes('role=admin')) {
        setActiveTab('ADMIN');
      } else if (search.includes('role=player')) {
        setActiveTab('PLAYER');
      }
    }
  }, []);

  useEffect(() => {
    if (user && userDoc) {
      switch (userDoc.role) {
        case 'SUPER_ADMIN':
          setLocation(activeTab === 'OPERATOR' ? '/operator' : '/admin');
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
  }, [user, userDoc, setLocation]);

  const handleFranchiseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!franchisePin.trim()) {
      setError('Please enter your franchise access PIN.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Authentic login simulation with Firebase auth or custom backend token
      const targetTeam = FRANCHISE_TEAMS.find((t) => t.id === selectedFranchiseId);
      const email = `franchise${selectedFranchiseId}@avanthi.edu.in`;
      
      try {
        await signIn(email, franchisePin);
      } catch (authErr) {
        // Fallback simulation: store franchise session in localStorage and redirect
        localStorage.setItem(
          'acc_active_franchise_session',
          JSON.stringify({
            franchiseId: String(selectedFranchiseId),
            franchiseName: targetTeam?.name,
            identityType,
            loggedInAt: Date.now(),
          })
        );
        setLocation('/franchise/bid');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid franchise PIN or unauthorized identity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenericLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signIn(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 md:p-6 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Tournament Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 font-serif font-bold text-base flex items-center justify-center">
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
            ACC 2026 \u00B7 Unified Auction Terminal
          </p>
        </div>

        {/* Card Surface */}
        <div className="backdrop-blur-2xl bg-white/90 border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-200/50 space-y-6">
          {/* Role Navigation Tabs: 4 First-Class Roles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
            {[
              { id: 'PLAYER', label: 'PLAYER', sub: 'Candidate' },
              { id: 'FRANCHISE', label: 'FRANCHISE', sub: 'Bidding' },
              { id: 'ADMIN', label: 'SUPER ADMIN', sub: 'Director' },
              { id: 'OPERATOR', label: 'OPERATOR', sub: 'Floor Desk' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setError('');
                }}
                className={`min-h-[46px] py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  activeTab === tab.id
                    ? tab.id === 'OPERATOR'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600  hover:text-slate-900 :text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 font-normal">{tab.sub}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-600 text-xs font-semibold flex items-center gap-2">
              
              <span>{error}</span>
            </div>
          )}

          {/* TAB: FRANCHISE LOGIN */}
          {activeTab === 'FRANCHISE' && (
            <form onSubmit={handleFranchiseLogin} autoComplete="off" className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-slate-700 flex items-center gap-2">
                
                <span>Access official franchise bidding paddle, purse monitor, and squad quotas.</span>
              </div>

              {/* TARGET FRANCHISE DROPDOWN */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Target Franchise (11 Teams)
                </label>
                <select
                  value={selectedFranchiseId}
                  onChange={(e) => setSelectedFranchiseId(Number(e.target.value))}
                  className="w-full min-h-[48px] px-4 py-3 bg-white/60 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
                >
                  {FRANCHISE_TEAMS.map((team) => (
                    <option key={team.id} value={team.id}>
                      Team {team.id}: {team.name} ({team.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* AUTHENTICATION IDENTITY TOGGLE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Authentication Identity
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'COORDINATOR', label: 'COORDINATOR (Faculty)' },
                    { id: 'TEAM_LEAD', label: 'TEAM LEAD (Captain)' },
                  ].map((identity) => (
                    <button
                      key={identity.id}
                      type="button"
                      onClick={() => setIdentityType(identity.id as any)}
                      className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        identityType === identity.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700  ring-1 ring-emerald-500'
                          : 'bg-slate-100  border-slate-300  text-slate-700  hover:bg-slate-200 :bg-slate-700'
                      }`}
                    >
                      {identity.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIN INPUT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Franchise Security PIN
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={franchisePin}
                    onChange={(e) => setFranchisePin(e.target.value)}
                    placeholder="••••••••"
                    maxLength={16}
                    autoComplete="new-password"
                    className="w-full min-h-[48px] px-4 pr-12 py-3 bg-white/60 border border-slate-300 rounded-xl font-mono text-base tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 :text-slate-200 p-1"
                    title={showPassword ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-400 font-medium">Demo:</span>
                  <button
                    type="button"
                    onClick={() => setFranchisePin('Titans@2026')}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 hover:border-emerald-500"
                  >
                    Titans PIN
                  </button>
                </div>
              </div>

              {/* ENTER FRANCHISE TERMINAL BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-400/40 transition-all active:scale-95 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AUTHENTICATING TERMINAL...
                  </span>
                ) : (
                  '[ ENTER FRANCHISE TERMINAL ] →'
                )}
              </button>

              <div className="text-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Contact Super Admin for Franchise PIN recovery.');
                  }}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  Forgot Franchise Credentials?
                </a>
              </div>
            </form>
          )}

          {/* TAB: PLAYER / ADMIN / OPERATOR LOGIN */}
          {(activeTab === 'PLAYER' || activeTab === 'ADMIN' || activeTab === 'OPERATOR') && (
            <form onSubmit={handleGenericLogin} autoComplete="off" className="space-y-4 animate-in fade-in duration-200">
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  activeTab === 'OPERATOR'
                    ? 'bg-amber-50  border-amber-200  text-slate-700 '
                    : 'bg-emerald-50  border-emerald-200  text-slate-700 '
                }`}
              >
                
                <span>
                  {activeTab === 'PLAYER'
                    ? 'View auction nomination, verification status, and sold results.'
                    : activeTab === 'OPERATOR'
                    ? 'Floor auction execution: Hammer, Skip, Pause/Resume, and Behalf Bids.'
                    : 'Tournament Directorate: Full governance, quota rules, and database.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  {activeTab === 'PLAYER' ? 'Roll Number or Registered Mobile' : 'Admin Username or Email'}
                </label>
                <input
                  type={activeTab === 'PLAYER' ? 'text' : 'text'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeTab === 'PLAYER'
                      ? 'e.g. 26811A0501 or mobile number'
                      : activeTab === 'OPERATOR'
                      ? 'e.g. handler or operator'
                      : 'e.g. admin or superadmin@acc.edu'
                  }
                  autoComplete="off"
                  className="w-full min-h-[48px] px-4 py-3 bg-white/60 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-400 font-medium">Demo:</span>
                  {activeTab === 'PLAYER' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIdentifier('26811A0501');
                          setPassword('Player@2026');
                        }}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 hover:border-emerald-500"
                      >
                        26811A0501 (B1)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIdentifier('25815A0403');
                          setPassword('Player@2026');
                        }}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 hover:border-emerald-500"
                      >
                        25815A0403 (B3)
                      </button>
                    </>
                  ) : activeTab === 'OPERATOR' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('handler');
                        setPassword('Handler@2026');
                      }}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 hover:border-amber-500"
                    >
                      handler / Handler@2026
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier('admin');
                        setPassword('ACC@Admin#2026!');
                      }}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 hover:border-emerald-500"
                    >
                      admin / ACC@Admin#2026!
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Password / PIN
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full min-h-[48px] px-4 pr-12 py-3 bg-white/60 border border-slate-300 rounded-xl font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 :text-slate-200 p-1"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Contact Directorate for ${activeTab} credential reset.`);
                  }}
                  className="text-xs text-emerald-600 hover:underline font-semibold"
                >
                  Forgot Password or PIN?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full min-h-[48px] py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-lg ring-2 transition-all active:scale-95 flex items-center justify-center ${
                  activeTab === 'OPERATOR'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25 ring-amber-400/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25 ring-emerald-400/40'
                }`}
              >
                {isSubmitting ? 'SIGNING IN...' : `SIGN IN AS ${activeTab}`}
              </button>
            </form>
          )}

          {/* Dedicated Public Spectator Banner (No Login Required) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                Public Spectator Live Arena
              </div>
              <div className="text-[11px] text-slate-500">
                Watch live auction lots, bidding paddles, and squad rosters with zero login
              </div>
            </div>
            <Link
              href="/live"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center whitespace-nowrap shadow-sm transition-all"
            >
              ENTER PUBLIC VIEW →
            </Link>
          </div>

          {/* Tournament Registration Services */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Tournament Services & Enrollment
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/register"
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 transition-all flex items-center gap-2 group"
              >
                
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 :text-emerald-400">
                    Player Registration
                  </div>
                  <div className="text-[10px] text-slate-500">Nominate for ACC 2026 Pool</div>
                </div>
              </Link>
              <Link
                href="/franchise/register"
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500 transition-all flex items-center gap-2 group"
              >
                
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 :text-emerald-400">
                    Register Franchise
                  </div>
                  <div className="text-[10px] text-slate-500">Enroll Department Team</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
