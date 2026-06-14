import { useState, useEffect, useRef } from 'react';
import {
  Settings, Volume2, Eye, EyeOff, ChevronDown,
  Play, Pause, Square, Circle, Repeat, Flame,
} from 'lucide-react';
import { useStore, SOUND_CATEGORIES, SoundCategory } from '@/store';
import { cn, formatTime } from '@/lib/utils';
import { getLevelInfo } from '@/lib/achievements';
import { useMobileLandscape, useIsPortraitPhone } from '@/hooks/use-mobile-landscape';
const logoImg = '/uk-aurora-logo.png';

const QUICK_MODES = [
  { value: 'free',      label: 'Free Typing',   icon: '✨' },
  { value: 'word',      label: 'Words',          icon: '📝' },
  { value: 'sentence',  label: 'Sentences',      icon: '💬' },
  { value: 'timed',     label: 'Timed',          icon: '⏱️' },
  { value: 'sprint',    label: 'Sprint',         icon: '🚀' },
  { value: 'lesson',    label: 'Lesson',         icon: '📚' },
  { value: 'quotes',    label: 'Quotes',         icon: '💭' },
  { value: 'code',      label: 'Code',           icon: '💻' },
  { value: 'poetry',    label: 'Poetry',         icon: '🌹' },
  { value: 'custom',    label: 'Custom',         icon: '✏️' },
  { value: 'paragraph', label: 'Paragraphs',     icon: '📄' },
  { value: 'science',   label: 'Science',        icon: '🔬' },
  { value: 'history',   label: 'History',        icon: '🏛️' },
  { value: 'zen',       label: 'Zen',            icon: '☯️' },
  { value: 'anime',     label: 'Anime',          icon: '⛩️' },
  { value: 'movies',    label: 'Movies',         icon: '🎬' },
  { value: 'numbers',   label: 'Numbers',        icon: '🔢' },
  { value: 'proverbs',  label: 'Proverbs',       icon: '📜' },
  { value: 'philosophy','label': 'Philosophy',   icon: '🤔' },
  { value: 'sports',    label: 'Sports',         icon: '🏆' },
];

interface Props {
  onOpenSettings: () => void;
  settingsOpen: boolean;
}

export function AppNav({ onOpenSettings, settingsOpen }: Props) {
  const isMobile = useMobileLandscape();
  const isPortrait = useIsPortraitPhone();
  const isCompact = isMobile || isPortrait;

  if (isCompact) return <MobileNav onOpenSettings={onOpenSettings} settingsOpen={settingsOpen} />;
  return <DesktopNav onOpenSettings={onOpenSettings} settingsOpen={settingsOpen} />;
}

