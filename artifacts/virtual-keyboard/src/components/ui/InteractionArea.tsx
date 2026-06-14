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
    const anchorX = container.offsetWidth * 0.18;
    setTranslateX(anchorX - word.offsetLeft);
  }, [wordIndex]);

  const renderUntil = Math.min(wordList.length, wordIndex + 22);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden flex items-center transition-all duration-200 border',
        compact ? 'h-9 rounded-xl' : 'h-11 rounded-xl',
        isWarning ? 'border-orange-400/50 shadow-[0_0_14px_rgba(251,146,60,0.15)]' :
        isWrong   ? 'border-red-400/55 shadow-[0_0_14px_rgba(255,80,80,0.15)]' :
                    'border-white/[0.11]',
      )}
      style={{
        background: isWrong ? 'rgba(255,100,100,0.06)' : isWarning ? 'rgba(251,146,60,0.05)' : 'rgba(255,255,255,0.05)',
      }}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 z-10 bg-gradient-to-r from-[#09090f] via-[#09090f]/75 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-14 z-10 bg-gradient-to-l from-[#09090f] via-[#09090f]/75 to-transparent" />

      <div
        ref={innerRef}
        className="flex items-center gap-3 whitespace-nowrap px-7 will-change-transform"
        style={{ transform: `translateX(${translateX}px)`, transition: 'transform 0.13s cubic-bezier(0.25,0.46,0.45,0.94)' }}
      >
        {wordList.slice(0, renderUntil).map((word, i) => {
          const isCompleted = i < wordIndex;
          const isCurrent = i === wordIndex;

          if (isCompleted) return (
            <span key={i} ref={el => { wordRefs.current[i] = el; }}
              className={cn('font-mono tracking-wider text-white/18 select-none', compact ? 'text-[0.72rem]' : 'text-[0.8rem]')}>
              {word}
            </span>
          );

          if (isCurrent) return (
            <span key={i} ref={el => { wordRefs.current[i] = el; }}
              className={cn('font-mono tracking-wider', compact ? 'text-[0.72rem]' : 'text-[0.8rem]')}>
              {word.split('').map((ch, j) => {
                const isTyped = j < typedText.length;
                const typedCh = typedText[j];
                const correct = isTyped && typedCh === ch;
                const wrong = isTyped && typedCh !== ch;
                const isCursor = j === typedText.length;
                return (
                  <span key={j} className={cn(
                    'transition-colors duration-75',
                    !isTyped && 'text-white/82',
                    correct && 'text-emerald-300 drop-shadow-[0_0_6px_rgba(110,231,183,0.7)]',
                    wrong && 'text-red-400 bg-red-400/14 rounded-sm',
                    isCursor && 'border-b-[2.5px] border-violet-400 animate-pulse',
                  )}>
                    {isTyped ? (typedCh === ' ' ? '\u00a0' : typedCh) : ch}
                  </span>
                );
              })}
              {typedText.length >= word.length && <span className="border-b-[2.5px] border-violet-400 animate-pulse">&nbsp;</span>}
            </span>
          );

          return (
            <span key={i} ref={el => { wordRefs.current[i] = el; }}
              className={cn('font-mono tracking-wider text-white/22 select-none', compact ? 'text-[0.72rem]' : 'text-[0.8rem]')}>
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Thin progress bar ─────────────────────────────────────────────────────────
function ProgressBar({ pct, color = 'purple' }: { pct: number; color?: 'purple' | 'green' | 'red' }) {
  const g = { green: 'from-violet-500 via-emerald-400 to-emerald-500', red: 'from-red-500 to-orange-400', purple: 'from-violet-600 to-blue-500' };
  return (
    <div className="w-full bg-white/07 rounded-full h-[2.5px] overflow-hidden">
      <div className={cn('h-full rounded-full transition-all duration-300 bg-gradient-to-r', g[color])}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

// ── Mini inline transport for mobile landscape ────────────────────────────────
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
      } catch { /* ignore bad files */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-1.5 bg-black/40 border border-white/08 rounded-xl px-2.5 py-1.5 shrink-0">
      {/* Record */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center transition-all border',
          isRecording
            ? 'bg-red-500/25 border-red-500/60 text-red-400 shadow-[0_0_8px_rgba(255,80,80,0.4)]'
            : 'bg-white/05 border-white/10 text-white/60 hover:text-white hover:bg-white/12'
        )}
        title={isRecording ? 'Stop Recording' : 'Record'}
      >
        {isRecording
          ? <Square className="w-2.5 h-2.5 fill-current" />
          : <Circle className="w-2.5 h-2.5 fill-current" />}
      </button>

      {/* Play */}
      <button
        onClick={isPlaying ? stopPlayback : playRecording}
        disabled={isRecording || (!hasRecording && !isPlaying)}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all border',
          isPlaying
            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_8px_rgba(56,226,157,0.3)]'
            : 'bg-white/05 border-white/10 text-white/60 hover:text-white hover:bg-white/12',
          (isRecording || (!hasRecording && !isPlaying)) && 'opacity-25 cursor-not-allowed pointer-events-none'
        )}
      >
        {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" style={{ marginLeft: '1px' }} />}
      </button>

      {/* Loop */}
      <button
        onClick={() => setLoop(!loopEnabled)}
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center transition-all border',
          loopEnabled
            ? 'bg-violet-500/22 border-violet-400/50 text-violet-300'
            : 'bg-white/05 border-white/10 text-white/60 hover:text-white'
        )}
        title="Toggle Loop"
      >
        <Repeat className="w-2.5 h-2.5" />
      </button>

      {/* Upload */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center transition-all border',
          uploadOk
            ? 'bg-emerald-500/22 border-emerald-400/50 text-emerald-300'
            : 'bg-white/05 border-white/10 text-white/60 hover:text-white hover:bg-white/12'
        )}
        title="Upload recording JSON"
      >
        <Upload className="w-2.5 h-2.5" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleUpload}
      />

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-1 ml-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 rec-indicator" />
          <span className="text-[0.52rem] text-red-400 font-mono font-bold">{recordedEvents.length}</span>
        </div>
      )}
    </div>
  );
}

