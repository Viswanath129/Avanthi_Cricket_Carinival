// Roles
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FRANCHISE_COORDINATOR' | 'FRANCHISE_TEAM_LEADER' | 'PLAYER';

// Account & Approval Lifecycle Statuses
export type AccountStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'DISABLED' | 'BLOCKED' | 'ARCHIVED';
export type ApprovalStatus = 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type AuthProviderType = 'google.com' | 'password';

// Buckets
export type BucketId = 'B1' | 'B2' | 'B3' | 'B4' | 'D5' | 'M6';

export const BUCKET_LABELS: Record<BucketId, string> = {
  B1: 'B.Tech 1st Year',
  B2: 'B.Tech 2nd Year',
  B3: 'B.Tech 3rd Year',
  B4: 'B.Tech 4th Year',
  D5: 'Diploma',
  M6: 'MBA / MCA / M.Tech',
};

export const MANDATORY_BUCKETS: BucketId[] = ['B1', 'B2', 'B3', 'B4', 'D5'];

export const AUCTION_ORDER: BucketId[] = ['B3', 'B4', 'B2', 'D5', 'B1', 'M6'];

export const BASE_PRICE_LADDER = [20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 230, 250] as const;

// User document
export interface UserDoc {
  uid: string;
  role: UserRole;
  status: 'ACTIVE' | 'DISABLED'; // for backwards compatibility
  accountStatus: AccountStatus;
  approvalStatus: ApprovalStatus;
  authProvider: AuthProviderType;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  mobile: string | null;
  franchiseId: string | null;
  playerId: string | null;
  identityType: 'COORDINATOR' | 'TEAM_LEADER' | 'SUPER_ADMIN' | 'OPERATOR' | null;
  name?: string | null;
  designation?: string | null;
  department?: string | null;
  lastActive?: any;
  createdAt: any; // Firestore Timestamp
  updatedAt: any;
}

// Edition
export interface EditionDoc {
  name: string;
  academicYear: string;
  status: 'DRAFT' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'AUCTION_LIVE' | 'COMPLETED';
  registrationStart: any;
  registrationEnd: any;
  auctionStart: any;
  bucketMinimums: Record<BucketId, number>;
  currentAcademicStartYear: number; // e.g. 2026 for 2026-27
}

// Player
export interface PlayerDoc {
  editionId: string;
  uid: string | null;
  rollNumber: string;
  name: string;
  emailPrivate: string | null;
  mobilePrivate: string;
  photoUrl: string | null;

  academic: {
    program: 'BTECH' | 'DIPLOMA' | 'MBA' | 'MCA' | 'MTECH';
    branch: string;
    branchCode: string;
    admissionYear: number;
    entryType: 'REGULAR' | 'LATERAL';
    studyYear: number;
    bucket: BucketId;
    manualOverride: boolean;
    overrideReason: string | null;
  };

  cricket: {
    battingStyle: string | null;
    bowlingStyle: string | null;
    bowlingType: string | null;
    preferredPosition: string | null;
    isWicketKeeper: boolean;
  };

  derived: {
    playerType: 'WK_BATTER' | 'WK' | 'ALL_ROUNDER' | 'BATTER' | 'BOWLER' | 'FIELDER';
  };

  cricheroes: {
    profileUrl: string | null;
    registeredMobilePrivate: string | null;
    status: 'VERIFIED' | 'PENDING' | 'PROFILE_CREATION_PENDING';
  };

  reference: {
    eligible: boolean;
    franchiseId: string | null;
    playerDeclaration: boolean;
    franchiseDeclaration: boolean;
    adminVerified: boolean;
  };

  stats: {
    matches: number;
    runs: number;
    wickets: number;
    strikeRate: number;
    battingAverage: number;
    bowlingAverage: number;
    catches: number;
    stumpings: number;
  };

  registration: {
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    paid: boolean;
    editingBlocked: boolean;
  };

  auctionable: boolean;
  basePrice: number;

  createdAt: any;
  updatedAt: any;
}

