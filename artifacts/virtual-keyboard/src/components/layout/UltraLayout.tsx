import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore, APP_THEMES } from '@/store';
import { cn } from '@/lib/utils';
import { MOTIVATIONAL_QUOTES } from '@/lib/content';
import { Keyboard } from '@/components/keyboard/Keyboard';
import { InteractionArea } from '@/components/ui/InteractionArea';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import { NoteVisualizer } from '@/components/ui/NoteVisualizer';
import { AchievementToast } from '@/components/ui/AchievementToast';
import { WelcomeModal } from '@/components/ui/WelcomeModal';
import { SettingsPanel } from './SettingsPanel';
import { StatsBar } from './StatsBar';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CommandPalette } from './CommandPalette';
import { PomodoroWidget } from './PomodoroWidget';
import { ShortcutsOverlay } from './ShortcutsOverlay';
import { getLevelInfo } from '@/lib/achievements';
const logoImg = '/uk-aurora-logo.png';
import {
  Settings, X, Play, Pause, Square, Circle, Repeat,
  Volume2, VolumeX, BarChart2, Command, Focus,
  Flame, Zap, Trophy, Keyboard as KeyboardIcon,
  Music, Shuffle, RotateCcw, Eye, EyeOff, Wifi, WifiOff, Save,
  Mic2, Sparkles, Wand2, Layers,
  HelpCircle, Target, Music2, Bolt, Ghost, Shield, Dices,
  ChevronDown, ChevronUp, Star, Activity, TrendingUp, Hash, Clock,
  Cpu, Timer, Gauge, Radio, Headphones, SlidersHorizontal,
  Moon, Sun, Maximize, Minimize, Bell, BellOff, Upload, Lock,
  PanelLeftOpen, PanelLeftClose, MoreHorizontal, Grid3X3, List,
  Check, Plus, Minus, RefreshCw, Download, Share2, Copy, Search,
  ArrowUp, ArrowDown, SkipForward, Rewind, FastForward,
  AlignCenter, Book, Code, Brain, Globe, Award, Map, Coffee, Smile,
} from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────────────────
function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}
function getSeasonalHoliday(): string | null {
  const now = new Date(); const m = now.getMonth(); const d = now.getDate();
  if (m === 9) return 'halloween';
  if (m === 11) return 'christmas';
  if (m === 0 && d <= 15) return 'new-year';
  if (m === 1 && d >= 10 && d <= 18) return 'valentines';
  if (m === 10 && d >= 20) return 'thanksgiving';
  return null;
}
function getDailyQuote(): string {
  const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return MOTIVATIONAL_QUOTES[doy % MOTIVATIONAL_QUOTES.length] || '';
}
function formatTime(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const THEME_CLASSES: Record<string, string> = Object.fromEntries(APP_THEMES.map(t => [t.id, `theme-${t.id}`]));

const SEASON_EMOJI: Record<string, string> = {
  spring: '🌸', summer: '☀️', autumn: '🍂', winter: '❄️',
  halloween: '🎃', christmas: '🎄', valentines: '💝', 'new-year': '🎉',
  diwali: '🪔', thanksgiving: '🦃',
};

const QUICK_MODES = [
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
] as const;

function useLayout() {
  const [layout, setLayout] = useState<'desktop' | 'mobile'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < 1024 && window.innerHeight < 500 ? 'mobile' : 'desktop';
  });
  useEffect(() => {
    const fn = () => setLayout(window.innerWidth < 1024 && window.innerHeight < 500 ? 'mobile' : 'desktop');
    window.addEventListener('resize', fn);
    window.addEventListener('orientationchange', fn);
    return () => { window.removeEventListener('resize', fn); window.removeEventListener('orientationchange', fn); };
  }, []);
  return layout;
}

