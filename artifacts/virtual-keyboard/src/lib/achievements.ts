export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp: number;
  category?: string;
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  wpm: number;
  accuracy: number;
  totalKeystrokes: number;
  totalSessions: number;
  totalWordsTyped: number;
  bestWpm: number;
  bestAccuracy: number;
  streak: number;
  unlockedCount: number;
  notesPlayed: number;
  modesUsed: string[];
  lessonsCompleted: number;
  recordingsCount: number;
  totalPlaybackTime: number;
  correctCharsInSession: number;
  errorsInSession: number;
  timedBestWpm: number;
  longestStreak: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── Speed — Fine-grained WPM milestones ───────────────────────────────────
  { id: 'wpm-5',   category:'Speed', title: 'Baby Steps',         desc: 'Reach 5 WPM',   icon: '🐌', rarity:'common',    xp:5,   check: s=>s.wpm>=5 },
  { id: 'wpm-10',  category:'Speed', title: 'First Steps',        desc: 'Reach 10 WPM',  icon: '🐢', rarity:'common',    xp:10,  check: s=>s.wpm>=10 },
  { id: 'wpm-15',  category:'Speed', title: 'Warming Up',         desc: 'Reach 15 WPM',  icon: '☕', rarity:'common',    xp:15,  check: s=>s.wpm>=15 },
  { id: 'wpm-20',  category:'Speed', title: 'Getting Warmed Up',  desc: 'Reach 20 WPM',  icon: '🔥', rarity:'common',    xp:20,  check: s=>s.wpm>=20 },
  { id: 'wpm-25',  category:'Speed', title: 'Quarter Century',    desc: 'Reach 25 WPM',  icon: '🌟', rarity:'common',    xp:25,  check: s=>s.wpm>=25 },
  { id: 'wpm-30',  category:'Speed', title: 'On a Roll',          desc: 'Reach 30 WPM',  icon: '⚡', rarity:'common',    xp:30,  check: s=>s.wpm>=30 },
  { id: 'wpm-35',  category:'Speed', title: 'Picking Up Speed',   desc: 'Reach 35 WPM',  icon: '🚗', rarity:'common',    xp:35,  check: s=>s.wpm>=35 },
  { id: 'wpm-40',  category:'Speed', title: 'Decent Typist',      desc: 'Reach 40 WPM',  icon: '📈', rarity:'common',    xp:40,  check: s=>s.wpm>=40 },
  { id: 'wpm-45',  category:'Speed', title: 'Above Average',      desc: 'Reach 45 WPM',  icon: '🧑‍💻', rarity:'common',  xp:45,  check: s=>s.wpm>=45 },
  { id: 'wpm-50',  category:'Speed', title: 'Half Century',       desc: 'Reach 50 WPM',  icon: '🌟', rarity:'rare',      xp:60,  check: s=>s.wpm>=50 },
  { id: 'wpm-55',  category:'Speed', title: 'Speed Climber',      desc: 'Reach 55 WPM',  icon: '🧗', rarity:'rare',      xp:70,  check: s=>s.wpm>=55 },
  { id: 'wpm-60',  category:'Speed', title: 'Speed Typist',       desc: 'Reach 60 WPM',  icon: '💫', rarity:'rare',      xp:80,  check: s=>s.wpm>=60 },
  { id: 'wpm-65',  category:'Speed', title: 'Key Sprinter',       desc: 'Reach 65 WPM',  icon: '🏃', rarity:'rare',      xp:90,  check: s=>s.wpm>=65 },
  { id: 'wpm-70',  category:'Speed', title: 'Breakneck',          desc: 'Reach 70 WPM',  icon: '🎯', rarity:'rare',      xp:100, check: s=>s.wpm>=70 },
  { id: 'wpm-75',  category:'Speed', title: 'Velocity',           desc: 'Reach 75 WPM',  icon: '🏎️', rarity:'rare',     xp:110, check: s=>s.wpm>=75 },
  { id: 'wpm-80',  category:'Speed', title: 'Hyperdrive',         desc: 'Reach 80 WPM',  icon: '🛸', rarity:'rare',      xp:120, check: s=>s.wpm>=80 },
  { id: 'wpm-85',  category:'Speed', title: 'Lightning Fingers',  desc: 'Reach 85 WPM',  icon: '⚡', rarity:'epic',      xp:135, check: s=>s.wpm>=85 },
  { id: 'wpm-90',  category:'Speed', title: 'Supersonic',         desc: 'Reach 90 WPM',  icon: '🚀', rarity:'epic',      xp:145, check: s=>s.wpm>=90 },
  { id: 'wpm-95',  category:'Speed', title: 'Top Tier',           desc: 'Reach 95 WPM',  icon: '🔝', rarity:'epic',      xp:155, check: s=>s.wpm>=95 },
  { id: 'wpm-100', category:'Speed', title: 'Century Club',       desc: 'Reach 100 WPM', icon: '💎', rarity:'epic',      xp:170, check: s=>s.wpm>=100 },
  { id: 'wpm-105', category:'Speed', title: 'Overdrive',          desc: 'Reach 105 WPM', icon: '🌪️', rarity:'epic',     xp:185, check: s=>s.wpm>=105 },
  { id: 'wpm-110', category:'Speed', title: 'Turbocharged',       desc: 'Reach 110 WPM', icon: '⚙️', rarity:'epic',     xp:200, check: s=>s.wpm>=110 },
  { id: 'wpm-115', category:'Speed', title: 'Storm Fingers',      desc: 'Reach 115 WPM', icon: '⛈️', rarity:'epic',     xp:215, check: s=>s.wpm>=115 },
  { id: 'wpm-120', category:'Speed', title: 'Blazing Fast',       desc: 'Reach 120 WPM', icon: '⚡💎', rarity:'epic',   xp:230, check: s=>s.wpm>=120 },
  { id: 'wpm-125', category:'Speed', title: 'Speed Demon',        desc: 'Reach 125 WPM', icon: '👹', rarity:'epic',      xp:245, check: s=>s.wpm>=125 },
  { id: 'wpm-130', category:'Speed', title: 'Afterburner',        desc: 'Reach 130 WPM', icon: '🛩️', rarity:'epic',     xp:260, check: s=>s.wpm>=130 },
  { id: 'wpm-135', category:'Speed', title: 'Mach Fingers',       desc: 'Reach 135 WPM', icon: '✈️', rarity:'epic',     xp:275, check: s=>s.wpm>=135 },
  { id: 'wpm-140', category:'Speed', title: 'Warp Factor',        desc: 'Reach 140 WPM', icon: '🌌', rarity:'epic',      xp:290, check: s=>s.wpm>=140 },
  { id: 'wpm-145', category:'Speed', title: 'Orbital',            desc: 'Reach 145 WPM', icon: '🪐', rarity:'epic',      xp:295, check: s=>s.wpm>=145 },
  { id: 'wpm-150', category:'Speed', title: 'Legendary Fingers',  desc: 'Reach 150 WPM', icon: '👑', rarity:'legendary', xp:320, check: s=>s.wpm>=150 },
  { id: 'wpm-160', category:'Speed', title: 'Machine Hands',      desc: 'Reach 160 WPM', icon: '🤖', rarity:'legendary', xp:360, check: s=>s.wpm>=160 },
  { id: 'wpm-170', category:'Speed', title: 'God Mode',           desc: 'Reach 170 WPM', icon: '⚡👑', rarity:'legendary', xp:410, check: s=>s.wpm>=170 },
  { id: 'wpm-180', category:'Speed', title: 'Unearthly',          desc: 'Reach 180 WPM', icon: '🌟👑', rarity:'legendary', xp:465, check: s=>s.wpm>=180 },
  { id: 'wpm-190', category:'Speed', title: 'Ultra Instinct',     desc: 'Reach 190 WPM', icon: '🌀', rarity:'legendary', xp:485, check: s=>s.wpm>=190 },
  { id: 'wpm-200', category:'Speed', title: 'Beyond Human',       desc: 'Reach 200 WPM', icon: '🌌', rarity:'legendary', xp:500, check: s=>s.wpm>=200 },
  { id: 'wpm-225', category:'Speed', title: 'Transcendent Speed', desc: 'Reach 225 WPM', icon: '✨🌌', rarity:'legendary', xp:650, check: s=>s.wpm>=225 },
  { id: 'wpm-250', category:'Speed', title: 'The Flash',          desc: 'Reach 250 WPM', icon: '⚡🌌', rarity:'legendary', xp:800, check: s=>s.wpm>=250 },
  { id: 'wpm-300', category:'Speed', title: 'Impossible',         desc: 'Reach 300 WPM', icon: '🏆🌌', rarity:'legendary', xp:1500, check: s=>s.wpm>=300 },

  // ── Best WPM Records ──────────────────────────────────────────────────────
  { id: 'best-30',  category:'Records', title: 'Personal Best 30', desc: 'Best WPM ≥ 30',  icon: '📊', rarity:'common',    xp:15,  check: s=>s.bestWpm>=30 },
  { id: 'best-50',  category:'Records', title: 'Personal Best 50', desc: 'Best WPM ≥ 50',  icon: '🏅', rarity:'common',    xp:30,  check: s=>s.bestWpm>=50 },
  { id: 'best-75',  category:'Records', title: 'Personal Best 75', desc: 'Best WPM ≥ 75',  icon: '🥈', rarity:'rare',      xp:60,  check: s=>s.bestWpm>=75 },
  { id: 'best-100', category:'Records', title: 'Personal Best 100',desc: 'Best WPM ≥ 100', icon: '🥇', rarity:'epic',      xp:100, check: s=>s.bestWpm>=100 },
  { id: 'best-125', category:'Records', title: 'Personal Best 125',desc: 'Best WPM ≥ 125', icon: '🏆', rarity:'epic',      xp:150, check: s=>s.bestWpm>=125 },
  { id: 'best-150', category:'Records', title: 'Personal Best 150',desc: 'Best WPM ≥ 150', icon: '👑', rarity:'legendary', xp:200, check: s=>s.bestWpm>=150 },
  { id: 'best-200', category:'Records', title: 'Personal Best 200',desc: 'Best WPM ≥ 200', icon: '🌌', rarity:'legendary', xp:400, check: s=>s.bestWpm>=200 },

  // ── Accuracy ──────────────────────────────────────────────────────────────
  { id: 'acc-50',  category:'Accuracy', title: 'Rookie',           desc: 'Reach 50% accuracy', icon: '🎯', rarity:'common',    xp:5,   check: s=>s.accuracy>=50 },
  { id: 'acc-60',  category:'Accuracy', title: 'Trying Hard',      desc: 'Reach 60% accuracy', icon: '💪', rarity:'common',    xp:8,   check: s=>s.accuracy>=60 },
  { id: 'acc-70',  category:'Accuracy', title: 'Getting Better',   desc: 'Reach 70% accuracy', icon: '📈', rarity:'common',    xp:12,  check: s=>s.accuracy>=70 },
  { id: 'acc-75',  category:'Accuracy', title: 'Pretty Good',      desc: 'Reach 75% accuracy', icon: '✅', rarity:'common',    xp:18,  check: s=>s.accuracy>=75 },
  { id: 'acc-80',  category:'Accuracy', title: 'Careful Typist',   desc: 'Reach 80% accuracy', icon: '🎯', rarity:'common',    xp:22,  check: s=>s.accuracy>=80 },
  { id: 'acc-85',  category:'Accuracy', title: 'Sure Fingers',     desc: 'Reach 85% accuracy', icon: '🎯', rarity:'common',    xp:30,  check: s=>s.accuracy>=85 },
  { id: 'acc-88',  category:'Accuracy', title: 'Steady Hands',     desc: 'Reach 88% accuracy', icon: '🤏', rarity:'common',    xp:35,  check: s=>s.accuracy>=88 },
  { id: 'acc-90',  category:'Accuracy', title: 'Sharp Eyes',       desc: 'Reach 90% accuracy', icon: '👁️', rarity:'common',   xp:40,  check: s=>s.accuracy>=90 },
  { id: 'acc-92',  category:'Accuracy', title: 'Careful',          desc: 'Reach 92% accuracy', icon: '🔍', rarity:'rare',      xp:48,  check: s=>s.accuracy>=92 },
  { id: 'acc-93',  category:'Accuracy', title: 'Near Perfect',     desc: 'Reach 93% accuracy', icon: '🔬', rarity:'rare',      xp:55,  check: s=>s.accuracy>=93 },
  { id: 'acc-95',  category:'Accuracy', title: 'Precision',        desc: 'Reach 95% accuracy', icon: '🔬', rarity:'rare',      xp:70,  check: s=>s.accuracy>=95 },
  { id: 'acc-96',  category:'Accuracy', title: 'High Precision',   desc: 'Reach 96% accuracy', icon: '🦅', rarity:'rare',      xp:80,  check: s=>s.accuracy>=96 },
  { id: 'acc-97',  category:'Accuracy', title: 'Eagle Eye',        desc: 'Reach 97% accuracy', icon: '🦅', rarity:'epic',      xp:90,  check: s=>s.accuracy>=97 },
  { id: 'acc-98',  category:'Accuracy', title: 'Master Precision', desc: 'Reach 98% accuracy', icon: '🎯', rarity:'epic',      xp:100, check: s=>s.accuracy>=98 },
  { id: 'acc-99',  category:'Accuracy', title: 'Perfectionist',    desc: 'Reach 99% accuracy', icon: '💯', rarity:'epic',      xp:120, check: s=>s.accuracy>=99 },
  { id: 'acc-99.5',category:'Accuracy', title: 'Almost There',     desc: 'Reach 99.5% accuracy',icon:'💫',rarity:'legendary',  xp:160, check: s=>s.accuracy>=99.5 },
  { id: 'acc-100', category:'Accuracy', title: 'Flawless',         desc: 'Reach 100% accuracy',icon: '✨', rarity:'legendary', xp:200, check: s=>s.accuracy>=100 },
  { id: 'no-errors',category:'Accuracy',title: 'Zero Mistakes',    desc: 'Session with zero errors',icon:'🏹', rarity:'epic',   xp:75,  check: s=>s.errorsInSession===0 && s.correctCharsInSession>=20 },
  { id: 'no-errors-lg',category:'Accuracy',title:'Immaculate',     desc: '100% accuracy, 100+ chars',icon:'💎',rarity:'legendary',xp:250, check: s=>s.accuracy>=100 && s.correctCharsInSession>=100 },

  // ── Best Accuracy Records ─────────────────────────────────────────────────
  { id: 'bacc-90', category:'Records', title: 'Accuracy Rec 90',  desc: 'Best accuracy ≥ 90%', icon: '🎯', rarity:'common',    xp:25,  check: s=>s.bestAccuracy>=90 },
  { id: 'bacc-95', category:'Records', title: 'Accuracy Rec 95',  desc: 'Best accuracy ≥ 95%', icon: '🔬', rarity:'rare',      xp:50,  check: s=>s.bestAccuracy>=95 },
  { id: 'bacc-99', category:'Records', title: 'Accuracy Rec 99',  desc: 'Best accuracy ≥ 99%', icon: '💯', rarity:'epic',      xp:100, check: s=>s.bestAccuracy>=99 },
  { id: 'bacc-100',category:'Records', title: 'Perfect Best',     desc: 'Best accuracy = 100%',icon: '✨', rarity:'legendary', xp:200, check: s=>s.bestAccuracy>=100 },

  // ── Keystrokes ────────────────────────────────────────────────────────────
  { id: 'keys-50',   category:'Keystrokes', title: 'Tippy Taps',    desc: 'Type 50 keystrokes',        icon: '👆', rarity:'common',    xp:3,   check: s=>s.totalKeystrokes>=50 },
  { id: 'keys-100',  category:'Keystrokes', title: 'Just Starting', desc: 'Type 100 keystrokes',       icon: '⌨️', rarity:'common',    xp:5,   check: s=>s.totalKeystrokes>=100 },
  { id: 'keys-250',  category:'Keystrokes', title: 'Quarter K',     desc: 'Type 250 keystrokes',       icon: '🌡️', rarity:'common',   xp:8,   check: s=>s.totalKeystrokes>=250 },
  { id: 'keys-500',  category:'Keystrokes', title: 'Half K',        desc: 'Type 500 keystrokes',       icon: '🔑', rarity:'common',    xp:12,  check: s=>s.totalKeystrokes>=500 },
  { id: 'keys-1k',   category:'Keystrokes', title: 'Keyboard Lover',desc: 'Type 1,000 keystrokes',    icon: '🎹', rarity:'common',    xp:20,  check: s=>s.totalKeystrokes>=1000 },
  { id: 'keys-2k',   category:'Keystrokes', title: 'Key Fanatic',   desc: 'Type 2,000 keystrokes',    icon: '⌨️', rarity:'common',    xp:30,  check: s=>s.totalKeystrokes>=2000 },
  { id: 'keys-5k',   category:'Keystrokes', title: 'Committed',     desc: 'Type 5,000 keystrokes',    icon: '💪', rarity:'rare',      xp:50,  check: s=>s.totalKeystrokes>=5000 },
  { id: 'keys-10k',  category:'Keystrokes', title: 'Dedicated',     desc: 'Type 10,000 keystrokes',   icon: '🌙', rarity:'rare',      xp:75,  check: s=>s.totalKeystrokes>=10000 },
  { id: 'keys-20k',  category:'Keystrokes', title: 'Key Warrior',   desc: 'Type 20,000 keystrokes',   icon: '⚔️', rarity:'rare',     xp:100, check: s=>s.totalKeystrokes>=20000 },
  { id: 'keys-50k',  category:'Keystrokes', title: 'Obsessed',      desc: 'Type 50,000 keystrokes',   icon: '🔮', rarity:'epic',      xp:150, check: s=>s.totalKeystrokes>=50000 },
  { id: 'keys-100k', category:'Keystrokes', title: 'Master Typist', desc: 'Type 100,000 keystrokes',  icon: '👑', rarity:'epic',      xp:250, check: s=>s.totalKeystrokes>=100000 },
  { id: 'keys-250k', category:'Keystrokes', title: 'Key Conqueror', desc: 'Type 250,000 keystrokes',  icon: '🌟', rarity:'epic',      xp:400, check: s=>s.totalKeystrokes>=250000 },
  { id: 'keys-500k', category:'Keystrokes', title: 'Type God',      desc: 'Type 500,000 keystrokes',  icon: '⚡', rarity:'legendary', xp:600, check: s=>s.totalKeystrokes>=500000 },
  { id: 'keys-750k', category:'Keystrokes', title: 'Three Quarter M',desc:'Type 750,000 keystrokes',  icon: '🏆', rarity:'legendary', xp:800, check: s=>s.totalKeystrokes>=750000 },
  { id: 'keys-1m',   category:'Keystrokes', title: 'The Millionaire',desc:'Type 1,000,000 keystrokes',icon: '💎', rarity:'legendary', xp:1500, check: s=>s.totalKeystrokes>=1000000 },

  // ── Sessions ──────────────────────────────────────────────────────────────
  { id: 'sess-1',   category:'Sessions', title: 'First Try',       desc: 'Complete 1 session',     icon: '🎉', rarity:'common',    xp:10,  check: s=>s.totalSessions>=1 },
  { id: 'sess-3',   category:'Sessions', title: 'Trilogy',         desc: 'Complete 3 sessions',    icon: '3️⃣', rarity:'common',   xp:15,  check: s=>s.totalSessions>=3 },
  { id: 'sess-5',   category:'Sessions', title: 'Regular',         desc: 'Complete 5 sessions',    icon: '📅', rarity:'common',    xp:20,  check: s=>s.totalSessions>=5 },
  { id: 'sess-10',  category:'Sessions', title: 'Habit Forming',   desc: 'Complete 10 sessions',   icon: '🔄', rarity:'common',    xp:35,  check: s=>s.totalSessions>=10 },
  { id: 'sess-15',  category:'Sessions', title: 'Committed',       desc: 'Complete 15 sessions',   icon: '💼', rarity:'common',    xp:45,  check: s=>s.totalSessions>=15 },
  { id: 'sess-20',  category:'Sessions', title: 'Twenty Strong',   desc: 'Complete 20 sessions',   icon: '2️⃣0️⃣', rarity:'common', xp:55, check: s=>s.totalSessions>=20 },
  { id: 'sess-25',  category:'Sessions', title: 'Consistent',      desc: 'Complete 25 sessions',   icon: '📈', rarity:'rare',      xp:70,  check: s=>s.totalSessions>=25 },
  { id: 'sess-50',  category:'Sessions', title: 'Dedicated Player',desc: 'Complete 50 sessions',   icon: '🏆', rarity:'rare',      xp:100, check: s=>s.totalSessions>=50 },
  { id: 'sess-75',  category:'Sessions', title: 'Devoted',         desc: 'Complete 75 sessions',   icon: '⭐', rarity:'rare',      xp:130, check: s=>s.totalSessions>=75 },
  { id: 'sess-100', category:'Sessions', title: 'Century Master',  desc: 'Complete 100 sessions',  icon: '💎', rarity:'epic',      xp:200, check: s=>s.totalSessions>=100 },
  { id: 'sess-150', category:'Sessions', title: 'Power Typist',    desc: 'Complete 150 sessions',  icon: '⚡', rarity:'epic',      xp:275, check: s=>s.totalSessions>=150 },
  { id: 'sess-200', category:'Sessions', title: 'Double Century',  desc: 'Complete 200 sessions',  icon: '🌟', rarity:'epic',      xp:350, check: s=>s.totalSessions>=200 },
  { id: 'sess-300', category:'Sessions', title: 'Triple C',        desc: 'Complete 300 sessions',  icon: '🔱', rarity:'legendary', xp:450, check: s=>s.totalSessions>=300 },
  { id: 'sess-500', category:'Sessions', title: 'Eternal Typist',  desc: 'Complete 500 sessions',  icon: '👑', rarity:'legendary', xp:700, check: s=>s.totalSessions>=500 },
  { id: 'sess-1000',category:'Sessions', title: 'Thousand Strong', desc: 'Complete 1,000 sessions',icon: '🌌', rarity:'legendary', xp:1500, check: s=>s.totalSessions>=1000 },

  // ── Words Typed ────────────────────────────────────────────────────────────
  { id: 'words-50',   category:'Words', title: 'Word Baby',        desc: 'Type 50 words',       icon: '📝', rarity:'common',    xp:5,   check: s=>s.totalWordsTyped>=50 },
  { id: 'words-100',  category:'Words', title: 'Wordsmith',        desc: 'Type 100 words',      icon: '📄', rarity:'common',    xp:15,  check: s=>s.totalWordsTyped>=100 },
  { id: 'words-250',  category:'Words', title: 'Word Sprinter',    desc: 'Type 250 words',      icon: '🏃', rarity:'common',    xp:25,  check: s=>s.totalWordsTyped>=250 },
  { id: 'words-500',  category:'Words', title: 'Half Thousand',    desc: 'Type 500 words',      icon: '📚', rarity:'common',    xp:35,  check: s=>s.totalWordsTyped>=500 },
  { id: 'words-1k',   category:'Words', title: 'Author',           desc: 'Type 1,000 words',    icon: '📖', rarity:'rare',      xp:50,  check: s=>s.totalWordsTyped>=1000 },
  { id: 'words-2k',   category:'Words', title: 'Storyteller',      desc: 'Type 2,000 words',    icon: '📕', rarity:'rare',      xp:70,  check: s=>s.totalWordsTyped>=2000 },
  { id: 'words-5k',   category:'Words', title: 'Word Master',      desc: 'Type 5,000 words',    icon: '📗', rarity:'rare',      xp:100, check: s=>s.totalWordsTyped>=5000 },
  { id: 'words-10k',  category:'Words', title: 'Novelist',         desc: 'Type 10,000 words',   icon: '📘', rarity:'epic',      xp:175, check: s=>s.totalWordsTyped>=10000 },
  { id: 'words-25k',  category:'Words', title: 'Epic Writer',      desc: 'Type 25,000 words',   icon: '📙', rarity:'epic',      xp:275, check: s=>s.totalWordsTyped>=25000 },
  { id: 'words-50k',  category:'Words', title: 'Epic Author',      desc: 'Type 50,000 words',   icon: '🖊️', rarity:'epic',     xp:400, check: s=>s.totalWordsTyped>=50000 },
  { id: 'words-100k', category:'Words', title: 'Literary Legend',  desc: 'Type 100,000 words',  icon: '📜', rarity:'legendary', xp:750, check: s=>s.totalWordsTyped>=100000 },
  { id: 'words-250k', category:'Words', title: 'Library',          desc: 'Type 250,000 words',  icon: '📚', rarity:'legendary', xp:1500, check: s=>s.totalWordsTyped>=250000 },

  // ── Streaks ────────────────────────────────────────────────────────────────
  { id: 'streak-2',   category:'Streaks', title: 'Two Days',       desc: '2-day daily streak',  icon: '🔥', rarity:'common',    xp:10,  check: s=>s.streak>=2 },
  { id: 'streak-3',   category:'Streaks', title: 'On a Streak',    desc: '3-day daily streak',  icon: '🔥', rarity:'common',    xp:15,  check: s=>s.streak>=3 },
  { id: 'streak-5',   category:'Streaks', title: 'Work Week',      desc: '5-day daily streak',  icon: '💼', rarity:'common',    xp:25,  check: s=>s.streak>=5 },
  { id: 'streak-7',   category:'Streaks', title: 'Week Warrior',   desc: '7-day daily streak',  icon: '🔥🔥', rarity:'rare',   xp:50,  check: s=>s.streak>=7 },
  { id: 'streak-10',  category:'Streaks', title: 'Ten Days',       desc: '10-day daily streak', icon: '🌟', rarity:'rare',      xp:65,  check: s=>s.streak>=10 },
  { id: 'streak-14',  category:'Streaks', title: 'Fortnight',      desc: '14-day daily streak', icon: '💪🔥', rarity:'rare',   xp:80,  check: s=>s.streak>=14 },
  { id: 'streak-21',  category:'Streaks', title: 'Three Weeks',    desc: '21-day daily streak', icon: '⭐', rarity:'rare',      xp:100, check: s=>s.streak>=21 },
  { id: 'streak-30',  category:'Streaks', title: 'Monthly Master', desc: '30-day daily streak', icon: '💎🔥', rarity:'epic',   xp:140, check: s=>s.streak>=30 },
  { id: 'streak-45',  category:'Streaks', title: 'Forty Five',     desc: '45-day daily streak', icon: '🎯', rarity:'epic',      xp:175, check: s=>s.streak>=45 },
  { id: 'streak-60',  category:'Streaks', title: 'Two Months',     desc: '60-day daily streak', icon: '🏅', rarity:'epic',      xp:210, check: s=>s.streak>=60 },
  { id: 'streak-90',  category:'Streaks', title: 'Season Pro',     desc: '90-day daily streak', icon: '🏆', rarity:'legendary', xp:300, check: s=>s.streak>=90 },
  { id: 'streak-100', category:'Streaks', title: 'Century Streak', desc: '100-day streak',      icon: '👑🔥', rarity:'legendary', xp:400, check: s=>s.streak>=100 },
  { id: 'streak-180', category:'Streaks', title: 'Half Year Hero', desc: '180-day daily streak',icon: '🌌', rarity:'legendary', xp:600, check: s=>s.streak>=180 },
  { id: 'streak-365', category:'Streaks', title: 'Year of Fire',   desc: '365-day daily streak',icon: '🌞', rarity:'legendary', xp:1500, check: s=>s.streak>=365 },
  { id: 'long-str-7', category:'Streaks', title: 'Longest 7',      desc: 'Longest streak ≥ 7',  icon: '🌈', rarity:'rare',      xp:40,  check: s=>s.longestStreak>=7 },
  { id: 'long-str-30',category:'Streaks', title: 'Longest 30',     desc: 'Longest streak ≥ 30', icon: '💎', rarity:'epic',      xp:120, check: s=>s.longestStreak>=30 },
  { id: 'long-str-100',category:'Streaks', title: 'Unstoppable',   desc: 'Longest streak ≥ 100',icon: '👑', rarity:'legendary', xp:500, check: s=>s.longestStreak>=100 },

  // ── Musical / Notes ────────────────────────────────────────────────────────
  { id: 'notes-10',   category:'Musical', title: 'First Note',     desc: 'Play 10 notes',       icon: '🎵', rarity:'common',    xp:5,   check: s=>s.notesPlayed>=10 },
  { id: 'notes-50',   category:'Musical', title: 'Melody Maker',   desc: 'Play 50 notes',       icon: '🎶', rarity:'common',    xp:10,  check: s=>s.notesPlayed>=50 },
  { id: 'notes-100',  category:'Musical', title: 'Note Novice',    desc: 'Play 100 notes',      icon: '🎼', rarity:'common',    xp:15,  check: s=>s.notesPlayed>=100 },
  { id: 'notes-250',  category:'Musical', title: 'Rhythm Keeper',  desc: 'Play 250 notes',      icon: '🥁', rarity:'common',    xp:25,  check: s=>s.notesPlayed>=250 },
  { id: 'notes-500',  category:'Musical', title: 'Composer',       desc: 'Play 500 notes',      icon: '🎶', rarity:'rare',      xp:40,  check: s=>s.notesPlayed>=500 },
  { id: 'notes-1k',   category:'Musical', title: 'Keyboard Musician',desc:'Play 1,000 notes',   icon: '🎸', rarity:'rare',      xp:75,  check: s=>s.notesPlayed>=1000 },
  { id: 'notes-2k',   category:'Musical', title: 'Jazz Player',    desc: 'Play 2,000 notes',    icon: '🎷', rarity:'rare',      xp:100, check: s=>s.notesPlayed>=2000 },
  { id: 'notes-5k',   category:'Musical', title: 'Virtuoso',       desc: 'Play 5,000 notes',    icon: '🎼', rarity:'epic',      xp:150, check: s=>s.notesPlayed>=5000 },
  { id: 'notes-10k',  category:'Musical', title: 'Concert Pianist',desc: 'Play 10,000 notes',   icon: '🎹', rarity:'epic',      xp:250, check: s=>s.notesPlayed>=10000 },
  { id: 'notes-25k',  category:'Musical', title: 'Maestro',        desc: 'Play 25,000 notes',   icon: '🎻', rarity:'epic',      xp:375, check: s=>s.notesPlayed>=25000 },
  { id: 'notes-50k',  category:'Musical', title: 'Concert Master', desc: 'Play 50,000 notes',   icon: '🎭', rarity:'legendary', xp:500, check: s=>s.notesPlayed>=50000 },
  { id: 'notes-100k', category:'Musical', title: 'Symphony Legend',desc: 'Play 100,000 notes',  icon: '🎺', rarity:'legendary', xp:750, check: s=>s.notesPlayed>=100000 },
  { id: 'notes-250k', category:'Musical', title: 'Musical God',    desc: 'Play 250,000 notes',  icon: '🎻', rarity:'legendary', xp:1500, check: s=>s.notesPlayed>=250000 },

  // ── Mode Explorer ─────────────────────────────────────────────────────────
  { id: 'mode-3',    category:'Explorer', title: 'Explorer',       desc: 'Try 3 different modes',  icon: '🗺️', rarity:'common',  xp:15,  check: s=>s.modesUsed.length>=3 },
  { id: 'mode-5',    category:'Explorer', title: 'Mode Hopper',    desc: 'Try 5 different modes',  icon: '🔀', rarity:'common',  xp:25,  check: s=>s.modesUsed.length>=5 },
  { id: 'mode-6',    category:'Explorer', title: 'Versatile',      desc: 'Try 6 different modes',  icon: '🧭', rarity:'common',  xp:30,  check: s=>s.modesUsed.length>=6 },
  { id: 'mode-10',   category:'Explorer', title: 'All-Rounder',    desc: 'Try 10 typing modes',    icon: '🌍', rarity:'rare',    xp:60,  check: s=>s.modesUsed.length>=10 },
  { id: 'mode-15',   category:'Explorer', title: 'Mode Seeker',    desc: 'Try 15 different modes', icon: '🔭', rarity:'rare',    xp:85,  check: s=>s.modesUsed.length>=15 },
  { id: 'mode-20',   category:'Explorer', title: 'Mode Collector', desc: 'Try 20 different modes', icon: '🎭', rarity:'epic',    xp:120, check: s=>s.modesUsed.length>=20 },
  { id: 'mode-30',   category:'Explorer', title: 'Mode Scholar',   desc: 'Try 30 different modes', icon: '📚', rarity:'epic',    xp:175, check: s=>s.modesUsed.length>=30 },
  { id: 'mode-50',   category:'Explorer', title: 'Mode Master',    desc: 'Try 50 different modes', icon: '🏆', rarity:'epic',    xp:250, check: s=>s.modesUsed.length>=50 },
  { id: 'mode-75',   category:'Explorer', title: 'Mode Legend',    desc: 'Try 75 different modes', icon: '🌟', rarity:'legendary',xp:400, check: s=>s.modesUsed.length>=75 },
  { id: 'mode-all',  category:'Explorer', title: 'Mode God',       desc: 'Try 100+ different modes',icon:'👑', rarity:'legendary',xp:1000, check: s=>s.modesUsed.length>=100 },
  // Mode-specific badges
  { id: 'mode-zen',   category:'Explorer', title: 'Zen Seeker',    desc: 'Play in Zen mode',       icon: '🧘', rarity:'rare',    xp:25,  check: s=>s.modesUsed.includes('zen') },
  { id: 'mode-sprint',category:'Explorer', title: 'Sprint Champ',  desc: 'Complete a Sprint',      icon: '💨', rarity:'rare',    xp:30,  check: s=>s.modesUsed.includes('sprint') },
  { id: 'mode-space', category:'Explorer', title: 'Space Cadet',   desc: 'Type Space Facts',       icon: '🚀', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('space') },
  { id: 'mode-myth',  category:'Explorer', title: 'Mythologist',   desc: 'Type Mythology',         icon: '⚡', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('mythology') },
  { id: 'mode-hist',  category:'Explorer', title: 'History Buff',  desc: 'Type History facts',     icon: '📜', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('history') },
  { id: 'mode-geo',   category:'Explorer', title: 'Geographer',    desc: 'Type Geography',         icon: '🌎', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('geography') },
  { id: 'mode-nature',category:'Explorer', title: 'Naturalist',    desc: 'Type Nature texts',      icon: '🌿', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('nature') },
  { id: 'mode-music', category:'Explorer', title: 'Music Scholar', desc: 'Type Music facts',       icon: '🎵', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('music') },
  { id: 'mode-code',  category:'Explorer', title: 'Code Monkey',   desc: 'Type Code',              icon: '💻', rarity:'rare',    xp:30,  check: s=>s.modesUsed.includes('code') },
  { id: 'mode-anime', category:'Explorer', title: 'Otaku',         desc: 'Type Anime facts',       icon: '⛩️', rarity:'common', xp:20,  check: s=>s.modesUsed.includes('anime') },
  { id: 'mode-science',category:'Explorer',title: 'Scientist',     desc: 'Type Science facts',     icon: '🔬', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('science') },
  { id: 'mode-cook',  category:'Explorer', title: 'Chef',          desc: 'Type Cooking facts',     icon: '🍳', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('cooking') },
  { id: 'mode-film',  category:'Explorer', title: 'Film Buff',     desc: 'Type Movie quotes',      icon: '🎬', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('movies') },
  { id: 'mode-poem',  category:'Explorer', title: 'Poet',          desc: 'Type Poetry',            icon: '🌹', rarity:'common',  xp:20,  check: s=>s.modesUsed.includes('poetry') },

  // ── Lessons ────────────────────────────────────────────────────────────────
  { id: 'lesson-1',  category:'Lessons', title: 'Student',         desc: 'Complete lesson 1',      icon: '📗', rarity:'common',  xp:10,  check: s=>s.lessonsCompleted>=1 },
  { id: 'lesson-3',  category:'Lessons', title: 'Studious',        desc: 'Complete 3 lessons',     icon: '📘', rarity:'common',  xp:20,  check: s=>s.lessonsCompleted>=3 },
  { id: 'lesson-5',  category:'Lessons', title: 'Scholar',         desc: 'Complete 5 lessons',     icon: '🎓', rarity:'rare',    xp:40,  check: s=>s.lessonsCompleted>=5 },
  { id: 'lesson-8',  category:'Lessons', title: 'Diligent',        desc: 'Complete 8 lessons',     icon: '📙', rarity:'rare',    xp:60,  check: s=>s.lessonsCompleted>=8 },
  { id: 'lesson-10', category:'Lessons', title: 'Graduate',        desc: 'Complete 10 lessons',    icon: '🏅', rarity:'epic',    xp:100, check: s=>s.lessonsCompleted>=10 },
  { id: 'lesson-15', category:'Lessons', title: 'Honor Roll',      desc: 'Complete 15 lessons',    icon: '📜', rarity:'epic',    xp:135, check: s=>s.lessonsCompleted>=15 },
  { id: 'lesson-20', category:'Lessons', title: 'Graduation Day',  desc: 'Complete all 20 lessons',icon: '🎓', rarity:'legendary',xp:200, check: s=>s.lessonsCompleted>=20 },

  // ── Recordings ────────────────────────────────────────────────────────────
  { id: 'rec-1',   category:'Recordings', title: 'First Recording',desc: 'Make 1 recording',       icon: '🎙️', rarity:'common',  xp:15,  check: s=>s.recordingsCount>=1 },
  { id: 'rec-3',   category:'Recordings', title: 'Three Tracks',   desc: 'Make 3 recordings',      icon: '🎚️', rarity:'common',  xp:25,  check: s=>s.recordingsCount>=3 },
  { id: 'rec-5',   category:'Recordings', title: 'Studio Time',    desc: 'Make 5 recordings',      icon: '🎤', rarity:'rare',    xp:50,  check: s=>s.recordingsCount>=5 },
  { id: 'rec-10',  category:'Recordings', title: 'Producer',       desc: 'Make 10 recordings',     icon: '🎛️', rarity:'rare',   xp:80,  check: s=>s.recordingsCount>=10 },
  { id: 'rec-20',  category:'Recordings', title: 'Music Studio',   desc: 'Make 20 recordings',     icon: '🎧', rarity:'epic',    xp:140, check: s=>s.recordingsCount>=20 },
  { id: 'rec-50',  category:'Recordings', title: 'Audiophile',     desc: 'Make 50 recordings',     icon: '🎺', rarity:'epic',    xp:250, check: s=>s.recordingsCount>=50 },
  { id: 'rec-100', category:'Recordings', title: 'Audio Legend',   desc: 'Make 100 recordings',    icon: '🎵', rarity:'legendary',xp:500, check: s=>s.recordingsCount>=100 },
  { id: 'play-1min',category:'Recordings',title: 'Short Listen',   desc: 'Play back 1 min total',  icon: '▶️', rarity:'common',  xp:10,  check: s=>s.totalPlaybackTime>=60 },
  { id: 'play-10min',category:'Recordings',title:'Extended Play',  desc: 'Play back 10 min total', icon: '⏯️', rarity:'rare',   xp:30,  check: s=>s.totalPlaybackTime>=600 },
  { id: 'play-1hr',category:'Recordings', title: 'Hour of Sound',  desc: 'Play back 1 hour total', icon: '🎧', rarity:'epic',    xp:100, check: s=>s.totalPlaybackTime>=3600 },

  // ── Achievements Meta ─────────────────────────────────────────────────────
  { id: 'ach-5',    category:'Meta', title: 'Collector',           desc: 'Unlock 5 achievements',   icon: '🏅', rarity:'common',  xp:10,  check: s=>s.unlockedCount>=5 },
  { id: 'ach-10',   category:'Meta', title: 'Achievement Hunter',  desc: 'Unlock 10 achievements',  icon: '🏆', rarity:'rare',    xp:40,  check: s=>s.unlockedCount>=10 },
  { id: 'ach-15',   category:'Meta', title: 'Trophy Collector',    desc: 'Unlock 15 achievements',  icon: '🎖️', rarity:'rare',   xp:60,  check: s=>s.unlockedCount>=15 },
  { id: 'ach-25',   category:'Meta', title: 'Completionist',       desc: 'Unlock 25 achievements',  icon: '🌟', rarity:'epic',    xp:100, check: s=>s.unlockedCount>=25 },
  { id: 'ach-40',   category:'Meta', title: 'Trophy Hunter',       desc: 'Unlock 40 achievements',  icon: '🥇', rarity:'epic',    xp:175, check: s=>s.unlockedCount>=40 },
  { id: 'ach-50',   category:'Meta', title: 'Achievement God',     desc: 'Unlock 50 achievements',  icon: '🔱', rarity:'epic',    xp:250, check: s=>s.unlockedCount>=50 },
  { id: 'ach-75',   category:'Meta', title: 'Achievement Master',  desc: 'Unlock 75 achievements',  icon: '👑', rarity:'legendary',xp:400, check: s=>s.unlockedCount>=75 },
  { id: 'ach-100',  category:'Meta', title: 'Legend Complete',     desc: 'Unlock 100 achievements', icon: '🌌', rarity:'legendary',xp:650, check: s=>s.unlockedCount>=100 },
  { id: 'ach-150',  category:'Meta', title: 'Transcendent',        desc: 'Unlock 150 achievements', icon: '✨', rarity:'legendary',xp:900, check: s=>s.unlockedCount>=150 },
  { id: 'ach-all',  category:'Meta', title: 'The Legend',          desc: 'Unlock all achievements', icon: '👑', rarity:'legendary',xp:2000, check: s=>s.unlockedCount>=200 },

  // ── Endurance ─────────────────────────────────────────────────────────────
  { id: 'correct-25',  category:'Endurance', title: 'Twenty Five',  desc: 'Type 25 correct chars',   icon: '✅', rarity:'common',  xp:5,   check: s=>s.correctCharsInSession>=25 },
  { id: 'correct-50',  category:'Endurance', title: 'Fifty Straight',desc:'Type 50 correct chars',   icon: '✅', rarity:'common',  xp:10,  check: s=>s.correctCharsInSession>=50 },
  { id: 'correct-100', category:'Endurance', title: 'Century Run',  desc: 'Type 100 correct chars',  icon: '💯', rarity:'common',  xp:20,  check: s=>s.correctCharsInSession>=100 },
  { id: 'correct-250', category:'Endurance', title: 'Quarter K',    desc: 'Type 250 correct chars',  icon: '🔥', rarity:'rare',    xp:40,  check: s=>s.correctCharsInSession>=250 },
  { id: 'correct-500', category:'Endurance', title: 'Half K Champ', desc: 'Type 500 correct chars',  icon: '⚡', rarity:'rare',    xp:70,  check: s=>s.correctCharsInSession>=500 },
  { id: 'correct-1k',  category:'Endurance', title: 'Thousand Keys',desc: 'Type 1000 correct chars', icon: '💎', rarity:'epic',    xp:120, check: s=>s.correctCharsInSession>=1000 },
  { id: 'correct-2k',  category:'Endurance', title: 'Two Thousand', desc: 'Type 2000 correct chars', icon: '👑', rarity:'legendary',xp:250, check: s=>s.correctCharsInSession>=2000 },

  // ── Combo / Special ────────────────────────────────────────────────────────
  { id: 'fast-precise',  category:'Combo', title: 'Fast & Precise',  desc: '60+ WPM, 98%+ accuracy', icon: '🎖️', rarity:'epic',    xp:150, check: s=>s.wpm>=60 && s.accuracy>=98 },
  { id: 'speed-acc',     category:'Combo', title: 'Speed + Precision',desc:'80+ WPM, 95%+ accuracy', icon: '🎯', rarity:'epic',    xp:200, check: s=>s.wpm>=80 && s.accuracy>=95 },
  { id: 'god-combo',     category:'Combo', title: 'God Combo',       desc: '120+ WPM, 98%+ accuracy',icon: '⚡👑',rarity:'legendary',xp:500, check: s=>s.wpm>=120 && s.accuracy>=98 },
  { id: 'perfect-speed', category:'Combo', title: 'Perfect Speed',   desc: '100% accuracy, 60+ WPM', icon: '🌟', rarity:'legendary',xp:400, check: s=>s.accuracy>=100 && s.wpm>=60 },
  { id: 'perfect-century',category:'Combo',title: 'Perfect Century', desc: '100+ WPM, 100% accuracy',icon: '🏆', rarity:'legendary',xp:600, check: s=>s.wpm>=100 && s.accuracy>=100 },
  { id: 'music-type',    category:'Combo', title: 'Music Typist',    desc: '1000 notes + 50 WPM',    icon: '🎵', rarity:'epic',    xp:150, check: s=>s.notesPlayed>=1000 && s.bestWpm>=50 },
  { id: 'marathon',      category:'Combo', title: 'Marathon Typist', desc: '500+ correct chars',      icon: '🏃', rarity:'epic',    xp:100, check: s=>s.correctCharsInSession>=2500 },
  { id: 'explorer-speed',category:'Combo', title: 'Speedy Explorer', desc: '10+ modes + 60 WPM',      icon: '🗺️', rarity:'epic',   xp:180, check: s=>s.modesUsed.length>=10 && s.bestWpm>=60 },

  // ── Timed Mode ────────────────────────────────────────────────────────────
  { id: 'timed-first',category:'Timed', title: 'First Timed',       desc: 'Complete a timed test',   icon: '⏱️', rarity:'common',  xp:15,  check: s=>s.timedBestWpm>0 },
  { id: 'timed-30',  category:'Timed', title: 'Timed Beginner',     desc: '30 WPM in timed mode',    icon: '⏱️', rarity:'common',  xp:25,  check: s=>s.timedBestWpm>=30 },
  { id: 'timed-50',  category:'Timed', title: 'Timed Intermediate', desc: '50 WPM in timed mode',    icon: '⏱️', rarity:'rare',    xp:50,  check: s=>s.timedBestWpm>=50 },
  { id: 'timed-60',  category:'Timed', title: 'Speed Demon',        desc: '60 WPM in timed mode',    icon: '⏰', rarity:'rare',    xp:70,  check: s=>s.timedBestWpm>=60 },
  { id: 'timed-75',  category:'Timed', title: 'Timed Expert',       desc: '75 WPM in timed mode',    icon: '⏱️', rarity:'epic',    xp:100, check: s=>s.timedBestWpm>=75 },
  { id: 'timed-80',  category:'Timed', title: 'Time Trial Pro',     desc: '80 WPM in timed mode',    icon: '⏰', rarity:'epic',    xp:120, check: s=>s.timedBestWpm>=80 },
  { id: 'timed-100', category:'Timed', title: 'Lightning Typist',   desc: '100 WPM in timed mode',   icon: '⚡⏱️',rarity:'epic',  xp:160, check: s=>s.timedBestWpm>=100 },
  { id: 'timed-120', category:'Timed', title: 'Time Shredder',      desc: '120 WPM in timed mode',   icon: '🔥⏱️',rarity:'legendary',xp:250, check: s=>s.timedBestWpm>=120 },
  { id: 'timed-150', category:'Timed', title: 'Timed Legend',       desc: '150 WPM in timed mode',   icon: '👑⏱️',rarity:'legendary',xp:400, check: s=>s.timedBestWpm>=150 },

  // ── Special / Time of Day ─────────────────────────────────────────────────
  { id: 'night-owl',   category:'Special', title: 'Night Owl',      desc: 'Type after 11pm',         icon: '🦉', rarity:'rare',    xp:30,  check: _s=>new Date().getHours()>=23||new Date().getHours()<3 },
  { id: 'early-bird',  category:'Special', title: 'Early Bird',     desc: 'Type before 6am',         icon: '🌅', rarity:'rare',    xp:30,  check: _s=>new Date().getHours()<6 },
  { id: 'weekend',     category:'Special', title: 'Weekend Warrior',desc: 'Type on a weekend',       icon: '🏖️', rarity:'common',  xp:15,  check: _s=>[0,6].includes(new Date().getDay()) },
  { id: 'friday',      category:'Special', title: 'TGIF',           desc: 'Type on a Friday',        icon: '🎉', rarity:'common',  xp:10,  check: _s=>new Date().getDay()===5 },
  { id: 'monday',      category:'Special', title: 'Monday Power',   desc: 'Type on a Monday',        icon: '💪', rarity:'common',  xp:10,  check: _s=>new Date().getDay()===1 },
  { id: 'perfect-session',category:'Special',title:'Perfect Run',   desc: 'Perfect accuracy session',icon: '⭐', rarity:'epic',    xp:75,  check: s=>s.bestAccuracy>=100 },
];

