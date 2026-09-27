import { describe, it, expect } from 'vitest';
import { checkBucketEligibility } from '../bucketEligibility';

describe('Bucket Eligibility', () => {
  const defaultMinimums = { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 } as any;

  it('1 slot remaining + needs D5 + current player B2 → BLOCK', () => {
    const result = checkBucketEligibility({
      purseRemaining: 100,
      auctionPurchasesSoFar: 14,
      bucketCounts: { B1: 2, B2: 3, B3: 2, B4: 3, D5: 1, M6: 3 } as any,
      currentPlayerBucket: 'B2',
      currentPrice: 20,
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.eligible).toBe(false);
  });

  it('3 slots remaining + needs 2 D5 + current player M6 → ALLOW', () => {
    const result = checkBucketEligibility({
      purseRemaining: 200,
      auctionPurchasesSoFar: 12,
      bucketCounts: { B1: 2, B2: 2, B3: 2, B4: 2, D5: 0, M6: 2 } as any,
      currentPlayerBucket: 'M6',
      currentPrice: 20,
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.eligible).toBe(true);
  });

  it('2 slots remaining + needs 2 D5 + current player M6 → BLOCK', () => {
    const result = checkBucketEligibility({
      purseRemaining: 200,
      auctionPurchasesSoFar: 13,
      bucketCounts: { B1: 2, B2: 2, B3: 2, B4: 2, D5: 0, M6: 3 } as any,
      currentPlayerBucket: 'M6',
      currentPrice: 20,
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.eligible).toBe(false);
  });

  it('20 purse + 1 D5 slot + D5 player at 20 → ALLOW', () => {
    const result = checkBucketEligibility({
      purseRemaining: 20,
      auctionPurchasesSoFar: 14,
      bucketCounts: { B1: 2, B2: 2, B3: 2, B4: 2, D5: 1, M6: 3 } as any,
      currentPlayerBucket: 'D5',
      currentPrice: 20,
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.eligible).toBe(true);
  });
});
