import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { useStore, SOUND_CATEGORIES, ALL_APP_THEMES, ALL_BACKGROUND_EFFECTS, MUSICAL_SCALES, ALL_RGB_MODES, ALL_TYPING_MODES_LIST, APP_THEMES } from '@/store';
import { cn } from '@/lib/utils';
import { PresetsManager } from './PresetsManager';
import { RecordingsManager } from './RecordingsManager';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { getLevelInfo } from '@/lib/achievements';
import {
  Keyboard, Volume2, Wand2, Palette, Sliders, Music, Eye, Accessibility,
  Zap, Database, Mic2, Trophy, ChevronRight, RotateCcw, Search,
  Swords, LayoutDashboard, Radio, Sparkles,
  Lock,
  Cpu,
  SlidersHorizontal, Play, Pause, Square, Circle, Repeat, VolumeX,
  Ghost, Focus, EyeOff, Target, Download, Command, HelpCircle,
  Dices, Flame, BarChart2,
} from 'lucide-react';

const TABS = [
  { id: 'controls',      icon: SlidersHorizontal, label: 'Controls',   color: 'text-violet-400' },
  { id: 'typing',        icon: Keyboard,        label: 'Typing',       color: 'text-violet-400' },
  { id: 'audio',         icon: Volume2,          label: 'Audio',        color: 'text-blue-400' },
  { id: 'fx',            icon: Sliders,          label: 'FX / EQ',     color: 'text-cyan-400' },
  { id: 'fx2',           icon: Radio,            label: 'FX II',        color: 'text-sky-400' },
  { id: 'visual',        icon: Palette,          label: 'Visual',       color: 'text-fuchsia-400' },
  { id: 'vfx',           icon: Sparkles,         label: 'Visual FX',   color: 'text-pink-400' },
  { id: 'keyboard',      icon: Wand2,            label: 'Keys',         color: 'text-amber-400' },
  { id: 'musical',       icon: Music,            label: 'Musical',      color: 'text-rose-400' },
  { id: 'interface',     icon: Eye,              label: 'Interface',    color: 'text-teal-400' },
  { id: 'layout',        icon: LayoutDashboard,  label: 'Layout',       color: 'text-lime-400' },
  { id: 'accessibility', icon: Accessibility,    label: 'A11y',         color: 'text-green-400' },
  { id: 'performance',   icon: Zap,              label: 'Perf',         color: 'text-yellow-400' },
  { id: 'challenges',    icon: Swords,           label: 'Challenges',   color: 'text-red-400' },
  { id: 'shortcuts2',    icon: Cpu,              label: 'Shortcuts',    color: 'text-rose-300' },
  { id: 'presets',       icon: Database,         label: 'Presets',      color: 'text-indigo-400' },
  { id: 'recordings',    icon: Mic2,             label: 'Recordings',   color: 'text-pink-400' },
  { id: 'achievements',  icon: Trophy,           label: 'Achieve',      color: 'text-orange-400' },
] as const;

type TabId = typeof TABS[number]['id'];

// ────────────────────────────────────────────────────────────────────────────
// Design system — completely redesigned
// ────────────────────────────────────────────────────────────────────────────

// Each tab has its own accent gradient used across all sub-components
const TAB_ACCENTS: Record<string, { from: string; to: string; border: string; text: string; glow: string }> = {
  controls:      { from: '#6d28d9', to: '#a78bfa', border: 'border-violet-500/50',  text: 'text-violet-300',  glow: '0 0 12px #6d28d955' },
  typing:        { from: '#7c3aed', to: '#a855f7', border: 'border-violet-500/50',  text: 'text-violet-300',  glow: '0 0 12px #7c3aed55' },
  audio:         { from: '#2563eb', to: '#38bdf8', border: 'border-blue-500/50',    text: 'text-blue-300',    glow: '0 0 12px #2563eb55' },
  fx:            { from: '#0891b2', to: '#22d3ee', border: 'border-cyan-500/50',    text: 'text-cyan-300',    glow: '0 0 12px #0891b255' },
  fx2:           { from: '#0284c7', to: '#7dd3fc', border: 'border-sky-500/50',     text: 'text-sky-300',     glow: '0 0 12px #0284c755' },
  visual:        { from: '#c026d3', to: '#e879f9', border: 'border-fuchsia-500/50', text: 'text-fuchsia-300', glow: '0 0 12px #c026d355' },
  vfx:           { from: '#db2777', to: '#f472b6', border: 'border-pink-500/50',    text: 'text-pink-300',    glow: '0 0 12px #db277755' },
  keyboard:      { from: '#d97706', to: '#fbbf24', border: 'border-amber-500/50',   text: 'text-amber-300',   glow: '0 0 12px #d9770655' },
  musical:       { from: '#e11d48', to: '#fb7185', border: 'border-rose-500/50',    text: 'text-rose-300',    glow: '0 0 12px #e11d4855' },
  interface:     { from: '#0f766e', to: '#5eead4', border: 'border-teal-500/50',    text: 'text-teal-300',    glow: '0 0 12px #0f766e55' },
  layout:        { from: '#4d7c0f', to: '#bef264', border: 'border-lime-500/50',    text: 'text-lime-300',    glow: '0 0 12px #4d7c0f55' },
  accessibility: { from: '#15803d', to: '#86efac', border: 'border-green-500/50',   text: 'text-green-300',   glow: '0 0 12px #15803d55' },
  performance:   { from: '#a16207', to: '#fde047', border: 'border-yellow-500/50',  text: 'text-yellow-300',  glow: '0 0 12px #a1620755' },
  challenges:    { from: '#b91c1c', to: '#f87171', border: 'border-red-500/50',     text: 'text-red-300',     glow: '0 0 12px #b91c1c55' },
  shortcuts2:    { from: '#9f1239', to: '#fda4af', border: 'border-rose-400/50',    text: 'text-rose-200',    glow: '0 0 12px #9f123955' },
  tips:          { from: '#713f12', to: '#fef08a', border: 'border-yellow-400/50',  text: 'text-yellow-200',  glow: '0 0 12px #713f1255' },
  social:        { from: '#065f46', to: '#6ee7b7', border: 'border-emerald-500/50', text: 'text-emerald-300', glow: '0 0 12px #065f4655' },
  presets:       { from: '#312e81', to: '#a5b4fc', border: 'border-indigo-500/50',  text: 'text-indigo-300',  glow: '0 0 12px #312e8155' },
  recordings:    { from: '#831843', to: '#f9a8d4', border: 'border-pink-500/50',    text: 'text-pink-300',    glow: '0 0 12px #83184355' },
  achievements:  { from: '#7c2d12', to: '#fdba74', border: 'border-orange-500/50',  text: 'text-orange-300',  glow: '0 0 12px #7c2d1255' },
};

function useTabAccent(tab: string) {
  return TAB_ACCENTS[tab] ?? TAB_ACCENTS['typing'];
}

// Active tab context
const ActiveTabCtx = createContext('typing');

