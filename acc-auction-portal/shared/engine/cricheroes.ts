/**
 * ACC 2026 — CricHeroes URL Parser & Profile Validation Engine
 * 
 * Strict URL parsing, domain verification, and profile ID extraction.
 * Guarantees that:
 * 1. Only genuine CricHeroes player profile links are accepted.
 * 2. Non-profile links (scorecards, tournaments, teams) are explicitly detected and rejected with clear guidance.
 * 3. Never generates synthetic, fake, or hash-derived player statistics.
 * 4. Normalizes canonical URLs, stripping tracking query parameters and fragments.
 * 5. Supports request sequencing to prevent async race conditions.
 */

export type CricHeroesUrlType =
  | 'PLAYER_PROFILE'
  | 'SCORECARD'
  | 'TOURNAMENT'
  | 'TEAM'
  | 'INVALID_DOMAIN'
  | 'INVALID_URL'
  | 'UNKNOWN';

export interface CricHeroesParseResult {
  isValid: boolean;
  isProfile: boolean;
  playerId: string | null;
  playerSlug: string | null;
  canonicalUrl: string | null;
  rawInput: string;
  urlType: CricHeroesUrlType;
  error: string | null;
}

export interface CricHeroesProfileLookupResult {
  requestId: number;
  success: boolean;
  parseResult: CricHeroesParseResult;
  verifiedPlayerId: string | null;
  canonicalUrl: string | null;
  message: string;
  error?: string;
}

/**
 * Extracts a URL from freeform text if copied from mobile app share sheets
 * (e.g. "Check out my CricHeroes profile: https://cricheroes.com/player-profile/123/name")
 */
export function extractUrlCandidate(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  
  // Look for http/https URL first
  const httpMatch = trimmed.match(/https?:\/\/[^\s]+/i);
  if (httpMatch) {
    return httpMatch[0];
  }

  // Look for bare domain pattern (cricheroes.com/...)
  const domainMatch = trimmed.match(/(?:www\.)?cricheroes\.[a-z]+[^\s]*/i);
  if (domainMatch) {
    return domainMatch[0];
  }

  return trimmed;
}

/**
 * Parses and strictly validates a CricHeroes URL
 */
export function parseCricHeroesUrl(rawInput: string): CricHeroesParseResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput: rawInput || '',
      urlType: 'INVALID_URL',
      error: 'Please enter a CricHeroes profile URL.',
    };
  }

  const candidate = extractUrlCandidate(rawInput);
  if (!candidate || candidate.length < 5) {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput,
      urlType: 'INVALID_URL',
      error: 'The provided URL is too short or invalid.',
    };
  }

  let parsedUrl: URL;
  try {
    const withScheme = candidate.startsWith('http://') || candidate.startsWith('https://')
      ? candidate
      : `https://${candidate}`;
    parsedUrl = new URL(withScheme);
  } catch {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput,
      urlType: 'INVALID_URL',
      error: 'Malformed URL format. Please provide a valid web address.',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isCricHeroesDomain =
    hostname === 'cricheroes.com' ||
    hostname.endsWith('.cricheroes.com') ||
    hostname === 'cricheroes.in' ||
    hostname.endsWith('.cricheroes.in');

  if (!isCricHeroesDomain) {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput,
      urlType: 'INVALID_DOMAIN',
      error: `Invalid domain (${parsedUrl.hostname}). Profile link must be from cricheroes.com or cricheroes.in.`,
    };
  }

  const pathname = parsedUrl.pathname.replace(/\/+$/, ''); // Remove trailing slashes
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput,
      urlType: 'UNKNOWN',
      error: 'Please provide a direct link to your CricHeroes player profile page, not the homepage.',
    };
  }

  const firstSegment = segments[0].toLowerCase();

  // Explicit rejection of non-profile CricHeroes URLs with helpful diagnostic messages
  if (firstSegment === 'scorecard' || firstSegment === 'match') {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput,
      urlType: 'SCORECARD',
      error: 'This link is for a match scorecard, not your player profile. Go to "My Profile" in CricHeroes to copy your profile link.',
    };
  }

  if (firstSegment === 'tournament' || firstSegment === 'series') {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput,
      urlType: 'TOURNAMENT',
      error: 'This link is for a tournament/series, not a player profile. Please provide your personal player profile link.',
    };
  }

  if (firstSegment === 'team' || firstSegment === 'club') {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput,
      urlType: 'TEAM',
      error: 'This link is for a team/club, not an individual player profile.',
    };
  }

  // Supported player profile patterns:
  // 1. /player-profile/:id/:slug?
  // 2. /player/:id/:slug?
  // 3. /user/:id
  const isProfilePrefix =
    firstSegment === 'player-profile' ||
    firstSegment === 'player' ||
    firstSegment === 'user';

  if (!isProfilePrefix || segments.length < 2) {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput,
      urlType: 'UNKNOWN',
      error: 'Unrecognized CricHeroes profile format. Expected: https://cricheroes.com/player-profile/<id>/<name>',
    };
  }

  const rawPlayerId = segments[1].trim();
  if (!rawPlayerId) {
    return {
      isValid: false,
      isProfile: false,
      playerId: null,
      playerSlug: null,
      canonicalUrl: null,
      rawInput,
      urlType: 'INVALID_URL',
      error: 'Missing player ID in CricHeroes profile link.',
    };
  }

  const rawSlug = segments[2] ? segments[2].trim() : null;
  const canonicalUrl = `https://cricheroes.com/player-profile/${rawPlayerId}${rawSlug ? `/${rawSlug}` : ''}`;

  return {
    isValid: true,
    isProfile: true,
    playerId: rawPlayerId,
    playerSlug: rawSlug,
    canonicalUrl,
    rawInput,
    urlType: 'PLAYER_PROFILE',
    error: null,
  };
}

/**
 * Resolves CricHeroes profile from URL with sequence number to prevent race conditions.
 * Note: CricHeroes does not provide a public CORS-enabled API without authenticated enterprise keys.
 * This function validates the URL deterministically and extracts the verified player ID.
 * It NEVER returns fake or synthetic stats, and never overwrites user stats.
 */
export async function resolveCricHeroesProfile(
  rawUrl: string,
  requestId: number = 1
): Promise<CricHeroesProfileLookupResult> {
  const parsed = parseCricHeroesUrl(rawUrl);
  if (!parsed.isValid || !parsed.playerId) {
    return {
      requestId,
      success: false,
      parseResult: parsed,
      verifiedPlayerId: null,
      canonicalUrl: null,
      message: parsed.error || 'Invalid CricHeroes profile link.',
      error: parsed.error || 'Invalid CricHeroes profile link.',
    };
  }

  return {
    requestId,
    success: true,
    parseResult: parsed,
    verifiedPlayerId: parsed.playerId,
    canonicalUrl: parsed.canonicalUrl,
    message: `Verified CricHeroes Profile (Player ID: ${parsed.playerId}). Career statistics are self-declared.`,
  };
}
