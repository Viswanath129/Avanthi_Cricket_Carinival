export type PlayerType = 'WK_BATTER' | 'WK' | 'ALL_ROUNDER' | 'BATTER' | 'BOWLER' | 'FIELDER';

export interface SkillInput {
  isWicketKeeper: boolean;
  battingPrimary: boolean;
  bowlingPrimary: boolean;
}

export function derivePlayerType(input: SkillInput): PlayerType {
  if (input.isWicketKeeper) {
    return input.battingPrimary ? 'WK_BATTER' : 'WK';
  }
  if (input.battingPrimary && input.bowlingPrimary) {
    return 'ALL_ROUNDER';
  }
  if (input.battingPrimary) {
    return 'BATTER';
  }
  if (input.bowlingPrimary) {
    return 'BOWLER';
  }
  return 'FIELDER';
}