function DesktopNav({ onOpenSettings, settingsOpen }: Props) {
  const {
    wpm, cpm, accuracy, errors, startTime,
    volume, setVolume, bpm, xp, dailyStreak, bestWpm,
    focusMode, setFocusMode, soundCategory, setSoundCategory,
    typingMode, setTypingMode, isRecording, isPlaying, recordedEvents,
    startRecording, stopRecording, playRecording, stopPlayback,
    loopEnabled, setLoop,
    showWpmStat, showCpmStat, showAccuracyStat, showErrorsStat, showTimerStat,
    topBarVisible,
  } = useStore();

  const [elapsed, setElapsed] = useState(0);
  const [modeOpen, setModeOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [volOpen, setVolOpen] = useState(false);
  const modeRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<HTMLDivElement>(null);
  const volRef = useRef<HTMLDivElement>(null);

  const { current: lvl, progress } = getLevelInfo(xp);
  const hasRecording = recordedEvents.length > 0;
  const currentMode = QUICK_MODES.find(m => m.value === typingMode);
  const accColor = accuracy >= 97 ? 'text-emerald-400' : accuracy >= 85 ? 'text-yellow-300' : 'text-red-400';

  useEffect(() => {
    if (!startTime) { setElapsed(0); return; }
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) setModeOpen(false);
      if (soundRef.current && !soundRef.current.contains(e.target as Node)) setSoundOpen(false);
      if (volRef.current && !volRef.current.contains(e.target as Node)) setVolOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!topBarVisible) return null;

  return (
    <div className="shrink-0 border-b border-white/06 bg-black/45 backdrop-blur-md z-30 relative">
      <div className="flex items-center h-12 px-3 gap-1.5">

        {/* Logo + Level */}
        <div className="flex items-center gap-2.5 shrink-0 mr-1">
          <div className="relative">
            <img src={logoImg} alt="UK Aurora" className="w-7 h-7 rounded-lg object-cover shadow-[0_0_10px_rgba(140,60,255,0.5)]" />
            {isRecording && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-black rec-indicator" />
            )}
          </div>
          <div className="flex flex-col leading-none gap-1 min-w-0">
            <span className="shimmer-text font-black text-[0.52rem] tracking-[0.12em] uppercase whitespace-nowrap">UK Aurora</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1 bg-white/08 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[0.4rem] text-violet-300/50 font-bold whitespace-nowrap">Lv.{lvl.level}</span>
            </div>
          </div>
        </div>

        <Divider />

        {/* Mode picker */}
        <div ref={modeRef} className="relative shrink-0">
          <button
            onClick={() => { setModeOpen(o => !o); setSoundOpen(false); setVolOpen(false); }}
            className={cn(
              'flex items-center gap-1.5 h-8 px-3 rounded-xl border text-[0.6rem] font-semibold transition-all',
              modeOpen
                ? 'border-violet-500/60 bg-violet-500/18 text-white'
                : 'border-white/08 bg-white/04 text-white/65 hover:text-white hover:border-white/18 hover:bg-white/07'
            )}
          >
            <span className="text-sm leading-none">{currentMode?.icon ?? '✨'}</span>
            <span className="max-w-[72px] truncate">{currentMode?.label ?? 'Mode'}</span>
            <ChevronDown className={cn('w-3 h-3 text-white/35 transition-transform shrink-0', modeOpen && 'rotate-180')} />
          </button>

          {modeOpen && (
            <div className="absolute top-full mt-1.5 left-0 z-50 bg-[#0e0e1c]/97 backdrop-blur-xl border border-white/12 rounded-2xl p-2 w-64 shadow-2xl shadow-black/50">
              <div className="text-[0.44rem] text-white/35 uppercase tracking-widest px-1.5 mb-1.5 font-bold">Typing Mode</div>
              <div className="grid grid-cols-2 gap-0.5 max-h-72 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
                {QUICK_MODES.map(m => (
                  <button key={m.value} onClick={() => { setTypingMode(m.value as any); setModeOpen(false); }}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[0.6rem] transition-all text-left',
                      typingMode === m.value
                        ? 'bg-violet-500/25 text-violet-200 font-semibold'
                        : 'text-white/55 hover:text-white hover:bg-white/07'
                    )}>
                    <span className="text-sm leading-none">{m.icon}</span>
                    <span className="truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sound picker */}
        <div ref={soundRef} className="relative shrink-0">
          <button
            onClick={() => { setSoundOpen(o => !o); setModeOpen(false); setVolOpen(false); }}
            className={cn(
              'flex items-center gap-1.5 h-8 px-3 rounded-xl border text-[0.6rem] font-semibold transition-all',
              soundOpen
                ? 'border-violet-500/60 bg-violet-500/18 text-white'
                : 'border-white/08 bg-white/04 text-white/65 hover:text-white hover:border-white/18 hover:bg-white/07'
            )}
          >
            <span className="text-sm leading-none">🎹</span>
            <span className="max-w-[80px] truncate">{soundCategory}</span>
            <ChevronDown className={cn('w-3 h-3 text-white/35 transition-transform shrink-0', soundOpen && 'rotate-180')} />
          </button>

          {soundOpen && (
            <div className="absolute top-full mt-1.5 left-0 z-50 bg-[#0e0e1c]/97 backdrop-blur-xl border border-white/12 rounded-2xl p-2 w-52 shadow-2xl shadow-black/50 max-h-80 overflow-hidden">
              <div className="text-[0.44rem] text-white/35 uppercase tracking-widest px-1.5 mb-1.5 font-bold">Sound Category</div>
              <div className="overflow-y-auto max-h-64" style={{ touchAction: 'pan-y' }}>
                {SOUND_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setSoundCategory(cat as SoundCategory); setSoundOpen(false); }}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-xl text-[0.6rem] transition-all',
                      soundCategory === cat
                        ? 'bg-violet-500/25 text-violet-200 font-semibold'
                        : 'text-white/55 hover:text-white hover:bg-white/07'
                    )}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Stats pills */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
          {showWpmStat && (
            <StatPill label="WPM" value={wpm || 0} color="text-violet-300" />
          )}
          {showCpmStat && (
            <StatPill label="CPM" value={cpm || 0} color="text-blue-300" />
          )}
          {showAccuracyStat && (
            <StatPill label="ACC" value={`${accuracy}%`} color={accColor} />
          )}
          {showErrorsStat && (
            <StatPill label="ERR" value={errors || 0} color={errors > 5 ? 'text-red-400' : 'text-white/55'} />
          )}
          {showTimerStat && elapsed > 0 && (
            <StatPill label="TIME" value={formatTime(elapsed)} color="text-amber-300" />
          )}
          {bestWpm > 0 && (
            <StatPill label="BEST" value={bestWpm} color="text-emerald-400" />
          )}
          {dailyStreak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/04 border border-white/07 shrink-0">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-[0.62rem] font-bold text-orange-300">{dailyStreak}</span>
            </div>
          )}
          {bpm > 0 && (
            <StatPill label="BPM" value={bpm} color="text-pink-300" />
          )}
        </div>

        <Divider />

        {/* Transport */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? 'Stop Recording' : 'Record'}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center border transition-all',
              isRecording
                ? 'bg-red-500/25 border-red-500/60 text-red-400 shadow-[0_0_10px_rgba(255,60,60,0.3)]'
                : 'bg-white/04 border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20'
            )}
          >
            {isRecording
              ? <Square className="w-3.5 h-3.5 fill-current" />
              : <Circle className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={isPlaying ? stopPlayback : playRecording}
            disabled={isRecording || (!hasRecording && !isPlaying)}
            title={isPlaying ? 'Pause' : 'Play'}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center border transition-all',
              isPlaying
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_10px_rgba(56,200,120,0.25)]'
                : 'bg-white/04 border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20',
              (isRecording || (!hasRecording && !isPlaying)) && 'opacity-30 cursor-not-allowed pointer-events-none'
            )}
          >
            {isPlaying
              ? <Pause className="w-3.5 h-3.5 fill-current" />
              : <Play className="w-3.5 h-3.5 fill-current" style={{ marginLeft: '1px' }} />}
          </button>

          <button
            onClick={() => setLoop(!loopEnabled)}
            title="Toggle Loop"
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center border transition-all',
              loopEnabled
                ? 'bg-violet-500/22 border-violet-500/55 text-violet-300'
                : 'bg-white/04 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
            )}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        <Divider />

        {/* Volume */}
        <div ref={volRef} className="relative shrink-0">
          <button
            onClick={() => { setVolOpen(o => !o); setModeOpen(false); setSoundOpen(false); }}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center border transition-all',
              volOpen
                ? 'border-violet-500/50 bg-violet-500/15 text-violet-300'
                : 'border-white/10 bg-white/04 text-white/50 hover:text-white hover:bg-white/10'
            )}
            title={`Volume: ${Math.round(volume * 100)}%`}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          {volOpen && (
            <div className="absolute top-full right-0 mt-1.5 z-50 bg-[#0e0e1c]/97 backdrop-blur-xl border border-white/12 rounded-2xl p-3 w-48 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.55rem] text-white/50 uppercase tracking-widest font-bold">Volume</span>
                <span className="text-[0.6rem] font-mono text-violet-300 font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.01} value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Focus */}
        <button
          onClick={() => setFocusMode(!focusMode)}
          title={focusMode ? 'Exit Focus' : 'Focus Mode'}
          className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center border transition-all',
            focusMode
              ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
              : 'border-white/10 bg-white/04 text-white/50 hover:text-white hover:bg-white/10'
          )}
        >
          {focusMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Settings"
          className={cn(
            'flex items-center gap-1.5 h-8 px-3 rounded-xl border text-[0.6rem] font-semibold transition-all',
            settingsOpen
              ? 'border-violet-500/60 bg-violet-500/18 text-white'
              : 'border-white/10 bg-white/04 text-white/55 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10'
          )}
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden md:block">Settings</span>
        </button>

      </div>
    </div>
  );
}

