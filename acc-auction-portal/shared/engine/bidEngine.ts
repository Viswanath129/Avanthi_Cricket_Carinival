export type BucketId = 'B1' | 'B2' | 'B3' | 'B4' | 'D5' | 'M6';

export function calculateBidIncrement(currentPrice: number): number {
  if (currentPrice < 100) return 10;
  if (currentPrice < 200) return 20;
  return 30;
}

export function calculateNextBid(currentPrice: number): number {
  return currentPrice + calculateBidIncrement(currentPrice);
}

export interface MaxBidInput {
  purseRemaining: number;
  auctionPurchasesSoFar: number;
  bucketCounts: Record<BucketId, number>;
  currentPlayerBucket: BucketId;
  minAuctionPurchases: number;
  bucketMinimums: Record<BucketId, number>;
}

export interface MaxBidResult {
  maxBid: number;
  isEligible: boolean;
  reason: string | null;
}

export function calculateMaxBid(input: MaxBidInput): MaxBidResult {
  const {
    purseRemaining,
    auctionPurchasesSoFar,
    bucketCounts,
    currentPlayerBucket,
    minAuctionPurchases,
    bucketMinimums
  } = input;

  const remainingAfterThis = Math.max(0, minAuctionPurchases - auctionPurchasesSoFar - 1);
  
  const hypotheticalCounts = { ...bucketCounts };
  hypotheticalCounts[currentPlayerBucket] = (hypotheticalCounts[currentPlayerBucket] || 0) + 1;

  let unmetSlots = 0;
  const buckets = Object.keys(bucketMinimums) as BucketId[];
  for (const bucket of buckets) {
    const min = bucketMinimums[bucket] || 0;
    const count = hypotheticalCounts[bucket] || 0;
    unmetSlots += Math.max(0, min - count);
  }

  const freeSlots = remainingAfterThis - unmetSlots;
  
  if (freeSlots < 0) {
    return {
      maxBid: 0,
      isEligible: false,
      reason: 'Purchasing this player makes it impossible to fulfill mandatory bucket requirements.'
    };
  }

  const reserveNeeded = remainingAfterThis * 20;
  const maxBid = purseRemaining - reserveNeeded;

  return {
    maxBid,
    isEligible: maxBid >= 20,
    reason: maxBid >= 20 ? null : 'Insufficient purse.'
  };
}
