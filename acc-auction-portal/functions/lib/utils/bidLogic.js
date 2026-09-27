"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANDATORY_BUCKETS = void 0;
exports.calculateBidIncrement = calculateBidIncrement;
exports.calculateNextBid = calculateNextBid;
exports.calculateMaxBid = calculateMaxBid;
exports.checkBucketEligibility = checkBucketEligibility;
exports.MANDATORY_BUCKETS = ['B1', 'B2', 'B3', 'B4', 'D5'];
function calculateBidIncrement(currentPrice) {
    if (currentPrice < 100)
        return 10;
    if (currentPrice < 200)
        return 20;
    return 30;
}
function calculateNextBid(currentPrice) {
    return currentPrice + calculateBidIncrement(currentPrice);
}
function calculateMaxBid(input) {
    const { purseRemaining, auctionPurchasesSoFar, minAuctionPurchases } = input;
    const remainingAfterThis = Math.max(0, minAuctionPurchases - auctionPurchasesSoFar - 1);
    const maxBid = Math.max(0, purseRemaining - (remainingAfterThis * 20));
    return {
        maxBid,
        isEligible: maxBid >= 20,
        reason: maxBid < 20 ? `Insufficient purse. Must reserve ₹${remainingAfterThis * 20} for ${remainingAfterThis} remaining mandatory slots.` : null,
    };
}
function checkBucketEligibility(bucketCounts, currentPlayerBucket, auctionPurchasesSoFar, minAuctionPurchases, bucketMinimums) {
    // Simulate purchase
    const simulatedCounts = { ...bucketCounts };
    simulatedCounts[currentPlayerBucket] = (simulatedCounts[currentPlayerBucket] || 0) + 1;
    const simulatedPurchases = auctionPurchasesSoFar + 1;
    // Count remaining slots after this purchase
    const remainingSlots = Math.max(0, minAuctionPurchases - simulatedPurchases);
    // Count unmet mandatory requirements after this purchase
    let unmetMandatory = 0;
    for (const bucket of exports.MANDATORY_BUCKETS) {
        const needed = (bucketMinimums[bucket] || 0) - (simulatedCounts[bucket] || 0);
        if (needed > 0)
            unmetMandatory += needed;
    }
    // If there aren't enough remaining slots to fill mandatory requirements, BLOCK
    if (unmetMandatory > remainingSlots) {
        return {
            eligible: false,
            reason: `Blocked: ${unmetMandatory} mandatory bucket slots still needed but only ${remainingSlots} auction slots remaining.`,
        };
    }
    return { eligible: true, reason: null };
}
//# sourceMappingURL=bidLogic.js.map