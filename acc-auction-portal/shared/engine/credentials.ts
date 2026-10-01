/**
 * Official ACC 2026 Credential Normalization Conventions
 *
 * Spec:
 * - Franchise initial password: <TeamName>@ACC<TeamNumber> (e.g. Warriors@ACC03)
 * - Player initial password: <FirstName><LastName>@ACC2026 (e.g. RohitNambiar@ACC2026)
 * - Normalized: No spaces, PascalCase, exactly matching specification.
 */

export function generatePlayerInitialPassword(playerName: string): string {
  const cleanName = (playerName || 'Player').replace(/[^a-zA-Z0-9]/g, '');
  return `${cleanName}@ACC2026`;
}

export function generateFranchiseInitialPassword(franchiseName: string, teamNumber: number | string): string {
  const cleanName = (franchiseName || 'Franchise').replace(/[^a-zA-Z0-9]/g, '');
  const numStr = String(teamNumber).padStart(2, '0');
  return `${cleanName}@ACC${numStr}`;
}