// ── Root Layout ──────────────────────────────────────────────────────────────
export function UltraLayout() {
  const theme = useStore(s => s.theme);
  const highContrast = useStore(s => s.highContrast);
  const reduceMotion = useStore(s => s.reduceMotion);
  const focusMode = useStore(s => s.focusMode);
  const cursorStyle = useStore(s => s.cursorStyle);
  const typingFont = useStore(s => s.typingFont);
  const performanceMode = useStore(s => s.performanceMode);
  const autoPerformanceMode = useStore(s => s.autoPerformanceMode);
  const setPerformanceMode = useStore(s => s.setPerformanceMode);
  const blindTypingMode = useStore(s => s.blindTypingMode);
  const layout = useLayout();

  useEffect(() => { document.documentElement.classList.toggle('blind-typing', blindTypingMode); }, [blindTypingMode]);
  useEffect(() => {
    const root = document.documentElement;
    Object.values(THEME_CLASSES).forEach(cls => root.classList.remove(cls));
    root.classList.add(THEME_CLASSES[theme] || 'theme-aurora');
  }, [theme]);
  useEffect(() => {
    if (autoPerformanceMode && layout === 'mobile') setPerformanceMode(true);
  }, [autoPerformanceMode, layout, setPerformanceMode]);

  const fontClass = typingFont === 'sans' ? 'font-typing-sans' : typingFont === 'retro' ? 'font-typing-retro' : 'font-typing-mono';
  const cursorClass = cursorStyle === 'block' ? 'cursor-block' : cursorStyle === 'underscore' ? 'cursor-underscore' : '';
  const effectivePerf = performanceMode || (autoPerformanceMode && layout === 'mobile');

  return (
    <div className={cn(
      'flex-1 w-full flex workspace-bg relative overflow-hidden',
      THEME_CLASSES[theme] || 'theme-aurora',
      highContrast && 'high-contrast',
      reduceMotion && 'reduce-motion',
      focusMode && 'focus-mode',
      effectivePerf && 'perf-mode',
      fontClass, cursorClass,
    )}>
      <div className="absolute inset-0 z-0 workspace-gradient" />
      <BackgroundEffects />
      <NoteVisualizer />
      <div className="relative z-10 flex w-full h-full min-h-0">
        {layout === 'mobile' ? <NexusMobileLayout /> : <NexusDesktopLayout />}
      </div>
      <AchievementToast />
      <WelcomeModal />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NEXUS DESKTOP LAYOUT — Completely new design
// ════════════════════════════════════════════════════════════════════════════
function NexusDesktopLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [keyboardOnly, setKeyboardOnly] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>('typing');
  const store = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); }
      if (e.key === 'F1') { e.preventDefault(); setShortcutsOpen(v => !v); }
      if (e.key === 'Escape') { setCmdOpen(false); setShortcutsOpen(false); }
      if (ctrl && e.shiftKey && e.key === 'F') { e.preventDefault(); store.setFocusMode(!store.focusMode); }
      if (ctrl && e.shiftKey && e.key === 'A') { e.preventDefault(); setAnalyticsOpen(v => !v); }
      if (ctrl && e.key === 'r') { e.preventDefault(); store.resetTyping(); }
      if (ctrl && e.shiftKey && e.key === 'P') { e.preventDefault(); store.setPerformanceMode(!store.performanceMode); }
      if (ctrl && e.key === 'p') { e.preventDefault(); store.setPomodoroEnabled(!store.pomodoroEnabled); }
      if (ctrl && e.key === 'e') { e.preventDefault(); store.exportSettings(); }
      if (ctrl && e.key === 'g') { e.preventDefault(); store.setGhostMode(!store.ghostMode); }
      if (ctrl && e.shiftKey && e.key === 'B') { e.preventDefault(); store.setBlindTypingMode(!store.blindTypingMode); }
      if (ctrl && e.shiftKey && e.key === 'D') { e.preventDefault(); store.setDailyChallengeMode(!store.dailyChallengeMode); }
      if (ctrl && e.key === '1') { e.preventDefault(); store.setTypingMode('free'); }
      if (ctrl && e.key === '2') { e.preventDefault(); store.setTypingMode('word'); }
      if (ctrl && e.key === '3') { e.preventDefault(); store.setTypingMode('timed'); }
      if (ctrl && e.key === '4') { e.preventDefault(); store.setTypingMode('sprint'); }
      if (ctrl && e.key === '5') { e.preventDefault(); store.setTypingMode('lesson'); }
      if (ctrl && e.key === '6') { e.preventDefault(); store.setTypingMode('code'); }
      if (ctrl && e.shiftKey && e.key === 'R') { e.preventDefault(); store.isRecording ? store.stopRecording() : store.startRecording(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* ── Nexus Top Bar ── */}
      <NexusTopBar
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        sidebarOpen={sidebarOpen}
      />

      {/* ── Main Row ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Settings Sidebar */}
        <NexusSidebar
          open={sidebarOpen}
          activeTab={settingsTab}
          onTabChange={setSettingsTab}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Center Content */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {!keyboardOnly && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <InteractionArea />
            </div>
          )}
          {keyboardOnly && <div className="flex-1 min-h-0" />}
          <div className="shrink-0">
            <Keyboard />
          </div>
        </div>

        {/* Right Analytics Panel */}
        <div className={cn(
          'flex-shrink-0 h-full border-l border-white/07 bg-black/40 backdrop-blur-2xl transition-all duration-300 overflow-hidden',
          analyticsOpen ? 'w-[300px]' : 'w-0 border-l-0'
        )}>
          {analyticsOpen && (
            <div className="flex flex-col h-full w-[300px]">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/07 shrink-0">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[0.62rem] font-bold text-white/70 uppercase tracking-wider">Analytics</span>
                </div>
                <button onClick={() => setAnalyticsOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/08 text-white/40 hover:text-white transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
                <AnalyticsDashboard />
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Overlays */}
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
      {shortcutsOpen && <ShortcutsOverlay onClose={() => setShortcutsOpen(false)} />}
    </div>
  );
}

