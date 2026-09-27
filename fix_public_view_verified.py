with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace cur assignment in renderPublicView
old_pub = """function renderPublicView() {
      const cur = players[lotIndex] || players[0];
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      const filteredPlayers = players.filter(p => {
        // HARD GATE: Only VERIFIED players can appear in public views
        const isVerified = (p.verificationStatus === 'VERIFIED' || p.status === 'VERIFIED' || p.status === 'AVAILABLE' || p.status === 'SOLD' || p.status === 'UNSOLD') &&
                           p.verificationStatus !== 'PENDING_VERIFICATION' &&
                           p.verificationStatus !== 'CHANGES_REQUIRED' &&
                           p.verificationStatus !== 'REJECTED' &&
                           p.verificationStatus !== 'BLOCKED';
        if (!isVerified) return false;
        if (publicSearchQuery && !p.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) && !p.roll.toLowerCase().includes(publicSearchQuery.toLowerCase())) return false;
        if (publicBucketFilter !== "ALL" && p.bucket !== publicBucketFilter) return false;
        return true;
      });"""

new_pub = """function renderPublicView() {
      // HARD GATE: Strictly only VERIFIED players admitted to public portal
      const verifiedPool = players.filter(p => {
        return (p.verificationStatus === 'VERIFIED' || p.status === 'VERIFIED' || p.status === 'AVAILABLE' || p.status === 'SOLD' || p.status === 'UNSOLD') &&
               p.verificationStatus !== 'PENDING_VERIFICATION' &&
               p.verificationStatus !== 'CHANGES_REQUIRED' &&
               p.verificationStatus !== 'REJECTED' &&
               p.verificationStatus !== 'BLOCKED';
      });
      const cur = verifiedPool[lotIndex] || verifiedPool[0] || {
        id: 0,
        name: "Tournament Lot Preview",
        bucket: "B1",
        program: "B.Tech",
        branch: "General",
        year: 1,
        derivedType: "All-Rounder",
        basePrice: 60
      };
      const leader = franchises.find(f => f.id === leadingBidderId);
      const scarcity = getTournamentScarcity();

      const filteredPlayers = verifiedPool.filter(p => {
        if (publicSearchQuery && !p.name.toLowerCase().includes(publicSearchQuery.toLowerCase()) && !p.roll.toLowerCase().includes(publicSearchQuery.toLowerCase())) return false;
        if (publicBucketFilter !== "ALL" && p.bucket !== publicBucketFilter) return false;
        return true;
      });"""

if old_pub in content:
    content = content.replace(old_pub, new_pub)
    print("Replaced public view verified filter")
else:
    print("Could not find old_pub directly, inspecting...")

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)
