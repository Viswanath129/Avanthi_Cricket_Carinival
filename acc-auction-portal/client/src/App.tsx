import { useState } from "react";
import { Switch, Route, Link, useLocation, Redirect } from "wouter";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { BlueAnimatedBackground } from "./components/BlueAnimatedBackground";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import PlayerBoardPage from "./pages/PlayerBoardPage";
import TeamsBoardPage from "./pages/TeamsBoardPage";
import LiveAuctionPage from "./pages/LiveAuctionPage";
import AdminAuctionPage from "./pages/AdminAuctionPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLiveDashboard from "./pages/AdminLiveDashboard";
import FranchiseBiddingPage from "./pages/FranchiseBiddingPage";
import FranchiseRegistrationPage from "./pages/FranchiseRegistrationPage";
import PlayerRegistrationPage from "./pages/PlayerRegistrationPage";
import PlayerDashboardPage from "./pages/PlayerDashboardPage";
import ProjectorPage from "./pages/ProjectorPage";

export const PublicHeader = () => {
  const [edition, setEdition] = useState("2026");
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)] p-4 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <a href="/" className="font-display font-bold text-xl tracking-tight text-white hover:opacity-90 transition-opacity">
            ACC {edition}
          </a>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-xs">
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">EDITION:</span>
            <select
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="2026" className="bg-slate-900 text-white">ACC 2026</option>
              <option value="2027" className="bg-slate-900 text-white">ACC 2027</option>
            </select>
          </div>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6 font-medium text-xs sm:text-sm text-[var(--muted-foreground)] flex-wrap">
          <a href="/players" className="hover:text-white transition-colors">PLAYERS</a>
          <a href="/teams" className="hover:text-white transition-colors">TEAMS</a>
          <a href="/live" className="hover:text-white transition-colors">LIVE AUCTION</a>
          <a href="/register" className="hover:text-white transition-colors text-emerald-400 font-semibold">REGISTER</a>
          <a href="/franchise/register" className="hover:text-white transition-colors text-amber-400 font-semibold">FRANCHISE REG</a>
          <a href="/projector" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">PROJECTOR ↗</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="/login">
            <button className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-1.5 rounded-sm font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity">
              LOGIN
            </button>
          </a>
        </div>
      </div>
    </header>
  );
};