// Public player projection (no private data)
export interface PlayerPublicDoc {
  playerId: string;
  editionId: string;
  name: string;
  photoUrl: string | null;
  academic: {
    program: string;
    branch: string;
    studyYear: number;
    bucket: BucketId;
  };
  derived: { playerType: string };
  stats: PlayerDoc['stats'];
  basePrice: number;
  auctionable: boolean;
  registration: { status: string; paid: boolean };
}

// Franchise
export interface FranchiseDoc {
  editionId: string;
  name: string;
  logoUrl: string | null;
  shortName: string;

  coordinator: {
    name: string;
    department: string;
    photoUrl: string | null;
    emailPrivate: string;
    mobilePrivate: string;
  };

  captainPlayerId: string | null;
  viceCaptainPlayerId: string | null;

  primaryAuthUid: string | null;
  secondaryAuthUid: string | null;

  purseInitial: number;
  purseRemaining: number;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'DISABLED';

  squad: {
    count: number;
    bucketCounts: Record<BucketId, number>;
    auctionPurchases: number;
    referredCount: number;
  };

  referredPlayerIds: string[];

  createdAt: any;
  updatedAt: any;
}

// Franchise user mapping
export interface FranchiseUserDoc {
  uid: string;
  franchiseId: string;
  identityType: 'COORDINATOR' | 'TEAM_LEADER';
  email: string;
  mobile: string;
  status: 'ACTIVE' | 'DISABLED';
}

// Lot
export type LotStatus = 'AVAILABLE' | 'CALLED' | 'LIVE' | 'SKIPPED' | 'SOLD' | 'UNSOLD';

export interface LotDoc {
  editionId: string;
  playerId: string;
  bucketId: BucketId;
  round: 1 | 2;
  sequence: number;
  drawNumber: number;

  status: LotStatus;

  basePrice: number;
  currentPrice: number;
  highestBidderFranchiseId: string | null;
  timerDeadline: any; // Firestore Timestamp or server timestamp
  timerDurationMs: number;
  version: number;
}

// Franchise auction status within a lot
export type FranchiseAuctionStatus = 'IN_PLAY' | 'PASSED' | 'BLOCKED';

// Bid (immutable)
export interface BidDoc {
  editionId: string;
  lotId: string;
  franchiseId: string;
  amount: number;
  previousAmount: number;
  sequenceNumber: number;
  clientActionId: string;
  createdAt: any;
}

// Acquisition
export type AcquisitionType = 'SOLD' | 'ALLOTTED' | 'SCOUTED' | 'DIRECT_ASSIGN';

export interface AcquisitionDoc {
  editionId: string;
  lotId: string;
  playerId: string;
  franchiseId: string;
  type: AcquisitionType;
  price: number;
  status: 'ACTIVE' | 'UNDONE';
  createdAt: any;
  undoneAt: any | null;
  undoReason: string | null;
}

// Audit Log
export interface AuditLogDoc {
  editionId: string;
  actorUid: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  beforeState: any;
  afterState: any;
  reason: string | null;
  timestamp: any;
}

// Auction State (singleton per edition)
export interface AuctionStateDoc {
  editionId: string;
  status: 'NOT_STARTED' | 'LIVE' | 'PAUSED' | 'ROUND1_COMPLETE' | 'ROUND2' | 'COMPLETED';
  currentRound: 1 | 2;
  currentBucketIndex: number;
  currentLotId: string | null;
  mode: 'GUEST' | 'AUTO';
  totalLotsProcessed: number;
  franchiseStatuses: Record<string, FranchiseAuctionStatus>;
  updatedAt: any;
}

// Squad rules configuration
export interface SquadRulesConfig {
  minSquadSize: number; // 17
  maxSquadSize: number; // 22
  minAuctionPurchases: number; // 15
  maxReferrals: number; // 5
  bucketMinimums: Record<BucketId, number>; // default all 2, configurable
}

export const DEFAULT_SQUAD_RULES: SquadRulesConfig = {
  minSquadSize: 17,
  maxSquadSize: 22,
  minAuctionPurchases: 15,
  maxReferrals: 5,
  bucketMinimums: { B1: 2, B2: 2, B3: 2, B4: 2, D5: 2, M6: 0 },
};
