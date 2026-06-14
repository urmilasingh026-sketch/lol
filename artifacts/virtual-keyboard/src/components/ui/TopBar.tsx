import { Settings, Volume2, Activity, Music, Zap, Trophy, Flame, Focus, Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/store';
import { cn, formatTime } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useMobileLandscape, useIsPortraitPhone } from '@/hooks/use-mobile-landscape';
import { getLevelInfo } from '@/lib/achievements';
import { WpmChart } from './WpmChart';
const logoImg = '/uk-aurora-logo.png';

export function TopBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const {
    wpm, cpm, accuracy, errors, startTime, volume, setVolume,
    metronomeEnabled, bpm, soundCategory, xp, bestWpm, dailyStreak,
    focusMode, setFocusMode, showWpmChart,
  } = useStore();
  const errColor = errors > 0 ? 'text-red-400' : 'text-white/50';
  const [elapsed, setElapsed] = useState(0);
  const [wpmAnimKey, setWpmAnimKey] = useState(0);
  const [prevWpm, setPrevWpm] = useState(0);
  const isMobileLandscape = useMobileLandscape();
  const isPortraitPhone = useIsPortraitPhone();
  const { current: lvl, progress } = getLevelInfo(xp);

  useEffect(() => {
    let interval: number;
    if (startTime) {
      interval = window.setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    } else { setElapsed(0); }
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (wpm !== prevWpm && wpm > 0) { setPrevWpm(wpm); setWpmAnimKey(k => k + 1); }
  }, [wpm]);

  const accuracyColor = accuracy >= 97 ? 'text-emerald-400' : accuracy >= 88 ? 'text-yellow-400' : 'text-red-400';

  if (isPortraitPhone || isMobileLandscape) {
    const isPortrait = isPortraitPhone && !isMobileLandscape;
    return (
      <div className={cn('top-bar flex items-center justify-between gap-2 shrink-0 px-3', isPortrait ? 'h-11' : 'h-9 px-2')}>
        <div className="flex items-center gap-1.5 shrink-0">
          <img src={logoImg} alt="UK Aurora" className="w-7 h-7 rounded-lg object-cover shrink-0 shadow-[0_0_10px_rgba(160,80,255,0.5)]" />
          <div className="flex flex-col leading-none">
            <span className="shimmer-text font-bold text-[0.55rem] tracking-[0.18em] uppercase">UK Aurora</span>
            <span className="text-[0.38rem] text-white/30 tracking-[0.12em] uppercase">Lv.{lvl.level} {lvl.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-white/07 text-[0.58rem] font-mono">
          <span key={wpmAnimKey} className={cn('font-bold text-violet-300', wpmAnimKey ? 'wpm-update' : '')}>{wpm}</span>
          <span className="text-white/25 text-[0.48rem]">WPM</span>
          <span className="w-px h-2.5 bg-white/10 mx-0.5" />
          <span className={cn('font-bold', accuracyColor)}>{accuracy}%</span>
          <span className="text-white/25 text-[0.48rem]">ACC</span>
          <span className="w-px h-2.5 bg-white/10 mx-0.5" />
          <span className={cn('font-bold', errColor)}>{errors}</span>
          <span className="text-white/25 text-[0.48rem]">ERR</span>
          <span className="w-px h-2.5 bg-white/10 mx-0.5" />
          <span className="text-white/55">{formatTime(elapsed)}</span>
          {metronomeEnabled && (
            <>
              <span className="w-px h-2.5 bg-white/10 mx-0.5" />
              <Activity className="w-2.5 h-2.5 text-violet-400" />
              <span className="text-violet-300">{bpm}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="hidden xs:flex items-center gap-1 group">
            <Volume2 className="w-3 h-3 text-white/40 shrink-0" />
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-14 cursor-pointer" />
          </div>
          <button onClick={onOpenSettings}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/08 bg-white/04 hover:bg-white/10 transition-all group">
            <Settings className="w-3.5 h-3.5 text-white/65 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="top-bar sticky top-0 z-50">
      <div className="h-13 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <img src={logoImg} alt="UK Aurora" className="w-10 h-10 rounded-xl object-cover shadow-[0_0_16px_rgba(140,60,255,0.55)] shrink-0" />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0d0d1a] border border-violet-500/50 flex items-center justify-center">
              <span className="text-[0.32rem] font-black text-violet-300">{lvl.level}</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="shimmer-text font-bold text-[0.68rem] tracking-[0.22em] uppercase">UK Aurora</span>
            <span className="text-[0.42rem] text-white/30 tracking-[0.14em] uppercase mt-0.5">Virtual Keyboard</span>
          </div>
        </div>

        {/* Desktop Stats Bar */}
        <div className="hidden md:flex items-center gap-0 text-xs font-mono bg-black/45 px-3 py-1.5 rounded-full border border-white/07 shadow-inner">
          <StatPill label="WPM" value={wpm} color={wpm >= 80 ? 'text-violet-300' : 'text-white/88'} animKey={wpmAnimKey} />
          <Divider />
          <StatPill label="CPM" value={cpm} />
          <Divider />
          <StatPill label="ACC" value={`${accuracy}%`} color={accuracyColor} />
          <Divider />
          <StatPill label="ERR" value={errors} color={errors > 0 ? 'text-red-400' : 'text-white/80'} />
          <Divider />
          <StatPill label="TIME" value={formatTime(elapsed)} />
          {metronomeEnabled && (
            <>
              <Divider />
              <StatPill label="BPM" value={bpm} color="text-violet-400" icon={<Activity className="w-2.5 h-2.5 text-violet-400" />} />
            </>
          )}
          {bestWpm > 0 && (
            <>
              <Divider />
              <StatPill label="BEST" value={`${bestWpm}`} color="text-amber-300" icon={<Trophy className="w-2 h-2 text-amber-400" />} />
            </>
          )}
          {dailyStreak > 0 && (
            <>
              <Divider />
              <StatPill label="STREAK" value={`${dailyStreak}d`} color="text-orange-400" icon={<Flame className="w-2 h-2 text-orange-400" />} />
            </>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* WPM Mini Sparkline */}
          {showWpmChart && (
            <div className="hidden xl:block">
              <WpmChart width={90} height={28} compact className="opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          )}

          {/* XP bar (large screens only) */}
          <div className="hidden xl:flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-violet-400" />
              <span className="text-[0.48rem] font-bold text-violet-300">Lv.{lvl.level} {lvl.title}</span>
              <span className="text-[0.4rem] text-white/25 ml-1">{xp.toLocaleString()} XP</span>
            </div>
            <div className="w-28 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 border border-violet-500/18 rounded-full">
            <Music className="w-3 h-3 text-violet-400/70" />
            <span className="text-[0.52rem] text-violet-300/65 max-w-[110px] truncate font-medium">{soundCategory}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 group">
            <Volume2 className="w-3.5 h-3.5 text-white/45 group-hover:text-white/80 transition-colors shrink-0" />
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-18 sm:w-22 cursor-pointer" title="Volume" />
          </div>

          {/* Focus Mode Toggle */}
          <button
            onClick={() => setFocusMode(!focusMode)}
            title={focusMode ? 'Exit Focus Mode' : 'Focus Mode — minimal UI'}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center border transition-all group',
              focusMode
                ? 'border-violet-500/60 bg-violet-500/20 text-violet-300 shadow-[0_0_10px_rgba(160,80,255,0.3)]'
                : 'border-white/08 bg-white/04 hover:bg-white/10 hover:border-white/18 text-white/50 hover:text-white/80'
            )}
          >
            {focusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button onClick={onOpenSettings}
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/08 bg-white/04 hover:bg-white/10 hover:border-white/18 transition-all group"
            title="Open Settings">
            <Settings className="w-4 h-4 text-white/65 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
          </button>
        </div>
      </div>

      {/* Mobile: stats strip */}
      <div className="md:hidden flex items-center justify-around px-3 pb-1.5">
        <MobileStat label="WPM" value={wpm} color="text-violet-300" />
        <div className="w-px h-5 bg-white/10" />
        <MobileStat label="CPM" value={cpm} color="text-blue-300" />
        <div className="w-px h-5 bg-white/10" />
        <MobileStat label="ACC" value={`${accuracy}%`} color={accuracyColor} />
        <div className="w-px h-5 bg-white/10" />
        <MobileStat label="ERR" value={errors} color={errors > 0 ? 'text-red-400' : 'text-white/60'} />
        {dailyStreak > 0 && (
          <>
            <div className="w-px h-5 bg-white/10" />
            <MobileStat label="STREAK" value={`${dailyStreak}d`} color="text-orange-400" />
          </>
        )}
      </div>
    </div>
  );
}

function Divider() { return <div className="w-px h-3.5 bg-white/08 mx-0.5" />; }

function StatPill({ label, value, color = 'text-white/88', icon, animKey }: {
  label: string; value: string | number; color?: string; icon?: React.ReactNode; animKey?: number;
}) {
  return (
    <div className="flex flex-col items-center px-1.5 py-0.5 rounded-md hover:bg-white/06 transition-colors cursor-default">
      <span className="text-[0.43rem] text-white/38 uppercase tracking-widest leading-none mb-0.5">{label}</span>
      <div className="flex items-center gap-0.5">
        {icon}
        <span key={animKey} className={cn('text-[0.72rem] font-bold leading-none font-mono', color, animKey ? 'wpm-update' : '')}>
          {value}
        </span>
      </div>
    </div>
  );
}

function MobileStat({ label, value, color = 'text-white/80' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <span className={cn('text-sm font-bold font-mono leading-none', color)}>{value}</span>
      <span className="text-[0.5rem] text-white/35 uppercase tracking-widest leading-none">{label}</span>
    </div>
  );
}
