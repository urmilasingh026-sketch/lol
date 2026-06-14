import { useEffect } from 'react';
import { X, Keyboard, Music, Palette, Zap, Command } from 'lucide-react';

const SHORTCUTS = [
  { group: 'General', icon: Command, color: 'text-violet-400', items: [
    { keys: ['Ctrl', 'K'], desc: 'Open command palette' },
    { keys: ['F1'], desc: 'Toggle shortcuts overlay' },
    { keys: ['Esc'], desc: 'Close panels / cancel' },
    { keys: ['Ctrl', 'Shift', 'F'], desc: 'Toggle focus mode' },
    { keys: ['Ctrl', 'Shift', 'A'], desc: 'Toggle analytics dashboard' },
  ]},
  { group: 'Typing', icon: Keyboard, color: 'text-blue-400', items: [
    { keys: ['Tab'], desc: 'Restart / next word' },
    { keys: ['Ctrl', 'R'], desc: 'Reset session' },
    { keys: ['Ctrl', '1'], desc: 'Free typing mode' },
    { keys: ['Ctrl', '2'], desc: 'Word mode' },
    { keys: ['Ctrl', '3'], desc: 'Timed test' },
    { keys: ['Ctrl', '4'], desc: 'Sprint mode' },
    { keys: ['Ctrl', '5'], desc: 'Lesson mode' },
    { keys: ['Ctrl', '6'], desc: 'Code typing' },
  ]},
  { group: 'Audio', icon: Music, color: 'text-cyan-400', items: [
    { keys: ['Ctrl', 'M'], desc: 'Toggle mute' },
    { keys: ['Ctrl', 'Shift', 'M'], desc: 'Toggle metronome' },
    { keys: ['['], desc: 'Decrease volume' },
    { keys: [']'], desc: 'Increase volume' },
    { keys: ['Ctrl', 'Space'], desc: 'Play / pause recording' },
    { keys: ['Ctrl', 'Shift', 'R'], desc: 'Start / stop recording' },
  ]},
  { group: 'Visual', icon: Palette, color: 'text-fuchsia-400', items: [
    { keys: ['Ctrl', 'T'], desc: 'Cycle to next theme' },
    { keys: ['Ctrl', 'Shift', 'H'], desc: 'Toggle key heatmap' },
    { keys: ['Ctrl', 'B'], desc: 'Cycle background effect' },
    { keys: ['Ctrl', 'G'], desc: 'Toggle ghost mode' },
    { keys: ['Ctrl', 'Shift', 'B'], desc: 'Toggle blind typing mode' },
  ]},
  { group: 'System', icon: Zap, color: 'text-amber-400', items: [
    { keys: ['Ctrl', 'P'], desc: 'Toggle pomodoro timer' },
    { keys: ['Ctrl', 'E'], desc: 'Export settings' },
    { keys: ['Ctrl', 'Shift', 'P'], desc: 'Toggle performance mode' },
    { keys: ['Ctrl', ','], desc: 'Open settings' },
    { keys: ['Ctrl', 'Shift', 'D'], desc: 'Toggle daily challenge' },
  ]},
];

export function ShortcutsOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'F1') { e.preventDefault(); onClose(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0d0d1a]/98 border border-white/12 rounded-2xl shadow-[0_0_80px_rgba(120,40,220,0.3)] m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/08">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white/90">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/06 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {SHORTCUTS.map(({ group, icon: Icon, color, items }) => (
            <div key={group} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3 h-3 ${color}`} />
                <span className={`text-[0.55rem] font-bold uppercase tracking-widest ${color}`}>{group}</span>
              </div>
              <div className="space-y-1">
                {items.map(({ keys, desc }) => (
                  <div key={desc} className="flex items-center justify-between gap-3">
                    <span className="text-[0.6rem] text-white/50">{desc}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                          {i > 0 && <span className="text-white/20 text-[0.4rem]">+</span>}
                          <kbd className="px-1.5 py-0.5 rounded bg-white/06 border border-white/12 font-mono text-[0.5rem] text-white/60">{k}</kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-2.5 border-t border-white/06 flex items-center justify-between">
          <span className="text-[0.5rem] text-white/25">Press F1 or Esc to close</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/06 border border-white/10 font-mono text-[0.5rem] text-white/40">F1</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
