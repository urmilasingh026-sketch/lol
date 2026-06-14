import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Zap, Music, Keyboard, Eye, Map, Disc,
  Play, Pause, Square, Repeat, Download, Upload, Trophy, Target,
  Flame, Palette, Cpu, Sliders, Wand2, GitBranch, Circle,
  Save, Trash2, Database, Mic, Settings,
} from 'lucide-react';
import {
  useStore, SOUND_CATEGORIES, SoundCategory,
  RGB_MODES, RgbMode, APP_THEMES, AppTheme, BACKGROUND_EFFECTS, BackgroundEffect, MUSICAL_SCALES,
  KeyShape, KeyPressEffect, GradientStyle, KeyBorderStyle, KeyLabelStyle, DifficultyLevel,
  ColorBlindMode, MetronomeSound, WaveformType, ProgressBarStyle, NoteVisualizerStyle,
  WpmChartStyle, AchievementPosition, ChordVoicing, FpsTarget, NoteOverlapBehavior, KeyboardAlignment,
} from '@/store';
import { cn } from '@/lib/utils';
import { ACHIEVEMENTS, RARITY_COLORS } from '@/lib/achievements';
import { getLevelInfo } from '@/lib/achievements';
import { StatsPanel } from '@/components/ui/StatsPanel';
import {
  useListPresets, useCreatePreset, useDeletePreset,
  useListRecordings, useCreateRecording, useDeleteRecording,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMobileLandscape, useIsPortraitPhone } from '@/hooks/use-mobile-landscape';

