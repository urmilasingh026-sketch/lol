import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Music, Keyboard, Eye, Map, Layers, Disc, Circle, Play, Pause, Square, Repeat, Download, Upload, Activity, Trophy, Target, Flame, Palette, HelpCircle, Cpu, Sliders, Wand2, GitBranch } from 'lucide-react';
import {
  useStore, SOUND_CATEGORIES, SoundCategory, LESSON_TEXTS_EXPORT, LESSON_INSTRUCTIONS_EXPORT,
  RGB_MODES, RgbMode, APP_THEMES, AppTheme, BACKGROUND_EFFECTS, BackgroundEffect, MUSICAL_SCALES,
  KeyShape, KeyPressEffect, GradientStyle, KeyBorderStyle, KeyLabelStyle, DifficultyLevel,
  ColorBlindMode, MetronomeSound, WaveformType, ProgressBarStyle, NoteVisualizerStyle,
  WpmChartStyle, AchievementPosition, ChordVoicing, FpsTarget, NoteOverlapBehavior, KeyboardAlignment,
} from '@/store';
import { cn } from '@/lib/utils';
import { useMobileLandscape } from '@/hooks/use-mobile-landscape';
import { ACHIEVEMENTS, RARITY_COLORS, getLevelInfo } from '@/lib/achievements';
import { StatsPanel } from './StatsPanel';
import { HelpModal } from './HelpModal';

const TYPING_MODES = [
  { value: 'free',             label: 'Free Typing',       desc: 'Type freely — text accumulates',        icon: '✨' },
  { value: 'lesson',           label: 'Lesson Mode',        desc: 'Structured key group lessons',          icon: '📚' },
  { value: 'word',             label: 'Word Practice',      desc: 'Cycle through 200+ word lists',         icon: '📝' },
  { value: 'sentence',         label: 'Sentences',          desc: 'Practice full sentences',               icon: '💬' },
  { value: 'paragraph',        label: 'Paragraph',          desc: 'Long-form musical typing',              icon: '📄' },
  { value: 'numbers',          label: 'Numbers & Symbols',  desc: 'Numeric and symbol mastery',            icon: '🔢' },
  { value: 'custom',           label: 'Custom Text',        desc: 'Type your own text',                    icon: '✏️' },
  { value: 'timed',            label: 'Timed Test',         desc: 'Speed test with countdown',             icon: '⏱️' },
  { value: 'sprint',           label: 'Sprint Mode',        desc: 'Burst typing within a tight window',    icon: '🚀' },
  { value: 'quotes',           label: 'Famous Quotes',      desc: 'Classic inspirational quotes',          icon: '💭' },
  { value: 'quotes-extra',     label: 'More Quotes',        desc: 'Extended quotes collection',            icon: '💬' },
  { value: 'motivational',     label: 'Motivational',       desc: 'Motivational power phrases',            icon: '💪' },
  { value: 'inspiration',      label: 'Inspiration',        desc: 'Uplifting & inspiring words',           icon: '🌟' },
  { value: 'code',             label: 'Code Snippets',      desc: 'Practice programming code',             icon: '💻' },
  { value: 'coding-python',    label: 'Python Code',        desc: 'Python programming patterns',           icon: '🐍' },
  { value: 'coding-javascript',label: 'JavaScript Code',    desc: 'JS & modern web patterns',              icon: '📜' },
  { value: 'coding-html',      label: 'HTML & CSS',         desc: 'Web markup and styling',                icon: '🌐' },
  { value: 'coding-sql',       label: 'SQL Queries',        desc: 'Database query language',               icon: '🗄️' },
  { value: 'coding-bash',      label: 'Bash Commands',      desc: 'Shell scripting & commands',            icon: '🖥️' },
  { value: 'poetry',           label: 'Poetry',             desc: 'Classic poetry lines',                  icon: '🌹' },
  { value: 'literature',       label: 'Literature',         desc: 'Famous opening lines of novels',        icon: '📖' },
  { value: 'books',            label: 'Book Quotes',        desc: 'Memorable quotes from great books',     icon: '📚' },
  { value: 'tongue-twisters',  label: 'Tongue Twisters',    desc: 'Challenge your fingers',                icon: '🌀' },
  { value: 'riddles',          label: 'Riddles',            desc: 'Mind-bending riddles & answers',        icon: '🧩' },
  { value: 'idioms',           label: 'Idioms',             desc: 'Common idioms & their meanings',        icon: '🗣️' },
  { value: 'vocabulary',       label: 'Vocabulary',         desc: 'Beautiful & rare word meanings',        icon: '📘' },
  { value: 'grammar',          label: 'Grammar Rules',      desc: 'English grammar fundamentals',          icon: '✍️' },
  { value: 'long-words',       label: 'Long Words',         desc: 'Longest words in the dictionary',       icon: '🔤' },
  { value: 'creative-writing', label: 'Creative Writing',   desc: 'Imaginative story prompts',             icon: '🖊️' },
  { value: 'movies',           label: 'Movie Quotes',       desc: 'Iconic film dialogue',                  icon: '🎬' },
  { value: 'film-terms',       label: 'Film Terms',         desc: 'Cinematography & film vocabulary',      icon: '🎥' },
  { value: 'comedy',           label: 'Comedy',             desc: 'Hilarious one-liners & quips',          icon: '😂' },
  { value: 'speeches',         label: 'Famous Speeches',    desc: 'Historic speeches that changed history', icon: '🎙️' },
  { value: 'programming',      label: 'Programming Terms',  desc: 'CS vocabulary & concepts',              icon: '⌨️' },
  { value: 'tech-terms',       label: 'Tech Terms',         desc: 'Modern technology concepts',            icon: '💡' },
  { value: 'technology',       label: 'Technology',         desc: 'Tech vocabulary & concepts',            icon: '🔧' },
  { value: 'tech-history',     label: 'Tech History',       desc: 'Milestones in computing history',       icon: '🖥️' },
  { value: 'internet',         label: 'Internet Facts',     desc: 'Facts about the digital world',         icon: '🌐' },
  { value: 'gaming',           label: 'Gaming Facts',       desc: 'Video game history & trivia',           icon: '🎮' },
  { value: 'science',          label: 'Science Facts',      desc: 'Scientific knowledge',                  icon: '🔬' },
  { value: 'science-extra',    label: 'More Science',       desc: 'Extended science facts',                icon: '⚗️' },
  { value: 'biology',          label: 'Biology',            desc: 'Life sciences & cell biology',          icon: '🧬' },
  { value: 'chemistry',        label: 'Chemistry',          desc: 'Chemical elements & reactions',         icon: '⚗️' },
  { value: 'physics',          label: 'Physics',            desc: 'Forces energy & matter',                icon: '⚛️' },
  { value: 'math-facts',       label: 'Math Facts',         desc: 'Mathematical concepts & theorems',      icon: '🔢' },
  { value: 'earth-science',    label: 'Earth Science',      desc: 'Geology weather & ecosystems',          icon: '🌎' },
  { value: 'astronomy',        label: 'Astronomy',          desc: 'Stars galaxies & the cosmos',           icon: '🔭' },
  { value: 'psychology',       label: 'Psychology',         desc: 'Human mind & behavior',                 icon: '🧠' },
  { value: 'fun-facts',        label: 'Fun Facts',          desc: 'Interesting trivia',                    icon: '🦩' },
  { value: 'world-records',    label: 'World Records',      desc: 'Incredible record-breaking facts',      icon: '🏆' },
  { value: 'history',          label: 'History',            desc: 'Historical facts & events',             icon: '🏛️' },
  { value: 'history-modern',   label: 'Modern History',     desc: 'Twentieth century events',              icon: '📰' },
  { value: 'geography',        label: 'Geography',          desc: 'World places & facts',                  icon: '🌍' },
  { value: 'geography-facts',  label: 'More Geography',     desc: 'Extended world geography',              icon: '🗺️' },
  { value: 'countries',        label: 'Countries',          desc: 'Country facts & records',               icon: '🌏' },
  { value: 'travel',           label: 'Travel',             desc: 'Travel tips & useful phrases',          icon: '✈️' },
  { value: 'languages',        label: 'Languages',          desc: 'Linguistics & world languages',         icon: '🌐' },
  { value: 'space',            label: 'Space',              desc: 'Cosmic facts & discoveries',            icon: '🚀' },
  { value: 'mythology',        label: 'Mythology',          desc: 'Myths & legendary tales',               icon: '⚡' },
  { value: 'mythology-extra',  label: 'More Mythology',     desc: 'Extended myths & legends',              icon: '🏺' },
  { value: 'mythology-norse',  label: 'Norse Mythology',    desc: 'Viking gods & legends',                 icon: '🔨' },
  { value: 'mythology-egypt',  label: 'Egyptian Mythology', desc: 'Ancient Egyptian gods',                 icon: '🏛️' },
  { value: 'mythology-roman',  label: 'Roman Mythology',    desc: 'Gods of ancient Rome',                  icon: '🏛️' },
  { value: 'mythology-celtic', label: 'Celtic Mythology',   desc: 'Celtic myths & druids',                 icon: '🍀' },
  { value: 'zen',              label: 'Zen',                desc: 'Meditative & mindful phrases',          icon: '☯️' },
  { value: 'mindfulness',      label: 'Mindfulness',        desc: 'Present moment awareness',              icon: '🧘' },
  { value: 'philosophy',       label: 'Philosophy',         desc: 'Great philosophical ideas',             icon: '🤔' },
  { value: 'self-help',        label: 'Self-Help',          desc: 'Personal growth & wisdom',              icon: '🌱' },
  { value: 'proverbs',         label: 'Proverbs',           desc: 'World proverbs & wisdom',               icon: '📜' },
  { value: 'anime',            label: 'Anime Quotes',       desc: 'Iconic anime series quotes',            icon: '⛩️' },
  { value: 'nature',           label: 'Nature',             desc: 'Flora, fauna & earth facts',            icon: '🌿' },
  { value: 'animal-facts',     label: 'Animal Facts',       desc: 'Incredible animal kingdom facts',       icon: '🦁' },
  { value: 'ocean',            label: 'Ocean',              desc: 'Deep sea & marine wonders',             icon: '🌊' },
  { value: 'environment',      label: 'Environment',        desc: 'Ecology & environmental science',       icon: '♻️' },
  { value: 'climate',          label: 'Climate',            desc: 'Climate science & change',              icon: '🌡️' },
  { value: 'sports',           label: 'Sports',             desc: 'Athletic achievements & facts',         icon: '🏆' },
  { value: 'fitness',          label: 'Fitness',            desc: 'Exercise & health tips',                icon: '💪' },
  { value: 'yoga',             label: 'Yoga',               desc: 'Poses breathwork & philosophy',         icon: '🧘' },
  { value: 'food',             label: 'Food & Cuisine',     desc: 'Culinary delights & recipes',           icon: '🍜' },
  { value: 'cooking',          label: 'Cooking Terms',      desc: 'Kitchen techniques & culinary arts',    icon: '👨‍🍳' },
  { value: 'gardening',        label: 'Gardening',          desc: 'Plants soil & green thumbs',            icon: '🌱' },
  { value: 'music',            label: 'Music Theory',       desc: 'Musical terms & trivia',                icon: '🎵' },
  { value: 'music-genres',     label: 'Music Genres',       desc: 'From jazz to hip hop & beyond',         icon: '🎶' },
  { value: 'dance',            label: 'Dance Styles',       desc: 'Ballet salsa hip-hop & more',           icon: '💃' },
  { value: 'art-history',      label: 'Art History',        desc: 'Movements masters & masterpieces',      icon: '🎨' },
  { value: 'architecture',     label: 'Architecture',       desc: 'Buildings design & urban history',      icon: '🏗️' },
  { value: 'fashion',          label: 'Fashion',            desc: 'Style design & clothing culture',       icon: '👗' },
  { value: 'photography',      label: 'Photography',        desc: 'Aperture shutter & composition',        icon: '📸' },
  { value: 'economics',        label: 'Economics',           desc: 'Economic theory & vocabulary',          icon: '📈' },
  { value: 'business',         label: 'Business',           desc: 'Entrepreneurship & management',         icon: '💼' },
  { value: 'medical',          label: 'Medical Terms',      desc: 'Healthcare & anatomy vocabulary',       icon: '🏥' },
  { value: 'legal',            label: 'Legal Terms',        desc: 'Law & justice vocabulary',              icon: '⚖️' },
  { value: 'inventors',        label: 'Inventors',          desc: 'Visionaries who changed the world',     icon: '💡' },
  { value: 'scientists',       label: 'Scientists',         desc: 'Great minds of science',                icon: '🔬' },
  { value: 'artists',          label: 'Artists',            desc: 'Painters sculptors & creators',         icon: '🎨' },
  { value: 'musicians-famous', label: 'Famous Musicians',   desc: 'Legends of music history',              icon: '🎸' },
  { value: 'explorers',        label: 'Explorers',          desc: 'Great voyagers & discoverers',          icon: '🧭' },
  { value: 'color-names',      label: 'Color Names',        desc: 'Unique & beautiful color vocabulary',   icon: '🎨' },
  { value: 'alphabet',         label: 'Alphabet Practice',  desc: 'Every letter of the alphabet',          icon: '🔤' },
  { value: 'adventure',        label: 'Adventure',          desc: 'Travel nature & exploration tales',     icon: '🗺️' },
];

