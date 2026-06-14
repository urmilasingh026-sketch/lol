import { useMemo } from 'react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { getLevelInfo, ACHIEVEMENTS } from '@/lib/achievements';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Flame, Zap, Trophy, Target, Clock, Keyboard, Star, TrendingUp, Award, Activity, Download } from 'lucide-react';

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-3 border-b border-white/05">
      <p className="text-[0.52rem] font-bold text-white/35 uppercase tracking-widest mb-2">{title}</p>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color = 'text-white/80', icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="flex-1 bg-white/04 border border-white/07 rounded-xl p-2.5 min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-white/30">{icon}</span>}
        <span className="text-[0.48rem] text-white/35 uppercase tracking-wider truncate">{label}</span>
      </div>
      <p className={cn('text-base font-black tabular-nums leading-none', color)}>{value}</p>
      {sub && <p className="text-[0.46rem] text-white/25 mt-0.5">{sub}</p>}
    </div>
  );
}

export function AnalyticsDashboard() {
  const store = useStore();
  const {
    sessionHistory, wpm, cpm, accuracy, errors, bestWpm, bestAccuracy, bestTimedWpm,
    totalKeystrokes, totalSessions, totalWordsTyped, totalNotesPlayed,
    xp, dailyStreak, longestStreak, dailyKeystrokesToday, dailySessionsToday,
    unlockedAchievements, keyHeatmap, modesUsed, lessonNumber, lessonsCompleted,
    dailyGoalWpm, dailyGoalKeystrokes,
  } = store;

  const { current: lvlInfo, next: nextLvl, progress: xpProgress } = getLevelInfo(xp);

  // WPM trend data (last 20 sessions)
  const wpmData = useMemo(() =>
    sessionHistory.slice(0, 20).reverse().map((s, i) => ({
      i: i + 1, wpm: s.wpm, acc: s.accuracy, errors: s.errors,
    })), [sessionHistory]);

  // Mode usage
  const modeData = useMemo(() => {
    const counts: Record<string, number> = {};
    sessionHistory.forEach(s => { counts[s.mode] = (counts[s.mode] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name: name.slice(0, 10), value }));
  }, [sessionHistory]);

  // Top heatmap keys
  const topKeys = useMemo(() =>
    Object.entries(keyHeatmap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key, count]) => ({ key: key.replace('Key', '').replace('Digit', ''), count })),
    [keyHeatmap]);

  // Daily progress
  const wpmGoalPct = Math.min(100, Math.round((wpm / dailyGoalWpm) * 100));
  const ksGoalPct = Math.min(100, Math.round((dailyKeystrokesToday / dailyGoalKeystrokes) * 100));

  // Accuracy distribution
  const accDist = useMemo(() => {
    const brackets = [
      { label: '98-100%', count: 0 }, { label: '90-97%', count: 0 },
      { label: '75-89%', count: 0 }, { label: '<75%', count: 0 },
    ];
    sessionHistory.forEach(s => {
      if (s.accuracy >= 98) brackets[0].count++;
      else if (s.accuracy >= 90) brackets[1].count++;
      else if (s.accuracy >= 75) brackets[2].count++;
      else brackets[3].count++;
    });
    return brackets;
  }, [sessionHistory]);

  return (
    <div className="flex flex-col">
      {/* XP / Level */}
      <Section title="Level & XP">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <span className="text-[0.9rem] font-black text-violet-300">{lvlInfo.level}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.6rem] font-bold text-white/80">{lvlInfo.title}</p>
            <div className="mt-1 h-1.5 rounded-full bg-white/08 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700"
                style={{ width: `${xpProgress}%` }} />
            </div>
            <p className="text-[0.46rem] text-white/30 mt-0.5">{xp.toLocaleString()} XP{nextLvl ? ` · ${nextLvl.minXp - xp} to Lv${nextLvl.level}` : ' · MAX'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <StatCard label="Streak" value={`${dailyStreak}d`} sub={`Best: ${longestStreak}d`} color="text-amber-400" icon={<Flame className="w-3 h-3" />} />
          <StatCard label="Achievements" value={`${unlockedAchievements.length}/${ACHIEVEMENTS.length}`} color="text-orange-400" icon={<Trophy className="w-3 h-3" />} />
        </div>
      </Section>

      {/* Live session */}
      <Section title="Current Session">
        <div className="grid grid-cols-2 gap-1.5">
          <StatCard label="WPM" value={wpm} sub={`Best: ${bestWpm}`} color="text-violet-300" icon={<Activity className="w-3 h-3" />} />
          <StatCard label="Accuracy" value={`${accuracy}%`} sub={`Best: ${bestAccuracy}%`}
            color={accuracy >= 97 ? 'text-emerald-400' : accuracy >= 85 ? 'text-yellow-300' : 'text-red-400'} />
          <StatCard label="CPM" value={cpm} color="text-blue-300" />
          <StatCard label="Errors" value={errors} color="text-red-400" />
        </div>
      </Section>

      {/* All-time stats */}
      <Section title="All-Time Records">
        <div className="grid grid-cols-2 gap-1.5">
          <StatCard label="Best WPM" value={bestWpm} color="text-violet-300" icon={<TrendingUp className="w-3 h-3" />} />
          <StatCard label="Best Accuracy" value={`${bestAccuracy}%`} color="text-emerald-400" />
          <StatCard label="Total Sessions" value={totalSessions.toLocaleString()} color="text-blue-300" icon={<Clock className="w-3 h-3" />} />
          <StatCard label="Words Typed" value={totalWordsTyped.toLocaleString()} color="text-teal-400" />
          <StatCard label="Total Keystrokes" value={totalKeystrokes.toLocaleString()} color="text-amber-400" icon={<Keyboard className="w-3 h-3" />} />
          <StatCard label="Notes Played" value={totalNotesPlayed.toLocaleString()} color="text-fuchsia-400" />
        </div>
      </Section>

      {/* Daily Goals */}
      <Section title="Daily Goals">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.52rem] text-white/50">WPM Goal ({wpm}/{dailyGoalWpm})</span>
              <span className="text-[0.52rem] font-bold text-violet-300">{wpmGoalPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/08 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all"
                style={{ width: `${wpmGoalPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.52rem] text-white/50">Keystrokes ({dailyKeystrokesToday.toLocaleString()}/{dailyGoalKeystrokes.toLocaleString()})</span>
              <span className="text-[0.52rem] font-bold text-blue-300">{ksGoalPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/08 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                style={{ width: `${ksGoalPct}%` }} />
            </div>
          </div>
          <p className="text-[0.48rem] text-white/30">Sessions today: {dailySessionsToday}</p>
        </div>
      </Section>

      {/* WPM Trend Chart */}
      {wpmData.length > 1 && (
        <Section title="WPM Trend (Last 20 Sessions)">
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wpmData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" tick={{ fontSize: 7, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Area type="monotone" dataKey="wpm" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#wpmGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {/* Accuracy Distribution */}
      {sessionHistory.length > 0 && (
        <Section title="Accuracy Distribution">
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accDist} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 6.5, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {/* Mode Usage */}
      {modeData.length > 0 && (
        <Section title="Mode Usage">
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeData} layout="vertical" margin={{ top: 2, right: 8, left: 0, bottom: 2 }}>
                <XAxis type="number" tick={{ fontSize: 7, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 6.5, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} opacity={0.85}>
                  {modeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {/* Top Keys Heatmap */}
      {topKeys.length > 0 && (
        <Section title="Most-Used Keys">
          <div className="flex flex-wrap gap-1">
            {topKeys.map(({ key, count }) => {
              const max = topKeys[0]?.count || 1;
              const pct = count / max;
              return (
                <div key={key}
                  className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg border border-white/08"
                  style={{ background: `rgba(139,92,246,${pct * 0.4})`, borderColor: `rgba(139,92,246,${pct * 0.5})` }}>
                  <span className="text-[0.65rem] font-bold text-white/80">{key}</span>
                  <span className="text-[0.42rem] text-white/30">{count.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Recent sessions */}
      {sessionHistory.length > 0 && (
        <Section title="Recent Sessions">
          <div className="space-y-1">
            {sessionHistory.slice(0, 8).map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-white/02 hover:bg-white/04 transition-all">
                <span className="text-[0.48rem] text-white/25 w-3 shrink-0">#{i + 1}</span>
                <span className="text-[0.52rem] font-bold text-violet-300 tabular-nums w-7 shrink-0">{s.wpm}</span>
                <span className="text-[0.48rem] text-white/30 w-8 shrink-0">{s.accuracy}%</span>
                <span className="text-[0.46rem] text-white/20 truncate flex-1">{s.mode}</span>
                <span className="text-[0.46rem] text-white/20 shrink-0">+{s.xpEarned}xp</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Achievements */}
      <Section title={`Achievements (${unlockedAchievements.length}/${ACHIEVEMENTS.length})`}>
        <div className="grid grid-cols-4 gap-1.5">
          {ACHIEVEMENTS.slice(0, 16).map(ach => {
            const unlocked = unlockedAchievements.includes(ach.id);
            return (
              <div key={ach.id} title={`${ach.title}: ${ach.desc}`}
                className={cn('w-full aspect-square rounded-xl border flex items-center justify-center text-lg transition-all',
                  unlocked ? 'border-amber-500/40 bg-amber-500/15' : 'border-white/06 bg-white/02 opacity-30 grayscale')}>
                {ach.icon}
              </div>
            );
          })}
        </div>
        {unlockedAchievements.length < ACHIEVEMENTS.length && (
          <p className="text-[0.46rem] text-white/20 mt-2 text-center">{ACHIEVEMENTS.length - unlockedAchievements.length} more to unlock</p>
        )}
      </Section>

      {/* Lessons Progress */}
      <Section title="Lessons Progress">
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <div key={n}
              className={cn(
                'w-7 h-7 rounded-lg border flex items-center justify-center text-[0.58rem] font-bold transition-all',
                lessonsCompleted.includes(n)
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : lessonNumber === n
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/03 border-white/08 text-white/25'
              )}>
              {n}
            </div>
          ))}
        </div>
        <p className="text-[0.46rem] text-white/25 mt-1.5">{lessonsCompleted.length}/10 completed</p>
      </Section>

      {/* Modes explored */}
      <Section title="Modes Explored">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.52rem] text-white/40">{modesUsed.length} modes tried</span>
          <span className="text-[0.52rem] font-bold text-blue-300">{Math.round((modesUsed.length / 80) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/08 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
            style={{ width: `${(modesUsed.length / 80) * 100}%` }} />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {modesUsed.slice(0, 10).map(m => (
            <span key={m} className="px-1.5 py-0.5 rounded-md bg-blue-500/12 border border-blue-500/20 text-[0.46rem] text-blue-300">
              {m}
            </span>
          ))}
          {modesUsed.length > 10 && <span className="text-[0.46rem] text-white/25">+{modesUsed.length - 10} more</span>}
        </div>
      </Section>

      {/* Export CSV */}
      <div className="px-3 py-3">
        <button
          onClick={() => {
            if (sessionHistory.length === 0) return;
            const headers = ['Session', 'WPM', 'Accuracy', 'Errors', 'Mode', 'Duration(s)', 'Date'];
            const rows = sessionHistory.map((s, i) => [
              i + 1, s.wpm, s.accuracy, s.errors, s.mode || '-',
              s.duration ? Math.round(s.duration) : '-',
              s.date ? new Date(s.date).toLocaleString() : '-',
            ]);
            const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'uk-aurora-sessions.csv'; a.click();
            URL.revokeObjectURL(url);
          }}
          disabled={sessionHistory.length === 0}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-300 text-[0.6rem] font-semibold hover:bg-emerald-500/22 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Download className="w-3 h-3" />
          Export {sessionHistory.length} Sessions as CSV
        </button>
      </div>
    </div>
  );
}
