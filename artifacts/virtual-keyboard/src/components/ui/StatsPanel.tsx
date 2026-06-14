import { useStore } from '@/store';
import { getLevelInfo, ACHIEVEMENTS, RARITY_COLORS } from '@/lib/achievements';
import { cn, formatTime } from '@/lib/utils';
import { Trophy, Zap, Target, TrendingUp, Star, Flame, BarChart2, Award } from 'lucide-react';

function StatCard({ label, value, sub, color = 'text-white', icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white/04 border border-white/07 rounded-xl p-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-1 text-white/35">
        {icon}
        <span className="text-[0.48rem] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className={cn('text-base font-black font-mono leading-none', color)}>{value}</div>
      {sub && <div className="text-[0.48rem] text-white/30">{sub}</div>}
    </div>
  );
}

function MiniBar({ label, value, max, color = 'bg-violet-500' }: {
  label: string; value: number; max: number; color?: string;
}) {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0);
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <span className="text-[0.5rem] text-white/40 uppercase tracking-wider">{label}</span>
        <span className="text-[0.5rem] font-mono text-white/55">{value.toLocaleString()}</span>
      </div>
      <div className="h-1 bg-white/05 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StatsPanel({ onClose }: { onClose: () => void }) {
  const {
    bestWpm, bestAccuracy, totalKeystrokes, totalSessions, totalWordsTyped,
    totalNotesPlayed, xp, dailyStreak, longestStreak, sessionHistory,
    unlockedAchievements, modesUsed, dailyKeystrokesToday, dailyGoalKeystrokes,
    dailyGoalWpm, recordingsCount, lessonsCompleted, bestTimedWpm, dailySessionsToday,
  } = useStore();

  const { current: lvl, next, progress } = getLevelInfo(xp);
  const recentSessions = sessionHistory.slice(0, 8);

  const unlockedAchs = ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id));
  const nextAchs = ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id)).slice(0, 4);

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3" style={{ touchAction: 'pan-y' }}>
      {/* XP Level Bar */}
      <div className="bg-gradient-to-r from-violet-600/15 to-blue-600/10 border border-violet-500/25 rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[0.48rem] text-violet-400/70 uppercase tracking-widest font-bold">Level {lvl.level}</div>
            <div className="text-sm font-black text-white leading-tight">{lvl.title}</div>
          </div>
          <div className="text-right">
            <div className="text-[0.48rem] text-white/30 uppercase tracking-wider">Total XP</div>
            <div className="text-sm font-black text-violet-300 font-mono">{xp.toLocaleString()}</div>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/05">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[0.44rem] text-white/25">
            <span>{lvl.minXp} XP</span>
            <span>{progress}% → {next.title}</span>
            <span>{next.minXp} XP</span>
          </div>
        </div>
      </div>

      {/* Personal Records */}
      <div>
        <div className="text-[0.48rem] font-bold text-white/30 uppercase tracking-widest mb-1.5">Personal Records</div>
        <div className="grid grid-cols-2 gap-1.5">
          <StatCard label="Best WPM" value={bestWpm} color="text-violet-300" icon={<Zap className="w-2.5 h-2.5" />} />
          <StatCard label="Best Accuracy" value={`${bestAccuracy}%`} color="text-emerald-300" icon={<Target className="w-2.5 h-2.5" />} />
          <StatCard label="Best Timed WPM" value={bestTimedWpm} color="text-amber-300" icon={<TrendingUp className="w-2.5 h-2.5" />} />
          <StatCard label="Keystrokes" value={totalKeystrokes.toLocaleString()} color="text-blue-300" icon={<BarChart2 className="w-2.5 h-2.5" />} />
          <StatCard label="Sessions" value={totalSessions} color="text-pink-300" icon={<Star className="w-2.5 h-2.5" />} />
          <StatCard label="Words Typed" value={totalWordsTyped.toLocaleString()} color="text-cyan-300" icon={<TrendingUp className="w-2.5 h-2.5" />} />
          <StatCard label="Notes Played" value={totalNotesPlayed.toLocaleString()} color="text-fuchsia-300" icon={<Trophy className="w-2.5 h-2.5" />} />
          <StatCard label="Recordings" value={recordingsCount} color="text-orange-300" />
        </div>
      </div>

      {/* Daily Goals */}
      <div>
        <div className="text-[0.48rem] font-bold text-white/30 uppercase tracking-widest mb-1.5">Today's Progress</div>
        <div className="bg-white/03 border border-white/07 rounded-xl p-2.5 space-y-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-xs font-bold text-white">{dailyStreak} day streak</span>
            <span className="text-[0.5rem] text-white/30">/ best {longestStreak}</span>
          </div>
          <MiniBar label="Keystrokes Today" value={dailyKeystrokesToday} max={dailyGoalKeystrokes} color="bg-blue-500" />
          <MiniBar label="Modes Explored" value={modesUsed.length} max={10} color="bg-violet-500" />
          <MiniBar label="Lessons Done" value={lessonsCompleted.length} max={10} color="bg-emerald-500" />
          <MiniBar label="Sessions Today" value={dailySessionsToday} max={5} color="bg-amber-500" />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[0.48rem] font-bold text-white/30 uppercase tracking-widest">
            Achievements ({unlockedAchs.length}/{ACHIEVEMENTS.length})
          </div>
          <Award className="w-3 h-3 text-amber-400" />
        </div>
        {unlockedAchs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {unlockedAchs.slice(-12).map(a => (
              <div
                key={a.id}
                title={`${a.title}: ${a.desc}`}
                className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm border',
                  RARITY_COLORS[a.rarity].bg, RARITY_COLORS[a.rarity].border)}
              >
                {a.icon}
              </div>
            ))}
          </div>
        )}
        {nextAchs.length > 0 && (
          <div className="space-y-1">
            <div className="text-[0.44rem] text-white/25 uppercase tracking-widest mb-1">Up Next</div>
            {nextAchs.map(a => (
              <div key={a.id} className={cn('flex items-center gap-2 px-2 py-1.5 rounded-lg border',
                'border-white/06 bg-white/02')}>
                <span className="text-sm opacity-40">{a.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.55rem] font-bold text-white/50 truncate">{a.title}</div>
                  <div className="text-[0.45rem] text-white/25 truncate">{a.desc}</div>
                </div>
                <span className={cn('text-[0.45rem] font-bold shrink-0', RARITY_COLORS[a.rarity].text)}>+{a.xp} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session History */}
      {recentSessions.length > 0 && (
        <div>
          <div className="text-[0.48rem] font-bold text-white/30 uppercase tracking-widest mb-1.5">Recent Sessions</div>
          <div className="space-y-1">
            {recentSessions.map(s => {
              const date = new Date(s.date);
              const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              const accColor = s.accuracy >= 97 ? 'text-emerald-400' : s.accuracy >= 88 ? 'text-yellow-400' : 'text-red-400';
              return (
                <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 bg-white/02 border border-white/05 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.48rem] text-white/30">{label} {time}</div>
                    <div className="text-[0.52rem] text-white/50 capitalize">{s.mode}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-violet-300">{s.wpm}<span className="text-[0.44rem] text-white/30 ml-0.5">WPM</span></div>
                    </div>
                    <div className="text-right">
                      <div className={cn('text-xs font-bold font-mono', accColor)}>{s.accuracy}%</div>
                    </div>
                    <div className="text-[0.48rem] text-amber-400 font-bold">+{s.xpEarned} XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