const LESSON_LABELS: Record<number, string> = {
  1: 'Home Row', 2: 'Top Row', 3: 'Bottom Row', 4: 'Numbers',
  5: 'Symbols', 6: 'Classic Pangram', 7: 'Speed #1', 8: 'Advanced', 9: 'Expert', 10: 'Master',
};

const INSTRUMENT_MAP = [
  { keys: 'A – Z',                       icon: '🎹', name: 'Piano',             color: '#33a1ff' },
  { keys: '1 – 0',                       icon: '🎸', name: 'Electric Guitar',   color: '#ff9f1c' },
  { keys: 'Shift + 1–0',                 icon: '🪈', name: 'Flute (High)',       color: '#38e29d' },
  { keys: "` - = [ ] \\ ; ' , . /",      icon: '🪈', name: 'Flute (Symbols)',   color: '#2fd49a' },
  { keys: 'F1 – F12',                    icon: '🥁', name: 'Drum Kit',          color: '#ff5b55' },
  { keys: 'Space',                       icon: '🎸', name: 'Bass',              color: '#b45cff' },
  { keys: 'Enter / Numpad Enter',        icon: '🎶', name: 'Piano Chord',       color: '#33a1ff' },
  { keys: '← ↑ → ↓',                    icon: '🎛', name: 'Synthesizer',       color: '#ffd447' },
  { keys: 'Ctrl / Alt',                  icon: '🌊', name: 'Ambient Pads',      color: '#5f6bff' },
  { keys: 'Numpad 0–9  +  ÷  ×  −  .',  icon: '🪘', name: 'Percussion',        color: '#ff7eb3' },
  { keys: 'CapsLock',                    icon: '🎻', name: 'Violin',            color: '#e05cff' },
  { keys: 'Tab',                         icon: '🎺', name: 'Trumpet',           color: '#ffdc00' },
  { keys: 'Delete',                      icon: '🎼', name: 'Organ',             color: '#ff6f3c' },
  { keys: 'Insert',                      icon: '🎷', name: 'Saxophone',         color: '#00cfff' },
  { keys: 'Home',                        icon: '🎹', name: 'Harpsichord',       color: '#c8ff80' },
  { keys: 'End',                         icon: '🎸', name: 'Electric Bass',     color: '#7040ff' },
  { keys: 'Page Up',                     icon: '🪗', name: 'Accordion',         color: '#ff9060' },
  { keys: 'Page Down',                   icon: '🎺', name: 'French Horn',       color: '#80dfb0' },
  { keys: 'Print Screen',                icon: '🎙', name: 'Vocoder',           color: '#ff80d0' },
  { keys: 'Scroll Lock',                 icon: '🔔', name: 'Glockenspiel',      color: '#e0ffff' },
  { keys: 'Pause / Break',               icon: '🌊', name: 'Theremin',          color: '#c0f0ff' },
  { keys: 'Num Lock',                    icon: '🎸', name: 'Acoustic Guitar',   color: '#d4a96a' },
  { keys: '⊞ / ⌘ Windows / Meta',       icon: '🎵', name: 'Vibraphone',        color: '#fffb80' },
  { keys: 'Backspace',                   icon: '🔇', name: 'Stop All',          color: '#888' },
  { keys: 'Shift',                       icon: '🎚', name: 'Velocity Boost',    color: '#fff' },
];

type Section = 'visual' | 'audio' | 'keyboard' | 'accessibility' | 'map' | 'transport' | 'stats' | 'goals' | 'features' | 'customize' | 'advanced-audio' | 'musical' | 'platform';