function MobileNav({ onOpenSettings, settingsOpen }: Props) {
  const {
    wpm, accuracy, errors,
    soundCategory, setSoundCategory,
    typingMode, setTypingMode,
    isRecording, isPlaying, recordedEvents,
    startRecording, stopRecording, playRecording, stopPlayback,
    topBarVisible,
  } = useStore();

  const [modeOpen, setModeOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const modeRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<HTMLDivElement>(null);
  const hasRecording = recordedEvents.length > 0;
  const currentMode = QUICK_MODES.find(m => m.value === typingMode);
  const accColor = accuracy >= 97 ? 'text-emerald-400' : accuracy >= 85 ? 'text-yellow-300' : 'text-red-400';

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) setModeOpen(false);
      if (soundRef.current && !soundRef.current.contains(e.target as Node)) setSoundOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!topBarVisible) return null;

  return (
    <div className="shrink-0 border-b border-white/06 bg-black/55 backdrop-blur-md z-30 relative">
      <div className="flex items-center h-9 px-2 gap-1">

        {/* Mode */}
        <div ref={modeRef} className="relative shrink-0">
          <button
            onClick={() => { setModeOpen(o => !o); setSoundOpen(false); }}
            className={cn(
              'flex items-center gap-1 h-7 px-2 rounded-lg border text-[0.55rem] font-semibold transition-all',
              modeOpen ? 'border-violet-500/50 bg-violet-500/18 text-white' : 'border-white/10 bg-white/05 text-white/65'
            )}
          >
            <span className="text-xs">{currentMode?.icon ?? '✨'}</span>
            <ChevronDown className={cn('w-2.5 h-2.5 text-white/35', modeOpen && 'rotate-180')} />
          </button>
          {modeOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 bg-[#0e0e1c]/98 backdrop-blur-xl border border-white/12 rounded-xl p-1.5 w-44 shadow-2xl max-h-60 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
              {QUICK_MODES.map(m => (
                <button key={m.value} onClick={() => { setTypingMode(m.value as any); setModeOpen(false); }}
                  className={cn('w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[0.58rem] transition-all text-left',
                    typingMode === m.value ? 'bg-violet-500/25 text-violet-200 font-semibold' : 'text-white/55 hover:text-white hover:bg-white/08')}>
                  <span className="text-xs">{m.icon}</span>{m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-1 flex-1 overflow-hidden">
          <StatPill label="WPM" value={wpm || 0} color="text-violet-300" compact />
          <StatPill label="ACC" value={`${accuracy}%`} color={accColor} compact />
          {errors > 0 && <StatPill label="ERR" value={errors} color="text-red-400" compact />}
        </div>

        {/* Transport */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn('w-7 h-7 rounded-lg flex items-center justify-center border transition-all',
              isRecording ? 'bg-red-500/25 border-red-500/60 text-red-400' : 'bg-white/05 border-white/10 text-white/50')}
          >
            {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Circle className="w-3 h-3 fill-current" />}
          </button>
          <button
            onClick={isPlaying ? stopPlayback : playRecording}
            disabled={isRecording || (!hasRecording && !isPlaying)}
            className={cn('w-7 h-7 rounded-lg flex items-center justify-center border transition-all',
              isPlaying ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : 'bg-white/05 border-white/10 text-white/50',
              (isRecording || (!hasRecording && !isPlaying)) && 'opacity-30 pointer-events-none')}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" style={{ marginLeft: '1px' }} />}
          </button>
        </div>

        {/* Sound */}
        <div ref={soundRef} className="relative shrink-0">
          <button
            onClick={() => { setSoundOpen(o => !o); setModeOpen(false); }}
            className={cn('flex items-center gap-1 h-7 px-2 rounded-lg border text-[0.55rem] font-semibold transition-all',
              soundOpen ? 'border-violet-500/50 bg-violet-500/18 text-white' : 'border-white/10 bg-white/05 text-white/55')}
          >
            <span className="text-xs">🎹</span>
            <ChevronDown className={cn('w-2.5 h-2.5 text-white/35', soundOpen && 'rotate-180')} />
          </button>
          {soundOpen && (
            <div className="absolute top-full mt-1 right-0 z-50 bg-[#0e0e1c]/98 backdrop-blur-xl border border-white/12 rounded-xl p-1.5 w-44 shadow-2xl max-h-60 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
              {SOUND_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { setSoundCategory(cat as SoundCategory); setSoundOpen(false); }}
                  className={cn('w-full text-left px-2 py-1.5 rounded-lg text-[0.58rem] transition-all',
                    soundCategory === cat ? 'bg-violet-500/25 text-violet-200 font-semibold' : 'text-white/55 hover:text-white hover:bg-white/08')}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className={cn('w-7 h-7 rounded-lg flex items-center justify-center border transition-all shrink-0',
            settingsOpen ? 'border-violet-500/50 bg-violet-500/18 text-violet-300' : 'border-white/10 bg-white/05 text-white/55 hover:text-white')}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function StatPill({ label, value, color, compact }: { label: string; value: string | number; color: string; compact?: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-1 rounded-xl bg-white/04 border border-white/07 shrink-0',
      compact ? 'px-1.5 py-0.5' : 'px-2.5 py-1'
    )}>
      <span className={cn('text-[0.44rem] font-bold uppercase tracking-wider text-white/30', compact && 'hidden')}>{label}</span>
      <span className={cn('font-bold font-mono', compact ? 'text-[0.58rem]' : 'text-[0.65rem]', color)}>{value}</span>
      {compact && <span className="text-[0.42rem] text-white/25 uppercase font-bold">{label}</span>}
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-white/08 mx-0.5 shrink-0" />;
}
