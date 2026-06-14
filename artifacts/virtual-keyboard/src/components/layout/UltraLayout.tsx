import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore, APP_THEMES } from '@/store';
import { useShallow } from 'zustand/react/shallow';
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
  ArrowUp, SkipForward, Rewind, FastForward,
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

function checkLayout(): 'desktop' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isLandscapeMobile = h < 520 && w > h && w <= 1024;
  const isPortraitPhone = w < 768 && h > w;
  return (isLandscapeMobile || isPortraitPhone) ? 'mobile' : 'desktop';
}

function useLayout() {
  const [layout, setLayout] = useState<'desktop' | 'mobile'>(checkLayout);
  useEffect(() => {
    const fn = () => setLayout(checkLayout());
    window.addEventListener('resize', fn, { passive: true });
    window.addEventListener('orientationchange', fn, { passive: true });
    try { screen.orientation.addEventListener('change', fn); } catch {}
    return () => {
      window.removeEventListener('resize', fn);
      window.removeEventListener('orientationchange', fn);
      try { screen.orientation.removeEventListener('change', fn); } catch {}
    };
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
      'flex-1 w-full flex workspace-bg workspace-grid relative overflow-hidden',
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const s = useStore.getState();
      if (ctrl && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); }
      if (e.key === 'F1') { e.preventDefault(); setShortcutsOpen(v => !v); }
      if (e.key === 'Escape') { setCmdOpen(false); setShortcutsOpen(false); }
      if (ctrl && e.shiftKey && e.key === 'F') { e.preventDefault(); s.setFocusMode(!s.focusMode); }
      if (ctrl && e.shiftKey && e.key === 'A') { e.preventDefault(); setAnalyticsOpen(v => !v); }
      if (ctrl && e.key === 'r') { e.preventDefault(); s.resetTyping(); }
      if (ctrl && e.shiftKey && e.key === 'P') { e.preventDefault(); s.setPerformanceMode(!s.performanceMode); }
      if (ctrl && e.key === 'p') { e.preventDefault(); s.setPomodoroEnabled(!s.pomodoroEnabled); }
      if (ctrl && e.key === 'e') { e.preventDefault(); s.exportSettings(); }
      if (ctrl && e.key === 'g') { e.preventDefault(); s.setGhostMode(!s.ghostMode); }
      if (ctrl && e.shiftKey && e.key === 'B') { e.preventDefault(); s.setBlindTypingMode(!s.blindTypingMode); }
      if (ctrl && e.shiftKey && e.key === 'D') { e.preventDefault(); s.setDailyChallengeMode(!s.dailyChallengeMode); }
      if (ctrl && e.key === '1') { e.preventDefault(); s.setTypingMode('free'); }
      if (ctrl && e.key === '2') { e.preventDefault(); s.setTypingMode('word'); }
      if (ctrl && e.key === '3') { e.preventDefault(); s.setTypingMode('timed'); }
      if (ctrl && e.key === '4') { e.preventDefault(); s.setTypingMode('sprint'); }
      if (ctrl && e.key === '5') { e.preventDefault(); s.setTypingMode('lesson'); }
      if (ctrl && e.key === '6') { e.preventDefault(); s.setTypingMode('code'); }
      if (ctrl && e.shiftKey && e.key === 'R') { e.preventDefault(); s.isRecording ? s.stopRecording() : s.startRecording(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

// ── Nexus Top Bar ─────────────────────────────────────────────────────────────
function NexusTopBar({
  onToggleSidebar, sidebarOpen,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
  const { wpm, accuracy, errors, xp, dailyStreak, isRecording } = useStore(useShallow(s => ({
    wpm: s.wpm, accuracy: s.accuracy, errors: s.errors, xp: s.xp,
    dailyStreak: s.dailyStreak, isRecording: s.isRecording,
  })));
  const { current: lvlInfo } = getLevelInfo(xp);
  const accColor = accuracy >= 97 ? '#4ade80' : accuracy >= 85 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex items-center h-14 shrink-0 px-4 gap-3 relative"
      style={{
        background: 'linear-gradient(180deg, rgba(5,3,14,0.99) 0%, rgba(7,5,20,0.98) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(28px) saturate(200%)',
      }}>

      {/* Top edge shine */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.35) 30%, rgba(96,165,250,0.25) 70%, transparent 100%)' }} />

      {/* Logo + Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative">
          <img src={logoImg} alt="UK Aurora" className="w-7 h-7 rounded-xl object-contain"
            style={{ boxShadow: '0 0 12px rgba(139,92,246,0.4)' }} />
        </div>
        <div className="leading-none">
          <div className="text-[0.6rem] font-black tracking-[0.12em] uppercase"
            style={{ background: 'linear-gradient(90deg, #fff 30%, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            UK Aurora
          </div>
          <div className="text-[0.34rem] uppercase tracking-[0.2em] font-medium" style={{ color: 'rgba(167,139,250,0.45)' }}>
            Virtual Keyboard
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Stats chips */}
      <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
        {/* WPM */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0"
          style={{ background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.32)', boxShadow: '0 0 14px rgba(139,92,246,0.09)' }}>
          <span className="text-[0.5rem] uppercase tracking-widest font-bold" style={{ color: 'rgba(167,139,250,0.52)' }}>WPM</span>
          <span className="font-mono font-black text-[0.9rem]" style={{ color: '#c4b5fd' }}>{wpm}</span>
        </div>
        {/* ACC */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <span className="text-[0.5rem] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.28)' }}>ACC</span>
          <span className="font-mono font-black text-[0.9rem]" style={{ color: accColor }}>{accuracy}%</span>
        </div>
        {/* ERR */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-[0.5rem] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.22)' }}>ERR</span>
          <span className="font-mono font-black text-[0.9rem]" style={{ color: errors > 5 ? '#f87171' : 'rgba(255,255,255,0.3)' }}>{errors}</span>
        </div>
        {/* Level */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0"
          style={{ background: 'rgba(251,191,36,0.09)', border: '1px solid rgba(251,191,36,0.22)' }}>
          <span className="text-[0.5rem] uppercase tracking-widest font-bold" style={{ color: 'rgba(253,211,77,0.5)' }}>LV</span>
          <span className="font-mono font-black text-[0.9rem]" style={{ color: '#fde68a' }}>{lvlInfo.level}</span>
        </div>
        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0"
          style={{ background: 'rgba(251,146,60,0.09)', border: '1px solid rgba(251,146,60,0.22)' }}>
          <Flame className="w-3 h-3" style={{ color: '#fb923c' }} />
          <span className="font-mono font-black text-[0.9rem]" style={{ color: '#fdba74' }}>{dailyStreak}</span>
        </div>

        {isRecording && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            <span className="text-[0.44rem] font-bold" style={{ color: '#f87171' }}>REC</span>
          </div>
        )}
      </div>

      {/* Settings toggle */}
      <button onClick={onToggleSidebar} title="Toggle Settings"
        className="flex items-center gap-2 shrink-0 transition-all active:scale-95"
        style={{
          padding: '9px 18px',
          borderRadius: '14px',
          background: sidebarOpen ? 'rgba(139,92,246,0.22)' : 'rgba(255,255,255,0.05)',
          border: sidebarOpen ? '1px solid rgba(139,92,246,0.48)' : '1px solid rgba(255,255,255,0.10)',
          color: sidebarOpen ? '#c4b5fd' : 'rgba(255,255,255,0.45)',
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em',
          boxShadow: sidebarOpen ? '0 0 20px rgba(139,92,246,0.22)' : 'none',
        }}>
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
    tabs: ['musical'],
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
    tabs: ['shortcuts2'],
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
  const { xp, dailyStreak, bestWpm, isRecording } = useStore(useShallow(s => ({
    xp: s.xp, dailyStreak: s.dailyStreak, bestWpm: s.bestWpm, isRecording: s.isRecording,
  })));
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
  } = useStore(useShallow(s => ({
    wpm: s.wpm, accuracy: s.accuracy, errors: s.errors,
    typingMode: s.typingMode, setTypingMode: s.setTypingMode,
    wpmHistory: s.wpmHistory, totalKeystrokes: s.totalKeystrokes, sessionComplete: s.sessionComplete,
    focusMode: s.focusMode, setFocusMode: s.setFocusMode,
    performanceMode: s.performanceMode, setPerformanceMode: s.setPerformanceMode,
    resetTyping: s.resetTyping, exportSettings: s.exportSettings,
    theme: s.theme, setTheme: s.setTheme,
    ghostMode: s.ghostMode, setGhostMode: s.setGhostMode,
    blindTypingMode: s.blindTypingMode, setBlindTypingMode: s.setBlindTypingMode,
    dailyChallengeMode: s.dailyChallengeMode, setDailyChallengeMode: s.setDailyChallengeMode,
    isRecording: s.isRecording, pomodoroEnabled: s.pomodoroEnabled,
    dailyGoalWpm: s.dailyGoalWpm, setDailyGoalWpm: s.setDailyGoalWpm,
    xp: s.xp, dailyStreak: s.dailyStreak, bestWpm: s.bestWpm,
  })));
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
    <div className="flex items-center h-12 shrink-0 px-3 gap-2 relative overflow-x-auto scrollbar-hide"
      style={{
        background: 'linear-gradient(0deg, rgba(6,4,18,0.98) 0%, rgba(9,7,22,0.96) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
      }}>

      {/* Bottom edge glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.2) 40%, rgba(96,165,250,0.15) 60%, transparent)' }} />

      {/* Live Stats */}
      <div className="flex items-center gap-1.5 shrink-0 pr-3"
        style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        {[
          { v: wpm,                               l: 'WPM',  c: '#a78bfa', bg: 'rgba(139,92,246,0.1)',  bd: 'rgba(139,92,246,0.2)' },
          { v: `${accuracy}%`,                    l: 'ACC',  c: accColor,  bg: 'rgba(255,255,255,0.04)', bd: 'rgba(255,255,255,0.08)' },
          { v: errors,                            l: 'ERR',  c: errors > 5 ? '#f87171' : 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.03)', bd: 'rgba(255,255,255,0.06)' },
          { v: formatTime(Math.floor(sessionTime)), l: 'TIME', c: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  bd: 'rgba(96,165,250,0.18)' },
        ].map(s => (
          <div key={s.l} className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
            style={{ background: s.bg, border: `1px solid ${s.bd}` }}>
            <span className="text-[0.42rem] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.l}</span>
            <span className="font-mono font-black text-[0.62rem]" style={{ color: s.c }}>{s.v}</span>
          </div>
        ))}
      </div>

      {/* Mode pills */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide shrink-0 pr-3"
        style={{ maxWidth: 340, borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        {QUICK_MODES.slice(0, 12).map(m => (
          <button key={m.value} onClick={() => setTypingMode(m.value as any)}
            className="px-2.5 py-1 rounded-full text-[0.47rem] font-semibold whitespace-nowrap border shrink-0 transition-all"
            style={typingMode === m.value
              ? { background: `${m.color}18`, borderColor: `${m.color}48`, color: m.color }
              : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.28)' }}
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
  const {
    wpm, accuracy, xp, dailyStreak,
    volume, setVolume, resetTyping,
  } = useStore(useShallow(s => ({
    wpm: s.wpm, accuracy: s.accuracy, xp: s.xp, dailyStreak: s.dailyStreak,
    volume: s.volume, setVolume: s.setVolume,
    resetTyping: s.resetTyping,
  })));

  const { current: lvlInfo } = getLevelInfo(xp);
  const accColor = accuracy >= 97 ? '#4ade80' : accuracy >= 85 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex flex-col w-full h-full">

      {/* ══ Premium Mobile Top Bar ══ */}
      <div className="flex items-center h-12 shrink-0 px-3 gap-2 relative"
        style={{
          background: 'linear-gradient(180deg, rgba(5,3,14,0.99) 0%, rgba(8,6,22,0.98) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(28px) saturate(200%)',
        }}>

        {/* Top edge aurora shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5) 30%, rgba(96,165,250,0.35) 70%, transparent)' }} />

        {/* Logo */}
        <img src={logoImg} alt="UK Aurora" className="w-7 h-7 rounded-xl object-contain shrink-0"
          style={{ boxShadow: '0 0 14px rgba(139,92,246,0.55)' }} />

        {/* Live stats row */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          {/* WPM */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
            style={{ background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.30)' }}>
            <span className="text-[0.42rem] uppercase tracking-widest font-bold" style={{ color: 'rgba(167,139,250,0.5)' }}>WPM</span>
            <span className="font-mono font-black text-[0.76rem]" style={{ color: '#c4b5fd' }}>{wpm}</span>
          </div>
          {/* ACC */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <span className="text-[0.42rem] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.28)' }}>ACC</span>
            <span className="font-mono font-black text-[0.76rem]" style={{ color: accColor }}>{accuracy}%</span>
          </div>
          {/* Streak */}
          <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg shrink-0"
            style={{ background: 'rgba(251,146,60,0.09)', border: '1px solid rgba(251,146,60,0.22)' }}>
            <Flame className="w-2.5 h-2.5" style={{ color: '#fb923c' }} />
            <span className="font-mono font-black text-[0.68rem]" style={{ color: '#fdba74' }}>{dailyStreak}</span>
          </div>
          {/* Level progress */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg shrink-0"
            style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
            <span className="text-[0.42rem] uppercase tracking-widest font-bold" style={{ color: 'rgba(253,211,77,0.45)' }}>LV</span>
            <span className="font-mono font-black text-[0.68rem]" style={{ color: '#fde68a' }}>{lvlInfo.level}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Volume */}
          <MobileCtrlBtn onClick={() => setVolume(volume === 0 ? 0.7 : 0)} title={volume === 0 ? 'Unmute' : 'Mute'}>
            {volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </MobileCtrlBtn>
          {/* Reset */}
          <MobileCtrlBtn onClick={resetTyping} title="Reset">
            <RotateCcw className="w-3 h-3" />
          </MobileCtrlBtn>
          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
            style={{
              background: 'rgba(139,92,246,0.2)',
              border: '1px solid rgba(139,92,246,0.45)',
              color: '#c4b5fd',
              boxShadow: '0 0 12px rgba(139,92,246,0.18)',
            }}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ══ Interaction Area ══ */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <InteractionArea />
      </div>

      {/* ══ Keyboard ══ */}
      <div className="shrink-0">
        <Keyboard />
      </div>

      {/* ══ Mobile Settings Sheet ══ */}
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
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-lg" onClick={onClose} />
      )}
      <div className={cn(
        'fixed inset-0 z-50 flex flex-col transition-transform duration-300 ease-out',
        isOpen ? 'translate-y-0' : 'translate-y-full'
      )}
        style={{ background: 'linear-gradient(180deg, #07061a 0%, #04030f 100%)' }}
      >
        {/* ══ Top accent line (category color) ══ */}
        <div className="h-0.5 shrink-0 transition-all duration-300"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${activeCatData.color} 40%, ${activeCatData.color} 60%, transparent 100%)` }} />

        {/* ══ Header ══ */}
        <div className="flex items-center gap-3 px-4 h-14 shrink-0 relative"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Colored bg wash */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${activeCatData.color}12 0%, transparent 55%)` }} />

          {/* Category icon */}
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 relative"
            style={{
              background: `${activeCatData.color}22`,
              border: `1px solid ${activeCatData.color}40`,
              boxShadow: `0 0 18px ${activeCatData.color}25`,
            }}>
            <activeCatData.icon className="w-5 h-5" style={{ color: activeCatData.color }} />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0 relative">
            <p className="text-[0.9rem] font-bold text-white/90 leading-tight">{activeCatData.label}</p>
            <p className="text-[0.5rem] font-medium uppercase tracking-widest" style={{ color: `${activeCatData.color}80` }}>Settings</p>
          </div>

          {/* Close */}
          <button onClick={onClose}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 relative"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <X className="w-4.5 h-4.5 text-white/50" />
          </button>
        </div>

        {/* ══ Category tab bar ══ */}
        <div className="shrink-0 border-b overflow-x-auto scrollbar-hide"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="flex">
            {SIDEBAR_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCat === cat.id;
              return (
                <button key={cat.id} onClick={() => handleCat(cat.id)}
                  className="flex flex-col items-center justify-center gap-1.5 px-4 py-3 shrink-0 relative transition-all min-w-[4.5rem]"
                  style={{ minHeight: '3.5rem' }}>
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ background: cat.color }} />
                  )}
                  <Icon className="w-5 h-5 transition-all"
                    style={{ color: isActive ? cat.color : 'rgba(255,255,255,0.3)' }} />
                  <span className="text-[0.5rem] font-bold uppercase tracking-wide whitespace-nowrap transition-all"
                    style={{ color: isActive ? cat.color : 'rgba(255,255,255,0.28)' }}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ Sub-tabs ══ */}
        {(activeCatData.tabs as readonly string[]).length > 1 && (
          <div className="shrink-0 px-3 py-2.5 border-b overflow-x-auto scrollbar-hide"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
            <div className="flex gap-2">
              {(activeCatData.tabs as readonly string[]).map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="px-4 py-2 rounded-xl text-[0.65rem] font-semibold whitespace-nowrap border transition-all shrink-0"
                    style={isActive ? {
                      background: `${activeCatData.color}22`,
                      borderColor: `${activeCatData.color}55`,
                      color: activeCatData.color,
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                    {tab.replace(/^\w/, c => c.toUpperCase()).replace(/-/g, ' ')
                      .replace('Fx', 'FX').replace('Midi', 'MIDI').replace('Ai', 'AI')}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ Settings content ══ */}
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
          <SettingsPanel hideTabNav className="h-full" initialTab={activeTab} />
        </div>

        {/* ══ Footer ══ */}
        <div className="px-4 py-3 shrink-0 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
          <p className="text-[0.48rem] text-white/20 uppercase tracking-widest">Auto-saved</p>
          <p className="text-[0.48rem] font-bold uppercase tracking-widest" style={{ color: `${activeCatData.color}60` }}>UK Aurora v5</p>
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