// ── Session complete ──────────────────────────────────────────────────────────
function SessionComplete({ wpm, accuracy, compact = false }: { wpm: number; accuracy: number; compact?: boolean }) {
  const { resetTyping } = useStore();
  const grade = accuracy >= 97 ? { label: 'S', color: 'text-yellow-300', bg: 'rgba(250,220,60,0.15)', border: 'rgba(250,220,60,0.35)' }
    : accuracy >= 90 ? { label: 'A', color: 'text-emerald-300', bg: 'rgba(56,226,157,0.12)', border: 'rgba(56,226,157,0.3)' }
    : accuracy >= 80 ? { label: 'B', color: 'text-blue-300', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' }
    : { label: 'C', color: 'text-orange-300', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.25)' };

  if (compact) {
    return (
      <div className="flex items-center gap-3 w-full h-full px-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg border shrink-0"
          style={{ background: grade.bg, borderColor: grade.border }}>
          <span className={grade.color}>{grade.label}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={cn('text-base font-black font-mono', 'text-violet-300')}>{wpm}</div>
            <div className="text-[0.45rem] text-white/35 uppercase tracking-widest">WPM</div>
          </div>
          <div className="text-center">
            <div className={cn('text-base font-black font-mono', accuracy >= 97 ? 'text-emerald-300' : accuracy >= 80 ? 'text-white' : 'text-orange-300')}>{accuracy}%</div>
            <div className="text-[0.45rem] text-white/35 uppercase tracking-widest">ACC</div>
          </div>
        </div>
        <button onClick={resetTyping}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/12 bg-white/05 hover:bg-white/12 text-white/60 hover:text-white text-[0.62rem] font-medium transition-all">
          <RefreshCw className="w-3 h-3" />Reset
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 h-full">
      <div className="flex items-center gap-3 session-complete-item">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black border"
          style={{ borderColor: grade.border, background: grade.bg, boxShadow: `0 0 24px ${grade.border}` }}>
          <span className={grade.color}>{grade.label}</span>
        </div>
        <div>
          <div className="text-[0.5rem] text-white/40 uppercase tracking-widest">Grade</div>
          <div className="text-xs text-white/60">Session Complete</div>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <MiniStatCard value={wpm} label="WPM" icon={<Zap className="w-3.5 h-3.5 text-violet-400" />} color="text-violet-300" />
        <MiniStatCard value={`${accuracy}%`} label="Accuracy" icon={<Target className="w-3.5 h-3.5 text-emerald-400" />} color={accuracy >= 97 ? 'text-emerald-300' : accuracy >= 80 ? 'text-white' : 'text-orange-300'} />
        <MiniStatCard value={<Trophy className="w-4 h-4" />} label="Done!" color="text-yellow-300" />
      </div>
      <button onClick={resetTyping}
        className="session-complete-item flex items-center gap-2 px-4 py-2 rounded-xl border border-white/12 bg-white/05 hover:bg-white/10 hover:border-white/22 text-white/70 hover:text-white text-xs font-medium transition-all">
        <RefreshCw className="w-3.5 h-3.5" />Try Again
      </button>
    </div>
  );
}

function MiniStatCard({ value, label, icon, color = 'text-white' }: {
  value: React.ReactNode; label: string; icon?: React.ReactNode; color?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white/04 border border-white/08 rounded-xl px-3.5 py-2.5">
      <div className={cn('text-xl font-black font-mono flex items-center gap-1', color)}>{icon}{value}</div>
      <div className="text-[0.5rem] text-white/35 uppercase tracking-widest">{label}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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

  // ── Compact layout: mobile landscape OR portrait phone ─────────────────────
  if (isMobileLandscape || isPortraitPhone) {
    if (sessionComplete) {
      return (
        <div className={cn('px-2 relative z-10 w-full', isPortraitPhone ? 'py-2' : 'py-1.5')}>
          <div className={cn('glass-panel rounded-xl flex items-center', isPortraitPhone ? 'h-16' : 'h-14')}>
            <SessionComplete wpm={wpm} accuracy={accuracy} compact />
          </div>
        </div>
      );
    }

    const isWarning = typingMode === 'timed' && timedTimeLeft <= 10;

    return (
      <div className={cn('flex gap-2 relative z-10 w-full items-center', isPortraitPhone ? 'px-3 py-2.5' : 'px-2 py-1.5')}>
        {/* Text area + optional progress */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Mode label + timer inline */}
          {typingMode === 'timed' && (
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[0.48rem] text-white/30 uppercase tracking-widest">Timed</span>
              <span className={cn('font-mono font-black leading-none', isPortraitPhone ? 'text-base' : 'text-sm', isWarning ? 'text-red-400 animate-pulse' : 'text-white/50')}>
                {Math.ceil(timedTimeLeft)}<span className="text-xs font-light ml-0.5">s</span>
              </span>
            </div>
          )}
          {typingMode === 'lesson' && (
            <div className="flex items-center gap-1 px-0.5">
              <span className="text-[0.5rem]">📚</span>
              <span className="text-[0.48rem] text-white/35 truncate">{LESSON_INSTRUCTIONS_EXPORT[lessonNumber] || 'Practice'}</span>
            </div>
          )}

          <FlowingLine
            wordList={wordList} wordIndex={wordIndex}
            typedText={typedText} targetText={targetText}
            isWarning={isWarning} compact
          />

          {/* Progress bar */}
          {(typingMode === 'timed' || isFixedMode) && (
            <ProgressBar
              pct={typingMode === 'timed' ? (timedTimeLeft / timedDuration) * 100 : wordProgress}
              color={isWarning ? 'red' : typingMode === 'lesson' ? 'green' : 'purple'}
            />
          )}
        </div>

        {/* Mini transport controls */}
        <MiniTransport />
      </div>
    );
  }

  // ── Desktop / tablet: full layout ──────────────────────────────────────────
  const renderContent = () => {
    if (sessionComplete) return <SessionComplete wpm={wpm} accuracy={accuracy} />;

    if (typingMode === 'timed') {
      const isWarning = timedTimeLeft <= 10;
      return (
        <div className="flex flex-col justify-center h-full gap-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[0.55rem] text-white/35 uppercase tracking-widest">Timed Test</span>
            <span className={cn('font-mono text-lg font-black transition-colors leading-none', isWarning ? 'text-red-400 animate-pulse' : 'text-white/55')}>
              {Math.ceil(timedTimeLeft)}<span className="text-sm font-light ml-0.5">s</span>
            </span>
          </div>
          <FlowingLine wordList={wordList} wordIndex={wordIndex} typedText={typedText} targetText={targetText} isWarning={isWarning} />
          <ProgressBar pct={(timedTimeLeft / timedDuration) * 100} color={isWarning ? 'red' : 'purple'} />
        </div>
      );
    }

    if (typingMode === 'lesson') return (
      <div className="flex flex-col justify-center h-full gap-2">
        <div className="flex items-center gap-2 px-0.5">
          <span className="text-[0.6rem]">📚</span>
          <span className="text-[0.6rem] text-white/40 truncate">{LESSON_INSTRUCTIONS_EXPORT[lessonNumber] || 'Practice this sequence'}</span>
        </div>
        <FlowingLine wordList={wordList} wordIndex={wordIndex} typedText={typedText} targetText={targetText} />
        <ProgressBar pct={wordProgress} color="green" />
      </div>
    );

    if (typingMode === 'numbers' || typingMode === 'custom') return (
      <div className="flex flex-col justify-center h-full gap-2">
        <FlowingLine wordList={wordList} wordIndex={wordIndex} typedText={typedText} targetText={targetText} />
        <ProgressBar pct={wordProgress} />
      </div>
    );

    return (
      <div className="flex flex-col justify-center h-full">
        <FlowingLine wordList={wordList} wordIndex={wordIndex} typedText={typedText} targetText={targetText} />
      </div>
    );
  };

  return (
    <div className="flex px-3 sm:px-5 lg:px-8 py-2 sm:py-3 gap-3 sm:gap-5 relative z-10 max-w-7xl mx-auto w-full items-center h-full">
      <div className="flex-1 min-w-0 flex items-center">
        <div className="w-full">{renderContent()}</div>
      </div>
      <div className="w-48 sm:w-56 lg:w-60 shrink-0">
        <TransportDock />
      </div>
    </div>
  );
}
