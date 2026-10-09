/**
 * ACC 2026 — CricHeroes Data Audit & Safe Repair Engine
 * 
 * Inspects existing and new player records in the tournament edition.
 * Features:
 * 1. Deep audit of stored CricHeroes URLs and associated profile details.
 * 2. Detection of invalid URL types (scorecard, tournament, team), malformed links, unextracted player IDs,
 *    unclean tracking query parameters, and legacy suspect fabricated stats.
 * 3. Dry-run preview with counts of verified matches, proposed corrections, review-required records, and unresolved links.
 * 4. Safe non-destructive repairs that preserve player stats, back up old field states, and prevent concurrent jobs.
 * 5. Rollback capability restoring backed up states.
 */

import { parseCricHeroesUrl } from './cricheroes';

export type CricHeroesAuditIssueType =
  | 'INVALID_URL_TYPE'
  | 'MALFORMED_URL'
  | 'UNCLEAN_URL'
  | 'UNEXTRACTED_PLAYER_ID'
  | 'SUSPECT_FABRICATED_STATS'
  | 'MISSING_URL_STATUS_MISMATCH';

export interface CricHeroesAuditIssue {
  type: CricHeroesAuditIssueType;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  description: string;
}

export interface PlayerAuditRecord {
  id: string;
  name: string;
  rollNumber: string;
  editionId?: string;
  storedUrl: string | null;
  storedStatus: string | null;
  currentValues: {
    url: string | null;
    status: string | null;
    playerId: string | null;
    playerSlug: string | null;
    stats?: Record<string, any>;
  };
  proposedValues?: {
    url: string;
    status: string;
    playerId: string;
    playerSlug: string | null;
    actionNote: string;
  };
  status: 'VERIFIED_MATCH' | 'PROPOSED_CORRECTION' | 'REVIEW_REQUIRED' | 'UNRESOLVED' | 'NO_URL';
  issues: CricHeroesAuditIssue[];
  hasBackup?: boolean;
  backupData?: any;
}

export interface CricHeroesAuditReport {
  editionId: string;
  timestamp: string;
  totalRecordsChecked: number;
  verifiedMatchesCount: number;
  proposedCorrectionsCount: number;
  reviewRequiredCount: number;
  unresolvedCount: number;
  noUrlCount: number;
  records: PlayerAuditRecord[];
}

export interface RepairOptions {
  dryRun?: boolean;
  adminUid: string;
  adminName: string;
  selectedPlayerIds?: string[]; // If omitted, applies to all PROPOSED_CORRECTION records
}

export interface RepairExecutionReport {
  dryRun: boolean;
  timestamp: string;
  adminUid: string;
  adminName: string;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  repairedPlayerIds: string[];
  skippedPlayerIds: string[];
  errors: { playerId: string; error: string }[];
}

/**
 * Scans an array of player records and produces an audit report
 */