function SectionLabel({ children }: { children: React.ReactNode }) {
  const tab = useContext(ActiveTabCtx);
  const acc = useTabAccent(tab);
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      <div className="w-1 h-4 rounded-full shrink-0" style={{ background: `linear-gradient(to bottom, ${acc.from}, ${acc.to})` }} />
      <span className={cn('text-[0.65rem] font-bold uppercase tracking-widest', acc.text)}>{children}</span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${acc.from}33, transparent)` }} />
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) {
  const tab = useContext(ActiveTabCtx);
  const acc = useTabAccent(tab);
  return (
    <button
      onClick={onChange}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-xl border transition-all text-left',
        checked
          ? `border-opacity-60 bg-white/06 ${acc.border}`
          : 'border-white/05 bg-white/02 hover:bg-white/05 hover:border-white/10'
      )}
      style={checked ? { boxShadow: acc.glow } : undefined}
    >
      <div className="flex flex-col min-w-0">
        <span className={cn('text-xs font-semibold truncate leading-snug', checked ? acc.text : 'text-white/65')}>{label}</span>
        {desc && <span className="text-[0.52rem] text-white/32 leading-tight mt-0.5">{desc}</span>}
      </div>
      <div className={cn(
        'w-9 h-[18px] rounded-full relative transition-all shrink-0 border',
        checked ? `${acc.border}` : 'border-white/10'
      )}
        style={checked ? { background: `linear-gradient(to right, ${acc.from}88, ${acc.to}88)` } : { background: 'rgba(255,255,255,0.04)' }}
      >
        <div className={cn(
          'absolute top-[2px] w-[13px] h-[13px] rounded-full transition-all duration-200',
          checked ? 'left-[20px]' : 'left-[2px]'
        )}
          style={{ background: checked ? `linear-gradient(135deg, ${acc.from}, ${acc.to})` : 'rgba(255,255,255,0.3)' }}
        />
      </div>
    </button>
  );
}

function Slider({ label, value, min, max, step = 1, display, unit, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; display?: string; unit?: string; onChange: (v: number) => void;
}) {
  const tab = useContext(ActiveTabCtx);
  const acc = useTabAccent(tab);
  const resolvedDisplay = display ?? `${Math.round(value)}${unit ?? ''}`;
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="px-2.5 py-2 rounded-xl bg-white/02 border border-white/05 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60 font-medium">{label}</span>
        <span className={cn('text-xs font-black font-mono', acc.text)}>{resolvedDisplay}</span>
      </div>
      <div className="relative h-3 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10 overflow-hidden pointer-events-none">
          <div className="h-full rounded-full transition-all duration-75"
            style={{ width: `${pct}%`, background: `linear-gradient(to right, ${acc.from}, ${acc.to})` }} />
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="relative w-full cursor-pointer z-10 opacity-0 h-full"
          style={{ WebkitAppearance: 'none' }}
        />
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange }: {
  label: string; value: string; options: ({ value: string; label: string } | string)[]; onChange: (v: string) => void;
}) {
  const tab = useContext(ActiveTabCtx);
  const acc = useTabAccent(tab);
  const normalized = options.map(o => typeof o === 'string' ? { value: o, label: o } : o);
  return (
    <div className="px-2.5 py-2.5 rounded-xl bg-white/02 border border-white/05 flex items-center justify-between gap-2">
      <span className="text-xs text-white/60 font-medium shrink-0">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'min-w-0 max-w-[58%] bg-white/08 border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer',
          acc.border, acc.text
        )}
        style={{ background: `linear-gradient(to right, ${acc.from}18, ${acc.to}10)` }}
      >
        {normalized.map(o => <option key={o.value} value={o.value} className="bg-[#0a0a18] text-white/80">{o.label}</option>)}
      </select>
    </div>
  );
}

function ChipGroup<T extends string>({ value, options, onChange, wrap = false }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; wrap?: boolean;
}) {
  const tab = useContext(ActiveTabCtx);
  const acc = useTabAccent(tab);
  return (
    <div className={cn('flex gap-1', wrap ? 'flex-wrap' : 'overflow-x-auto scrollbar-hide')}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'px-2.5 py-1 rounded-xl border text-[0.56rem] font-semibold transition-all shrink-0',
            value === o.value
              ? `${acc.border} ${acc.text}`
              : 'bg-white/03 border-white/07 text-white/40 hover:text-white/65 hover:border-white/15'
          )}
          style={value === o.value ? {
            background: `linear-gradient(to right, ${acc.from}22, ${acc.to}18)`,
            boxShadow: acc.glow,
          } : undefined}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Tab content components
// ────────────────────────────────────────────────────────────────────────────

const TYPING_MODES_LIST = [
  { value: 'free', label: '✨ Free Typing', group: 'Basic' },
  { value: 'word', label: '📝 Words', group: 'Basic' },
  { value: 'sentence', label: '💬 Sentences', group: 'Basic' },
  { value: 'paragraph', label: '📄 Paragraphs', group: 'Basic' },
  { value: 'timed', label: '⏱️ Timed Test', group: 'Basic' },
  { value: 'sprint', label: '🚀 Sprint', group: 'Basic' },
  { value: 'lesson', label: '📚 Lesson', group: 'Basic' },
  { value: 'custom', label: '✏️ Custom Text', group: 'Basic' },
  { value: 'numbers', label: '🔢 Numbers', group: 'Basic' },
  { value: 'quotes', label: '💭 Quotes', group: 'Literature' },
  { value: 'poetry', label: '🌹 Poetry', group: 'Literature' },
  { value: 'books', label: '📖 Books', group: 'Literature' },
  { value: 'speeches', label: '🎤 Speeches', group: 'Literature' },
  { value: 'literature', label: '🖊️ Literature', group: 'Literature' },
  { value: 'code', label: '💻 Code', group: 'Programming' },
  { value: 'coding-python', label: '🐍 Python', group: 'Programming' },
  { value: 'coding-javascript', label: '🟨 JavaScript', group: 'Programming' },
  { value: 'coding-html', label: '🌐 HTML', group: 'Programming' },
  { value: 'coding-sql', label: '🗃️ SQL', group: 'Programming' },
  { value: 'coding-bash', label: '💾 Bash', group: 'Programming' },
  { value: 'tech-terms', label: '⚙️ Tech Terms', group: 'Programming' },
  { value: 'science', label: '🔬 Science', group: 'Knowledge' },
  { value: 'history', label: '🏛️ History', group: 'Knowledge' },
  { value: 'geography', label: '🗺️ Geography', group: 'Knowledge' },
  { value: 'space', label: '🚀 Space', group: 'Knowledge' },
  { value: 'psychology', label: '🧠 Psychology', group: 'Knowledge' },
  { value: 'biology', label: '🧬 Biology', group: 'Knowledge' },
  { value: 'physics', label: '⚛️ Physics', group: 'Knowledge' },
  { value: 'chemistry', label: '⚗️ Chemistry', group: 'Knowledge' },
  { value: 'math-facts', label: '📐 Math', group: 'Knowledge' },
  { value: 'philosophy', label: '🤔 Philosophy', group: 'Knowledge' },
  { value: 'mythology', label: '⚡ Mythology', group: 'Knowledge' },
  { value: 'economics', label: '📈 Economics', group: 'Knowledge' },
  { value: 'zen', label: '☯️ Zen', group: 'Lifestyle' },
  { value: 'mindfulness', label: '🧘 Mindfulness', group: 'Lifestyle' },
  { value: 'motivational', label: '💪 Motivational', group: 'Lifestyle' },
  { value: 'self-help', label: '🌱 Self-Help', group: 'Lifestyle' },
  { value: 'fitness', label: '🏋️ Fitness', group: 'Lifestyle' },
  { value: 'cooking', label: '🍳 Cooking', group: 'Lifestyle' },
  { value: 'anime', label: '⛩️ Anime', group: 'Pop Culture' },
  { value: 'movies', label: '🎬 Movies', group: 'Pop Culture' },
  { value: 'gaming', label: '🎮 Gaming', group: 'Pop Culture' },
  { value: 'sports', label: '🏆 Sports', group: 'Pop Culture' },
  { value: 'music', label: '🎵 Music', group: 'Pop Culture' },
  { value: 'proverbs', label: '📜 Proverbs', group: 'Pop Culture' },
  { value: 'idioms', label: '💬 Idioms', group: 'Pop Culture' },
  { value: 'vocabulary', label: '📚 Vocabulary', group: 'Academic' },
  { value: 'grammar', label: '✍️ Grammar', group: 'Academic' },
  { value: 'long-words', label: '🔤 Long Words', group: 'Academic' },
  { value: 'creative-writing', label: '✒️ Creative Writing', group: 'Academic' },
  { value: 'riddles', label: '🎲 Riddles', group: 'Academic' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Controls Tab — all quick controls moved from top/bottom bars
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_MODES_CTRL = [
  { value: 'free', label: '✨ Free', color: '#a78bfa' },
  { value: 'word', label: '📝 Words', color: '#60a5fa' },
  { value: 'sentence', label: '💬 Sentences', color: '#34d399' },
  { value: 'timed', label: '⏱ Timed', color: '#fb923c' },
  { value: 'sprint', label: '🚀 Sprint', color: '#f43f5e' },
  { value: 'lesson', label: '📚 Lesson', color: '#fbbf24' },
  { value: 'code', label: '💻 Code', color: '#22d3ee' },
  { value: 'quotes', label: '💭 Quotes', color: '#e879f9' },
  { value: 'zen', label: '☯️ Zen', color: '#86efac' },
  { value: 'gaming', label: '🎮 Gaming', color: '#f472b6' },
  { value: 'science', label: '🔬 Science', color: '#38bdf8' },
  { value: 'history', label: '🏛 History', color: '#d97706' },
  { value: 'poetry', label: '🌹 Poetry', color: '#c084fc' },
  { value: 'geography', label: '🗺 Geo', color: '#2dd4bf' },
  { value: 'math-facts', label: '📐 Math', color: '#a3e635' },
];

function ControlsTab() {
  const s = useStore();
  const [showTheme, setShowTheme] = useState(false);
  const [showBpm, setShowBpm] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [themeFilter, setThemeFilter] = useState<'all' | 'dark' | 'neon' | 'nature' | 'gems'>('all');
  const [customGoal, setCustomGoal] = useState('');
  const themeRef = useRef<HTMLDivElement>(null);
  const bpmRef = useRef<HTMLDivElement>(null);
  const goalRef = useRef<HTMLDivElement>(null);

  const filteredThemes = themeFilter === 'all' ? APP_THEMES : (() => {
    const neonIds = ['neon','cyberpunk','matrix','synthwave','vaporwave','retrowave','glitch','arcade','terminal','crt','blade-runner','ghost-shell','hackers','cyberpunk-2077','neon-tokyo'];
    const natureIds = ['forest','ocean','sakura','bamboo','volcano','desert','meadow','rainforest','arctic-tundra'];
    const gemIds = ['ruby','sapphire','emerald','amethyst','topaz','jade','diamond','onyx','garnet'];
    const darkIds = ['midnight','aurora','void','abyss','coal','obsidian','shadow','gunmetal'];
    const map: Record<string, string[]> = { neon: neonIds, nature: natureIds, gems: gemIds, dark: darkIds };
    return APP_THEMES.filter(t => (map[themeFilter] || []).includes(t.id));
  })();

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowTheme(false);
      if (bpmRef.current && !bpmRef.current.contains(e.target as Node)) setShowBpm(false);
      if (goalRef.current && !goalRef.current.contains(e.target as Node)) setShowGoal(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const isPlaying = useStore(st => st.isPlaying);
  const isRecording = useStore(st => st.isRecording);
  const recordedEvents = useStore(st => st.recordedEvents);
  const loopEnabled = useStore(st => st.loopEnabled);

  return (
    <div className="space-y-3">

      {/* ── Typing Mode ── */}
      <SectionLabel>Typing Mode</SectionLabel>
      <div className="flex flex-wrap gap-1">
        {QUICK_MODES_CTRL.map(m => (
          <button key={m.value} onClick={() => s.setTypingMode(m.value as any)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[0.54rem] font-semibold border transition-all',
              s.typingMode === m.value ? '' : 'bg-white/04 border-white/08 text-white/35 hover:text-white/65 hover:border-white/20'
            )}
            style={s.typingMode === m.value ? { background: `${m.color}20`, borderColor: `${m.color}60`, color: m.color } : {}}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Transport ── */}
      <SectionLabel>Transport</SectionLabel>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={isRecording ? useStore.getState().stopRecording : useStore.getState().startRecording}
          title={isRecording ? 'Stop Recording' : 'Record'}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[0.58rem] font-semibold transition-all',
            isRecording ? 'bg-red-500/20 border-red-500/60 text-red-300' : 'bg-white/05 border-white/10 text-white/50 hover:text-white hover:border-white/25'
          )}>
          {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Circle className="w-3 h-3" />}
          {isRecording ? 'Stop' : 'Record'}
        </button>
        <button
          onClick={isPlaying ? useStore.getState().stopPlayback : useStore.getState().playRecording}
          disabled={isRecording || (recordedEvents.length === 0 && !isPlaying)}
          title={isPlaying ? 'Stop Playback' : 'Play Recording'}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[0.58rem] font-semibold transition-all',
            isPlaying ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-white/05 border-white/10 text-white/50 hover:text-white hover:border-white/25',
            (isRecording || (recordedEvents.length === 0 && !isPlaying)) && 'opacity-30 pointer-events-none'
          )}>
          {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3" />}
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        <button onClick={() => useStore.getState().setLoop(!loopEnabled)}
          title="Loop"
          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[0.58rem] font-semibold transition-all',
            loopEnabled ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'bg-white/05 border-white/10 text-white/50 hover:text-white hover:border-white/25'
          )}>
          <Repeat className="w-3 h-3" /> Loop
        </button>
        <button onClick={s.resetTyping}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white/05 border-white/10 text-white/50 hover:text-white hover:border-white/25 text-[0.58rem] font-semibold transition-all">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* ── Volume ── */}
      <SectionLabel>Volume</SectionLabel>
      <div className="px-2.5 py-2 rounded-xl bg-white/02 border border-white/05 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {s.volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-white/40" /> : <Volume2 className="w-3.5 h-3.5 text-violet-400" />}
            <span className="text-[0.58rem] text-white/55 font-medium">Master Volume</span>
          </div>
          <span className="text-[0.62rem] font-black font-mono text-violet-300">{Math.round(s.volume * 100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.01} value={s.volume}
          onChange={e => s.setVolume(parseFloat(e.target.value))}
          className="w-full accent-violet-500" />
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map(v => (
            <button key={v} onClick={() => s.setVolume(v)}
              className={cn('flex-1 py-1 rounded-lg text-[0.5rem] border transition-all',
                s.volume === v ? 'bg-violet-500/25 border-violet-500/50 text-violet-200' : 'bg-white/05 border-white/08 text-white/40 hover:text-white/70')}>
              {v === 0 ? '🔇' : v === 1 ? '🔊' : `${Math.round(v * 100)}%`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Metronome ── */}
      <SectionLabel>Metronome</SectionLabel>
      <div className="px-2.5 py-2 rounded-xl bg-white/02 border border-white/05 space-y-2">
        <Toggle label="Metronome" desc="Keep beat while typing" checked={s.metronomeEnabled} onChange={() => s.setMetronome(!s.metronomeEnabled)} />
        {s.metronomeEnabled && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[0.58rem] text-white/55 font-medium">BPM</span>
              <span className="text-[0.62rem] font-black font-mono text-violet-300">{s.bpm}</span>
            </div>
            <input type="range" min={40} max={240} step={1} value={s.bpm}
              onChange={e => s.setBpm(parseInt(e.target.value))}
              className="w-full accent-violet-500" />
            <div className="flex gap-1 flex-wrap">
              {[60, 80, 100, 120, 140, 160].map(v => (
                <button key={v} onClick={() => s.setBpm(v)}
                  className={cn('flex-1 min-w-[2rem] py-1 rounded-lg text-[0.5rem] border transition-all',
                    s.bpm === v ? 'bg-violet-500/25 border-violet-500/50 text-violet-200' : 'bg-white/05 border-white/08 text-white/40 hover:text-white/70')}>
                  {v}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Theme ── */}
      <SectionLabel>Theme</SectionLabel>
      <div className="px-2.5 py-2 rounded-xl bg-white/02 border border-white/05 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[0.58rem] text-white/55">Current theme</span>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border border-white/30"
              style={{ background: APP_THEMES.find(t => t.id === s.theme)?.color || '#8b5cf6' }} />
            <span className="text-[0.58rem] font-semibold text-violet-300 capitalize">{s.theme}</span>
            <button onClick={() => { const t = APP_THEMES[Math.floor(Math.random() * APP_THEMES.length)]; s.setTheme(t.id as any); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[0.5rem] hover:bg-violet-500/25 transition-all">
              <Dices className="w-2.5 h-2.5" /> Random
            </button>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 'dark', 'neon', 'nature', 'gems'] as const).map(f => (
            <button key={f} onClick={() => setThemeFilter(f)}
              className={cn('px-2 py-0.5 rounded-lg text-[0.48rem] font-medium border transition-all capitalize',
                themeFilter === f ? 'bg-violet-500/25 border-violet-500/50 text-violet-200' : 'bg-white/05 border-white/08 text-white/40 hover:text-white/60')}>
              {f}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
          {filteredThemes.map(t => (
            <button key={t.id} onClick={() => s.setTheme(t.id as any)} title={t.label}
              className={cn('w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all',
                s.theme === t.id ? 'border-white/70 scale-110 shadow-lg' : 'border-transparent hover:border-white/30')}
              style={{ background: (t as any).bg || '#0a0a0f' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: (t as any).color || '#8b5cf6' }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── WPM Goal ── */}
      <SectionLabel>WPM Goal</SectionLabel>
      <div className="px-2.5 py-2 rounded-xl bg-white/02 border border-white/05 space-y-2">
        {s.dailyGoalWpm > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[0.52rem] text-white/40">Progress</span>
              <span className="text-[0.52rem] font-bold" style={{ color: s.wpm >= s.dailyGoalWpm ? '#4ade80' : '#a78bfa' }}>{s.wpm}/{s.dailyGoalWpm} WPM</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/08 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (s.wpm / s.dailyGoalWpm) * 100)}%`, background: s.wpm >= s.dailyGoalWpm ? '#4ade80' : '#8b5cf6' }} />
            </div>
            {s.wpm >= s.dailyGoalWpm && <p className="text-[0.5rem] text-emerald-400">🎉 Goal reached!</p>}
            <button onClick={() => s.setDailyGoalWpm(0)} className="text-[0.48rem] text-white/30 hover:text-red-400 transition-all">Clear goal</button>
          </div>
        )}
        <div className="flex gap-1 flex-wrap">
          {[30, 50, 70, 80, 100, 120].map(v => (
            <button key={v} onClick={() => s.setDailyGoalWpm(v)}
              className={cn('flex-1 min-w-[2.5rem] py-1 rounded-lg text-[0.5rem] border transition-all',
                s.dailyGoalWpm === v ? 'bg-violet-500/25 border-violet-500/50 text-violet-200' : 'bg-white/05 border-white/08 text-white/40 hover:text-white/70')}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="number" min={1} max={300} placeholder="Custom WPM" value={customGoal}
            onChange={e => setCustomGoal(e.target.value)}
            className="flex-1 px-2 py-1 rounded-lg bg-white/06 border border-white/10 text-white/60 text-[0.52rem] outline-none focus:border-violet-500/40" />
          <button onClick={() => { const v = parseInt(customGoal); if (v > 0) { s.setDailyGoalWpm(v); setCustomGoal(''); } }}
            className="px-3 py-1 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[0.52rem] hover:bg-violet-500/30 transition-all">
            Set
          </button>
        </div>
      </div>

      {/* ── Quick Toggles ── */}
      <SectionLabel>Quick Toggles</SectionLabel>
      <div className="space-y-1">
        <Toggle label="Focus Mode" desc="Hide distractions while typing" checked={s.focusMode} onChange={() => s.setFocusMode(!s.focusMode)} />
        <Toggle label="Ghost Mode" desc="No corrections allowed" checked={s.ghostMode} onChange={() => s.setGhostMode(!s.ghostMode)} />
        <Toggle label="Performance Mode" desc="Reduce effects for speed" checked={s.performanceMode} onChange={() => s.setPerformanceMode(!s.performanceMode)} />
        <Toggle label="Blind Typing" desc="Hide keys while typing" checked={s.blindTypingMode} onChange={() => s.setBlindTypingMode(!s.blindTypingMode)} />
        <Toggle label="Daily Challenge" desc="Special challenge mode" checked={s.dailyChallengeMode} onChange={() => s.setDailyChallengeMode(!s.dailyChallengeMode)} />
        <Toggle label="Pomodoro Timer" desc="Focus intervals" checked={s.pomodoroEnabled} onChange={() => s.setPomodoroEnabled(!s.pomodoroEnabled)} />
      </div>

      {/* ── Actions ── */}
      <SectionLabel>Actions</SectionLabel>
      <div className="flex flex-wrap gap-2">
        <button onClick={s.resetTyping}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/05 border border-white/10 text-white/55 hover:text-white hover:border-white/25 text-[0.58rem] font-medium transition-all">
          <RotateCcw className="w-3 h-3" /> Reset Session
        </button>
        <button onClick={s.exportSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/05 border border-white/10 text-white/55 hover:text-white hover:border-white/25 text-[0.58rem] font-medium transition-all">
          <Download className="w-3 h-3" /> Export Settings
        </button>
      </div>

    </div>
  );
}

function TypingTab() {
  const s = useStore();
  const [modeSearch, setModeSearch] = useState('');
  const [expandGroup, setExpandGroup] = useState<string | null>('Basic');

  const groups = Array.from(new Set(TYPING_MODES_LIST.map(m => m.group)));
  const filtered = modeSearch
    ? TYPING_MODES_LIST.filter(m => m.label.toLowerCase().includes(modeSearch.toLowerCase()))
    : null;

  return (
    <div className="space-y-3">
      <SectionLabel>Typing Mode</SectionLabel>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
        <input
          value={modeSearch}
          onChange={e => setModeSearch(e.target.value)}
          placeholder="Search modes…"
          className="w-full pl-6 pr-2.5 py-1.5 rounded-lg bg-white/06 border border-white/10 text-white/80 text-[0.62rem] placeholder:text-white/25 focus:outline-none focus:border-violet-500/50"
        />
      </div>
      {filtered ? (
        <div className="space-y-0.5 max-h-40 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
          {filtered.map(m => (
            <button key={m.value} onClick={() => { s.setTypingMode(m.value as any); setModeSearch(''); }}
              className={cn('w-full text-left px-2.5 py-1.5 rounded-lg text-[0.62rem] transition-all',
                s.typingMode === m.value ? 'bg-violet-500/25 text-violet-200 font-semibold' : 'text-white/55 hover:text-white hover:bg-white/08')}>
              {m.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
          {groups.map(group => (
            <div key={group}>
              <button
                onClick={() => setExpandGroup(expandGroup === group ? null : group)}
                className="w-full flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/06 transition-all"
              >
                <span className="text-[0.56rem] font-bold text-white/40 uppercase tracking-wider">{group}</span>
                <ChevronRight className={cn('w-3 h-3 text-white/25 transition-transform', expandGroup === group && 'rotate-90')} />
              </button>
              {expandGroup === group && (
                <div className="space-y-0.5 ml-1">
                  {TYPING_MODES_LIST.filter(m => m.group === group).map(m => (
                    <button key={m.value} onClick={() => s.setTypingMode(m.value as any)}
                      className={cn('w-full text-left px-2.5 py-1.5 rounded-lg text-[0.62rem] transition-all',
                        s.typingMode === m.value ? 'bg-violet-500/25 text-violet-200 font-semibold' : 'text-white/55 hover:text-white hover:bg-white/08')}>
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {s.typingMode === 'custom' && (
        <>
          <SectionLabel>Custom Text</SectionLabel>
          <textarea
            value={s.customText}
            onChange={e => s.setCustomText(e.target.value)}
            placeholder="Enter your custom text here…"
            rows={3}
            className="w-full px-2.5 py-1.5 rounded-lg bg-white/06 border border-white/10 text-white/80 text-[0.62rem] placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 resize-none"
          />
        </>
      )}

      {s.typingMode === 'timed' && (
        <>
          <SectionLabel>Timed Duration</SectionLabel>
          <div className="flex gap-1.5 flex-wrap">
            {[15, 30, 60, 120, 300].map(d => (
              <button key={d} onClick={() => s.setTimedDuration(d)}
                className={cn('px-3 py-1.5 rounded-lg border text-[0.62rem] font-semibold transition-all',
                  s.timedDuration === d ? 'bg-violet-500/25 border-violet-500/50 text-violet-200' : 'bg-white/04 border-white/10 text-white/50 hover:text-white/80')}>
                {d < 60 ? `${d}s` : `${d / 60}m`}
              </button>
            ))}
          </div>
        </>
      )}

      {s.typingMode === 'sprint' && (
        <>
          <SectionLabel>Sprint Duration</SectionLabel>
          <div className="flex gap-1.5 flex-wrap">
            {[10, 15, 30, 60].map(d => (
              <button key={d} onClick={() => s.setSprintDuration(d)}
                className={cn('px-3 py-1.5 rounded-lg border text-[0.62rem] font-semibold transition-all',
                  s.sprintDuration === d ? 'bg-violet-500/25 border-violet-500/50 text-violet-200' : 'bg-white/04 border-white/10 text-white/50 hover:text-white/80')}>
                {d}s
              </button>
            ))}
          </div>
        </>
      )}

      {s.typingMode === 'lesson' && (
        <>
          <SectionLabel>Lesson Number</SectionLabel>
          <Slider label="Lesson" value={s.lessonNumber} min={1} max={20} step={1}
            display={`#${s.lessonNumber}`} onChange={s.setLessonNumber} />
          <Toggle label="Auto-advance Lessons" desc="Automatically go to next lesson when complete"
            checked={s.autoAdvanceLesson} onChange={() => s.setAutoAdvanceLesson(!s.autoAdvanceLesson)} />
        </>
      )}

      <SectionLabel>Difficulty</SectionLabel>
      <ChipGroup
        value={s.difficultyLevel}
        options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'expert', label: 'Expert' }, { value: 'master', label: 'Master' }]}
        onChange={v => s.setDifficultyLevel(v as any)}
      />

      <SectionLabel>Word Pool</SectionLabel>
      <Slider label="Pool Size" value={s.wordPoolSize} min={50} max={1000} step={50}
        display={`${s.wordPoolSize} words`} onChange={s.setWordPoolSize} />

      <SectionLabel>Typing Feel</SectionLabel>
      <Slider label="Line Height" value={s.typingLineHeight} min={1} max={2.5} step={0.05}
        display={`${s.typingLineHeight.toFixed(2)}×`} onChange={s.setTypingLineHeight} />
      <Slider label="Letter Spacing" value={s.typingLetterSpacing} min={0} max={8} step={0.5}
        display={`${s.typingLetterSpacing}px`} onChange={s.setTypingLetterSpacing} />
      <Select label="Progress Bar" value={s.progressBarStyle}
        options={[{ value: 'line', label: 'Line' }, { value: 'ring', label: 'Ring' }, { value: 'dots', label: 'Dots' }, { value: 'none', label: 'None' }]}
        onChange={v => s.setProgressBarStyle(v as any)} />

      <SectionLabel>Session</SectionLabel>
      <Toggle label="Auto Reset on Complete" checked={s.autoReset} onChange={() => s.setAutoReset(!s.autoReset)} />
      <Toggle label="Show Word Count" checked={s.showWordCount} onChange={() => s.setShowWordCount(!s.showWordCount)} />
      <Toggle label="Show Word Number" checked={s.showWordNumber} onChange={() => s.setShowWordNumber(!s.showWordNumber)} />
      <Toggle label="Auto-save Sessions" checked={s.autoSaveSession} onChange={() => s.setAutoSaveSession(!s.autoSaveSession)} />
      <Toggle label="Confetti on Complete" checked={s.confettiEnabled} onChange={() => s.setConfettiEnabled(!s.confettiEnabled)} />

      <SectionLabel>Goals</SectionLabel>
      <Slider label="Daily WPM Goal" value={s.dailyGoalWpm} min={10} max={200} step={5}
        display={`${s.dailyGoalWpm} WPM`} onChange={s.setDailyGoalWpm} />
      <Slider label="Daily Keystrokes Goal" value={s.dailyGoalKeystrokes} min={100} max={10000} step={100}
        display={s.dailyGoalKeystrokes.toLocaleString()} onChange={s.setDailyGoalKeystrokes} />
      <Slider label="Break Reminder" value={s.breakReminderInterval} min={0} max={60} step={5}
        display={s.breakReminderInterval === 0 ? 'Off' : `${s.breakReminderInterval}m`} onChange={s.setBreakReminderInterval} />

      <div className="pt-2">
        <button onClick={s.resetTyping}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/05 border border-white/08 text-[0.62rem] text-white/50 hover:text-white/80 hover:border-white/18 transition-all">
          <RotateCcw className="w-3 h-3" /> Reset Current Session
        </button>
      </div>
    </div>
  );
}

function AudioTab() {
  const s = useStore();
  const [catSearch, setCatSearch] = useState('');

  const filteredCats = catSearch
    ? SOUND_CATEGORIES.filter(c => c.toLowerCase().includes(catSearch.toLowerCase()))
    : SOUND_CATEGORIES;

  return (
    <div className="space-y-3">
      <SectionLabel>Master Volume</SectionLabel>
      <Slider label="Volume" value={s.volume} min={0} max={1} step={0.01}
        display={`${Math.round(s.volume * 100)}%`} onChange={s.setVolume} />
      <Slider label="Ambient Volume" value={s.ambientVolume} min={0} max={1} step={0.01}
        display={`${Math.round(s.ambientVolume * 100)}%`} onChange={s.setAmbientVolume} />

      <SectionLabel>Sound Category</SectionLabel>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
        <input
          value={catSearch}
          onChange={e => setCatSearch(e.target.value)}
          placeholder="Search sounds…"
          className="w-full pl-6 pr-2.5 py-1.5 rounded-lg bg-white/06 border border-white/10 text-white/80 text-[0.62rem] placeholder:text-white/25 focus:outline-none focus:border-violet-500/50"
        />
      </div>
      <div className="space-y-0.5 max-h-48 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
        {filteredCats.map(cat => (
          <button key={cat} onClick={() => s.setSoundCategory(cat as any)}
            className={cn('w-full text-left px-2.5 py-1.5 rounded-lg text-[0.6rem] transition-all',
              s.soundCategory === cat ? 'bg-violet-500/25 text-violet-200 font-semibold' : 'text-white/55 hover:text-white hover:bg-white/08')}>
            {cat}
          </button>
        ))}
      </div>

      <SectionLabel>Waveform</SectionLabel>
      <ChipGroup
        value={s.waveformType}
        options={[{ value: 'sine', label: 'Sine' }, { value: 'square', label: 'Square' }, { value: 'sawtooth', label: 'Saw' }, { value: 'triangle', label: 'Triangle' }]}
        onChange={v => s.setWaveformType(v as any)}
      />

      <SectionLabel>Pitch & Scale</SectionLabel>
      <Slider label="Master Pitch (semitones)" value={s.masterPitch} min={-12} max={12} step={1}
        display={`${s.masterPitch > 0 ? '+' : ''}${s.masterPitch} st`} onChange={s.setMasterPitch} />
      <Slider label="Octave Shift" value={s.octaveShift} min={-3} max={3} step={1}
        display={`${s.octaveShift > 0 ? '+' : ''}${s.octaveShift}`} onChange={s.setOctaveShift} />
      <Toggle label="Scale Lock" desc="Constrain notes to selected scale" checked={s.scaleEnabled} onChange={() => s.setScaleEnabled(!s.scaleEnabled)} />
      <div className="max-h-36 overflow-y-auto space-y-0.5" style={{ touchAction: 'pan-y' }}>
        {MUSICAL_SCALES.map(sc => (
          <button key={sc.id} onClick={() => s.setMusicalScale(sc.id)}
            className={cn('w-full text-left px-2.5 py-1 rounded-lg text-[0.6rem] transition-all',
              s.musicalScale === sc.id ? 'bg-violet-500/25 text-violet-200 font-semibold' : 'text-white/50 hover:text-white hover:bg-white/08')}>
            {sc.label}
          </button>
        ))}
      </div>

      <SectionLabel>Metronome</SectionLabel>
      <Toggle label="Enable Metronome" checked={s.metronomeEnabled} onChange={() => s.setMetronome(!s.metronomeEnabled)} />
      {s.metronomeEnabled && (
        <>
          <Slider label="BPM" value={s.bpm} min={40} max={240} step={1}
            display={`${s.bpm} BPM`} onChange={s.setBpm} />
          <Toggle label="Accent First Beat" checked={s.metronomeAccent} onChange={() => s.setMetronomeAccent(!s.metronomeAccent)} />
          <Select label="Click Sound" value={s.metronomeSound}
            options={[
              { value: 'click', label: 'Click' }, { value: 'beep', label: 'Beep' },
              { value: 'wood', label: 'Wood' }, { value: 'cowbell', label: 'Cowbell' }, { value: 'rim', label: 'Rim Shot' }
            ]}
            onChange={v => s.setMetronomeSound(v as any)} />
        </>
      )}

      <SectionLabel>Note Timing</SectionLabel>
      <Slider label="Note Duration ×" value={s.noteDurationMult} min={0.25} max={4} step={0.25}
        display={`${s.noteDurationMult.toFixed(2)}×`} onChange={s.setNoteDurationMult} />
      <Slider label="Audio Latency Compensation" value={s.audioLatencyCompensation} min={0} max={200} step={5}
        display={`${s.audioLatencyCompensation}ms`} onChange={s.setAudioLatencyCompensation} />

      <SectionLabel>Feedback Sounds</SectionLabel>
      <Toggle label="Error Sound" checked={s.errorSoundEnabled} onChange={() => s.setErrorSoundEnabled(!s.errorSoundEnabled)} />
      <Toggle label="Success Sound" checked={s.successSoundEnabled} onChange={() => s.setSuccessSoundEnabled(!s.successSoundEnabled)} />

      <SectionLabel>FX Toggles</SectionLabel>
      <Toggle label="Reverb" checked={s.reverbEnabled} onChange={() => s.setEffect('reverb', !s.reverbEnabled)} />
      <Toggle label="Delay / Echo" checked={s.delayEnabled} onChange={() => s.setEffect('delay', !s.delayEnabled)} />
      <Toggle label="Chorus" checked={s.chorusEnabled} onChange={() => s.setEffect('chorus', !s.chorusEnabled)} />
      <Toggle label="Distortion" checked={s.distortionEnabled} onChange={() => s.setEffect('distortion', !s.distortionEnabled)} />
      <Toggle label="Compression" checked={s.compressionEnabled} onChange={() => s.setEffect('compression', !s.compressionEnabled)} />
    </div>
  );
}

function FxTab() {
  const s = useStore();
  return (
    <div className="space-y-3">
      <SectionLabel>3-Band EQ</SectionLabel>
      <Slider label="Bass" value={s.eqBass} min={-12} max={12} step={0.5}
        display={`${s.eqBass > 0 ? '+' : ''}${s.eqBass.toFixed(1)} dB`} onChange={s.setEqBass} />
      <Slider label="Mid" value={s.eqMid} min={-12} max={12} step={0.5}
        display={`${s.eqMid > 0 ? '+' : ''}${s.eqMid.toFixed(1)} dB`} onChange={s.setEqMid} />
      <Slider label="Treble" value={s.eqTreble} min={-12} max={12} step={0.5}
        display={`${s.eqTreble > 0 ? '+' : ''}${s.eqTreble.toFixed(1)} dB`} onChange={s.setEqTreble} />
      <button onClick={() => { s.setEqBass(0); s.setEqMid(0); s.setEqTreble(0); }}
        className="w-full py-1.5 rounded-xl bg-white/04 border border-white/08 text-[0.6rem] text-white/50 hover:text-white/80 transition-all">
        Reset EQ to Flat
      </button>

      <SectionLabel>Stereo</SectionLabel>
      <Slider label="Stereo Width" value={s.stereoWidth} min={0} max={1} step={0.05}
        display={`${Math.round(s.stereoWidth * 100)}%`} onChange={s.setStereoWidth} />

      <SectionLabel>Delay FX</SectionLabel>
      <Slider label="Delay Time" value={s.delayTime} min={0.05} max={1} step={0.05}
        display={`${s.delayTime.toFixed(2)}s`} onChange={s.setDelayTime} />
      <Slider label="Delay Feedback" value={s.delayFeedback} min={0} max={0.9} step={0.05}
        display={`${Math.round(s.delayFeedback * 100)}%`} onChange={s.setDelayFeedback} />

      <SectionLabel>Reverb FX</SectionLabel>
      <Slider label="Reverb Amount" value={s.reverbAmount} min={0} max={1} step={0.05}
        display={`${Math.round(s.reverbAmount * 100)}%`} onChange={s.setReverbAmount} />
      <Slider label="Room Size" value={s.reverbRoomSize} min={0} max={1} step={0.05}
        display={`${Math.round(s.reverbRoomSize * 100)}%`} onChange={s.setReverbRoomSize} />

      <SectionLabel>Envelope</SectionLabel>
      <Slider label="Attack" value={s.attackTime} min={0.001} max={0.5} step={0.001}
        display={`${(s.attackTime * 1000).toFixed(0)}ms`} onChange={s.setAttackTime} />
      <Slider label="Release" value={s.releaseTime} min={0.05} max={5} step={0.05}
        display={`${s.releaseTime.toFixed(2)}s`} onChange={s.setReleaseTime} />

      <SectionLabel>Polyphony & Velocity</SectionLabel>
      <Slider label="Polyphony Limit" value={s.polyphonyLimit} min={1} max={16} step={1}
        display={`${s.polyphonyLimit} voices`} onChange={s.setPolyphonyLimit} />
      <Slider label="Velocity Sensitivity" value={s.velocitySensitivity} min={0} max={1} step={0.05}
        display={`${Math.round(s.velocitySensitivity * 100)}%`} onChange={s.setVelocitySensitivity} />

      <SectionLabel>Note Overlap</SectionLabel>
      <ChipGroup
        value={s.noteOverlapBehavior}
        options={[{ value: 'stop', label: 'Stop' }, { value: 'overlap', label: 'Overlap' }, { value: 'fade', label: 'Fade' }]}
        onChange={v => s.setNoteOverlapBehavior(v as any)}
      />
    </div>
  );
}

// ── RGB mode → gradient swatch lookup ────────────────────────────────────
const RGB_SWATCH: Record<string, string> = {
  'wave':           'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
  'breathing':      'linear-gradient(135deg,#7c3aed,#a855f7)',
  'static-rainbow': 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)',
  'starlight':      'radial-gradient(circle,#fff 0%,#4f46e5 100%)',
  'solid':          'linear-gradient(135deg,#5f6bff,#8b5cf6)',
  'reactive':       'linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.15) 100%)',
  'aurora':         'linear-gradient(135deg,#00ff88,#4f46e5)',
  'thunder':        'linear-gradient(135deg,#fbbf24,#1e3a5f)',
  'candy':          'linear-gradient(90deg,#ffd6e7,#c8e6c9,#bbe1fa)',
  'plasma':         'linear-gradient(135deg,#f0f,#0ff)',
  'fire':           'linear-gradient(180deg,#ff0 0%,#f80 45%,#f00 100%)',
  'ice':            'linear-gradient(135deg,#e0f7ff,#4dd0e1)',
  'disco':          'linear-gradient(90deg,#f00,#0f0,#00f,#ff0,#f0f)',
  'sunset':         'linear-gradient(135deg,#f97316,#7c3aed)',
  'neon-pulse':     'linear-gradient(135deg,#00f5ff,#bf00ff)',
  'lava':           'linear-gradient(135deg,#ff4500,#8b0000)',
  'galaxy':         'linear-gradient(135deg,#1a1a2e,#4f46e5,#9333ea)',
  'typhoon':        'linear-gradient(135deg,#06b6d4,#e0f2fe)',
  'forest':         'linear-gradient(135deg,#166534,#4ade80)',
  'ocean':          'linear-gradient(135deg,#1d4ed8,#06b6d4)',
  'sakura':         'linear-gradient(135deg,#fbcfe8,#f9a8d4)',
  'desert':         'linear-gradient(135deg,#d97706,#fef3c7)',
  'toxic':          'linear-gradient(135deg,#4ade80,#84cc16)',
  'blood':          'linear-gradient(135deg,#7f1d1d,#dc2626)',
  'void':           'linear-gradient(135deg,#1e1b4b,#4c1d95)',
  'neon-green':     'linear-gradient(135deg,#84cc16,#4ade80)',
  'cyber-pink':     'linear-gradient(135deg,#ec4899,#be185d)',
  'matrix-rgb':     'linear-gradient(180deg,#004d00,#00ff41)',
  'copper':         'linear-gradient(135deg,#b45309,#d97706)',
  'emerald-rgb':    'linear-gradient(135deg,#059669,#34d399)',
  'sapphire':       'linear-gradient(135deg,#1d4ed8,#60a5fa)',
  'ruby':           'linear-gradient(135deg,#9f1239,#f43f5e)',
  'earth-tones':    'linear-gradient(135deg,#78350f,#a16207)',
  'storm':          'linear-gradient(135deg,#475569,#94a3b8)',
  'coral-rgb':      'linear-gradient(135deg,#f97316,#fb7185)',
  'teal-rgb':       'linear-gradient(135deg,#0d9488,#5eead4)',
  'magenta-rgb':    'linear-gradient(135deg,#7e22ce,#ec4899)',
  'hologram':       'linear-gradient(90deg,#f0f,#0ff,#ff0)',
  'venom':          'linear-gradient(135deg,#166534,#84cc16)',
  'inferno':        'linear-gradient(180deg,#f97316,#dc2626)',
  'chrome':         'linear-gradient(135deg,#94a3b8,#e2e8f0)',
  'peacock':        'linear-gradient(135deg,#0e7490,#065f46)',
  'jade':           'linear-gradient(135deg,#14532d,#4ade80)',
  'amethyst-rgb':   'linear-gradient(135deg,#7c3aed,#c4b5fd)',
  'violet-rgb':     'linear-gradient(135deg,#4f46e5,#818cf8)',
  'indigo-rgb':     'linear-gradient(135deg,#312e81,#6366f1)',
  'amber':          'linear-gradient(135deg,#b45309,#fbbf24)',
  'citrus':         'linear-gradient(135deg,#84cc16,#fbbf24)',
  'berry':          'linear-gradient(135deg,#7c3aed,#be185d)',
  'peach-rgb':      'linear-gradient(135deg,#fed7aa,#fb923c)',
  'lilac':          'linear-gradient(135deg,#d8b4fe,#c4b5fd)',
  'sage':           'linear-gradient(135deg,#4d7c0f,#86efac)',
  'crimson':        'linear-gradient(135deg,#7f1d1d,#f43f5e)',
  'cobalt':         'linear-gradient(135deg,#1d4ed8,#3b82f6)',
  'turquoise-rgb':  'linear-gradient(135deg,#0891b2,#5eead4)',
  'navy':           'linear-gradient(135deg,#1e3a5f,#1d4ed8)',
  'orchid':         'linear-gradient(135deg,#9333ea,#db2777)',
  'sienna':         'linear-gradient(135deg,#92400e,#c2410c)',
  'lime-rgb':       'linear-gradient(135deg,#4d7c0f,#a3e635)',
  'electric-blue':  'linear-gradient(135deg,#1d4ed8,#0ea5e9)',
  'hot-pink':       'linear-gradient(135deg,#db2777,#f9a8d4)',
  'sea-green':      'linear-gradient(135deg,#065f46,#34d399)',
  'sky-blue':       'linear-gradient(135deg,#0284c7,#7dd3fc)',
  'blush':          'linear-gradient(135deg,#fda4af,#fb7185)',
  'champagne':      'linear-gradient(135deg,#d97706,#fef9c3)',
  'silver-rgb':     'linear-gradient(135deg,#94a3b8,#f1f5f9)',
  'bronze':         'linear-gradient(135deg,#92400e,#d97706)',
  'opal':           'linear-gradient(90deg,#c4b5fd,#7dd3fc,#f9a8d4)',
  'pearl':          'linear-gradient(135deg,#f8fafc,#e2e8f0)',
  'malachite':      'linear-gradient(135deg,#14532d,#22c55e)',
  'lapis':          'linear-gradient(135deg,#1e40af,#c2a634)',
  'aquamarine':     'linear-gradient(135deg,#0891b2,#6ee7b7)',
  'carnival':       'linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6)',
  'retro-rgb':      'linear-gradient(135deg,#d97706,#dc2626)',
  'bubblegum-rgb':  'linear-gradient(135deg,#f472b6,#e9d5ff)',
  'cotton':         'linear-gradient(90deg,#fbcfe8,#bfdbfe)',
  'mint-ice':       'linear-gradient(135deg,#a7f3d0,#7dd3fc)',
  'lavender-rgb':   'linear-gradient(135deg,#c4b5fd,#ddd6fe)',
  'electric-purple':'linear-gradient(135deg,#7c3aed,#9333ea)',
  'golden-hour':    'linear-gradient(135deg,#d97706,#fb923c)',
  'midnight-blue':  'linear-gradient(135deg,#1e3a5f,#312e81)',
  'northern-lights':'linear-gradient(135deg,#4ade80,#818cf8)',
  'deep-ocean':     'linear-gradient(135deg,#0c4a6e,#1d4ed8)',
  'sunrise-rgb':    'linear-gradient(135deg,#fb923c,#fbbf24)',
  'dusk-rgb':       'linear-gradient(135deg,#7c3aed,#f97316)',
  'moonlight':      'linear-gradient(135deg,#94a3b8,#e2e8f0)',
  'tropical':       'linear-gradient(135deg,#16a34a,#f97316)',
  'cyber-red':      'linear-gradient(135deg,#450a0a,#ef4444)',
  'toxic-waste':    'linear-gradient(135deg,#4d7c0f,#fbbf24)',
  'lava-flow':      'linear-gradient(135deg,#7c2d12,#f97316)',
  'black-ice':      'linear-gradient(135deg,#0f172a,#0284c7)',
  'solar-flare':    'linear-gradient(135deg,#fbbf24,#dc2626)',
  'cosmic-ray':     'linear-gradient(135deg,#4f46e5,#c026d3)',
  'acid-rain':      'linear-gradient(135deg,#84cc16,#4ade80)',
  'oil-slick':      'linear-gradient(90deg,#7c3aed,#0ea5e9,#10b981)',
  'prism-rgb':      'linear-gradient(90deg,#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#7c3aed)',
  'waterfall':      'linear-gradient(180deg,#0ea5e9,#bae6fd)',
  'autumn-leaves':  'linear-gradient(135deg,#92400e,#dc2626)',
  'spring-bloom':   'linear-gradient(135deg,#86efac,#fbcfe8)',
  'bamboo-rgb':     'linear-gradient(135deg,#166534,#4ade80)',
  'winter-frost':   'linear-gradient(135deg,#bfdbfe,#e0f2fe)',
  'summer-heat':    'linear-gradient(135deg,#fbbf24,#f97316)',
  'cherry':         'linear-gradient(135deg,#fbcfe8,#f472b6)',
  'koi':            'linear-gradient(135deg,#f97316,#fef9c3)',
  'thunderstorm':   'linear-gradient(135deg,#334155,#7c3aed)',
  'blizzard':       'linear-gradient(135deg,#e0f2fe,#bfdbfe)',
  'volcanic':       'linear-gradient(135deg,#7c2d12,#fbbf24)',
  'deep-sea':       'linear-gradient(135deg,#0c4a6e,#06b6d4)',
  'pastel-rainbow': 'linear-gradient(90deg,#fda4af,#fde68a,#bbf7d0,#bfdbfe,#ddd6fe)',
  'ultraviolet':    'linear-gradient(135deg,#4c1d95,#ddd6fe)',
};

const RGB_CATS = [
  { id: 'all',    label: 'All',    icon: '✦' },
  { id: 'classic',label: 'Classic',icon: '🌊', ids: new Set(['wave','breathing','static-rainbow','starlight','solid','reactive','aurora','disco','candy','plasma','thunder']) },
  { id: 'fire',   label: 'Fire',   icon: '🔥', ids: new Set(['fire','lava','inferno','venom','cyber-red','toxic-waste','lava-flow','solar-flare','blood','crimson','ruby','inferno','coral-rgb','tropical','desert','amber','golden-hour','sunrise-rgb','retro-rgb','copper','bronze','sienna','earth-tones']) },
  { id: 'cool',   label: 'Cool',   icon: '❄️', ids: new Set(['ice','typhoon','ocean','teal-rgb','cobalt','electric-blue','sapphire','sky-blue','navy','aquamarine','mint-ice','black-ice','deep-ocean','moonlight','storm','sea-green','waterfall','arctic']) },
  { id: 'nature', label: 'Nature', icon: '🌿', ids: new Set(['forest','sakura','ocean','desert','toxic','sage','bamboo-rgb','autumn-leaves','spring-bloom','malachite','jade','peacock','citrus','lime-rgb','sea-green','tropical','venom','acid-rain']) },
  { id: 'gems',   label: 'Gems',   icon: '💎', ids: new Set(['emerald-rgb','sapphire','ruby','amethyst-rgb','violet-rgb','indigo-rgb','turquoise-rgb','orchid','opal','pearl','lapis','aquamarine','hologram','chrome','silver-rgb','champagne','amber']) },
  { id: 'neon',   label: 'Neon',   icon: '💜', ids: new Set(['neon-pulse','neon-green','cyber-pink','matrix-rgb','hologram','electric-purple','electric-blue','magenta-rgb','cosmic-ray','oil-slick','prism-rgb','carnival','galaxy','void','northern-lights','midnight-blue']) },
  { id: 'pastel', label: 'Pastel', icon: '🌸', ids: new Set(['candy','sakura','blush','peach-rgb','lilac','lavender-rgb','cotton','bubblegum-rgb','hot-pink','mint-ice','moonlight','silver-rgb','pearl']) },
];

const BG_CATS = [
  { id: 'all',     label: 'All',     icon: '✦' },
  { id: 'digital', label: 'Digital', icon: '💻', ids: new Set(['matrix-rain','binary-rain','purple-rain','red-rain','cyber','circuit-traces','scan-lines','vhs-noise','crt-glow','glitch-bars','hologram-scan','hex-overlay','laser-grid','dot-wave','dna-helix']) },
  { id: 'space',   label: 'Space',   icon: '🌌', ids: new Set(['starfield','nebula','galaxy-dust','warp-speed','meteor-shower','cosmic-flow','galaxy-swirl','nebula-bloom','solar-wind','black-hole','event-horizon','spiral-galaxy','hyperspace','wormhole','dimension-rift','fractal-bloom','aurora-borealis','northern-lights','southern-lights','moonrise','startrail','quantum-field','mandala-spin']) },
  { id: 'nature',  label: 'Nature',  icon: '🌿', ids: new Set(['cherry-blossom','autumn-leaves','dandelion','butterflies','fireflies','embers','raindrops','coral-reef','mycelium','deep-sea','aurora','aurora-curtain','bioluminescence','cave-glow']) },
  { id: 'weather', label: 'Weather', icon: '⛈️', ids: new Set(['snow','blizzard','thunderstorm','sandstorm','heatwave','heat-haze','fog-roll','smoke-layer','thunder-flash','water-shimmer','arctic-frost','eclipse','sunrise','twilight','moonrise']) },
  { id: 'party',   label: 'Party',   icon: '🎉', ids: new Set(['confetti','fireworks','disco-floor','hearts','music-notes','glitter','diamonds','neon-orbs','soap-bubbles-xl','bubbles','fire-sparks','stars-drift','dust-motes']) },
  { id: 'glow',    label: 'Glow',    icon: '✨', ids: new Set(['particles','plasma-wave','neon-pulse','lava-glow','inferno','toxic-glow','neon-flicker','radar-sweep','energy-field','electric-arcs','magma-flow','void-ripple','spectral','color-wash','prism-rays','oil-slick','gradient-shift','spotlight','vortex','rainbow-wave','retro-glow','chromatic-shift','sunset-gradient','dream-haze','plasma-glow','crystal-lattice','stained-glass','mosaic-shift','heatwave','heat-haze']) },
];

function RgbModePicker() {
  const s = useStore();
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = ALL_RGB_MODES.filter(m => {
    const inCat = cat === 'all' || (RGB_CATS.find(c => c.id === cat) as any)?.ids?.has(m.id);
    const inSearch = !search || m.label.toLowerCase().includes(search.toLowerCase());
    return inCat && inSearch;
  });

  const activeMode = ALL_RGB_MODES.find(m => m.id === s.rgbMode);

  return (
    <div className="space-y-3">
      {/* Enable toggles row */}
      <div className="grid grid-cols-2 gap-2">
        <Toggle label="RGB Lighting" desc="Key color animations" checked={s.rgbEnabled} onChange={() => s.setRgbEnabled(!s.rgbEnabled)} />
        <Toggle label="Rainbow Mode" desc="Full rainbow on keys" checked={s.rainbowModeEnabled} onChange={() => s.setRainbowEnabled(!s.rainbowModeEnabled)} />
      </div>

      {s.rgbEnabled && (
        <>
          {/* Active mode banner */}
          {activeMode && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/10 overflow-hidden relative">
              <div className="absolute inset-0 opacity-20" style={{ background: RGB_SWATCH[activeMode.id] || 'linear-gradient(135deg,#7c3aed,#a855f7)' }} />
              <span className="text-lg relative z-10">{activeMode.icon}</span>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xs font-bold text-white">{activeMode.label}</p>
                <p className="text-[0.5rem] text-white/50 truncate">{activeMode.desc}</p>
              </div>
              <div className="relative z-10 w-10 h-6 rounded-lg shrink-0 ring-1 ring-white/20 overflow-hidden">
                <div className="w-full h-full" style={{ background: RGB_SWATCH[activeMode.id] || 'linear-gradient(135deg,#7c3aed,#a855f7)' }} />
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search RGB modes…"
              className="w-full pl-7 pr-3 py-2 rounded-xl bg-white/06 border border-white/10 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-violet-500/40" />
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {RGB_CATS.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)}
                className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[0.6rem] font-semibold whitespace-nowrap border shrink-0 transition-all',
                  cat === c.id ? 'bg-violet-500/25 border-violet-500/45 text-violet-200' : 'bg-white/04 border-white/08 text-white/40 hover:text-white/65 hover:bg-white/07')}>
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>

          {/* Mode grid with color swatches */}
          <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-0.5" style={{ touchAction: 'pan-y' }}>
            {filtered.map(m => {
              const isActive = s.rgbMode === m.id;
              const swatch = RGB_SWATCH[m.id] || 'linear-gradient(135deg,#7c3aed,#a855f7)';
              return (
                <button key={m.id} onClick={() => s.setRgbMode(m.id as any)}
                  className={cn('flex items-center gap-2 px-2 py-2 rounded-xl border text-left transition-all group overflow-hidden relative',
                    isActive ? 'border-violet-400/50 bg-violet-500/10' : 'border-white/07 bg-white/03 hover:border-white/16 hover:bg-white/06'
                  )}
                  style={isActive ? { boxShadow: '0 0 12px rgba(139,92,246,0.3)' } : {}}>
                  {/* Swatch bar on left */}
                  <div className="w-4 h-9 rounded-lg shrink-0 overflow-hidden">
                    <div className="w-full h-full" style={{ background: swatch }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[0.65rem] font-semibold truncate leading-tight', isActive ? 'text-violet-200' : 'text-white/70')}>{m.label}</p>
                    <p className="text-[0.48rem] text-white/30 truncate leading-tight mt-0.5">{m.icon} {m.desc}</p>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-xs text-white/25 py-4">No modes found</p>
          )}

          {/* Custom color for solid */}
          {s.rgbMode === 'solid' && (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/04 border border-white/08">
              <span className="text-xs text-white/60">Custom Color</span>
              <input type="color" value={s.rgbCustomColor} onChange={e => s.setRgbCustomColor(e.target.value)}
                className="w-10 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
            </div>
          )}

          {/* Sliders */}
          <Slider label="Brightness" value={s.rgbBrightness} min={0} max={100} step={5} display={`${s.rgbBrightness}%`} onChange={s.setRgbBrightness} />
          <Slider label="Saturation" value={s.rgbSaturation} min={0} max={100} step={5} display={`${s.rgbSaturation}%`} onChange={s.setRgbSaturation} />
          <Slider label="Speed" value={s.rgbAnimSpeed} min={0.1} max={5} step={0.1} display={`${s.rgbAnimSpeed.toFixed(1)}×`} onChange={s.setRgbAnimSpeed} />
        </>
      )}
    </div>
  );
}

function BgModePicker() {
  const s = useStore();
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');

  const allModes = [{ id: 'none', label: 'None', desc: 'Clean dark background', icon: '⬛' }, ...ALL_BACKGROUND_EFFECTS.filter(b => b.id !== 'none')];

  const filtered = allModes.filter(m => {
    const inCat = cat === 'all' || (BG_CATS.find(c => c.id === cat) as any)?.ids?.has(m.id);
    const inSearch = !search || m.label.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
    return inCat && inSearch;
  });

  const activeMode = allModes.find(m => m.id === s.backgroundEffect);

  return (
    <div className="space-y-3">
      {/* Active banner */}
      {activeMode && s.backgroundEffect !== 'none' && (
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/06 border border-white/12">
          <span className="text-xl">{activeMode.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">{activeMode.label}</p>
            <p className="text-[0.5rem] text-white/45 truncate">{activeMode.desc}</p>
          </div>
          <button onClick={() => s.setBackgroundEffect('none' as any)}
            className="text-[0.55rem] text-white/35 hover:text-red-400 border border-white/10 px-2 py-0.5 rounded-lg transition-all shrink-0">
            Clear
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search background effects…"
          className="w-full pl-7 pr-3 py-2 rounded-xl bg-white/06 border border-white/10 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-violet-500/40" />
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {BG_CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[0.6rem] font-semibold whitespace-nowrap border shrink-0 transition-all',
              cat === c.id ? 'bg-fuchsia-500/25 border-fuchsia-500/45 text-fuchsia-200' : 'bg-white/04 border-white/08 text-white/40 hover:text-white/65 hover:bg-white/07')}>
            <span>{c.icon}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Effect grid */}
      <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-0.5" style={{ touchAction: 'pan-y' }}>
        {filtered.map(m => {
          const isActive = s.backgroundEffect === m.id;
          return (
            <button key={m.id} onClick={() => s.setBackgroundEffect(m.id as any)}
              className={cn('flex items-center gap-2 px-2 py-2 rounded-xl border text-left transition-all',
                isActive ? 'border-fuchsia-400/50 bg-fuchsia-500/10' : 'border-white/07 bg-white/03 hover:border-white/16 hover:bg-white/06'
              )}
              style={isActive ? { boxShadow: '0 0 12px rgba(217,70,239,0.25)' } : {}}>
              <span className="text-lg leading-none shrink-0">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={cn('text-[0.65rem] font-semibold truncate leading-tight', isActive ? 'text-fuchsia-200' : 'text-white/70')}>{m.label}</p>
                <p className="text-[0.46rem] text-white/28 truncate leading-tight mt-0.5">{m.desc}</p>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shrink-0" />}
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-xs text-white/25 py-4">No effects found</p>
      )}

      {/* Controls */}
      <Slider label="Speed" value={s.bgEffectSpeed} min={0.1} max={3} step={0.1} display={`${s.bgEffectSpeed.toFixed(1)}×`} onChange={s.setBgEffectSpeed} />
      <Slider label="Opacity" value={s.bgEffectOpacity} min={0} max={1} step={0.05} display={`${Math.round(s.bgEffectOpacity * 100)}%`} onChange={s.setBgEffectOpacity} />
      <Slider label="Blur" value={s.bgBlurAmount} min={0} max={40} step={2} display={`${s.bgBlurAmount}px`} onChange={s.setBgBlurAmount} />
      <Slider label="Particle Density" value={s.particleDensity} min={1} max={10} step={1} display={`${s.particleDensity}`} onChange={s.setParticleDensity} />
      <Slider label="Particle Speed" value={s.particleSpeed} min={0.1} max={3} step={0.1} display={`${s.particleSpeed.toFixed(1)}×`} onChange={s.setParticleSpeed} />
    </div>
  );
}

function VisualTab() {
  const s = useStore();
  const [themeSearch, setThemeSearch] = useState('');
  const [section, setSection] = useState<'theme'|'rgb'|'bg'|'glow'>('theme');

  const filteredThemes = themeSearch
    ? ALL_APP_THEMES.filter(t => t.label.toLowerCase().includes(themeSearch.toLowerCase()) || (t as any).desc?.toLowerCase().includes(themeSearch.toLowerCase()))
    : ALL_APP_THEMES;

  const sections = [
    { id: 'theme', label: 'Theme', icon: '🎨' },
    { id: 'rgb',   label: 'RGB',   icon: '💡' },
    { id: 'bg',    label: 'Background', icon: '🌌' },
    { id: 'glow',  label: 'Glow',  icon: '✨' },
  ] as const;

  return (
    <div className="space-y-3">
      {/* Section switcher */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-white/04 border border-white/08">
        {sections.map(sec => (
          <button key={sec.id} onClick={() => setSection(sec.id)}
            className={cn('flex flex-col items-center gap-0.5 py-2 rounded-xl text-center transition-all',
              section === sec.id ? 'bg-white/10 shadow-sm' : 'hover:bg-white/05')}>
            <span className="text-base leading-none">{sec.icon}</span>
            <span className={cn('text-[0.48rem] font-bold uppercase tracking-wide', section === sec.id ? 'text-white/80' : 'text-white/30')}>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* Theme section */}
      {section === 'theme' && (
        <>
          <SectionLabel>App Theme</SectionLabel>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            <input value={themeSearch} onChange={e => setThemeSearch(e.target.value)} placeholder="Search themes…"
              className="w-full pl-7 pr-3 py-2 rounded-xl bg-white/06 border border-white/10 text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:border-violet-500/40" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-0.5" style={{ touchAction: 'pan-y' }}>
            {filteredThemes.map(t => (
              <button key={t.id} onClick={() => s.setTheme(t.id as any)}
                className={cn('flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all',
                  s.theme === t.id ? 'border-violet-500/50 bg-violet-500/12' : 'border-white/07 bg-white/03 hover:border-white/18 hover:bg-white/06'
                )}
                style={s.theme === t.id ? { boxShadow: '0 0 10px rgba(139,92,246,0.25)' } : {}}>
                <div className="w-4 h-4 rounded-full shrink-0 ring-1 ring-white/20" style={{ background: (t as any).color || (t as any).accent || '#8b5cf6' }} />
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-semibold text-white/80 truncate">{t.label}</p>
                  <p className="text-[0.48rem] text-white/30 truncate">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <SectionLabel>Custom Colors</SectionLabel>
          <Toggle label="Use Custom Colors" checked={s.useCustomColors} onChange={() => s.setUseCustomColors(!s.useCustomColors)} />
          {s.useCustomColors && (
            <>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/04 border border-white/08">
                <span className="text-xs text-white/60">Accent Color</span>
                <input type="color" value={s.customAccentColor} onChange={e => s.setCustomAccentColor(e.target.value)} className="w-10 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/04 border border-white/08">
                <span className="text-xs text-white/60">Background Color</span>
                <input type="color" value={s.customBgColor} onChange={e => s.setCustomBgColor(e.target.value)} className="w-10 h-7 rounded-lg cursor-pointer border-0 bg-transparent" />
              </div>
            </>
          )}
          <SectionLabel>Gradient</SectionLabel>
          <ChipGroup value={s.gradientStyle}
            options={[{ value: 'radial', label: 'Radial' },{ value: 'linear-h', label: 'H-Linear' },{ value: 'linear-v', label: 'V-Linear' },{ value: 'diagonal', label: 'Diagonal' },{ value: 'none', label: 'None' }]}
            onChange={v => s.setGradientStyle(v as any)} wrap />
        </>
      )}

      {/* RGB section */}
      {section === 'rgb' && <RgbModePicker />}

      {/* Background section */}
      {section === 'bg' && <BgModePicker />}

      {/* Glow & FX section */}
      {section === 'glow' && (
        <>
          <SectionLabel>Visuals</SectionLabel>
          <Toggle label="Enable Visuals" checked={s.visualsEnabled} onChange={() => s.setVisualsEnabled(!s.visualsEnabled)} />
          <Slider label="Glow Intensity" value={s.glowIntensity} min={0} max={100} step={5} display={`${s.glowIntensity}%`} onChange={s.setGlowIntensity} />
          <Slider label="Key Glow Spread" value={s.keyGlowSpread} min={0} max={20} step={1} display={`${s.keyGlowSpread}px`} onChange={s.setKeyGlowSpread} />
          <Slider label="Key Glow Blur" value={s.keyGlowBlur} min={0} max={30} step={1} display={`${s.keyGlowBlur}px`} onChange={s.setKeyGlowBlur} />
          <Slider label="Animation Speed" value={s.animationSpeed} min={0.1} max={3} step={0.1} display={`${s.animationSpeed.toFixed(1)}×`} onChange={s.setAnimationSpeed} />
          <Slider label="Fade Duration" value={s.fadeDuration} min={50} max={1000} step={50} display={`${s.fadeDuration}ms`} onChange={s.setFadeDuration} />
          <SectionLabel>Color Correction</SectionLabel>
          <Slider label="Saturation" value={s.backgroundSaturation} min={0} max={200} onChange={s.setBackgroundSaturation} unit="%" />
          <Slider label="Contrast" value={s.backgroundContrast} min={50} max={200} onChange={s.setBackgroundContrast} unit="%" />
          <Slider label="Brightness" value={s.brightnessAdjust} min={50} max={200} onChange={s.setBrightnessAdjust} unit="%" />
          <Slider label="Hue Rotate" value={s.hueRotate} min={0} max={360} onChange={s.setHueRotate} unit="°" />
        </>
      )}
    </div>
  );
}

function KeyboardTab() {
  const s = useStore();
  return (
    <div className="space-y-3">
      <SectionLabel>Key Size & Shape</SectionLabel>
      <Slider label="Key Size" value={s.keySize} min={50} max={150} step={5}
        display={`${s.keySize}%`} onChange={s.setKeySize} />
      <Slider label="Key Spacing" value={s.keySpacing} min={0} max={8} step={0.5}
        display={`${s.keySpacing}px`} onChange={s.setKeySpacing} />
      <Select label="Key Shape" value={s.keyShape}
        options={[{ value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }, { value: 'pill', label: 'Pill' }, { value: 'sharp', label: 'Sharp' }, { value: 'gem', label: 'Gem' }]}
        onChange={v => s.setKeyShape(v as any)} />
      <Select label="Border Style" value={s.keyBorderStyle}
        options={[{ value: 'solid', label: 'Solid' }, { value: 'glow', label: 'Glow' }, { value: 'double', label: 'Double' }, { value: 'none', label: 'None' }]}
        onChange={v => s.setKeyBorderStyle(v as any)} />
      <Slider label="Opacity" value={s.keyOpacity} min={20} max={100} step={5}
        display={`${s.keyOpacity}%`} onChange={s.setKeyOpacity} />

      <SectionLabel>Key Press Effect</SectionLabel>
      <div className="grid grid-cols-2 gap-1">
        {(['ripple', 'bounce', 'scale', 'pop', 'glow', 'wobble', 'shockwave', 'none'] as const).map(fx => (
          <button key={fx} onClick={() => s.setKeyPressEffect(fx)}
            className={cn('px-2 py-1.5 rounded-lg border text-[0.6rem] font-medium capitalize transition-all',
              s.keyPressEffect === fx ? 'bg-violet-500/25 border-violet-500/50 text-violet-200' : 'bg-white/04 border-white/08 text-white/45 hover:text-white/70')}>
            {fx}
          </button>
        ))}
      </div>

      <SectionLabel>Key Labels</SectionLabel>
      <Select label="Label Style" value={s.keyLabelStyle}
        options={[
          { value: 'key', label: 'Key Letters' }, { value: 'note', label: 'Note Names' },
          { value: 'finger', label: 'Finger Guide' }, { value: 'chord', label: 'Chord Names' }, { value: 'none', label: 'None' },
        ]}
        onChange={v => s.setKeyLabelStyle(v as any)} />
      <Toggle label="Show Note Labels" checked={s.showNoteLabels} onChange={() => s.setShowNoteLabels(!s.showNoteLabels)} />
      <Toggle label="Key Shimmer Effect" checked={s.keyShimmer} onChange={() => s.setKeyShimmer(!s.keyShimmer)} />

      <SectionLabel>3D & Depth</SectionLabel>
      <Slider label="Perspective" value={s.keyboardPerspective} min={0} max={30} step={1}
        display={`${s.keyboardPerspective}°`} onChange={s.setKeyboardPerspective} />
      <Slider label="Key Depth" value={s.keyDepth} min={0} max={10} step={0.5}
        display={`${s.keyDepth}px`} onChange={s.setKeyDepth} />
      <Slider label="Shadow Intensity" value={s.keyShadowIntensity} min={0} max={1} step={0.05}
        display={`${Math.round(s.keyShadowIntensity * 100)}%`} onChange={s.setKeyShadowIntensity} />

      <SectionLabel>Heatmap</SectionLabel>
      <Toggle label="Show Key Heatmap" checked={s.showHeatmap} onChange={() => s.setShowHeatmap(!s.showHeatmap)} />
      {s.showHeatmap && (
        <>
          <Slider label="Heatmap Opacity" value={s.heatmapOpacity} min={0} max={1} step={0.05}
            display={`${Math.round(s.heatmapOpacity * 100)}%`} onChange={s.setHeatmapOpacity} />
          <Toggle label="Heatmap Decay" desc="Auto-fade old heatmap data" checked={s.heatmapDecay} onChange={() => s.setHeatmapDecay(!s.heatmapDecay)} />
        </>
      )}

      <SectionLabel>Alignment</SectionLabel>
      <ChipGroup
        value={s.keyboardAlignment}
        options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]}
        onChange={v => s.setKeyboardAlignment(v as any)}
      />
    </div>
  );
}

function MusicalTab() {
  const s = useStore();
  return (
    <div className="space-y-3">
      <SectionLabel>Play Modes</SectionLabel>
      <Toggle label="Chord Mode" desc="Play chords instead of single notes" checked={s.chordMode} onChange={() => s.setChordMode(!s.chordMode)} />
      <Toggle label="Arpeggio Mode" desc="Arpeggiate notes over time" checked={s.arpeggioMode} onChange={() => s.setArpeggioMode(!s.arpeggioMode)} />
      <Toggle label="Sustain Mode" desc="Notes ring until key is released" checked={s.sustainMode} onChange={() => s.setSustainMode(!s.sustainMode)} />
      <Toggle label="Glide Mode" desc="Smooth pitch glide between notes" checked={s.glideMode} onChange={() => s.setGlideMode(!s.glideMode)} />
      <Toggle label="Drone Note" desc="Continuous background tone" checked={s.droneNote} onChange={() => s.setDroneNote(!s.droneNote)} />
      <Toggle label="Scale Lock" desc="Constrain to selected musical scale" checked={s.scaleLock} onChange={() => s.setScaleLock(!s.scaleLock)} />
      <Toggle label="Stereo Panning" desc="Pan notes across stereo field" checked={s.panningEnabled} onChange={() => s.setPanningEnabled(!s.panningEnabled)} />

      {s.chordMode && (
        <>
          <SectionLabel>Chord Voicing</SectionLabel>
          <ChipGroup
            value={s.chordVoicing}
            options={[{ value: 'basic', label: 'Basic' }, { value: 'jazz', label: 'Jazz' }, { value: 'power', label: 'Power' }, { value: 'spread', label: 'Spread' }]}
            onChange={v => s.setChordVoicing(v as any)}
          />
        </>
      )}

      {s.arpeggioMode && (
        <>
          <SectionLabel>Arpeggio</SectionLabel>
          <Slider label="Arpeggio Rate" value={s.arpeggioRate} min={50} max={500} step={25}
            display={`${s.arpeggioRate}ms`} onChange={s.setArpeggioRate} />
        </>
      )}

      {s.glideMode && (
        <>
          <SectionLabel>Glide</SectionLabel>
          <Slider label="Glide Speed" value={s.glideSpeed} min={0.01} max={0.5} step={0.01}
            display={`${(s.glideSpeed * 1000).toFixed(0)}ms`} onChange={s.setGlideSpeed} />
        </>
      )}

      <SectionLabel>Playback</SectionLabel>
      <Slider label="Playback Speed" value={s.playbackSpeed} min={0.25} max={2} step={0.25}
        display={`${s.playbackSpeed.toFixed(2)}×`} onChange={s.setPlaybackSpeed} />
      <Toggle label="Loop Playback" checked={s.loopEnabled} onChange={() => s.setLoop(!s.loopEnabled)} />
    </div>
  );
}

function InterfaceTab() {
  const s = useStore();
  return (
    <div className="space-y-3">
      <SectionLabel>Cursor & Font</SectionLabel>
      <Select label="Cursor Style" value={s.cursorStyle}
        options={[{ value: 'line', label: 'Line' }, { value: 'block', label: 'Block' }, { value: 'underscore', label: 'Underscore' }, { value: 'beam', label: 'Beam' }, { value: 'none', label: 'None' }]}
        onChange={v => s.setCursorStyle(v as any)} />
      <Select label="Typing Font" value={s.typingFont}
        options={[
          { value: 'mono', label: 'Mono' }, { value: 'sans', label: 'Sans' }, { value: 'retro', label: 'Retro' },
          { value: 'orbitron', label: 'Orbitron' }, { value: 'vt323', label: 'VT323' }, { value: 'ubuntu', label: 'Ubuntu' },
          { value: 'fira', label: 'Fira Code' }, { value: 'space', label: 'Space Mono' },
        ]}
        onChange={v => s.setTypingFont(v as any)} />

      <SectionLabel>Stats Display</SectionLabel>
      <Toggle label="Show WPM" checked={s.showWpmStat} onChange={() => s.setShowWpmStat(!s.showWpmStat)} />
      <Toggle label="Show CPM" checked={s.showCpmStat} onChange={() => s.setShowCpmStat(!s.showCpmStat)} />
      <Toggle label="Show Accuracy" checked={s.showAccuracyStat} onChange={() => s.setShowAccuracyStat(!s.showAccuracyStat)} />
      <Toggle label="Show Errors" checked={s.showErrorsStat} onChange={() => s.setShowErrorsStat(!s.showErrorsStat)} />
      <Toggle label="Show Timer" checked={s.showTimerStat} onChange={() => s.setShowTimerStat(!s.showTimerStat)} />
      <Select label="Stats Columns" value={String(s.statsColumns)}
        options={[{ value: '2', label: '2 Columns' }, { value: '3', label: '3 Columns' }, { value: '4', label: '4 Columns' }]}
        onChange={v => s.setStatsColumns(Number(v) as any)} />
      <Toggle label="Show Previous Session Comparison" checked={s.showPrevSessionComparison} onChange={() => s.setShowPrevSessionComparison(!s.showPrevSessionComparison)} />

      <SectionLabel>WPM Chart</SectionLabel>
      <Toggle label="Show WPM Chart" checked={s.showWpmChart} onChange={() => s.setShowWpmChart(!s.showWpmChart)} />
      <Select label="Chart Style" value={s.wpmChartStyle}
        options={[{ value: 'line', label: 'Line' }, { value: 'bar', label: 'Bar' }, { value: 'area', label: 'Area' }, { value: 'dots', label: 'Dots' }]}
        onChange={v => s.setWpmChartStyle(v as any)} />
      <Slider label="Chart Data Points" value={s.wpmChartPoints} min={10} max={100} step={10}
        display={`${s.wpmChartPoints} pts`} onChange={s.setWpmChartPoints} />

      <SectionLabel>Achievements</SectionLabel>
      <Toggle label="Achievement Sound" checked={s.achievementSoundEnabled} onChange={() => s.setAchievementSoundEnabled(!s.achievementSoundEnabled)} />
      <Slider label="Achievement Duration" value={s.achievementDuration} min={2000} max={8000} step={500}
        display={`${(s.achievementDuration / 1000).toFixed(1)}s`} onChange={s.setAchievementDuration} />
      <Select label="Achievement Position" value={s.achievementPosition}
        options={[{ value: 'top-right', label: 'Top Right' }, { value: 'top-left', label: 'Top Left' }, { value: 'bottom-right', label: 'Bottom Right' }]}
        onChange={v => s.setAchievementPosition(v as any)} />

      <SectionLabel>Note Visualizer</SectionLabel>
      <Toggle label="Enable Note Visualizer" checked={s.noteVisualizerEnabled} onChange={() => s.setNoteVisualizerEnabled(!s.noteVisualizerEnabled)} />
      {s.noteVisualizerEnabled && (
        <>
          <Select label="Style" value={s.noteVisualizerStyle}
            options={[
              { value: 'bubbles', label: 'Bubbles' }, { value: 'sparks', label: 'Sparks' },
              { value: 'notes', label: 'Notes' }, { value: 'rings', label: 'Rings' },
              { value: 'lines', label: 'Lines' }, { value: 'petals', label: 'Petals' },
            ]}
            onChange={v => s.setNoteVisualizerStyle(v as any)} />
          <Slider label="Speed" value={s.noteVisualizerSpeed} min={0.5} max={5} step={0.5}
            display={`${s.noteVisualizerSpeed.toFixed(1)}×`} onChange={s.setNoteVisualizerSpeed} />
          <Slider label="Density" value={s.noteVisualizerDensity} min={1} max={10} step={1}
            display={`${s.noteVisualizerDensity}`} onChange={s.setNoteVisualizerDensity} />
        </>
      )}

      <SectionLabel>UI Layout</SectionLabel>
      <Toggle label="Focus Mode" desc="Hide UI chrome for distraction-free typing" checked={s.focusMode} onChange={() => s.setFocusMode(!s.focusMode)} />
      <Toggle label="Top Bar Visible" checked={s.topBarVisible} onChange={() => s.setTopBarVisible(!s.topBarVisible)} />
      <Toggle label="Transport Dock Visible" checked={s.transportDockVisible} onChange={() => s.setTransportDockVisible(!s.transportDockVisible)} />
      <Slider label="Focus Mode Opacity" value={s.focusModeOpacity} min={0} max={1} step={0.05}
        display={`${Math.round(s.focusModeOpacity * 100)}%`} onChange={s.setFocusModeOpacity} />

      <SectionLabel>Session History</SectionLabel>
      <Slider label="History Length" value={s.sessionHistoryLength} min={10} max={200} step={10}
        display={`${s.sessionHistoryLength} sessions`} onChange={s.setSessionHistoryLength} />
      <Toggle label="Show Keyboard Shortcuts" checked={s.showKeyboardShortcuts} onChange={() => s.setShowKeyboardShortcuts(!s.showKeyboardShortcuts)} />

      <SectionLabel>Profiles</SectionLabel>
      <ChipGroup
        value={String(s.activeProfile) as any}
        options={[{ value: '0', label: 'Profile 1' }, { value: '1', label: 'Profile 2' }, { value: '2', label: 'Profile 3' }]}
        onChange={v => s.setActiveProfile(Number(v) as any)}
      />

      <SectionLabel>Quick Style Presets</SectionLabel>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { id: 'gaming', label: '🎮 Gaming', desc: 'Neon + Fire RGB' },
          { id: 'study', label: '📚 Study', desc: 'Midnight + Lo-fi' },
          { id: 'concert', label: '🎹 Concert', desc: 'Synthwave + Wave' },
          { id: 'zen', label: '☯️ Zen', desc: 'Forest + Aurora' },
          { id: 'cyberpunk', label: '🤖 Cyberpunk', desc: 'Matrix Rain' },
          { id: 'lofi', label: '🎵 Lo-fi', desc: 'Warm + Lava' },
        ].map(p => (
          <button key={p.id}
            onClick={() => s.setQuickPreset(p.id)}
            title={p.desc}
            className={`flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-xl border text-center transition-all ${
              s.quickPreset === p.id
                ? 'bg-violet-500/20 border-violet-500/50 text-violet-200'
                : 'bg-white/04 border-white/08 text-white/50 hover:border-white/20 hover:text-white/80'
            }`}>
            <span className="text-sm">{p.label.split(' ')[0]}</span>
            <span className="text-[0.45rem] font-semibold leading-tight">{p.label.split(' ').slice(1).join(' ')}</span>
          </button>
        ))}
      </div>

      <SectionLabel>Productivity</SectionLabel>
      <Toggle label="Blind Typing Mode" desc="Hides typed characters for touch training" checked={s.blindTypingMode} onChange={() => s.setBlindTypingMode(!s.blindTypingMode)} />
      <Toggle label="Ghost Mode" desc="Show ghost WPM marker for personal best racing" checked={s.ghostMode} onChange={() => s.setGhostMode(!s.ghostMode)} />
      <Toggle label="Daily Challenge" desc="Loads a unique daily word set based on today's date" checked={s.dailyChallengeMode} onChange={() => s.setDailyChallengeMode(!s.dailyChallengeMode)} />

      <SectionLabel>Pomodoro Timer</SectionLabel>
      <Toggle label="Pomodoro Timer" desc="Work / break cycle timer shown in top bar" checked={s.pomodoroEnabled} onChange={() => s.setPomodoroEnabled(!s.pomodoroEnabled)} />
      {s.pomodoroEnabled && <>
        <Slider label="Work Duration" value={s.pomodoroWorkMin} min={5} max={60} step={5}
          display={`${s.pomodoroWorkMin}min`} onChange={s.setPomodoroWorkMin} />
        <Slider label="Break Duration" value={s.pomodoroBreakMin} min={1} max={30} step={1}
          display={`${s.pomodoroBreakMin}min`} onChange={s.setPomodoroBreakMin} />
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/04 border border-white/07">
          <div>
            <p className="text-[0.58rem] font-semibold text-white/70">Sessions Completed</p>
            <p className="text-[0.48rem] text-white/35">Today's pomodoro count</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-violet-400">{s.pomodoroSessions}</span>
            <button onClick={() => s.setPomodoroSessions(0)} className="text-[0.5rem] px-1.5 py-0.5 rounded bg-white/06 border border-white/10 text-white/40 hover:text-white/70 transition-all">Reset</button>
          </div>
        </div>
      </>}

      <SectionLabel>Settings Backup</SectionLabel>
      <div className="flex gap-2">
        <button onClick={() => s.exportSettings()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[0.6rem] font-semibold hover:bg-violet-500/25 transition-all">
          ⬇️ Export Settings
        </button>
        <label className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/06 border border-white/12 text-white/60 text-[0.6rem] font-semibold hover:bg-white/10 transition-all cursor-pointer">
          ⬆️ Import Settings
          <input type="file" accept=".json" className="hidden" onChange={e => {
            const f = e.target.files?.[0]; if (!f) return;
            const reader = new FileReader();
            reader.onload = ev => { try { const d = JSON.parse(ev.target?.result as string); s.importSettings(d); } catch {} };
            reader.readAsText(f);
          }} />
        </label>
      </div>
    </div>
  );
}

function AccessibilityTab() {
  const s = useStore();
  return (
    <div className="space-y-3">
      <SectionLabel>Vision</SectionLabel>
      <Toggle label="High Contrast Mode" desc="Increases text and key contrast" checked={s.highContrast} onChange={() => s.setHighContrast(!s.highContrast)} />
      <Toggle label="Large Text Mode" desc="Increases all font sizes" checked={s.largeTextMode} onChange={() => s.setLargeTextMode(!s.largeTextMode)} />
      <Toggle label="Dyslexia-friendly Font" desc="Uses OpenDyslexic typeface" checked={s.dyslexiaFont} onChange={() => s.setDyslexiaFont(!s.dyslexiaFont)} />
      <Toggle label="Blind Mode" desc="Audio-only feedback" checked={s.blindMode} onChange={() => s.setBlindMode(!s.blindMode)} />
      <Select label="Color Blind Mode" value={s.colorBlindMode}
        options={[
          { value: 'none', label: 'None' }, { value: 'deuteranopia', label: 'Deuteranopia' },
          { value: 'protanopia', label: 'Protanopia' }, { value: 'tritanopia', label: 'Tritanopia' },
        ]}
        onChange={v => s.setColorBlindMode(v as any)} />

      <SectionLabel>Motion & Input</SectionLabel>
      <Toggle label="Reduce Motion" desc="Disables non-essential animations" checked={s.reduceMotion} onChange={() => s.setReduceMotion(!s.reduceMotion)} />
      <Toggle label="Show Finger Guide" desc="Highlights correct finger for each key" checked={s.showFingerGuide} onChange={() => s.setShowFingerGuide(!s.showFingerGuide)} />
      <Toggle label="Mirror Keyboard" desc="Flips keyboard layout horizontally" checked={s.mirrorKeyboard} onChange={() => s.setMirrorKeyboard(!s.mirrorKeyboard)} />

      <SectionLabel>Touch & Mobile</SectionLabel>
      <Toggle label="Haptic Feedback" checked={s.hapticEnabled} onChange={() => s.setHapticEnabled(!s.hapticEnabled)} />
      <Toggle label="Touch Optimization" checked={s.touchOptimization} onChange={() => s.setTouchOptimization(!s.touchOptimization)} />
      <Toggle label="Swipe Navigation" checked={s.swipeNavigation} onChange={() => s.setSwipeNavigation(!s.swipeNavigation)} />
      <Toggle label="Pinch to Zoom" checked={s.pinchZoom} onChange={() => s.setPinchZoom(!s.pinchZoom)} />
    </div>
  );
}

function PerformanceTab() {
  const s = useStore();
  return (
    <div className="space-y-3">
      <SectionLabel>Rendering</SectionLabel>
      <Toggle label="Performance Mode" desc="Reduces visual effects for better speed" checked={s.performanceMode} onChange={() => s.setPerformanceMode(!s.performanceMode)} />
      <Toggle label="Auto Performance Mode" desc="Enables performance mode on low-end devices" checked={s.autoPerformanceMode} onChange={() => s.setAutoPerformanceMode(!s.autoPerformanceMode)} />
      <Toggle label="GPU Acceleration" checked={s.gpuAcceleration} onChange={() => s.setGpuAcceleration(!s.gpuAcceleration)} />
      <Toggle label="Adaptive Quality" checked={s.adaptiveQuality} onChange={() => s.setAdaptiveQuality(!s.adaptiveQuality)} />
      <Select label="FPS Target" value={s.fpsTarget}
        options={[{ value: 'max', label: 'Unlimited' }, { value: '60', label: '60 FPS' }, { value: '30', label: '30 FPS' }]}
        onChange={v => s.setFpsTarget(v as any)} />

      <SectionLabel>Input</SectionLabel>
      <Toggle label="RAF Throttling" desc="Throttle input events to animation frames" checked={s.rafThrottling} onChange={() => s.setRafThrottling(!s.rafThrottling)} />
      <Slider label="Debounce Delay" value={s.debounceDelay} min={0} max={50} step={5}
        display={`${s.debounceDelay}ms`} onChange={s.setDebounceDelay} />
      <Toggle label="CSS Containment" checked={s.cssContainment} onChange={() => s.setCssContainment(!s.cssContainment)} />

      <SectionLabel>Debug & Monitoring</SectionLabel>
      <Toggle label="Show FPS Counter" checked={s.showFpsCounter} onChange={() => s.setShowFpsCounter(!s.showFpsCounter)} />
      <Toggle label="Show Memory Usage" checked={s.showMemoryUsage} onChange={() => s.setShowMemoryUsage(!s.showMemoryUsage)} />
      <Toggle label="Analytics" checked={s.analyticsEnabled} onChange={() => s.setAnalyticsEnabled(!s.analyticsEnabled)} />

      <SectionLabel>Audio Engine</SectionLabel>
      <Select label="Buffer Size" value={String(s.audioBufferSize)}
        options={[{ value: '256', label: '256 samples' }, { value: '512', label: '512 samples' }, { value: '1024', label: '1024 samples' }, { value: '2048', label: '2048 samples' }]}
        onChange={v => s.setAudioBufferSize(Number(v) as any)} />
      <Toggle label="Suspend Audio on Idle" checked={s.audioSuspendOnIdle} onChange={() => s.setAudioSuspendOnIdle(!s.audioSuspendOnIdle)} />
      <Slider label="Suspend Delay" value={s.audioSuspendDelay} min={5} max={60} step={5}
        display={`${s.audioSuspendDelay}s`} onChange={s.setAudioSuspendDelay} />

      <SectionLabel>Storage & Network</SectionLabel>
      <Toggle label="Offline Mode" checked={s.offlineMode} onChange={() => s.setOfflineMode(!s.offlineMode)} />
      <Toggle label="Network Adaptive" checked={s.networkAdaptive} onChange={() => s.setNetworkAdaptive(!s.networkAdaptive)} />
      <Toggle label="Reduced Data Mode" checked={s.reducedDataMode} onChange={() => s.setReducedDataMode(!s.reducedDataMode)} />
      <Toggle label="Memory Optimization" checked={s.memoryOptimization} onChange={() => s.setMemoryOptimization(!s.memoryOptimization)} />
      <Toggle label="Storage Optimization" checked={s.storageOptimization} onChange={() => s.setStorageOptimization(!s.storageOptimization)} />

      <SectionLabel>Power</SectionLabel>
      <Toggle label="Page Visibility Pause" desc="Pause when tab is hidden" checked={s.pageVisibilityPause} onChange={() => s.setPageVisibilityPause(!s.pageVisibilityPause)} />
      <Toggle label="Battery Optimization" checked={s.batteryOptimization} onChange={() => s.setBatteryOptimization(!s.batteryOptimization)} />
      <Toggle label="Wake Lock" desc="Prevent screen sleep while typing" checked={s.wakeLock} onChange={() => s.setWakeLock(!s.wakeLock)} />
    </div>
  );
}

// ── FX2 Tab (Extended Audio FX) ───────────────────────────────────────────
function FX2Tab() {
  const s = useStore();
  return (
    <div className="space-y-2">
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mb-2 font-bold">Extended FX Chain</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Flanger" desc="Whooshing sweep effect" checked={s.flangerEnabled} onChange={() => s.setFlangerEnabled(!s.flangerEnabled)} />
        <Toggle label="Phaser" desc="Phase shifting sweep" checked={s.phaserEnabled} onChange={() => s.setPhaserEnabled(!s.phaserEnabled)} />
        <Toggle label="Tremolo" desc="Volume oscillation" checked={s.tremoloEnabled} onChange={() => s.setTremoloEnabled(!s.tremoloEnabled)} />
        <Toggle label="Auto Tune" desc="Pitch correction" checked={s.autoTuneEnabled} onChange={() => s.setAutoTuneEnabled(!s.autoTuneEnabled)} />
        <Toggle label="Vocoder" desc="Voice synthesis" checked={s.vocodeEnabled} onChange={() => s.setVocodeEnabled(!s.vocodeEnabled)} />
        <Toggle label="Stereo Width" desc="Widen stereo field" checked={s.stereoWidthEnabled} onChange={() => s.setStereoWidthEnabled(!s.stereoWidthEnabled)} />
        <Toggle label="Bass Boost" desc="Low frequency boost" checked={s.bassBoostEnabled} onChange={() => s.setBassBoostEnabled(!s.bassBoostEnabled)} />
        <Toggle label="High Pass" desc="Cut low frequencies" checked={s.highPassEnabled} onChange={() => s.setHighPassEnabled(!s.highPassEnabled)} />
        <Toggle label="Low Pass" desc="Cut high frequencies" checked={s.lowPassEnabled} onChange={() => s.setLowPassEnabled(!s.lowPassEnabled)} />
        <Toggle label="Bit Crusher" desc="Lo-fi digital crush" checked={s.bitCrusherEnabled} onChange={() => s.setBitCrusherEnabled(!s.bitCrusherEnabled)} />
      </div>
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">FX Parameters</div>
      <Slider label="Flanger Rate" value={s.flangerRate * 100} min={0} max={100} onChange={v => s.setFlangerRate(v / 100)} unit="Hz" />
      <Slider label="Phaser Rate" value={s.phaserRate * 100} min={0} max={100} onChange={v => s.setPhaserRate(v / 100)} unit="Hz" />
      <Slider label="Tremolo Rate" value={s.tremoloRate * 25} min={0} max={100} onChange={v => s.setTremoloRate(v / 25)} unit="Hz" />
      <Slider label="Stereo Width" value={s.stereoWidth} min={0} max={200} onChange={s.setStereoWidth} unit="%" />
      <Slider label="Bass Boost Gain" value={s.bassBoostGain} min={0} max={24} onChange={s.setBassBoostGain} unit="dB" />
      <Slider label="High Pass Freq" value={s.highPassFreq} min={20} max={2000} onChange={s.setHighPassFreq} unit="Hz" />
      <Slider label="Low Pass Freq" value={s.lowPassFreq} min={1000} max={20000} onChange={s.setLowPassFreq} unit="Hz" />
      <Slider label="Bit Depth" value={s.bitCrusherBits} min={1} max={16} onChange={s.setBitCrusherBits} unit="bit" />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">7-Band EQ</div>
      <Slider label="32Hz (Sub Bass)" value={s.eqBand1 + 12} min={0} max={24} onChange={v => s.setEqBand1(v - 12)} unit="dB" />
      <Slider label="64Hz (Bass)" value={s.eqBand2 + 12} min={0} max={24} onChange={v => s.setEqBand2(v - 12)} unit="dB" />
      <Slider label="250Hz (Low Mid)" value={s.eqBand3 + 12} min={0} max={24} onChange={v => s.setEqBand3(v - 12)} unit="dB" />
      <Slider label="1kHz (Mid)" value={s.eqBand4 + 12} min={0} max={24} onChange={v => s.setEqBand4(v - 12)} unit="dB" />
      <Slider label="4kHz (High Mid)" value={s.eqBand5 + 12} min={0} max={24} onChange={v => s.setEqBand5(v - 12)} unit="dB" />
      <Slider label="8kHz (Presence)" value={s.eqBand6 + 12} min={0} max={24} onChange={v => s.setEqBand6(v - 12)} unit="dB" />
      <Slider label="16kHz (Air)" value={s.eqBand7 + 12} min={0} max={24} onChange={v => s.setEqBand7(v - 12)} unit="dB" />
    </div>
  );
}

// ── VFX Tab (Visual Effects) ──────────────────────────────────────────────
function VFXTab() {
  const s = useStore();
  return (
    <div className="space-y-2">
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mb-2 font-bold">Post-Processing FX</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Bloom" desc="Soft light glow bleed" checked={s.bloomEnabled} onChange={() => s.setBloomEnabled(!s.bloomEnabled)} />
        <Toggle label="Vignette" desc="Darkened screen edges" checked={s.vignetteEnabled} onChange={() => s.setVignetteEnabled(!s.vignetteEnabled)} />
        <Toggle label="Chromatic Aberration" desc="RGB color fringe" checked={s.chromaticAberration} onChange={() => s.setChromaticAberration(!s.chromaticAberration)} />
        <Toggle label="Film Grain" desc="Cinematic noise" checked={s.filmGrainEnabled} onChange={() => s.setFilmGrainEnabled(!s.filmGrainEnabled)} />
        <Toggle label="Scan Lines" desc="CRT monitor lines" checked={s.scanLineEnabled} onChange={() => s.setScanLineEnabled(!s.scanLineEnabled)} />
        <Toggle label="VHS Effect" desc="Retro tape distortion" checked={s.vhsEnabled} onChange={() => s.setVhsEnabled(!s.vhsEnabled)} />
        <Toggle label="Glass Effect" desc="Frosted glass panel" checked={s.glassEffect} onChange={() => s.setGlassEffect(!s.glassEffect)} />
        <Toggle label="Neon Border" desc="Glowing border ring" checked={s.neonBorderEnabled} onChange={() => s.setNeonBorderEnabled(!s.neonBorderEnabled)} />
        <Toggle label="Pixelate" desc="Pixelated retro look" checked={s.pixelateEffect} onChange={() => s.setPixelateEffect(!s.pixelateEffect)} />
        <Toggle label="Invert Colors" desc="Inverted display" checked={s.invertColors} onChange={() => s.setInvertColors(!s.invertColors)} />
        <Toggle label="Grayscale" desc="Black and white mode" checked={s.grayscaleEnabled} onChange={() => s.setGrayscaleEnabled(!s.grayscaleEnabled)} />
        <Toggle label="Sepia" desc="Warm vintage tone" checked={s.sepiaEnabled} onChange={() => s.setSepiaEnabled(!s.sepiaEnabled)} />
        <Toggle label="Key Glow Pulse" desc="Pulsing key glow" checked={s.keyGlowPulse} onChange={() => s.setKeyGlowPulse(!s.keyGlowPulse)} />
      </div>
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Effect Strength</div>
      <Slider label="Bloom Strength" value={s.bloomStrength} min={0} max={100} onChange={s.setBloomStrength} unit="%" />
      <Slider label="Vignette Strength" value={s.vignetteStrength} min={0} max={100} onChange={s.setVignetteStrength} unit="%" />
      <Slider label="Film Grain" value={s.filmGrainIntensity} min={0} max={100} onChange={s.setFilmGrainIntensity} unit="%" />
      <Slider label="Pixelate Size" value={s.pixelateSize} min={1} max={20} onChange={s.setPixelateSize} unit="px" />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Background & Color Correction</div>
      <Slider label="BG Opacity" value={s.backgroundOpacity} min={0} max={100} onChange={s.setBackgroundOpacity} unit="%" />
      <Slider label="BG Blur" value={s.backgroundBlur} min={0} max={40} onChange={s.setBackgroundBlur} unit="px" />
      <Slider label="Saturation" value={s.backgroundSaturation} min={0} max={200} onChange={s.setBackgroundSaturation} unit="%" />
      <Slider label="Contrast" value={s.backgroundContrast} min={50} max={200} onChange={s.setBackgroundContrast} unit="%" />
      <Slider label="Brightness" value={s.brightnessAdjust} min={50} max={200} onChange={s.setBrightnessAdjust} unit="%" />
      <Slider label="Hue Rotate" value={s.hueRotate} min={0} max={360} onChange={s.setHueRotate} unit="°" />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Glass Panel</div>
      <Slider label="Glass Blur" value={s.glassBlur} min={0} max={40} onChange={s.setGlassBlur} unit="px" />
      <Slider label="Glass Opacity" value={s.glassOpacity} min={0} max={100} onChange={s.setGlassOpacity} unit="%" />
      <Slider label="Neon Border Width" value={s.neonBorderWidth} min={1} max={8} onChange={s.setNeonBorderWidth} unit="px" />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Key Glow</div>
      <div className="flex items-center gap-2 py-1">
        <span className="text-[0.6rem] text-white/50 w-24">Glow Color</span>
        <input type="color" value={s.keyGlowColor} onChange={e => s.setKeyGlowColor(e.target.value)} className="h-5 w-12 rounded cursor-pointer" />
      </div>
      <Slider label="Glow Radius" value={s.keyGlowRadius} min={0} max={60} onChange={s.setKeyGlowRadius} unit="px" />
    </div>
  );
}

// ── Layout Tab ────────────────────────────────────────────────────────────
function LayoutTab() {
  const s = useStore();
  return (
    <div className="space-y-2">
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mb-2 font-bold">Layout Options</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Compact Mode" desc="Denser compact UI" checked={s.compactMode} onChange={() => s.setCompactMode(!s.compactMode)} />
        <Toggle label="Ultra Wide" desc="Optimized for wide screens" checked={s.ultraWideLayout} onChange={() => s.setUltraWideLayout(!s.ultraWideLayout)} />
        <Toggle label="Floating Panels" desc="Detachable panels" checked={s.floatingPanels} onChange={() => s.setFloatingPanels(!s.floatingPanels)} />
        <Toggle label="Panel Snapping" desc="Snap panels to grid" checked={s.panelSnapping} onChange={() => s.setPanelSnapping(!s.panelSnapping)} />
        <Toggle label="Sidebar Collapsed" desc="Minimal sidebar" checked={s.sidebarCollapsed} onChange={() => s.setSidebarCollapsed(!s.sidebarCollapsed)} />
        <Toggle label="Status Bar" desc="Bottom status bar" checked={s.statusBarEnabled} onChange={() => s.setStatusBarEnabled(!s.statusBarEnabled)} />
        <Toggle label="Toolbar" desc="Top toolbar" checked={s.toolbarEnabled} onChange={() => s.setToolbarEnabled(!s.toolbarEnabled)} />
        <Toggle label="Breadcrumbs" desc="Navigation path" checked={s.breadcrumbsEnabled} onChange={() => s.setBreadcrumbsEnabled(!s.breadcrumbsEnabled)} />
        <Toggle label="Right Click Menu" desc="Context menu on right click" checked={s.rightClickMenu} onChange={() => s.setRightClickMenu(!s.rightClickMenu)} />
        <Toggle label="Welcome Screen" desc="Show welcome on start" checked={s.showWelcomeScreen} onChange={() => s.setShowWelcomeScreen(!s.showWelcomeScreen)} />
        <Toggle label="Tutorial" desc="Show tutorial hints" checked={s.showTutorial} onChange={() => s.setShowTutorial(!s.showTutorial)} />
        <Toggle label="Smooth Scroll" desc="Smooth text scrolling" checked={s.smoothScrolling} onChange={() => s.setSmoothScrolling(!s.smoothScrolling)} />
        <Toggle label="Word Wrap" desc="Wrap long text lines" checked={s.wordWrap} onChange={() => s.setWordWrap(!s.wordWrap)} />
        <Toggle label="Current Word Box" desc="Highlight current word" checked={s.showCurrentWordBox} onChange={() => s.setShowCurrentWordBox(!s.showCurrentWordBox)} />
        <Toggle label="Word History" desc="Show previous words" checked={s.showWordHistory} onChange={() => s.setShowWordHistory(!s.showWordHistory)} />
      </div>
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Dock & Panels</div>
      <Select label="Dock Position" value={s.dockPosition} onChange={s.setDockPosition} options={['bottom','top','left','right','floating','none']} />
      <Select label="Popup Style" value={s.popupStyle} onChange={s.setPopupStyle} options={['toast','modal','inline','bubble','minimal']} />
      <Select label="Animation Preset" value={s.animationPreset} onChange={s.setAnimationPreset} options={['smooth','snappy','instant','bouncy','elastic','none']} />
      <Select label="Transition Style" value={s.transitionStyle} onChange={s.setTransitionStyle} options={['fade','slide','scale','flip','none']} />
      <Select label="Panel Layout" value={s.customPanelLayout} onChange={s.setCustomPanelLayout} options={['default','compact','expanded','minimal','pro','creative']} />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Caret</div>
      <Slider label="Caret Width" value={s.caretWidth} min={1} max={8} onChange={s.setCaretWidth} unit="px" />
      <Slider label="Blink Rate" value={s.caretBlinkRate} min={100} max={2000} onChange={s.setCaretBlinkRate} unit="ms" />
      <Toggle label="Caret Blink" desc="Blinking caret cursor" checked={s.caretBlink} onChange={() => s.setCaretBlink(!s.caretBlink)} />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Notifications</div>
      <Toggle label="Notifications" desc="Enable all notifications" checked={s.notificationsEnabled} onChange={() => s.setNotificationsEnabled(!s.notificationsEnabled)} />
      <Toggle label="Sound Notifications" desc="Audio notification chime" checked={s.soundNotifications} onChange={() => s.setSoundNotifications(!s.soundNotifications)} />
      <Toggle label="Desktop Notifications" desc="System desktop alerts" checked={s.desktopNotifications} onChange={() => s.setDesktopNotifications(!s.desktopNotifications)} />
    </div>
  );
}

// ── Challenges Tab ─────────────────────────────────────────────────────────
function ChallengesTab() {
  const s = useStore();
  return (
    <div className="space-y-2">
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mb-2 font-bold">Daily & Weekly Challenges</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Daily Challenge" desc="New challenge every day" checked={s.dailyChallengeMode} onChange={() => s.setDailyChallengeMode(!s.dailyChallengeMode)} />
        <Toggle label="Weekly Challenge" desc="Longer weekly quest" checked={s.weeklyChallengeMode} onChange={() => s.setWeeklyChallengeMode(!s.weeklyChallengeMode)} />
        <Toggle label="Race Mode" desc="Race against target WPM" checked={s.raceMode} onChange={() => s.setRaceMode(!s.raceMode)} />
        <Toggle label="Challenge Alerts" desc="Notify on new challenges" checked={s.challengeNotifications} onChange={() => s.setChallengeNotifications(!s.challengeNotifications)} />
      </div>
      <Slider label="Race Target WPM" value={s.raceTarget} min={10} max={300} onChange={s.setRaceTarget} unit="WPM" />
      <Select label="Challenge Difficulty" value={s.challengeDifficulty} onChange={s.setChallengeDifficulty}
        options={['easy','normal','hard','expert','insane','custom']} />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Typing Goals</div>
      <Slider label="Target WPM" value={s.targetWpm} min={10} max={300} onChange={s.setTargetWpm} unit="WPM" />
      <Slider label="Target Accuracy" value={s.targetAccuracy} min={50} max={100} onChange={s.setTargetAccuracy} unit="%" />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Text Modifiers</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Punctuation" desc="Add punctuation marks" checked={s.punctuationEnabled} onChange={() => s.setPunctuationEnabled(!s.punctuationEnabled)} />
        <Toggle label="Numbers" desc="Include numbers in text" checked={s.numbersInText} onChange={() => s.setNumbersInText(!s.numbersInText)} />
        <Toggle label="Capital Letters" desc="Enable uppercase words" checked={s.capitalLetters} onChange={() => s.setCapitalLetters(!s.capitalLetters)} />
        <Toggle label="Emoji Mode" desc="Include emoji in text" checked={s.emojiMode} onChange={() => s.setEmojiMode(!s.emojiMode)} />
        <Toggle label="Spell Check" desc="Highlight misspellings" checked={s.spellCheckEnabled} onChange={() => s.setSpellCheckEnabled(!s.spellCheckEnabled)} />
        <Toggle label="Auto Correct" desc="Fix common mistakes" checked={s.autoCorrectEnabled} onChange={() => s.setAutoCorrectEnabled(!s.autoCorrectEnabled)} />
        <Toggle label="Word Prediction" desc="AI word suggestions" checked={s.wordPrediction} onChange={() => s.setWordPrediction(!s.wordPrediction)} />
        <Toggle label="Pace Tracker" desc="Track typing rhythm" checked={s.typingPaceTracker} onChange={() => s.setTypingPaceTracker(!s.typingPaceTracker)} />
        <Toggle label="Consistency Score" desc="Measure typing evenness" checked={s.consistencyScore} onChange={() => s.setConsistencyScore(!s.consistencyScore)} />
        <Toggle label="Auto Pause on Error" desc="Pause when mistake made" checked={s.autoPauseOnError} onChange={() => s.setAutoPauseOnError(!s.autoPauseOnError)} />
      </div>
      <Slider label="Error Highlight Duration" value={s.errorHighlightDuration} min={100} max={2000} onChange={s.setErrorHighlightDuration} unit="ms" />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Pomodoro Timer</div>
      <Toggle label="Pomodoro" desc="Focus timer system" checked={s.pomodoroEnabled} onChange={() => s.setPomodoroEnabled(!s.pomodoroEnabled)} />
      <Slider label="Work Duration" value={s.pomodoroWorkMin} min={5} max={120} onChange={s.setPomodoroWorkMin} unit="min" />
      <Slider label="Break Duration" value={s.pomodoroBreakMin} min={1} max={60} onChange={s.setPomodoroBreakMin} unit="min" />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Stats</div>
      <div className="bg-white/05 rounded-xl p-3 space-y-1.5">
        <div className="flex justify-between text-[0.6rem]">
          <span className="text-white/40">Challenge Streak</span>
          <span className="text-orange-400 font-bold">{s.challengeStreak} days 🔥</span>
        </div>
        <div className="flex justify-between text-[0.6rem]">
          <span className="text-white/40">Challenge Points</span>
          <span className="text-yellow-400 font-bold">{s.challengePoints.toLocaleString()} pts</span>
        </div>
        <div className="flex justify-between text-[0.6rem]">
          <span className="text-white/40">Completed</span>
          <span className="text-green-400 font-bold">{s.completedChallenges.length} challenges</span>
        </div>
        <div className="flex justify-between text-[0.6rem]">
          <span className="text-white/40">Daily Goal WPM</span>
          <span className="text-violet-400 font-bold">{s.dailyGoalWpm} WPM</span>
        </div>
      </div>
    </div>
  );
}

// ── Achievements Tab ──────────────────────────────────────────────────────────
function AchievementsTab() {
  const { unlockedAchievements, xp, bestWpm, accuracy, totalKeystrokes, totalSessions, totalWordsTyped, dailyStreak } = useStore();
  const { current: lvlInfo, next: nextLvl, progress } = getLevelInfo(xp);
  const lvl = lvlInfo.level;
  const xpToNext = Math.max(0, nextLvl.minXp - xp);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filtered = ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return unlockedAchievements.includes(a.id);
    if (filter === 'locked') return !unlockedAchievements.includes(a.id);
    return true;
  });

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="space-y-3">
      {/* Level card */}
      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/08 border border-violet-500/25">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[0.55rem] text-white/40 uppercase tracking-widest">Level</p>
            <p className="text-xl font-black text-white">{lvl}</p>
          </div>
          <div className="text-right">
            <p className="text-[0.55rem] text-white/40">Total XP</p>
            <p className="text-sm font-bold text-violet-300">{xp.toLocaleString()}</p>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[0.48rem] text-white/30 mt-1">{xpToNext.toLocaleString()} XP to next level</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: 'Best WPM', value: bestWpm },
          { label: 'Sessions', value: totalSessions },
          { label: 'Streak', value: `${dailyStreak}d` },
          { label: 'Words', value: totalWordsTyped.toLocaleString() },
          { label: 'Keys', value: totalKeystrokes.toLocaleString() },
          { label: 'Unlocked', value: `${unlockedCount}/${totalCount}` },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col items-center py-2 rounded-xl bg-white/04 border border-white/06">
            <span className="text-[0.7rem] font-black text-white/80">{stat.value}</span>
            <span className="text-[0.46rem] text-white/30 uppercase">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1">
        {(['all', 'unlocked', 'locked'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('flex-1 py-1 rounded-lg border text-[0.58rem] font-semibold capitalize transition-all',
              filter === f ? 'bg-violet-500/25 border-violet-500/50 text-violet-200' : 'bg-white/04 border-white/08 text-white/40 hover:text-white/70')}>
            {f}
          </button>
        ))}
      </div>

      {/* Achievement list */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
        {filtered.map(ach => {
          const unlocked = unlockedAchievements.includes(ach.id);
          return (
            <div key={ach.id} className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-all',
              unlocked ? RARITY_COLORS[ach.rarity] : 'bg-white/02 border-white/06 opacity-50'
            )}>
              <span className={cn('text-base shrink-0', !unlocked && 'grayscale opacity-40')}>{ach.icon}</span>
              <div className="min-w-0">
                <p className="text-[0.62rem] font-semibold text-white/80 truncate">{ach.title}</p>
                <p className="text-[0.5rem] text-white/35 truncate">{ach.desc}</p>
              </div>
              <div className="ml-auto shrink-0 text-right">
                <span className="text-[0.5rem] font-bold text-amber-300">+{ach.xp} XP</span>
                <p className="text-[0.44rem] text-white/25 capitalize mt-0.5">{ach.rarity}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Harmony Tab ────────────────────────────────────────────────────────────
function Shortcuts2Tab() {
  const [customShortcuts] = useState([
    { action:'Record', key:'Ctrl+Shift+R', category:'Transport' },
    { action:'Play', key:'Ctrl+Shift+P', category:'Transport' },
    { action:'Stop', key:'Ctrl+Shift+S', category:'Transport' },
    { action:'Loop', key:'Ctrl+Shift+L', category:'Transport' },
    { action:'Metronome', key:'Ctrl+M', category:'Music' },
    { action:'+BPM', key:'Ctrl+Up', category:'Music' },
    { action:'-BPM', key:'Ctrl+Down', category:'Music' },
    { action:'Command Palette', key:'Ctrl+K', category:'App' },
    { action:'Analytics', key:'Ctrl+Shift+A', category:'App' },
    { action:'Focus Mode', key:'Ctrl+Shift+F', category:'App' },
    { action:'Reset', key:'Ctrl+R', category:'Typing' },
    { action:'Next Mode', key:'Alt+Right', category:'Typing' },
    { action:'Prev Mode', key:'Alt+Left', category:'Typing' },
    { action:'Free Mode', key:'Alt+F', category:'Typing' },
    { action:'Settings', key:'Ctrl+,', category:'App' },
    { action:'Shortcuts Help', key:'F1', category:'App' },
    { action:'Volume Up', key:'Ctrl+=', category:'Audio' },
    { action:'Volume Down', key:'Ctrl+-', category:'Audio' },
    { action:'Mute', key:'Ctrl+0', category:'Audio' },
    { action:'Next Instrument', key:'Ctrl+]', category:'Audio' },
    { action:'Prev Instrument', key:'Ctrl+[', category:'Audio' },
    { action:'Next Theme', key:'Ctrl+Shift+T', category:'Visual' },
    { action:'Toggle RGB', key:'Ctrl+Shift+G', category:'Visual' },
    { action:'Fullscreen', key:'F11', category:'App' },
    { action:'Keyboard Only', key:'Ctrl+Shift+K', category:'App' },
  ]);
  const [editingIdx, setEditingIdx] = useState<number|null>(null);
  const [categories] = useState(['All','App','Transport','Typing','Music','Audio','Visual']);
  const [catFilter, setCatFilter] = useState('All');
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [vimMode, setVimMode] = useState(false);
  const [emacsMode, setEmacsMode] = useState(false);
  const [macOsMode, setMacOsMode] = useState(false);
  const [disableInInput, setDisableInInput] = useState(false);
  const [shortcutDelay, setShortcutDelay] = useState(0);
  const [chordShortcuts, setChordShortcuts] = useState(false);
  const [leader, setLeader] = useState(' ');
  const [repeatingKeys, setRepeatingKeys] = useState(true);

  const filtered = catFilter === 'All' ? customShortcuts : customShortcuts.filter(s => s.category === catFilter);

  return (
    <div className="space-y-2">
      <SectionLabel>Keyboard Shortcuts</SectionLabel>
      <Toggle label="Global Shortcuts" desc="Enable all keyboard shortcuts" checked={globalEnabled} onChange={() => setGlobalEnabled(v=>!v)} />
      <Toggle label="Vim Mode" desc="Vim-style navigation" checked={vimMode} onChange={() => setVimMode(v=>!v)} />
      <Toggle label="Emacs Mode" desc="Emacs key bindings" checked={emacsMode} onChange={() => setEmacsMode(v=>!v)} />
      <Toggle label="macOS Mode" desc="Use ⌘ instead of Ctrl" checked={macOsMode} onChange={() => setMacOsMode(v=>!v)} />
      <Toggle label="Disable in Input" desc="Shortcuts off when typing" checked={disableInInput} onChange={() => setDisableInInput(v=>!v)} />
      <Toggle label="Chord Shortcuts" desc="Multi-key chord sequences" checked={chordShortcuts} onChange={() => setChordShortcuts(v=>!v)} />
      <Toggle label="Repeating Keys" desc="Hold to repeat action" checked={repeatingKeys} onChange={() => setRepeatingKeys(v=>!v)} />
      <Slider label="Shortcut Delay" value={shortcutDelay} min={0} max={500} onChange={setShortcutDelay} unit="ms" />
      <SectionLabel>Category Filter</SectionLabel>
      <div className="flex flex-wrap gap-1">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={cn('px-2 py-0.5 rounded-lg text-[0.52rem] border transition-all',
              catFilter===c?'bg-rose-500/25 border-rose-500/50 text-rose-200':'bg-white/05 border-white/08 text-white/40 hover:text-white/60')}>
            {c}
          </button>
        ))}
      </div>
      <SectionLabel>Shortcut Map</SectionLabel>
      <div className="space-y-0.5 max-h-48 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
        {filtered.map((sh, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/03 border border-white/06 hover:bg-white/06 transition-all">
            <span className="text-[0.52rem] text-white/60 flex-1">{sh.action}</span>
            <kbd className="text-[0.48rem] px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-white/70 font-mono">{sh.key}</kbd>
            <span className="text-[0.44rem] text-white/25">{sh.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Settings Panel
// ────────────────────────────────────────────────────────────────────────────

export function SettingsPanel({ className, initialTab, hideTabNav }: { className?: string; initialTab?: string; hideTabNav?: boolean }) {
  const [activeTab, setActiveTab] = useState<TabId>((initialTab as TabId) || 'controls');
  useEffect(() => {
    if (initialTab) {
      const valid = TABS.find(t => t.id === initialTab);
      if (valid) setActiveTab(initialTab as TabId);
    }
  }, [initialTab]);

  const activeTabData = TABS.find(t => t.id === activeTab)!;
  const acc = useTabAccent(activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'controls': return <ControlsTab />;
      case 'typing': return <TypingTab />;
      case 'audio': return <AudioTab />;
      case 'fx': return <FxTab />;
      case 'fx2': return <FX2Tab />;
      case 'visual': return <VisualTab />;
      case 'vfx': return <VFXTab />;
      case 'keyboard': return <KeyboardTab />;
      case 'musical': return <MusicalTab />;
      case 'interface': return <InterfaceTab />;
      case 'layout': return <LayoutTab />;
      case 'accessibility': return <AccessibilityTab />;
      case 'performance': return <PerformanceTab />;
      case 'challenges': return <ChallengesTab />;
      case 'shortcuts2': return <Shortcuts2Tab />;
      case 'presets': return <PresetsManager />;
      case 'recordings': return <RecordingsManager />;
      case 'achievements': return <AchievementsTab />;
    }
  };

  return (
    <ActiveTabCtx.Provider value={activeTab}>
      <div className={cn('flex flex-col h-full overflow-hidden', className)}>

        {/* ── Compact tab strip — only shown when not in sidebar (hideTabNav = false) ── */}
        {!hideTabNav && (
          <>
            <div className="shrink-0 px-3 pt-2.5 pb-1.5 border-b border-white/07"
              style={{ background: `linear-gradient(135deg, ${acc.from}18 0%, ${acc.to}08 100%)` }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full"
                  style={{ background: `linear-gradient(to bottom, ${acc.from}, ${acc.to})`, boxShadow: acc.glow }} />
                <activeTabData.icon className={cn('w-4 h-4', acc.text)} />
                <span className={cn('text-sm font-bold tracking-wide', acc.text)}>{activeTabData.label}</span>
              </div>
            </div>
            <div className="flex gap-0.5 px-2 py-1.5 overflow-x-auto scrollbar-hide shrink-0 border-b border-white/05">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                const tabAcc = TAB_ACCENTS[tab.id] ?? TAB_ACCENTS['typing'];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={tab.label}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-lg text-[0.52rem] font-semibold whitespace-nowrap transition-all shrink-0 border',
                      active ? `border-opacity-60 ${tabAcc.border}` : 'border-transparent hover:border-white/08'
                    )}
                    style={active ? {
                      background: `linear-gradient(135deg, ${tabAcc.from}30, ${tabAcc.to}18)`,
                      boxShadow: tabAcc.glow,
                    } : undefined}
                  >
                    <Icon className={cn('w-2.5 h-2.5', active ? tabAcc.text : 'text-white/25')} />
                    <span className={active ? tabAcc.text : 'text-white/30'}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 min-w-0 space-y-1" style={{ touchAction: 'pan-y' }}>
          {renderContent()}
        </div>

      </div>
    </ActiveTabCtx.Provider>
  );
}
