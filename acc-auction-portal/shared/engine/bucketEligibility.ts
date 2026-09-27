export type BucketId = 'B1' | 'B2' | 'B3' | 'B4' | 'D5' | 'M6';

export interface EligibilityInput {
  purseRemaining: number;
  auctionPurchasesSoFar: number;
  bucketCounts: Record<BucketId, number>;
  currentPlayerBucket: BucketId;
  currentPrice: number;
  minAuctionPurchases: number;
  bucketMinimums: Record<BucketId, number>;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string | null;
}

export function checkBucketEligibility(input: EligibilityInput): EligibilityResult {
  const remainingAfterThis = Math.max(0, input.minAuctionPurchases - input.auctionPurchasesSoFar - 1);
  const hypotheticalCounts = { ...input.bucketCounts };
  hypotheticalCounts[input.currentPlayerBucket] = (hypotheticalCounts[input.currentPlayerBucket] || 0) + 1;

  let unmetSlots = 0;
  const buckets = Object.keys(input.bucketMinimums) as BucketId[];
  for (const bucket of buckets) {
    const min = input.bucketMinimums[bucket] || 0;
    const count = hypotheticalCounts[bucket] || 0;
    unmetSlots += Math.max(0, min - count);
  }

  const freeSlots = remainingAfterThis - unmetSlots;

  if (freeSlots < 0) {
    return {
      eligible: false,
      reason: 'Cannot purchase this player; remaining slots are needed for mandatory requirements.'
    };
  }

  const reserveNeeded = remainingAfterThis * 20;
  if (input.purseRemaining - input.currentPrice < reserveNeeded) {
    return {
      eligible: false,
      reason: 'Insufficient purse to make this purchase and reserve funds for mandatory slots.'
    };
  }

  return { eligible: true, reason: null };
}
