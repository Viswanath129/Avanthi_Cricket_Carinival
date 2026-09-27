import { describe, it, expect } from 'vitest';
import { calculateBidIncrement, calculateNextBid, calculateMaxBid } from '../bidEngine';

describe('Bid Increment', () => {
  it('90 → +10 → 100', () => {
    expect(calculateNextBid(90)).toBe(100);
  });
  it('100 → +20 → 120', () => {
    expect(calculateNextBid(100)).toBe(120);
  });
  it('200 → +30 → 230', () => {
    expect(calculateNextBid(200)).toBe(230);
  });
  it('50 → +10 → 60', () => {
    expect(calculateNextBid(50)).toBe(60);
  });
  it('180 → +20 → 200', () => {
    expect(calculateNextBid(180)).toBe(200);
  });
});

describe('Maximum Permissible Bid', () => {
  const defaultMinimums = { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 } as any;
  const zeroBuckets = { B1: 0, B2: 0, B3: 0, B4: 0, D5: 0, M6: 0 } as any;

  it('purse=1000, 0 purchases → maxBid=720', () => {
    const result = calculateMaxBid({
      purseRemaining: 1000,
      auctionPurchasesSoFar: 0,
      bucketCounts: zeroBuckets,
      currentPlayerBucket: 'B3',
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.maxBid).toBe(720);
  });

  it('purse=1000, 14 purchases → maxBid=1000', () => {
    const result = calculateMaxBid({
      purseRemaining: 1000,
      auctionPurchasesSoFar: 14,
      bucketCounts: { B1: 3, B2: 3, B3: 3, B4: 3, D5: 2, M6: 0 } as any,
      currentPlayerBucket: 'B3',
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.maxBid).toBe(1000);
  });

  it('purse=540, 0 purchases → maxBid=260', () => {
    const result = calculateMaxBid({
      purseRemaining: 540,
      auctionPurchasesSoFar: 0,
      bucketCounts: zeroBuckets,
      currentPlayerBucket: 'B2',
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.maxBid).toBe(260);
  });

  it('purse=460, 0 purchases → maxBid=180', () => {
    const result = calculateMaxBid({
      purseRemaining: 460,
      auctionPurchasesSoFar: 0,
      bucketCounts: zeroBuckets,
      currentPlayerBucket: 'B1',
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.maxBid).toBe(180);
  });

  it('purse=300, 0 purchases → maxBid=20', () => {
    const result = calculateMaxBid({
      purseRemaining: 300,
      auctionPurchasesSoFar: 0,
      bucketCounts: zeroBuckets,
      currentPlayerBucket: 'D5',
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.maxBid).toBe(20);
  });

  it('purse=880, 0 purchases → maxBid=600', () => {
    const result = calculateMaxBid({
      purseRemaining: 880,
      auctionPurchasesSoFar: 0,
      bucketCounts: zeroBuckets,
      currentPlayerBucket: 'B4',
      minAuctionPurchases: 15,
      bucketMinimums: defaultMinimums,
    });
    expect(result.maxBid).toBe(600);
  });
});
