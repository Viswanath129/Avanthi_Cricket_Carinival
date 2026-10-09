import { AUCTION_ORDER, type BucketId } from '../types';

/**
 * Finds the next eligible unsold lot according to the official tournament auction order
 * Sequence: ['B3', 'B4', 'B2', 'D5', 'B1', 'M6'], ordered by drawNumber within each bucket.
 */
export function getNextEligibleUnsoldLot(
  lots: any[],
  currentLotId?: string | null,
  targetRound?: number | null
): any | null {
  if (!Array.isArray(lots) || lots.length === 0) return null;

  // Eligible unsold lots: strictly exclude SOLD, ARCHIVED, or current lot
  const available = lots.filter((l) => {
    if (!l || l.id === currentLotId) return false;
    if (l.status === 'SOLD' || l.status === 'ARCHIVED' || l.status === 'DELETED') return false;
    if (l.status !== 'AVAILABLE' && l.status !== 'CALLED') return false;
    if (typeof targetRound === 'number' && typeof l.round === 'number' && l.round !== targetRound) return false;
    return true;
  });
  if (available.length === 0) return null;

  // Iterate buckets in strict AUCTION_ORDER
  for (const bucket of AUCTION_ORDER) {
    const matchingLots = available
      .filter((l) => l.bucket === bucket || l.bucketId === bucket)
      .sort((a, b) => (Number(a.drawNumber) || 0) - (Number(b.drawNumber) || 0));

    if (matchingLots.length > 0) {
      return matchingLots[0];
    }
  }

  // Fallback sorted by drawNumber
  return [...available].sort(
    (a, b) => (Number(a.drawNumber) || 0) - (Number(b.drawNumber) || 0)
  )[0];
}