// ── Nexus Top Bar — simplified: Logo + Stats + Settings toggle ────────────────
function NexusTopBar({
  onToggleSidebar, sidebarOpen,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
  const { wpm, accuracy, errors, xp, dailyStreak, isRecording } = useStore();
  const { current: lvlInfo } = getLevelInfo(xp);
  const accColor = accuracy >= 97 ? '#4ade80' : accuracy >= 85 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex items-center h-11 border-b border-white/07 bg-black/50 backdrop-blur-xl shrink-0 px-3 gap-3">

      {/* Logo + Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <img src={logoImg} alt="UK Aurora" className="w-7 h-7 rounded-xl object-contain" />
        <div className="leading-none">
          <div className="text-[0.58rem] font-black text-white/90 tracking-wide">UK AURORA</div>
          <div className="text-[0.36rem] text-violet-300/60 uppercase tracking-widest">Ultra Premium v5</div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 shrink-0" />

      {/* Stats Strip */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
        <TopStat label="WPM" value={wpm} color="text-violet-300" />
        <TopStat label="ACC" value={`${accuracy}%`} color={accColor} />
        <TopStat label="ERR" value={errors} color={errors > 5 ? 'text-red-400' : 'text-white/40'} />
        <TopStat label="LV" value={lvlInfo.level} color="text-amber-300" />
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/04 border border-white/07 shrink-0">
          <Flame className="w-2.5 h-2.5 text-amber-400" />
          <span className="text-[0.55rem] font-bold text-amber-300">{dailyStreak}</span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/15 border border-red-500/40 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
            <span className="text-[0.48rem] text-red-400 font-bold">REC</span>
          </div>
        )}
      </div>

      {/* Settings toggle */}
      <button onClick={onToggleSidebar} title="Toggle Settings"
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[0.56rem] font-semibold transition-all shrink-0',
          sidebarOpen
            ? 'bg-violet-500/25 border-violet-500/50 text-violet-300'
            : 'bg-white/05 border-white/10 text-white/50 hover:text-white hover:border-white/25'
        )}>
        <Settings className="w-3.5 h-3.5" />
        Settings
      </button>
    </div>
  );
}

// ── Nexus Sidebar ─────────────────────────────────────────────────────────────
const SIDEBAR_CATEGORIES = [
  {
    id: 'controls', label: 'Controls', icon: SlidersHorizontal, color: '#8b5cf6',
    tabs: ['controls'],
  },
  {
    id: 'core', label: 'Core', icon: KeyboardIcon, color: '#a78bfa',
    tabs: ['typing', 'audio', 'fx', 'fx2'],
  },
  {
    id: 'visual', label: 'Visual', icon: Sparkles, color: '#e879f9',
    tabs: ['visual', 'vfx', 'keyboard'],
  },
  {
    id: 'music', label: 'Music', icon: Music, color: '#fb7185',
    tabs: ['musical', 'harmony', 'synth', 'mixer', 'midi', 'looper'],
  },
  {
    id: 'interface', label: 'Interface', icon: Eye, color: '#2dd4bf',
    tabs: ['interface', 'layout'],
  },
  {
    id: 'access', label: 'Access', icon: Shield, color: '#4ade80',
    tabs: ['accessibility', 'performance'],
  },
  {
    id: 'gamify', label: 'Game', icon: Trophy, color: '#fb923c',
    tabs: ['challenges', 'achievements'],
  },
  {
    id: 'system', label: 'System', icon: Bolt, color: '#fbbf24',
    tabs: ['shortcuts2', 'social', 'tips'],
  },
  {
    id: 'data', label: 'Data', icon: Save, color: '#818cf8',
    tabs: ['presets', 'recordings'],
  },
] as const;

