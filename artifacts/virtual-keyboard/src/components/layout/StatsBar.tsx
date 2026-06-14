import { useStore } from '@/store';
import { getLevelInfo } from '@/lib/achievements';
import { cn, formatTime } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Flame, Zap, Trophy } from 'lucide-react';

export function StatsBar({ compact = false }: { compact?: boolean }) {
  const {
    wpm, cpm, accuracy, errors, startTime,
    xp, dailyStreak, bestWpm, totalKeystrokes,
    showWpmStat, showCpmStat, showAccuracyStat, showErrorsStat, showTimerStat,
  } = useStore();

  const [elapsed, setElapsed] = useState(0);
  const { current: lvlInfo, next: nextLvl, progress } = getLevelInfo(xp);
  const lvl = lvlInfo.level;

  useEffect(() => {
    if (!startTime) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const accColor = accuracy >= 97 ? 'text-emerald-400' : accuracy >= 85 ? 'text-yellow-300' : 'text-red-400';

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1">
        {showWpmStat && <Pill label="WPM" value={wpm} color="text-violet-300" />}
        {showAccuracyStat && <Pill label="ACC" value={`${accuracy}%`} color={accColor} />}
        {showCpmStat && <Pill label="CPM" value={cpm} color="text-blue-300" />}
        {showErrorsStat && <Pill label="ERR" value={errors} color="text-red-400" />}
        {showTimerStat && elapsed > 0 && <Pill label="TIME" value={formatTime(elapsed)} color="text-white/60" />}
        <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />
        <div className="flex items-center gap-1 shrink-0">
          <Flame className="w-3 h-3 text-amber-400" />
          <span className="text-[0.6rem] font-bold text-amber-300">{dailyStreak}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Zap className="w-3 h-3 text-violet-400" />
          <span className="text-[0.6rem] font-bold text-violet-300">Lv{lvl}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Live stats */}
      <div className="flex flex-wrap gap-1.5">
        {showWpmStat && (
          <StatCard label="WPM" value={wpm} sub={`Best: ${bestWpm}`} color="text-violet-300" glow="shadow-violet-500/20" />
        )}
        {showCpmStat && (
          <StatCard label="CPM" value={cpm} color="text-blue-300" />
        )}
        {showAccuracyStat && (
          <StatCard label="Accuracy" value={`${accuracy}%`} color={accColor} />
        )}
        {showErrorsStat && (
          <StatCard label="Errors" value={errors} color="text-red-400" />
        )}
        {showTimerStat && elapsed > 0 && (
          <StatCard label="Time" value={formatTime(elapsed)} color="text-white/60" />
        )}
      </div>

      {/* Profile strip */}
      <div className="flex-1 flex items-center gap-3 ml-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[0.62rem] font-bold text-amber-300">{dailyStreak} day{dailyStreak !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-violet-400" />
          <div className="flex items-center gap-1">
            <span className="text-[0.62rem] font-bold text-white/70">Lv{lvl}</span>
            <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[0.62rem] text-white/50">{totalKeystrokes.toLocaleString()} keys</span>
        </div>
      </div>
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/06 border border-white/08 shrink-0">
      <span className={cn('text-[0.6rem] font-bold font-mono', color)}>{value}</span>
      <span className="text-[0.42rem] text-white/25 uppercase">{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, color, glow }: {
  label: string; value: string | number; sub?: string; color: string; glow?: string;
}) {
  return (
    <div className={cn(
      'flex flex-col px-3 py-1.5 rounded-xl bg-white/04 border border-white/07',
      glow && `shadow-lg ${glow}`
    )}>
      <span className={cn('text-sm font-black font-mono leading-none', color)}>{value}</span>
      <span className="text-[0.48rem] text-white/30 uppercase tracking-wider mt-0.5">{label}</span>
      {sub && <span className="text-[0.46rem] text-white/20 mt-0.5">{sub}</span>}
    </div>
  );
}