export function SettingsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const store = useStore();
  const [activeSection, setActiveSection] = useState<Section>('visual');
  const [isMobile, setIsMobile] = useState(false);
  const isMobileLandscape = useMobileLandscape();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [showHelp, setShowHelp] = useState(false);

  const { current: lvl } = getLevelInfo(store.xp);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 &&
            parsed.every((item: any) => typeof item.key === 'string' && typeof item.timestamp === 'number')) {
          store.loadRecording(parsed);
          setUploadStatus('ok');
        } else { setUploadStatus('err'); }
      } catch { setUploadStatus('err'); }
      setTimeout(() => setUploadStatus('idle'), 2500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const sections = [
    { key: 'visual'        as Section, icon: <Zap className="w-3 h-3" />,       label: 'Visual'   },
    { key: 'customize'     as Section, icon: <Wand2 className="w-3 h-3" />,     label: 'Style'    },
    { key: 'audio'         as Section, icon: <Music className="w-3 h-3" />,     label: 'Audio'    },
    { key: 'advanced-audio'as Section, icon: <Sliders className="w-3 h-3" />,   label: 'FX'       },
    { key: 'keyboard'      as Section, icon: <Keyboard className="w-3 h-3" />,  label: 'Typing'   },
    { key: 'musical'       as Section, icon: <GitBranch className="w-3 h-3" />, label: 'Musical'  },
    { key: 'features'      as Section, icon: <Palette className="w-3 h-3" />,   label: 'UI'       },
    { key: 'transport'     as Section, icon: <Disc className="w-3 h-3" />,      label: 'Record'   },
    { key: 'stats'         as Section, icon: <Trophy className="w-3 h-3" />,    label: 'Stats'    },
    { key: 'goals'         as Section, icon: <Target className="w-3 h-3" />,    label: 'Goals'    },
    { key: 'accessibility' as Section, icon: <Eye className="w-3 h-3" />,       label: 'Access.'  },
    { key: 'platform'      as Section, icon: <Cpu className="w-3 h-3" />,       label: 'Platform' },
    { key: 'map'           as Section, icon: <Map className="w-3 h-3" />,       label: 'Map'      },
  ];

  const content = (
    <>
      {/* Header */}
      <div className="border-b border-white/08 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/30 to-blue-500/20 border border-violet-500/25 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Settings</h2>
            <p className="text-[0.52rem] text-white/38 mt-0.5">
              Lv.{lvl.level} {lvl.title} · {store.xp.toLocaleString()} XP
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelp(true)}
            className="w-7 h-7 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/10 transition-all flex items-center justify-center"
            title="Help & Shortcuts"
          >
            <HelpCircle className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/10 transition-all flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-white/55" />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap border-b border-white/07 bg-black/30 shrink-0">
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={cn(
              'flex-1 py-2 flex flex-col items-center gap-0.5 text-[0.48rem] font-medium transition-all min-w-[48px]',
              activeSection === s.key
                ? 'text-violet-400 border-b-2 border-violet-400'
                : 'text-white/38 hover:text-white/65 hover:bg-white/04'
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={cn('flex-1 overflow-y-auto', activeSection !== 'stats' && 'px-4 py-4 space-y-3.5')}>

        {/* ── VISUAL ── */}
        {activeSection === 'visual' && (
          <div className="space-y-3">
            {/* App Theme */}
            <SectionDivider label="App Theme" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.52rem] text-white/40">Selected</span>
              <span className="text-[0.6rem] font-semibold" style={{ color: APP_THEMES.find(t => t.id === store.theme)?.color ?? '#8b5cf6' }}>
                {APP_THEMES.find(t => t.id === store.theme)?.label ?? 'Aurora'} · {APP_THEMES.find(t => t.id === store.theme)?.desc ?? ''}
              </span>
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
              {APP_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => store.setTheme(t.id as AppTheme)}
                  title={`${t.label} — ${t.desc}`}
                  className={cn(
                    'aspect-square rounded-full border-2 transition-all duration-150',
                    store.theme === t.id
                      ? 'border-white scale-125 shadow-lg'
                      : 'border-transparent hover:scale-110 hover:border-white/50'
                  )}
                  style={{
                    backgroundColor: t.color,
                    boxShadow: store.theme === t.id ? `0 0 10px ${t.color}cc, 0 0 4px ${t.color}` : undefined,
                  }}
                />
              ))}
            </div>
            <div className="space-y-1 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[0.5rem] text-white/35">Browse</span>
                <span className="text-[0.5rem] text-white/30">{APP_THEMES.findIndex(t => t.id === store.theme) + 1} / {APP_THEMES.length}</span>
              </div>
              <input
                type="range"
                min={0}
                max={APP_THEMES.length - 1}
                step={1}
                value={APP_THEMES.findIndex(t => t.id === store.theme)}
                onChange={e => store.setTheme(APP_THEMES[Number(e.target.value)].id as AppTheme)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: APP_THEMES.find(t => t.id === store.theme)?.color ?? '#8b5cf6' }}
              />
            </div>

            {/* Background Effect */}
            <SectionDivider label="Background Effect" />
            <div className="grid grid-cols-2 gap-1.5">
              {BACKGROUND_EFFECTS.map(b => (
                <button
                  key={b.id}
                  onClick={() => store.setBackgroundEffect(b.id as BackgroundEffect)}
                  className={cn(
                    'text-left px-2.5 py-2 rounded-xl border transition-all',
                    store.backgroundEffect === b.id
                      ? 'border-violet-500 bg-violet-500/15 text-white shadow-[0_0_10px_rgba(160,80,255,0.2)]'
                      : 'border-white/08 bg-white/03 text-white/50 hover:text-white/80 hover:border-white/15'
                  )}
                >
                  <div className="text-sm mb-0.5">{b.icon}</div>
                  <div className="text-[0.58rem] font-semibold">{b.label}</div>
                  <div className="text-[0.46rem] text-white/30 mt-0.5">{b.desc}</div>
                </button>
              ))}
            </div>

            <SectionDivider label="RGB Lighting" />
            <ToggleRow label="RGB Lighting" desc="Enable per-key RGB effects"
              checked={store.rgbEnabled} onChange={() => store.setRgbEnabled(!store.rgbEnabled)} />
            <ToggleRow label="All Visuals" desc="Master toggle — disable for silent/dark mode"
              checked={store.visualsEnabled} onChange={() => store.setVisualsEnabled(!store.visualsEnabled)} />

            {store.rgbEnabled && store.visualsEnabled && (
              <>
                <SectionDivider label="RGB Mode" />
                <div className="grid grid-cols-2 gap-1.5">
                  {RGB_MODES.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => store.setRgbMode(mode.id as RgbMode)}
                      className={cn(
                        'text-left px-2.5 py-2 rounded-xl border transition-all',
                        store.rgbMode === mode.id
                          ? 'border-violet-500 bg-violet-500/18 text-white shadow-[0_0_14px_rgba(160,80,255,0.25)]'
                          : 'border-white/08 bg-white/03 text-white/50 hover:text-white/80 hover:border-white/18 hover:bg-white/06'
                      )}
                    >
                      <div className="text-base leading-none mb-1">{mode.icon}</div>
                      <div className="text-[0.64rem] font-semibold leading-tight">{mode.label}</div>
                      <div className="text-[0.5rem] text-white/32 mt-0.5 leading-tight">{mode.desc}</div>
                    </button>
                  ))}
                </div>

                {store.rgbMode === 'solid' && (
                  <div className="space-y-2">
                    <SectionDivider label="Custom Color" />
                    <div className="flex items-center gap-3">
                      <input
                        type="color" value={store.rgbCustomColor}
                        onChange={e => store.setRgbCustomColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-white/15 bg-transparent"
                        style={{ padding: '2px' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/65">Pick a color</div>
                        <div className="font-mono text-[0.58rem] text-violet-400 mt-0.5">{store.rgbCustomColor.toUpperCase()}</div>
                      </div>
                      <div className="flex gap-1">
                        {['#ff5b55','#ff9f1c','#33a1ff','#38e29d','#b45cff','#ffffff'].map(c => (
                          <button key={c} onClick={() => store.setRgbCustomColor(c)}
                            className="w-5 h-5 rounded-full border border-black/30 hover:scale-125 transition-transform"
                            style={{ backgroundColor: c, boxShadow: store.rgbCustomColor === c ? `0 0 8px ${c}` : undefined }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <SectionDivider label="Fine-Tune" />
                <SliderRow label="Glow Intensity" value={store.glowIntensity}
                  min={0} max={100} step={1} display={`${store.glowIntensity}%`}
                  onChange={v => store.setGlowIntensity(v)} />
                {!['static-rainbow','solid','reactive'].includes(store.rgbMode) && (
                  <SliderRow label="Animation Speed" value={store.animationSpeed}
                    min={0.25} max={4} step={0.25} display={`${store.animationSpeed}×`}
                    onChange={v => store.setAnimationSpeed(v)} />
                )}
                <SliderRow label="Fade Duration" value={store.fadeDuration}
                  min={100} max={700} step={50} display={`${store.fadeDuration}ms`}
                  onChange={v => store.setFadeDuration(v)} />
              </>
            )}

            <SectionDivider label="Key Appearance" />
            <SliderRow label="Key Opacity" value={store.keyOpacity}
              min={30} max={100} step={5} display={`${store.keyOpacity}%`}
              onChange={v => store.setKeyOpacity(v)} />
            <ToggleRow label="Rainbow Key Press" desc="Each key press picks the next rainbow color"
              checked={store.rainbowModeEnabled} onChange={() => store.setRainbowEnabled(!store.rainbowModeEnabled)} />
          </div>
        )}

        {/* ── AUDIO ── */}
        {activeSection === 'audio' && (
          <div className="space-y-3">
            <SliderRow label="Master Volume" value={store.volume}
              min={0} max={1} step={0.01} display={`${Math.round(store.volume * 100)}%`}
              onChange={v => store.setVolume(v)} />

            <SectionDivider label="Sound Category" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/60">Style</label>
                <span className="text-[0.55rem] text-violet-400">{SOUND_CATEGORIES.length} categories</span>
              </div>
              <select
                value={store.soundCategory}
                onChange={e => store.setSoundCategory(e.target.value as SoundCategory)}
                className="w-full bg-black/55 border border-white/12 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all cursor-pointer"
              >
                {SOUND_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <SectionDivider label="Musical Scale" />
            <ToggleRow label="Scale Mode" desc="Constrain piano keys to a musical scale"
              checked={store.scaleEnabled} onChange={() => store.setScaleEnabled(!store.scaleEnabled)} />
            {store.scaleEnabled && (
              <div className="grid grid-cols-2 gap-1.5">
                {MUSICAL_SCALES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => store.setMusicalScale(s.id)}
                    className={cn(
                      'text-left px-2 py-2 rounded-xl border transition-all',
                      store.musicalScale === s.id
                        ? 'border-violet-500 bg-violet-500/15 text-white'
                        : 'border-white/07 bg-white/02 text-white/50 hover:text-white/75 hover:border-white/15'
                    )}
                  >
                    <div className="text-[0.6rem] font-semibold">{s.label}</div>
                    <div className="text-[0.46rem] text-white/30 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            )}

            <SectionDivider label="Pitch Control" />
            <SliderRow label="Transpose (Semitones)" value={store.masterPitch}
              min={-12} max={12} step={1} display={store.masterPitch === 0 ? '0' : `${store.masterPitch > 0 ? '+' : ''}${store.masterPitch}`}
              onChange={v => store.setMasterPitch(v)} />
            <SliderRow label="Octave Shift" value={store.octaveShift}
              min={-2} max={2} step={1} display={store.octaveShift === 0 ? '0' : `${store.octaveShift > 0 ? '+' : ''}${store.octaveShift}`}
              onChange={v => store.setOctaveShift(v)} />

            <SectionDivider label="Effects Chain" />
            <ToggleRow label="Reverb" desc="Hall/room simulation — spatial depth"
              checked={store.reverbEnabled} onChange={() => store.setEffect('reverb', !store.reverbEnabled)} />
            <ToggleRow label="Delay / Echo" desc="Repeating echo effect with feedback"
              checked={store.delayEnabled} onChange={() => store.setEffect('delay', !store.delayEnabled)} />
            <ToggleRow label="Chorus" desc="Thickness, width and shimmer"
              checked={store.chorusEnabled} onChange={() => store.setEffect('chorus', !store.chorusEnabled)} />
            <ToggleRow label="Distortion" desc="Gritty analog-style harmonic saturation"
              checked={store.distortionEnabled} onChange={() => store.setEffect('distortion', !store.distortionEnabled)} />
            <ToggleRow label="Compression" desc="Dynamic range control and punch"
              checked={store.compressionEnabled} onChange={() => store.setEffect('compression', !store.compressionEnabled)} />

            <SectionDivider label="Metronome" />
            <ToggleRow label="Metronome" desc="Click track — BPM shown in top bar"
              checked={store.metronomeEnabled} onChange={() => store.setMetronome(!store.metronomeEnabled)} />
            <SliderRow label="BPM" value={store.bpm}
              min={40} max={240} step={1} display={`${store.bpm} BPM`}
              onChange={v => store.setBpm(v)} />

            <SectionDivider label="Instrument Note Labels" />
            <ToggleRow label="Show Note Names on Keys" desc="Display musical note names (C4, D4, etc.)"
              checked={store.showNoteLabels} onChange={() => store.setShowNoteLabels(!store.showNoteLabels)} />
          </div>
        )}

        {/* ── KEYBOARD / TYPING ── */}
        {activeSection === 'keyboard' && (
          <div className="space-y-3">
            <SliderRow label="Key Size" value={store.keySize}
              min={70} max={130} step={5} display={`${store.keySize}%`}
              onChange={v => store.setKeySize(v)} />

            <SectionDivider label="Key Heatmap" />
            <ToggleRow label="Show Heatmap" desc="Color keys by how often you press them"
              checked={store.showHeatmap} onChange={() => store.setShowHeatmap(!store.showHeatmap)} />
            {store.showHeatmap && (
              <button
                onClick={() => store.clearHeatmap()}
                className="w-full py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/15 transition-colors"
              >
                Clear Heatmap Data
              </button>
            )}

            <SectionDivider label="Typing Mode" />
            <div className="space-y-1">
              {TYPING_MODES.map(m => (
                <button
                  key={m.value}
                  onClick={() => store.setTypingMode(m.value as any)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl border transition-all',
                    store.typingMode === m.value
                      ? 'border-violet-500 bg-violet-500/15 text-white shadow-[0_0_12px_rgba(160,80,255,0.2)]'
                      : 'border-white/07 bg-white/02 text-white/55 hover:text-white/85 hover:border-white/18 hover:bg-white/05'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{m.icon}</span>
                    <div>
                      <div className="text-[0.65rem] font-semibold">{m.label}</div>
                      <div className="text-[0.48rem] text-white/35 mt-0.5">{m.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {store.typingMode === 'lesson' && (
              <div className="space-y-2">
                <SectionDivider label="Select Lesson" />
                <div className="grid grid-cols-5 gap-1.5">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} onClick={() => store.setLessonNumber(n)}
                      className={cn(
                        'py-2 rounded-xl text-xs font-bold border transition-all',
                        store.lessonNumber === n
                          ? 'border-violet-500 text-violet-300 bg-violet-500/18'
                          : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75',
                        store.lessonsCompleted.includes(n) && store.lessonNumber !== n && 'border-emerald-500/30 text-emerald-400/60'
                      )}
                    >
                      L{n}
                    </button>
                  ))}
                </div>
                <div className="bg-black/25 border border-white/08 rounded-xl p-3">
                  <p className="text-[0.6rem] font-semibold text-violet-400 mb-1">
                    Lesson {store.lessonNumber}: {LESSON_LABELS[store.lessonNumber]}
                  </p>
                  <p className="text-[0.52rem] text-white/38 leading-relaxed">{LESSON_INSTRUCTIONS_EXPORT[store.lessonNumber]}</p>
                </div>
              </div>
            )}

            {store.typingMode === 'custom' && (
              <div className="space-y-1.5">
                <label className="text-xs text-white/60">Custom Text</label>
                <textarea
                  value={store.customText}
                  onChange={e => store.setCustomText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="w-full bg-black/55 border border-white/12 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 resize-none h-24 transition-all placeholder:text-white/25"
                />
              </div>
            )}

            {store.typingMode === 'timed' && (
              <div className="space-y-1.5">
                <label className="text-xs text-white/60">Test Duration</label>
                <div className="flex gap-2">
                  {[15, 30, 60, 120, 300].map(d => (
                    <button key={d} onClick={() => store.setTimedDuration(d)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-xs border font-medium transition-all',
                        store.timedDuration === d
                          ? 'border-violet-500 text-violet-300 bg-violet-500/15'
                          : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75'
                      )}
                    >
                      {d < 60 ? `${d}s` : `${d/60}m`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {store.typingMode === 'sprint' && (
              <div className="space-y-1.5">
                <label className="text-xs text-white/60">Sprint Duration</label>
                <div className="flex gap-2">
                  {[15, 30, 45, 60, 90].map(d => (
                    <button key={d} onClick={() => store.setSprintDuration(d)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-xs border font-medium transition-all',
                        store.sprintDuration === d
                          ? 'border-orange-500 text-orange-300 bg-orange-500/15'
                          : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75'
                      )}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
                <p className="text-[0.5rem] text-white/30 px-1">Type as many words as possible in the time limit</p>
              </div>
            )}

            <button
              onClick={() => store.resetTyping()}
              className="w-full py-2.5 rounded-xl bg-white/04 hover:bg-violet-500/12 border border-white/08 hover:border-violet-500/35 text-sm text-white/60 hover:text-white transition-all mt-1"
            >
              ↺ Reset Session
            </button>
          </div>
        )}

        {/* ── FEATURES ── */}
        {activeSection === 'features' && (
          <div className="space-y-3">
            <SectionDivider label="Focus & Experience" />
            <ToggleRow
              label="Focus Mode"
              desc="Dim keyboard & TopBar — pure typing immersion"
              checked={store.focusMode}
              onChange={() => store.setFocusMode(!store.focusMode)}
            />
            <ToggleRow
              label="Confetti on Milestone"
              desc="Burst of confetti on level-up or achievement"
              checked={store.confettiEnabled}
              onChange={() => store.setConfettiEnabled(!store.confettiEnabled)}
            />
            <ToggleRow
              label="Auto-Reset on Complete"
              desc="Automatically reset when a typing session ends"
              checked={store.autoReset}
              onChange={() => store.setAutoReset(!store.autoReset)}
            />

            <SectionDivider label="Visualisers" />
            <ToggleRow
              label="Note Visualiser"
              desc="Floating musical notes float up on each key press"
              checked={store.noteVisualizerEnabled}
              onChange={() => store.setNoteVisualizerEnabled(!store.noteVisualizerEnabled)}
            />
            <ToggleRow
              label="WPM Sparkline"
              desc="Show a live WPM trend chart in the TopBar"
              checked={store.showWpmChart}
              onChange={() => store.setShowWpmChart(!store.showWpmChart)}
            />

            <SectionDivider label="Cursor Style" />
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: 'line',       label: 'Line',       desc: 'Thin blinking line', icon: '|' },
                { value: 'block',      label: 'Block',      desc: 'Filled block',        icon: '▌' },
                { value: 'underscore', label: 'Underscore', desc: 'Underline cursor',    icon: '_' },
              ].map(c => (
                <button
                  key={c.value}
                  onClick={() => store.setCursorStyle(c.value as any)}
                  className={cn(
                    'text-left px-2.5 py-2.5 rounded-xl border transition-all',
                    store.cursorStyle === c.value
                      ? 'border-violet-500 bg-violet-500/15 text-white shadow-[0_0_10px_rgba(160,80,255,0.2)]'
                      : 'border-white/08 bg-white/03 text-white/50 hover:text-white/80 hover:border-white/18'
                  )}
                >
                  <div className="text-lg mb-0.5 font-mono text-violet-300">{c.icon}</div>
                  <div className="text-[0.58rem] font-semibold">{c.label}</div>
                  <div className="text-[0.44rem] text-white/30 mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>

            <SectionDivider label="Typing Font" />
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: 'mono',  label: 'Mono',    desc: 'JetBrains Mono',  sample: 'Aa' },
                { value: 'sans',  label: 'Sans',    desc: 'Chakra Petch',    sample: 'Aa' },
                { value: 'retro', label: 'Retro',   desc: 'Courier New',     sample: 'Aa' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => store.setTypingFont(f.value as any)}
                  className={cn(
                    'text-left px-2.5 py-2.5 rounded-xl border transition-all',
                    store.typingFont === f.value
                      ? 'border-violet-500 bg-violet-500/15 text-white shadow-[0_0_10px_rgba(160,80,255,0.2)]'
                      : 'border-white/08 bg-white/03 text-white/50 hover:text-white/80 hover:border-white/18'
                  )}
                >
                  <div
                    className="text-base mb-0.5 font-bold text-violet-300"
                    style={{ fontFamily: f.value === 'mono' ? 'JetBrains Mono, monospace' : f.value === 'sans' ? 'Chakra Petch, sans-serif' : 'Courier New, monospace' }}
                  >
                    {f.sample}
                  </div>
                  <div className="text-[0.58rem] font-semibold">{f.label}</div>
                  <div className="text-[0.44rem] text-white/30 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>

            <SectionDivider label="Sprint Mode Duration" />
            <div className="flex gap-2">
              {[15, 30, 45, 60, 90].map(d => (
                <button
                  key={d}
                  onClick={() => store.setSprintDuration(d)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs border font-medium transition-all',
                    store.sprintDuration === d
                      ? 'border-violet-500 text-violet-300 bg-violet-500/15'
                      : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75'
                  )}
                >
                  {d}s
                </button>
              ))}
            </div>

            <SectionDivider label="Note Visualizer Style" />
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { v: 'bubbles', label: 'Bubbles', icon: '🫧' },
                { v: 'sparks',  label: 'Sparks',  icon: '✨' },
                { v: 'notes',   label: 'Notes',   icon: '🎵' },
                { v: 'rings',   label: 'Rings',   icon: '⭕' },
                { v: 'lines',   label: 'Lines',   icon: '〰️' },
                { v: 'petals',  label: 'Petals',  icon: '🌸' },
              ] as { v: NoteVisualizerStyle; label: string; icon: string }[]).map(n => (
                <button key={n.v} onClick={() => store.setNoteVisualizerStyle(n.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.noteVisualizerStyle === n.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{n.icon}</div>{n.label}
                </button>
              ))}
            </div>
            <SliderRow label="Visualizer Speed" value={store.noteVisualizerSpeed} min={0.5} max={3} step={0.1} display={`${store.noteVisualizerSpeed.toFixed(1)}×`} onChange={store.setNoteVisualizerSpeed} />
            <SliderRow label="Visualizer Density" value={store.noteVisualizerDensity} min={0.5} max={3} step={0.1} display={`${store.noteVisualizerDensity.toFixed(1)}×`} onChange={store.setNoteVisualizerDensity} />

            <SectionDivider label="WPM Chart" />
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { v: 'line', label: 'Line', icon: '〰️' },
                { v: 'bar',  label: 'Bar',  icon: '📊' },
                { v: 'area', label: 'Area', icon: '📈' },
                { v: 'dots', label: 'Dots', icon: '···' },
              ] as { v: WpmChartStyle; label: string; icon: string }[]).map(c => (
                <button key={c.v} onClick={() => store.setWpmChartStyle(c.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.wpmChartStyle === c.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{c.icon}</div>{c.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {[10, 20, 30].map(n => (
                <button key={n} onClick={() => store.setWpmChartPoints(n)}
                  className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                    store.wpmChartPoints === n ? 'border-violet-500 text-violet-300 bg-violet-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  {n} pts
                </button>
              ))}
            </div>

            <SectionDivider label="Achievement Notifications" />
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { v: 'top-right',    label: 'Top Right',    icon: '↗️' },
                { v: 'top-left',     label: 'Top Left',     icon: '↖️' },
                { v: 'bottom-right', label: 'Bottom Right', icon: '↘️' },
              ] as { v: AchievementPosition; label: string; icon: string }[]).map(p => (
                <button key={p.v} onClick={() => store.setAchievementPosition(p.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.achievementPosition === p.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{p.icon}</div>{p.label}
                </button>
              ))}
            </div>
            <SliderRow label="Duration" value={store.achievementDuration} min={2} max={10} step={1} display={`${store.achievementDuration}s`} onChange={store.setAchievementDuration} />
            <ToggleRow label="Achievement Sound" desc="Play a chime when unlocking achievements" checked={store.achievementSoundEnabled} onChange={() => store.setAchievementSoundEnabled(!store.achievementSoundEnabled)} />

            <SectionDivider label="Heatmap" />
            <SliderRow label="Heatmap Opacity" value={store.heatmapOpacity} min={0.1} max={1} step={0.05} display={`${Math.round(store.heatmapOpacity * 100)}%`} onChange={store.setHeatmapOpacity} />
            <ToggleRow label="Heatmap Decay" desc="Heat fades over time (not session-total)" checked={store.heatmapDecay} onChange={() => store.setHeatmapDecay(!store.heatmapDecay)} />

            <SectionDivider label="Stats Layout" />
            <div className="flex gap-1.5">
              {([1, 2] as (1 | 2)[]).map(c => (
                <button key={c} onClick={() => store.setStatsColumns(c)}
                  className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                    store.statsColumns === c ? 'border-violet-500 text-violet-300 bg-violet-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  {c} Column{c > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <ToggleRow label="Show Word Number" desc="Display word count alongside typing text" checked={store.showWordNumber} onChange={() => store.setShowWordNumber(!store.showWordNumber)} />
            <ToggleRow label="Auto-Save Session" desc="Automatically save each session to history" checked={store.autoSaveSession} onChange={() => store.setAutoSaveSession(!store.autoSaveSession)} />
            <ToggleRow label="Previous Session Compare" desc="Show how you compare to your last session" checked={store.showPrevSessionComparison} onChange={() => store.setShowPrevSessionComparison(!store.showPrevSessionComparison)} />

            <SectionDivider label="Profiles" />
            <div className="flex gap-1.5">
              {([0, 1, 2] as (0 | 1 | 2)[]).map(p => (
                <button key={p} onClick={() => store.setActiveProfile(p)}
                  className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                    store.activeProfile === p ? 'border-emerald-500 text-emerald-300 bg-emerald-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  Profile {p + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TRANSPORT / RECORD ── */}
        {activeSection === 'transport' && (
          <div className="space-y-3">
            <SectionDivider label="Transport" />
            <div className="flex items-center gap-2 px-1">
              {store.isRecording && (
                <div className="flex items-center gap-1.5 bg-red-500/12 border border-red-500/30 rounded-full px-2.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 rec-indicator" />
                  <span className="text-[0.55rem] text-red-400 font-mono font-bold">REC — {store.recordedEvents.length} events</span>
                </div>
              )}
              {store.isPlaying && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[0.55rem] text-emerald-400 font-mono font-bold">PLAYING</span>
                </div>
              )}
              {!store.isRecording && !store.isPlaying && (
                <span className="text-[0.55rem] text-white/28 px-1">
                  {store.recordedEvents.length > 0 ? `${store.recordedEvents.length} events · ${store.recordingsCount} recordings` : 'No recording yet'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 py-1">
              <button onClick={store.isRecording ? store.stopRecording : store.startRecording}
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center transition-all border',
                  store.isRecording
                    ? 'bg-red-500/25 border-red-500/60 text-red-400 shadow-[0_0_12px_rgba(255,80,80,0.4)]'
                    : 'bg-white/06 border-white/12 text-white/65 hover:text-white hover:bg-white/12'
                )} title={store.isRecording ? 'Stop Recording' : 'Record'}>
                {store.isRecording ? <Square className="w-4 h-4 fill-current" /> : <Circle className="w-4 h-4 fill-current" />}
              </button>

              <button onClick={store.isPlaying ? store.stopPlayback : store.playRecording}
                disabled={store.isRecording || (!store.recordedEvents.length && !store.isPlaying)}
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center transition-all border',
                  store.isPlaying
                    ? 'bg-emerald-500/22 border-emerald-400/55 text-emerald-300 shadow-[0_0_16px_rgba(56,226,157,0.35)]'
                    : 'bg-white/06 border-white/12 text-white/65 hover:text-white hover:bg-white/12',
                  (store.isRecording || (!store.recordedEvents.length && !store.isPlaying)) && 'opacity-25 cursor-not-allowed pointer-events-none'
                )}>
                {store.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" style={{ marginLeft: '2px' }} />}
              </button>

              <button onClick={store.stopPlayback} disabled={!store.isPlaying}
                className={cn('w-11 h-11 rounded-full flex items-center justify-center transition-all border bg-white/06 border-white/12 text-white/65 hover:text-white hover:bg-white/12', !store.isPlaying && 'opacity-25 cursor-not-allowed pointer-events-none')}>
                <Square className="w-4 h-4 fill-current" />
              </button>

              <button onClick={() => store.setLoop(!store.loopEnabled)}
                className={cn('w-11 h-11 rounded-full flex items-center justify-center transition-all border',
                  store.loopEnabled ? 'bg-violet-500/22 border-violet-400/55 text-violet-300' : 'bg-white/06 border-white/12 text-white/65 hover:text-white')}>
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            <SliderRow label="Playback Speed" value={store.playbackSpeed} min={0.25} max={3} step={0.25} display={`${store.playbackSpeed.toFixed(2)}×`} onChange={v => store.setPlaybackSpeed(v)} />

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  if (!store.recordedEvents.length) return;
                  const data = JSON.stringify(store.recordedEvents, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `vk-recording-${Date.now()}.json`; a.click();
                  URL.revokeObjectURL(url);
                }}
                disabled={!store.recordedEvents.length}
                className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[0.65rem] font-semibold transition-all',
                  store.recordedEvents.length ? 'bg-white/05 border-white/10 text-white/65 hover:bg-violet-500/15 hover:text-violet-200 hover:border-violet-500/35' : 'opacity-25 cursor-not-allowed bg-transparent border-white/05 text-white/25')}
              >
                <Download className="w-3 h-3" /> Export
              </button>
              <button
                onClick={() => uploadRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[0.65rem] font-semibold transition-all bg-white/05 border-white/10 text-white/65 hover:bg-emerald-500/15 hover:text-emerald-200 hover:border-emerald-500/35"
              >
                <Upload className="w-3 h-3" /> Upload
              </button>
              <input ref={uploadRef} type="file" accept=".json" className="hidden" onChange={handleUpload} />
            </div>
            {uploadStatus === 'ok' && <p className="text-[0.55rem] text-emerald-400 text-center">Recording loaded!</p>}
            {uploadStatus === 'err' && <p className="text-[0.55rem] text-red-400 text-center">Invalid recording file</p>}
          </div>
        )}

        {/* ── STATS ── */}
        {activeSection === 'stats' && (
          <StatsPanel onClose={() => setActiveSection('visual')} />
        )}

        {/* ── GOALS ── */}
        {activeSection === 'goals' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/8 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-bold text-white">{store.dailyStreak} day streak</span>
              </div>
              <p className="text-[0.52rem] text-white/40">Best streak: {store.longestStreak} days</p>
              <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                  style={{ width: `${Math.min(100, (store.dailyStreak / Math.max(7, store.longestStreak)) * 100)}%` }}
                />
              </div>
            </div>

            <SectionDivider label="Daily Targets" />
            <div className="space-y-1.5">
              <div className="text-[0.55rem] text-white/40">Target WPM Goal</div>
              <div className="flex gap-1.5">
                {[20,30,40,60,80,100].map(g => (
                  <button key={g} onClick={() => store.setDailyGoalWpm(g)}
                    className={cn('flex-1 py-1.5 rounded-lg text-[0.6rem] font-bold border transition-all',
                      store.dailyGoalWpm === g ? 'border-violet-500 text-violet-300 bg-violet-500/15' : 'border-white/08 text-white/40 hover:border-white/20 hover:text-white/70')}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[0.55rem] text-white/40">Daily Keystroke Goal</div>
              <div className="flex gap-1.5">
                {[100,500,1000,2000,5000].map(g => (
                  <button key={g} onClick={() => store.setDailyGoalKeystrokes(g)}
                    className={cn('flex-1 py-1.5 rounded-lg text-[0.52rem] font-bold border transition-all',
                      store.dailyGoalKeystrokes === g ? 'border-violet-500 text-violet-300 bg-violet-500/15' : 'border-white/08 text-white/40 hover:border-white/20 hover:text-white/70')}>
                    {g >= 1000 ? `${g/1000}k` : g}
                  </button>
                ))}
              </div>
            </div>

            <SectionDivider label="Today's Stats" />
            {[
              { label: 'Keystrokes Today', value: store.dailyKeystrokesToday, max: store.dailyGoalKeystrokes, color: 'bg-blue-500' },
              { label: 'Best WPM This Session', value: store.wpm, max: store.dailyGoalWpm, color: 'bg-violet-500' },
              { label: 'Sessions Today', value: store.dailySessionsToday, max: 5, color: 'bg-emerald-500' },
            ].map(item => (
              <div key={item.label} className="space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-[0.52rem] text-white/40 uppercase tracking-wider">{item.label}</span>
                  <span className="text-[0.52rem] font-mono text-white/55">{item.value.toLocaleString()} / {item.max.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-white/05 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-700', item.color)} style={{ width: `${Math.min(100, item.max > 0 ? (item.value / item.max) * 100 : 0)}%` }} />
                </div>
              </div>
            ))}

            <SectionDivider label="Achievements" />
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-bold text-white">{store.unlockedAchievements.length} / {ACHIEVEMENTS.length}</div>
                <div className="text-[0.5rem] text-white/35">achievements unlocked</div>
              </div>
              <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                {store.unlockedAchievements.slice(-6).map(id => {
                  const a = ACHIEVEMENTS.find(x => x.id === id);
                  return a ? <span key={id} title={a.title} className="text-base">{a.icon}</span> : null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ACCESSIBILITY ── */}
        {activeSection === 'accessibility' && (
          <div className="space-y-3">
            <SectionDivider label="Vision" />
            <ToggleRow label="High Contrast" desc="Maximize text and border contrast"
              checked={store.highContrast} onChange={() => store.setHighContrast(!store.highContrast)} />
            <ToggleRow label="Large Text Mode" desc="Increase all font sizes for easier reading"
              checked={store.largeTextMode} onChange={() => store.setLargeTextMode(!store.largeTextMode)} />
            <ToggleRow label="Dyslexia Font" desc="Use OpenDyslexic for typing area"
              checked={store.dyslexiaFont} onChange={() => store.setDyslexiaFont(!store.dyslexiaFont)} />
            <ToggleRow label="Blind Mode" desc="Screen reader friendly mode with full ARIA labels"
              checked={store.blindMode} onChange={() => store.setBlindMode(!store.blindMode)} />

            <SectionDivider label="Color Blind Support" />
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { v: 'none',         label: 'Default',    icon: '🎨' },
                { v: 'deuteranopia', label: 'Deut.',      icon: '🔵' },
                { v: 'protanopia',   label: 'Prot.',      icon: '🟡' },
                { v: 'tritanopia',   label: 'Trit.',      icon: '🔴' },
              ] as { v: ColorBlindMode; label: string; icon: string }[]).map(m => (
                <button key={m.v} onClick={() => store.setColorBlindMode(m.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.colorBlindMode === m.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{m.icon}</div>{m.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Motion & Performance" />
            <ToggleRow label="Reduce Motion" desc="Disable animations and transitions"
              checked={store.reduceMotion} onChange={() => store.setReduceMotion(!store.reduceMotion)} />
            <ToggleRow label="Performance Mode" desc="Strip heavy blur and particle effects for smooth rendering"
              checked={store.performanceMode} onChange={() => store.setPerformanceMode(!store.performanceMode)} />
            <ToggleRow label="Auto Performance" desc="Automatically enable on low-end / slow devices"
              checked={store.autoPerformanceMode} onChange={() => store.setAutoPerformanceMode(!store.autoPerformanceMode)} />

            <SectionDivider label="Keyboard & Typing Aids" />
            <ToggleRow label="Mirror Keyboard" desc="Flip keyboard layout for left-hand play"
              checked={store.mirrorKeyboard} onChange={() => store.setMirrorKeyboard(!store.mirrorKeyboard)} />
            <ToggleRow label="Finger Guide" desc="Show which finger to use for each key"
              checked={store.showFingerGuide} onChange={() => store.setShowFingerGuide(!store.showFingerGuide)} />
            <ToggleRow label="Show Keyboard Shortcuts" desc="Display hotkey hints in the UI"
              checked={store.showKeyboardShortcuts} onChange={() => store.setShowKeyboardShortcuts(!store.showKeyboardShortcuts)} />

            <SectionDivider label="Typing Stats Visibility" />
            <ToggleRow label="Show WPM" desc="Words per minute" checked={store.showWpmStat} onChange={() => store.setShowWpmStat(!store.showWpmStat)} />
            <ToggleRow label="Show CPM" desc="Characters per minute" checked={store.showCpmStat} onChange={() => store.setShowCpmStat(!store.showCpmStat)} />
            <ToggleRow label="Show Accuracy" desc="Accuracy percentage" checked={store.showAccuracyStat} onChange={() => store.setShowAccuracyStat(!store.showAccuracyStat)} />
            <ToggleRow label="Show Errors" desc="Error count" checked={store.showErrorsStat} onChange={() => store.setShowErrorsStat(!store.showErrorsStat)} />
            <ToggleRow label="Show Timer" desc="Session timer" checked={store.showTimerStat} onChange={() => store.setShowTimerStat(!store.showTimerStat)} />

            <SectionDivider label="Progress Bar Style" />
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { v: 'line', label: 'Line', icon: '▬' },
                { v: 'ring', label: 'Ring', icon: '⭕' },
                { v: 'dots', label: 'Dots', icon: '⋯' },
                { v: 'none', label: 'None', icon: '○' },
              ] as { v: ProgressBarStyle; label: string; icon: string }[]).map(p => (
                <button key={p.v} onClick={() => store.setProgressBarStyle(p.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.progressBarStyle === p.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{p.icon}</div>{p.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Color Palette Preview" />
            <div className="space-y-1.5">
              <p className="text-[0.52rem] text-white/28 mb-1">Rainbow press cycle</p>
              <div className="flex gap-1.5">
                {['#ff5b55','#ff9f1c','#ffd447','#38e29d','#33a1ff','#5f6bff','#b45cff'].map(c => (
                  <div key={c} className="flex-1 h-3 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}88` }} />
                ))}
              </div>
            </div>

            <SectionDivider label="Data Management" />
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  if (confirm('Reset ALL settings and stats to defaults? This cannot be undone.')) {
                    localStorage.removeItem('vk-settings-v9');
                    window.location.reload();
                  }
                }}
                className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/15 transition-colors"
              >
                Reset All Data
              </button>
              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={() => {
                  const s = useStore.getState();
                  useStore.setState({ theme: s.theme, rgbMode: s.rgbMode });
                }} className="py-2 rounded-xl border border-white/08 text-white/40 text-[0.55rem] hover:text-white/70 hover:border-white/15 transition-all">
                  Reset Visual
                </button>
                <button onClick={() => {
                  useStore.setState({ volume: 0.5, reverbEnabled: false, delayEnabled: false, eqBass: 0, eqMid: 0, eqTreble: 0 });
                }} className="py-2 rounded-xl border border-white/08 text-white/40 text-[0.55rem] hover:text-white/70 hover:border-white/15 transition-all">
                  Reset Audio
                </button>
                <button onClick={() => {
                  useStore.setState({ typingMode: 'free', difficultyLevel: 'intermediate' });
                }} className="py-2 rounded-xl border border-white/08 text-white/40 text-[0.55rem] hover:text-white/70 hover:border-white/15 transition-all">
                  Reset Typing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CUSTOMIZE (STYLE) ── */}
        {activeSection === 'customize' && (
          <div className="space-y-3">
            <SectionDivider label="Key Shape" />
            <div className="grid grid-cols-5 gap-1.5">
              {([
                { v: 'rounded', label: 'Round',  icon: '⬜' },
                { v: 'square',  label: 'Square', icon: '🔲' },
                { v: 'pill',    label: 'Pill',   icon: '💊' },
                { v: 'sharp',   label: 'Sharp',  icon: '🔷' },
                { v: 'gem',     label: 'Gem',    icon: '💎' },
              ] as { v: KeyShape; label: string; icon: string }[]).map(s => (
                <button key={s.v} onClick={() => store.setKeyShape(s.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.keyShape === s.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{s.icon}</div>{s.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Key Press Effect" />
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { v: 'ripple',    label: 'Ripple',    icon: '💧' },
                { v: 'bounce',    label: 'Bounce',    icon: '🏀' },
                { v: 'scale',     label: 'Scale',     icon: '🔍' },
                { v: 'pop',       label: 'Pop',       icon: '💥' },
                { v: 'glow',      label: 'Glow',      icon: '✨' },
                { v: 'wobble',    label: 'Wobble',    icon: '🌊' },
                { v: 'shockwave', label: 'Shock',     icon: '⚡' },
                { v: 'none',      label: 'None',      icon: '⬜' },
              ] as { v: KeyPressEffect; label: string; icon: string }[]).map(e => (
                <button key={e.v} onClick={() => store.setKeyPressEffect(e.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.keyPressEffect === e.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{e.icon}</div>{e.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Key Border Style" />
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { v: 'solid',  label: 'Solid',  icon: '▬' },
                { v: 'glow',   label: 'Glow',   icon: '🔆' },
                { v: 'double', label: 'Double', icon: '⬛' },
                { v: 'none',   label: 'None',   icon: '○' },
              ] as { v: KeyBorderStyle; label: string; icon: string }[]).map(b => (
                <button key={b.v} onClick={() => store.setKeyBorderStyle(b.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.keyBorderStyle === b.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{b.icon}</div>{b.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Key Label Style" />
            <div className="grid grid-cols-5 gap-1.5">
              {([
                { v: 'key',    label: 'Key',    icon: '🔡' },
                { v: 'note',   label: 'Note',   icon: '🎵' },
                { v: 'finger', label: 'Finger', icon: '👆' },
                { v: 'chord',  label: 'Chord',  icon: '🎼' },
                { v: 'none',   label: 'None',   icon: '○' },
              ] as { v: KeyLabelStyle; label: string; icon: string }[]).map(l => (
                <button key={l.v} onClick={() => store.setKeyLabelStyle(l.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.keyLabelStyle === l.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{l.icon}</div>{l.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Gradient Style" />
            <div className="grid grid-cols-5 gap-1.5">
              {([
                { v: 'radial',   label: 'Radial',   icon: '🔵' },
                { v: 'linear-h', label: 'H-Linear', icon: '↔️' },
                { v: 'linear-v', label: 'V-Linear', icon: '↕️' },
                { v: 'diagonal', label: 'Diagonal', icon: '↗️' },
                { v: 'none',     label: 'None',     icon: '⬜' },
              ] as { v: GradientStyle; label: string; icon: string }[]).map(g => (
                <button key={g.v} onClick={() => store.setGradientStyle(g.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.gradientStyle === g.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{g.icon}</div>{g.label}
                </button>
              ))}
            </div>

            <SectionDivider label="RGB Fine-Tuning" />
            <SliderRow label="RGB Brightness" value={store.rgbBrightness} min={0.1} max={2} step={0.05} display={`${store.rgbBrightness.toFixed(2)}×`} onChange={store.setRgbBrightness} />
            <SliderRow label="RGB Saturation" value={store.rgbSaturation} min={0} max={2} step={0.05} display={`${store.rgbSaturation.toFixed(2)}×`} onChange={store.setRgbSaturation} />
            <SliderRow label="RGB Anim Speed" value={store.rgbAnimSpeed} min={0.1} max={5} step={0.1} display={`${store.rgbAnimSpeed.toFixed(1)}×`} onChange={store.setRgbAnimSpeed} />

            <SectionDivider label="Key 3D & Depth" />
            <SliderRow label="Perspective" value={store.keyboardPerspective} min={0} max={30} step={1} display={`${store.keyboardPerspective}°`} onChange={store.setKeyboardPerspective} />
            <SliderRow label="Key Depth" value={store.keyDepth} min={0} max={20} step={1} display={`${store.keyDepth}px`} onChange={store.setKeyDepth} />
            <SliderRow label="Shadow Intensity" value={store.keyShadowIntensity} min={0} max={1} step={0.05} display={`${Math.round(store.keyShadowIntensity * 100)}%`} onChange={store.setKeyShadowIntensity} />
            <SliderRow label="Key Spacing" value={store.keySpacing} min={0.5} max={2} step={0.05} display={`${store.keySpacing.toFixed(2)}×`} onChange={store.setKeySpacing} />

            <SectionDivider label="Key Glow" />
            <SliderRow label="Glow Spread" value={store.keyGlowSpread} min={0} max={40} step={1} display={`${store.keyGlowSpread}px`} onChange={store.setKeyGlowSpread} />
            <SliderRow label="Glow Blur" value={store.keyGlowBlur} min={2} max={40} step={1} display={`${store.keyGlowBlur}px`} onChange={store.setKeyGlowBlur} />
            <ToggleRow label="Key Shimmer" desc="Iridescent shimmer on each key" checked={store.keyShimmer} onChange={() => store.setKeyShimmer(!store.keyShimmer)} />

            <SectionDivider label="Background Fine-Tuning" />
            <SliderRow label="Effect Opacity" value={store.bgEffectOpacity} min={0.1} max={1} step={0.05} display={`${Math.round(store.bgEffectOpacity * 100)}%`} onChange={store.setBgEffectOpacity} />
            <SliderRow label="Effect Speed" value={store.bgEffectSpeed} min={0.25} max={3} step={0.05} display={`${store.bgEffectSpeed.toFixed(2)}×`} onChange={store.setBgEffectSpeed} />
            <SliderRow label="BG Blur" value={store.bgBlurAmount} min={0} max={20} step={1} display={`${store.bgBlurAmount}px`} onChange={store.setBgBlurAmount} />
            <SliderRow label="Particle Density" value={store.particleDensity} min={0.1} max={3} step={0.1} display={`${store.particleDensity.toFixed(1)}×`} onChange={store.setParticleDensity} />
            <SliderRow label="Particle Speed" value={store.particleSpeed} min={0.1} max={3} step={0.1} display={`${store.particleSpeed.toFixed(1)}×`} onChange={store.setParticleSpeed} />

            <SectionDivider label="Custom Colors" />
            <ToggleRow label="Use Custom Colors" desc="Override theme with your own accent & background" checked={store.useCustomColors} onChange={() => store.setUseCustomColors(!store.useCustomColors)} />
            {store.useCustomColors && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="text-[0.52rem] text-white/40">Accent Color</div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={store.customAccentColor} onChange={e => store.setCustomAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-white/15 bg-transparent" style={{ padding: '2px' }} />
                    <span className="font-mono text-[0.52rem] text-violet-400">{store.customAccentColor.toUpperCase()}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[0.52rem] text-white/40">Background Color</div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={store.customBgColor} onChange={e => store.setCustomBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-white/15 bg-transparent" style={{ padding: '2px' }} />
                    <span className="font-mono text-[0.52rem] text-violet-400">{store.customBgColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )}

            <SectionDivider label="Focus & TopBar" />
            <ToggleRow label="TopBar Visible" desc="Show the stats bar at the top" checked={store.topBarVisible} onChange={() => store.setTopBarVisible(!store.topBarVisible)} />
            <SliderRow label="Focus Mode Dim" value={store.focusModeOpacity} min={0.05} max={0.5} step={0.05} display={`${Math.round(store.focusModeOpacity * 100)}%`} onChange={store.setFocusModeOpacity} />

            <SectionDivider label="Typing Display" />
            <div className="grid grid-cols-3 gap-1.5">
              {(['left', 'center', 'right'] as KeyboardAlignment[]).map(a => (
                <button key={a} onClick={() => store.setKeyboardAlignment(a)}
                  className={cn('py-2 rounded-xl border text-[0.58rem] font-bold capitalize transition-all',
                    store.keyboardAlignment === a ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  {a === 'left' ? '⬅️' : a === 'center' ? '↔️' : '➡️'} {a}
                </button>
              ))}
            </div>
            <SliderRow label="Line Height" value={store.typingLineHeight} min={1.2} max={2.5} step={0.05} display={`${store.typingLineHeight.toFixed(2)}`} onChange={store.setTypingLineHeight} />
            <SliderRow label="Letter Spacing" value={store.typingLetterSpacing} min={0} max={0.5} step={0.01} display={`${store.typingLetterSpacing.toFixed(2)}em`} onChange={store.setTypingLetterSpacing} />

            <SectionDivider label="Typing Fonts (Extended)" />
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { v: 'mono',    label: 'Mono',    ff: 'JetBrains Mono, monospace' },
                { v: 'sans',    label: 'Sans',    ff: 'Chakra Petch, sans-serif' },
                { v: 'retro',   label: 'Retro',   ff: 'Courier New, monospace' },
                { v: 'orbitron',label: 'Orbitron', ff: 'monospace' },
                { v: 'vt323',   label: 'VT323',   ff: 'monospace' },
                { v: 'ubuntu',  label: 'Ubuntu',  ff: 'sans-serif' },
                { v: 'fira',    label: 'Fira',    ff: 'monospace' },
                { v: 'space',   label: 'Space',   ff: 'monospace' },
              ]).map(f => (
                <button key={f.v} onClick={() => store.setTypingFont(f.v as any)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.typingFont === f.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-base text-violet-300" style={{ fontFamily: f.ff }}>Aa</div>
                  {f.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Cursor Style (Extended)" />
            <div className="grid grid-cols-5 gap-1.5">
              {([
                { v: 'line',       icon: '|',  label: 'Line'  },
                { v: 'block',      icon: '▌',  label: 'Block' },
                { v: 'underscore', icon: '_',  label: 'Under' },
                { v: 'beam',       icon: '▍',  label: 'Beam'  },
                { v: 'none',       icon: '○',  label: 'None'  },
              ]).map(c => (
                <button key={c.v} onClick={() => store.setCursorStyle(c.v as any)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.cursorStyle === c.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-base font-mono text-violet-300">{c.icon}</div>
                  {c.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Personalization" />
            <div className="flex gap-2">
              <button onClick={() => {
                const themes = ['aurora','midnight','neon','ocean','forest','sunset','rose','matrix','cyberpunk','synthwave'];
                store.setTheme(themes[Math.floor(Math.random() * themes.length)] as any);
              }} className="flex-1 py-2 rounded-xl border border-white/08 text-white/50 hover:text-white hover:border-violet-500/35 text-[0.65rem] font-semibold transition-all">
                🎲 Random Theme
              </button>
              <button onClick={() => {
                const modes = ['wave','breathing','aurora','fire','ice','plasma','disco','neon-pulse'];
                store.setRgbMode(modes[Math.floor(Math.random() * modes.length)] as any);
              }} className="flex-1 py-2 rounded-xl border border-white/08 text-white/50 hover:text-white hover:border-violet-500/35 text-[0.65rem] font-semibold transition-all">
                🎲 Random RGB
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const s = useStore.getState();
                const blob = new Blob([JSON.stringify({
                  theme: s.theme, rgbMode: s.rgbMode, rgbCustomColor: s.rgbCustomColor,
                  soundCategory: s.soundCategory, typingMode: s.typingMode,
                  keyShape: s.keyShape, keyPressEffect: s.keyPressEffect,
                  gradientStyle: s.gradientStyle, keyBorderStyle: s.keyBorderStyle,
                })], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'vk-style.json'; a.click();
                URL.revokeObjectURL(url);
              }} className="flex-1 py-2 rounded-xl border border-white/08 text-white/50 hover:text-white hover:border-blue-500/35 text-[0.65rem] font-semibold transition-all">
                📤 Export Style
              </button>
              <button onClick={() => {
                const s = useStore.getState();
                navigator.clipboard?.writeText(JSON.stringify({ wpm: s.bestWpm, accuracy: s.bestAccuracy, xp: s.xp, streak: s.dailyStreak }))
                  .then(() => alert('Score copied to clipboard!'));
              }} className="flex-1 py-2 rounded-xl border border-white/08 text-white/50 hover:text-white hover:border-green-500/35 text-[0.65rem] font-semibold transition-all">
                📋 Share Score
              </button>
            </div>
          </div>
        )}

        {/* ── ADVANCED AUDIO (FX) ── */}
        {activeSection === 'advanced-audio' && (
          <div className="space-y-3">
            <SectionDivider label="3-Band EQ" />
            <SliderRow label="Bass Boost/Cut" value={store.eqBass} min={-12} max={12} step={0.5} display={`${store.eqBass > 0 ? '+' : ''}${store.eqBass.toFixed(1)} dB`} onChange={store.setEqBass} />
            <SliderRow label="Mid Boost/Cut" value={store.eqMid} min={-12} max={12} step={0.5} display={`${store.eqMid > 0 ? '+' : ''}${store.eqMid.toFixed(1)} dB`} onChange={store.setEqMid} />
            <SliderRow label="Treble Boost/Cut" value={store.eqTreble} min={-12} max={12} step={0.5} display={`${store.eqTreble > 0 ? '+' : ''}${store.eqTreble.toFixed(1)} dB`} onChange={store.setEqTreble} />
            <button onClick={() => { store.setEqBass(0); store.setEqMid(0); store.setEqTreble(0); }}
              className="w-full py-1.5 rounded-xl bg-white/04 border border-white/08 text-[0.6rem] text-white/50 hover:text-white/80 transition-all">
              Reset EQ to Flat
            </button>

            <SectionDivider label="Stereo" />
            <SliderRow label="Stereo Width" value={store.stereoWidth} min={0} max={1} step={0.05} display={`${Math.round(store.stereoWidth * 100)}%`} onChange={store.setStereoWidth} />

            <SectionDivider label="Delay FX" />
            <SliderRow label="Delay Time" value={store.delayTime} min={0.05} max={1} step={0.05} display={`${store.delayTime.toFixed(2)}s`} onChange={store.setDelayTime} />
            <SliderRow label="Delay Feedback" value={store.delayFeedback} min={0} max={0.9} step={0.05} display={`${Math.round(store.delayFeedback * 100)}%`} onChange={store.setDelayFeedback} />

            <SectionDivider label="Reverb FX" />
            <SliderRow label="Reverb Amount" value={store.reverbAmount} min={0} max={1} step={0.05} display={`${Math.round(store.reverbAmount * 100)}%`} onChange={store.setReverbAmount} />
            <SliderRow label="Room Size" value={store.reverbRoomSize} min={0} max={1} step={0.05} display={`${Math.round(store.reverbRoomSize * 100)}%`} onChange={store.setReverbRoomSize} />

            <SectionDivider label="Envelope" />
            <SliderRow label="Attack Time" value={store.attackTime} min={0.001} max={0.5} step={0.001} display={`${(store.attackTime * 1000).toFixed(0)}ms`} onChange={store.setAttackTime} />
            <SliderRow label="Release Time" value={store.releaseTime} min={0.05} max={5} step={0.05} display={`${store.releaseTime.toFixed(2)}s`} onChange={store.setReleaseTime} />
            <SliderRow label="Note Duration ×" value={store.noteDurationMult} min={0.25} max={4} step={0.25} display={`${store.noteDurationMult.toFixed(2)}×`} onChange={store.setNoteDurationMult} />

            <SectionDivider label="Polyphony & Velocity" />
            <SliderRow label="Polyphony Limit" value={store.polyphonyLimit} min={1} max={16} step={1} display={`${store.polyphonyLimit} voices`} onChange={store.setPolyphonyLimit} />
            <SliderRow label="Velocity Sensitivity" value={store.velocitySensitivity} min={0} max={1} step={0.05} display={`${Math.round(store.velocitySensitivity * 100)}%`} onChange={store.setVelocitySensitivity} />
            <SliderRow label="Latency Compensation" value={store.audioLatencyCompensation} min={0} max={100} step={5} display={`${store.audioLatencyCompensation}ms`} onChange={store.setAudioLatencyCompensation} />

            <SectionDivider label="Waveform" />
            <div className="grid grid-cols-4 gap-1.5">
              {(['sine', 'square', 'sawtooth', 'triangle'] as WaveformType[]).map(w => (
                <button key={w} onClick={() => store.setWaveformType(w)}
                  className={cn('py-2 rounded-xl border text-[0.52rem] font-bold capitalize transition-all',
                    store.waveformType === w ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  {w === 'sine' ? '〰️' : w === 'square' ? '⬜' : w === 'sawtooth' ? '📐' : '△'}<br />{w.slice(0, 3)}
                </button>
              ))}
            </div>

            <SectionDivider label="Metronome (Advanced)" />
            <div className="grid grid-cols-5 gap-1.5">
              {(['click', 'beep', 'wood', 'cowbell', 'rim'] as MetronomeSound[]).map(s => (
                <button key={s} onClick={() => store.setMetronomeSound(s)}
                  className={cn('py-2 rounded-xl border text-[0.5rem] font-bold capitalize transition-all',
                    store.metronomeSound === s ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  {s === 'click' ? '🖱️' : s === 'beep' ? '📟' : s === 'wood' ? '🪵' : s === 'cowbell' ? '🐄' : '🥁'}<br />{s}
                </button>
              ))}
            </div>
            <ToggleRow label="Accent Beat" desc="Emphasize the first beat of each bar" checked={store.metronomeAccent} onChange={() => store.setMetronomeAccent(!store.metronomeAccent)} />

            <SectionDivider label="Sound Events" />
            <ToggleRow label="Error Sound" desc="Play a sound when you mistype" checked={store.errorSoundEnabled} onChange={() => store.setErrorSoundEnabled(!store.errorSoundEnabled)} />
            <ToggleRow label="Success Sound" desc="Play a sound on session complete" checked={store.successSoundEnabled} onChange={() => store.setSuccessSoundEnabled(!store.successSoundEnabled)} />
            <SliderRow label="Ambient Volume" value={store.ambientVolume} min={0} max={1} step={0.05} display={`${Math.round(store.ambientVolume * 100)}%`} onChange={store.setAmbientVolume} />

            <SectionDivider label="Note Overlap" />
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { v: 'stop',    label: 'Stop',    icon: '⏹️' },
                { v: 'overlap', label: 'Overlap', icon: '🔀' },
                { v: 'fade',    label: 'Fade',    icon: '🌅' },
              ] as { v: NoteOverlapBehavior; label: string; icon: string }[]).map(o => (
                <button key={o.v} onClick={() => store.setNoteOverlapBehavior(o.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.noteOverlapBehavior === o.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{o.icon}</div>{o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── MUSICAL ── */}
        {activeSection === 'musical' && (
          <div className="space-y-3">
            <SectionDivider label="Play Modes" />
            <ToggleRow label="Chord Mode" desc="Hold Shift + key to play chords" checked={store.chordMode} onChange={() => store.setChordMode(!store.chordMode)} />
            <ToggleRow label="Arpeggio Mode" desc="Automatically arpeggiate held notes" checked={store.arpeggioMode} onChange={() => store.setArpeggioMode(!store.arpeggioMode)} />
            <ToggleRow label="Sustain Mode" desc="Notes continue after key release" checked={store.sustainMode} onChange={() => store.setSustainMode(!store.sustainMode)} />
            <ToggleRow label="Glide Mode" desc="Pitch slides smoothly between notes" checked={store.glideMode} onChange={() => store.setGlideMode(!store.glideMode)} />
            <ToggleRow label="Drone Note" desc="Continuous bass root note plays" checked={store.droneNote} onChange={() => store.setDroneNote(!store.droneNote)} />
            <ToggleRow label="Scale Lock" desc="Only play notes within the chosen scale" checked={store.scaleLock} onChange={() => store.setScaleLock(!store.scaleLock)} />
            <ToggleRow label="Stereo Panning" desc="Pan instruments across the stereo field" checked={store.panningEnabled} onChange={() => store.setPanningEnabled(!store.panningEnabled)} />

            <SectionDivider label="Arpeggio & Glide" />
            <SliderRow label="Arpeggio Rate" value={store.arpeggioRate} min={50} max={500} step={10} display={`${store.arpeggioRate}ms`} onChange={store.setArpeggioRate} />
            <SliderRow label="Glide Speed" value={store.glideSpeed} min={0.01} max={0.5} step={0.01} display={`${store.glideSpeed.toFixed(2)}s`} onChange={store.setGlideSpeed} />

            <SectionDivider label="Chord Voicing" />
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { v: 'basic',  label: 'Basic',  icon: '🎵' },
                { v: 'jazz',   label: 'Jazz',   icon: '🎷' },
                { v: 'power',  label: 'Power',  icon: '⚡' },
                { v: 'spread', label: 'Spread', icon: '🌊' },
              ] as { v: ChordVoicing; label: string; icon: string }[]).map(c => (
                <button key={c.v} onClick={() => store.setChordVoicing(c.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.chordVoicing === c.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{c.icon}</div>{c.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Musical Scale" />
            <ToggleRow label="Scale Lock Active" desc="Constrain all notes to the selected scale" checked={store.scaleEnabled} onChange={() => store.setScaleEnabled(!store.scaleEnabled)} />
            <div className="grid grid-cols-2 gap-1.5">
              {MUSICAL_SCALES.map(scale => (
                <button key={scale.id} onClick={() => { store.setMusicalScale(scale.id); store.setScaleEnabled(true); }}
                  className={cn('text-left px-2.5 py-2 rounded-xl border transition-all',
                    store.musicalScale === scale.id && store.scaleEnabled
                      ? 'border-violet-500 bg-violet-500/15 text-white'
                      : 'border-white/08 bg-white/03 text-white/50 hover:text-white/80 hover:border-white/15')}>
                  <div className="text-[0.6rem] font-semibold">{scale.label}</div>
                  <div className="text-[0.46rem] text-white/30">{scale.desc}</div>
                </button>
              ))}
            </div>

            <SectionDivider label="Difficulty" />
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { v: 'beginner',     label: 'Beginner',     icon: '🌱' },
                { v: 'intermediate', label: 'Mid',          icon: '🌿' },
                { v: 'expert',       label: 'Expert',       icon: '🔥' },
                { v: 'master',       label: 'Master',       icon: '👑' },
              ] as { v: DifficultyLevel; label: string; icon: string }[]).map(d => (
                <button key={d.v} onClick={() => store.setDifficultyLevel(d.v)}
                  className={cn('py-2 rounded-xl border text-center transition-all text-[0.52rem] font-bold',
                    store.difficultyLevel === d.v ? 'border-violet-500 bg-violet-500/18 text-white' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  <div className="text-sm mb-0.5">{d.icon}</div>{d.label}
                </button>
              ))}
            </div>

            <SectionDivider label="Word Pool & Practice" />
            <div className="flex gap-1.5">
              {[20, 50, 100, 200].map(n => (
                <button key={n} onClick={() => store.setWordPoolSize(n)}
                  className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                    store.wordPoolSize === n ? 'border-violet-500 text-violet-300 bg-violet-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  {n}
                </button>
              ))}
            </div>
            <ToggleRow label="Auto-Advance Lesson" desc="Move to next lesson when current is complete" checked={store.autoAdvanceLesson} onChange={() => store.setAutoAdvanceLesson(!store.autoAdvanceLesson)} />

            <SectionDivider label="Break Reminder" />
            <div className="flex gap-1.5">
              {[0, 15, 30, 60].map(m => (
                <button key={m} onClick={() => store.setBreakReminderInterval(m)}
                  className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                    store.breakReminderInterval === m ? 'border-amber-500 text-amber-300 bg-amber-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  {m === 0 ? 'Off' : `${m}m`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PLATFORM PERFORMANCE ── */}
        {activeSection === 'platform' && (
          <div className="space-y-3">
            <SectionDivider label="Rendering" />
            <div className="space-y-1">
              <div className="text-[0.55rem] text-white/40">Target FPS</div>
              <div className="flex gap-1.5">
                {(['max', '60', '30'] as FpsTarget[]).map(f => (
                  <button key={f} onClick={() => store.setFpsTarget(f)}
                    className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                      store.fpsTarget === f ? 'border-blue-500 text-blue-300 bg-blue-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                    {f === 'max' ? 'Max' : `${f} FPS`}
                  </button>
                ))}
              </div>
            </div>
            <ToggleRow label="Adaptive Quality" desc="Auto-reduce effects when performance drops" checked={store.adaptiveQuality} onChange={() => store.setAdaptiveQuality(!store.adaptiveQuality)} />
            <ToggleRow label="GPU Acceleration" desc="Force GPU composite layers for animations" checked={store.gpuAcceleration} onChange={() => store.setGpuAcceleration(!store.gpuAcceleration)} />
            <ToggleRow label="RAF Throttling" desc="Skip animation frames to reduce CPU usage" checked={store.rafThrottling} onChange={() => store.setRafThrottling(!store.rafThrottling)} />
            <ToggleRow label="CSS Containment" desc="Isolate paint/layout for keyboard rows" checked={store.cssContainment} onChange={() => store.setCssContainment(!store.cssContainment)} />
            <ToggleRow label="Show FPS Counter" desc="Display frames per second overlay" checked={store.showFpsCounter} onChange={() => store.setShowFpsCounter(!store.showFpsCounter)} />
            <ToggleRow label="Show Memory Usage" desc="Display JS heap memory usage overlay" checked={store.showMemoryUsage} onChange={() => store.setShowMemoryUsage(!store.showMemoryUsage)} />

            <SectionDivider label="Debounce Delay" />
            <div className="flex gap-1.5">
              {[16, 32, 64, 100].map(d => (
                <button key={d} onClick={() => store.setDebounceDelay(d)}
                  className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                    store.debounceDelay === d ? 'border-blue-500 text-blue-300 bg-blue-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                  {d}ms
                </button>
              ))}
            </div>

            <SectionDivider label="Audio Engine" />
            <div className="space-y-1">
              <div className="text-[0.55rem] text-white/40">Audio Buffer Size</div>
              <div className="flex gap-1.5 flex-wrap">
                {[256, 512, 1024, 2048, 4096].map(b => (
                  <button key={b} onClick={() => store.setAudioBufferSize(b)}
                    className={cn('flex-1 py-2 rounded-xl border text-[0.65rem] font-bold transition-all',
                      store.audioBufferSize === b ? 'border-blue-500 text-blue-300 bg-blue-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <ToggleRow label="Audio Suspend on Idle" desc="Suspend audio engine when keyboard is inactive" checked={store.audioSuspendOnIdle} onChange={() => store.setAudioSuspendOnIdle(!store.audioSuspendOnIdle)} />
            <div className="space-y-1">
              <div className="text-[0.55rem] text-white/40">Suspend Delay</div>
              <div className="flex gap-1.5">
                {[10, 30, 60].map(s => (
                  <button key={s} onClick={() => store.setAudioSuspendDelay(s)}
                    className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                      store.audioSuspendDelay === s ? 'border-blue-500 text-blue-300 bg-blue-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            <SectionDivider label="Mobile & Touch" />
            <ToggleRow label="Touch Optimization" desc="Passive touch listeners for smooth scrolling" checked={store.touchOptimization} onChange={() => store.setTouchOptimization(!store.touchOptimization)} />
            <ToggleRow label="Haptic Feedback" desc="Vibration on key press (mobile)" checked={store.hapticEnabled} onChange={() => store.setHapticEnabled(!store.hapticEnabled)} />
            <ToggleRow label="Swipe Navigation" desc="Swipe between sections on mobile" checked={store.swipeNavigation} onChange={() => store.setSwipeNavigation(!store.swipeNavigation)} />
            <ToggleRow label="Pinch Zoom" desc="Pinch to zoom keyboard on mobile" checked={store.pinchZoom} onChange={() => store.setPinchZoom(!store.pinchZoom)} />

            <SectionDivider label="System" />
            <ToggleRow label="Page Visibility Pause" desc="Pause audio when tab is hidden" checked={store.pageVisibilityPause} onChange={() => store.setPageVisibilityPause(!store.pageVisibilityPause)} />
            <ToggleRow label="Battery Optimization" desc="Reduce effects on low battery devices" checked={store.batteryOptimization} onChange={() => store.setBatteryOptimization(!store.batteryOptimization)} />
            <ToggleRow label="Screen Wake Lock" desc="Keep screen on while typing" checked={store.wakeLock} onChange={() => store.setWakeLock(!store.wakeLock)} />
            <ToggleRow label="Network Adaptive" desc="Reduce data usage on slow connections" checked={store.networkAdaptive} onChange={() => store.setNetworkAdaptive(!store.networkAdaptive)} />
            <ToggleRow label="Offline Mode" desc="Enable full offline functionality via cache" checked={store.offlineMode} onChange={() => store.setOfflineMode(!store.offlineMode)} />
            <ToggleRow label="Reduced Data Mode" desc="Minimize bandwidth and storage use" checked={store.reducedDataMode} onChange={() => store.setReducedDataMode(!store.reducedDataMode)} />

            <SectionDivider label="Memory" />
            <ToggleRow label="Memory Optimization" desc="Aggressive cleanup of unused audio nodes" checked={store.memoryOptimization} onChange={() => store.setMemoryOptimization(!store.memoryOptimization)} />
            <ToggleRow label="Storage Optimization" desc="Compress local storage data" checked={store.storageOptimization} onChange={() => store.setStorageOptimization(!store.storageOptimization)} />
            <div className="space-y-1">
              <div className="text-[0.55rem] text-white/40">Session History Length</div>
              <div className="flex gap-1.5">
                {[20, 50, 100].map(n => (
                  <button key={n} onClick={() => store.setSessionHistoryLength(n)}
                    className={cn('flex-1 py-2 rounded-xl border text-xs font-bold transition-all',
                      store.sessionHistoryLength === n ? 'border-blue-500 text-blue-300 bg-blue-500/15' : 'border-white/08 text-white/45 hover:border-white/22 hover:text-white/75')}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <SectionDivider label="Privacy" />
            <ToggleRow label="Analytics" desc="Share anonymous usage data to improve the app" checked={store.analyticsEnabled} onChange={() => store.setAnalyticsEnabled(!store.analyticsEnabled)} />
          </div>
        )}

        {/* ── MAP ── */}
        {activeSection === 'map' && (
          <div className="space-y-2">
            <p className="text-[0.55rem] text-white/35 mb-3">Every key on your keyboard plays a different instrument</p>
            {INSTRUMENT_MAP.map(item => (
              <div key={item.name} className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-white/04 transition-colors group">
                <span className="text-sm w-5 text-center shrink-0">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">{item.name}</div>
                  <div className="text-[0.5rem] font-mono mt-0.5" style={{ color: item.color }}>{item.keys}</div>
                </div>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="mobile-sheet fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d1a] border-t border-white/10 rounded-t-3xl flex flex-col"
              style={{ height: '88vh', maxHeight: '88vh' }}
            >
              <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                <div className="w-9 h-1 bg-white/18 rounded-full" />
              </div>
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="settings-drawer fixed right-0 top-0 bottom-0 z-50 w-80 bg-[#0d0d1a] border-l border-white/08 flex flex-col shadow-[−20px_0_60px_rgba(0,0,0,0.6)]"
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <div className="min-w-0">
        <div className="text-xs font-medium text-white/82">{label}</div>
        {desc && <div className="text-[0.5rem] text-white/35 mt-0.5 leading-snug">{desc}</div>}
      </div>
      <button
        onClick={onChange}
        className={cn(
          'w-9 h-5 rounded-full relative shrink-0 transition-all duration-200',
          checked ? 'bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'bg-white/10'
        )}
      >
        <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 shadow-sm',
          checked ? 'left-[calc(100%-18px)]' : 'left-0.5')} />
      </button>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/65">{label}</span>
        <span className="text-xs font-mono font-bold text-violet-400">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="h-px flex-1 bg-white/07" />
      <span className="text-[0.48rem] text-white/30 uppercase tracking-widest font-bold">{label}</span>
      <div className="h-px flex-1 bg-white/07" />
    </div>
  );
}