function NexusSidebar({ open, activeTab, onTabChange, onClose }: {
  open: boolean; activeTab: string; onTabChange: (tab: string) => void; onClose: () => void;
}) {
  const [activeCat, setActiveCat] = useState<string>(() => {
    const found = SIDEBAR_CATEGORIES.find(c => (c.tabs as readonly string[]).includes(activeTab));
    return found?.id || 'controls';
  });
  const { xp, dailyStreak, bestWpm, isRecording } = useStore();
  const { current: lvlInfo, progress } = getLevelInfo(xp);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    const found = SIDEBAR_CATEGORIES.find(c => (c.tabs as readonly string[]).includes(activeTab));
    if (found) setActiveCat(found.id);
  }, [activeTab]);

  const activeCatData = SIDEBAR_CATEGORIES.find(c => c.id === activeCat)!;

  if (!open) return null;

  return (
    <div className="w-[360px] flex h-full border-r border-white/08 shrink-0 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #09091f 0%, #060614 100%)' }}>

      {/* ── Left icon rail ── */}
      <div className="w-14 flex flex-col items-center py-3 gap-1 border-r border-white/06 bg-black/30 shrink-0 overflow-y-auto scrollbar-hide">
        {SIDEBAR_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCat === cat.id;
          return (
            <button key={cat.id}
              onClick={() => { setActiveCat(cat.id); onTabChange((cat.tabs as readonly string[])[0]); }}
              title={cat.label}
              className={cn('relative w-11 h-11 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 shrink-0',
                !isActive && 'hover:bg-white/06 active:scale-95'
              )}
              style={isActive ? { background: `${cat.color}1e`, boxShadow: `0 0 0 1px ${cat.color}38` } : {}}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ background: cat.color }} />
              )}
              <Icon className="w-[18px] h-[18px]" style={{ color: isActive ? cat.color : 'rgba(255,255,255,0.28)' }} />
              <span className="text-[0.37rem] font-bold uppercase tracking-wide leading-none"
                style={{ color: isActive ? cat.color : 'rgba(255,255,255,0.2)' }}>
                {cat.label}
              </span>
            </button>
          );
        })}
        <div className="flex-1" />
        <div className={cn('w-2 h-2 rounded-full mb-2 shrink-0', online ? 'bg-emerald-400' : 'bg-red-400')}
          title={online ? 'Online' : 'Offline'} />
      </div>

      {/* ── Right content panel ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Category header */}
        <div className="shrink-0 px-4 pt-3 pb-2.5 border-b border-white/08"
          style={{ background: `linear-gradient(135deg, ${activeCatData.color}0e 0%, transparent 65%)` }}>
          <div className="flex items-center gap-3 mb-0">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${activeCatData.color}1e`, boxShadow: `0 0 14px ${activeCatData.color}28` }}>
              <activeCatData.icon className="w-5 h-5" style={{ color: activeCatData.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white/85 leading-tight tracking-wide">{activeCatData.label}</p>
              <p className="text-[0.52rem] text-white/28 leading-tight mt-0.5">
                {(activeCatData.tabs as readonly string[]).length} section{(activeCatData.tabs as readonly string[]).length > 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/05 border border-white/08 text-white/30 hover:text-white/70 hover:bg-white/09 transition-all shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Sub-tab pills — only when multiple tabs */}
          {(activeCatData.tabs as readonly string[]).length > 1 && (
            <div className="flex gap-1.5 mt-2.5 overflow-x-auto scrollbar-hide pb-0.5">
              {(activeCatData.tabs as readonly string[]).map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button key={tab} onClick={() => onTabChange(tab)}
                    className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all shrink-0',
                      isActive
                        ? ''
                        : 'bg-white/04 border-white/08 text-white/35 hover:text-white/65 hover:bg-white/07 hover:border-white/18'
                    )}
                    style={isActive ? {
                      background: `${activeCatData.color}20`,
                      borderColor: `${activeCatData.color}50`,
                      color: activeCatData.color,
                    } : {}}>
                    {tab.replace(/^\w/, c => c.toUpperCase()).replace(/-/g, ' ')
                      .replace('Fx', 'FX').replace('Midi', 'MIDI').replace('Ai', 'AI')}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings content */}
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
          <SettingsPanel hideTabNav className="h-full" initialTab={activeTab} />
        </div>

        {/* Footer */}
        <div className="border-t border-white/07 px-4 py-3 shrink-0 bg-black/20">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black text-[0.5rem]"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                {lvlInfo.level}
              </div>
              <span className="text-xs font-semibold text-white/40">{lvlInfo.title}</span>
            </div>
            <span className="text-xs font-mono font-bold text-violet-300/55">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: 'linear-gradient(to right, #7c3aed, #c026d3, #ec4899)' }} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/04 border border-white/07">
              <span className="text-[0.52rem] text-white/30">🔥 Streak</span>
              <span className="text-xs font-bold font-mono text-amber-400">{dailyStreak}d</span>
            </div>
            <div className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/04 border border-white/07">
              <span className="text-[0.52rem] text-white/30">🏆 Best</span>
              <span className="text-xs font-bold font-mono text-violet-300">{bestWpm} WPM</span>
            </div>
            {isRecording && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-500/12 border border-red-500/28">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
                <span className="text-xs text-red-400 font-bold">REC</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Nexus Bottom Bar ──────────────────────────────────────────────────────────
function NexusBottomBar({
  onCommand, onAnalytics, onShortcuts, onToggleKeyboardOnly, analyticsOpen, keyboardOnly,
}: {
  onCommand: () => void; onAnalytics: () => void; onShortcuts: () => void;
  onToggleKeyboardOnly: () => void; analyticsOpen: boolean; keyboardOnly: boolean;
}) {
  const {
    wpm, accuracy, errors, typingMode, setTypingMode,
    wpmHistory, totalKeystrokes, sessionComplete,
    focusMode, setFocusMode, performanceMode, setPerformanceMode,
    resetTyping, exportSettings, theme, setTheme,
    ghostMode, setGhostMode, blindTypingMode, setBlindTypingMode,
    dailyChallengeMode, setDailyChallengeMode, isRecording, pomodoroEnabled,
    dailyGoalWpm: wpmGoal, setDailyGoalWpm: setWpmGoal,
    xp, dailyStreak, bestWpm,
  } = useStore();
  const [sessionTime, setSessionTime] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const [showGoal, setShowGoal] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const goalRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (goalRef.current && !goalRef.current.contains(e.target as Node)) setShowGoal(false);
      if (extraRef.current && !extraRef.current.contains(e.target as Node)) setShowExtra(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const accColor = accuracy >= 97 ? '#4ade80' : accuracy >= 85 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex items-center gap-1 h-11 border-t border-white/07 bg-black/50 backdrop-blur-xl shrink-0 px-2 overflow-x-auto scrollbar-hide">

      {/* Live Stats */}
      <div className="flex items-center gap-1 shrink-0 pr-2 border-r border-white/07 mr-1">
        <StatChip value={wpm} label="WPM" color="#a78bfa" />
        <StatChip value={`${accuracy}%`} label="ACC" color={accColor} />
        <StatChip value={errors} label="ERR" color={errors > 5 ? '#f87171' : '#ffffff40'} />
        <StatChip value={formatTime(Math.floor(sessionTime))} label="TIME" color="#60a5fa" />
      </div>

      {/* Extended mode pills */}
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide shrink-0 pr-2 border-r border-white/07 mr-1" style={{ maxWidth: 320 }}>
        {QUICK_MODES.slice(0, 12).map(m => (
          <button key={m.value} onClick={() => setTypingMode(m.value as any)}
            className={cn(
              'px-2 py-0.5 rounded-full text-[0.48rem] font-semibold whitespace-nowrap border shrink-0 transition-all',
              typingMode === m.value
                ? 'border-opacity-50'
                : 'bg-white/03 border-white/06 text-white/30 hover:text-white/55 hover:border-white/15'
            )}
            style={typingMode === m.value ? { background: `${m.color}18`, borderColor: `${m.color}50`, color: m.color } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* WPM Goal */}
      <div ref={goalRef} className="relative shrink-0">
        <BottomBtn onClick={() => setShowGoal(v => !v)} active={wpmGoal > 0} title="WPM Goal">
          <Target className="w-3 h-3" />
        </BottomBtn>
        {wpmGoal > 0 && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />}
        {showGoal && (
          <div className="absolute left-0 bottom-full mb-1 z-50 bg-[#0c0c1a]/98 backdrop-blur-2xl border border-white/12 rounded-2xl p-3 w-44 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[0.52rem] font-bold text-white/60 uppercase tracking-wider">WPM Goal</p>
              {wpmGoal > 0 && <button onClick={() => setWpmGoal(0)} className="text-[0.44rem] text-white/30 hover:text-red-400">Clear</button>}
            </div>
            {wpmGoal > 0 && (
              <div className="mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-[0.46rem] text-white/30">Progress</span>
                  <span className="text-[0.48rem] font-bold" style={{ color: wpm >= wpmGoal ? '#4ade80' : '#a78bfa' }}>{wpm}/{wpmGoal}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/08 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (wpm / wpmGoal) * 100)}%`, background: wpm >= wpmGoal ? '#4ade80' : '#8b5cf6' }} />
                </div>
                {wpm >= wpmGoal && <p className="text-[0.46rem] text-emerald-400 mt-1">🎉 Goal reached!</p>}
              </div>
            )}
            <div className="flex gap-1 flex-wrap mb-2">
              {[30, 50, 70, 80, 100, 120].map(v => (
                <button key={v} onClick={() => setWpmGoal(v)}
                  className={cn('flex-1 min-w-[2.5rem] py-0.5 rounded-lg text-[0.48rem] border transition-all',
                    wpmGoal === v ? 'bg-violet-500/25 border-violet-500/50 text-violet-200' : 'bg-white/05 border-white/08 text-white/40 hover:text-white/70')}>
                  {v}
                </button>
              ))}
            </div>
            <input type="number" min={1} max={300} placeholder="Custom WPM"
              className="w-full px-1.5 py-0.5 rounded-lg bg-white/06 border border-white/10 text-white/60 text-[0.5rem] outline-none focus:border-violet-500/40"
              onKeyDown={e => { if (e.key === 'Enter') { const v = parseInt((e.target as HTMLInputElement).value); if (v > 0) setWpmGoal(v); } }}
            />
          </div>
        )}
      </div>

      {/* Quick toggles */}
      <div className="flex items-center gap-0.5 shrink-0">
        <BottomBtn onClick={() => setFocusMode(!focusMode)} active={focusMode} title="Focus Mode"><Focus className="w-3 h-3" /></BottomBtn>
        <BottomBtn onClick={() => setPerformanceMode(!performanceMode)} active={performanceMode} title="Performance Mode"><Zap className="w-3 h-3" /></BottomBtn>
        <BottomBtn onClick={() => setGhostMode(!ghostMode)} active={ghostMode} title="Ghost Mode"><Ghost className="w-3 h-3" /></BottomBtn>
        <BottomBtn onClick={() => setDailyChallengeMode(!dailyChallengeMode)} active={dailyChallengeMode} title="Daily Challenge"><Star className="w-3 h-3" /></BottomBtn>
        <BottomBtn onClick={() => setBlindTypingMode(!blindTypingMode)} active={blindTypingMode} title="Blind Mode"><EyeOff className="w-3 h-3" /></BottomBtn>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right group */}
      <div className="flex items-center gap-0.5 shrink-0">
        <BottomBtn onClick={onAnalytics} active={analyticsOpen} title="Analytics"><BarChart2 className="w-3 h-3" /></BottomBtn>
        <BottomBtn onClick={onToggleKeyboardOnly} active={keyboardOnly} title="Keyboard Only"><KeyboardIcon className="w-3 h-3" /></BottomBtn>
        <BottomBtn onClick={resetTyping} title="Reset"><RotateCcw className="w-3 h-3" /></BottomBtn>
        <BottomBtn onClick={exportSettings} title="Export Settings"><Download className="w-3 h-3" /></BottomBtn>
        <BottomBtn onClick={onCommand} title="Command (Ctrl+K)"><Command className="w-3 h-3" /></BottomBtn>
        <BottomBtn onClick={onShortcuts} title="Shortcuts (F1)"><HelpCircle className="w-3 h-3" /></BottomBtn>
      </div>

      {/* Online indicator */}
      <div className="ml-1 shrink-0">
        <OnlineIndicator />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NEXUS MOBILE LANDSCAPE LAYOUT — Completely new design (landscape only)
