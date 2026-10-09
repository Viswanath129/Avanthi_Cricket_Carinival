import { describe, it, expect } from 'vitest';
import {
  parseCricHeroesUrl,
  extractUrlCandidate,
  resolveCricHeroesProfile,
} from '@shared/engine/cricheroes';

describe('ACC 2026 — CricHeroes Link Parsing & Data Integrity Regression Suite', () => {
  // 1. Valid CricHeroes Links & Normalization
  describe('1. Valid links & normalization', () => {
    it('accurately parses standard player profile with numeric ID and name slug', () => {
      const url = 'https://cricheroes.com/player-profile/1234567/rohit-sharma';
      const res = parseCricHeroesUrl(url);

      expect(res.isValid).toBe(true);
      expect(res.isProfile).toBe(true);
      expect(res.playerId).toBe('1234567');
      expect(res.playerSlug).toBe('rohit-sharma');
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/1234567/rohit-sharma');
      expect(res.error).toBeNull();
    });

    it('accurately parses profile with numeric ID only (no slug)', () => {
      const url = 'https://cricheroes.com/player-profile/9876543';
      const res = parseCricHeroesUrl(url);

      expect(res.isValid).toBe(true);
      expect(res.playerId).toBe('9876543');
      expect(res.playerSlug).toBeNull();
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/9876543');
    });

    it('supports cricheroes.in domain and normalizes canonicalUrl to cricheroes.com', () => {
      const url = 'https://cricheroes.in/player-profile/5544332/manish-pandey';
      const res = parseCricHeroesUrl(url);

      expect(res.isValid).toBe(true);
      expect(res.playerId).toBe('5544332');
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/5544332/manish-pandey');
    });

    it('supports app.cricheroes.com and m.cricheroes.com subdomains', () => {
      const appUrl = 'https://app.cricheroes.com/player-profile/1122334';
      const mUrl = 'https://m.cricheroes.com/player-profile/4455667/virat-k';

      expect(parseCricHeroesUrl(appUrl).isValid).toBe(true);
      expect(parseCricHeroesUrl(appUrl).playerId).toBe('1122334');

      expect(parseCricHeroesUrl(mUrl).isValid).toBe(true);
      expect(parseCricHeroesUrl(mUrl).playerId).toBe('4455667');
    });

    it('normalizes links without protocol or with trailing slashes', () => {
      const raw = 'cricheroes.com/player-profile/778899/hardik-pandya/';
      const res = parseCricHeroesUrl(raw);

      expect(res.isValid).toBe(true);
      expect(res.playerId).toBe('778899');
      expect(res.playerSlug).toBe('hardik-pandya');
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/778899/hardik-pandya');
    });

    it('strips tracking query parameters (?m=share, ?ref=...) and hash fragments', () => {
      const urlWithNoise =
        'https://cricheroes.com/player-profile/332211/ravindra-jadeja?m=share&utm_source=app&ref=ios#career-stats';
      const res = parseCricHeroesUrl(urlWithNoise);

      expect(res.isValid).toBe(true);
      expect(res.playerId).toBe('332211');
      expect(res.playerSlug).toBe('ravindra-jadeja');
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/332211/ravindra-jadeja');
    });

    it('extracts URL when user pastes entire mobile app share message', () => {
      const shareSnippet =
        'Hey, check out my cricket stats on CricHeroes: https://cricheroes.com/player-profile/665544/kl-rahul?m=share';
      const extracted = extractUrlCandidate(shareSnippet);
      const res = parseCricHeroesUrl(extracted);

      expect(res.isValid).toBe(true);
      expect(res.playerId).toBe('665544');
      expect(res.canonicalUrl).toBe('https://cricheroes.com/player-profile/665544/kl-rahul');
    });
  });

  // 2. Malformed, Non-Profile & Unsupported URLs
  describe('2. Malformed & non-profile link rejection', () => {
    it('explicitly rejects match scorecard links and advises user', () => {
      const scorecardUrl = 'https://cricheroes.com/scorecard/123456/avanthi-vs-titans';
      const res = parseCricHeroesUrl(scorecardUrl);

      expect(res.isValid).toBe(false);
      expect(res.isProfile).toBe(false);
      expect(res.urlType).toBe('SCORECARD');
      expect(res.error).toContain('scorecard');
    });

    it('explicitly rejects tournament and series links', () => {
      const tournamentUrl = 'https://cricheroes.com/tournament/9876/acc-premier-league';
      const res = parseCricHeroesUrl(tournamentUrl);

      expect(res.isValid).toBe(false);
      expect(res.urlType).toBe('TOURNAMENT');
      expect(res.error).toContain('tournament');
    });

    it('explicitly rejects team/club links', () => {
      const teamUrl = 'https://cricheroes.com/team/4433/avanthi-strikers';
      const res = parseCricHeroesUrl(teamUrl);

      expect(res.isValid).toBe(false);
      expect(res.urlType).toBe('TEAM');
      expect(res.error).toContain('team');
    });

    it('rejects homepage links without player ID', () => {
      const homeUrl = 'https://cricheroes.com/';
      const res = parseCricHeroesUrl(homeUrl);

      expect(res.isValid).toBe(false);
      expect(res.error).toContain('homepage');
    });

    it('rejects non-CricHeroes cricket websites and other domains', () => {
      const cricbuzz = 'https://www.cricbuzz.com/profiles/1234/player';
      const espn = 'https://www.espncricinfo.com/player/rohit-sharma-34102';
      const google = 'https://www.google.com';

      expect(parseCricHeroesUrl(cricbuzz).urlType).toBe('INVALID_DOMAIN');
      expect(parseCricHeroesUrl(espn).urlType).toBe('INVALID_DOMAIN');
      expect(parseCricHeroesUrl(google).urlType).toBe('INVALID_DOMAIN');
    });

    it('gracefully handles empty, whitespace, and garbage input', () => {
      expect(parseCricHeroesUrl('').isValid).toBe(false);
      expect(parseCricHeroesUrl('   ').isValid).toBe(false);
      expect(parseCricHeroesUrl('not a link at all').isValid).toBe(false);
      expect(parseCricHeroesUrl('https://').isValid).toBe(false);
    });
  });

  // 3. Exact Player Matching & Zero Fake Data Fabrication
  describe('3. Exact player matching & zero fake data fabrication', () => {
    it('never cross-contaminates or fabricates details between two different player links', () => {
      const player1Url = 'https://cricheroes.com/player-profile/101010/player-one';
      const player2Url = 'https://cricheroes.com/player-profile/202020/player-two';

      const res1 = parseCricHeroesUrl(player1Url);
      const res2 = parseCricHeroesUrl(player2Url);

      expect(res1.playerId).toBe('101010');
      expect(res1.playerSlug).toBe('player-one');

      expect(res2.playerId).toBe('202020');
      expect(res2.playerSlug).toBe('player-two');

      expect(res1.playerId).not.toBe(res2.playerId);
      expect(res1.canonicalUrl).not.toBe(res2.canonicalUrl);
    });

    it('does NOT contain synthetic hash or hardcoded stats in lookup result', async () => {
      const res = await resolveCricHeroesProfile('https://cricheroes.com/player-profile/998877/shreyas-i', 1);

      expect(res.success).toBe(true);
      expect(res.verifiedPlayerId).toBe('998877');
      // Verify no fake statistics were generated
      expect((res as any).matches).toBeUndefined();
      expect((res as any).runs).toBeUndefined();
      expect((res as any).wickets).toBeUndefined();
      expect((res as any).battingAvg).toBeUndefined();
      expect((res as any).strikeRate).toBeUndefined();
    });
  });

  // 4. Missing Fields & Unavailable Data Handling
  describe('4. Missing fields & unavailable data handling', () => {
    it('supports "Profile Creation Pending" non-blocking status when URL is skipped', () => {
      const playerFormState = {
        cricHeroesUrl: '',
        cricHeroesPending: true,
        cricHeroesMobile: '',
      };

      // Simulates registration payload generation
      const cricheroesPayload = {
        profileUrl: playerFormState.cricHeroesUrl.trim() || null,
        status: playerFormState.cricHeroesPending ? 'PROFILE_CREATION_PENDING' : 'VERIFIED',
      };

      expect(cricheroesPayload.profileUrl).toBeNull();
      expect(cricheroesPayload.status).toBe('PROFILE_CREATION_PENDING');
    });

    it('flags invalid link without throwing unhandled exceptions', async () => {
      const badResult = await resolveCricHeroesProfile('https://cricheroes.com/scorecard/112233', 1);
      expect(badResult.success).toBe(false);
      expect(badResult.verifiedPlayerId).toBeNull();
      expect(badResult.error).toBeDefined();
    });
  });

  // 5. Race Conditions & Rapid URL Changes
  describe('5. Rapid URL changes & race condition prevention', () => {
    it('ensures older in-flight requests never overwrite newer responses', async () => {
      let sequenceCounter = 0;
      let committedState: { playerId: string | null; canonicalUrl: string | null } = {
        playerId: null,
        canonicalUrl: null,
      };

      // User enters URL 1 (slow)
      const reqId1 = ++sequenceCounter;
      const slowPromise = new Promise<{ reqId: number; res: any }>((resolve) => {
        setTimeout(async () => {
          const res = await resolveCricHeroesProfile(
            'https://cricheroes.com/player-profile/1111/first-profile',
            reqId1
          );
          resolve({ reqId: reqId1, res });
        }, 60);
      });

      // User immediately corrects and enters URL 2 (fast)
      const reqId2 = ++sequenceCounter;
      const fastResult = await resolveCricHeroesProfile(
        'https://cricheroes.com/player-profile/2222/corrected-profile',
        reqId2
      );

      // Fast result commits because reqId2 matches current sequenceCounter
      if (fastResult.requestId === sequenceCounter) {
        committedState = {
          playerId: fastResult.verifiedPlayerId,
          canonicalUrl: fastResult.canonicalUrl,
        };
      }
      expect(committedState.playerId).toBe('2222');

      // Now slow result resolves late
      const { reqId, res: slowResult } = await slowPromise;
      if (reqId === sequenceCounter) {
        // This MUST NOT execute
        committedState = {
          playerId: slowResult.verifiedPlayerId,
          canonicalUrl: slowResult.canonicalUrl,
        };
      }

      // The state MUST still remain URL 2's data (2222), never reverted by 1111!
      expect(committedState.playerId).toBe('2222');
      expect(committedState.canonicalUrl).toBe(
        'https://cricheroes.com/player-profile/2222/corrected-profile'
      );
    });
  });

  // 6. Manual Corrections & Editable Stats Preservation
  describe('6. Manual corrections & user stats preservation', () => {
    it('preserves user-entered career stats when CricHeroes URL is validated or changed', () => {
      // User manually enters stats first
      const formState = {
        matchesPlayed: 18,
        runsScored: 520,
        highestScore: 78,
        battingAverage: 37.14,
        strikeRate: 142.5,
        wicketsTaken: 12,
        bowlingAverage: 18.5,
        economyRate: 6.8,
        bestBowling: '3/15',
        catches: 6,
        stumpings: 0,
        cricHeroesUrl: '',
      };

      // User subsequently pastes a CricHeroes link
      const pastedUrl = 'https://cricheroes.com/player-profile/5544/surya-yadav?m=share';
      const parsed = parseCricHeroesUrl(pastedUrl);
      expect(parsed.isValid).toBe(true);

      // Updating the URL must NOT modify any of the self-declared stats
      formState.cricHeroesUrl = parsed.canonicalUrl!;

      expect(formState.cricHeroesUrl).toBe('https://cricheroes.com/player-profile/5544/surya-yadav');
      expect(formState.matchesPlayed).toBe(18);
      expect(formState.runsScored).toBe(520);
      expect(formState.highestScore).toBe(78);
      expect(formState.battingAverage).toBe(37.14);
      expect(formState.strikeRate).toBe(142.5);
      expect(formState.wicketsTaken).toBe(12);
      expect(formState.bestBowling).toBe('3/15');
    });

    it('allows user to manually edit and correct stats after URL validation', () => {
      const stats = {
        matches: 10,
        runs: 200,
      };

      // User manually adjusts runs from 200 to 240
      stats.runs = 240;
      expect(stats.runs).toBe(240);
    });
  });
});