export function auditPlayerRecords(
  players: any[],
  targetEditionId: string = 'acc-2026'
): CricHeroesAuditReport {
  const normTarget = targetEditionId.toLowerCase().replace(/_/g, '-');
  
  // Filter records belonging to the target edition (or records without explicit editionId in single-edition setups)
  const eligiblePlayers = players.filter(p => {
    if (!p) return false;
    const pEd = (p.editionId || p.edition || 'acc-2026').toLowerCase().replace(/_/g, '-');
    return pEd === normTarget;
  });

  const records: PlayerAuditRecord[] = [];
  let verifiedMatchesCount = 0;
  let proposedCorrectionsCount = 0;
  let reviewRequiredCount = 0;
  let unresolvedCount = 0;
  let noUrlCount = 0;

  for (const player of eligiblePlayers) {
    const playerId = String(player.id || player.rollNumber || player.roll || '');
    const playerName = String(player.name || player.displayName || 'Unnamed Player');
    const rollNumber = String(player.rollNumber || player.roll || playerId);

    const rawUrl = (
      player.cricheroes?.profileUrl ||
      player.cricHeroesUrl ||
      player.cricheroesProfileUrl ||
      null
    )?.trim() || null;

    const rawStatus = (
      player.cricheroes?.status ||
      player.cricHeroesStatus ||
      null
    )?.trim() || null;

    const currentExtractedId = player.cricheroes?.playerId || null;
    const currentExtractedSlug = player.cricheroes?.playerSlug || null;
    const stats = player.stats || player.careerStats || null;
    const hasBackup = Boolean(player.cricHeroesAuditBackup);
    const backupData = player.cricHeroesAuditBackup || null;

    const currentValues = {
      url: rawUrl,
      status: rawStatus,
      playerId: currentExtractedId,
      playerSlug: currentExtractedSlug,
      stats,
    };

    const issues: CricHeroesAuditIssue[] = [];

    // Case 1: No CricHeroes URL provided
    if (!rawUrl) {
      if (rawStatus === 'VERIFIED' || rawStatus === 'PROFILE AVAILABLE') {
        issues.push({
          type: 'MISSING_URL_STATUS_MISMATCH',
          severity: 'ERROR',
          description: 'Player record marked as verified/available but contains no CricHeroes URL.',
        });
        reviewRequiredCount++;
        records.push({
          id: playerId,
          name: playerName,
          rollNumber,
          editionId: targetEditionId,
          storedUrl: null,
          storedStatus: rawStatus,
          currentValues,
          status: 'REVIEW_REQUIRED',
          issues,
          hasBackup,
          backupData,
        });
      } else {
        noUrlCount++;
        records.push({
          id: playerId,
          name: playerName,
          rollNumber,
          editionId: targetEditionId,
          storedUrl: null,
          storedStatus: rawStatus,
          currentValues,
          status: 'NO_URL',
          issues: [],
          hasBackup,
          backupData,
        });
      }
      continue;
    }

    // Case 2: URL exists -> Parse & Validate
    const parsed = parseCricHeroesUrl(rawUrl);

    if (!parsed.isValid) {
      if (parsed.urlType === 'SCORECARD' || parsed.urlType === 'TOURNAMENT' || parsed.urlType === 'TEAM' || parsed.urlType === 'INVALID_DOMAIN') {
        issues.push({
          type: 'INVALID_URL_TYPE',
          severity: 'ERROR',
          description: parsed.urlType === 'INVALID_DOMAIN'
            ? `Stored link has an invalid domain (${parsed.error}). Only cricheroes.com or cricheroes.in is permitted.`
            : `Stored link points to a ${parsed.urlType.toLowerCase()} page, not an individual player profile (${parsed.error}).`,
        });
      } else {
        issues.push({
          type: 'MALFORMED_URL',
          severity: 'ERROR',
          description: parsed.error || 'Malformed CricHeroes URL.',
        });
      }
      unresolvedCount++;
      records.push({
        id: playerId,
        name: playerName,
        rollNumber,
        editionId: targetEditionId,
        storedUrl: rawUrl,
        storedStatus: rawStatus,
        currentValues,
        status: 'UNRESOLVED',
        issues,
        hasBackup,
        backupData,
      });
      continue;
    }

    // Case 3: URL is valid CricHeroes profile link
    // Check if legacy suspect fabricated stats exist
    const statusHasLegacySync =
      (rawStatus && rawStatus.includes('SYNCED WITH CRICHEROES')) ||
      (player.cricHeroesStatus && player.cricHeroesStatus.includes('SYNCED'));

    if (statusHasLegacySync) {
      issues.push({
        type: 'SUSPECT_FABRICATED_STATS',
        severity: 'WARNING',
        description: 'Record flagged with legacy auto-synced tag. Carrier stats should be reviewed against genuine CricHeroes profile.',
      });
      reviewRequiredCount++;
      records.push({
        id: playerId,
        name: playerName,
        rollNumber,
        editionId: targetEditionId,
        storedUrl: rawUrl,
        storedStatus: rawStatus,
        currentValues,
        proposedValues: {
          url: parsed.canonicalUrl!,
          status: 'REQUIRES_MANUAL_STAT_VERIFICATION',
          playerId: parsed.playerId!,
          playerSlug: parsed.playerSlug,
          actionNote: 'Normalize profile URL and flag stats for committee review (no stats overwritten).',
        },
        status: 'REVIEW_REQUIRED',
        issues,
        hasBackup,
        backupData,
      });
      continue;
    }

    // Check if URL is unclean (has query params / fragments / non-canonical host) or missing playerId
    const isUnclean = rawUrl !== parsed.canonicalUrl;
    const isMissingPlayerId = currentExtractedId !== parsed.playerId;

    if (isUnclean || isMissingPlayerId || rawStatus !== 'VERIFIED') {
      if (isUnclean) {
        issues.push({
          type: 'UNCLEAN_URL',
          severity: 'INFO',
          description: 'URL contains tracking parameters, fragments, or alternate domain formatting.',
        });
      }
      if (isMissingPlayerId) {
        issues.push({
          type: 'UNEXTRACTED_PLAYER_ID',
          severity: 'WARNING',
          description: `Player ID was unmapped. Canonical ID is #${parsed.playerId}.`,
        });
      }

      proposedCorrectionsCount++;
      records.push({
        id: playerId,
        name: playerName,
        rollNumber,
        editionId: targetEditionId,
        storedUrl: rawUrl,
        storedStatus: rawStatus,
        currentValues,
        proposedValues: {
          url: parsed.canonicalUrl!,
          status: 'VERIFIED',
          playerId: parsed.playerId!,
          playerSlug: parsed.playerSlug,
          actionNote: 'Update to canonical URL and save verified player ID (stats preserved).',
        },
        status: 'PROPOSED_CORRECTION',
        issues,
        hasBackup,
        backupData,
      });
      continue;
    }

    // Case 4: Perfectly verified and clean match
    verifiedMatchesCount++;
    records.push({
      id: playerId,
      name: playerName,
      rollNumber,
      editionId: targetEditionId,
      storedUrl: rawUrl,
      storedStatus: rawStatus,
      currentValues,
      status: 'VERIFIED_MATCH',
      issues: [],
      hasBackup,
      backupData,
    });
  }

  return {
    editionId: targetEditionId,
    timestamp: new Date().toISOString(),
    totalRecordsChecked: eligiblePlayers.length,
    verifiedMatchesCount,
    proposedCorrectionsCount,
    reviewRequiredCount,
    unresolvedCount,
    noUrlCount,
    records,
  };
}

