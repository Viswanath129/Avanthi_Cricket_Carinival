import { describe, it, expect } from 'vitest';
import {
  auditPlayerRecords,
  buildPlayerRepairPatch,
  buildPlayerRollbackPatch,
} from '../cricHeroesAudit';

describe('ACC 2026 — CricHeroes Data Audit & Safe Repair Engine', () => {
  const mockAdminUid = 'admin-super-999';

  describe('auditPlayerRecords', () => {
    it('categorizes clean, canonical records as VERIFIED_MATCH', () => {
      const players = [
        {
          id: '25811A0501',
          name: 'K. Sai Varma',
          editionId: 'acc-2026',
          cricHeroesUrl: 'https://cricheroes.com/player-profile/101010/sai-varma',
          cricheroes: {
            profileUrl: 'https://cricheroes.com/player-profile/101010/sai-varma',
            playerId: '101010',
            playerSlug: 'sai-varma',
            status: 'VERIFIED',
          },
        },
      ];

      const report = auditPlayerRecords(players, 'acc-2026');
      expect(report.totalRecordsChecked).toBe(1);
      expect(report.verifiedMatchesCount).toBe(1);
      expect(report.proposedCorrectionsCount).toBe(0);
      expect(report.records[0].status).toBe('VERIFIED_MATCH');
    });

    it('identifies unclean URLs and unmapped player IDs as PROPOSED_CORRECTION', () => {
      const players = [
        {
          id: '25811A0402',
          name: 'P. Rohit',
          editionId: 'acc-2026',
          cricHeroesUrl: 'https://cricheroes.in/player-profile/202020/rohit-p?m=share&ref=ios',
          cricHeroesStatus: 'PENDING',
          // Note: cricheroes.playerId is missing
          stats: { matches: 15, runs: 420 },
        },
      ];

      const report = auditPlayerRecords(players, 'acc-2026');
      expect(report.proposedCorrectionsCount).toBe(1);
      const rec = report.records[0];
      expect(rec.status).toBe('PROPOSED_CORRECTION');
      expect(rec.proposedValues?.url).toBe('https://cricheroes.com/player-profile/202020/rohit-p');
      expect(rec.proposedValues?.playerId).toBe('202020');
      expect(rec.proposedValues?.playerSlug).toBe('rohit-p');
      expect(rec.proposedValues?.status).toBe('VERIFIED');
      expect(rec.issues.some((i) => i.type === 'UNCLEAN_URL')).toBe(true);
      expect(rec.issues.some((i) => i.type === 'UNEXTRACTED_PLAYER_ID')).toBe(true);
    });

    it('flags scorecard/tournament/team links as UNRESOLVED with specific issue', () => {
      const players = [
        {
          id: '25811A0403',
          name: 'N. Kalyan',
          editionId: 'acc-2026',
          cricHeroesUrl: 'https://cricheroes.com/scorecard/998877/inter-college-semis',
          cricHeroesStatus: 'VERIFIED',
        },
      ];

      const report = auditPlayerRecords(players, 'acc-2026');
      expect(report.unresolvedCount).toBe(1);
      const rec = report.records[0];
      expect(rec.status).toBe('UNRESOLVED');
      expect(rec.issues[0].type).toBe('INVALID_URL_TYPE');
      expect(rec.issues[0].description).toContain('scorecard');
    });

    it('flags suspect legacy auto-synced records as REVIEW_REQUIRED without wiping stats', () => {
      const players = [
        {
          id: '25811A0404',
          name: 'A. Rahul',
          editionId: 'acc-2026',
          cricHeroesUrl: 'https://cricheroes.com/player-profile/303030/rahul-a',
          cricHeroesStatus: 'SELF-DECLARED · SYNCED WITH CRICHEROES',
          stats: { matches: 28, runs: 680, wickets: 24 },
        },
      ];

      const report = auditPlayerRecords(players, 'acc-2026');
      expect(report.reviewRequiredCount).toBe(1);
      const rec = report.records[0];
      expect(rec.status).toBe('REVIEW_REQUIRED');
      expect(rec.issues.some((i) => i.type === 'SUSPECT_FABRICATED_STATS')).toBe(true);
      // Stats must remain present and preserved
      expect(rec.currentValues.stats?.matches).toBe(28);
    });

    it('flags records marked verified but missing URL as REVIEW_REQUIRED', () => {
      const players = [
        {
          id: '25811A0405',
          name: 'M. Suresh',
          editionId: 'acc-2026',
          cricHeroesUrl: '',
          cricHeroesStatus: 'VERIFIED',
        },
      ];

      const report = auditPlayerRecords(players, 'acc-2026');
      expect(report.reviewRequiredCount).toBe(1);
      expect(report.records[0].issues[0].type).toBe('MISSING_URL_STATUS_MISMATCH');
    });

    it('scopes audit to target edition and ignores unrelated editions', () => {
      const players = [
        { id: 'p1', name: 'Player 1', editionId: 'acc-2026', cricHeroesUrl: 'https://cricheroes.com/player-profile/1/a' },
        { id: 'p2', name: 'Player 2', editionId: 'acc-2025', cricHeroesUrl: 'https://cricheroes.com/player-profile/2/b' },
      ];

      const report = auditPlayerRecords(players, 'acc-2026');
      expect(report.totalRecordsChecked).toBe(1);
      expect(report.records[0].id).toBe('p1');
    });
  });

  describe('buildPlayerRepairPatch', () => {
    it('creates non-destructive patch with full backup of previous state', () => {
      const auditRec = {
        id: '25811A0501',
        name: 'K. Sai Varma',
        rollNumber: '25811A0501',
        storedUrl: 'https://cricheroes.in/player-profile/101010/sai?m=share',
        storedStatus: 'PENDING',
        currentValues: {
          url: 'https://cricheroes.in/player-profile/101010/sai?m=share',
          status: 'PENDING',
          playerId: null,
          playerSlug: null,
          stats: { matches: 12, runs: 300 },
        },
        proposedValues: {
          url: 'https://cricheroes.com/player-profile/101010/sai',
          status: 'VERIFIED',
          playerId: '101010',
          playerSlug: 'sai',
          actionNote: 'Normalize to canonical URL and map verified player ID',
        },
        status: 'PROPOSED_CORRECTION' as const,
        issues: [],
      };

      const result = buildPlayerRepairPatch(auditRec, mockAdminUid);
      expect(result).not.toBeNull();
      expect(result!.docId).toBe('25811A0501');

      const patch = result!.patch;
      // Stored URLs updated
      expect(patch.cricHeroesUrl).toBe('https://cricheroes.com/player-profile/101010/sai');
      expect(patch.cricheroes.playerId).toBe('101010');
      expect(patch.cricheroes.status).toBe('VERIFIED');

      // Previous values backed up
      expect(patch.cricHeroesAuditBackup).toBeDefined();
      expect(patch.cricHeroesAuditBackup.previousUrl).toBe(
        'https://cricheroes.in/player-profile/101010/sai?m=share'
      );
      expect(patch.cricHeroesAuditBackup.previousStats).toEqual({ matches: 12, runs: 300 });
      expect(patch.cricHeroesAuditBackup.backedUpBy).toBe(mockAdminUid);

      // Crucially, patch must NOT overwrite stats
      expect(patch.stats).toBeUndefined();
      expect(patch.careerStats).toBeUndefined();
    });
  });

  describe('buildPlayerRollbackPatch', () => {
    it('restores previous field values from backup snapshot', () => {
      const repairedPlayer = {
        id: '25811A0501',
        cricHeroesUrl: 'https://cricheroes.com/player-profile/101010/sai',
        cricHeroesStatus: 'VERIFIED',
        cricHeroesAuditBackup: {
          previousUrl: 'https://cricheroes.in/player-profile/101010/sai?m=share',
          previousStatus: 'PENDING',
          previousPlayerId: null,
          previousStats: { matches: 12, runs: 300 },
          backedUpAt: '2026-10-09T16:00:00Z',
          backedUpBy: 'admin-1',
        },
      };

      const rollback = buildPlayerRollbackPatch(repairedPlayer, mockAdminUid);
      expect(rollback).not.toBeNull();
      expect(rollback!.docId).toBe('25811A0501');
      expect(rollback!.patch.cricHeroesUrl).toBe(
        'https://cricheroes.in/player-profile/101010/sai?m=share'
      );
      expect(rollback!.patch.cricHeroesStatus).toBe('PENDING');
      expect(rollback!.patch.cricHeroesAuditMetadata.action).toBe('RESTORED_FROM_BACKUP');
    });

    it('returns null if player has no backup', () => {
      const unbackedPlayer = { id: 'p99', cricHeroesUrl: 'https://cricheroes.com/...' };
      expect(buildPlayerRollbackPatch(unbackedPlayer, mockAdminUid)).toBeNull();
    });
  });

  describe('safety constraints & batch repair guards', () => {
    it('categorizes records without URLs as NO_URL', () => {
      const players = [
        { id: 'p_no_url', name: 'No Link Player', cricHeroesUrl: '' },
        { id: 'p_null_url', name: 'Null Link Player', cricHeroesUrl: null },
      ];
      const report = auditPlayerRecords(players, 'acc-2026');
      expect(report.totalRecordsChecked).toBe(2);
      expect(report.noUrlCount).toBe(2);
      expect(report.records.every((r) => r.status === 'NO_URL')).toBe(true);
    });

    it('flags malformed text or invalid domains as UNRESOLVED', () => {
      const players = [
        { id: 'p_bad_dom', name: 'Bad Domain', cricHeroesUrl: 'https://espncricinfo.com/player/12345' },
        { id: 'p_junk', name: 'Junk Text', cricHeroesUrl: 'http://:bad-url' },
      ];
      const report = auditPlayerRecords(players, 'acc-2026');
      expect(report.unresolvedCount).toBe(2);
      expect(report.records[0].issues[0].type).toBe('INVALID_URL_TYPE');
      expect(report.records[1].issues[0].type).toBe('MALFORMED_URL');
    });

    it('refuses to build repair patches for non-PROPOSED_CORRECTION records', () => {
      const verifiedRecord = {
        id: 'p_ver',
        name: 'Verified',
        rollNumber: 'R1',
        storedUrl: 'https://cricheroes.com/player-profile/1/a',
        storedStatus: 'VERIFIED',
        currentValues: { url: 'https://cricheroes.com/player-profile/1/a', status: 'VERIFIED', playerId: '1', playerSlug: 'a' },
        status: 'VERIFIED_MATCH' as const,
        issues: [],
      };
      expect(buildPlayerRepairPatch(verifiedRecord, mockAdminUid)).toBeNull();

      const unresolvedRecord = {
        id: 'p_unres',
        name: 'Unresolved',
        rollNumber: 'R2',
        storedUrl: 'https://cricheroes.com/scorecard/1/a',
        storedStatus: null,
        currentValues: { url: 'https://cricheroes.com/scorecard/1/a', status: null, playerId: null, playerSlug: null },
        status: 'UNRESOLVED' as const,
        issues: [],
      };
      expect(buildPlayerRepairPatch(unresolvedRecord, mockAdminUid)).toBeNull();
    });
  });
});
