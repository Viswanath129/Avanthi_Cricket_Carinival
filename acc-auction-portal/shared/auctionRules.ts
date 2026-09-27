export type BucketCounts = [number, number, number, number, number];

export function bidIncrement(currentPrice: number) {
  if (currentPrice < 100) return 10;
  if (currentPrice < 200) return 20;
  return 30;
}

export function maximumPermissibleBid(input: {
  purse: number;
  playersBought: number;
  bucketCounts: BucketCounts;
  bucketMinimum?: number;
  minimumSquadSize?: number;
  minimumPrice?: number;
  lotBucketIndex?: number;
}) {
  const bucketMinimum = input.bucketMinimum ?? 2;
  const minimumSquadSize = input.minimumSquadSize ?? 15;
  const minimumPrice = input.minimumPrice ?? 20;
  const mandatoryBefore = input.bucketCounts.reduce(
    (total, count) => total + Math.max(0, bucketMinimum - count),
    0,
  );
  const mandatoryAfterLot = Math.max(
    0,
    mandatoryBefore - (input.lotBucketIndex !== undefined && input.bucketCounts[input.lotBucketIndex] < bucketMinimum ? 1 : 0),
  );
  const regularSlotsAfterLot = Math.max(0, minimumSquadSize - (input.playersBought + 1));
  const reserve = Math.max(mandatoryAfterLot, regularSlotsAfterLot) * minimumPrice;
  return Math.max(0, input.purse - reserve);
}

export function isBucketEligible(input: {
  slotsRemaining: number;
  mandatorySlotsRemaining: number;
  lotFulfillsMandatory: boolean;
}) {
  const slotsAfterLot = Math.max(0, input.slotsRemaining - 1);
  const mandatoryAfterLot = Math.max(0, input.mandatorySlotsRemaining - (input.lotFulfillsMandatory ? 1 : 0));
  return mandatoryAfterLot <= slotsAfterLot;
}

export function scarcityWarning(unsoldPlayers: number, teamsStillNeeding: number[]) {
  const totalPlayersNeeded = teamsStillNeeding.reduce((total, need) => total + Math.max(0, need), 0);
  return unsoldPlayers <= totalPlayersNeeded;
}

export function canUndoSale(sale: { undoneAt?: number | null }) {
  return sale.undoneAt == null;
}
