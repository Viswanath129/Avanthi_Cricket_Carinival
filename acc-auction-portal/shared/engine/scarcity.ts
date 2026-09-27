export type BucketId = 'B1' | 'B2' | 'B3' | 'B4' | 'D5' | 'M6';

export interface ScarcityInput {
  bucket: BucketId;
  unsoldPlayersInBucket: number;
  franchises: Array<{
    franchiseId: string;
    bucketCounts: Record<BucketId, number>;
  }>;
  bucketMinimums: Record<BucketId, number>;
}

export interface ScarcityResult {
  isScarcity: boolean;
  supply: number;
  demand: number;
  bucket: BucketId;
}

export function checkScarcity(input: ScarcityInput): ScarcityResult {
  const minRequired = input.bucketMinimums[input.bucket] || 0;
  if (minRequired === 0) {
    return {
      isScarcity: false,
      supply: input.unsoldPlayersInBucket,
      demand: 0,
      bucket: input.bucket
    };
  }

  let totalDemand = 0;
  for (const franchise of input.franchises) {
    const currentCount = franchise.bucketCounts[input.bucket] || 0;
    totalDemand += Math.max(0, minRequired - currentCount);
  }

  const isScarcity = totalDemand > 0 && input.unsoldPlayersInBucket <= totalDemand;

  return {
    isScarcity,
    supply: input.unsoldPlayersInBucket,
    demand: totalDemand,
    bucket: input.bucket
  };
}
