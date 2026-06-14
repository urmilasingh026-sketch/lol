import { useStore, LESSON_INSTRUCTIONS_EXPORT } from '@/store';
import { cn } from '@/lib/utils';
import { TransportDock } from './TransportDock';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Trophy, Zap, Target, RefreshCw, Circle, Play, Pause, Square, Repeat, Upload } from 'lucide-react';
import { useMobileLandscape, useIsPortraitPhone } from '@/hooks/use-mobile-landscape';

// ── Mode badge colors ─────────────────────────────────────────────────────────
const MODE_META: Record<string, { label: string; color: string; glow: string }> = {
  free:        { label: '✨ Free',      color: '#a78bfa', glow: 'rgba(167,139,250,0.15)' },
  word:        { label: '📝 Words',     color: '#60a5fa', glow: 'rgba(96,165,250,0.15)'  },
  sentence:    { label: '💬 Sentences', color: '#34d399', glow: 'rgba(52,211,153,0.15)'  },
  timed:       { label: '⏱ Timed',     color: '#fb923c', glow: 'rgba(251,146,60,0.15)'  },
  sprint:      { label: '🚀 Sprint',    color: '#f43f5e', glow: 'rgba(244,63,94,0.15)'   },
  lesson:      { label: '📚 Lesson',    color: '#fbbf24', glow: 'rgba(251,191,36,0.15)'  },
  code:        { label: '💻 Code',      color: '#22d3ee', glow: 'rgba(34,211,238,0.15)'  },
  quotes:      { label: '💭 Quotes',    color: '#e879f9', glow: 'rgba(232,121,249,0.15)' },
  zen:         { label: '☯️ Zen',       color: '#86efac', glow: 'rgba(134,239,172,0.15)' },
  gaming:      { label: '🎮 Gaming',    color: '#f472b6', glow: 'rgba(244,114,182,0.15)' },
  numbers:     { label: '🔢 Numbers',   color: '#a3e635', glow: 'rgba(163,230,53,0.15)'  },
  custom:      { label: '✏️ Custom',    color: '#c084fc', glow: 'rgba(192,132,252,0.15)' },
};