/**
 * Creates repair patch objects for eligible player records
 * Ensures backups are captured before any modification.
 */
export function buildPlayerRepairPatch(
  record: PlayerAuditRecord,
  adminUid: string
): { docId: string; patch: Record<string, any> } | null {
  if (!record.proposedValues) return null;

  const previousBackup = record.backupData || {
    previousUrl: record.currentValues.url,
    previousStatus: record.currentValues.status,
    previousPlayerId: record.currentValues.playerId,
    previousStats: record.currentValues.stats,
    backedUpAt: new Date().toISOString(),
    backedUpBy: adminUid,
  };

  const patch: Record<string, any> = {
    cricHeroesUrl: record.proposedValues.url,
    cricHeroesStatus: record.proposedValues.status,
    cricheroes: {
      profileUrl: record.proposedValues.url,
      playerId: record.proposedValues.playerId,
      playerSlug: record.proposedValues.playerSlug,
      status: record.proposedValues.status,
    },
    cricHeroesAuditBackup: previousBackup,
    cricHeroesAuditMetadata: {
      repairedAt: new Date().toISOString(),
      repairedBy: adminUid,
      action: record.proposedValues.actionNote,
    },
  };

  return {
    docId: record.id,
    patch,
  };
}

/**
 * Prepares a rollback patch restoring previous values from backup
 */
export function buildPlayerRollbackPatch(
  player: any,
  adminUid: string
): { docId: string; patch: Record<string, any> } | null {
  const backup = player.cricHeroesAuditBackup;
  if (!backup) return null;

  const docId = String(player.id || player.rollNumber || player.roll);
  const patch: Record<string, any> = {
    cricHeroesUrl: backup.previousUrl || '',
    cricHeroesStatus: backup.previousStatus || 'PENDING',
    cricheroes: {
      profileUrl: backup.previousUrl || null,
      playerId: backup.previousPlayerId || null,
      status: backup.previousStatus || 'PENDING',
    },
    cricHeroesAuditMetadata: {
      rolledBackAt: new Date().toISOString(),
      rolledBackBy: adminUid,
      action: 'RESTORED_FROM_BACKUP',
    },
  };

  return { docId, patch };
}
