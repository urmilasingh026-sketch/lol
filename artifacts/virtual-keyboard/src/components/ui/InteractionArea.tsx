import { useStore, LESSON_INSTRUCTIONS_EXPORT } from '@/store';
import { cn } from '@/lib/utils';
import { TransportDock } from './TransportDock';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Trophy, Zap, Target, RefreshCw, Circle, Play, Pause, Square, Repeat, Upload } from 'lucide-react';
import { useMobileLandscape, useIsPortraitPhone } from '@/hooks/use-mobile-landscape';

// ── Flowing line ─────────────────────────────────────────────────────────────
function FlowingLine({
  wordList, wordIndex, typedText, targetText, isWarning = false, compact = false,
}: {
  wordList: string[]; wordIndex: number; typedText: string; targetText: string;
  isWarning?: boolean; compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const [translateX, setTranslateX] = useState(0);

  const isWrong = typedText.length > 0 && !targetText.startsWith(typedText);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const word = wordRefs.current[wordIndex];
    if (!container || !word) return;
    const anchorX = container.offsetWidth * 0.22;
    setTranslateX(anchorX - word.offsetLeft);
  }, [wordIndex]);

  const renderUntil = Math.min(wordList.length, wordIndex + 24);

  const borderColor = isWarning
    ? 'rgba(251,146,60,0.55)'
    : isWrong
    ? 'rgba(248,113,113,0.55)'
    : 'rgba(139,92,246,0.35)';

  const glowColor = isWarning
    ? 'rgba(251,146,60,0.12)'
    : isWrong
    ? 'rgba(248,113,113,0.12)'
    : 'rgba(139,92,246,0.08)';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden flex items-center transition-all duration-300',
        compact ? 'h-11 rounded-xl' : 'h-14 sm:h-16 rounded-2xl',
      )}
      style={{
        background: `linear-gradient(135deg, rgba(15,12,30,0.85) 0%, rgba(20,14,40,0.9) 100%)`,
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 4px 24px ${glowColor}, 0 1px 0 rgba(255,255,255,0.06) inset`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Subtle top shine */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Side fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10"
        style={{ background: 'linear-gradient(to right, rgba(15,12,30,0.95), transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10"
        style={{ background: 'linear-gradient(to left, rgba(15,12,30,0.95), transparent)' }} />

      <div
        ref={innerRef}
        className="flex items-center gap-4 whitespace-nowrap px-8 will-change-transform"
        style={{ transform: `translateX(${translateX}px)`, transition: 'transform 0.14s cubic-bezier(0.25,0.46,0.45,0.94)' }}
      >
        {wordList.slice(0, renderUntil).map((word, i) => {
          const isCompleted = i < wordIndex;
          const isCurrent = i === wordIndex;

          if (isCompleted) return (
            <span key={i} ref={el => { wordRefs.current[i] = el; }}
              className={cn(
                'font-mono tracking-wide select-none',
                compact ? 'text-sm' : 'text-base sm:text-lg',
              )}
              style={{ color: 'rgba(255,255,255,0.22)' }}>
              {word}
            </span>
          );

          if (isCurrent) return (
            <span key={i} ref={el => { wordRefs.current[i] = el; }}
              className={cn('font-mono tracking-wide', compact ? 'text-sm' : 'text-base sm:text-lg')}>
              {word.split('').map((ch, j) => {
                const isTyped = j < typedText.length;
                const typedCh = typedText[j];
                const correct = isTyped && typedCh === ch;
                const wrong = isTyped && typedCh !== ch;
                const isCursor = j === typedText.length;
                return (
                  <span key={j} style={{
                    color: correct ? '#86efac' : wrong ? '#f87171' : 'rgba(255,255,255,0.88)',
                    textShadow: correct ? '0 0 10px rgba(134,239,172,0.8)' : wrong ? '0 0 8px rgba(248,113,113,0.6)' : 'none',
                    background: wrong ? 'rgba(248,113,113,0.12)' : 'none',
                    borderRadius: wrong ? '3px' : '0',
                    borderBottom: isCursor ? '2px solid #a78bfa' : 'none',
                    paddingBottom: isCursor ? '1px' : '0',
                    transition: 'color 0.06s',
                    animation: isCursor ? 'blink-cursor 1s ease-in-out infinite' : 'none',
                  }}>
                    {isTyped ? (typedCh === ' ' ? '\u00a0' : typedCh) : ch}
                  </span>
                );
              })}
              {typedText.length >= word.length && (
                <span style={{ borderBottom: '2px solid #a78bfa', paddingBottom: '1px', animation: 'blink-cursor 1s ease-in-out infinite' }}>&nbsp;</span>
              )}
            </span>
          );

          return (
            <span key={i} ref={el => { wordRefs.current[i] = el; }}
              className={cn('font-mono tracking-wide select-none', compact ? 'text-sm' : 'text-base sm:text-lg')}
              style={{ color: 'rgba(255,255,255,0.32)' }}>
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = 'purple' }: { pct: number; color?: 'purple' | 'green' | 'red' }) {
  const gradients = {
    green:  'linear-gradient(90deg, #7c3aed, #10b981)',
    red:    'linear-gradient(90deg, #ef4444, #f97316)',
    purple: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
  };
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
      <div className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: gradients[color] }} />
    </div>
  );
}

// ── Mini transport for mobile ─────────────────────────────────────────────────
function MiniTransport() {
  const { isRecording, isPlaying, recordedEvents, loopEnabled, startRecording, stopRecording, playRecording, stopPlayback, setLoop, loadRecording } = useStore();
  const hasRecording = recordedEvents.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadOk, setUploadOk] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 &&
            parsed.every((item: any) => typeof item.key === 'string' && typeof item.timestamp === 'number')) {
          loadRecording(parsed);
          setUploadOk(true);
          setTimeout(() => setUploadOk(false), 2000);
        }
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const btnBase = 'w-7 h-7 rounded-full flex items-center justify-center transition-all border text-[0.6rem]';

  return (
    <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 shrink-0"
      style={{ background: 'rgba(15,12,30,0.7)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
      <button onClick={isRecording ? stopRecording : startRecording}
        className={cn(btnBase, isRecording
          ? 'bg-red-500/25 border-red-500/60 text-red-400'
          : 'bg-white/05 border-white/10 text-white/50 hover:text-white hover:bg-white/10')}
        title={isRecording ? 'Stop' : 'Record'}>
        {isRecording ? <Square className="w-2.5 h-2.5 fill-current" /> : <Circle className="w-2.5 h-2.5 fill-current" />}
      </button>
      <button onClick={isPlaying ? stopPlayback : playRecording}
        disabled={isRecording || (!hasRecording && !isPlaying)}
        className={cn(btnBase, 'w-8 h-8', isPlaying
          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
          : 'bg-white/05 border-white/10 text-white/50 hover:text-white hover:bg-white/10',
          (isRecording || (!hasRecording && !isPlaying)) && 'opacity-25 cursor-not-allowed')}>
        {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" style={{ marginLeft: '1px' }} />}
      </button>
      <button onClick={() => setLoop(!loopEnabled)}
        className={cn(btnBase, loopEnabled ? 'bg-violet-500/22 border-violet-400/50 text-violet-300' : 'bg-white/05 border-white/10 text-white/50 hover:text-white')}
        title="Loop">
        <Repeat className="w-2.5 h-2.5" />
      </button>
      <button onClick={() => fileInputRef.current?.click()}
        className={cn(btnBase, uploadOk ? 'bg-emerald-500/22 border-emerald-400/50 text-emerald-300' : 'bg-white/05 border-white/10 text-white/50 hover:text-white')}
        title="Upload">
        <Upload className="w-2.5 h-2.5" />
      </button>
      <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleUpload} />
      {isRecording && (
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[0.5rem] text-red-400 font-mono font-bold">{recordedEvents.length}</span>
        </div>
      )}
    </div>
  );
}

// ── Session complete card ─────────────────────────────────────────────────────
function SessionComplete({ wpm, accuracy, compact = false }: { wpm: number; accuracy: number; compact?: boolean }) {
  const { resetTyping } = useStore();
  const grade = accuracy >= 97
    ? { label: 'S', color: '#fde68a', glow: 'rgba(253,230,138,0.25)', border: 'rgba(253,230,138,0.4)' }
    : accuracy >= 90
    ? { label: 'A', color: '#6ee7b7', glow: 'rgba(110,231,183,0.2)', border: 'rgba(110,231,183,0.35)' }
    : accuracy >= 80
    ? { label: 'B', color: '#93c5fd', glow: 'rgba(147,197,253,0.2)', border: 'rgba(147,197,253,0.3)' }
    : { label: 'C', color: '#fdba74', glow: 'rgba(253,186,116,0.15)', border: 'rgba(253,186,116,0.3)' };

  if (compact) {
    return (
      <div className="flex items-center gap-3 w-full h-full px-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
          style={{ background: grade.glow, border: `1px solid ${grade.border}`, color: grade.color, boxShadow: `0 0 14px ${grade.glow}` }}>
          {grade.label}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-base font-black font-mono" style={{ color: '#a78bfa' }}>{wpm}</div>
            <div className="text-[0.44rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>WPM</div>
          </div>
          <div className="text-center">
            <div className="text-base font-black font-mono"
              style={{ color: accuracy >= 97 ? '#6ee7b7' : accuracy >= 80 ? '#fff' : '#fdba74' }}>{accuracy}%</div>
            <div className="text-[0.44rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>ACC</div>
          </div>
        </div>
        <button onClick={resetTyping}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.62rem] font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}>
          <RefreshCw className="w-3 h-3" />Reset
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 h-full">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black"
          style={{ background: grade.glow, border: `1px solid ${grade.border}`, color: grade.color, boxShadow: `0 0 24px ${grade.glow}` }}>
          {grade.label}
        </div>
        <div>
          <div className="text-[0.5rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Grade</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>Session Complete</div>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <MiniStatCard value={wpm} label="WPM" icon={<Zap className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />} color="#a78bfa" />
        <MiniStatCard value={`${accuracy}%`} label="Accuracy" icon={<Target className="w-3.5 h-3.5" style={{ color: '#6ee7b7' }} />}
          color={accuracy >= 97 ? '#6ee7b7' : accuracy >= 80 ? '#fff' : '#fdba74'} />
        <MiniStatCard value={<Trophy className="w-4 h-4" />} label="Done!" color="#fde68a" />
      </div>
      <button onClick={resetTyping}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}>
        <RefreshCw className="w-3.5 h-3.5" />Try Again
      </button>
    </div>
  );
}

function MiniStatCard({ value, label, icon, color = '#fff' }: {
  value: React.ReactNode; label: string; icon?: React.ReactNode; color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl px-3.5 py-2.5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="text-xl font-black font-mono flex items-center gap-1" style={{ color }}>{icon}{value}</div>
      <div className="text-[0.5rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
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
  const isPortraitPhone = useIsPortraitPhone();

  const tickRef = useRef<number>(0);
  useEffect(() => {
    if (typingMode === 'timed') {
      tickRef.current = window.setInterval(tickTimer, 250);
    }
    return () => clearInterval(tickRef.current);
  }, [typingMode, tickTimer]);

  const isFixedMode = ['lesson', 'numbers', 'custom'].includes(typingMode);
  const wordProgress = isFixedMode && wordList.length > 0 ? (wordIndex / wordList.length) * 100 : 0;

  // ── Compact layout: mobile ──────────────────────────────────────────────────
  if (isMobileLandscape || isPortraitPhone) {
    if (sessionComplete) {
      return (
        <div className={cn('px-2 relative z-10 w-full', isPortraitPhone ? 'py-2' : 'py-1.5')}>
          <div className={cn('rounded-xl flex items-center', isPortraitPhone ? 'h-16' : 'h-14')}
            style={{ background: 'rgba(15,12,30,0.7)', border: '1px solid rgba(139,92,246,0.25)', backdropFilter: 'blur(12px)' }}>
            <SessionComplete wpm={wpm} accuracy={accuracy} compact />
          </div>
        </div>
      );
    }

    const isWarning = typingMode === 'timed' && timedTimeLeft <= 10;

    return (
      <div className={cn('flex gap-2 relative z-10 w-full items-center', isPortraitPhone ? 'px-3 py-2.5' : 'px-2 py-1.5')}>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {typingMode === 'timed' && (
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[0.48rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Timed</span>
              <span className={cn('font-mono font-black leading-none', isPortraitPhone ? 'text-base' : 'text-sm')}
                style={{ color: isWarning ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
                {Math.ceil(timedTimeLeft)}<span className="text-xs font-light ml-0.5">s</span>
              </span>
            </div>
          )}
          {typingMode === 'lesson' && (
            <div className="flex items-center gap-1 px-0.5">
              <span className="text-[0.5rem]">📚</span>
              <span className="text-[0.48rem] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {LESSON_INSTRUCTIONS_EXPORT[lessonNumber] || 'Practice'}
              </span>
            </div>
          )}
          <FlowingLine wordList={wordList} wordIndex={wordIndex} typedText={typedText}
            targetText={targetText} isWarning={isWarning} compact />
          {(typingMode === 'timed' || isFixedMode) && (
            <ProgressBar
              pct={typingMode === 'timed' ? (timedTimeLeft / timedDuration) * 100 : wordProgress}
              color={isWarning ? 'red' : typingMode === 'lesson' ? 'green' : 'purple'}
            />
          )}
        </div>
        <MiniTransport />
      </div>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  const isWarning = typingMode === 'timed' && timedTimeLeft <= 10;

  const renderContent = () => {
    if (sessionComplete) return <SessionComplete wpm={wpm} accuracy={accuracy} />;

    return (
      <div className="flex flex-col justify-center h-full gap-2">
        {/* Top label row */}
        {typingMode === 'timed' && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[0.52rem] uppercase tracking-widest font-semibold"
              style={{ color: 'rgba(255,255,255,0.3)' }}>Timed Test</span>
            <span className={cn('font-mono text-lg font-black leading-none transition-colors', isWarning && 'animate-pulse')}
              style={{ color: isWarning ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
              {Math.ceil(timedTimeLeft)}<span className="text-sm font-light ml-0.5">s</span>
            </span>
          </div>
        )}
        {typingMode === 'lesson' && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-[0.6rem]">📚</span>
            <span className="text-[0.58rem] truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>
              {LESSON_INSTRUCTIONS_EXPORT[lessonNumber] || 'Practice this sequence'}
            </span>
          </div>
        )}

        {/* Main flowing line */}
        <FlowingLine wordList={wordList} wordIndex={wordIndex}
          typedText={typedText} targetText={targetText} isWarning={isWarning} />

        {/* Progress bar */}
        {(typingMode === 'timed' || isFixedMode) && (
          <ProgressBar
            pct={typingMode === 'timed' ? (timedTimeLeft / timedDuration) * 100 : wordProgress}
            color={isWarning ? 'red' : typingMode === 'lesson' ? 'green' : 'purple'}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex px-4 sm:px-6 lg:px-8 py-3 sm:py-4 gap-4 sm:gap-5 relative z-10 max-w-7xl mx-auto w-full items-center h-full">
      <div className="flex-1 min-w-0 flex items-center">
        <div className="w-full">{renderContent()}</div>
      </div>
      <div className="shrink-0">
        <TransportDock />
      </div>
    </div>
  );
}
