import React, { useState, useMemo } from 'react';
import { parseCricHeroesUrl, extractUrlCandidate } from '@shared/engine/cricheroes';

interface StatsCricHeroesStepProps {
  cricHeroesUrl: string;
  cricHeroesMobile: string;
  cricHeroesPending: boolean;
  matchesPlayed: number;
  runsScored: number;
  highestScore: number;
  battingAverage: number;
  strikeRate: number;
  wicketsTaken: number;
  bowlingAverage: number;
  economyRate: number;
  bestBowling: string;
  catches: number;
  stumpings: number;
  onChange: (field: string, value: any) => void;
}

export const StatsCricHeroesStep: React.FC<StatsCricHeroesStepProps> = ({
  cricHeroesUrl,
  cricHeroesMobile,
  cricHeroesPending,
  matchesPlayed,
  runsScored,
  highestScore,
  battingAverage,
  strikeRate,
  wicketsTaken,
  bowlingAverage,
  economyRate,
  bestBowling,
  catches,
  stumpings,
  onChange,
}) => {
  const [statsOpen, setStatsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Deterministic validation of the current CricHeroes URL
  const parseResult = useMemo(() => {
    if (!cricHeroesUrl || !cricHeroesUrl.trim()) return null;
    return parseCricHeroesUrl(cricHeroesUrl);
  }, [cricHeroesUrl]);

  const handleSkipCricHeroes = () => {
    onChange('cricHeroesPending', !cricHeroesPending);
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted) {
      const extracted = extractUrlCandidate(pasted);
      if (extracted && extracted !== pasted) {
        e.preventDefault();
        onChange('cricHeroesUrl', extracted);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100">
          Step 4: CricHeroes Profile & Career Stats
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Link your official CricHeroes cricket profile for statistical verification. If you don't have one yet, registration remains completely non-blocking.
        </p>
      </div>

      {/* CricHeroes Panel */}
      <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              CricHeroes Profile Verification
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSkipCricHeroes}
            className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              cricHeroesPending
                ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {cricHeroesPending ? '✓ Flagged: Profile Creation Pending' : '[ SKIP FOR NOW — I’LL ADD LATER ]'}
          </button>
        </div>

        {cricHeroesPending ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            <p className="font-bold mb-1">ⓘ Non-blocking status active</p>
            <p>
              Your player account will be submitted with status: <strong>"Profile Creation Pending"</strong>. You can update your CricHeroes URL anytime before the auction directly from your Player Dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  CricHeroes Profile URL
                </label>
                <input
                  type="url"
                  value={cricHeroesUrl}
                  onChange={(e) => onChange('cricHeroesUrl', e.target.value)}
                  onPaste={handleUrlPaste}
                  placeholder="https://cricheroes.com/player-profile/..."
                  className={`w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                    parseResult
                      ? parseResult.isValid
                        ? 'border-emerald-500/80 focus:ring-emerald-500'
                        : 'border-rose-500/80 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  CricHeroes Mobile (Private)
                </label>
                <input
                  type="tel"
                  value={cricHeroesMobile}
                  onChange={(e) => onChange('cricHeroesMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Mobile registered with CricHeroes app"
                  className="w-full min-h-[48px] px-4 py-3 bg-white/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  May differ from your contact number. Stored privately for record reconciliation.
                </p>
              </div>
            </div>

            {/* Validation Feedback Banner */}
            {parseResult && (
              parseResult.isValid ? (
                <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      CricHeroes Profile Verified
                    </span>
                    <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-700 font-semibold">
                      Player ID: {parseResult.playerId}
                    </span>
                    {parseResult.playerSlug && (
                      <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                        ({parseResult.playerSlug})
                      </span>
                    )}
                  </div>
                  {parseResult.canonicalUrl && parseResult.canonicalUrl !== cricHeroesUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => onChange('cricHeroesUrl', parseResult.canonicalUrl!)}
                      className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900"
                    >
                      Use Clean Canonical URL
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
                  <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300 mb-1">
                    <span>⚠</span>
                    <span>Invalid Profile URL</span>
                  </div>
                  <p>{parseResult.error}</p>
                </div>
              )
            )}
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            \u24D8 How to create and find your CricHeroes profile?
          </button>
          {showGuide && (
            <div className="mt-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p>1. Download the CricHeroes app from Google Play or Apple App Store.</p>
              <p>2. Sign up with your mobile number and enter your full name.</p>
              <p>3. Tap "My Profile" \u2192 Share Icon \u2192 Copy Profile Link, and paste it above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Career Statistics (Self-Declared) */}
      <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <div
          onClick={() => setStatsOpen(!statsOpen)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                Career Cricket Statistics
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                Self-Declared
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Declared career benchmarks. Labeled as self-declared throughout the platform.
            </p>
          </div>
          <button
            type="button"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 text-lg font-bold"
          >
            {statsOpen ? '\u2212' : '+'}
          </button>
        </div>

        {statsOpen && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium">
              \u24D8 Self-declared metrics. CricHeroes profile link helps Super Admin verify performance during squad bidding.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Matches Played</label>
                <input
                  type="number"
                  min="0"
                  value={matchesPlayed || ''}
                  onChange={(e) => onChange('matchesPlayed', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Runs</label>
                <input
                  type="number"
                  min="0"
                  value={runsScored || ''}
                  onChange={(e) => onChange('runsScored', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Batting Average</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={battingAverage || ''}
                  onChange={(e) => onChange('battingAverage', Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Strike Rate</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={strikeRate || ''}
                  onChange={(e) => onChange('strikeRate', Number(e.target.value))}
                  placeholder="0.0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Highest Score</label>
                <input
                  type="number"
                  min="0"
                  value={highestScore || ''}
                  onChange={(e) => onChange('highestScore', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Wickets Taken</label>
                <input
                  type="number"
                  min="0"
                  value={wicketsTaken || ''}
                  onChange={(e) => onChange('wicketsTaken', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bowling Average</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bowlingAverage || ''}
                  onChange={(e) => onChange('bowlingAverage', Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Economy Rate</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={economyRate || ''}
                  onChange={(e) => onChange('economyRate', Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Best Bowling Figures</label>
                <input
                  type="text"
                  value={bestBowling || ''}
                  onChange={(e) => onChange('bestBowling', e.target.value)}
                  placeholder="e.g. 4/18"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catches</label>
                <input
                  type="number"
                  min="0"
                  value={catches || ''}
                  onChange={(e) => onChange('catches', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stumpings</label>
                <input
                  type="number"
                  min="0"
                  value={stumpings || ''}
                  onChange={(e) => onChange('stumpings', Number(e.target.value))}
                  placeholder="0"
                  className="w-full min-h-[44px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
