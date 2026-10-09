import { describe, it, expect } from 'vitest';
import {
  parseCricHeroesUrl,
  extractUrlCandidate,
  resolveCricHeroesProfile,
} from '../cricheroes';

describe('CricHeroes URL Parser & Validation Engine', () => {
  describe('extractUrlCandidate', () => {
    it('extracts URL from plain URL string', () => {
      expect(extractUrlCandidate('https://cricheroes.com/player-profile/123/name')).toBe(
        'https://cricheroes.com/player-profile/123/name'
      );
    });

    it('extracts URL from copied mobile app share message', () => {
      const shareText =
        'Check out my profile on CricHeroes: https://cricheroes.com/player-profile/554433/virat-kohli?m=share';
      expect(extractUrlCandidate(shareText)).toBe(
        'https://cricheroes.com/player-profile/554433/virat-kohli?m=share'
      );
    });

    it('extracts URL from share message without http scheme', () => {
      const shareText = 'My CricHeroes profile is cricheroes.com/player-profile/998877/rahul-d';
      expect(extractUrlCandidate(shareText)).toBe(
        'cricheroes.com/player-profile/998877/rahul-d'
      );
    });

    it('handles empty or blank string gracefully', () => {
      expect(extractUrlCandidate('')).toBe('');
      expect(extractUrlCandidate('   ')).toBe('');
    });
  });

  describe('parseCricHeroesUrl - Valid Profile Links', () => {
    it('parses standard cricheroes.com profile URL with slug', () => {
      const res = parseCricHeroesUrl('https://cricheroes.com/player-profile/1234567/rohit-sharma');
      expect(res.isValid).toBe(true);
      expect(res.isProfile).toBe(true);
      expect(res.playerId).toBe('1234567');
      expect(res.playerSlug).toBe('rohit-sharma');
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/1234567/rohit-sharma');
      expect(res.urlType).toBe('PLAYER_PROFILE');
      expect(res.error).toBeNull();
    });

    it('parses cricheroes.in domain', () => {
      const res = parseCricHeroesUrl('https://cricheroes.in/player-profile/7654321/anand-kumar');
      expect(res.isValid).toBe(true);
      expect(res.playerId).toBe('7654321');
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/7654321/anand-kumar');
    });

    it('parses www.cricheroes.com and app.cricheroes.com subdomains', () => {
      const res1 = parseCricHeroesUrl('https://www.cricheroes.com/player-profile/998877');
      expect(res1.isValid).toBe(true);
      expect(res1.playerId).toBe('998877');
      expect(res1.canonicalUrl).toBe('https://cricheroes.com/player-profile/998877');

      const res2 = parseCricHeroesUrl('https://app.cricheroes.com/player-profile/443322/player-name');
      expect(res2.isValid).toBe(true);
      expect(res2.playerId).toBe('443322');
    });

    it('normalizes URLs without protocol or with trailing slashes', () => {
      const res = parseCricHeroesUrl('cricheroes.com/player-profile/12345/sachin-t/');
      expect(res.isValid).toBe(true);
      expect(res.playerId).toBe('12345');
      expect(res.playerSlug).toBe('sachin-t');
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/12345/sachin-t');
    });

    it('strips tracking query parameters and hash fragments in canonicalUrl', () => {
      const res = parseCricHeroesUrl(
        'https://cricheroes.com/player-profile/887766/jasprit-b?m=share&utm_source=app#stats'
      );
      expect(res.isValid).toBe(true);
      expect(res.playerId).toBe('887766');
      expect(res.playerSlug).toBe('jasprit-b');
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/887766/jasprit-b');
    });

    it('supports /player/ and /user/ path variants', () => {
      const res1 = parseCricHeroesUrl('https://cricheroes.com/player/5544/hardik-p');
      expect(res1.isValid).toBe(true);
      expect(res1.playerId).toBe('5544');

      const res2 = parseCricHeroesUrl('https://cricheroes.com/user/6677');
      expect(res2.isValid).toBe(true);
      expect(res2.playerId).toBe('6677');
    });
  });

  describe('parseCricHeroesUrl - Non-Profile CricHeroes URLs', () => {
    it('detects and rejects match scorecard links with specific error', () => {
      const res = parseCricHeroesUrl('https://cricheroes.com/scorecard/123456/final-match');
      expect(res.isValid).toBe(false);
      expect(res.isProfile).toBe(false);
      expect(res.urlType).toBe('SCORECARD');
      expect(res.error).toContain('scorecard');
    });

    it('detects and rejects tournament links', () => {
      const res = parseCricHeroesUrl('https://cricheroes.com/tournament/987/inter-college-cup');
      expect(res.isValid).toBe(false);
      expect(res.urlType).toBe('TOURNAMENT');
      expect(res.error).toContain('tournament');
    });

    it('detects and rejects team/club links', () => {
      const res = parseCricHeroesUrl('https://cricheroes.com/team/4567/avanthi-titans');
      expect(res.isValid).toBe(false);
      expect(res.urlType).toBe('TEAM');
      expect(res.error).toContain('team');
    });

    it('rejects homepage or empty path', () => {
      const res = parseCricHeroesUrl('https://cricheroes.com/');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('homepage');
    });
  });

  describe('parseCricHeroesUrl - Invalid / Non-CricHeroes URLs', () => {
    it('rejects other cricket websites like espncricinfo or cricbuzz', () => {
      const res = parseCricHeroesUrl('https://www.espncricinfo.com/player/rohit-sharma-34102');
      expect(res.isValid).toBe(false);
      expect(res.urlType).toBe('INVALID_DOMAIN');
      expect(res.error).toContain('cricheroes.com or cricheroes.in');
    });

    it('rejects general non-CricHeroes URLs', () => {
      const res = parseCricHeroesUrl('https://google.com');
      expect(res.isValid).toBe(false);
      expect(res.urlType).toBe('INVALID_DOMAIN');
    });

    it('rejects malformed text and empty input', () => {
      expect(parseCricHeroesUrl('').isValid).toBe(false);
      expect(parseCricHeroesUrl('not a url').isValid).toBe(false);
      expect(parseCricHeroesUrl('http://').isValid).toBe(false);
    });
  });

  describe('resolveCricHeroesProfile - Async & Race Condition Protection', () => {
    it('returns verified player ID without fabricating stats', async () => {
      const result = await resolveCricHeroesProfile(
        'https://cricheroes.com/player-profile/101010/ravindra-j',
        1
      );
      expect(result.success).toBe(true);
      expect(result.requestId).toBe(1);
      expect(result.verifiedPlayerId).toBe('101010');
      expect(result.canonicalUrl).toBe('https://cricheroes.com/player-profile/101010/ravindra-j');
      expect(result.message).toContain('Verified CricHeroes Profile');
      // Must NOT contain fake stats or fabricated numbers
      expect((result as any).matches).toBeUndefined();
      expect((result as any).runs).toBeUndefined();
    });

    it('handles rapid sequential updates with request sequencing', async () => {
      let activeRequestId = 0;
      let latestAcceptedPlayerId: string | null = null;

      // Simulate user typing/pasting first URL (slow)
      const req1 = ++activeRequestId;
      const promise1 = new Promise<any>((resolve) => {
        setTimeout(async () => {
          const res = await resolveCricHeroesProfile(
            'https://cricheroes.com/player-profile/1111/first-player',
            req1
          );
          resolve(res);
        }, 50);
      });

      // Simulate user quickly pasting second URL (fast)
      const req2 = ++activeRequestId;
      const res2 = await resolveCricHeroesProfile(
        'https://cricheroes.com/player-profile/2222/second-player',
        req2
      );

      // Verify req2 was applied
      if (res2.requestId === activeRequestId) {
        latestAcceptedPlayerId = res2.verifiedPlayerId;
      }
      expect(latestAcceptedPlayerId).toBe('2222');

      // Now req1 finishes late
      const res1 = await promise1;
      // Stale response must be discarded because its requestId is older than activeRequestId
      if (res1.requestId === activeRequestId) {
        latestAcceptedPlayerId = res1.verifiedPlayerId;
      }

      // The final state remains req2, never overwritten by req1!
      expect(latestAcceptedPlayerId).toBe('2222');
    });
  });
});