// ════════════════════════════════════════════════════════════════════════════
function NexusMobileLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const store = useStore();
  const {
    wpm, accuracy, xp, dailyStreak, typingMode, setTypingMode,
    isRecording, isPlaying, recordedEvents, startRecording, stopRecording,
    playRecording, stopPlayback, volume, setVolume, focusMode, setFocusMode,
    theme, setTheme, resetTyping, performanceMode, setPerformanceMode,
    ghostMode, setGhostMode, metronomeEnabled, setMetronome, bpm, setBpm,
    totalKeystrokes, bestWpm, errors, dailyGoalWpm: wpmGoal, loopEnabled, setLoop,
    blindTypingMode, setBlindTypingMode, dailyChallengeMode, setDailyChallengeMode,
  } = store;

  const { current: lvlInfo, progress } = getLevelInfo(xp);
  const hasRecording = recordedEvents.length > 0;
  const accColor = accuracy >= 97 ? '#4ade80' : accuracy >= 85 ? '#fbbf24' : '#f87171';

  const mobileSeasonalMode = useMemo(() => getSeasonalHoliday() || getCurrentSeason(), []);
  const MOBILE_MODES = useMemo(() => [
    'free', 'word', 'sentence', 'timed', 'sprint', 'lesson', 'code', 'quotes', 'zen',
    'gaming', 'science', 'history', 'poetry', 'geography', 'math-facts', mobileSeasonalMode,
  ] as const, [mobileSeasonalMode]);

  const modeIdx = MOBILE_MODES.indexOf(typingMode as any);
  const cycleMode = useCallback(() => setTypingMode(MOBILE_MODES[(modeIdx < 0 ? 0 : modeIdx + 1) % MOBILE_MODES.length] as any), [modeIdx, MOBILE_MODES, setTypingMode]);
  const cycleModePrev = useCallback(() => setTypingMode(MOBILE_MODES[((modeIdx < 0 ? 0 : modeIdx) - 1 + MOBILE_MODES.length) % MOBILE_MODES.length] as any), [modeIdx, MOBILE_MODES, setTypingMode]);

  return (
    <div className="flex w-full h-full">
      {/* ── Left vertical control strip ── */}
      <div className="flex flex-col items-center gap-1 py-1 px-0.5 border-r border-white/08 bg-black/50 backdrop-blur-2xl shrink-0 w-12">

        {/* Logo */}
        <img src={logoImg} alt="UK Aurora" className="w-8 h-8 rounded-xl object-contain shrink-0" />

        {/* Divider */}
        <div className="w-8 h-px bg-white/10 shrink-0" />

        {/* Live WPM — tap for stats */}
        <button onClick={() => setStatsOpen(v => !v)} className="flex flex-col items-center gap-0 text-center shrink-0" title="Stats">
          <span className="text-[0.72rem] font-black text-violet-300 leading-none">{wpm}</span>
          <span className="text-[0.36rem] text-white/25 uppercase tracking-wider">WPM</span>
        </button>

        {/* Accuracy */}
        <div className="flex flex-col items-center gap-0 text-center shrink-0">
          <span className="text-[0.62rem] font-bold leading-none" style={{ color: accColor }}>{accuracy}%</span>
          <span className="text-[0.36rem] text-white/25 uppercase">ACC</span>
        </div>

        {/* Streak */}
        <div className="flex flex-col items-center gap-0 text-center shrink-0">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[0.44rem] font-bold text-amber-300">{dailyStreak}</span>
        </div>

        {/* Level */}
        <div className="flex flex-col items-center gap-0 text-center shrink-0">
          <div className="w-7 h-1.5 rounded-full bg-white/08 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[0.36rem] text-white/20">Lv{lvlInfo.level}</span>
        </div>

        <div className="w-8 h-px bg-white/10 shrink-0" />

        {/* Prev mode */}
        <MobileCtrlBtn onClick={cycleModePrev} title="Previous Mode">
          <ArrowUp className="w-3 h-3" />
        </MobileCtrlBtn>

        {/* Next mode */}
        <MobileCtrlBtn onClick={cycleMode} title="Next Mode" className="text-violet-400">
          <Shuffle className="w-3 h-3" />
        </MobileCtrlBtn>

        {/* Record */}
        <MobileCtrlBtn
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? 'Stop' : 'Record'}
          className={isRecording ? 'text-red-400 border-red-500/40 bg-red-500/15 animate-pulse' : 'text-rose-400/70'}
        >
          {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Circle className="w-3 h-3" />}
        </MobileCtrlBtn>

        {/* Play */}
        {(hasRecording || isPlaying) && (
          <MobileCtrlBtn
            onClick={isPlaying ? stopPlayback : playRecording}
            title={isPlaying ? 'Stop' : 'Play'}
            className={isPlaying ? 'text-emerald-400 border-emerald-400/40 bg-emerald-500/10' : ''}
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3" />}
          </MobileCtrlBtn>
        )}

        {/* Loop */}
        <MobileCtrlBtn onClick={() => setLoop(!loopEnabled)} active={loopEnabled} title="Loop">
          <Repeat className="w-3 h-3" />
        </MobileCtrlBtn>

        {/* Volume toggle */}
        <MobileCtrlBtn onClick={() => setVolume(volume === 0 ? 0.7 : 0)} title={volume === 0 ? 'Unmute' : 'Mute'}>
          {volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </MobileCtrlBtn>

        {/* Focus */}
        <MobileCtrlBtn onClick={() => setFocusMode(!focusMode)} active={focusMode} title="Focus Mode">
          <Focus className="w-3 h-3" />
        </MobileCtrlBtn>

        {/* Performance */}
        <MobileCtrlBtn onClick={() => setPerformanceMode(!performanceMode)} active={performanceMode} title="Performance">
          <Zap className="w-3 h-3" />
        </MobileCtrlBtn>

        {/* Ghost */}
        <MobileCtrlBtn onClick={() => setGhostMode(!ghostMode)} active={ghostMode} title="Ghost Mode">
          <Ghost className="w-3 h-3" />
        </MobileCtrlBtn>

        {/* Metronome */}
        <MobileCtrlBtn onClick={() => setMetronome(!metronomeEnabled)} active={metronomeEnabled} title="Metronome">
          <Music className="w-3 h-3" />
        </MobileCtrlBtn>

        {/* Reset */}
        <MobileCtrlBtn onClick={resetTyping} title="Reset">
          <RotateCcw className="w-3 h-3" />
        </MobileCtrlBtn>

        <div className="flex-1" />

        {/* Settings gear — always at bottom */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/25 border border-violet-500/50 text-violet-300 hover:bg-violet-500/35 transition-all shrink-0"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* ── Right: content + keyboard ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Slim mode pill bar */}
        <div className="flex items-center gap-0.5 px-2 py-0.5 border-b border-white/05 bg-black/20 backdrop-blur-sm shrink-0 overflow-x-auto scrollbar-hide">
          {/* Mode prev/next arrows */}
          <button onClick={cycleModePrev} className="w-5 h-5 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/08 transition-all shrink-0">
            <ArrowUp className="w-2.5 h-2.5" />
          </button>
          {MOBILE_MODES.map(m => (
            <button key={m}
              onClick={() => setTypingMode(m as any)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[0.48rem] font-semibold whitespace-nowrap border transition-all shrink-0',
                typingMode === m
                  ? 'bg-violet-500/30 border-violet-500/60 text-violet-200'
                  : 'bg-white/04 border-white/07 text-white/30 hover:text-white/55'
              )}>
              {m}
            </button>
          ))}
          <button onClick={cycleMode} className="w-5 h-5 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/08 transition-all shrink-0">
            <ArrowDown className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Interaction area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <InteractionArea />
        </div>

        {/* Keyboard */}
        <div className="shrink-0">
          <Keyboard />
        </div>
      </div>

      {/* ── Mobile Stats Modal ── */}
      {statsOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setStatsOpen(false)} />
          <div className="fixed top-2 left-14 right-2 z-50 bg-[#0c0c18]/98 backdrop-blur-2xl border border-white/12 rounded-2xl p-4 shadow-2xl max-h-[85vh] overflow-y-auto" style={{ touchAction: 'pan-y' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.62rem] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-violet-400" /> Live Stats & Progress
              </p>
              <button onClick={() => setStatsOpen(false)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/08 text-white/40">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Key stats grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'WPM', value: wpm, color: '#a78bfa', icon: '⚡' },
                { label: 'Accuracy', value: `${accuracy}%`, color: accColor, icon: '🎯' },
                { label: 'Errors', value: errors, color: errors > 5 ? '#f87171' : '#6b7280', icon: '❌' },
                { label: 'Best WPM', value: bestWpm, color: '#fbbf24', icon: '🏆' },
                { label: 'Streak', value: `${dailyStreak}d`, color: '#fb923c', icon: '🔥' },
                { label: 'Keys', value: totalKeystrokes > 999 ? `${(totalKeystrokes / 1000).toFixed(1)}k` : totalKeystrokes, color: '#60a5fa', icon: '⌨️' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center gap-0.5 py-2 rounded-xl bg-white/04 border border-white/08">
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-sm font-black font-mono" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[0.42rem] text-white/30 uppercase">{s.label}</span>
                </div>
              ))}
            </div>

            {/* XP & Level */}
            <div className="mb-3 px-2 py-2 rounded-xl bg-white/04 border border-white/08">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[0.52rem] font-bold text-violet-300">Level {lvlInfo.level} — {lvlInfo.title}</span>
                <span className="text-[0.5rem] text-white/40">{xp} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/08 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[0.44rem] text-white/25 mt-0.5">{Math.round(progress)}% to next level</p>
            </div>

            <StatsBar />
          </div>
        </>
      )}

      {/* ── Mobile Full Settings Panel ── */}
      <MobileSettingsSheet isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function MobileCtrlBtn({ children, onClick, title, className, active }: {
  children: React.ReactNode; onClick: () => void; title: string; className?: string; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center border transition-all shrink-0',
        active ? 'bg-violet-500/22 border-violet-500/45 text-violet-300' : 'bg-white/05 border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10',
        className
      )}
    >
      {children}
    </button>
  );
}

function MobileSettingsSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('controls');
  const [activeCat, setActiveCat] = useState('controls');

  const activeCatData = SIDEBAR_CATEGORIES.find(c => c.id === activeCat)!;

  const handleCat = (catId: string) => {
    setActiveCat(catId);
    const cat = SIDEBAR_CATEGORIES.find(c => c.id === catId);
    if (cat) setActiveTab((cat.tabs as readonly string[])[0]);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md" onClick={onClose} />}
      <div className={cn(
        'fixed inset-0 z-50 flex flex-col transition-transform duration-300 ease-out',
        isOpen ? 'translate-y-0' : 'translate-y-full'
      )}
        style={{ background: 'linear-gradient(180deg, #08081e 0%, #050512 100%)' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/08 shrink-0"
          style={{ background: `linear-gradient(135deg, ${activeCatData.color}10 0%, transparent 60%)` }}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${activeCatData.color}1e`, boxShadow: `0 0 14px ${activeCatData.color}28` }}>
            <activeCatData.icon className="w-5 h-5" style={{ color: activeCatData.color }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white/85">{activeCatData.label}</p>
            <p className="text-[0.52rem] text-white/30">UK AURORA Ultra Premium v5</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white/06 border border-white/10 text-white/40 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Category grid ── */}
        <div className="shrink-0 px-3 py-2.5 border-b border-white/07 bg-black/20">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {SIDEBAR_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCat === cat.id;
              return (
                <button key={cat.id} onClick={() => handleCat(cat.id)}
                  className={cn('flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border transition-all shrink-0 min-w-[3.5rem]',
                    isActive ? '' : 'bg-white/04 border-white/07 hover:bg-white/08'
                  )}
                  style={isActive ? {
                    background: `${cat.color}1e`,
                    borderColor: `${cat.color}45`,
                    boxShadow: `0 0 0 1px ${cat.color}20`,
                  } : {}}>
                  <Icon className="w-5 h-5" style={{ color: isActive ? cat.color : 'rgba(255,255,255,0.35)' }} />
                  <span className="text-[0.44rem] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: isActive ? cat.color : 'rgba(255,255,255,0.3)' }}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sub-tabs ── */}
        {(activeCatData.tabs as readonly string[]).length > 1 && (
          <div className="shrink-0 px-3 py-2 border-b border-white/06 bg-black/10">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {(activeCatData.tabs as readonly string[]).map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={cn('px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all shrink-0',
                      isActive ? '' : 'bg-white/04 border-white/08 text-white/40 hover:text-white/65 hover:bg-white/07'
                    )}
                    style={isActive ? {
                      background: `${activeCatData.color}20`,
                      borderColor: `${activeCatData.color}50`,
                      color: activeCatData.color,
                    } : {}}>
                    {tab.replace(/^\w/, c => c.toUpperCase()).replace(/-/g, ' ')
                      .replace('Fx', 'FX').replace('Midi', 'MIDI').replace('Ai', 'AI')}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Settings content ── */}
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
          <SettingsPanel hideTabNav className="h-full" initialTab={activeTab} />
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-2.5 border-t border-white/07 bg-black/30 shrink-0">
          <p className="text-[0.5rem] text-white/20 text-center">All settings auto-saved · UK AURORA v5</p>
        </div>
      </div>
    </>
  );
}

// ── Shared UI Atoms ────────────────────────────────────────────────────────────
function TopBarBtn({ children, onClick, title, active, className, disabled }: {
  children: React.ReactNode; onClick: () => void; title: string; active?: boolean; className?: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'w-7 h-7 rounded-xl flex items-center justify-center border transition-all shrink-0',
        active ? 'border-violet-500/50 bg-violet-500/18 text-violet-300' : 'border-white/10 bg-white/05 text-white/50 hover:text-white hover:bg-white/08',
        disabled && 'opacity-30 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {children}
    </button>
  );
}

function BottomBtn({ children, onClick, title, active, className }: {
  children: React.ReactNode; onClick: () => void; title: string; active?: boolean; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'w-7 h-7 rounded-xl flex items-center justify-center border transition-all shrink-0',
        active ? 'border-violet-500/50 bg-violet-500/18 text-violet-300' : 'border-white/10 bg-white/05 text-white/50 hover:text-white hover:bg-white/10',
        className
      )}
    >
      {children}
    </button>
  );
}

function TopStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  const isHex = color.startsWith('#') || color.startsWith('rgb');
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/05 border border-white/08 shrink-0">
      <span
        className={cn('text-[0.6rem] font-black font-mono', !isHex && color)}
        style={isHex ? { color } : undefined}
      >{value}</span>
      <span className="text-[0.38rem] text-white/25 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function StatChip({ value, label, color }: { value: string | number; label: string; color: string }) {
  const isHex = color.startsWith('#') || color.startsWith('rgb');
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white/05 border border-white/08 shrink-0">
      <span
        className={cn('text-[0.58rem] font-black font-mono', !isHex && color)}
        style={isHex ? { color } : undefined}
      >{value}</span>
      <span className="text-[0.38rem] text-white/22 uppercase">{label}</span>
    </div>
  );
}

function OnlineIndicator() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return (
    <div className="flex items-center gap-1">
      {online ? <Wifi className="w-2.5 h-2.5 text-emerald-400/60" /> : <WifiOff className="w-2.5 h-2.5 text-red-400/60" />}
      <span className="text-[0.42rem] text-white/20">{online ? 'Online' : 'Offline'}</span>
    </div>
  );
}