const SESSION_ID = (() => {
  let id = localStorage.getItem('vk-session-id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('vk-session-id', id); }
  return id;
})();

const TYPING_MODES = [
  { value: 'free',              label: 'Free Typing',       icon: '✨' },
  { value: 'lesson',            label: 'Lesson Mode',       icon: '📚' },
  { value: 'word',              label: 'Word Practice',     icon: '📝' },
  { value: 'sentence',          label: 'Sentences',         icon: '💬' },
  { value: 'paragraph',         label: 'Paragraph',         icon: '📄' },
  { value: 'numbers',           label: 'Numbers & Symbols', icon: '🔢' },
  { value: 'custom',            label: 'Custom Text',       icon: '✏️' },
  { value: 'timed',             label: 'Timed Test',        icon: '⏱️' },
  { value: 'sprint',            label: 'Sprint Mode',       icon: '🚀' },
  { value: 'quotes',            label: 'Famous Quotes',     icon: '💭' },
  { value: 'quotes-extra',      label: 'More Quotes',       icon: '💬' },
  { value: 'motivational',      label: 'Motivational',      icon: '💪' },
  { value: 'inspiration',       label: 'Inspiration',       icon: '🌟' },
  { value: 'code',              label: 'Code Snippets',     icon: '💻' },
  { value: 'coding-python',     label: 'Python Code',       icon: '🐍' },
  { value: 'coding-javascript', label: 'JavaScript',        icon: '📜' },
  { value: 'coding-html',       label: 'HTML & CSS',        icon: '🌐' },
  { value: 'coding-sql',        label: 'SQL Queries',       icon: '🗄️' },
  { value: 'coding-bash',       label: 'Bash Commands',     icon: '🖥️' },
  { value: 'poetry',            label: 'Poetry',            icon: '🌹' },
  { value: 'literature',        label: 'Literature',        icon: '📖' },
  { value: 'books',             label: 'Book Quotes',       icon: '📚' },
  { value: 'tongue-twisters',   label: 'Tongue Twisters',   icon: '🌀' },
  { value: 'riddles',           label: 'Riddles',           icon: '🧩' },
  { value: 'vocabulary',        label: 'Vocabulary',        icon: '📘' },
  { value: 'grammar',           label: 'Grammar',           icon: '✍️' },
  { value: 'creative-writing',  label: 'Creative Writing',  icon: '🖊️' },
  { value: 'movies',            label: 'Movie Quotes',      icon: '🎬' },
  { value: 'comedy',            label: 'Comedy',            icon: '😂' },
  { value: 'speeches',          label: 'Famous Speeches',   icon: '🎙️' },
  { value: 'programming',       label: 'Programming Terms', icon: '⌨️' },
  { value: 'tech-terms',        label: 'Tech Terms',        icon: '💡' },
  { value: 'science',           label: 'Science Facts',     icon: '🔬' },
  { value: 'biology',           label: 'Biology',           icon: '🧬' },
  { value: 'chemistry',         label: 'Chemistry',         icon: '⚗️' },
  { value: 'physics',           label: 'Physics',           icon: '⚛️' },
  { value: 'math-facts',        label: 'Math Facts',        icon: '🔢' },
  { value: 'astronomy',         label: 'Astronomy',         icon: '🔭' },
  { value: 'psychology',        label: 'Psychology',        icon: '🧠' },
  { value: 'fun-facts',         label: 'Fun Facts',         icon: '🦩' },
  { value: 'history',           label: 'History',           icon: '🏛️' },
  { value: 'geography',         label: 'Geography',         icon: '🌍' },
  { value: 'space',             label: 'Space',             icon: '🚀' },
  { value: 'mythology',         label: 'Mythology',         icon: '⚡' },
  { value: 'zen',               label: 'Zen',               icon: '☯️' },
  { value: 'mindfulness',       label: 'Mindfulness',       icon: '🧘' },
  { value: 'philosophy',        label: 'Philosophy',        icon: '🤔' },
  { value: 'nature',            label: 'Nature',            icon: '🌿' },
  { value: 'animal-facts',      label: 'Animal Facts',      icon: '🦁' },
  { value: 'sports',            label: 'Sports',            icon: '🏆' },
  { value: 'food',              label: 'Food & Cuisine',    icon: '🍜' },
  { value: 'music',             label: 'Music Theory',      icon: '🎵' },
  { value: 'anime',             label: 'Anime Quotes',      icon: '⛩️' },
  { value: 'proverbs',          label: 'Proverbs',          icon: '📜' },
];

const INSTRUMENT_MAP = [
  { keys: 'A – Z', icon: '🎹', name: 'Piano', color: '#33a1ff' },
  { keys: '1 – 0', icon: '🎸', name: 'Electric Guitar', color: '#ff9f1c' },
  { keys: 'F1 – F12', icon: '🥁', name: 'Drum Kit', color: '#ff5b55' },
  { keys: "- = [ ] \\ ; ' , . /", icon: '🪈', name: 'Flute', color: '#38e29d' },
  { keys: 'Space', icon: '🎸', name: 'Bass', color: '#b45cff' },
  { keys: 'Enter', icon: '🎶', name: 'Piano Chord', color: '#33a1ff' },
  { keys: '← ↑ → ↓', icon: '🎛', name: 'Synthesizer', color: '#ffd447' },
  { keys: 'Ctrl / Alt', icon: '🌊', name: 'Ambient Pads', color: '#5f6bff' },
  { keys: 'Numpad 0–9', icon: '🪘', name: 'Percussion', color: '#ff7eb3' },
  { keys: 'CapsLock', icon: '🎻', name: 'Violin', color: '#e05cff' },
  { keys: 'Tab', icon: '🎺', name: 'Trumpet', color: '#ffdc00' },
  { keys: 'Delete', icon: '🎼', name: 'Organ', color: '#ff6f3c' },
  { keys: 'Insert', icon: '🎷', name: 'Saxophone', color: '#00cfff' },
  { keys: 'Home', icon: '🎹', name: 'Harpsichord', color: '#c8ff80' },
  { keys: 'End', icon: '🎸', name: 'Electric Bass', color: '#7040ff' },
  { keys: 'Page Up', icon: '🪗', name: 'Accordion', color: '#ff9060' },
  { keys: 'Page Down', icon: '🎺', name: 'French Horn', color: '#80dfb0' },
  { keys: 'Backspace', icon: '🔇', name: 'Stop All', color: '#888' },
  { keys: 'Shift', icon: '🎚', name: 'Velocity Boost', color: '#fff' },
];

const LESSON_LABELS: Record<number, string> = {
  1: 'Home Row', 2: 'Top Row', 3: 'Bottom Row', 4: 'Numbers',
  5: 'Symbols', 6: 'Classic Pangram', 7: 'Speed #1', 8: 'Advanced', 9: 'Expert', 10: 'Master',
};

type TabKey = 'visual' | 'style' | 'audio' | 'fx' | 'typing' | 'musical' | 'ui' | 'transport'
  | 'presets' | 'recordings' | 'stats' | 'goals' | 'accessibility' | 'platform' | 'map';

interface TabDef { key: TabKey; label: string; icon: React.ReactNode; shortLabel: string }

const TABS: TabDef[] = [
  { key: 'visual',        label: 'Visual & Theme',       shortLabel: 'Theme',      icon: <Zap className="w-3.5 h-3.5" /> },
  { key: 'style',         label: 'Key Style',            shortLabel: 'Keys',       icon: <Wand2 className="w-3.5 h-3.5" /> },
  { key: 'audio',         label: 'Sound & Music',        shortLabel: 'Audio',      icon: <Music className="w-3.5 h-3.5" /> },
  { key: 'fx',            label: 'Audio FX',             shortLabel: 'FX',         icon: <Sliders className="w-3.5 h-3.5" /> },
  { key: 'typing',        label: 'Typing Mode',          shortLabel: 'Typing',     icon: <Keyboard className="w-3.5 h-3.5" /> },
  { key: 'musical',       label: 'Musical',              shortLabel: 'Musical',    icon: <GitBranch className="w-3.5 h-3.5" /> },
  { key: 'ui',            label: 'UI Features',          shortLabel: 'UI',         icon: <Palette className="w-3.5 h-3.5" /> },
  { key: 'transport',     label: 'Transport',            shortLabel: 'Transport',  icon: <Disc className="w-3.5 h-3.5" /> },
  { key: 'presets',       label: 'Cloud Presets',        shortLabel: 'Presets',    icon: <Database className="w-3.5 h-3.5" /> },
  { key: 'recordings',    label: 'Cloud Recordings',     shortLabel: 'Recordings', icon: <Mic className="w-3.5 h-3.5" /> },
  { key: 'stats',         label: 'Statistics',           shortLabel: 'Stats',      icon: <Trophy className="w-3.5 h-3.5" /> },
  { key: 'goals',         label: 'Goals & Achievements', shortLabel: 'Goals',      icon: <Target className="w-3.5 h-3.5" /> },
  { key: 'accessibility', label: 'Accessibility',        shortLabel: 'Access',     icon: <Eye className="w-3.5 h-3.5" /> },
  { key: 'platform',      label: 'Platform',             shortLabel: 'Platform',   icon: <Cpu className="w-3.5 h-3.5" /> },
  { key: 'map',           label: 'Instrument Map',       shortLabel: 'Map',        icon: <Map className="w-3.5 h-3.5" /> },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: TabKey;
}

export function SettingsDrawer({ isOpen, onClose, defaultTab }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab ?? 'visual');
  const store = useStore();
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const isMobile = useMobileLandscape();
  const isPortrait = useIsPortraitPhone();
  const isCompact = isMobile || isPortrait;

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadStatus('idle');
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed) || !parsed.every((x: any) => typeof x.key === 'string' && typeof x.timestamp === 'number')) {
          setUploadStatus('err'); return;
        }
        store.loadRecording(parsed);
        setUploadStatus('ok');
        setTimeout(() => setUploadStatus('idle'), 2000);
      } catch { setUploadStatus('err'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [store]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const tab = TABS.find(t => t.key === activeTab)!;
  const drawerWidth = isCompact ? '100%' : '460px';

  return (
    <>
      {/* Backdrop (semi-transparent, keeps app visible) */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-all duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Slide-over panel from right */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 flex flex-col',
          'bg-[#0b0b17] border-l border-white/10 shadow-[−20px_0_60px_rgba(0,0,0,0.6)]',
          'transition-transform duration-300 ease-out'
        )}
        style={{
          width: drawerWidth,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/08 shrink-0 bg-black/30">
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-violet-400" />
            <div>
              <div className="text-[0.7rem] font-bold text-white">Settings</div>
              <div className="text-[0.48rem] text-white/35 flex items-center gap-1">
                <span className="text-violet-400">{tab.icon}</span>
                {tab.label}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/08 hover:border-white/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        {isCompact ? (
          /* Mobile: horizontal scrolling tab bar */
          <div className="shrink-0 border-b border-white/08 bg-black/20 px-1.5">
            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar py-1.5" style={{ touchAction: 'pan-x' }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl shrink-0 transition-all text-[0.44rem] font-bold uppercase tracking-wide whitespace-nowrap',
                    activeTab === t.key
                      ? 'bg-violet-500/20 text-white border border-violet-500/40'
                      : 'text-white/35 border border-transparent hover:text-white/65 hover:bg-white/05'
                  )}>
                  <span className="text-sm">{t.icon}</span>
                  {t.shortLabel}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Desktop: vertical tab sidebar + content side by side */
          null
        )}

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Desktop vertical tab list */}
          {!isCompact && (
            <div className="w-[140px] shrink-0 border-r border-white/07 bg-black/20 flex flex-col overflow-y-auto py-1">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 text-left transition-all group',
                    activeTab === t.key
                      ? 'bg-violet-500/15 text-white border-r-2 border-violet-500'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/04'
                  )}>
                  <span className={cn('shrink-0 transition-colors', activeTab === t.key ? 'text-violet-400' : 'text-white/30 group-hover:text-white/55')}>
                    {t.icon}
                  </span>
                  <span className="text-[0.55rem] font-medium truncate">{t.label}</span>
                </button>
              ))}

              <div className="mt-auto px-2 py-2 border-t border-white/06">
                <button
                  onClick={() => {
                    if (confirm('Reset ALL settings? This cannot be undone.')) {
                      localStorage.removeItem('vk-settings-v9');
                      window.location.reload();
                    }
                  }}
                  className="w-full py-1.5 rounded-xl bg-red-500/08 border border-red-500/14 text-red-400/70 text-[0.5rem] hover:bg-red-500/15 hover:text-red-400 transition-all"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ touchAction: 'pan-y' }}>
            {activeTab === 'visual'        && <VisualContent store={store} />}
            {activeTab === 'style'         && <StyleContent store={store} />}
            {activeTab === 'audio'         && <AudioContent store={store} />}
            {activeTab === 'fx'            && <FxContent store={store} />}
            {activeTab === 'typing'        && <TypingContent store={store} />}
            {activeTab === 'musical'       && <MusicalContent store={store} />}
            {activeTab === 'ui'            && <UiContent store={store} />}
            {activeTab === 'transport'     && <TransportContent store={store} uploadRef={uploadRef} uploadStatus={uploadStatus} handleUpload={handleUpload} />}
            {activeTab === 'presets'       && <PresetsContent store={store} />}
            {activeTab === 'recordings'    && <RecordingsContent store={store} />}
            {activeTab === 'stats'         && <StatsPanel onClose={onClose} />}
            {activeTab === 'goals'         && <GoalsContent store={store} />}
            {activeTab === 'accessibility' && <AccessibilityContent store={store} />}
            {activeTab === 'platform'      && <PlatformContent store={store} />}
            {activeTab === 'map'           && <MapContent />}

            {/* Mobile reset button at bottom */}
            {isCompact && (
              <div className="pt-3 pb-2">
                <button
                  onClick={() => {
                    if (confirm('Reset ALL settings?')) {
                      localStorage.removeItem('vk-settings-v9');
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-red-500/08 border border-red-500/14 text-red-400/70 text-[0.55rem] hover:bg-red-500/15 hover:text-red-400 transition-all"
                >
                  Reset All Data
                </button>
              </div>
            )}
            <div className="h-4" />
          </div>
        </div>
      </div>

      <input ref={uploadRef} type="file" accept=".json,application/json" className="hidden" onChange={handleUpload} />
    </>
  );
}

/* ─── Content sections ──────────────────────────────────────────────────── */

function VisualContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <SectionLabel label="App Theme" />
      <div className="grid grid-cols-5 gap-1.5">
        {APP_THEMES.map(t => (
          <button key={t.id} onClick={() => store.setTheme(t.id as AppTheme)}
            className={cn('py-2 rounded-xl border text-center text-[0.5rem] font-bold capitalize transition-all',
              store.theme === t.id ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        <button onClick={() => { const t = APP_THEMES; store.setTheme(t[Math.floor(Math.random() * t.length)].id as AppTheme); }}
          className="py-2 rounded-xl border border-white/08 text-white/50 hover:text-white hover:border-violet-500/35 text-[0.62rem] font-semibold transition-all">
          🎲 Random Theme
        </button>
        <button onClick={() => { const m = RGB_MODES; store.setRgbMode(m[Math.floor(Math.random() * m.length)].id as RgbMode); }}
          className="py-2 rounded-xl border border-white/08 text-white/50 hover:text-white hover:border-violet-500/35 text-[0.62rem] font-semibold transition-all">
          🎲 Random RGB
        </button>
      </div>

      <Divider label="Custom Colors" />
      <Toggle label="Use Custom Colors" desc="Override theme accent & bg" checked={store.useCustomColors} onChange={() => store.setUseCustomColors(!store.useCustomColors)} />
      {store.useCustomColors && (
        <div className="grid grid-cols-2 gap-2">
          {[{ label: 'Accent', val: store.customAccentColor, set: store.setCustomAccentColor }, { label: 'Background', val: store.customBgColor, set: store.setCustomBgColor }].map(c => (
            <div key={c.label} className="space-y-1">
              <div className="text-[0.5rem] text-white/40">{c.label} Color</div>
              <div className="flex items-center gap-1.5">
                <input type="color" value={c.val} onChange={e => c.set(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-white/15 bg-transparent" style={{ padding: '2px' }} />
                <span className="font-mono text-[0.5rem] text-violet-400">{c.val.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Divider label="Background Effect" />
      <div className="grid grid-cols-4 gap-1.5">
        {BACKGROUND_EFFECTS.map(e => (
          <button key={e.id} onClick={() => store.setBackgroundEffect(e.id as BackgroundEffect)}
            className={cn('py-2 rounded-xl border text-center text-[0.46rem] font-bold transition-all',
              store.backgroundEffect === e.id ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            <div className="text-sm">{e.icon}</div>
            <div className="truncate mt-0.5">{e.label}</div>
          </button>
        ))}
      </div>
      <Slider label="Effect Opacity" value={store.bgEffectOpacity} min={0.1} max={1} step={0.05} display={`${Math.round(store.bgEffectOpacity * 100)}%`} onChange={store.setBgEffectOpacity} />
      <Slider label="Effect Speed" value={store.bgEffectSpeed} min={0.25} max={3} step={0.05} display={`${store.bgEffectSpeed.toFixed(2)}×`} onChange={store.setBgEffectSpeed} />
      <Slider label="BG Blur" value={store.bgBlurAmount} min={0} max={20} step={1} display={`${store.bgBlurAmount}px`} onChange={store.setBgBlurAmount} />
      <Slider label="Particle Density" value={store.particleDensity} min={0.1} max={3} step={0.1} display={`${store.particleDensity.toFixed(1)}×`} onChange={store.setParticleDensity} />
      <Slider label="Particle Speed" value={store.particleSpeed} min={0.1} max={3} step={0.1} display={`${store.particleSpeed.toFixed(1)}×`} onChange={store.setParticleSpeed} />

      <Divider label="RGB Lighting" />
      <Toggle label="RGB Enabled" desc="Enable RGB lighting" checked={store.rgbEnabled} onChange={() => store.setRgbEnabled(!store.rgbEnabled)} />
      {store.rgbEnabled && (
        <>
          <div className="grid grid-cols-4 gap-1.5">
            {RGB_MODES.map(m => (
              <button key={m.id} onClick={() => store.setRgbMode(m.id as RgbMode)}
                className={cn('py-1.5 rounded-lg border text-center text-[0.46rem] font-bold transition-all',
                  store.rgbMode === m.id ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/20 hover:text-white/70')}>
                <div className="text-sm">{m.icon}</div>
                <div className="truncate">{m.label}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={store.rgbCustomColor} onChange={e => store.setRgbCustomColor(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer border border-white/15 bg-transparent shrink-0" style={{ padding: '2px' }} />
            <div className="flex-1">
              <Slider label="Brightness" value={store.rgbBrightness} min={0.1} max={2} step={0.05} display={`${store.rgbBrightness.toFixed(2)}×`} onChange={store.setRgbBrightness} />
            </div>
          </div>
          <Slider label="Saturation" value={store.rgbSaturation} min={0} max={2} step={0.05} display={`${store.rgbSaturation.toFixed(2)}×`} onChange={store.setRgbSaturation} />
          <Slider label="Anim Speed" value={store.rgbAnimSpeed} min={0.1} max={5} step={0.1} display={`${store.rgbAnimSpeed.toFixed(1)}×`} onChange={store.setRgbAnimSpeed} />
        </>
      )}

      <Divider label="Visuals & Controls" />
      <Toggle label="Enable Visuals" desc="Background animations & effects" checked={store.visualsEnabled} onChange={() => store.setVisualsEnabled(!store.visualsEnabled)} />
      <Toggle label="Top Bar Visible" desc="Show stats bar at top" checked={store.topBarVisible} onChange={() => store.setTopBarVisible(!store.topBarVisible)} />
      <Slider label="Focus Mode Dim" value={store.focusModeOpacity} min={0.05} max={0.5} step={0.05} display={`${Math.round(store.focusModeOpacity * 100)}%`} onChange={store.setFocusModeOpacity} />
      <Slider label="Animation Speed" value={store.animationSpeed} min={0.25} max={3} step={0.05} display={`${store.animationSpeed.toFixed(2)}×`} onChange={store.setAnimationSpeed} />

      <Divider label="Data Management" />
      <div className="grid grid-cols-3 gap-1.5">
        <button onClick={() => useStore.setState({ theme: 'aurora', rgbEnabled: true, rgbMode: 'wave', visualsEnabled: true, backgroundEffect: 'none', glowIntensity: 85, animationSpeed: 1.0, keyOpacity: 100, bgBlurAmount: 0, particleDensity: 1.0, particleSpeed: 1.0, bgEffectOpacity: 0.8, bgEffectSpeed: 1.0, useCustomColors: false })} className="py-2 rounded-xl border border-white/08 text-white/40 text-[0.55rem] hover:text-white/70 hover:border-white/15 transition-all">Reset Visual</button>
        <button onClick={() => useStore.setState({ volume: 0.7, reverbEnabled: false, delayEnabled: false, chorusEnabled: false, distortionEnabled: false, compressionEnabled: false, eqBass: 0, eqMid: 0, eqTreble: 0, stereoWidth: 0.5, masterPitch: 0, octaveShift: 0, attackTime: 0.01, releaseTime: 1.5, reverbAmount: 0.4, reverbRoomSize: 0.5, delayTime: 0.3, delayFeedback: 0.35, ambientVolume: 0 })} className="py-2 rounded-xl border border-white/08 text-white/40 text-[0.55rem] hover:text-white/70 hover:border-white/15 transition-all">Reset Audio</button>
        <button onClick={() => useStore.setState({ typingMode: 'free', difficultyLevel: 'intermediate', wordPoolSize: 50, timedDuration: 60, sprintDuration: 15, customText: '' })} className="py-2 rounded-xl border border-white/08 text-white/40 text-[0.55rem] hover:text-white/70 hover:border-white/15 transition-all">Reset Typing</button>
      </div>
    </>
  );
}

function StyleContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <Divider label="Key Shape" />
      <div className="grid grid-cols-4 gap-1.5">
        {(['rounded', 'square', 'pill', 'sharp'] as KeyShape[]).map(s => (
          <button key={s} onClick={() => store.setKeyShape(s)}
            className={cn('py-2 rounded-xl border text-[0.58rem] font-bold capitalize transition-all',
              store.keyShape === s ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            {s}
          </button>
        ))}
      </div>

      <Divider label="Press Effect" />
      <div className="grid grid-cols-3 gap-1.5">
        {(['scale', 'glow', 'sink', 'flash', 'ripple', 'none'] as KeyPressEffect[]).map(e => (
          <button key={e} onClick={() => store.setKeyPressEffect(e)}
            className={cn('py-2 rounded-xl border text-[0.58rem] font-bold capitalize transition-all',
              store.keyPressEffect === e ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            {e}
          </button>
        ))}
      </div>

      <Divider label="Gradient Style" />
      <div className="grid grid-cols-3 gap-1.5">
        {(['none', 'subtle', 'vivid', 'neon', 'aurora', 'metal'] as GradientStyle[]).map(g => (
          <button key={g} onClick={() => store.setGradientStyle(g)}
            className={cn('py-2 rounded-xl border text-[0.58rem] font-bold capitalize transition-all',
              store.gradientStyle === g ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            {g}
          </button>
        ))}
      </div>

      <Divider label="Key Border" />
      <div className="grid grid-cols-4 gap-1.5">
        {(['none', 'thin', 'thick', 'glow', 'inset', 'double'] as KeyBorderStyle[]).map(b => (
          <button key={b} onClick={() => store.setKeyBorderStyle(b)}
            className={cn('py-2 rounded-xl border text-[0.58rem] font-bold capitalize transition-all',
              store.keyBorderStyle === b ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            {b}
          </button>
        ))}
      </div>

      <Divider label="Key Label" />
      <div className="grid grid-cols-4 gap-1.5">
        {(['letter', 'note', 'both', 'none'] as KeyLabelStyle[]).map(l => (
          <button key={l} onClick={() => store.setKeyLabelStyle(l)}
            className={cn('py-2 rounded-xl border text-[0.58rem] font-bold capitalize transition-all',
              store.keyLabelStyle === l ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            {l}
          </button>
        ))}
      </div>

      <Divider label="Glow & Shimmer" />
      <Slider label="Glow Intensity" value={store.glowIntensity} min={0} max={1} step={0.05} display={`${Math.round(store.glowIntensity * 100)}%`} onChange={store.setGlowIntensity} />
      <Slider label="Glow Spread" value={store.keyGlowSpread} min={0} max={40} step={1} display={`${store.keyGlowSpread}px`} onChange={store.setKeyGlowSpread} />
      <Slider label="Glow Blur" value={store.keyGlowBlur} min={2} max={40} step={1} display={`${store.keyGlowBlur}px`} onChange={store.setKeyGlowBlur} />
      <Toggle label="Key Shimmer" desc="Iridescent shimmer effect" checked={store.keyShimmer} onChange={() => store.setKeyShimmer(!store.keyShimmer)} />

      <Divider label="Key 3D & Depth" />
      <Slider label="Perspective" value={store.keyboardPerspective} min={0} max={30} step={1} display={`${store.keyboardPerspective}°`} onChange={store.setKeyboardPerspective} />
      <Slider label="Key Depth" value={store.keyDepth} min={0} max={20} step={1} display={`${store.keyDepth}px`} onChange={store.setKeyDepth} />
      <Slider label="Shadow Intensity" value={store.keyShadowIntensity} min={0} max={1} step={0.05} display={`${Math.round(store.keyShadowIntensity * 100)}%`} onChange={store.setKeyShadowIntensity} />
      <Slider label="Key Spacing" value={store.keySpacing} min={0.5} max={2} step={0.05} display={`${store.keySpacing.toFixed(2)}×`} onChange={store.setKeySpacing} />

      <Divider label="Typing Display" />
      <div className="grid grid-cols-3 gap-1.5">
        {(['left', 'center', 'right'] as KeyboardAlignment[]).map(a => (
          <button key={a} onClick={() => store.setKeyboardAlignment(a)}
            className={cn('py-2 rounded-xl border text-[0.58rem] font-bold capitalize transition-all',
              store.keyboardAlignment === a ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            {a === 'left' ? '⬅️' : a === 'center' ? '↔️' : '➡️'} {a}
          </button>
        ))}
      </div>
      <Slider label="Line Height" value={store.typingLineHeight} min={1.2} max={2.5} step={0.05} display={`${store.typingLineHeight.toFixed(2)}`} onChange={store.setTypingLineHeight} />
      <Slider label="Letter Spacing" value={store.typingLetterSpacing} min={0} max={0.5} step={0.01} display={`${store.typingLetterSpacing.toFixed(2)}em`} onChange={store.setTypingLetterSpacing} />

      <Divider label="Typing Font" />
      <div className="grid grid-cols-4 gap-1.5">
        {([{ v: 'mono', label: 'Mono', ff: 'JetBrains Mono, monospace' }, { v: 'sans', label: 'Sans', ff: 'Chakra Petch, sans-serif' }, { v: 'retro', label: 'Retro', ff: 'Courier New' }, { v: 'orbitron', label: 'Orb', ff: 'monospace' }, { v: 'vt323', label: 'VT323', ff: 'monospace' }, { v: 'ubuntu', label: 'Ubuntu', ff: 'sans-serif' }, { v: 'fira', label: 'Fira', ff: 'monospace' }, { v: 'space', label: 'Space', ff: 'monospace' }]).map(f => (
          <button key={f.v} onClick={() => store.setTypingFont(f.v as any)}
            className={cn('py-2 rounded-xl border text-center transition-all text-[0.5rem] font-bold',
              store.typingFont === f.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            <div className="text-base text-violet-300" style={{ fontFamily: f.ff }}>Aa</div>{f.label}
          </button>
        ))}
      </div>

      <Divider label="Cursor Style" />
      <div className="grid grid-cols-5 gap-1.5">
        {([{ v: 'line', icon: '|', label: 'Line' }, { v: 'block', icon: '▌', label: 'Block' }, { v: 'underscore', icon: '_', label: 'Under' }, { v: 'beam', icon: '▍', label: 'Beam' }, { v: 'none', icon: '○', label: 'None' }]).map(c => (
          <button key={c.v} onClick={() => store.setCursorStyle(c.v as any)}
            className={cn('py-2 rounded-xl border text-center transition-all text-[0.5rem] font-bold',
              store.cursorStyle === c.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            <div className="text-base font-mono text-violet-300">{c.icon}</div>{c.label}
          </button>
        ))}
      </div>
    </>
  );
}

function AudioContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <Divider label="Sound Category" />
      <div className="max-h-44 overflow-y-auto space-y-0.5" style={{ touchAction: 'pan-y' }}>
        {SOUND_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => store.setSoundCategory(cat as SoundCategory)}
            className={cn('w-full text-left px-2.5 py-1.5 rounded-lg text-[0.58rem] transition-all',
              store.soundCategory === cat ? 'bg-violet-500/20 text-violet-300 font-semibold' : 'text-white/45 hover:text-white/75 hover:bg-white/05')}>
            {cat}
          </button>
        ))}
      </div>

      <Divider label="Volume & Pitch" />
      <Slider label="Master Volume" value={store.volume} min={0} max={1} step={0.01} display={`${Math.round(store.volume * 100)}%`} onChange={store.setVolume} />
      <Slider label="Master Pitch" value={store.masterPitch} min={-12} max={12} step={1} display={`${store.masterPitch > 0 ? '+' : ''}${store.masterPitch} st`} onChange={store.setMasterPitch} />
      <Slider label="Octave Shift" value={store.octaveShift} min={-3} max={3} step={1} display={`${store.octaveShift > 0 ? '+' : ''}${store.octaveShift}`} onChange={store.setOctaveShift} />

      <Divider label="Effects" />
      <Toggle label="Reverb" desc="Spatial reverb effect" checked={store.reverbEnabled} onChange={() => store.setEffect('reverb', !store.reverbEnabled)} />
      <Toggle label="Delay" desc="Echo delay effect" checked={store.delayEnabled} onChange={() => store.setEffect('delay', !store.delayEnabled)} />
      <Toggle label="Chorus" desc="Chorus / detune effect" checked={store.chorusEnabled} onChange={() => store.setEffect('chorus', !store.chorusEnabled)} />
      <Toggle label="Distortion" desc="Overdrive distortion" checked={store.distortionEnabled} onChange={() => store.setEffect('distortion', !store.distortionEnabled)} />
      <Toggle label="Compression" desc="Dynamic compression" checked={store.compressionEnabled} onChange={() => store.setEffect('compression', !store.compressionEnabled)} />

      <Divider label="Musical Scale" />
      <Toggle label="Scale Mode" desc="Lock to musical scale" checked={store.scaleEnabled} onChange={() => store.setScaleEnabled(!store.scaleEnabled)} />
      {store.scaleEnabled && (
        <div className="grid grid-cols-2 gap-1.5">
          {MUSICAL_SCALES.map(s => (
            <button key={s.id} onClick={() => store.setMusicalScale(s.id)}
              className={cn('py-1.5 px-2 rounded-lg border text-[0.55rem] text-left transition-all',
                store.musicalScale === s.id ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
              <div className="font-semibold">{s.label}</div>
              <div className="text-[0.44rem] text-white/28">{s.desc}</div>
            </button>
          ))}
        </div>
      )}

      <Divider label="Metronome" />
      <Toggle label="Metronome" desc="Enable click track" checked={store.metronomeEnabled} onChange={() => store.setMetronome(!store.metronomeEnabled)} />
      {store.metronomeEnabled && (
        <>
          <Slider label="BPM" value={store.bpm} min={40} max={240} step={1} display={`${store.bpm}`} onChange={store.setBpm} />
          <div className="grid grid-cols-3 gap-1.5">
            {([{ v: 'click', l: 'Click' }, { v: 'beep', l: 'Beep' }, { v: 'wood', l: 'Wood' }, { v: 'cowbell', l: 'Cowbell' }, { v: 'rim', l: 'Rim' }] as { v: MetronomeSound; l: string }[]).map(m => (
              <button key={m.v} onClick={() => store.setMetronomeSound(m.v)}
                className={cn('py-1.5 rounded-lg border text-[0.55rem] font-bold transition-all',
                  store.metronomeSound === m.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
                {m.l}
              </button>
            ))}
          </div>
          <Toggle label="Accent Beat 1" desc="Emphasize first beat" checked={store.metronomeAccent} onChange={() => store.setMetronomeAccent(!store.metronomeAccent)} />
        </>
      )}

      <Divider label="Feedback Sounds" />
      <Toggle label="Error Sound" desc="Play sound on wrong key" checked={store.errorSoundEnabled} onChange={() => store.setErrorSoundEnabled(!store.errorSoundEnabled)} />
      <Toggle label="Success Sound" desc="Play sound on session complete" checked={store.successSoundEnabled} onChange={() => store.setSuccessSoundEnabled(!store.successSoundEnabled)} />
      <Slider label="Ambient Volume" value={store.ambientVolume} min={0} max={1} step={0.01} display={`${Math.round(store.ambientVolume * 100)}%`} onChange={store.setAmbientVolume} />

      <Divider label="Waveform" />
      <div className="grid grid-cols-4 gap-1.5">
        {([{ v: 'sine', l: 'Sine' }, { v: 'square', l: 'Sqr' }, { v: 'sawtooth', l: 'Saw' }, { v: 'triangle', l: 'Tri' }] as { v: WaveformType; l: string }[]).map(w => (
          <button key={w.v} onClick={() => store.setWaveformType(w.v)}
            className={cn('py-1.5 rounded-lg border text-[0.55rem] font-bold transition-all',
              store.waveformType === w.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
            {w.l}
          </button>
        ))}
      </div>
    </>
  );
}

function FxContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <Divider label="3-Band EQ" />
      <Slider label="Bass" value={store.eqBass} min={-12} max={12} step={0.5} display={`${store.eqBass > 0 ? '+' : ''}${store.eqBass.toFixed(1)} dB`} onChange={store.setEqBass} />
      <Slider label="Mid" value={store.eqMid} min={-12} max={12} step={0.5} display={`${store.eqMid > 0 ? '+' : ''}${store.eqMid.toFixed(1)} dB`} onChange={store.setEqMid} />
      <Slider label="Treble" value={store.eqTreble} min={-12} max={12} step={0.5} display={`${store.eqTreble > 0 ? '+' : ''}${store.eqTreble.toFixed(1)} dB`} onChange={store.setEqTreble} />
      <button onClick={() => { store.setEqBass(0); store.setEqMid(0); store.setEqTreble(0); }}
        className="w-full py-1.5 rounded-xl bg-white/04 border border-white/08 text-[0.6rem] text-white/50 hover:text-white/80 transition-all">
        Reset EQ to Flat
      </button>

      <Divider label="Stereo" />
      <Slider label="Stereo Width" value={store.stereoWidth} min={0} max={1} step={0.05} display={`${Math.round(store.stereoWidth * 100)}%`} onChange={store.setStereoWidth} />

      <Divider label="Delay FX" />
      <Slider label="Delay Time" value={store.delayTime} min={0.05} max={1} step={0.05} display={`${store.delayTime.toFixed(2)}s`} onChange={store.setDelayTime} />
      <Slider label="Delay Feedback" value={store.delayFeedback} min={0} max={0.9} step={0.05} display={`${Math.round(store.delayFeedback * 100)}%`} onChange={store.setDelayFeedback} />

      <Divider label="Reverb FX" />
      <Slider label="Reverb Amount" value={store.reverbAmount} min={0} max={1} step={0.05} display={`${Math.round(store.reverbAmount * 100)}%`} onChange={store.setReverbAmount} />
      <Slider label="Room Size" value={store.reverbRoomSize} min={0} max={1} step={0.05} display={`${Math.round(store.reverbRoomSize * 100)}%`} onChange={store.setReverbRoomSize} />

      <Divider label="Envelope" />
      <Slider label="Attack Time" value={store.attackTime} min={0.001} max={0.5} step={0.001} display={`${(store.attackTime * 1000).toFixed(0)}ms`} onChange={store.setAttackTime} />
      <Slider label="Release Time" value={store.releaseTime} min={0.05} max={5} step={0.05} display={`${store.releaseTime.toFixed(2)}s`} onChange={store.setReleaseTime} />
      <Slider label="Note Duration ×" value={store.noteDurationMult} min={0.25} max={4} step={0.25} display={`${store.noteDurationMult.toFixed(2)}×`} onChange={store.setNoteDurationMult} />

      <Divider label="Polyphony & Velocity" />
      <Slider label="Polyphony Limit" value={store.polyphonyLimit} min={1} max={16} step={1} display={`${store.polyphonyLimit} voices`} onChange={store.setPolyphonyLimit} />
      <Slider label="Velocity Sensitivity" value={store.velocitySensitivity} min={0} max={1} step={0.05} display={`${Math.round(store.velocitySensitivity * 100)}%`} onChange={store.setVelocitySensitivity} />
    </>
  );
}

function TypingContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <Divider label="Typing Mode" />
      <div className="max-h-52 overflow-y-auto space-y-0.5" style={{ touchAction: 'pan-y' }}>
        {TYPING_MODES.map(m => (
          <button key={m.value} onClick={() => store.setTypingMode(m.value as any)}
            className={cn('w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all',
              store.typingMode === m.value ? 'bg-violet-500/20 text-violet-300 font-semibold' : 'text-white/45 hover:text-white/75 hover:bg-white/05')}>
            <span className="text-xs">{m.icon}</span>
            <span className="text-[0.62rem]">{m.label}</span>
          </button>
        ))}
      </div>

      {store.typingMode === 'lesson' && (
        <>
          <Divider label="Lesson" />
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(LESSON_LABELS).map(([n, label]) => (
              <button key={n} onClick={() => store.setLessonNumber(parseInt(n))}
                className={cn('py-1.5 px-2 rounded-lg border text-[0.55rem] transition-all text-left',
                  store.lessonNumber === parseInt(n) ? 'border-violet-500 bg-violet-500/18 text-white font-semibold' : 'border-white/08 text-white/45 hover:text-white/75')}>
                <span className="text-white/30">{n}.</span> {label}
              </button>
            ))}
          </div>
          <Toggle label="Auto-Advance Lesson" desc="Auto-advance to next lesson" checked={store.autoAdvanceLesson} onChange={() => store.setAutoAdvanceLesson(!store.autoAdvanceLesson)} />
        </>
      )}

      {store.typingMode === 'custom' && (
        <>
          <Divider label="Custom Text" />
          <textarea value={store.customText || ''}
            onChange={e => store.setCustomText(e.target.value)}
            placeholder="Enter your custom text here…"
            className="w-full h-20 bg-white/04 border border-white/10 rounded-lg px-2.5 py-2 text-[0.62rem] text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-violet-500/40"
            style={{ touchAction: 'pan-y', userSelect: 'text', WebkitUserSelect: 'text' }} />
        </>
      )}

      {store.typingMode === 'timed' && (
        <>
          <Divider label="Timed Duration" />
          <div className="grid grid-cols-4 gap-1.5">
            {[15, 30, 60, 120].map(d => (
              <button key={d} onClick={() => store.setTimedDuration(d)}
                className={cn('py-2 rounded-xl border text-[0.65rem] font-bold transition-all',
                  store.timedDuration === d ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
                {d}s
              </button>
            ))}
          </div>
        </>
      )}

      <Divider label="Difficulty" />
      <div className="grid grid-cols-2 gap-1.5">
        {([{ v: 'beginner', l: '🌱 Beginner' }, { v: 'intermediate', l: '⚡ Intermediate' }, { v: 'expert', l: '💎 Expert' }, { v: 'master', l: '👑 Master' }] as { v: DifficultyLevel; l: string }[]).map(d => (
          <button key={d.v} onClick={() => store.setDifficultyLevel(d.v)}
            className={cn('py-2 rounded-xl border text-[0.55rem] font-bold transition-all',
              store.difficultyLevel === d.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            {d.l}
          </button>
        ))}
      </div>

      <Divider label="Word Pool" />
      <Slider label="Word Pool Size" value={store.wordPoolSize} min={10} max={500} step={10} display={`${store.wordPoolSize}`} onChange={store.setWordPoolSize} />

      <Divider label="Tweaks" />
      <Toggle label="Show Word Number" desc="Display word index counter" checked={store.showWordNumber} onChange={() => store.setShowWordNumber(!store.showWordNumber)} />
      <Toggle label="Auto-Save Session" desc="Auto-save typing sessions" checked={store.autoSaveSession} onChange={() => store.setAutoSaveSession(!store.autoSaveSession)} />
      <Toggle label="Show Keyboard Shortcuts" desc="Display hotkey hints" checked={store.showKeyboardShortcuts} onChange={() => store.setShowKeyboardShortcuts(!store.showKeyboardShortcuts)} />
      <Slider label="Break Reminder" value={store.breakReminderInterval} min={0} max={120} step={5} display={store.breakReminderInterval === 0 ? 'Off' : `${store.breakReminderInterval}m`} onChange={store.setBreakReminderInterval} />

      <Divider label="Key Size" />
      <Slider label="Key Size" value={store.keySize} min={60} max={130} step={5} display={`${store.keySize}%`} onChange={store.setKeySize} />

      <Divider label="Heatmap" />
      <Toggle label="Show Heatmap" desc="Key usage heatmap" checked={store.showHeatmap} onChange={() => store.setShowHeatmap(!store.showHeatmap)} />
      {store.showHeatmap && (
        <>
          <Slider label="Heatmap Opacity" value={store.heatmapOpacity} min={0.1} max={1} step={0.05} display={`${Math.round(store.heatmapOpacity * 100)}%`} onChange={store.setHeatmapOpacity} />
          <Toggle label="Heatmap Decay" desc="Fade heatmap over time" checked={store.heatmapDecay} onChange={() => store.setHeatmapDecay(!store.heatmapDecay)} />
        </>
      )}

      <Divider label="Progress Bar Style" />
      <div className="grid grid-cols-4 gap-1.5">
        {([{ v: 'line', l: 'Line', i: '▬' }, { v: 'ring', l: 'Ring', i: '⭕' }, { v: 'dots', l: 'Dots', i: '⋯' }, { v: 'none', l: 'None', i: '○' }] as { v: ProgressBarStyle; l: string; i: string }[]).map(p => (
          <button key={p.v} onClick={() => store.setProgressBarStyle(p.v)}
            className={cn('py-2 rounded-xl border text-center transition-all text-[0.5rem] font-bold',
              store.progressBarStyle === p.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
            <div className="text-sm mb-0.5">{p.i}</div>{p.l}
          </button>
        ))}
      </div>

      <Divider label="Stats Visibility" />
      <Toggle label="Show WPM" desc="Words per minute" checked={store.showWpmStat} onChange={() => store.setShowWpmStat(!store.showWpmStat)} />
      <Toggle label="Show CPM" desc="Characters per minute" checked={store.showCpmStat} onChange={() => store.setShowCpmStat(!store.showCpmStat)} />
      <Toggle label="Show Accuracy" desc="Accuracy %" checked={store.showAccuracyStat} onChange={() => store.setShowAccuracyStat(!store.showAccuracyStat)} />
      <Toggle label="Show Errors" desc="Error count" checked={store.showErrorsStat} onChange={() => store.setShowErrorsStat(!store.showErrorsStat)} />
      <Toggle label="Show Timer" desc="Session timer" checked={store.showTimerStat} onChange={() => store.setShowTimerStat(!store.showTimerStat)} />
    </>
  );
}

function MusicalContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <Toggle label="Chord Mode" desc="Play chords instead of single notes" checked={store.chordMode} onChange={() => store.setChordMode(!store.chordMode)} />
      <Toggle label="Arpeggio Mode" desc="Arpeggiate chords" checked={store.arpeggioMode} onChange={() => store.setArpeggioMode(!store.arpeggioMode)} />
      <Toggle label="Sustain Mode" desc="Sustain notes until key release" checked={store.sustainMode} onChange={() => store.setSustainMode(!store.sustainMode)} />
      <Toggle label="Glide Mode" desc="Smooth pitch glide between notes" checked={store.glideMode} onChange={() => store.setGlideMode(!store.glideMode)} />
      <Toggle label="Scale Lock" desc="Lock notes to musical scale" checked={store.scaleLock} onChange={() => store.setScaleLock(!store.scaleLock)} />
      <Toggle label="Panning" desc="Stereo panning per note" checked={store.panningEnabled} onChange={() => store.setPanningEnabled(!store.panningEnabled)} />
      <Toggle label="Drone Note" desc="Continuous drone note" checked={store.droneNote} onChange={() => store.setDroneNote(!store.droneNote)} />
      <Slider label="Glide Speed" value={store.glideSpeed} min={0.01} max={1} step={0.01} display={`${store.glideSpeed.toFixed(2)}s`} onChange={store.setGlideSpeed} />
      <Slider label="Arpeggio Rate" value={store.arpeggioRate} min={0.05} max={1} step={0.05} display={`${store.arpeggioRate.toFixed(2)}s`} onChange={store.setArpeggioRate} />

      <Divider label="Chord Voicing" />
      <div className="grid grid-cols-4 gap-1.5">
        {([{ v: 'basic', l: 'Basic' }, { v: 'jazz', l: 'Jazz' }, { v: 'power', l: 'Power' }, { v: 'spread', l: 'Spread' }] as { v: ChordVoicing; l: string }[]).map(c => (
          <button key={c.v} onClick={() => store.setChordVoicing(c.v)}
            className={cn('py-1.5 rounded-lg border text-[0.55rem] font-bold transition-all',
              store.chordVoicing === c.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
            {c.l}
          </button>
        ))}
      </div>
    </>
  );
}

function UiContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <Divider label="WPM Chart" />
      <Toggle label="WPM Chart" desc="Show WPM sparkline in dock" checked={store.showWpmChart} onChange={() => store.setShowWpmChart(!store.showWpmChart)} />
      {store.showWpmChart && (
        <>
          <div className="grid grid-cols-3 gap-1.5">
            {([{ v: 'line', l: 'Line' }, { v: 'bar', l: 'Bar' }, { v: 'area', l: 'Area' }] as { v: WpmChartStyle; l: string }[]).map(s => (
              <button key={s.v} onClick={() => store.setWpmChartStyle(s.v)}
                className={cn('py-1.5 rounded-lg border text-[0.55rem] font-bold transition-all',
                  store.wpmChartStyle === s.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
                {s.l}
              </button>
            ))}
          </div>
          <Slider label="Chart Points" value={store.wpmChartPoints} min={10} max={100} step={5} display={`${store.wpmChartPoints}`} onChange={store.setWpmChartPoints} />
        </>
      )}

      <Divider label="Achievements" />
      <Slider label="Toast Duration" value={store.achievementDuration} min={1000} max={8000} step={500} display={`${(store.achievementDuration / 1000).toFixed(1)}s`} onChange={store.setAchievementDuration} />
      <Toggle label="Achievement Sound" desc="Play sound on achievement" checked={store.achievementSoundEnabled} onChange={() => store.setAchievementSoundEnabled(!store.achievementSoundEnabled)} />
      <div className="grid grid-cols-3 gap-1.5">
        {([{ v: 'top-left', l: 'Top L' }, { v: 'top-right', l: 'Top R' }, { v: 'bottom-right', l: 'Bot R' }] as { v: AchievementPosition; l: string }[]).map(p => (
          <button key={p.v} onClick={() => store.setAchievementPosition(p.v)}
            className={cn('py-1.5 rounded-lg border text-[0.55rem] font-bold transition-all',
              store.achievementPosition === p.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
            {p.l}
          </button>
        ))}
      </div>

      <Divider label="Note Visualizer" />
      <div className="grid grid-cols-3 gap-1.5">
        {([{ v: 'bubbles', l: 'Bubbles' }, { v: 'sparks', l: 'Sparks' }, { v: 'notes', l: 'Notes' }, { v: 'rings', l: 'Rings' }, { v: 'lines', l: 'Lines' }, { v: 'petals', l: 'Petals' }] as { v: NoteVisualizerStyle; l: string }[]).map(n => (
          <button key={n.v} onClick={() => store.setNoteVisualizerStyle(n.v)}
            className={cn('py-1.5 rounded-lg border text-[0.55rem] font-bold transition-all',
              store.noteVisualizerStyle === n.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
            {n.l}
          </button>
        ))}
      </div>
      <Slider label="Visualizer Speed" value={store.noteVisualizerSpeed} min={0.25} max={4} step={0.25} display={`${store.noteVisualizerSpeed}×`} onChange={store.setNoteVisualizerSpeed} />
      <Slider label="Visualizer Density" value={store.noteVisualizerDensity} min={0.25} max={4} step={0.25} display={`${store.noteVisualizerDensity}×`} onChange={store.setNoteVisualizerDensity} />

      <Divider label="Stats Display" />
      <Toggle label="Show Session Comparison" desc="Compare with previous session" checked={store.showPrevSessionComparison} onChange={() => store.setShowPrevSessionComparison(!store.showPrevSessionComparison)} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.62rem] font-medium text-white/75">Stats Columns</span>
        <div className="flex gap-1">
          {([1, 2] as const).map(n => (
            <button key={n} onClick={() => store.setStatsColumns(n)}
              className={cn('w-8 h-6 rounded-lg border text-[0.6rem] font-bold transition-all',
                store.statsColumns === n ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/40 hover:text-white/75')}>
              {n}
            </button>
          ))}
        </div>
      </div>
      <Slider label="Session History" value={store.sessionHistoryLength} min={5} max={100} step={5} display={`${store.sessionHistoryLength}`} onChange={store.setSessionHistoryLength} />
      <Toggle label="Transport Dock" desc="Show transport controls" checked={store.transportDockVisible} onChange={() => store.setTransportDockVisible(!store.transportDockVisible)} />
      <Toggle label="FPS Counter" desc="Show FPS in corner" checked={store.showFpsCounter} onChange={() => store.setShowFpsCounter(!store.showFpsCounter)} />
      <Toggle label="Memory Usage" desc="Show memory usage" checked={store.showMemoryUsage} onChange={() => store.setShowMemoryUsage(!store.showMemoryUsage)} />
      <Toggle label="Analytics" desc="Enable analytics tracking" checked={store.analyticsEnabled} onChange={() => store.setAnalyticsEnabled(!store.analyticsEnabled)} />
    </>
  );
}

function TransportContent({ store, uploadRef, uploadStatus, handleUpload }: {
  store: ReturnType<typeof useStore.getState>;
  uploadRef: React.RefObject<HTMLInputElement | null>;
  uploadStatus: string;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { isRecording, isPlaying, recordedEvents, playbackSpeed, loopEnabled, startRecording, stopRecording, playRecording, stopPlayback, setPlaybackSpeed, setLoop } = store;
  const hasRecording = recordedEvents.length > 0;

  const handleExport = () => {
    if (!hasRecording) return;
    const blob = new Blob([JSON.stringify(recordedEvents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `vk-recording-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <p className="text-[0.55rem] text-white/35 leading-relaxed">
        Record your keyboard sessions and play them back. Export as JSON or save to the cloud.
      </p>

      <div className="flex justify-center items-center gap-3 py-3">
        <button onClick={isRecording ? stopRecording : startRecording}
          className={cn('w-11 h-11 rounded-full flex items-center justify-center border transition-all',
            isRecording ? 'bg-red-500/25 border-red-500/60 text-red-400 shadow-[0_0_14px_rgba(255,80,80,0.4)]' : 'bg-white/05 border-white/12 text-white/60 hover:text-white hover:bg-white/12')}
          title={isRecording ? 'Stop Recording' : 'Record'}>
          {isRecording ? <Square className="w-4.5 h-4.5 fill-current" /> : <Circle className="w-4.5 h-4.5 fill-current" />}
        </button>
        <button onClick={isPlaying ? stopPlayback : playRecording}
          disabled={isRecording || (!hasRecording && !isPlaying)}
          className={cn('w-14 h-14 rounded-full flex items-center justify-center border transition-all',
            isPlaying ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : 'bg-white/05 border-white/12 text-white/60 hover:text-white hover:bg-white/12',
            (isRecording || (!hasRecording && !isPlaying)) && 'opacity-25 cursor-not-allowed pointer-events-none')}>
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" style={{ marginLeft: '2px' }} />}
        </button>
        <button onClick={stopPlayback} disabled={!isPlaying}
          className={cn('w-11 h-11 rounded-full flex items-center justify-center border transition-all bg-white/05 border-white/12 text-white/60 hover:text-white hover:bg-white/12',
            !isPlaying && 'opacity-25 cursor-not-allowed pointer-events-none')}>
          <Square className="w-4.5 h-4.5 fill-current" />
        </button>
        <button onClick={() => setLoop(!loopEnabled)}
          className={cn('w-11 h-11 rounded-full flex items-center justify-center border transition-all',
            loopEnabled ? 'bg-violet-500/22 border-violet-500/55 text-violet-300' : 'bg-white/05 border-white/12 text-white/60 hover:text-white')}>
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {isRecording && (
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 rec-indicator" />
          <span className="text-xs text-red-400 font-mono font-bold">{recordedEvents.length} events recorded</span>
        </div>
      )}
      {isPlaying && (
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-mono font-bold">PLAYING</span>
        </div>
      )}

      <Slider label="Playback Speed" value={playbackSpeed} min={0.5} max={2} step={0.1} display={`${playbackSpeed.toFixed(1)}×`} onChange={setPlaybackSpeed} />

      {hasRecording && (
        <div className="bg-white/03 border border-white/07 rounded-xl px-3 py-2 text-center">
          <div className="text-[0.48rem] text-white/35 uppercase tracking-wider">Loaded Events</div>
          <div className="text-sm font-mono text-white font-bold">{recordedEvents.length}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleExport} disabled={!hasRecording}
          className={cn('flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[0.62rem] font-semibold transition-all',
            hasRecording ? 'bg-white/05 border-white/10 text-white/65 hover:bg-violet-500/15 hover:text-violet-200 hover:border-violet-500/35' : 'opacity-25 cursor-not-allowed bg-transparent border-white/05 text-white/25')}>
          <Download className="w-3.5 h-3.5" />Export JSON
        </button>
        <button onClick={() => uploadRef.current?.click()}
          className={cn('flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[0.62rem] font-semibold transition-all',
            uploadStatus === 'ok' ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
              : uploadStatus === 'err' ? 'bg-red-500/15 border-red-500/35 text-red-300'
              : 'bg-white/05 border-white/10 text-white/65 hover:bg-emerald-500/15 hover:text-emerald-200 hover:border-emerald-500/35')}>
          <Upload className="w-3.5 h-3.5" />{uploadStatus === 'ok' ? 'Loaded!' : uploadStatus === 'err' ? 'Error!' : 'Upload JSON'}
        </button>
      </div>
    </>
  );
}

function PresetsContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  const qc = useQueryClient();
  const { data: presets, isLoading } = useListPresets({ sessionId: SESSION_ID });
  const createPreset = useCreatePreset({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/presets'] }) } });
  const deletePreset = useDeletePreset({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/presets'] }) } });
  const [newName, setNewName] = useState('');

  const handleSave = useCallback(() => {
    const name = newName.trim() || `Preset ${Date.now()}`;
    const s = useStore.getState();
    createPreset.mutate({
      data: {
        name, sessionId: SESSION_ID, isPublic: false,
        settings: {
          theme: s.theme, rgbMode: s.rgbMode, rgbCustomColor: s.rgbCustomColor,
          soundCategory: s.soundCategory, typingMode: s.typingMode,
          keyShape: s.keyShape, keyPressEffect: s.keyPressEffect,
          gradientStyle: s.gradientStyle, keyBorderStyle: s.keyBorderStyle,
          volume: s.volume, glowIntensity: s.glowIntensity, keySize: s.keySize,
          backgroundEffect: s.backgroundEffect, animationSpeed: s.animationSpeed,
          reverbEnabled: s.reverbEnabled, delayEnabled: s.delayEnabled,
          metronomeEnabled: s.metronomeEnabled, bpm: s.bpm,
          musicalScale: s.musicalScale, scaleEnabled: s.scaleEnabled,
          rgbEnabled: s.rgbEnabled, visualsEnabled: s.visualsEnabled,
        },
      },
    });
    setNewName('');
  }, [newName, createPreset]);

  const applyPreset = useCallback((settings: any) => {
    if (!settings) return;
    const s = settings as any;
    if (s.theme) useStore.setState({ theme: s.theme });
    if (s.rgbMode) useStore.setState({ rgbMode: s.rgbMode });
    if (s.rgbCustomColor) useStore.setState({ rgbCustomColor: s.rgbCustomColor });
    if (s.soundCategory) useStore.setState({ soundCategory: s.soundCategory });
    if (s.typingMode) useStore.setState({ typingMode: s.typingMode });
    if (s.keyShape) useStore.setState({ keyShape: s.keyShape });
    if (s.keyPressEffect) useStore.setState({ keyPressEffect: s.keyPressEffect });
    if (s.gradientStyle) useStore.setState({ gradientStyle: s.gradientStyle });
    if (s.keyBorderStyle) useStore.setState({ keyBorderStyle: s.keyBorderStyle });
    if (s.volume !== undefined) useStore.setState({ volume: s.volume });
    if (s.glowIntensity !== undefined) useStore.setState({ glowIntensity: s.glowIntensity });
    if (s.keySize !== undefined) useStore.setState({ keySize: s.keySize });
    if (s.backgroundEffect) useStore.setState({ backgroundEffect: s.backgroundEffect });
    if (s.animationSpeed !== undefined) useStore.setState({ animationSpeed: s.animationSpeed });
    if (s.reverbEnabled !== undefined) useStore.setState({ reverbEnabled: s.reverbEnabled });
    if (s.delayEnabled !== undefined) useStore.setState({ delayEnabled: s.delayEnabled });
    if (s.metronomeEnabled !== undefined) useStore.setState({ metronomeEnabled: s.metronomeEnabled });
    if (s.bpm !== undefined) useStore.setState({ bpm: s.bpm });
    if (s.musicalScale) useStore.setState({ musicalScale: s.musicalScale });
    if (s.scaleEnabled !== undefined) useStore.setState({ scaleEnabled: s.scaleEnabled });
    if (s.rgbEnabled !== undefined) useStore.setState({ rgbEnabled: s.rgbEnabled });
    if (s.visualsEnabled !== undefined) useStore.setState({ visualsEnabled: s.visualsEnabled });
  }, []);

  return (
    <>
      <p className="text-[0.52rem] text-white/35 leading-relaxed">
        Save your current settings as a named cloud preset. Load them any time from any session.
      </p>
      <div className="flex gap-2">
        <input value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="Preset name…"
          className="flex-1 bg-white/04 border border-white/10 rounded-lg px-2.5 py-1.5 text-[0.62rem] text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/40"
          onKeyDown={e => e.key === 'Enter' && handleSave()} />
        <button onClick={handleSave} disabled={createPreset.isPending}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[0.62rem] font-semibold hover:bg-violet-500/30 transition-all disabled:opacity-50">
          <Save className="w-3 h-3" />Save
        </button>
      </div>
      {isLoading && <p className="text-[0.55rem] text-white/30 text-center py-2">Loading presets…</p>}
      {presets && presets.length === 0 && (
        <p className="text-[0.55rem] text-white/25 text-center py-4 bg-white/02 border border-white/06 rounded-xl">No saved presets yet. Save one above!</p>
      )}
      <div className="space-y-1.5">
        {presets?.map((p: any) => (
          <div key={p.id} className="flex items-center gap-2 bg-white/03 border border-white/07 rounded-xl px-3 py-2.5 hover:border-white/12 transition-all">
            <div className="flex-1 min-w-0">
              <div className="text-[0.65rem] font-semibold text-white/80 truncate">{p.name}</div>
              <div className="text-[0.46rem] text-white/28">{new Date(p.createdAt).toLocaleDateString()}</div>
            </div>
            <button onClick={() => applyPreset(p.settings)}
              className="px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[0.55rem] hover:bg-violet-500/25 transition-all">
              Apply
            </button>
            <button onClick={() => deletePreset.mutate({ id: p.id })}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/07 text-white/30 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function RecordingsContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  const qc = useQueryClient();
  const { data: recordings, isLoading } = useListRecordings({ sessionId: SESSION_ID });
  const createRecording = useCreateRecording({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/recordings'] }) } });
  const deleteRecording = useDeleteRecording({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/recordings'] }) } });
  const [newName, setNewName] = useState('');
  const { recordedEvents, loadRecording } = store;
  const hasRecording = recordedEvents.length > 0;

  const handleSaveToCloud = useCallback(() => {
    if (!hasRecording) return;
    const name = newName.trim() || `Recording ${Date.now()}`;
    const duration = recordedEvents.length > 0 ? recordedEvents[recordedEvents.length - 1].timestamp - recordedEvents[0].timestamp : 0;
    createRecording.mutate({
      data: { name, sessionId: SESSION_ID, events: recordedEvents as any, duration: Math.round(duration), bpm: useStore.getState().bpm },
    });
    setNewName('');
  }, [newName, hasRecording, recordedEvents, createRecording]);

  return (
    <>
      <p className="text-[0.52rem] text-white/35 leading-relaxed">
        Save your current recording to the cloud. Load cloud recordings to replay them anytime.
      </p>
      {hasRecording ? (
        <div className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Recording name…"
            className="flex-1 bg-white/04 border border-white/10 rounded-lg px-2.5 py-1.5 text-[0.62rem] text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/40"
            onKeyDown={e => e.key === 'Enter' && handleSaveToCloud()} />
          <button onClick={handleSaveToCloud} disabled={createRecording.isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[0.62rem] font-semibold hover:bg-emerald-500/30 transition-all disabled:opacity-50">
            <Save className="w-3 h-3" />Upload
          </button>
        </div>
      ) : (
        <p className="text-[0.55rem] text-white/25 text-center py-3 bg-white/02 border border-white/06 rounded-xl">
          No active recording. Use Transport controls to record first.
        </p>
      )}
      {isLoading && <p className="text-[0.55rem] text-white/30 text-center py-2">Loading recordings…</p>}
      {recordings && recordings.length === 0 && (
        <p className="text-[0.55rem] text-white/25 text-center py-4 bg-white/02 border border-white/06 rounded-xl">No cloud recordings yet.</p>
      )}
      <div className="space-y-1.5">
        {recordings?.map((r: any) => (
          <div key={r.id} className="flex items-center gap-2 bg-white/03 border border-white/07 rounded-xl px-3 py-2.5 hover:border-white/12 transition-all">
            <div className="flex-1 min-w-0">
              <div className="text-[0.65rem] font-semibold text-white/80 truncate">{r.name}</div>
              <div className="text-[0.46rem] text-white/28">{r.events?.length || 0} events · {r.bpm} BPM · {new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            <button onClick={() => loadRecording(r.events || [])}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[0.55rem] hover:bg-emerald-500/25 transition-all">
              Load
            </button>
            <button onClick={() => deleteRecording.mutate({ id: r.id })}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/07 text-white/30 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function GoalsContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/03 border border-white/08 rounded-xl p-3 text-center">
          <div className="text-lg font-black text-amber-300">{store.bestWpm}</div>
          <div className="text-[0.48rem] text-white/35 uppercase tracking-wider mt-0.5">Best WPM</div>
        </div>
        <div className="bg-white/03 border border-white/08 rounded-xl p-3 text-center">
          <div className="text-lg font-black text-emerald-300">{store.bestAccuracy}%</div>
          <div className="text-[0.48rem] text-white/35 uppercase tracking-wider mt-0.5">Best Accuracy</div>
        </div>
        <div className="bg-white/03 border border-white/08 rounded-xl p-3 text-center">
          <div className="text-lg font-black text-orange-300 flex items-center justify-center gap-1">
            <Flame className="w-4 h-4" />{store.dailyStreak}
          </div>
          <div className="text-[0.48rem] text-white/35 uppercase tracking-wider mt-0.5">Day Streak</div>
        </div>
        <div className="bg-white/03 border border-white/08 rounded-xl p-3 text-center">
          <div className="text-lg font-black text-violet-300">{store.xp.toLocaleString()}</div>
          <div className="text-[0.48rem] text-white/35 uppercase tracking-wider mt-0.5">Total XP</div>
        </div>
      </div>

      <Divider label="All Achievements" />
      <div className="space-y-1">
        {ACHIEVEMENTS.map(ach => {
          const unlocked = store.unlockedAchievements.includes(ach.id);
          const rarity = RARITY_COLORS[ach.rarity];
          return (
            <div key={ach.id}
              className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all',
                unlocked ? `${rarity.bg} ${rarity.border}` : 'border-white/05 bg-white/02 opacity-45')}>
              <span className="text-xl shrink-0">{ach.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={cn('text-[0.65rem] font-semibold', unlocked ? rarity.text : 'text-white/40')}>{ach.title}</div>
                <div className="text-[0.48rem] text-white/28 truncate">{ach.desc}</div>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                {unlocked && <div className="text-emerald-400 text-xs">✓</div>}
                <span className="text-[0.44rem] text-white/30">+{ach.xp} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function AccessibilityContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <Toggle label="High Contrast" desc="Enhanced color contrast" checked={store.highContrast} onChange={() => store.setHighContrast(!store.highContrast)} />
      <Toggle label="Reduce Motion" desc="Minimize animations" checked={store.reduceMotion} onChange={() => store.setReduceMotion(!store.reduceMotion)} />
      <Toggle label="Dyslexia Font" desc="OpenDyslexic font" checked={store.dyslexiaFont} onChange={() => store.setDyslexiaFont(!store.dyslexiaFont)} />
      <Toggle label="Large Text Mode" desc="Increase all text sizes" checked={store.largeTextMode} onChange={() => store.setLargeTextMode(!store.largeTextMode)} />
      <Toggle label="Blind Mode" desc="Audio-only — no visuals" checked={store.blindMode} onChange={() => store.setBlindMode(!store.blindMode)} />
      <Toggle label="Mirror Keyboard" desc="Flip for left-hand play" checked={store.mirrorKeyboard} onChange={() => store.setMirrorKeyboard(!store.mirrorKeyboard)} />
      <Toggle label="Finger Guide" desc="Show finger hints" checked={store.showFingerGuide} onChange={() => store.setShowFingerGuide(!store.showFingerGuide)} />

      <Divider label="Color Blind Mode" />
      <div className="grid grid-cols-2 gap-1.5">
        {([{ v: 'none', l: 'None' }, { v: 'protanopia', l: 'Protanopia' }, { v: 'deuteranopia', l: 'Deuteranopia' }, { v: 'tritanopia', l: 'Tritanopia' }] as { v: ColorBlindMode; l: string }[]).map(c => (
          <button key={c.v} onClick={() => store.setColorBlindMode(c.v)}
            className={cn('py-1.5 rounded-lg border text-[0.55rem] font-bold transition-all',
              store.colorBlindMode === c.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
            {c.l}
          </button>
        ))}
      </div>
    </>
  );
}

function PlatformContent({ store }: { store: ReturnType<typeof useStore.getState> }) {
  return (
    <>
      <Toggle label="Performance Mode" desc="Reduce visual effects for speed" checked={store.performanceMode} onChange={() => store.setPerformanceMode(!store.performanceMode)} />
      <Toggle label="Auto Performance" desc="Auto-enable on low-end devices" checked={store.autoPerformanceMode} onChange={() => store.setAutoPerformanceMode(!store.autoPerformanceMode)} />

      <Divider label="FPS Target" />
      <div className="grid grid-cols-3 gap-1.5">
        {([{ v: '30', l: '30 FPS' }, { v: '60', l: '60 FPS' }, { v: 'max', l: 'Max FPS' }] as { v: FpsTarget; l: string }[]).map(f => (
          <button key={f.v} onClick={() => store.setFpsTarget(f.v)}
            className={cn('py-1.5 rounded-lg border text-[0.55rem] font-bold transition-all',
              store.fpsTarget === f.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
            {f.l}
          </button>
        ))}
      </div>

      <Toggle label="Adaptive Quality" desc="Auto-adjust quality to FPS" checked={store.adaptiveQuality} onChange={() => store.setAdaptiveQuality(!store.adaptiveQuality)} />
      <Toggle label="GPU Acceleration" desc="Use GPU for rendering" checked={store.gpuAcceleration} onChange={() => store.setGpuAcceleration(!store.gpuAcceleration)} />
      <Toggle label="RAF Throttling" desc="Throttle requestAnimationFrame" checked={store.rafThrottling} onChange={() => store.setRafThrottling(!store.rafThrottling)} />
      <Toggle label="CSS Containment" desc="Isolate layout reflows" checked={store.cssContainment} onChange={() => store.setCssContainment(!store.cssContainment)} />
      <Slider label="Debounce Delay" value={store.debounceDelay} min={0} max={100} step={5} display={`${store.debounceDelay}ms`} onChange={store.setDebounceDelay} />

      <Divider label="Audio Engine" />
      <Slider label="Audio Buffer Size" value={store.audioBufferSize} min={128} max={4096} step={128} display={`${store.audioBufferSize}`} onChange={store.setAudioBufferSize} />
      <Toggle label="Suspend on Idle" desc="Pause audio context when idle" checked={store.audioSuspendOnIdle} onChange={() => store.setAudioSuspendOnIdle(!store.audioSuspendOnIdle)} />
      <Slider label="Suspend Delay" value={store.audioSuspendDelay} min={1} max={60} step={1} display={`${store.audioSuspendDelay}s`} onChange={store.setAudioSuspendDelay} />

      <Divider label="Note Overlap" />
      <div className="grid grid-cols-3 gap-1.5">
        {([{ v: 'stop', l: 'Stop' }, { v: 'overlap', l: 'Overlap' }, { v: 'fade', l: 'Fade' }] as { v: NoteOverlapBehavior; l: string }[]).map(n => (
          <button key={n.v} onClick={() => store.setNoteOverlapBehavior(n.v)}
            className={cn('py-1.5 rounded-lg border text-[0.55rem] font-bold transition-all',
              store.noteOverlapBehavior === n.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:text-white/75')}>
            {n.l}
          </button>
        ))}
      </div>

      <Divider label="Mobile & Touch" />
      <Toggle label="Haptic Feedback" desc="Vibration on key press" checked={store.hapticEnabled} onChange={() => store.setHapticEnabled(!store.hapticEnabled)} />
      <Toggle label="Touch Optimization" desc="Optimize for touch input" checked={store.touchOptimization} onChange={() => store.setTouchOptimization(!store.touchOptimization)} />
      <Toggle label="Swipe Navigation" desc="Swipe to navigate modes" checked={store.swipeNavigation} onChange={() => store.setSwipeNavigation(!store.swipeNavigation)} />
      <Toggle label="Pinch Zoom" desc="Allow pinch-to-zoom on keyboard" checked={store.pinchZoom} onChange={() => store.setPinchZoom(!store.pinchZoom)} />
      <Toggle label="Page Visibility Pause" desc="Pause when tab hidden" checked={store.pageVisibilityPause} onChange={() => store.setPageVisibilityPause(!store.pageVisibilityPause)} />
      <Toggle label="Battery Optimization" desc="Reduce effects on low battery" checked={store.batteryOptimization} onChange={() => store.setBatteryOptimization(!store.batteryOptimization)} />
      <Toggle label="Wake Lock" desc="Prevent screen sleep" checked={store.wakeLock} onChange={() => store.setWakeLock(!store.wakeLock)} />

      <Divider label="Storage & Network" />
      <Toggle label="Offline Mode" desc="Work without internet" checked={store.offlineMode} onChange={() => store.setOfflineMode(!store.offlineMode)} />
      <Toggle label="Network Adaptive" desc="Adjust for network speed" checked={store.networkAdaptive} onChange={() => store.setNetworkAdaptive(!store.networkAdaptive)} />
      <Toggle label="Reduced Data Mode" desc="Minimize data usage" checked={store.reducedDataMode} onChange={() => store.setReducedDataMode(!store.reducedDataMode)} />
      <Toggle label="Memory Optimization" desc="Reduce memory usage" checked={store.memoryOptimization} onChange={() => store.setMemoryOptimization(!store.memoryOptimization)} />
      <Toggle label="Storage Optimization" desc="Optimize localStorage" checked={store.storageOptimization} onChange={() => store.setStorageOptimization(!store.storageOptimization)} />
    </>
  );
}

function MapContent() {
  return (
    <div className="space-y-1.5">
      <p className="text-[0.52rem] text-white/35 leading-relaxed mb-3">
        Each keyboard region maps to a different instrument based on the active sound category.
      </p>
      {INSTRUMENT_MAP.map(item => (
        <div key={item.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/06 bg-white/02 hover:border-white/12 transition-all">
          <span className="text-xl shrink-0">{item.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[0.65rem] font-semibold" style={{ color: item.color }}>{item.name}</div>
            <div className="text-[0.48rem] text-white/28 font-mono mt-0.5 truncate">{item.keys}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Shared primitives ─────────────────────────────────────────────────── */

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[0.5rem] font-black text-white/40 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-white/06" />
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="flex-1 h-px bg-white/06" />
      <span className="text-[0.48rem] text-white/30 uppercase tracking-widest font-medium whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-white/06" />
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <div className="flex flex-col">
        <span className="text-[0.62rem] font-medium text-white/75">{label}</span>
        {desc && <span className="text-[0.48rem] text-white/28 mt-0.5">{desc}</span>}
      </div>
      <button onClick={onChange}
        className={cn('w-8 h-4 rounded-full border relative transition-all shrink-0',
          checked ? 'bg-violet-500/40 border-violet-500/60' : 'bg-white/05 border-white/12')}>
        <div className={cn('absolute top-0.5 w-3 h-3 rounded-full transition-all',
          checked ? 'left-4 bg-violet-400' : 'left-0.5 bg-white/35')} />
      </button>
    </div>
  );
}

function Slider({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[0.6rem] text-white/60">{label}</span>
        <span className="text-[0.6rem] font-mono text-violet-300 font-bold">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer" />
    </div>
  );
}