// ── Flowing line ──────────────────────────────────────────────────────────────
function FlowingLine({
  wordList, wordIndex, typedText, targetText, isWarning = false, compact = false,
}: {
  wordList: string[]; wordIndex: number; typedText: string; targetText: string;
  isWarning?: boolean; compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const [translateX, setTranslateX] = useState(0);

  const isWrong = typedText.length > 0 && !targetText.startsWith(typedText);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const word = wordRefs.current[wordIndex];
    if (!container || !word) return;
    const anchorX = container.offsetWidth * 0.20;
    setTranslateX(anchorX - word.offsetLeft);
  }, [wordIndex]);

  const renderUntil = Math.min(wordList.length, wordIndex + 28);

  // Dynamic border & glow based on state
  const borderGlow = isWarning
    ? { border: 'rgba(251,146,60,0.6)', outer: 'rgba(251,146,60,0.18)' }
    : isWrong
    ? { border: 'rgba(248,113,113,0.6)', outer: 'rgba(248,113,113,0.18)' }
    : { border: 'rgba(139,92,246,0.4)',  outer: 'rgba(139,92,246,0.12)' };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden flex items-center transition-all duration-300',
        compact ? 'h-12 rounded-xl' : 'h-[4.5rem] sm:h-20 rounded-2xl',
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(12,9,28,0.92) 0%, rgba(18,12,38,0.95) 100%)',
        border: `1.5px solid ${borderGlow.border}`,
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.03) inset,
          0 1px 0 rgba(255,255,255,0.07) inset,
          0 6px 40px ${borderGlow.outer},
          0 2px 12px rgba(0,0,0,0.5)
        `,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Top shine line */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.12) 70%, transparent 100%)' }} />

      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-20 z-10"
        style={{ background: 'linear-gradient(to right, rgba(12,9,28,1) 0%, rgba(12,9,28,0.8) 50%, transparent 100%)' }} />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-20 z-10"
        style={{ background: 'linear-gradient(to left, rgba(12,9,28,1) 0%, rgba(12,9,28,0.8) 50%, transparent 100%)' }} />

      {/* Scrolling words */}
      <div
        className="flex items-center gap-[1.1rem] whitespace-nowrap px-10 will-change-transform"
        style={{ transform: `translateX(${translateX}px)`, transition: 'transform 0.15s cubic-bezier(0.25,0.46,0.45,0.94)' }}
      >
        {wordList.slice(0, renderUntil).map((word, i) => {
          const isCompleted = i < wordIndex;
          const isCurrent   = i === wordIndex;

          if (isCompleted) return (
            <span key={i} ref={el => { wordRefs.current[i] = el; }}
              className={cn('font-mono select-none', compact ? 'text-sm' : 'text-lg sm:text-xl')}
              style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
              {word}
            </span>
          );

          if (isCurrent) return (
            <span key={i} ref={el => { wordRefs.current[i] = el; }}
              className={cn('font-mono relative', compact ? 'text-sm' : 'text-lg sm:text-xl')}
              style={{ letterSpacing: '0.04em' }}>
              {/* Current word spotlight */}
              <span className="absolute -inset-x-1.5 -inset-y-0.5 rounded-md pointer-events-none"
                style={{ background: 'rgba(139,92,246,0.07)' }} />
              {word.split('').map((ch, j) => {
                const typed   = j < typedText.length;
                const ch2     = typedText[j];
                const correct = typed && ch2 === ch;
                const wrong   = typed && ch2 !== ch;
                const isCursor = j === typedText.length;
                return (
                  <span key={j} style={{
                    color:      correct ? '#86efac' : wrong ? '#fca5a5' : 'rgba(255,255,255,0.90)',
                    textShadow: correct ? '0 0 12px rgba(134,239,172,0.85)' : wrong ? '0 0 8px rgba(252,165,165,0.6)' : 'none',
                    background: wrong ? 'rgba(248,113,113,0.14)' : 'none',
                    borderRadius: wrong ? '3px' : '0',
                    borderBottom: isCursor ? '2px solid #a78bfa' : 'none',
                    paddingBottom: isCursor ? '1px' : '0',
                    animation: isCursor ? 'blink-cursor 1s ease-in-out infinite' : 'none',
                    transition: 'color 0.06s',
                  }}>
                    {typed ? (ch2 === ' ' ? '\u00a0' : ch2) : ch}
                  </span>
                );
              })}
              {typedText.length >= word.length && (
                <span style={{
                  borderBottom: '2px solid #a78bfa', paddingBottom: '1px',
                  animation: 'blink-cursor 1s ease-in-out infinite',
                }}>&nbsp;</span>
              )}
            </span>
          );

          return (
            <span key={i} ref={el => { wordRefs.current[i] = el; }}
              className={cn('font-mono select-none', compact ? 'text-sm' : 'text-lg sm:text-xl')}
              style={{ color: 'rgba(255,255,255,0.30)', letterSpacing: '0.04em' }}>
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = 'purple' }: { pct: number; color?: 'purple' | 'green' | 'red' }) {
  const g = {
    green:  'linear-gradient(90deg,#7c3aed,#10b981)',
    red:    'linear-gradient(90deg,#ef4444,#f97316)',
    purple: 'linear-gradient(90deg,#7c3aed,#3b82f6)',
  };
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'rgba(255,255,255,0.07)' }}>
      <div className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: g[color] }} />
    </div>
  );
}

// ── Live stats strip ──────────────────────────────────────────────────────────
function StatsStrip({ wpm, accuracy, mode, timedLeft, isWarning, wordIndex, wordCount }: {
  wpm: number; accuracy: number; mode: string;
  timedLeft?: number; isWarning?: boolean;
  wordIndex?: number; wordCount?: number;
}) {
  const meta = MODE_META[mode] ?? { label: mode, color: '#a78bfa', glow: 'rgba(167,139,250,0.1)' };
  const accColor = accuracy >= 97 ? '#4ade80' : accuracy >= 85 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex items-center gap-2 px-1">
      {/* Mode badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0"
        style={{ background: meta.glow, border: `1px solid ${meta.color}30` }}>
        <span className="text-[0.62rem] font-bold" style={{ color: meta.color }}>{meta.label}</span>
      </div>

      <div className="flex-1" />

      {/* WPM */}
      <div className="flex items-center gap-1">
        <Zap className="w-3 h-3" style={{ color: '#a78bfa' }} />
        <span className="font-mono font-black text-sm" style={{ color: '#a78bfa' }}>{wpm}</span>
        <span className="text-[0.5rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>wpm</span>
      </div>

      <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.12)' }} />

      {/* Accuracy */}
      <div className="flex items-center gap-1">
        <Target className="w-3 h-3" style={{ color: accColor }} />
        <span className="font-mono font-black text-sm" style={{ color: accColor }}>{accuracy}%</span>
        <span className="text-[0.5rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>acc</span>
      </div>

      {/* Timed countdown */}
      {mode === 'timed' && timedLeft !== undefined && (
        <>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <span className={cn('font-mono font-black text-base leading-none', isWarning && 'animate-pulse')}
            style={{ color: isWarning ? '#f87171' : 'rgba(255,255,255,0.55)' }}>
            {Math.ceil(timedLeft)}<span className="text-xs font-light ml-0.5">s</span>
          </span>
        </>
      )}

      {/* Word progress */}
      {wordCount && wordCount > 0 && mode !== 'timed' && (
        <>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {wordIndex ?? 0}<span style={{ color: 'rgba(255,255,255,0.15)' }}>/{wordCount}</span>
          </span>
        </>
      )}
    </div>
  );
}

// ── Mini transport (mobile) ───────────────────────────────────────────────────
function MiniTransport() {
  const { isRecording, isPlaying, recordedEvents, loopEnabled,
    startRecording, stopRecording, playRecording, stopPlayback, setLoop, loadRecording } = useStore();
  const hasRecording = recordedEvents.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadOk, setUploadOk] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target?.result as string);
        if (Array.isArray(p) && p.length > 0 && p.every((x: any) => typeof x.key === 'string' && typeof x.timestamp === 'number')) {
          loadRecording(p); setUploadOk(true); setTimeout(() => setUploadOk(false), 2000);
        }
      } catch { /* ignore */ }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const btn = (active: boolean, activeStyle: React.CSSProperties = {}) => ({
    width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: active ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.05)',
    color: active ? '#c4b5fd' : 'rgba(255,255,255,0.45)',
    transition: 'all 0.15s',
    ...activeStyle,
  } as React.CSSProperties);

  return (
    <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl"
      style={{ background: 'rgba(12,9,28,0.75)', border: '1px solid rgba(139,92,246,0.18)', backdropFilter: 'blur(10px)' }}>
      <button onClick={isRecording ? stopRecording : startRecording} style={btn(isRecording, { background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.45)', color: '#fca5a5' })}>
        {isRecording ? <Square className="w-2.5 h-2.5 fill-current" /> : <Circle className="w-2.5 h-2.5 fill-current" />}
      </button>
      <button onClick={isPlaying ? stopPlayback : playRecording} disabled={isRecording || (!hasRecording && !isPlaying)}
        style={{ ...btn(isPlaying, { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)', color: '#6ee7b7' }), width: '32px', height: '32px', opacity: (isRecording || (!hasRecording && !isPlaying)) ? 0.25 : 1 }}>
        {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" style={{ marginLeft: '1px' }} />}
      </button>
      <button onClick={() => setLoop(!loopEnabled)} style={btn(loopEnabled)}>
        <Repeat className="w-2.5 h-2.5" />
      </button>
      <button onClick={() => fileInputRef.current?.click()} style={btn(uploadOk, { background: uploadOk ? 'rgba(52,211,153,0.15)' : undefined })}>
        <Upload className="w-2.5 h-2.5" />
      </button>
      <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleUpload} />
      {isRecording && <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /><span className="text-[0.5rem] text-red-400 font-mono">{recordedEvents.length}</span></div>}
    </div>
  );
}

// ── Session complete ──────────────────────────────────────────────────────────
function SessionComplete({ wpm, accuracy, compact = false }: { wpm: number; accuracy: number; compact?: boolean }) {
  const { resetTyping } = useStore();
  const grade = accuracy >= 97 ? { label: 'S', color: '#fde68a', glow: 'rgba(253,230,138,0.2)', border: 'rgba(253,230,138,0.4)' }
    : accuracy >= 90 ? { label: 'A', color: '#6ee7b7', glow: 'rgba(110,231,183,0.18)', border: 'rgba(110,231,183,0.35)' }
    : accuracy >= 80 ? { label: 'B', color: '#93c5fd', glow: 'rgba(147,197,253,0.18)', border: 'rgba(147,197,253,0.3)' }
    : { label: 'C', color: '#fdba74', glow: 'rgba(253,186,116,0.15)', border: 'rgba(253,186,116,0.3)' };

  if (compact) return (
    <div className="flex items-center gap-3 w-full h-full px-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
        style={{ background: grade.glow, border: `1px solid ${grade.border}`, color: grade.color }}>
        {grade.label}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-center"><div className="text-base font-black font-mono" style={{ color: '#a78bfa' }}>{wpm}</div><div className="text-[0.44rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>WPM</div></div>
        <div className="text-center"><div className="text-base font-black font-mono" style={{ color: accuracy >= 97 ? '#6ee7b7' : accuracy >= 80 ? '#fff' : '#fdba74' }}>{accuracy}%</div><div className="text-[0.44rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>ACC</div></div>
      </div>
      <button onClick={resetTyping} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.62rem] font-medium"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
        <RefreshCw className="w-3 h-3" />Reset
      </button>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 h-full">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black"
          style={{ background: grade.glow, border: `1px solid ${grade.border}`, color: grade.color, boxShadow: `0 0 24px ${grade.glow}` }}>
          {grade.label}
        </div>
        <div>
          <div className="text-[0.5rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Grade</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Session Complete</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {[
          { val: wpm,         sub: 'WPM',      col: '#a78bfa', icon: <Zap className="w-3.5 h-3.5" />    },
          { val: `${accuracy}%`, sub: 'Accuracy', col: accuracy >= 97 ? '#6ee7b7' : accuracy >= 80 ? '#fff' : '#fdba74', icon: <Target className="w-3.5 h-3.5" /> },
          { val: <Trophy className="w-4 h-4" />, sub: 'Done!', col: '#fde68a' },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1 rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-xl font-black font-mono flex items-center gap-1" style={{ color: s.col }}>{s.icon}{s.val}</div>
            <div className="text-[0.5rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <button onClick={resetTyping} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
        <RefreshCw className="w-3.5 h-3.5" />Try Again
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function InteractionArea() {
  const {
    typingMode, targetText, typedText, wordIndex, wordList,
    timedTimeLeft, timedDuration, sessionComplete, accuracy, wpm,
    lessonNumber, tickTimer,
  } = useStore();
  const isMobileLandscape = useMobileLandscape();
  const isPortraitPhone   = useIsPortraitPhone();

  const tickRef = useRef<number>(0);
  useEffect(() => {
    if (typingMode === 'timed') tickRef.current = window.setInterval(tickTimer, 250);
    return () => clearInterval(tickRef.current);
  }, [typingMode, tickTimer]);

  const isFixedMode  = ['lesson', 'numbers', 'custom'].includes(typingMode);
  const wordProgress = isFixedMode && wordList.length > 0 ? (wordIndex / wordList.length) * 100 : 0;
  const isWarning    = typingMode === 'timed' && timedTimeLeft <= 10;

  // ── Mobile compact ──────────────────────────────────────────────────────────
  if (isMobileLandscape || isPortraitPhone) {
    if (sessionComplete) return (
      <div className={cn('px-2 relative z-10 w-full', isPortraitPhone ? 'py-2' : 'py-1.5')}>
        <div className={cn('rounded-xl flex items-center', isPortraitPhone ? 'h-16' : 'h-14')}
          style={{ background: 'rgba(12,9,28,0.8)', border: '1px solid rgba(139,92,246,0.25)', backdropFilter: 'blur(12px)' }}>
          <SessionComplete wpm={wpm} accuracy={accuracy} compact />
        </div>
      </div>
    );

    return (
      <div className={cn('flex gap-2 relative z-10 w-full items-center', isPortraitPhone ? 'px-3 py-2.5' : 'px-2 py-1.5')}>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {typingMode === 'timed' && (
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[0.48rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>Timed</span>
              <span className={cn('font-mono font-black leading-none', isPortraitPhone ? 'text-base' : 'text-sm', isWarning && 'animate-pulse')}
                style={{ color: isWarning ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
                {Math.ceil(timedTimeLeft)}<span className="text-xs font-light ml-0.5">s</span>
              </span>
            </div>
          )}
          {typingMode === 'lesson' && (
            <div className="flex items-center gap-1 px-0.5">
              <span className="text-[0.5rem]">📚</span>
              <span className="text-[0.48rem] truncate" style={{ color: 'rgba(255,255,255,0.32)' }}>
                {LESSON_INSTRUCTIONS_EXPORT[lessonNumber] || 'Practice'}
              </span>
            </div>
          )}
          <FlowingLine wordList={wordList} wordIndex={wordIndex} typedText={typedText}
            targetText={targetText} isWarning={isWarning} compact />
          {(typingMode === 'timed' || isFixedMode) && (
            <ProgressBar pct={typingMode === 'timed' ? (timedTimeLeft / timedDuration) * 100 : wordProgress}
              color={isWarning ? 'red' : typingMode === 'lesson' ? 'green' : 'purple'} />
          )}
        </div>
        <MiniTransport />
      </div>
    );
  }

  // ── Desktop layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex px-4 sm:px-6 lg:px-8 py-3 sm:py-4 gap-4 sm:gap-5 relative z-10 max-w-7xl mx-auto w-full items-center h-full">

      {/* ── Left: typing area ── */}
      <div className="flex-1 min-w-0">
        {sessionComplete ? (
          <div className="h-[4.5rem] sm:h-20 flex items-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg,rgba(12,9,28,0.92),rgba(18,12,38,0.95))', border: '1.5px solid rgba(139,92,246,0.35)', backdropFilter: 'blur(16px)' }}>
            <SessionComplete wpm={wpm} accuracy={accuracy} />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Stats strip */}
            <StatsStrip
              wpm={wpm} accuracy={accuracy} mode={typingMode}
              timedLeft={timedTimeLeft} isWarning={isWarning}
              wordIndex={wordIndex} wordCount={isFixedMode ? wordList.length : undefined}
            />

            {/* Typing box */}
            <FlowingLine wordList={wordList} wordIndex={wordIndex}
              typedText={typedText} targetText={targetText} isWarning={isWarning} />

            {/* Progress bar */}
            {(typingMode === 'timed' || isFixedMode) && (
              <ProgressBar pct={typingMode === 'timed' ? (timedTimeLeft / timedDuration) * 100 : wordProgress}
                color={isWarning ? 'red' : typingMode === 'lesson' ? 'green' : 'purple'} />
            )}

            {/* Lesson hint */}
            {typingMode === 'lesson' && (
              <div className="flex items-center gap-1.5 px-0.5">
                <span className="text-[0.55rem]">📚</span>
                <span className="text-[0.55rem] truncate" style={{ color: 'rgba(255,255,255,0.32)' }}>
                  {LESSON_INSTRUCTIONS_EXPORT[lessonNumber] || 'Practice this sequence'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right: transport dock ── */}
      <div className="shrink-0">
        <TransportDock />
      </div>
    </div>
  );
}
