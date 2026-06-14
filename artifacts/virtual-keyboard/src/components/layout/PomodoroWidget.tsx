import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

type Phase = 'work' | 'break';

export function PomodoroWidget() {
  const store = useStore();
  const { pomodoroEnabled, pomodoroWorkMin, pomodoroBreakMin, pomodoroSessions, setPomodoroSessions } = store;

  const [phase, setPhase] = useState<Phase>('work');
  const [secondsLeft, setSecondsLeft] = useState(pomodoroWorkMin * 60);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = phase === 'work' ? pomodoroWorkMin * 60 : pomodoroBreakMin * 60;
  const pct = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const resetTimer = useCallback((p: Phase = phase) => {
    setRunning(false);
    setSecondsLeft(p === 'work' ? pomodoroWorkMin * 60 : pomodoroBreakMin * 60);
  }, [phase, pomodoroWorkMin, pomodoroBreakMin]);

  const switchPhase = useCallback(() => {
    const next: Phase = phase === 'work' ? 'break' : 'work';
    if (phase === 'work') setPomodoroSessions(pomodoroSessions + 1);
    setPhase(next);
    setSecondsLeft(next === 'work' ? pomodoroWorkMin * 60 : pomodoroBreakMin * 60);
    setRunning(false);
    try { new Notification(next === 'break' ? '🎉 Break time!' : '💪 Work time!', { body: next === 'break' ? `Take a ${pomodoroBreakMin}min break` : `Focus for ${pomodoroWorkMin}min` }); }
    catch { /* notifications not available */ }
  }, [phase, pomodoroWorkMin, pomodoroBreakMin, pomodoroSessions, setPomodoroSessions]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { switchPhase(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, switchPhase]);

  useEffect(() => { resetTimer(); }, [pomodoroWorkMin, pomodoroBreakMin]);

  if (!pomodoroEnabled) return null;

  const circumference = 2 * Math.PI * 14;
  const dash = circumference * pct;

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setExpanded(v => !v)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.55rem] font-semibold transition-all',
          phase === 'work'
            ? 'bg-red-500/15 border-red-500/30 text-red-300 hover:border-red-400/50'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:border-emerald-400/50',
          running && 'animate-pulse'
        )}
        title="Pomodoro Timer"
      >
        {phase === 'work' ? <Brain className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
        <span className="font-mono">{mins}:{secs}</span>
        <div className="relative w-4 h-4">
          <svg className="w-4 h-4 -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="3"
              strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="absolute top-full mt-2 right-0 z-[100] w-56 bg-[#0d0d1a]/98 border border-white/12 rounded-xl shadow-2xl p-3 space-y-3"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {phase === 'work' ? <Brain className="w-3.5 h-3.5 text-red-400" /> : <Coffee className="w-3.5 h-3.5 text-emerald-400" />}
              <span className={cn('text-[0.65rem] font-bold capitalize', phase === 'work' ? 'text-red-300' : 'text-emerald-300')}>
                {phase} session
              </span>
            </div>
            <span className="text-[0.55rem] text-white/40">#{pomodoroSessions + 1}</span>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke={phase === 'work' ? '#f87171' : '#34d399'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(2 * Math.PI * 34) * pct} ${2 * Math.PI * 34}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-xl font-bold text-white">{mins}:{secs}</span>
                <span className="text-[0.45rem] text-white/40 uppercase tracking-wider">{phase}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning(v => !v)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[0.6rem] font-semibold transition-all border',
                running
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-violet-500/20 border-violet-500/40 text-violet-300 hover:bg-violet-500/30'
              )}
            >
              {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => resetTimer()}
              className="p-1.5 rounded-lg bg-white/05 border border-white/08 text-white/40 hover:text-white/70 hover:border-white/18 transition-all"
              title="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              onClick={switchPhase}
              className="p-1.5 rounded-lg bg-white/05 border border-white/08 text-white/40 hover:text-white/70 hover:border-white/18 transition-all"
              title="Skip phase"
            >
              {phase === 'work' ? <Coffee className="w-3 h-3" /> : <Brain className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[0.5rem] text-white/30 pt-1 border-t border-white/06">
            <span>Sessions today: <span className="text-violet-400 font-bold">{pomodoroSessions}</span></span>
            <span>{pomodoroWorkMin}m work / {pomodoroBreakMin}m break</span>
          </div>
        </div>
      )}
    </div>
  );
}
