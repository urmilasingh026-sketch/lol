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
  Swords, FlaskConical, Users, LayoutDashboard, Radio, Sparkles,
  Piano, Waves, AudioLines, Shuffle, Lock,
  Cloud, Bot, Activity, Link2, Cpu, Gamepad2, Star, Lightbulb,
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
  { id: 'harmony',       icon: Piano,            label: 'Harmony',      color: 'text-violet-300' },
  { id: 'synth',         icon: Waves,            label: 'Synth',        color: 'text-blue-300' },
  { id: 'mixer',         icon: AudioLines,       label: 'Mixer',        color: 'text-cyan-300' },
  { id: 'midi',          icon: Link2,            label: 'MIDI',         color: 'text-emerald-300' },
  { id: 'looper',        icon: Shuffle,          label: 'Looper',       color: 'text-pink-300' },
  { id: 'interface',     icon: Eye,              label: 'Interface',    color: 'text-teal-400' },
  { id: 'layout',        icon: LayoutDashboard,  label: 'Layout',       color: 'text-lime-400' },
  { id: 'accessibility', icon: Accessibility,    label: 'A11y',         color: 'text-green-400' },
  { id: 'performance',   icon: Zap,              label: 'Perf',         color: 'text-yellow-400' },
  { id: 'challenges',    icon: Swords,           label: 'Challenges',   color: 'text-red-400' },
  { id: 'trainer',       icon: Activity,         label: 'Trainer',      color: 'text-orange-300' },
  { id: 'ai',            icon: Bot,              label: 'AI',           color: 'text-sky-300' },
  { id: 'cloud',         icon: Cloud,            label: 'Cloud',        color: 'text-blue-300' },
  { id: 'privacy',       icon: Lock,             label: 'Privacy',      color: 'text-green-300' },
  { id: 'pro',           icon: Star,             label: 'Pro',          color: 'text-amber-300' },
  { id: 'shortcuts2',    icon: Cpu,              label: 'Shortcuts',    color: 'text-rose-300' },
  { id: 'gamify',        icon: Gamepad2,         label: 'Gamify',       color: 'text-violet-300' },
  { id: 'tips',          icon: Lightbulb,        label: 'Tips',         color: 'text-yellow-300' },
  { id: 'social',        icon: Users,            label: 'Social',       color: 'text-emerald-400' },
  { id: 'labs',          icon: FlaskConical,     label: 'Labs',         color: 'text-purple-400' },
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
  harmony:       { from: '#6d28d9', to: '#c4b5fd', border: 'border-violet-400/50',  text: 'text-violet-200',  glow: '0 0 12px #6d28d955' },
  synth:         { from: '#1d4ed8', to: '#93c5fd', border: 'border-blue-400/50',    text: 'text-blue-200',    glow: '0 0 12px #1d4ed855' },
  mixer:         { from: '#0e7490', to: '#67e8f9', border: 'border-cyan-400/50',    text: 'text-cyan-200',    glow: '0 0 12px #0e749055' },
  midi:          { from: '#047857', to: '#6ee7b7', border: 'border-emerald-400/50', text: 'text-emerald-200', glow: '0 0 12px #04785755' },
  looper:        { from: '#be185d', to: '#f9a8d4', border: 'border-pink-400/50',    text: 'text-pink-200',    glow: '0 0 12px #be185d55' },
  interface:     { from: '#0f766e', to: '#5eead4', border: 'border-teal-500/50',    text: 'text-teal-300',    glow: '0 0 12px #0f766e55' },
  layout:        { from: '#4d7c0f', to: '#bef264', border: 'border-lime-500/50',    text: 'text-lime-300',    glow: '0 0 12px #4d7c0f55' },
  accessibility: { from: '#15803d', to: '#86efac', border: 'border-green-500/50',   text: 'text-green-300',   glow: '0 0 12px #15803d55' },
  performance:   { from: '#a16207', to: '#fde047', border: 'border-yellow-500/50',  text: 'text-yellow-300',  glow: '0 0 12px #a1620755' },
  challenges:    { from: '#b91c1c', to: '#f87171', border: 'border-red-500/50',     text: 'text-red-300',     glow: '0 0 12px #b91c1c55' },
  trainer:       { from: '#c2410c', to: '#fdba74', border: 'border-orange-400/50',  text: 'text-orange-200',  glow: '0 0 12px #c2410c55' },
  ai:            { from: '#0369a1', to: '#7dd3fc', border: 'border-sky-400/50',     text: 'text-sky-200',     glow: '0 0 12px #036961a55' },
  cloud:         { from: '#1e40af', to: '#93c5fd', border: 'border-blue-400/50',    text: 'text-blue-200',    glow: '0 0 12px #1e40af55' },
  privacy:       { from: '#166534', to: '#86efac', border: 'border-green-400/50',   text: 'text-green-200',   glow: '0 0 12px #16653455' },
  pro:           { from: '#92400e', to: '#fde68a', border: 'border-amber-400/50',   text: 'text-amber-200',   glow: '0 0 12px #92400e55' },
  shortcuts2:    { from: '#9f1239', to: '#fda4af', border: 'border-rose-400/50',    text: 'text-rose-200',    glow: '0 0 12px #9f123955' },
  gamify:        { from: '#5b21b6', to: '#ddd6fe', border: 'border-violet-300/50',  text: 'text-violet-100',  glow: '0 0 12px #5b21b655' },
  tips:          { from: '#713f12', to: '#fef08a', border: 'border-yellow-400/50',  text: 'text-yellow-200',  glow: '0 0 12px #713f1255' },
  social:        { from: '#065f46', to: '#6ee7b7', border: 'border-emerald-500/50', text: 'text-emerald-300', glow: '0 0 12px #065f4655' },
  labs:          { from: '#581c87', to: '#d8b4fe', border: 'border-purple-500/50',  text: 'text-purple-300',  glow: '0 0 12px #581c8755' },
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