export const RARITY_COLORS = {
  common:    { bg: 'bg-slate-500/20',   border: 'border-slate-400/40',   text: 'text-slate-300',   glow: '' },
  rare:      { bg: 'bg-blue-500/20',    border: 'border-blue-400/40',    text: 'text-blue-300',    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]' },
  epic:      { bg: 'bg-violet-500/20',  border: 'border-violet-400/40',  text: 'text-violet-300',  glow: 'shadow-[0_0_14px_rgba(139,92,246,0.35)]' },
  legendary: { bg: 'bg-amber-500/20',   border: 'border-amber-400/40',   text: 'text-amber-300',   glow: 'shadow-[0_0_18px_rgba(245,158,11,0.4)]' },
};

export const XP_LEVELS = [
  { level: 1,  minXp: 0,     title: 'Novice' },
  { level: 2,  minXp: 50,    title: 'Beginner' },
  { level: 3,  minXp: 120,   title: 'Apprentice' },
  { level: 4,  minXp: 220,   title: 'Learner' },
  { level: 5,  minXp: 350,   title: 'Practitioner' },
  { level: 6,  minXp: 520,   title: 'Skilled' },
  { level: 7,  minXp: 730,   title: 'Proficient' },
  { level: 8,  minXp: 980,   title: 'Advanced' },
  { level: 9,  minXp: 1280,  title: 'Expert' },
  { level: 10, minXp: 1630,  title: 'Veteran' },
  { level: 11, minXp: 2030,  title: 'Elite' },
  { level: 12, minXp: 2480,  title: 'Master' },
  { level: 13, minXp: 2980,  title: 'Grandmaster' },
  { level: 14, minXp: 3530,  title: 'Champion' },
  { level: 15, minXp: 4180,  title: 'Legend' },
  { level: 16, minXp: 4980,  title: 'Mythical' },
  { level: 17, minXp: 5980,  title: 'Immortal' },
  { level: 18, minXp: 7230,  title: 'Transcendent' },
  { level: 19, minXp: 8730,  title: 'Divine' },
  { level: 20, minXp: 10480, title: 'Aurora God' },
  { level: 21, minXp: 13000, title: 'Celestial' },
  { level: 22, minXp: 16000, title: 'Cosmic' },
  { level: 23, minXp: 20000, title: 'Universal' },
  { level: 24, minXp: 25000, title: 'Infinite' },
  { level: 25, minXp: 32000, title: 'Eternal' },
];

export function getLevelInfo(xp: number) {
  let current = XP_LEVELS[0];
  let next = XP_LEVELS[1];
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXp) {
      current = XP_LEVELS[i];
      next = XP_LEVELS[i + 1] || XP_LEVELS[XP_LEVELS.length - 1];
      break;
    }
  }
  const progress = next === current ? 100 : Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100);
  return { current, next, progress };
}
