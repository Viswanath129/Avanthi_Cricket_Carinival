import { describe, it, expect } from 'vitest';
import type { UserDoc, UserRole } from '@shared/types';

/**
 * Pure route resolution helpers representing RootRoute and ProtectedRoute logic
 */
export function resolveRootNavigation(
  loading: boolean,
  user: { uid: string; email?: string } | null,
  userDoc: UserDoc | null
): { action: 'RESTORE_SESSION' | 'REDIRECT' | 'RENDER_HOME'; target?: string } {
  if (loading) {
    return { action: 'RESTORE_SESSION' };
  }

  if (user && userDoc) {
    const accStatus = userDoc.accountStatus || (userDoc.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
    if (accStatus === 'ACTIVE' || accStatus === 'APPROVED') {
      if (userDoc.role === 'SUPER_ADMIN') return { action: 'REDIRECT', target: '/admin' };
      if (userDoc.role === 'ADMIN') return { action: 'REDIRECT', target: '/operator' };
      if (userDoc.role === 'FRANCHISE_COORDINATOR' || userDoc.role === 'FRANCHISE_TEAM_LEADER') {
        return { action: 'REDIRECT', target: '/franchise' };
      }
      if (userDoc.role === 'PLAYER') return { action: 'REDIRECT', target: '/player' };
    }
  }

  return { action: 'RENDER_HOME' };
}

export function resolveProtectedRouteAccess(
  currentPath: string,
  allowedRoles: UserRole[],
  redirectTo: string,
  loading: boolean,
  user: { uid: string; email?: string } | null,
  userDoc: UserDoc | null
): { action: 'SHOW_LOADER' | 'REDIRECT' | 'RENDER_CHILDREN'; target?: string; reason?: string } {
  if (loading) {
    // Crucial: Must NEVER redirect to root or login while Firebase Auth is resolving
    return { action: 'SHOW_LOADER' };
  }

  if (!user) {
    return { action: 'REDIRECT', target: redirectTo, reason: 'UNAUTHENTICATED' };
  }

  if (!userDoc) {
    return { action: 'REDIRECT', target: '/login', reason: 'NO_PROFILE' };
  }

  const accountStatus = userDoc.accountStatus || (userDoc.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
  if (accountStatus === 'BLOCKED' || accountStatus === 'DISABLED') {
    return { action: 'REDIRECT', target: '/blocked', reason: 'ACCOUNT_SUSPENDED' };
  }

  if (accountStatus === 'PENDING' || userDoc.approvalStatus === 'PENDING_APPROVAL') {
    return { action: 'REDIRECT', target: '/pending-approval', reason: 'APPROVAL_REQUIRED' };
  }

  if (!allowedRoles.includes(userDoc.role)) {
    return { action: 'REDIRECT', target: redirectTo, reason: 'UNAUTHORIZED_ROLE' };
  }

  return { action: 'RENDER_CHILDREN' };
}

describe('ACC 2026 — Root Route & Hard-Refresh Auth Restoration Verification', () => {
  // AUTH-ROUTE-001
  it('AUTH-ROUTE-001: Auth loading state on / does NOT redirect or render home; shows session restore', () => {
    const result = resolveRootNavigation(true, null, null);
    expect(result.action).toBe('RESTORE_SESSION');
    expect(result.target).toBeUndefined();
  });

  // AUTH-ROUTE-002
  it('AUTH-ROUTE-002: Hard refresh on /player with session loading preserves route and shows loader', () => {
    const result = resolveProtectedRouteAccess(
      '/player',
      ['PLAYER', 'SUPER_ADMIN', 'ADMIN'],
      '/login?mode=player',
      true,
      null,
      null
    );
    expect(result.action).toBe('SHOW_LOADER');
    expect(result.target).toBeUndefined();
  });

  // AUTH-ROUTE-003
  it('AUTH-ROUTE-003: Hard refresh on /franchise with session loading preserves route and shows loader', () => {
    const result = resolveProtectedRouteAccess(
      '/franchise',
      ['FRANCHISE_COORDINATOR', 'FRANCHISE_TEAM_LEADER'],
      '/login?mode=franchise',
      true,
      null,
      null
    );
    expect(result.action).toBe('SHOW_LOADER');
    expect(result.target).toBeUndefined();
  });

  // AUTH-ROUTE-004
  it('AUTH-ROUTE-004: Hard refresh on /admin with session loading preserves route and shows loader', () => {
    const result = resolveProtectedRouteAccess(
      '/admin',
      ['SUPER_ADMIN', 'ADMIN'],
      '/login?mode=admin',
      true,
      null,
      null
    );
    expect(result.action).toBe('SHOW_LOADER');
    expect(result.target).toBeUndefined();
  });

  // AUTH-ROUTE-005
  it('AUTH-ROUTE-005: Authenticated PLAYER on root / redirects deterministically to /player', () => {
    const playerDoc: UserDoc = {
      uid: 'player-uid-1',
      email: 'player@example.com',
      role: 'PLAYER',
      accountStatus: 'ACTIVE',
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      createdAt: 1000
    };
    const result = resolveRootNavigation(false, { uid: 'player-uid-1' }, playerDoc);
    expect(result.action).toBe('REDIRECT');
    expect(result.target).toBe('/player');
  });

  // AUTH-ROUTE-006
  it('AUTH-ROUTE-006: Authenticated FRANCHISE on root / redirects deterministically to /franchise', () => {
    const franchiseDoc: UserDoc = {
      uid: 'franchise-uid-1',
      email: 'team@example.com',
      role: 'FRANCHISE_COORDINATOR',
      franchiseId: '1',
      accountStatus: 'ACTIVE',
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      createdAt: 1000
    };
    const result = resolveRootNavigation(false, { uid: 'franchise-uid-1' }, franchiseDoc);
    expect(result.action).toBe('REDIRECT');
    expect(result.target).toBe('/franchise');
  });

  // AUTH-ROUTE-007
  it('AUTH-ROUTE-007: Authenticated SUPER_ADMIN on root / redirects deterministically to /admin', () => {
    const adminDoc: UserDoc = {
      uid: 'admin-uid-1',
      email: 'admin@avanthi.edu.in',
      role: 'SUPER_ADMIN',
      accountStatus: 'ACTIVE',
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      createdAt: 1000
    };
    const result = resolveRootNavigation(false, { uid: 'admin-uid-1' }, adminDoc);
    expect(result.action).toBe('REDIRECT');
    expect(result.target).toBe('/admin');
  });

  // AUTH-ROUTE-008
  it('AUTH-ROUTE-008: Unauthenticated visitor accessing /player is redirected to /login?mode=player', () => {
    const result = resolveProtectedRouteAccess(
      '/player',
      ['PLAYER', 'SUPER_ADMIN', 'ADMIN'],
      '/login?mode=player',
      false,
      null,
      null
    );
    expect(result.action).toBe('REDIRECT');
    expect(result.target).toBe('/login?mode=player');
    expect(result.reason).toBe('UNAUTHENTICATED');
  });

  // AUTH-ROUTE-009
  it('AUTH-ROUTE-009: Unauthenticated visitor accessing /admin is redirected to /login?mode=admin', () => {
    const result = resolveProtectedRouteAccess(
      '/admin',
      ['SUPER_ADMIN', 'ADMIN'],
      '/login?mode=admin',
      false,
      null,
      null
    );
    expect(result.action).toBe('REDIRECT');
    expect(result.target).toBe('/login?mode=admin');
    expect(result.reason).toBe('UNAUTHENTICATED');
  });

  // AUTH-ROUTE-010
  it('AUTH-ROUTE-010: ProtectedRoute allows authenticated authorized user to render children directly', () => {
    const playerDoc: UserDoc = {
      uid: 'player-uid-1',
      email: 'player@example.com',
      role: 'PLAYER',
      accountStatus: 'ACTIVE',
      approvalStatus: 'APPROVED',
      status: 'ACTIVE',
      createdAt: 1000
    };
    const result = resolveProtectedRouteAccess(
      '/player',
      ['PLAYER'],
      '/login?mode=player',
      false,
      { uid: 'player-uid-1' },
      playerDoc
    );
    expect(result.action).toBe('RENDER_CHILDREN');
    expect(result.target).toBeUndefined();
  });
});
