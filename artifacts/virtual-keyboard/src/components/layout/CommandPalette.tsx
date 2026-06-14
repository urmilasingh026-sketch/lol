import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore, APP_THEMES, RGB_MODES, SOUND_CATEGORIES } from '@/store';
import { cn } from '@/lib/utils';
import { Search, Command, Keyboard, Volume2, Palette, Music, Zap, RotateCcw, Trophy, Eye, Settings, Timer, Coffee, Brain, Download, Dumbbell, Target } from 'lucide-react';

type Action = {
  id: string; label: string; desc?: string; icon: React.ReactNode;
  group: string; keywords: string; action: () => void;
};

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const actions = useMemo((): Action[] => {
    const list: Action[] = [
      // Typing modes
      { id: 'mode-free', label: '✨ Free Typing', group: 'Mode', keywords: 'free type mode', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('free'); onClose(); } },
      { id: 'mode-word', label: '📝 Word Mode', group: 'Mode', keywords: 'word mode', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('word'); onClose(); } },
      { id: 'mode-timed', label: '⏱ Timed Test', group: 'Mode', keywords: 'timed test mode', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('timed'); onClose(); } },
      { id: 'mode-sprint', label: '🚀 Sprint Mode', group: 'Mode', keywords: 'sprint fast mode', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('sprint'); onClose(); } },
      { id: 'mode-lesson', label: '📚 Lesson Mode', group: 'Mode', keywords: 'lesson learn', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('lesson'); onClose(); } },
      { id: 'mode-code', label: '💻 Code Typing', group: 'Mode', keywords: 'code programming', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('code'); onClose(); } },
      { id: 'mode-quotes', label: '💭 Quotes', group: 'Mode', keywords: 'quotes famous', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('quotes'); onClose(); } },
      { id: 'mode-zen', label: '☯️ Zen Mode', group: 'Mode', keywords: 'zen calm mindful', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('zen'); onClose(); } },
      { id: 'mode-custom', label: '✏️ Custom Text', group: 'Mode', keywords: 'custom text own', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('custom'); onClose(); } },
      { id: 'mode-python', label: '🐍 Python Code', group: 'Mode', keywords: 'python code programming', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('coding-python'); onClose(); } },
      { id: 'mode-js', label: '🟨 JavaScript Code', group: 'Mode', keywords: 'javascript js code', icon: <Keyboard className="w-3 h-3" />,
        action: () => { store.setTypingMode('coding-javascript'); onClose(); } },
      // Audio
      { id: 'audio-reverb-on', label: '🌊 Enable Reverb', group: 'Audio', keywords: 'reverb echo audio', icon: <Volume2 className="w-3 h-3" />,
        action: () => { store.setEffect('reverb', true); onClose(); } },
      { id: 'audio-reverb-off', label: '🌊 Disable Reverb', group: 'Audio', keywords: 'reverb off disable', icon: <Volume2 className="w-3 h-3" />,
        action: () => { store.setEffect('reverb', false); onClose(); } },
      { id: 'audio-delay-on', label: '🔁 Enable Delay', group: 'Audio', keywords: 'delay echo audio', icon: <Volume2 className="w-3 h-3" />,
        action: () => { store.setEffect('delay', true); onClose(); } },
      { id: 'audio-metronome', label: '🎵 Toggle Metronome', group: 'Audio', keywords: 'metronome beat bpm', icon: <Music className="w-3 h-3" />,
        action: () => { store.setMetronome(!store.metronomeEnabled); onClose(); } },
      { id: 'audio-vol-max', label: '🔊 Volume Max', group: 'Audio', keywords: 'volume max loud', icon: <Volume2 className="w-3 h-3" />,
        action: () => { store.setVolume(1); onClose(); } },
      { id: 'audio-vol-mute', label: '🔇 Mute', group: 'Audio', keywords: 'mute volume silent', icon: <Volume2 className="w-3 h-3" />,
        action: () => { store.setVolume(0); onClose(); } },
      // Visual
      { id: 'visual-rgb-on', label: '🌈 Enable RGB', group: 'Visual', keywords: 'rgb rainbow color', icon: <Palette className="w-3 h-3" />,
        action: () => { store.setRgbEnabled(true); onClose(); } },
      { id: 'visual-rgb-off', label: '💤 Disable RGB', group: 'Visual', keywords: 'rgb off disable', icon: <Palette className="w-3 h-3" />,
        action: () => { store.setRgbEnabled(false); onClose(); } },
      { id: 'visual-heatmap', label: '🔥 Toggle Heatmap', group: 'Visual', keywords: 'heatmap key usage', icon: <Palette className="w-3 h-3" />,
        action: () => { store.setShowHeatmap(!store.showHeatmap); onClose(); } },
      { id: 'visual-focusmode', label: '🎯 Toggle Focus Mode', group: 'Visual', keywords: 'focus mode dim', icon: <Eye className="w-3 h-3" />,
        action: () => { store.setFocusMode(!store.focusMode); onClose(); } },
      { id: 'visual-bg-none', label: '⬛ Background: None', group: 'Visual', keywords: 'background none off', icon: <Palette className="w-3 h-3" />,
        action: () => { store.setBackgroundEffect('none'); onClose(); } },
      { id: 'visual-bg-matrix', label: '💾 Background: Matrix Rain', group: 'Visual', keywords: 'background matrix rain', icon: <Palette className="w-3 h-3" />,
        action: () => { store.setBackgroundEffect('matrix-rain'); onClose(); } },
      { id: 'visual-bg-particles', label: '✨ Background: Particles', group: 'Visual', keywords: 'background particles dust', icon: <Palette className="w-3 h-3" />,
        action: () => { store.setBackgroundEffect('particles'); onClose(); } },
      { id: 'visual-bg-starfield', label: '⭐ Background: Starfield', group: 'Visual', keywords: 'background stars starfield', icon: <Palette className="w-3 h-3" />,
        action: () => { store.setBackgroundEffect('starfield'); onClose(); } },
      // Performance
      { id: 'perf-on', label: '⚡ Enable Performance Mode', group: 'Performance', keywords: 'performance fast mode', icon: <Zap className="w-3 h-3" />,
        action: () => { store.setPerformanceMode(true); onClose(); } },
      { id: 'perf-off', label: '✨ Disable Performance Mode', group: 'Performance', keywords: 'performance off visual', icon: <Zap className="w-3 h-3" />,
        action: () => { store.setPerformanceMode(false); onClose(); } },
      // Session
      { id: 'session-reset', label: '🔄 Reset Session', group: 'Session', keywords: 'reset restart session', icon: <RotateCcw className="w-3 h-3" />,
        action: () => { store.resetTyping(); onClose(); } },
      { id: 'session-heatmap-clear', label: '🗑️ Clear Heatmap', group: 'Session', keywords: 'clear heatmap reset', icon: <RotateCcw className="w-3 h-3" />,
        action: () => { store.clearHeatmap(); onClose(); } },
      // Productivity (new)
      { id: 'prod-blind-on', label: '🙈 Enable Blind Typing', desc: 'Hide typed characters', group: 'Productivity', keywords: 'blind typing hide training', icon: <Eye className="w-3 h-3" />,
        action: () => { store.setBlindTypingMode(true); onClose(); } },
      { id: 'prod-blind-off', label: '👁️ Disable Blind Typing', desc: 'Show typed characters', group: 'Productivity', keywords: 'blind typing show disable', icon: <Eye className="w-3 h-3" />,
        action: () => { store.setBlindTypingMode(false); onClose(); } },
      { id: 'prod-ghost-on', label: '👻 Enable Ghost Mode', desc: 'Race against your best WPM', group: 'Productivity', keywords: 'ghost mode race best personal', icon: <Target className="w-3 h-3" />,
        action: () => { store.setGhostMode(true); onClose(); } },
      { id: 'prod-ghost-off', label: '👻 Disable Ghost Mode', group: 'Productivity', keywords: 'ghost mode disable off', icon: <Target className="w-3 h-3" />,
        action: () => { store.setGhostMode(false); onClose(); } },
      { id: 'prod-daily-on', label: '📅 Start Daily Challenge', desc: `Today's unique word set`, group: 'Productivity', keywords: 'daily challenge mode today unique', icon: <Dumbbell className="w-3 h-3" />,
        action: () => { store.setDailyChallengeMode(true); onClose(); } },
      { id: 'prod-daily-off', label: '📅 Disable Daily Challenge', group: 'Productivity', keywords: 'daily challenge disable off', icon: <Dumbbell className="w-3 h-3" />,
        action: () => { store.setDailyChallengeMode(false); onClose(); } },
      { id: 'prod-pomodoro-on', label: '🍅 Enable Pomodoro', desc: '25min work / 5min break cycles', group: 'Productivity', keywords: 'pomodoro timer focus work break', icon: <Timer className="w-3 h-3" />,
        action: () => { store.setPomodoroEnabled(true); onClose(); } },
      { id: 'prod-pomodoro-off', label: '🍅 Disable Pomodoro', group: 'Productivity', keywords: 'pomodoro timer disable off', icon: <Timer className="w-3 h-3" />,
        action: () => { store.setPomodoroEnabled(false); onClose(); } },
      { id: 'prod-export', label: '⬇️ Export Settings', desc: 'Download settings as JSON', group: 'Productivity', keywords: 'export settings backup download json', icon: <Download className="w-3 h-3" />,
        action: () => { store.exportSettings(); onClose(); } },
      // Quick Style Presets (new)
      { id: 'preset-gaming', label: '🎮 Preset: Gaming', desc: 'Neon theme + Fire RGB + Arcade sounds', group: 'Quick Preset', keywords: 'gaming preset neon fire arcade rgb', icon: <Zap className="w-3 h-3" />,
        action: () => { store.setQuickPreset('gaming'); onClose(); } },
      { id: 'preset-study', label: '📚 Preset: Study', desc: 'Midnight theme + Breathing RGB + Lo-fi', group: 'Quick Preset', keywords: 'study preset midnight breathing lofi', icon: <Brain className="w-3 h-3" />,
        action: () => { store.setQuickPreset('study'); onClose(); } },
      { id: 'preset-concert', label: '🎹 Preset: Concert', desc: 'Synthwave + Wave RGB + Orchestral', group: 'Quick Preset', keywords: 'concert preset synthwave wave orchestral', icon: <Music className="w-3 h-3" />,
        action: () => { store.setQuickPreset('concert'); onClose(); } },
      { id: 'preset-zen', label: '☯️ Preset: Zen', desc: 'Forest theme + Aurora RGB + Meditation', group: 'Quick Preset', keywords: 'zen preset forest aurora meditation calm', icon: <Coffee className="w-3 h-3" />,
        action: () => { store.setQuickPreset('zen'); onClose(); } },
      { id: 'preset-cyberpunk', label: '🤖 Preset: Cyberpunk', desc: 'Cyberpunk + Neon Pulse + Matrix Rain', group: 'Quick Preset', keywords: 'cyberpunk preset neon pulse matrix rain', icon: <Zap className="w-3 h-3" />,
        action: () => { store.setQuickPreset('cyberpunk'); onClose(); } },
      { id: 'preset-lofi', label: '🎵 Preset: Lo-fi', desc: 'Lo-fi theme + Lava RGB + Lo-fi sounds', group: 'Quick Preset', keywords: 'lofi preset lava warm lo-fi', icon: <Music className="w-3 h-3" />,
        action: () => { store.setQuickPreset('lofi'); onClose(); } },
      // ALL Sound categories
      ...SOUND_CATEGORIES.map(cat => ({
        id: `cat-${cat}`, label: `Sound: ${cat}`, group: 'Sound',
        keywords: `sound ${cat.toLowerCase()} category audio`,
        icon: <Volume2 className="w-3 h-3" />,
        action: () => { store.setSoundCategory(cat as any); onClose(); },
      })),
      // ALL RGB modes
      ...RGB_MODES.map(m => ({
        id: `rgb-${m.id}`, label: `RGB: ${m.label}`, desc: m.desc, group: 'RGB',
        keywords: `rgb lighting ${m.label.toLowerCase()} ${m.desc}`,
        icon: <span>{m.icon}</span>,
        action: () => { store.setRgbMode(m.id as any); onClose(); },
      })),
      // ALL Themes
      ...APP_THEMES.map(t => ({
        id: `theme-${t.id}`, label: `Theme: ${t.label}`, desc: t.desc, group: 'Theme',
        keywords: `theme ${t.label} ${t.desc} color style`,
        icon: <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />,
        action: () => { store.setTheme(t.id as any); onClose(); },
      })),
    ];
    return list;
  }, [store, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return actions.slice(0, 12);
    const q = query.toLowerCase();
    return actions
      .filter(a => a.label.toLowerCase().includes(q) || a.keywords.includes(q) || a.group.toLowerCase().includes(q))
      .slice(0, 20);
  }, [query, actions]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); filtered[selected]?.action(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, selected]);

  useEffect(() => { setSelected(0); }, [query]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const groups = useMemo(() => {
    const g: Record<string, Action[]> = {};
    filtered.forEach(a => { g[a.group] = [...(g[a.group] || []), a]; });
    return g;
  }, [filtered]);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-[#0d0d1a]/98 border border-white/12 rounded-2xl shadow-[0_0_80px_rgba(120,40,220,0.3)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2.5 px-3 py-3 border-b border-white/08">
          <Search className="w-4 h-4 text-white/30 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, mode, theme, setting…"
            className="flex-1 bg-transparent text-white/90 text-sm placeholder:text-white/25 focus:outline-none"
          />
          <div className="flex items-center gap-1 text-[0.5rem] text-white/25">
            <kbd className="px-1.5 py-0.5 rounded bg-white/06 border border-white/10 font-mono">↑↓</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/06 border border-white/10 font-mono">↵</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/06 border border-white/10 font-mono">Esc</kbd>
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <p className="text-center text-white/25 text-[0.65rem] py-6">No commands found</p>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-3 py-1 text-[0.46rem] font-bold text-white/25 uppercase tracking-widest">{group}</p>
                {items.map(action => {
                  const globalIdx = filtered.indexOf(action);
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      onMouseEnter={() => setSelected(globalIdx)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 transition-all text-left',
                        selected === globalIdx ? 'bg-violet-500/18' : 'hover:bg-white/04'
                      )}
                    >
                      <span className={cn('text-white/40 shrink-0 transition-colors', selected === globalIdx && 'text-violet-400')}>
                        {action.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.65rem] font-medium text-white/80">{action.label}</p>
                        {action.desc && <p className="text-[0.5rem] text-white/30 truncate">{action.desc}</p>}
                      </div>
                      {selected === globalIdx && (
                        <kbd className="text-[0.46rem] text-white/25 px-1.5 py-0.5 rounded bg-white/06 border border-white/10 font-mono shrink-0">↵</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-white/06">
          <span className="text-[0.48rem] text-white/20">{filtered.length} results · {actions.length} total commands</span>
          <div className="flex items-center gap-1">
            <Command className="w-2.5 h-2.5 text-white/20" />
            <span className="text-[0.48rem] text-white/20">Ctrl+K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