// ── Social Tab ─────────────────────────────────────────────────────────────
function SocialTab() {
  const s = useStore();
  const avatars = ['🎹','🎸','🎺','🎻','🥁','🎷','🎵','🎶','🎤','🎧','🎼','🎭','🏆','👑','⚡','🌟'];
  return (
    <div className="space-y-2">
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mb-2 font-bold">Player Profile</div>
      <div className="bg-white/05 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">{avatars[s.playerAvatarId % avatars.length]}</div>
          <div>
            <div className="text-sm font-bold text-white">{s.playerTag || 'Anonymous'}</div>
            <div className="text-[0.6rem] text-white/40">{s.playerBio || 'No bio yet'}</div>
          </div>
        </div>
      </div>
      <label className="block text-[0.6rem] text-white/40 mb-1">Player Tag</label>
      <input value={s.playerTag} onChange={e => s.setPlayerTag(e.target.value)}
        placeholder="Your username..."
        className="w-full bg-white/08 rounded-lg px-2.5 py-1.5 text-[0.7rem] text-white border border-white/10 focus:outline-none focus:border-violet-500/50 mb-1" />
      <label className="block text-[0.6rem] text-white/40 mb-1">Bio</label>
      <input value={s.playerBio} onChange={e => s.setPlayerBio(e.target.value)}
        placeholder="Tell the community about yourself..."
        className="w-full bg-white/08 rounded-lg px-2.5 py-1.5 text-[0.7rem] text-white border border-white/10 focus:outline-none focus:border-violet-500/50 mb-1" />
      <Select label="Country" value={s.playerCountry} onChange={s.setPlayerCountry}
        options={['','🇬🇧 UK','🇺🇸 USA','🇯🇵 Japan','🇩🇪 Germany','🇫🇷 France','🇰🇷 Korea','🇦🇺 Australia','🇧🇷 Brazil','🇨🇳 China','🇮🇳 India','🇨🇦 Canada']} />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Avatar</div>
      <div className="grid grid-cols-8 gap-1">
        {avatars.map((a, i) => (
          <button key={i} onClick={() => s.setPlayerAvatarId(i)}
            className={`text-lg p-1 rounded-lg transition-all ${s.playerAvatarId === i ? 'bg-violet-500/30 ring-1 ring-violet-400' : 'hover:bg-white/08'}`}>
            {a}
          </button>
        ))}
      </div>
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Community Settings</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Leaderboard" desc="Show global leaderboard" checked={s.showLeaderboard} onChange={() => s.setShowLeaderboard(!s.showLeaderboard)} />
        <Toggle label="Share Results" desc="Auto-share session results" checked={s.shareResults} onChange={() => s.setShareResults(!s.shareResults)} />
        <Toggle label="Public Profile" desc="Make profile visible" checked={s.publicProfile} onChange={() => s.setPublicProfile(!s.publicProfile)} />
        <Toggle label="Friends" desc="Enable friends list" checked={s.friendsEnabled} onChange={() => s.setFriendsEnabled(!s.friendsEnabled)} />
      </div>
      <Select label="Leaderboard Scope" value={s.leaderboardScope} onChange={s.setLeaderboardScope}
        options={['global','regional','friends','weekly','monthly','alltime']} />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Profiles</div>
      {([0,1,2] as const).map(i => {
        const names = [s.profileName0, s.profileName1, s.profileName2];
        const colors = [s.profileColor0, s.profileColor1, s.profileColor2];
        const icons = [s.profileIcon0, s.profileIcon1, s.profileIcon2];
        const setName = [s.setProfileName0, s.setProfileName1, s.setProfileName2][i];
        const setColor = [s.setProfileColor0, s.setProfileColor1, s.setProfileColor2][i];
        return (
          <div key={i} className="flex items-center gap-2 bg-white/05 rounded-lg p-2">
            <div className="text-base">{icons[i]}</div>
            <input value={names[i]} onChange={e => setName(e.target.value)}
              className="flex-1 bg-transparent text-[0.7rem] text-white focus:outline-none" />
            <input type="color" value={colors[i]} onChange={e => setColor(e.target.value)}
              className="h-5 w-8 rounded cursor-pointer" />
            <button onClick={() => s.setActiveProfile(i as 0|1|2)}
              className={`text-[0.55rem] px-1.5 py-0.5 rounded-lg transition-all ${s.activeProfile===i ? 'bg-violet-500/40 text-violet-300' : 'text-white/30 hover:text-white/60'}`}>
              {s.activeProfile===i ? 'Active' : 'Use'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Labs Tab ──────────────────────────────────────────────────────────────
function LabsTab() {
  const s = useStore();
  return (
    <div className="space-y-2">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 mb-3">
        <div className="text-[0.65rem] text-amber-300 font-semibold">⚗️ Experimental Features</div>
        <div className="text-[0.58rem] text-amber-300/70 mt-0.5">These features are experimental and may not fully work.</div>
      </div>
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mb-2 font-bold">AI & Machine Learning</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="AI Assistant" desc="Smart typing assistance" checked={s.aiAssistEnabled} onChange={() => s.setAiAssistEnabled(!s.aiAssistEnabled)} />
        <Toggle label="WPM Prediction" desc="Predict your peak WPM" checked={s.aiWpmPrediction} onChange={() => s.setAiWpmPrediction(!s.aiWpmPrediction)} />
        <Toggle label="AI Suggestions" desc="Word & phrase hints" checked={s.aiSuggestions} onChange={() => s.setAiSuggestions(!s.aiSuggestions)} />
        <Toggle label="ML Accuracy Model" desc="ML-powered analysis" checked={s.mlAccuracyModel} onChange={() => s.setMlAccuracyModel(!s.mlAccuracyModel)} />
      </div>
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Bio & Sensor Input</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Biometric Feedback" desc="Heart rate / stress data" checked={s.biometricFeedback} onChange={() => s.setBiometricFeedback(!s.biometricFeedback)} />
        <Toggle label="Eye Tracking" desc="Gaze-based navigation" checked={s.eyeTrackingEnabled} onChange={() => s.setEyeTrackingEnabled(!s.eyeTrackingEnabled)} />
        <Toggle label="Voice Typing" desc="Speech-to-text input" checked={s.voiceTypingEnabled} onChange={() => s.setVoiceTypingEnabled(!s.voiceTypingEnabled)} />
        <Toggle label="Motion Control" desc="Gesture-based control" checked={s.motionControlEnabled} onChange={() => s.setMotionControlEnabled(!s.motionControlEnabled)} />
        <Toggle label="Brainwave Input" desc="BCI device support" checked={s.brainwaveEnabled} onChange={() => s.setBrainwaveEnabled(!s.brainwaveEnabled)} />
      </div>
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Advanced Physics</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Quantum RNG" desc="Quantum random text gen" checked={s.quantumRngMode} onChange={() => s.setQuantumRngMode(!s.quantumRngMode)} />
        <Toggle label="3D Typing Mode" desc="3D rendered text field" checked={s.typingMode3d} onChange={() => s.setTypingMode3d(!s.typingMode3d)} />
        <Toggle label="Keyboard Perspective" desc="3D keyboard angle view" checked={s.keyboardPerspective > 0} onChange={() => s.setKeyboardPerspective(s.keyboardPerspective > 0 ? 0 : 15)} />
        <Toggle label="Key Anim Trail" desc="Motion trail on keys" checked={s.keyAnimationTrail} onChange={() => s.setKeyAnimationTrail(!s.keyAnimationTrail)} />
        <Toggle label="Key Ghost Effect" desc="Ghost echo on press" checked={s.keyGhostEffect} onChange={() => s.setKeyGhostEffect(!s.keyGhostEffect)} />
      </div>
      <Slider label="Keyboard 3D Depth" value={s.key3dDepth} min={0} max={40} onChange={s.setKey3dDepth} unit="px" />
      <Slider label="Keyboard Tilt" value={s.keyboardTilt} min={-30} max={30} onChange={s.setKeyboardTilt} unit="°" />
      <Slider label="Keyboard Zoom" value={s.keyboardZoom} min={50} max={200} onChange={s.setKeyboardZoom} unit="%" />
      <div className="text-[0.6rem] uppercase tracking-widest text-white/30 mt-3 mb-1 font-bold">Keyboard Display</div>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Key Numbers" desc="Show key number labels" checked={s.showKeyNumbers} onChange={() => s.setShowKeyNumbers(!s.showKeyNumbers)} />
        <Toggle label="Chord Names" desc="Show chord name labels" checked={s.showChordNames} onChange={() => s.setShowChordNames(!s.showChordNames)} />
        <Toggle label="Scale Degrees" desc="Show scale degree numbers" checked={s.showScaleDegrees} onChange={() => s.setShowScaleDegrees(!s.showScaleDegrees)} />
        <Toggle label="Octave Numbers" desc="Show octave labels" checked={s.showOctaveNumbers} onChange={() => s.setShowOctaveNumbers(!s.showOctaveNumbers)} />
      </div>
      <Select label="Keyboard Layout" value={s.keyboardLayout} onChange={s.setKeyboardLayout}
        options={['qwerty','dvorak','colemak','azerty','qwertz','workman','norman','maltron']} />
      <Select label="Keyboard Skin" value={s.keyboardSkin} onChange={s.setKeyboardSkin}
        options={['default','minimal','retro','neon','glass','wood','metal','carbon','marble','leather']} />
      <Select label="Highlight Mode" value={s.keyHighlightMode} onChange={s.setKeyHighlightMode}
        options={['active','hover','scale-degree','note','finger','chord','none']} />
      <Select label="Color Scheme" value={s.keyColorScheme} onChange={s.setKeyColorScheme}
        options={['theme','rainbow','heatmap','velocity','custom','monochrome','accent']} />
      <div className="flex items-center gap-2 py-1">
        <span className="text-[0.6rem] text-white/50 w-24">Key Cap Color</span>
        <input type="color" value={s.keyCapColor} onChange={e => s.setKeyCapColor(e.target.value)} className="h-5 w-12 rounded cursor-pointer" />
        <span className="text-[0.6rem] text-white/50 ml-2 w-20">Stem Color</span>
        <input type="color" value={s.keyStemColor} onChange={e => s.setKeyStemColor(e.target.value)} className="h-5 w-12 rounded cursor-pointer" />
      </div>
    </div>
  );
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-slate-300 border-slate-500/40 bg-slate-500/10',
  rare: 'text-blue-300 border-blue-500/40 bg-blue-500/10',
  epic: 'text-violet-300 border-violet-500/40 bg-violet-500/15',
  legendary: 'text-amber-300 border-amber-500/40 bg-amber-500/15',
};

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
function HarmonyTab() {
  const [arpPattern, setArpPattern] = useState('up');
  const [arpSpeed, setArpSpeed] = useState(120);
  const [chordVoicing, setChordVoicing] = useState('close');
  const [harmonizeInterval, setHarmonizeInterval] = useState(3);
  const [autoHarmonize, setAutoHarmonize] = useState(false);
  const [chordTension, setChordTension] = useState(50);
  const [voiceLeading, setVoiceLeading] = useState(false);
  const [parallelMotion, setParallelMotion] = useState(false);
  const [chordSubstitution, setChordSubstitution] = useState(false);
  const [tritoneSubstitution, setTritoneSubstitution] = useState(false);
  const [modalMixture, setModalMixture] = useState(false);
  const [secondaryDominant, setSecondaryDominant] = useState(false);
  const [borrowed, setBorrowed] = useState(false);
  const [neapolitan, setNeapolitan] = useState(false);
  const [augmented6th, setAugmented6th] = useState(false);
  const [chordExtension, setChordExtension] = useState('triads');
  const [suspendMode, setSuspendMode] = useState(false);
  const [addedToneChords, setAddedToneChords] = useState(false);
  const [invertedChords, setInvertedChords] = useState(false);
  const [pedal, setPedal] = useState(false);
  const [pedalNote, setPedalNote] = useState('C');
  const [counterpoint, setCounterpoint] = useState(false);
  const [cantus, setCantus] = useState('soprano');
  const [speciesMode, setSpeciesMode] = useState('1st');

  return (
    <div className="space-y-2">
      <SectionLabel>Chord Voicing</SectionLabel>
      <Select label="Voicing Style" value={chordVoicing} onChange={setChordVoicing}
        options={['close','open','drop-2','drop-3','spread','quartal','cluster','shell']} />
      <Select label="Chord Extensions" value={chordExtension} onChange={setChordExtension}
        options={['triads','seventh','ninth','eleventh','thirteenth','suspended','added-tone','altered']} />
      <Slider label="Tension Level" value={chordTension} min={0} max={100} onChange={setChordTension} unit="%" />
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Voice Leading" desc="Smooth voice movement" checked={voiceLeading} onChange={() => setVoiceLeading(v=>!v)} />
        <Toggle label="Parallel Motion" desc="Allow parallel 5ths/8ths" checked={parallelMotion} onChange={() => setParallelMotion(v=>!v)} />
        <Toggle label="Inverted Chords" desc="Use chord inversions" checked={invertedChords} onChange={() => setInvertedChords(v=>!v)} />
        <Toggle label="Suspended Chords" desc="Sus2 / Sus4 voicings" checked={suspendMode} onChange={() => setSuspendMode(v=>!v)} />
        <Toggle label="Added Tone" desc="Add9, Add11 voicings" checked={addedToneChords} onChange={() => setAddedToneChords(v=>!v)} />
      </div>
      <SectionLabel>Harmonic Substitutions</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Chord Substitution" desc="Automatic chord subs" checked={chordSubstitution} onChange={() => setChordSubstitution(v=>!v)} />
        <Toggle label="Tritone Sub" desc="bII7 for V7" checked={tritoneSubstitution} onChange={() => setTritoneSubstitution(v=>!v)} />
        <Toggle label="Modal Mixture" desc="Borrow from parallel modes" checked={modalMixture} onChange={() => setModalMixture(v=>!v)} />
        <Toggle label="Secondary Dom." desc="V/V, V/ii etc." checked={secondaryDominant} onChange={() => setSecondaryDominant(v=>!v)} />
        <Toggle label="Borrowed Chords" desc="From parallel major/minor" checked={borrowed} onChange={() => setBorrowed(v=>!v)} />
        <Toggle label="Neapolitan" desc="♭II major chord" checked={neapolitan} onChange={() => setNeapolitan(v=>!v)} />
        <Toggle label="Augmented 6th" desc="It/Fr/Ger 6th chords" checked={augmented6th} onChange={() => setAugmented6th(v=>!v)} />
        <Toggle label="Auto Harmonize" desc="Auto add harmony notes" checked={autoHarmonize} onChange={() => setAutoHarmonize(v=>!v)} />
      </div>
      <Slider label="Harmonize Interval" value={harmonizeInterval} min={1} max={7} onChange={setHarmonizeInterval} unit="th" />
      <SectionLabel>Arpeggiator</SectionLabel>
      <Select label="Arp Pattern" value={arpPattern} onChange={setArpPattern}
        options={['up','down','up-down','down-up','random','converge','diverge','thumb','pinch','figure8','skip-1','skip-2','inside-out']} />
      <Slider label="Arp Speed" value={arpSpeed} min={40} max={300} onChange={setArpSpeed} unit="BPM" />
      <SectionLabel>Pedal & Counterpoint</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Pedal Tone" desc="Held bass pedal note" checked={pedal} onChange={() => setPedal(v=>!v)} />
        <Toggle label="Counterpoint" desc="Contrapuntal voice" checked={counterpoint} onChange={() => setCounterpoint(v=>!v)} />
      </div>
      {pedal && <Select label="Pedal Note" value={pedalNote} onChange={setPedalNote}
        options={['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']} />}
      {counterpoint && (
        <>
          <Select label="Cantus Firmus" value={cantus} onChange={setCantus} options={['soprano','alto','tenor','bass']} />
          <Select label="Species" value={speciesMode} onChange={setSpeciesMode} options={['1st','2nd','3rd','4th','5th','free']} />
        </>
      )}
      <SectionLabel>Cadences</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        {['Perfect Authentic','Imperfect Authentic','Plagal','Half','Deceptive','Phrygian','Lydian','Mixolydian'].map(c => (
          <div key={c} className="flex items-center gap-1 py-0.5">
            <div className="w-2 h-2 rounded-sm bg-violet-500/40 border border-violet-500/60" />
            <span className="text-[0.54rem] text-white/50">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Synth Tab ───────────────────────────────────────────────────────────────
function SynthTab() {
  const [oscType, setOscType] = useState('sawtooth');
  const [oscType2, setOscType2] = useState('sine');
  const [osc2Detune, setOsc2Detune] = useState(0);
  const [osc2Level, setOsc2Level] = useState(50);
  const [osc2Octave, setOsc2Octave] = useState(0);
  const [oscMix, setOscMix] = useState(50);
  const [filterType, setFilterType] = useState('lowpass');
  const [filterFreq, setFilterFreq] = useState(2000);
  const [filterQ, setFilterQ] = useState(1);
  const [filterGain, setFilterGain] = useState(0);
  const [filterEnvAmt, setFilterEnvAmt] = useState(0);
  const [ampAttack, setAmpAttack] = useState(10);
  const [ampDecay, setAmpDecay] = useState(200);
  const [ampSustain, setAmpSustain] = useState(70);
  const [ampRelease, setAmpRelease] = useState(300);
  const [filterAttack, setFilterAttack] = useState(10);
  const [filterDecay, setFilterDecay] = useState(200);
  const [filterSustain, setFilterSustain] = useState(50);
  const [filterRelease, setFilterRelease] = useState(300);
  const [lfoWave, setLfoWave] = useState('sine');
  const [lfoTarget, setLfoTarget] = useState('pitch');
  const [lfoRate, setLfoRate] = useState(4);
  const [lfoDepth, setLfoDepth] = useState(30);
  const [lfoSync, setLfoSync] = useState(false);
  const [lfo2Wave, setLfo2Wave] = useState('triangle');
  const [lfo2Target, setLfo2Target] = useState('filter');
  const [lfo2Rate, setLfo2Rate] = useState(0.5);
  const [lfo2Depth, setLfo2Depth] = useState(20);
  const [portamento, setPortamento] = useState(0);
  const [polyMono, setPolyMono] = useState('poly');
  const [unisonVoices, setUnisonVoices] = useState(1);
  const [unisonDetune, setUnisonDetune] = useState(10);
  const [unisonSpread, setUnisonSpread] = useState(50);
  const [subOscLevel, setSubOscLevel] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [velocitySens, setVelocitySens] = useState(50);
  const [pitchBendRange, setPitchBendRange] = useState(2);
  const [aftertouch, setAftertouch] = useState(false);
  const [keyTracking, setKeyTracking] = useState(100);
  const [envVelTracking, setEnvVelTracking] = useState(false);

  return (
    <div className="space-y-2">
      <SectionLabel>Oscillator 1</SectionLabel>
      <Select label="OSC1 Wave" value={oscType} onChange={setOscType}
        options={['sine','triangle','sawtooth','square','pulse','noise-white','noise-pink','super-saw','pwm','wavetable']} />
      <SectionLabel>Oscillator 2</SectionLabel>
      <Select label="OSC2 Wave" value={oscType2} onChange={setOscType2}
        options={['sine','triangle','sawtooth','square','pulse','noise-white','super-saw','off']} />
      <Slider label="OSC2 Detune" value={osc2Detune + 100} min={0} max={200} onChange={v => setOsc2Detune(v-100)} unit="¢" />
      <Slider label="OSC2 Level" value={osc2Level} min={0} max={100} onChange={setOsc2Level} unit="%" />
      <Select label="OSC2 Octave" value={String(osc2Octave)} onChange={v => setOsc2Octave(Number(v))}
        options={['-2','-1','0','1','2']} />
      <Slider label="OSC Mix" value={oscMix} min={0} max={100} onChange={setOscMix} unit="%" />
      <Slider label="Sub Osc Level" value={subOscLevel} min={0} max={100} onChange={setSubOscLevel} unit="%" />
      <Slider label="Noise Level" value={noiseLevel} min={0} max={100} onChange={setNoiseLevel} unit="%" />
      <SectionLabel>Filter</SectionLabel>
      <Select label="Filter Type" value={filterType} onChange={setFilterType}
        options={['lowpass','highpass','bandpass','notch','allpass','lowshelf','highshelf','peak','ladder','moog','comb']} />
      <Slider label="Cutoff" value={filterFreq} min={20} max={20000} onChange={setFilterFreq} unit="Hz" />
      <Slider label="Resonance" value={filterQ} min={0} max={30} onChange={setFilterQ} unit="Q" />
      <Slider label="Filter Gain" value={filterGain} min={-12} max={12} onChange={setFilterGain} unit="dB" />
      <Slider label="Env Amount" value={filterEnvAmt} min={-100} max={100} onChange={setFilterEnvAmt} unit="%" />
      <Slider label="Key Tracking" value={keyTracking} min={0} max={200} onChange={setKeyTracking} unit="%" />
      <SectionLabel>Amp Envelope</SectionLabel>
      <Slider label="Attack" value={ampAttack} min={0} max={5000} onChange={setAmpAttack} unit="ms" />
      <Slider label="Decay" value={ampDecay} min={0} max={5000} onChange={setAmpDecay} unit="ms" />
      <Slider label="Sustain" value={ampSustain} min={0} max={100} onChange={setAmpSustain} unit="%" />
      <Slider label="Release" value={ampRelease} min={0} max={10000} onChange={setAmpRelease} unit="ms" />
      <SectionLabel>Filter Envelope</SectionLabel>
      <Slider label="F.Attack" value={filterAttack} min={0} max={5000} onChange={setFilterAttack} unit="ms" />
      <Slider label="F.Decay" value={filterDecay} min={0} max={5000} onChange={setFilterDecay} unit="ms" />
      <Slider label="F.Sustain" value={filterSustain} min={0} max={100} onChange={setFilterSustain} unit="%" />
      <Slider label="F.Release" value={filterRelease} min={0} max={10000} onChange={setFilterRelease} unit="ms" />
      <SectionLabel>LFO 1</SectionLabel>
      <Select label="LFO1 Wave" value={lfoWave} onChange={setLfoWave}
        options={['sine','triangle','sawtooth','square','random','s&h','envelope']} />
      <Select label="LFO1 Target" value={lfoTarget} onChange={setLfoTarget}
        options={['pitch','filter','amp','pan','osc2-pitch','osc2-level','fx-depth','res','lfo2-rate']} />
      <Slider label="LFO1 Rate" value={lfoRate} min={0.01} max={30} onChange={setLfoRate} unit="Hz" />
      <Slider label="LFO1 Depth" value={lfoDepth} min={0} max={100} onChange={setLfoDepth} unit="%" />
      <Toggle label="LFO Sync to Tempo" desc="Sync LFO to song BPM" checked={lfoSync} onChange={() => setLfoSync(v=>!v)} />
      <SectionLabel>LFO 2</SectionLabel>
      <Select label="LFO2 Wave" value={lfo2Wave} onChange={setLfo2Wave}
        options={['sine','triangle','sawtooth','square','random','s&h']} />
      <Select label="LFO2 Target" value={lfo2Target} onChange={setLfo2Target}
        options={['pitch','filter','amp','pan','lfo1-rate','lfo1-depth','osc-mix','noise']} />
      <Slider label="LFO2 Rate" value={lfo2Rate} min={0.01} max={20} onChange={setLfo2Rate} unit="Hz" />
      <Slider label="LFO2 Depth" value={lfo2Depth} min={0} max={100} onChange={setLfo2Depth} unit="%" />
      <SectionLabel>Poly / Unison</SectionLabel>
      <Select label="Play Mode" value={polyMono} onChange={setPolyMono}
        options={['poly','mono','legato','duo','chord','unison','super']} />
      <Slider label="Portamento" value={portamento} min={0} max={2000} onChange={setPortamento} unit="ms" />
      <Slider label="Unison Voices" value={unisonVoices} min={1} max={8} onChange={setUnisonVoices} unit="×" />
      <Slider label="Unison Detune" value={unisonDetune} min={0} max={100} onChange={setUnisonDetune} unit="¢" />
      <Slider label="Unison Spread" value={unisonSpread} min={0} max={100} onChange={setUnisonSpread} unit="%" />
      <SectionLabel>Modulation</SectionLabel>
      <Slider label="Velocity Sens." value={velocitySens} min={0} max={100} onChange={setVelocitySens} unit="%" />
      <Slider label="Pitch Bend Range" value={pitchBendRange} min={1} max={24} onChange={setPitchBendRange} unit="st" />
      <Toggle label="Aftertouch" desc="Pressure-sensitive control" checked={aftertouch} onChange={() => setAftertouch(v=>!v)} />
      <Toggle label="Env Vel. Tracking" desc="Velocity controls envelope" checked={envVelTracking} onChange={() => setEnvVelTracking(v=>!v)} />
    </div>
  );
}

// ── Mixer Tab ───────────────────────────────────────────────────────────────
function MixerTab() {
  const [tracks] = useState(() => Array.from({length:8},(_,i)=>({
    name:`Track ${i+1}`, vol:80, pan:0, mute:false, solo:false, send1:0, send2:0
  })));
  const [masterVol, setMasterVol] = useState(85);
  const [masterPan, setMasterPan] = useState(0);
  const [limiterEnabled, setLimiterEnabled] = useState(true);
  const [limiterThreshold, setLimiterThreshold] = useState(-1);
  const [compressorEnabled, setCompressorEnabled] = useState(false);
  const [compThreshold, setCompThreshold] = useState(-24);
  const [compRatio, setCompRatio] = useState(4);
  const [compAttack, setCompAttack] = useState(5);
  const [compRelease, setCompRelease] = useState(50);
  const [compMakeup, setCompMakeup] = useState(0);
  const [sidechain, setSidechain] = useState(false);
  const [buses] = useState(['A','B','C','D']);
  const [selectedBus, setSelectedBus] = useState('A');
  const [busVol, setBusVol] = useState(80);
  const [send1Label, setSend1Label] = useState('Reverb Send');
  const [send2Label, setSend2Label] = useState('Delay Send');

  return (
    <div className="space-y-2">
      <SectionLabel>Master</SectionLabel>
      <Slider label="Master Volume" value={masterVol} min={0} max={100} onChange={setMasterVol} unit="%" />
      <Slider label="Master Pan" value={masterPan + 100} min={0} max={200} onChange={v=>setMasterPan(v-100)} unit="" />
      <SectionLabel>Master Dynamics</SectionLabel>
      <Toggle label="Limiter" desc="Hard limiter on master" checked={limiterEnabled} onChange={() => setLimiterEnabled(v=>!v)} />
      {limiterEnabled && <Slider label="Limit Threshold" value={limiterThreshold+20} min={0} max={20} onChange={v=>setLimiterThreshold(v-20)} unit="dB" />}
      <Toggle label="Compressor" desc="Master bus compressor" checked={compressorEnabled} onChange={() => setCompressorEnabled(v=>!v)} />
      {compressorEnabled && (<>
        <Slider label="Threshold" value={compThreshold+60} min={0} max={60} onChange={v=>setCompThreshold(v-60)} unit="dB" />
        <Slider label="Ratio" value={compRatio} min={1} max={20} onChange={setCompRatio} unit=":1" />
        <Slider label="Attack" value={compAttack} min={1} max={100} onChange={setCompAttack} unit="ms" />
        <Slider label="Release" value={compRelease} min={10} max={1000} onChange={setCompRelease} unit="ms" />
        <Slider label="Makeup" value={compMakeup} min={0} max={24} onChange={setCompMakeup} unit="dB" />
        <Toggle label="Sidechain" desc="External sidechain input" checked={sidechain} onChange={() => setSidechain(v=>!v)} />
      </>)}
      <SectionLabel>Aux Buses</SectionLabel>
      <div className="flex gap-1 mb-2">
        {buses.map(b=>(
          <button key={b} onClick={()=>setSelectedBus(b)}
            className={cn('flex-1 py-0.5 rounded-lg text-[0.52rem] border transition-all',
              selectedBus===b?'bg-cyan-500/25 border-cyan-500/50 text-cyan-200':'bg-white/05 border-white/08 text-white/40 hover:text-white/60')}>
            Bus {b}
          </button>
        ))}
      </div>
      <Slider label={`Bus ${selectedBus} Volume`} value={busVol} min={0} max={100} onChange={setBusVol} unit="%" />
      <SectionLabel>Sends</SectionLabel>
      <div className="flex gap-1 mb-1">
        <span className="text-[0.52rem] text-white/40 flex-1">{send1Label}</span>
        <span className="text-[0.52rem] text-white/40 flex-1">{send2Label}</span>
      </div>
      {tracks.map((t,i)=>(
        <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/03 border border-white/06">
          <span className="text-[0.5rem] text-white/40 w-12 shrink-0 truncate">{t.name}</span>
          <div className="flex-1"><input type="range" min={0} max={100} defaultValue={t.send1} className="w-full cursor-pointer accent-cyan-500 h-1" /></div>
          <div className="flex-1"><input type="range" min={0} max={100} defaultValue={t.send2} className="w-full cursor-pointer accent-pink-500 h-1" /></div>
        </div>
      ))}
    </div>
  );
}

// ── MIDI Tab ─────────────────────────────────────────────────────────────────
function MidiTab() {
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [midiInput, setMidiInput] = useState('none');
  const [midiOutput, setMidiOutput] = useState('none');
  const [midiChannel, setMidiChannel] = useState(1);
  const [midiThru, setMidiThru] = useState(false);
  const [midiClock, setMidiClock] = useState(false);
  const [midiTransport, setMidiTransport] = useState(false);
  const [velocityMin, setVelocityMin] = useState(1);
  const [velocityMax, setVelocityMax] = useState(127);
  const [velocityCurve, setVelocityCurve] = useState('linear');
  const [noteOffset, setNoteOffset] = useState(0);
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [sustainPedal, setSustainPedal] = useState(true);
  const [sostenutoPedal, setSostenutoPedal] = useState(false);
  const [softPedal, setSoftPedal] = useState(false);
  const [expressionCC, setExpressionCC] = useState(11);
  const [modulationCC, setModulationCC] = useState(1);
  const [pitchBendMidi, setPitchBendMidi] = useState(true);
  const [aftertouchMidi, setAftertouchMidi] = useState(false);
  const [midiLearn, setMidiLearn] = useState(false);
  const [midiMap, setMidiMap] = useState('default');
  const [sysexEnabled, setSysexEnabled] = useState(false);
  const [midiSync, setMidiSync] = useState('none');
  const [clockOutput, setClockOutput] = useState(false);
  const [midiPanic, setMidiPanic] = useState(false);

  return (
    <div className="space-y-2">
      <SectionLabel>MIDI Setup</SectionLabel>
      <Toggle label="Enable MIDI" desc="Connect external MIDI devices" checked={midiEnabled} onChange={() => setMidiEnabled(v=>!v)} />
      <Select label="MIDI Input" value={midiInput} onChange={setMidiInput}
        options={['none','USB MIDI 1','USB MIDI 2','Bluetooth MIDI','Virtual MIDI','IAC Driver']} />
      <Select label="MIDI Output" value={midiOutput} onChange={setMidiOutput}
        options={['none','USB MIDI 1','USB MIDI 2','Bluetooth MIDI','Virtual MIDI','Synth Module']} />
      <Select label="MIDI Channel" value={String(midiChannel)} onChange={v=>setMidiChannel(Number(v))}
        options={['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','all']} />
      <SectionLabel>MIDI Filters & Routing</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="MIDI Thru" desc="Pass MIDI data through" checked={midiThru} onChange={() => setMidiThru(v=>!v)} />
        <Toggle label="MIDI Clock" desc="Sync to MIDI clock" checked={midiClock} onChange={() => setMidiClock(v=>!v)} />
        <Toggle label="Transport" desc="MMC transport control" checked={midiTransport} onChange={() => setMidiTransport(v=>!v)} />
        <Toggle label="Clock Output" desc="Send MIDI clock out" checked={clockOutput} onChange={() => setClockOutput(v=>!v)} />
        <Toggle label="Pitch Bend" desc="Respond to pitch bend" checked={pitchBendMidi} onChange={() => setPitchBendMidi(v=>!v)} />
        <Toggle label="Aftertouch" desc="Channel/poly aftertouch" checked={aftertouchMidi} onChange={() => setAftertouchMidi(v=>!v)} />
        <Toggle label="Sustain Pedal" desc="CC64 sustain" checked={sustainPedal} onChange={() => setSustainPedal(v=>!v)} />
        <Toggle label="Sostenuto Pedal" desc="CC66 sostenuto" checked={sostenutoPedal} onChange={() => setSostenutoPedal(v=>!v)} />
        <Toggle label="Soft Pedal" desc="CC67 soft pedal" checked={softPedal} onChange={() => setSoftPedal(v=>!v)} />
        <Toggle label="SysEx" desc="System exclusive messages" checked={sysexEnabled} onChange={() => setSysexEnabled(v=>!v)} />
        <Toggle label="MIDI Learn" desc="Map controls to MIDI CCs" checked={midiLearn} onChange={() => setMidiLearn(v=>!v)} />
      </div>
      <SectionLabel>Velocity & Mapping</SectionLabel>
      <Slider label="Velocity Min" value={velocityMin} min={1} max={127} onChange={setVelocityMin} unit="" />
      <Slider label="Velocity Max" value={velocityMax} min={1} max={127} onChange={setVelocityMax} unit="" />
      <Select label="Velocity Curve" value={velocityCurve} onChange={setVelocityCurve}
        options={['linear','exp1','exp2','log','fixed-soft','fixed-medium','fixed-hard','custom']} />
      <Slider label="Note Offset" value={noteOffset+64} min={0} max={128} onChange={v=>setNoteOffset(v-64)} unit="st" />
      <Slider label="Octave Offset" value={octaveOffset+3} min={0} max={6} onChange={v=>setOctaveOffset(v-3)} unit="oct" />
      <SectionLabel>CC Assignments</SectionLabel>
      <Slider label="Expression CC" value={expressionCC} min={0} max={127} onChange={setExpressionCC} unit="" />
      <Slider label="Modulation CC" value={modulationCC} min={0} max={127} onChange={setModulationCC} unit="" />
      <Select label="MIDI Map" value={midiMap} onChange={setMidiMap}
        options={['default','general-midi','gm2','xg','gs','custom-1','custom-2','custom-3']} />
      <Select label="Sync Mode" value={midiSync} onChange={setMidiSync}
        options={['none','midi-clock','ableton-link','ltc','smpte']} />
    </div>
  );
}

// ── Looper Tab ───────────────────────────────────────────────────────────────
function LooperTab() {
  const [loopLength, setLoopLength] = useState(4);
  const [loopOverdub, setLoopOverdub] = useState(false);
  const [loopHalfSpeed, setLoopHalfSpeed] = useState(false);
  const [loopReverse, setLoopReverse] = useState(false);
  const [loopFadeIn, setLoopFadeIn] = useState(0);
  const [loopFadeOut, setLoopFadeOut] = useState(0);
  const [loopQuantize, setLoopQuantize] = useState('bar');
  const [loopSlots, setLoopSlots] = useState(4);
  const [loopSync, setLoopSync] = useState(true);
  const [loopUndo, setLoopUndo] = useState(true);
  const [activeSlot, setActiveSlot] = useState(0);
  const [loopFeedback, setLoopFeedback] = useState(100);
  const [loopPitch, setLoopPitch] = useState(0);
  const [loopTune, setLoopTune] = useState(0);
  const [slipMode, setSlipMode] = useState(false);
  const [slipAmount, setSlipAmount] = useState(0);
  const [loopFx, setLoopFx] = useState(false);
  const [autoRecord, setAutoRecord] = useState(false);
  const [countIn, setCountIn] = useState(1);
  const [loopExport, setLoopExport] = useState('wav');

  return (
    <div className="space-y-2">
      <SectionLabel>Loop Configuration</SectionLabel>
      <Slider label="Loop Length (bars)" value={loopLength} min={1} max={64} onChange={setLoopLength} unit=" bars" />
      <Slider label="Active Slots" value={loopSlots} min={1} max={8} onChange={setLoopSlots} unit=" slots" />
      <Select label="Quantize" value={loopQuantize} onChange={setLoopQuantize}
        options={['free','beat','bar','2-bars','4-bars','8-bars','16-bars']} />
      <Slider label="Count-In Bars" value={countIn} min={0} max={4} onChange={setCountIn} unit=" bars" />
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Sync to Tempo" desc="Lock loop to BPM" checked={loopSync} onChange={() => setLoopSync(v=>!v)} />
        <Toggle label="Overdub" desc="Layer recordings" checked={loopOverdub} onChange={() => setLoopOverdub(v=>!v)} />
        <Toggle label="Half Speed" desc="Play at 50% speed" checked={loopHalfSpeed} onChange={() => setLoopHalfSpeed(v=>!v)} />
        <Toggle label="Reverse" desc="Play loop backwards" checked={loopReverse} onChange={() => setLoopReverse(v=>!v)} />
        <Toggle label="Undo/Redo" desc="Undo last overdub" checked={loopUndo} onChange={() => setLoopUndo(v=>!v)} />
        <Toggle label="Auto Record" desc="Auto-start on key press" checked={autoRecord} onChange={() => setAutoRecord(v=>!v)} />
        <Toggle label="Slip Mode" desc="Slip loop timing" checked={slipMode} onChange={() => setSlipMode(v=>!v)} />
        <Toggle label="Loop FX" desc="Apply FX to loop playback" checked={loopFx} onChange={() => setLoopFx(v=>!v)} />
      </div>
      <SectionLabel>Loop Slots</SectionLabel>
      <div className="grid grid-cols-4 gap-1">
        {Array.from({length:loopSlots},(_,i)=>(
          <button key={i} onClick={()=>setActiveSlot(i)}
            className={cn('h-10 rounded-xl border-2 text-[0.5rem] font-bold transition-all flex flex-col items-center justify-center',
              activeSlot===i?'bg-pink-500/25 border-pink-500/60 text-pink-200':'bg-white/04 border-white/08 text-white/30 hover:border-white/20')}>
            <span>Slot {i+1}</span>
            <span className="text-[0.4rem] opacity-50">empty</span>
          </button>
        ))}
      </div>
      <SectionLabel>Loop Modulation</SectionLabel>
      <Slider label="Feedback" value={loopFeedback} min={0} max={100} onChange={setLoopFeedback} unit="%" />
      <Slider label="Pitch Shift" value={loopPitch+24} min={0} max={48} onChange={v=>setLoopPitch(v-24)} unit="st" />
      <Slider label="Fine Tune" value={loopTune+100} min={0} max={200} onChange={v=>setLoopTune(v-100)} unit="¢" />
      {slipMode && <Slider label="Slip Amount" value={slipAmount+500} min={0} max={1000} onChange={v=>setSlipAmount(v-500)} unit="ms" />}
      <SectionLabel>Crossfades</SectionLabel>
      <Slider label="Fade In" value={loopFadeIn} min={0} max={500} onChange={setLoopFadeIn} unit="ms" />
      <Slider label="Fade Out" value={loopFadeOut} min={0} max={500} onChange={setLoopFadeOut} unit="ms" />
      <SectionLabel>Export</SectionLabel>
      <Select label="Export Format" value={loopExport} onChange={setLoopExport}
        options={['wav','mp3','flac','ogg','aiff','midi']} />
    </div>
  );
}

// ── Trainer Tab ──────────────────────────────────────────────────────────────
function TrainerTab() {
  const s = useStore();
  const [trainingPlan, setTrainingPlan] = useState('balanced');
  const [sessionsPerWeek, setSessionsPerWeek] = useState(5);
  const [sessionDuration, setSessionDuration] = useState(15);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(true);
  const [progressiveOverload, setProgressiveOverload] = useState(true);
  const [weakKeyFocus, setWeakKeyFocus] = useState(true);
  const [weakBigramFocus, setWeakBigramFocus] = useState(false);
  const [weakTrigramFocus, setWeakTrigramFocus] = useState(false);
  const [handBalance, setHandBalance] = useState(false);
  const [fingerIndependence, setFingerIndependence] = useState(false);
  const [rhythmDrills, setRhythmDrills] = useState(false);
  const [burstTraining, setBurstTraining] = useState(false);
  const [burstLength, setBurstLength] = useState(10);
  const [errorAnalysis, setErrorAnalysis] = useState(true);
  const [keyHeatmap, setKeyHeatmap] = useState(true);
  const [fingerHeatmap, setFingerHeatmap] = useState(false);
  const [bigramAnalysis, setBigramAnalysis] = useState(false);
  const [wpmGraph, setWpmGraph] = useState(true);
  const [accGraph, setAccGraph] = useState(true);
  const [personalRecord, setPersonalRecord] = useState(true);
  const [coachMode, setCoachMode] = useState(false);
  const [coachLevel, setCoachLevel] = useState('encouraging');
  const [intervalTraining, setIntervalTraining] = useState(false);
  const [workInterval, setWorkInterval] = useState(25);
  const [restInterval, setRestInterval] = useState(5);
  const [certificationMode, setCertificationMode] = useState(false);
  const [certLevel, setCertLevel] = useState('basic');
  const [typingTest, setTypingTest] = useState('1min');
  const [textDifficulty, setTextDifficulty] = useState('medium');
  const [languageFocus, setLanguageFocus] = useState('english');
  const [numberRowDrills, setNumberRowDrills] = useState(false);
  const [symbolDrills, setSymbolDrills] = useState(false);
  const [numpadDrills, setNumpadDrills] = useState(false);
  const [fKeyDrills, setFKeyDrills] = useState(false);
  const [shortcutDrills, setShortcutDrills] = useState(false);

  return (
    <div className="space-y-2">
      <SectionLabel>Training Plan</SectionLabel>
      <Select label="Training Focus" value={trainingPlan} onChange={setTrainingPlan}
        options={['balanced','speed','accuracy','endurance','beginner','intermediate','advanced','pro','custom']} />
      <Select label="Test Duration" value={typingTest} onChange={setTypingTest}
        options={['15sec','30sec','1min','2min','3min','5min','10min','15min','custom']} />
      <Select label="Text Difficulty" value={textDifficulty} onChange={setTextDifficulty}
        options={['beginner','easy','medium','hard','expert','programming','scientific','literary','custom']} />
      <Select label="Language Focus" value={languageFocus} onChange={setLanguageFocus}
        options={['english','spanish','french','german','japanese','chinese','arabic','hindi','portuguese','russian']} />
      <Slider label="Sessions/Week" value={sessionsPerWeek} min={1} max={14} onChange={setSessionsPerWeek} unit=" days" />
      <Slider label="Session Length" value={sessionDuration} min={5} max={120} onChange={setSessionDuration} unit=" min" />
      <SectionLabel>Adaptive Training</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Adaptive Difficulty" desc="Auto-adjust challenge level" checked={adaptiveDifficulty} onChange={() => setAdaptiveDifficulty(v=>!v)} />
        <Toggle label="Progressive Overload" desc="Gradually increase demands" checked={progressiveOverload} onChange={() => setProgressiveOverload(v=>!v)} />
        <Toggle label="Weak Key Focus" desc="Drill slowest keys" checked={weakKeyFocus} onChange={() => setWeakKeyFocus(v=>!v)} />
        <Toggle label="Weak Bigrams" desc="Drill slow key pairs" checked={weakBigramFocus} onChange={() => setWeakBigramFocus(v=>!v)} />
        <Toggle label="Weak Trigrams" desc="Drill slow key triples" checked={weakTrigramFocus} onChange={() => setWeakTrigramFocus(v=>!v)} />
        <Toggle label="Hand Balance" desc="Balance left/right hand" checked={handBalance} onChange={() => setHandBalance(v=>!v)} />
        <Toggle label="Finger Independence" desc="Isolate finger exercises" checked={fingerIndependence} onChange={() => setFingerIndependence(v=>!v)} />
        <Toggle label="Rhythm Drills" desc="Even rhythm training" checked={rhythmDrills} onChange={() => setRhythmDrills(v=>!v)} />
        <Toggle label="Burst Training" desc="Short intense speed bursts" checked={burstTraining} onChange={() => setBurstTraining(v=>!v)} />
        <Toggle label="Interval Training" desc="Work/rest cycle training" checked={intervalTraining} onChange={() => setIntervalTraining(v=>!v)} />
      </div>
      {burstTraining && <Slider label="Burst Length (words)" value={burstLength} min={5} max={50} onChange={setBurstLength} unit=" words" />}
      {intervalTraining && (<>
        <Slider label="Work Interval" value={workInterval} min={5} max={60} onChange={setWorkInterval} unit=" min" />
        <Slider label="Rest Interval" value={restInterval} min={1} max={30} onChange={setRestInterval} unit=" min" />
      </>)}
      <SectionLabel>Specialized Drills</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Number Row" desc="0-9 row drills" checked={numberRowDrills} onChange={() => setNumberRowDrills(v=>!v)} />
        <Toggle label="Symbols" desc="!@#$%^&* drills" checked={symbolDrills} onChange={() => setSymbolDrills(v=>!v)} />
        <Toggle label="Numpad" desc="Numeric keypad drills" checked={numpadDrills} onChange={() => setNumpadDrills(v=>!v)} />
        <Toggle label="Function Keys" desc="F1-F12 key drills" checked={fKeyDrills} onChange={() => setFKeyDrills(v=>!v)} />
        <Toggle label="Shortcut Drills" desc="Common OS shortcuts" checked={shortcutDrills} onChange={() => setShortcutDrills(v=>!v)} />
      </div>
      <SectionLabel>AI Coach</SectionLabel>
      <Toggle label="Coach Mode" desc="AI-powered typing coach" checked={coachMode} onChange={() => setCoachMode(v=>!v)} />
      {coachMode && <Select label="Coach Personality" value={coachLevel} onChange={setCoachLevel}
        options={['encouraging','strict','analytical','gamified','silent','humorous','motivational']} />}
      <SectionLabel>Analytics</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Error Analysis" desc="Detailed error breakdown" checked={errorAnalysis} onChange={() => setErrorAnalysis(v=>!v)} />
        <Toggle label="Key Heatmap" desc="Visual key frequency map" checked={keyHeatmap} onChange={() => setKeyHeatmap(v=>!v)} />
        <Toggle label="Finger Heatmap" desc="Finger workload distribution" checked={fingerHeatmap} onChange={() => setFingerHeatmap(v=>!v)} />
        <Toggle label="Bigram Analysis" desc="Common pair errors" checked={bigramAnalysis} onChange={() => setBigramAnalysis(v=>!v)} />
        <Toggle label="WPM Graph" desc="Speed over time chart" checked={wpmGraph} onChange={() => setWpmGraph(v=>!v)} />
        <Toggle label="Accuracy Graph" desc="Accuracy over time" checked={accGraph} onChange={() => setAccGraph(v=>!v)} />
        <Toggle label="Personal Records" desc="Track PRs and bests" checked={personalRecord} onChange={() => setPersonalRecord(v=>!v)} />
      </div>
      <SectionLabel>Certification</SectionLabel>
      <Toggle label="Certification Mode" desc="Official typing tests" checked={certificationMode} onChange={() => setCertificationMode(v=>!v)} />
      {certificationMode && <Select label="Cert Level" value={certLevel} onChange={setCertLevel}
        options={['basic','intermediate','advanced','professional','expert','master']} />}
    </div>
  );
}

// ── AI Tab ────────────────────────────────────────────────────────────────────
function AITab() {
  const s = useStore();
  const [aiModel, setAiModel] = useState('gpt-4');
  const [aiPersonality, setAiPersonality] = useState('helpful');
  const [aiLanguage, setAiLanguage] = useState('english');
  const [aiWordSuggestions, setAiWordSuggestions] = useState(false);
  const [aiTextGen, setAiTextGen] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState(false);
  const [aiErrorPrediction, setAiErrorPrediction] = useState(false);
  const [aiMusicGen, setAiMusicGen] = useState(false);
  const [aiChordSug, setAiChordSug] = useState(false);
  const [aiMelodyComp, setAiMelodyComp] = useState(false);
  const [aiRhythmAnaly, setAiRhythmAnaly] = useState(false);
  const [aiSentiment, setAiSentiment] = useState(false);
  const [aiAutoMode, setAiAutoMode] = useState(false);
  const [aiContextLen, setAiContextLen] = useState(100);
  const [aiCreativity, setAiCreativity] = useState(50);
  const [aiPrecision, setAiPrecision] = useState(80);
  const [aiFeedback, setAiFeedback] = useState(false);
  const [aiCoach, setAiCoach] = useState(false);
  const [aiTranscribe, setAiTranscribe] = useState(false);
  const [aiTranslate, setAiTranslate] = useState(false);
  const [aiSummarize, setAiSummarize] = useState(false);
  const [aiStyleMatch, setAiStyleMatch] = useState(false);
  const [aiTone, setAiTone] = useState('neutral');
  const [aiPrivacy, setAiPrivacy] = useState('local');
  const [streamResponse, setStreamResponse] = useState(true);

  return (
    <div className="space-y-2">
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-2.5 mb-2">
        <div className="text-[0.62rem] text-sky-300 font-semibold">🤖 AI-Powered Features</div>
        <div className="text-[0.52rem] text-sky-300/70 mt-0.5">Machine learning enhances your typing and music experience.</div>
      </div>
      <SectionLabel>AI Engine</SectionLabel>
      <Select label="AI Model" value={aiModel} onChange={setAiModel}
        options={['gpt-4','gpt-3.5','claude-3','gemini-pro','llama-3','mistral','phi-3','local-model','custom']} />
      <Select label="Personality" value={aiPersonality} onChange={setAiPersonality}
        options={['helpful','strict','creative','analytical','playful','professional','minimal']} />
      <Select label="Response Tone" value={aiTone} onChange={setAiTone}
        options={['neutral','encouraging','technical','casual','formal','humorous']} />
      <Select label="Language" value={aiLanguage} onChange={setAiLanguage}
        options={['english','spanish','french','german','japanese','chinese','hindi','arabic','portuguese']} />
      <Select label="Privacy Mode" value={aiPrivacy} onChange={setAiPrivacy}
        options={['local','anonymized','full-cloud','opt-out']} />
      <Slider label="Context Length" value={aiContextLen} min={10} max={500} onChange={setAiContextLen} unit=" tokens" />
      <Toggle label="Stream Responses" desc="Live streaming AI output" checked={streamResponse} onChange={() => setStreamResponse(v=>!v)} />
      <SectionLabel>Typing AI</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Word Suggestions" desc="Predictive word completion" checked={aiWordSuggestions} onChange={() => setAiWordSuggestions(v=>!v)} />
        <Toggle label="Text Generator" desc="AI-generated practice text" checked={aiTextGen} onChange={() => setAiTextGen(v=>!v)} />
        <Toggle label="Adaptive Difficulty" desc="AI adjusts challenge level" checked={aiDifficulty} onChange={() => setAiDifficulty(v=>!v)} />
        <Toggle label="Error Prediction" desc="Predict likely mistakes" checked={aiErrorPrediction} onChange={() => setAiErrorPrediction(v=>!v)} />
        <Toggle label="AI Feedback" desc="Personalized typing tips" checked={aiFeedback} onChange={() => setAiFeedback(v=>!v)} />
        <Toggle label="AI Coach" desc="Live coaching overlay" checked={aiCoach} onChange={() => setAiCoach(v=>!v)} />
        <Toggle label="Transcription" desc="Speech-to-text typing" checked={aiTranscribe} onChange={() => setAiTranscribe(v=>!v)} />
        <Toggle label="Auto Mode Switch" desc="AI picks best typing mode" checked={aiAutoMode} onChange={() => setAiAutoMode(v=>!v)} />
        <Toggle label="Sentiment Analysis" desc="Detect text emotion" checked={aiSentiment} onChange={() => setAiSentiment(v=>!v)} />
        <Toggle label="Style Matching" desc="Match author writing style" checked={aiStyleMatch} onChange={() => setAiStyleMatch(v=>!v)} />
        <Toggle label="Translation" desc="Live text translation" checked={aiTranslate} onChange={() => setAiTranslate(v=>!v)} />
        <Toggle label="Summarization" desc="Condense long passages" checked={aiSummarize} onChange={() => setAiSummarize(v=>!v)} />
      </div>
      <SectionLabel>Music AI</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Music Generation" desc="AI composes melodies" checked={aiMusicGen} onChange={() => setAiMusicGen(v=>!v)} />
        <Toggle label="Chord Suggestions" desc="AI chord progressions" checked={aiChordSug} onChange={() => setAiChordSug(v=>!v)} />
        <Toggle label="Melody Completion" desc="Complete your melody" checked={aiMelodyComp} onChange={() => setAiMelodyComp(v=>!v)} />
        <Toggle label="Rhythm Analysis" desc="Analyze typing rhythm patterns" checked={aiRhythmAnaly} onChange={() => setAiRhythmAnaly(v=>!v)} />
      </div>
      <SectionLabel>AI Creativity</SectionLabel>
      <Slider label="Creativity / Temperature" value={aiCreativity} min={0} max={100} onChange={setAiCreativity} unit="%" />
      <Slider label="Precision / Top-P" value={aiPrecision} min={0} max={100} onChange={setAiPrecision} unit="%" />
    </div>
  );
}

// ── Cloud Tab ─────────────────────────────────────────────────────────────────
function CloudTab() {
  const [cloudSync, setCloudSync] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupInterval, setBackupInterval] = useState(24);
  const [syncSettings, setSyncSettings] = useState(false);
  const [syncStats, setSyncStats] = useState(false);
  const [syncRecordings, setSyncRecordings] = useState(false);
  const [syncPresets, setSyncPresets] = useState(false);
  const [syncAchievements, setSyncAchievements] = useState(false);
  const [conflictResolution, setConflictResolution] = useState('ask');
  const [compression, setCompression] = useState(true);
  const [encryption, setEncryption] = useState(true);
  const [encryptionType, setEncryptionType] = useState('AES-256');
  const [provider, setProvider] = useState('replit');
  const [crossDevice, setCrossDevice] = useState(false);
  const [offlineFirst, setOfflineFirst] = useState(true);
  const [deltaSync, setDeltaSync] = useState(true);
  const [maxStorage, setMaxStorage] = useState(500);
  const [sharePresets, setSharePresets] = useState(false);
  const [shareRecordings, setShareRecordings] = useState(false);
  const [collaborative, setCollaborative] = useState(false);
  const [liveSync, setLiveSync] = useState(false);
  const [versionHistory, setVersionHistory] = useState(true);
  const [versionCount, setVersionCount] = useState(10);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [cdn, setCdn] = useState(false);

  return (
    <div className="space-y-2">
      <SectionLabel>Cloud Storage</SectionLabel>
      <Toggle label="Enable Cloud Sync" desc="Sync data across devices" checked={cloudSync} onChange={() => setCloudSync(v=>!v)} />
      <Select label="Cloud Provider" value={provider} onChange={setProvider}
        options={['replit','google-drive','dropbox','onedrive','icloud','s3','custom']} />
      <Toggle label="Auto Backup" desc="Automatically backup data" checked={autoBackup} onChange={() => setAutoBackup(v=>!v)} />
      <Slider label="Backup Interval" value={backupInterval} min={1} max={168} onChange={setBackupInterval} unit="h" />
      <Slider label="Max Storage (MB)" value={maxStorage} min={50} max={10000} onChange={setMaxStorage} unit=" MB" />
      <SectionLabel>Sync Options</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Sync Settings" desc="All app settings" checked={syncSettings} onChange={() => setSyncSettings(v=>!v)} />
        <Toggle label="Sync Stats" desc="WPM, accuracy history" checked={syncStats} onChange={() => setSyncStats(v=>!v)} />
        <Toggle label="Sync Recordings" desc="Audio recordings" checked={syncRecordings} onChange={() => setSyncRecordings(v=>!v)} />
        <Toggle label="Sync Presets" desc="Sound & visual presets" checked={syncPresets} onChange={() => setSyncPresets(v=>!v)} />
        <Toggle label="Sync Achievements" desc="XP and achievements" checked={syncAchievements} onChange={() => setSyncAchievements(v=>!v)} />
        <Toggle label="Cross-Device" desc="Multi-device access" checked={crossDevice} onChange={() => setCrossDevice(v=>!v)} />
        <Toggle label="Offline First" desc="Work offline by default" checked={offlineFirst} onChange={() => setOfflineFirst(v=>!v)} />
        <Toggle label="Delta Sync" desc="Only sync changes" checked={deltaSync} onChange={() => setDeltaSync(v=>!v)} />
      </div>
      <Select label="Conflict Resolution" value={conflictResolution} onChange={setConflictResolution}
        options={['ask','local-wins','cloud-wins','newest-wins','merge','manual']} />
      <SectionLabel>Security</SectionLabel>
      <Toggle label="Encryption" desc="Encrypt synced data" checked={encryption} onChange={() => setEncryption(v=>!v)} />
      {encryption && <Select label="Encryption Type" value={encryptionType} onChange={setEncryptionType}
        options={['AES-128','AES-256','ChaCha20','RSA-4096']} />}
      <Toggle label="Compression" desc="Compress before upload" checked={compression} onChange={() => setCompression(v=>!v)} />
      <SectionLabel>Collaboration</SectionLabel>
      <Toggle label="Share Presets" desc="Publicly share presets" checked={sharePresets} onChange={() => setSharePresets(v=>!v)} />
      <Toggle label="Share Recordings" desc="Publicly share recordings" checked={shareRecordings} onChange={() => setShareRecordings(v=>!v)} />
      <Toggle label="Collaborative Mode" desc="Real-time co-typing" checked={collaborative} onChange={() => setCollaborative(v=>!v)} />
      <Toggle label="Live Sync" desc="Real-time sync across sessions" checked={liveSync} onChange={() => setLiveSync(v=>!v)} />
      <SectionLabel>Version History</SectionLabel>
      <Toggle label="Version History" desc="Keep previous versions" checked={versionHistory} onChange={() => setVersionHistory(v=>!v)} />
      {versionHistory && <Slider label="Versions to Keep" value={versionCount} min={3} max={50} onChange={setVersionCount} unit=" versions" />}
      <Toggle label="CDN Acceleration" desc="Faster via CDN" checked={cdn} onChange={() => setCdn(v=>!v)} />
      <Toggle label="Webhooks" desc="HTTP notifications on sync" checked={webhookEnabled} onChange={() => setWebhookEnabled(v=>!v)} />
    </div>
  );
}

// ── Privacy Tab ──────────────────────────────────────────────────────────────
function PrivacyTab() {
  const [analytics, setAnalytics] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [telemetry, setTelemetry] = useState(false);
  const [trackingProtection, setTrackingProtection] = useState(true);
  const [cookieConsent, setCookieConsent] = useState('essential');
  const [dataSharing, setDataSharing] = useState(false);
  const [anonymizeData, setAnonymizeData] = useState(true);
  const [doNotTrack, setDoNotTrack] = useState(true);
  const [fingerprinting, setFingerprinting] = useState(false);
  const [thirdPartyFonts, setThirdPartyFonts] = useState(true);
  const [cdnResources, setCdnResources] = useState(true);
  const [sessionStorage, setSessionStorage] = useState(true);
  const [localStorageEnabled, setLocalStorageEnabled] = useState(true);
  const [indexedDbEnabled, setIndexedDbEnabled] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [micAccess, setMicAccess] = useState(false);
  const [notifAccess, setNotifAccess] = useState(false);
  const [dataRetention, setDataRetention] = useState(90);
  const [autoDelete, setAutoDelete] = useState(false);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [exportData, setExportData] = useState(false);
  const [gdprMode, setGdprMode] = useState(false);

  return (
    <div className="space-y-2">
      <SectionLabel>Data Collection</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Usage Analytics" desc="App usage statistics" checked={analytics} onChange={() => setAnalytics(v=>!v)} />
        <Toggle label="Crash Reports" desc="Automatic error reports" checked={crashReports} onChange={() => setCrashReports(v=>!v)} />
        <Toggle label="Telemetry" desc="Performance telemetry" checked={telemetry} onChange={() => setTelemetry(v=>!v)} />
        <Toggle label="Data Sharing" desc="Share with third parties" checked={dataSharing} onChange={() => setDataSharing(v=>!v)} />
        <Toggle label="Anonymize Data" desc="Remove personal identifiers" checked={anonymizeData} onChange={() => setAnonymizeData(v=>!v)} />
        <Toggle label="Do Not Track" desc="Send DNT header" checked={doNotTrack} onChange={() => setDoNotTrack(v=>!v)} />
        <Toggle label="Tracking Protection" desc="Block tracking scripts" checked={trackingProtection} onChange={() => setTrackingProtection(v=>!v)} />
        <Toggle label="Fingerprinting" desc="Allow fingerprinting" checked={fingerprinting} onChange={() => setFingerprinting(v=>!v)} />
        <Toggle label="GDPR Mode" desc="Full GDPR compliance" checked={gdprMode} onChange={() => setGdprMode(v=>!v)} />
      </div>
      <Select label="Cookie Consent" value={cookieConsent} onChange={setCookieConsent}
        options={['essential','functional','analytics','marketing','all']} />
      <SectionLabel>Permissions</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Location" desc="Geolocation access" checked={locationAccess} onChange={() => setLocationAccess(v=>!v)} />
        <Toggle label="Camera" desc="Webcam access" checked={cameraAccess} onChange={() => setCameraAccess(v=>!v)} />
        <Toggle label="Microphone" desc="Audio input access" checked={micAccess} onChange={() => setMicAccess(v=>!v)} />
        <Toggle label="Notifications" desc="Push notifications" checked={notifAccess} onChange={() => setNotifAccess(v=>!v)} />
        <Toggle label="Third-Party Fonts" desc="Load Google Fonts etc." checked={thirdPartyFonts} onChange={() => setThirdPartyFonts(v=>!v)} />
        <Toggle label="CDN Resources" desc="External CDN assets" checked={cdnResources} onChange={() => setCdnResources(v=>!v)} />
      </div>
      <SectionLabel>Storage</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Session Storage" desc="Browser session store" checked={sessionStorage} onChange={() => setSessionStorage(v=>!v)} />
        <Toggle label="Local Storage" desc="Browser local store" checked={localStorageEnabled} onChange={() => setLocalStorageEnabled(v=>!v)} />
        <Toggle label="IndexedDB" desc="Large data storage" checked={indexedDbEnabled} onChange={() => setIndexedDbEnabled(v=>!v)} />
        <Toggle label="Auto Delete Data" desc="Delete after retention period" checked={autoDelete} onChange={() => setAutoDelete(v=>!v)} />
      </div>
      <Slider label="Data Retention (days)" value={dataRetention} min={1} max={365} onChange={setDataRetention} unit=" days" />
      <SectionLabel>Security</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Incognito Mode" desc="No data saved locally" checked={incognitoMode} onChange={() => setIncognitoMode(v=>!v)} />
        <Toggle label="Password Protect" desc="Require password to open" checked={passwordProtect} onChange={() => setPasswordProtect(v=>!v)} />
        <Toggle label="Two-Factor Auth" desc="Require 2FA to access" checked={twoFactor} onChange={() => setTwoFactor(v=>!v)} />
        <Toggle label="Export My Data" desc="Download all your data" checked={exportData} onChange={() => setExportData(v=>!v)} />
      </div>
      <Slider label="Session Timeout" value={sessionTimeout} min={5} max={480} onChange={setSessionTimeout} unit=" min" />
    </div>
  );
}

// ── Pro Tab ───────────────────────────────────────────────────────────────────
function ProTab() {
  const s = useStore();
  const [proMode, setProMode] = useState(false);
  const [rawInputCapture, setRawInputCapture] = useState(false);
  const [keystrokeLogging, setKeystrokeLogging] = useState(false);
  const [apiAccess, setApiAccess] = useState(false);
  const [webhookOut, setWebhookOut] = useState(false);
  const [csvExport, setCsvExport] = useState(false);
  const [jsonExport, setJsonExport] = useState(false);
  const [pdfReport, setPdfReport] = useState(false);
  const [embedMode, setEmbedMode] = useState(false);
  const [customDomain, setCustomDomain] = useState(false);
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [multiUser, setMultiUser] = useState(false);
  const [roleAccess, setRoleAccess] = useState('admin');
  const [auditLog, setAuditLog] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [ssoProvider, setSsoProvider] = useState('google');
  const [ldapEnabled, setLdapEnabled] = useState(false);
  const [apiRateLimit, setApiRateLimit] = useState(1000);
  const [prioritySupport, setPrioritySupport] = useState(false);
  const [customPlugins, setCustomPlugins] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [debugOverlay, setDebugOverlay] = useState(false);
  const [stateInspector, setStateInspector] = useState(false);
  const [perfProfiler, setPerfProfiler] = useState(false);
  const [networkMonitor, setNetworkMonitor] = useState(false);
  const [consoleEnabled, setConsoleEnabled] = useState(false);
  const [pluginSandbox, setPluginSandbox] = useState(false);
  const [remoteConfig, setRemoteConfig] = useState(false);
  const [featureFlags, setFeatureFlags] = useState(false);
  const [abTesting, setAbTesting] = useState(false);

  return (
    <div className="space-y-2">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 mb-2">
        <div className="text-[0.62rem] text-amber-300 font-semibold">⭐ Pro Features</div>
        <div className="text-[0.52rem] text-amber-300/70 mt-0.5">Advanced features for power users and teams.</div>
      </div>
      <SectionLabel>Pro Mode</SectionLabel>
      <Toggle label="Pro Mode" desc="Unlock all pro features" checked={proMode} onChange={() => setProMode(v=>!v)} />
      <Toggle label="Developer Mode" desc="Advanced debug tools" checked={developerMode} onChange={() => setDeveloperMode(v=>!v)} />
      <Toggle label="Raw Input Capture" desc="Bypass key rebinding" checked={rawInputCapture} onChange={() => setRawInputCapture(v=>!v)} />
      <Toggle label="Keystroke Logging" desc="Log all keypresses" checked={keystrokeLogging} onChange={() => setKeystrokeLogging(v=>!v)} />
      <SectionLabel>API & Integration</SectionLabel>
      <Toggle label="API Access" desc="REST API endpoints" checked={apiAccess} onChange={() => setApiAccess(v=>!v)} />
      <Slider label="API Rate Limit" value={apiRateLimit} min={100} max={10000} onChange={setApiRateLimit} unit="/hr" />
      <Toggle label="Webhooks" desc="HTTP POST on events" checked={webhookOut} onChange={() => setWebhookOut(v=>!v)} />
      <Toggle label="Remote Config" desc="Remote feature flags" checked={remoteConfig} onChange={() => setRemoteConfig(v=>!v)} />
      <Toggle label="Feature Flags" desc="Toggle features remotely" checked={featureFlags} onChange={() => setFeatureFlags(v=>!v)} />
      <Toggle label="A/B Testing" desc="Split-test UI changes" checked={abTesting} onChange={() => setAbTesting(v=>!v)} />
      <SectionLabel>Export & Reports</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="CSV Export" desc="Export data to CSV" checked={csvExport} onChange={() => setCsvExport(v=>!v)} />
        <Toggle label="JSON Export" desc="Export data to JSON" checked={jsonExport} onChange={() => setJsonExport(v=>!v)} />
        <Toggle label="PDF Reports" desc="Generate PDF reports" checked={pdfReport} onChange={() => setPdfReport(v=>!v)} />
        <Toggle label="Embed Mode" desc="Embed in websites" checked={embedMode} onChange={() => setEmbedMode(v=>!v)} />
        <Toggle label="Custom Domain" desc="Use own domain" checked={customDomain} onChange={() => setCustomDomain(v=>!v)} />
        <Toggle label="White Label" desc="Remove UK Aurora branding" checked={whiteLabel} onChange={() => setWhiteLabel(v=>!v)} />
      </div>
      <SectionLabel>Teams & Access</SectionLabel>
      <Toggle label="Multi-User" desc="Team access management" checked={multiUser} onChange={() => setMultiUser(v=>!v)} />
      {multiUser && <Select label="Your Role" value={roleAccess} onChange={setRoleAccess}
        options={['viewer','contributor','editor','admin','owner']} />}
      <Toggle label="Audit Log" desc="Track all user actions" checked={auditLog} onChange={() => setAuditLog(v=>!v)} />
      <Toggle label="SSO / OAuth" desc="Single sign-on" checked={ssoEnabled} onChange={() => setSsoEnabled(v=>!v)} />
      {ssoEnabled && <Select label="SSO Provider" value={ssoProvider} onChange={setSsoProvider}
        options={['google','microsoft','github','okta','auth0','saml','ldap']} />}
      <Toggle label="LDAP" desc="Directory integration" checked={ldapEnabled} onChange={() => setLdapEnabled(v=>!v)} />
      <Toggle label="Priority Support" desc="Dedicated support channel" checked={prioritySupport} onChange={() => setPrioritySupport(v=>!v)} />
      <SectionLabel>Debug Tools</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Debug Overlay" desc="On-screen debug info" checked={debugOverlay} onChange={() => setDebugOverlay(v=>!v)} />
        <Toggle label="State Inspector" desc="View Zustand state" checked={stateInspector} onChange={() => setStateInspector(v=>!v)} />
        <Toggle label="Perf Profiler" desc="Component render timing" checked={perfProfiler} onChange={() => setPerfProfiler(v=>!v)} />
        <Toggle label="Network Monitor" desc="HTTP request inspector" checked={networkMonitor} onChange={() => setNetworkMonitor(v=>!v)} />
        <Toggle label="Console" desc="In-app JS console" checked={consoleEnabled} onChange={() => setConsoleEnabled(v=>!v)} />
        <Toggle label="Plugin Sandbox" desc="Test custom plugins" checked={pluginSandbox} onChange={() => setPluginSandbox(v=>!v)} />
        <Toggle label="Custom Plugins" desc="Load external plugins" checked={customPlugins} onChange={() => setCustomPlugins(v=>!v)} />
      </div>
    </div>
  );
}

// ── Shortcuts2 Tab ────────────────────────────────────────────────────────────
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

// ── Gamify Tab ────────────────────────────────────────────────────────────────
function GamifyTab() {
  const s = useStore();
  const [rpgMode, setRpgMode] = useState(false);
  const [characterClass, setCharacterClass] = useState('wizard');
  const [expMultiplier, setExpMultiplier] = useState(1.0);
  const [lootDrops, setLootDrops] = useState(false);
  const [bossEncounters, setBossEncounters] = useState(false);
  const [questSystem, setQuestSystem] = useState(false);
  const [guildMode, setGuildMode] = useState(false);
  const [pvpMode, setPvpMode] = useState(false);
  const [leaderboard, setLeaderboard] = useState(false);
  const [globalLeaderboard, setGlobalLeaderboard] = useState(false);
  const [seasonalRanking, setSeasonalRanking] = useState(false);
  const [rankDisplay, setRankDisplay] = useState(true);
  const [rankStyle, setRankStyle] = useState('bronze-silver-gold');
  const [comboSystem, setComboSystem] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1.5);
  const [comboTimeout, setComboTimeout] = useState(3000);
  const [soundEffectOnLevel, setSoundEffectOnLevel] = useState(true);
  const [levelUpAnimation, setLevelUpAnimation] = useState(true);
  const [xpBoostEnabled, setXpBoostEnabled] = useState(false);
  const [xpBoostAmount, setXpBoostAmount] = useState(1.5);
  const [streakBonus, setStreakBonus] = useState(true);
  const [streakMultiplier, setStreakMultiplier] = useState(1.2);
  const [miniGames, setMiniGames] = useState(false);
  const [hiddenAchievements, setHiddenAchievements] = useState(true);
  const [secretModes, setSecretModes] = useState(false);
  const [easterEggs, setEasterEggs] = useState(true);
  const [deckBuilder, setDeckBuilder] = useState(false);
  const [skins, setSkins] = useState(true);

  return (
    <div className="space-y-2">
      <SectionLabel>RPG System</SectionLabel>
      <Toggle label="RPG Mode" desc="Full RPG progression system" checked={rpgMode} onChange={() => setRpgMode(v=>!v)} />
      {rpgMode && <>
        <Select label="Character Class" value={characterClass} onChange={setCharacterClass}
          options={['wizard','warrior','rogue','archer','bard','monk','paladin','necromancer','druid','alchemist']} />
        <Toggle label="Loot Drops" desc="Items drop on milestone" checked={lootDrops} onChange={() => setLootDrops(v=>!v)} />
        <Toggle label="Boss Encounters" desc="Special boss typing challenges" checked={bossEncounters} onChange={() => setBossEncounters(v=>!v)} />
        <Toggle label="Quest System" desc="Daily and story quests" checked={questSystem} onChange={() => setQuestSystem(v=>!v)} />
        <Toggle label="Guild Mode" desc="Join typing guilds" checked={guildMode} onChange={() => setGuildMode(v=>!v)} />
        <Toggle label="Deck Builder" desc="Card-based power-ups" checked={deckBuilder} onChange={() => setDeckBuilder(v=>!v)} />
      </>}
      <SectionLabel>Multiplier & Combo</SectionLabel>
      <Toggle label="Combo System" desc="Chain correct keys for combos" checked={comboSystem} onChange={() => setComboSystem(v=>!v)} />
      {comboSystem && <>
        <Slider label="Combo Multiplier" value={comboMultiplier * 10} min={10} max={50} onChange={v => setComboMultiplier(v/10)} unit="×" />
        <Slider label="Combo Timeout" value={comboTimeout} min={500} max={10000} onChange={setComboTimeout} unit="ms" />
      </>}
      <Slider label="XP Multiplier" value={expMultiplier * 10} min={10} max={50} onChange={v => setExpMultiplier(v/10)} unit="×" />
      <Toggle label="XP Boost" desc="Temporary XP boost" checked={xpBoostEnabled} onChange={() => setXpBoostEnabled(v=>!v)} />
      {xpBoostEnabled && <Slider label="Boost Amount" value={xpBoostAmount * 10} min={10} max={50} onChange={v => setXpBoostAmount(v/10)} unit="×" />}
      <Toggle label="Streak Bonus" desc="XP bonus for streaks" checked={streakBonus} onChange={() => setStreakBonus(v=>!v)} />
      {streakBonus && <Slider label="Streak Multiplier" value={streakMultiplier * 10} min={10} max={30} onChange={v => setStreakMultiplier(v/10)} unit="×" />}
      <SectionLabel>Competition</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="PvP Mode" desc="Race other players" checked={pvpMode} onChange={() => setPvpMode(v=>!v)} />
        <Toggle label="Leaderboard" desc="Local leaderboard" checked={leaderboard} onChange={() => setLeaderboard(v=>!v)} />
        <Toggle label="Global Rankings" desc="Worldwide ranking" checked={globalLeaderboard} onChange={() => setGlobalLeaderboard(v=>!v)} />
        <Toggle label="Seasonal Rank" desc="Season-based ranking" checked={seasonalRanking} onChange={() => setSeasonalRanking(v=>!v)} />
        <Toggle label="Show Rank Badge" desc="Display rank in UI" checked={rankDisplay} onChange={() => setRankDisplay(v=>!v)} />
      </div>
      <Select label="Rank Style" value={rankStyle} onChange={setRankStyle}
        options={['bronze-silver-gold','iron-diamond','wood-grandmaster','emoji','numbers','letters','tiers']} />
      <SectionLabel>Secrets & Fun</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Mini Games" desc="Unlockable mini games" checked={miniGames} onChange={() => setMiniGames(v=>!v)} />
        <Toggle label="Hidden Achievements" desc="Surprise unlockables" checked={hiddenAchievements} onChange={() => setHiddenAchievements(v=>!v)} />
        <Toggle label="Secret Modes" desc="Hidden typing modes" checked={secretModes} onChange={() => setSecretModes(v=>!v)} />
        <Toggle label="Easter Eggs" desc="Hidden surprises" checked={easterEggs} onChange={() => setEasterEggs(v=>!v)} />
        <Toggle label="Keyboard Skins" desc="Cosmetic key skins" checked={skins} onChange={() => setSkins(v=>!v)} />
      </div>
      <SectionLabel>Notifications</SectionLabel>
      <Toggle label="Level Up Animation" desc="Celebrate level-ups" checked={levelUpAnimation} onChange={() => setLevelUpAnimation(v=>!v)} />
      <Toggle label="Sound on Level Up" desc="Play fanfare sound" checked={soundEffectOnLevel} onChange={() => setSoundEffectOnLevel(v=>!v)} />
    </div>
  );
}

// ── Tips Tab ──────────────────────────────────────────────────────────────────
function TipsTab() {
  const [showTips, setShowTips] = useState(true);
  const [tipFrequency, setTipFrequency] = useState('session');
  const [tipCategory, setTipCategory] = useState('all');
  const [beginnerTips, setBeginnerTips] = useState(true);
  const [advancedTips, setAdvancedTips] = useState(true);
  const [musicTips, setMusicTips] = useState(true);
  const [typingTips, setTypingTips] = useState(true);
  const [shortcutTips, setShortcutTips] = useState(true);
  const [proTips, setProTips] = useState(false);
  const [dismissedTips] = useState<string[]>([]);
  const [tipPosition, setTipPosition] = useState('bottom');
  const [tipDuration, setTipDuration] = useState(5000);
  const [tipAnimation, setTipAnimation] = useState('fade');
  const [interactiveTips, setInteractiveTips] = useState(false);
  const [tipSound, setTipSound] = useState(false);
  const [contextualTips, setContextualTips] = useState(true);
  const [tipLanguage, setTipLanguage] = useState('english');

  const TIPS = [
    { cat:'Typing', text:'Keep your fingers on the home row (ASDF JKL;) for maximum speed.' },
    { cat:'Typing', text:'Look at the screen, not your keyboard. Blind typing is 40% faster.' },
    { cat:'Typing', text:'Practice accuracy first — speed follows naturally.' },
    { cat:'Typing', text:'Try the Pomodoro technique: 25 min focus, 5 min break.' },
    { cat:'Music', text:'Press keys rhythmically to create musical patterns!' },
    { cat:'Music', text:'Try chord mode and press multiple keys simultaneously.' },
    { cat:'Music', text:'The BPM slider controls metronome and arpeggio speed.' },
    { cat:'Music', text:'Change the scale in Musical settings to compose in any key.' },
    { cat:'Shortcuts', text:'Press Ctrl+K to open the command palette.' },
    { cat:'Shortcuts', text:'Press F1 anytime to see all keyboard shortcuts.' },
    { cat:'Shortcuts', text:'Ctrl+R resets your current session.' },
    { cat:'Pro', text:'Enable Ghost Mode to type without seeing your text — brutal training.' },
    { cat:'Pro', text:'Combine Blind Mode with a timer for maximum challenge.' },
    { cat:'Pro', text:'The FX2 tab has a 7-band EQ for precise sound shaping.' },
    { cat:'Pro', text:'Record your typing session and play it back as music!' },
    { cat:'Beginner', text:'Start with the Free Mode to get comfortable with the keyboard.' },
    { cat:'Beginner', text:'The difficulty presets (Easy/Normal/Hard/Expert) adjust text complexity.' },
    { cat:'Beginner', text:'Check Achievements to see your progress milestones.' },
  ];

  const filteredTips = TIPS.filter(t => tipCategory === 'all' || t.cat === tipCategory);

  return (
    <div className="space-y-2">
      <SectionLabel>Tip Settings</SectionLabel>
      <Toggle label="Show Tips" desc="Display contextual tips" checked={showTips} onChange={() => setShowTips(v=>!v)} />
      <Select label="Tip Frequency" value={tipFrequency} onChange={setTipFrequency}
        options={['always','session','daily','weekly','never']} />
      <Select label="Tip Position" value={tipPosition} onChange={setTipPosition}
        options={['bottom','top','left','right','center','toast']} />
      <Select label="Animation" value={tipAnimation} onChange={setTipAnimation}
        options={['fade','slide','bounce','none']} />
      <Select label="Tip Language" value={tipLanguage} onChange={setTipLanguage}
        options={['english','spanish','french','german','japanese','hindi','arabic']} />
      <Slider label="Tip Duration" value={tipDuration} min={1000} max={15000} onChange={setTipDuration} unit="ms" />
      <SectionLabel>Tip Categories</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2">
        <Toggle label="Typing Tips" checked={typingTips} onChange={() => setTypingTips(v=>!v)} />
        <Toggle label="Music Tips" checked={musicTips} onChange={() => setMusicTips(v=>!v)} />
        <Toggle label="Shortcut Tips" checked={shortcutTips} onChange={() => setShortcutTips(v=>!v)} />
        <Toggle label="Beginner Tips" checked={beginnerTips} onChange={() => setBeginnerTips(v=>!v)} />
        <Toggle label="Advanced Tips" checked={advancedTips} onChange={() => setAdvancedTips(v=>!v)} />
        <Toggle label="Pro Tips" checked={proTips} onChange={() => setProTips(v=>!v)} />
        <Toggle label="Interactive Tips" desc="Click-through tutorials" checked={interactiveTips} onChange={() => setInteractiveTips(v=>!v)} />
        <Toggle label="Contextual Tips" desc="Tips based on current mode" checked={contextualTips} onChange={() => setContextualTips(v=>!v)} />
        <Toggle label="Tip Sound" desc="Play sound with tips" checked={tipSound} onChange={() => setTipSound(v=>!v)} />
      </div>
      <SectionLabel>Browse Tips</SectionLabel>
      <div className="flex flex-wrap gap-1 mb-2">
        {['all','Typing','Music','Shortcuts','Pro','Beginner'].map(c => (
          <button key={c} onClick={() => setTipCategory(c)}
            className={cn('px-2 py-0.5 rounded-lg text-[0.5rem] border transition-all',
              tipCategory===c?'bg-yellow-500/25 border-yellow-500/50 text-yellow-200':'bg-white/05 border-white/08 text-white/40 hover:text-white/60')}>
            {c}
          </button>
        ))}
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
        {filteredTips.map((tip, i) => (
          <div key={i} className="flex gap-2 p-2 rounded-xl bg-yellow-500/08 border border-yellow-500/20">
            <span className="text-yellow-400 text-sm shrink-0">💡</span>
            <div>
              <span className="text-[0.44rem] text-yellow-400/60 uppercase">{tip.cat}</span>
              <p className="text-[0.55rem] text-white/70 leading-relaxed">{tip.text}</p>
            </div>
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
      case 'harmony': return <HarmonyTab />;
      case 'synth': return <SynthTab />;
      case 'mixer': return <MixerTab />;
      case 'midi': return <MidiTab />;
      case 'looper': return <LooperTab />;
      case 'interface': return <InterfaceTab />;
      case 'layout': return <LayoutTab />;
      case 'accessibility': return <AccessibilityTab />;
      case 'performance': return <PerformanceTab />;
      case 'challenges': return <ChallengesTab />;
      case 'trainer': return <TrainerTab />;
      case 'ai': return <AITab />;
      case 'cloud': return <CloudTab />;
      case 'privacy': return <PrivacyTab />;
      case 'pro': return <ProTab />;
      case 'shortcuts2': return <Shortcuts2Tab />;
      case 'gamify': return <GamifyTab />;
      case 'tips': return <TipsTab />;
      case 'social': return <SocialTab />;
      case 'labs': return <LabsTab />;
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
