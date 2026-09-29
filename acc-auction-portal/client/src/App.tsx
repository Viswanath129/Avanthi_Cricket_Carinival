import { Switch, Route, Link, useLocation } from "wouter";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import PlayerBoardPage from "./pages/PlayerBoardPage";
import TeamsBoardPage from "./pages/TeamsBoardPage";
import LiveAuctionPage from "./pages/LiveAuctionPage";
import AdminAuctionPage from "./pages/AdminAuctionPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import FranchiseBiddingPage from "./pages/FranchiseBiddingPage";
import FranchiseRegistrationPage from "./pages/FranchiseRegistrationPage";
import PlayerRegistrationPage from "./pages/PlayerRegistrationPage";
import ProjectorPage from "./pages/ProjectorPage";

const PublicHeader = () => (
  <header className="border-b border-[var(--border)] bg-[var(--background)] p-4 sticky top-0 z-10">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <a href="/" className="font-display font-bold text-xl tracking-tight text-white">
        ACC 2026
      </a>
      <nav className="flex gap-6 font-medium text-sm text-[var(--muted-foreground)]">
        <a href="/players" className="hover:text-white transition-colors">Players</a>
        <a href="/teams" className="hover:text-white transition-colors">Teams</a>
        <a href="/live" className="hover:text-white transition-colors">Live Auction</a>
      </nav>
      <a href="/login">
        <button className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-sm font-semibold text-sm">
          LOGIN
        </button>
      </a>
    </div>
  </header>
);

const HomePage = () => (
  <div className="min-h-screen flex flex-col bg-[var(--background)]">
    <PublicHeader />
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-white">
          ACC 2026
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] uppercase tracking-widest font-mono">
          Avanthi Cricket Carnival \u2014 Auction Portal
        </p>
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/players">
            <button className="w-full sm:w-auto px-8 py-3 border border-[var(--border)] text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition-colors">
              View Players
            </button>
          </a>
          <a href="/teams">
            <button className="w-full sm:w-auto px-8 py-3 border border-[var(--border)] text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition-colors">
              View Teams
            </button>
          </a>
          <a href="/live">
            <button className="w-full sm:w-auto px-8 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold rounded-sm hover:opacity-90 transition-opacity">
              Live Auction
            </button>
          </a>
        </div>
      </div>
    </main>
    <footer className="border-t border-[var(--border)] py-4 text-center">
      <p className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">
        ACC 2026{'\u201327'} {'\u00B7'} Server-Authoritative Auction System
      </p>
    </footer>
  </div>
);

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

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/players" component={PlayerBoardPage} />
      <Route path="/teams" component={TeamsBoardPage} />
      <Route path="/live" component={LiveAuctionPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/projector" component={ProjectorPage} />
      <Route path="/franchise/register" component={FranchiseRegistrationPage} />
      <Route path="/register" component={PlayerRegistrationPage} />

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
          <AdminDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/auction">
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
          <AdminAuctionPage />
        </ProtectedRoute>
      </Route>

      {/* Franchise Routes */}
      <Route path="/franchise">
        <ProtectedRoute allowedRoles={['FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER']}>
          <FranchiseDashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/franchise/bid">
        <ProtectedRoute allowedRoles={['FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER']}>
          <FranchiseBiddingPage />
        </ProtectedRoute>
      </Route>

      {/* Player Routes */}
      <Route path="/player">
        <ProtectedRoute allowedRoles={['PLAYER']}>
          <PlayerProfilePage />
        </ProtectedRoute>
      </Route>
      <Route path="/player/register">
        <ProtectedRoute allowedRoles={['PLAYER']}>
          <PlayerRegistrationPage />
        </ProtectedRoute>
      </Route>

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
      <Router />
    </AuthProvider>
  );
}

export default App;