const PlayerProfilePage = () => {
  const { user, userDoc, signOut } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] p-4 sticky top-0 z-10 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="font-display font-bold text-xl tracking-tight text-white">ACC 2026</a>
          <div className="flex gap-4 items-center">
            <span className="text-xs text-[var(--muted-foreground)]">{user?.email}</span>
            <button
              onClick={() => { signOut(); navigate('/'); }}
              className="text-xs text-red-400 font-semibold hover:text-red-300"
            >
              SIGN OUT
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="font-display text-2xl font-bold text-white mb-6">Player Dashboard</h1>
        {userDoc?.playerId ? (
          <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-6">
            <p className="text-sm text-[var(--muted-foreground)] mb-2">Player ID</p>
            <p className="font-mono text-sm text-white mb-6">{userDoc.playerId}</p>
            <p className="text-green-400 text-sm font-semibold">Registration submitted</p>
          </div>
        ) : (
          <div className="border border-dashed border-[var(--border)] rounded-sm p-8 text-center">
            <p className="text-[var(--muted-foreground)] mb-4">You haven't registered as a player yet.</p>
            <a href="/player/register">
              <button className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2.5 rounded-sm font-semibold text-sm">
                Register Now
              </button>
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

const FranchiseDashboardPage = () => {
  const { user, userDoc, signOut } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] p-4 sticky top-0 z-10 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="font-display font-bold text-xl tracking-tight text-white">ACC 2026</a>
          <div className="flex gap-4 items-center">
            <span className="text-xs text-[var(--muted-foreground)]">{user?.email}</span>
            <button
              onClick={() => { signOut(); navigate('/'); }}
              className="text-xs text-red-400 font-semibold hover:text-red-300"
            >
              SIGN OUT
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="font-display text-2xl font-bold text-white mb-6">Franchise Dashboard</h1>
        <div className="grid gap-4">
          <a href="/franchise/bid" className="block">
            <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-6 hover:border-[var(--accent)] transition-colors">
              <h2 className="font-display font-bold text-white mb-1">Live Bidding</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Join the live auction and bid on players</p>
            </div>
          </a>
          <div className="border border-[var(--border)] rounded-sm bg-[var(--card)] p-6">
            <h2 className="font-display font-bold text-white mb-1">Squad Overview</h2>
            <p className="text-xs text-[var(--muted-foreground)]">View your current squad, purse, and bucket status</p>
            <p className="font-mono text-xs text-[var(--muted-foreground)] mt-2">
              Franchise: {userDoc?.franchiseId || 'Not linked'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

const RootRoute = () => {
  const { user, userDoc, loading } = useAuth();

  // 1. If Firebase Auth is still resolving on initial boot, show smooth glass restoration UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-display font-bold text-sm text-slate-800 dark:text-white tracking-wide uppercase">
            ACC 2026 · Restoring Session...
          </span>
          <span className="font-mono text-xs text-slate-500">
            Verifying server-authoritative credentials
          </span>
        </div>
      </div>
    );
  }

  // 2. If authenticated, route directly to the authoritative dashboard
  if (user && userDoc) {
    const accStatus = userDoc.accountStatus || (userDoc.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
    if (accStatus === 'ACTIVE' || accStatus === 'APPROVED') {
      if (userDoc.role === 'SUPER_ADMIN') return <Redirect to="/admin" />;
      if (userDoc.role === 'ADMIN') return <Redirect to="/operator" />;
      if (userDoc.role === 'FRANCHISE_COORDINATOR' || userDoc.role === 'FRANCHISE_TEAM_LEADER') return <Redirect to="/franchise" />;
      if (userDoc.role === 'PLAYER') return <Redirect to="/player" />;
    }
  }

  // 3. Unauthenticated root route renders intended public portal
  return <Home />;
};

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={RootRoute} />
      <Route path="/players" component={PlayerBoardPage} />
      <Route path="/teams" component={TeamsBoardPage} />
      <Route path="/live" component={LiveAuctionPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/projector" component={ProjectorPage} />
      <Route path="/franchise/register" component={FranchiseRegistrationPage} />
      <Route path="/register" component={PlayerRegistrationPage} />

      {/* Admin & Operator Live Dashboards */}
      <Route path="/admin">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=admin">
          <AdminLiveDashboard mode="SUPER_ADMIN" />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/admin">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=admin">
          <AdminLiveDashboard mode="SUPER_ADMIN" />
        </ProtectedRoute>
      </Route>
      <Route path="/operator">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=admin">
          <AdminLiveDashboard mode="OPERATOR" />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/operator">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=admin">
          <AdminLiveDashboard mode="OPERATOR" />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/auction">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=admin">
          <AdminLiveDashboard mode="SUPER_ADMIN" />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/admin/auction">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=admin">
          <AdminLiveDashboard mode="SUPER_ADMIN" />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/management">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']} redirectTo="/login?mode=admin">
          <AdminDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/admin/management">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']} redirectTo="/login?mode=admin">
          <AdminDashboardPage />
        </ProtectedRoute>
      </Route>

      {/* Franchise Routes */}
      <Route path="/franchise">
        <ProtectedRoute allowedRoles={['FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER']} redirectTo="/login?mode=franchise">
          <FranchiseDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/franchise">
        <ProtectedRoute allowedRoles={['FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER']} redirectTo="/login?mode=franchise">
          <FranchiseDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/franchise/bid">
        <ProtectedRoute allowedRoles={['FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER']} redirectTo="/login?mode=franchise">
          <FranchiseBiddingPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/franchise/bid">
        <ProtectedRoute allowedRoles={['FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER']} redirectTo="/login?mode=franchise">
          <FranchiseBiddingPage />
        </ProtectedRoute>
      </Route>

      {/* Player Routes */}
      <Route path="/player">
        <ProtectedRoute allowedRoles={['PLAYER', 'SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=player">
          <PlayerDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/player">
        <ProtectedRoute allowedRoles={['PLAYER', 'SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=player">
          <PlayerDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/player/dashboard">
        <ProtectedRoute allowedRoles={['PLAYER', 'SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=player">
          <PlayerDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/player/dashboard">
        <ProtectedRoute allowedRoles={['PLAYER', 'SUPER_ADMIN', 'ADMIN']} redirectTo="/login?mode=player">
          <PlayerDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/player/register" component={PlayerRegistrationPage} />
      <Route path="/portal/register" component={PlayerRegistrationPage} />

      {/* 404 */}
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="text-center">
            <h1 className="font-display text-6xl font-bold text-white mb-4">404</h1>
            <p className="text-[var(--muted-foreground)] mb-6">Page not found</p>
            <a href="/" className="text-sm text-[var(--primary)] font-semibold hover:underline">
              Return Home
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="relative min-h-screen text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
        <BlueAnimatedBackground />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Router />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
