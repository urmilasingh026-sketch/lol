import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TYPING_WORDS } from '@/lib/wordList';
import { getContentForMode } from '@/lib/content';
import { ACHIEVEMENTS, type AchievementStats, getLevelInfo } from '@/lib/achievements';
import { RGB_MODES_EXTRA } from '@/data/rgb-modes-extra';
import { BACKGROUNDS_EXTRA } from '@/data/backgrounds-extra';
import { THEMES_EXTRA } from '@/data/themes-extra';
import { TYPING_MODES_EXTRA } from '@/data/typing-modes-extra';

export const RAINBOW_COLORS = ['#ff5b55', '#ff9f1c', '#ffd447', '#38e29d', '#33a1ff', '#5f6bff', '#b45cff'];

export type TypingMode = 'free' | 'lesson' | 'word' | 'sentence' | 'paragraph' | 'numbers' | 'custom' | 'timed'
  | 'quotes' | 'code' | 'poetry' | 'tongue-twisters' | 'movies' | 'programming' | 'science' | 'fun-facts'
  | 'history' | 'geography' | 'space' | 'mythology' | 'zen' | 'sprint' | 'nature' | 'sports' | 'food' | 'music'
  | 'anime' | 'philosophy' | 'proverbs' | 'literature' | 'comedy' | 'books' | 'speeches'
  | 'animal-facts' | 'ocean' | 'chemistry' | 'math-facts' | 'astronomy' | 'psychology'
  | 'biology' | 'physics' | 'earth-science' | 'tech-history' | 'internet' | 'gaming'
  | 'coding-python' | 'coding-javascript' | 'coding-html' | 'coding-sql' | 'coding-bash' | 'tech-terms'
  | 'countries' | 'travel' | 'languages' | 'economics' | 'business' | 'medical' | 'legal'
  | 'architecture' | 'art-history' | 'climate' | 'environment' | 'fitness' | 'yoga' | 'cooking'
  | 'gardening' | 'fashion' | 'photography' | 'film-terms' | 'music-genres' | 'dance'
  | 'mythology-norse' | 'mythology-egypt' | 'mythology-roman' | 'inventors' | 'idioms'
  | 'vocabulary' | 'grammar' | 'creative-writing' | 'riddles' | 'long-words' | 'motivational'
  | 'mindfulness' | 'self-help' | 'mythology-celtic' | 'history-modern' | 'scientists' | 'artists'
  | 'musicians-famous' | 'explorers' | 'color-names' | 'alphabet' | 'technology' | 'world-records'
  | 'geography-facts' | 'science-extra' | 'mythology-extra' | 'quotes-extra' | 'inspiration' | 'adventure'
  | 'spring' | 'summer' | 'autumn' | 'winter' | 'halloween' | 'christmas' | 'valentines' | 'new-year'
  | 'diwali' | 'thanksgiving'
  // ── NEW Modes (50+) ────────────────────────────────────────────────────────
  | 'haiku' | 'limerick' | 'sonnet' | 'epic-poem' | 'acrostic'
  | 'coding-typescript' | 'coding-css' | 'coding-rust' | 'coding-go' | 'coding-java' | 'coding-cpp'
  | 'coding-ruby' | 'coding-swift' | 'coding-kotlin' | 'coding-php' | 'regex' | 'json' | 'yaml'
  | 'latin' | 'french-words' | 'spanish-words' | 'german-words' | 'italian-words' | 'portuguese'
  | 'pangrams' | 'alliteration' | 'palindromes' | 'homophones' | 'anagrams' | 'compound-words'
  | 'capitals' | 'state-capitals' | 'country-capitals' | 'element-symbols' | 'periodic-table'
  | 'planets' | 'constellations' | 'star-names' | 'moon-phases' | 'space-missions'
  | 'presidents' | 'prime-ministers' | 'world-leaders' | 'famous-speeches-v2'
  | 'shakespeare' | 'dickens' | 'hemingway' | 'tolkien' | 'orwell' | 'austen'
  | 'rap-lyrics' | 'song-lyrics' | 'nursery-rhymes' | 'fairy-tales' | 'fables'
  | 'chess-moves' | 'card-games' | 'board-games' | 'video-game-facts' | 'esports'
  | 'car-brands' | 'aircraft-types' | 'ship-names' | 'train-stations' | 'airports'
  | 'famous-quotes-2' | 'stoicism' | 'buddhism' | 'hinduism' | 'taoism'
  | 'nutrition-facts' | 'vitamins' | 'exercises' | 'sports-records' | 'olympic-facts'
  | 'math-formulas' | 'physics-laws' | 'chemistry-reactions' | 'biology-terms' | 'medical-terms-v2'
  | 'legal-terms-v2' | 'financial-terms' | 'marketing-terms' | 'design-terms' | 'psychology-terms'
  | 'word-origins' | 'etymology' | 'prefixes' | 'suffixes' | 'abbreviations'
  | 'texting-slang' | 'internet-acronyms' | 'emoji-names' | 'social-media'
  | 'positive-words' | 'power-words' | 'descriptive-words' | 'action-verbs' | 'adjectives';

export type AppTheme =
  | 'aurora' | 'midnight' | 'neon' | 'ocean' | 'forest' | 'sunset' | 'rose' | 'matrix' | 'minimal'
  | 'cyberpunk' | 'blood' | 'arctic' | 'golden' | 'space' | 'coral'
  | 'sakura' | 'bamboo' | 'volcano' | 'desert' | 'lavender' | 'peach' | 'dusk' | 'dawn'
  | 'synthwave' | 'vaporwave' | 'retrowave' | 'glitch' | 'arcade' | 'terminal' | 'crt'
  | 'nebula' | 'pulsar' | 'quasar' | 'stardust' | 'supernova' | 'comet' | 'mars'
  | 'lofi' | 'coffee' | 'jazz' | 'electric' | 'fog' | 'ember' | 'frost'
  | 'obsidian' | 'mercury' | 'slate' | 'copper' | 'jade' | 'ruby' | 'sapphire'
  | 'amethyst' | 'emerald' | 'topaz' | 'platinum'
  | 'winter' | 'spring' | 'summer' | 'autumn' | 'halloween' | 'christmas'
  | 'bubblegum' | 'cotton-candy' | 'mint' | 'teal' | 'indigo'
  | 'tokyo' | 'rio' | 'sahara' | 'nordic' | 'void' | 'abyss' | 'coal'
  | 'lime' | 'hot-pink' | 'ultraviolet' | 'electric-orange' | 'sky' | 'pastel'
  | 'magenta' | 'crimson' | 'olive' | 'turquoise' | 'sienna' | 'violet' | 'cobalt'
  | 'brown' | 'sand' | 'pine' | 'plum' | 'tangerine' | 'maroon'
  | 'shadow' | 'steel' | 'gunmetal' | 'peony' | 'glacier' | 'wildfire' | 'opal'
  | 'monsoon' | 'sepia' | 'neon-green' | 'blood-orange' | 'lagoon' | 'charcoal'
  | 'galactic' | 'prismatic' | 'ethereal' | 'phantom' | 'solaris' | 'abyssal' | 'zenith'
  | 'blade-runner' | 'ghost-shell' | 'hackers' | 'cyberpunk-2077' | 'neon-tokyo' | 'neo-noir'
  | 'rainforest' | 'arctic-tundra' | 'volcanic-island' | 'deep-sea' | 'mountain-peak' | 'canyon'
  | 'meadow' | 'swamp' | 'tundra' | 'savanna' | 'taiga' | 'kelp-forest'
  | 'typhoon' | 'tornado' | 'earthquake' | 'avalanche' | 'tsunami' | 'hurricane'
  | 'black-hole' | 'neutron-star' | 'wormhole' | 'galaxy-core' | 'asteroid' | 'solar-system'
  | 'dark-matter' | 'cosmic-ray' | 'event-horizon' | 'magnetar' | 'quasar-v2' | 'hypernova'
  | 'chocolate' | 'strawberry' | 'blueberry' | 'caramel' | 'vanilla' | 'pistachio' | 'matcha'
  | 'grape' | 'watermelon' | 'lemon' | 'lime-v2' | 'orange-v2' | 'mango' | 'papaya'
  | 'diamond' | 'onyx' | 'garnet' | 'alexandrite' | 'obsidian-v2' | 'quartz' | 'tourmaline'
  | 'pyrite' | 'azurite' | 'carnelian' | 'tanzanite' | 'moonstone' | 'sunstone' | 'iolite'
  | 'paris' | 'london' | 'dubai' | 'singapore' | 'las-vegas' | 'tokyo-v2' | 'new-york'
  | 'berlin' | 'sydney' | 'moscow' | 'shanghai' | 'seoul' | 'mumbai' | 'cairo'
  | 'impressionist' | 'abstract' | 'pixel-art' | 'watercolor' | 'oil-painting' | 'sketch'
  | 'pastel-art' | 'pop-art' | 'surrealist' | 'minimalist' | 'bauhaus' | 'art-nouveau'
  | 'jazz-club' | 'vinyl-record' | 'concert-hall' | 'festival' | 'lofi-cafe' | 'rave'
  | 'acoustic-set' | 'opera-house' | 'underground' | 'stadium' | 'rooftop' | 'dive-bar'
  | 'melancholy' | 'euphoric' | 'serene' | 'energetic' | 'mysterious' | 'romantic'
  | 'nostalgic' | 'futuristic-v2' | 'dreamy' | 'intense' | 'playful' | 'elegant'
  | 'fire-ice' | 'yin-yang' | 'day-night' | 'earth-space' | 'life-death' | 'chaos-order'
  | 'steampunk' | 'biopunk' | 'dieselpunk' | 'solarpunk' | 'atompunk' | 'nanopunk'
  | 'deep-purple' | 'electric-teal' | 'neon-orange' | 'acid-green' | 'electric-red'
  | 'rose-gold' | 'platinum-v2' | 'titanium' | 'carbon-fiber' | 'brushed-metal'
  | 'bubblegum-v2' | 'cotton-candy-v2' | 'sherbet' | 'sorbet' | 'gelato'
  | 'holographic' | 'iridescent' | 'chrome' | 'mirror' | 'prism-v2'
  | 'neon-pink' | 'neon-blue' | 'neon-yellow' | 'neon-purple' | 'neon-red'
  | 'midnight-v2' | 'twilight-v2' | 'golden-hour-v2' | 'sunrise-v2' | 'blue-hour'
  | 'winter-v2' | 'spring-v2' | 'summer-v2' | 'autumn-v2' | 'monsoon-v2'
  | 'sakura-v2' | 'maple' | 'pine-forest' | 'bamboo-grove' | 'lotus'
  | 'samurai' | 'ninja' | 'shogun' | 'katana' | 'origami'
  | 'dracula' | 'vampire' | 'werewolf' | 'ghost-theme' | 'witch' | 'zombie'
  | 'mermaid' | 'unicorn' | 'dragon' | 'phoenix' | 'griffin' | 'kraken'
  | 'minecraft' | 'nether' | 'end-realm' | 'overworld' | 'twilight-forest'
  | 'space-age' | 'retro-future' | 'art-deco' | 'gothic' | 'baroque-v2';

export const APP_THEMES = [
  { id: 'aurora',         label: 'Aurora',         desc: 'Deep purple & violet',       color: '#8b5cf6', bg: '#09090f' },
  { id: 'midnight',       label: 'Midnight',        desc: 'Deep blue & indigo',         color: '#3b82f6', bg: '#080818' },
  { id: 'neon',           label: 'Neon',            desc: 'Cyberpunk electric cyan',    color: '#00ffcc', bg: '#050510' },
  { id: 'ocean',          label: 'Ocean',           desc: 'Teal & aqua waves',          color: '#06b6d4', bg: '#060e14' },
  { id: 'forest',         label: 'Forest',          desc: 'Deep green & emerald',       color: '#10b981', bg: '#060f08' },
  { id: 'sunset',         label: 'Sunset',          desc: 'Orange & pink warmth',       color: '#f97316', bg: '#0f0608' },
  { id: 'rose',           label: 'Rose',            desc: 'Pink & crimson glow',        color: '#f43f5e', bg: '#0f0608' },
  { id: 'matrix',         label: 'Matrix',          desc: 'Classic green on black',     color: '#22c55e', bg: '#010301' },
  { id: 'minimal',        label: 'Minimal',         desc: 'Clean grey & white',         color: '#94a3b8', bg: '#0a0a0f' },
  { id: 'cyberpunk',      label: 'Cyberpunk',       desc: 'Hot pink & electric cyan',   color: '#ff0080', bg: '#030310' },
  { id: 'blood',          label: 'Blood Moon',      desc: 'Crimson & deep red',         color: '#dc2626', bg: '#0d0004' },
  { id: 'arctic',         label: 'Arctic',          desc: 'Ice blue & crystal white',   color: '#7dd3fc', bg: '#04080f' },
  { id: 'golden',         label: 'Golden',          desc: 'Gold & warm amber',          color: '#f59e0b', bg: '#0c0800' },
  { id: 'space',          label: 'Deep Space',      desc: 'Cosmic purple & starlight',  color: '#a78bfa', bg: '#000008' },
  { id: 'coral',          label: 'Coral Reef',      desc: 'Warm coral & peach',         color: '#fb923c', bg: '#0d0805' },
  { id: 'sakura',         label: 'Sakura',          desc: 'Cherry blossom pink',        color: '#f9a8d4', bg: '#0f060a' },
  { id: 'bamboo',         label: 'Bamboo',          desc: 'Fresh bamboo green',         color: '#84cc16', bg: '#060f02' },
  { id: 'volcano',        label: 'Volcano',         desc: 'Molten lava fire',           color: '#ea580c', bg: '#110300' },
  { id: 'desert',         label: 'Desert',          desc: 'Sandy gold dunes',           color: '#d97706', bg: '#0f0b04' },
  { id: 'lavender',       label: 'Lavender',        desc: 'Soft purple mist',           color: '#c084fc', bg: '#0a060f' },
  { id: 'peach',          label: 'Peach',           desc: 'Warm peach glow',            color: '#fdba74', bg: '#0f0906' },
  { id: 'dusk',           label: 'Dusk',            desc: 'Purple twilight sky',        color: '#818cf8', bg: '#080612' },
  { id: 'dawn',           label: 'Dawn',            desc: 'Golden morning light',       color: '#fbbf24', bg: '#0e0b04' },
  { id: 'synthwave',      label: 'Synthwave',       desc: '80s magenta grid',           color: '#e879f9', bg: '#0a0014' },
  { id: 'vaporwave',      label: 'Vaporwave',       desc: 'Pastel aesthetic dream',     color: '#f0abfc', bg: '#080612' },
  { id: 'retrowave',      label: 'Retrowave',       desc: 'Hot neon 80s vibes',         color: '#ff6ec7', bg: '#080010' },
  { id: 'glitch',         label: 'Glitch',          desc: 'Digital corruption green',   color: '#4ade80', bg: '#020a04' },
  { id: 'arcade',         label: 'Arcade',          desc: 'Classic game yellow',        color: '#facc15', bg: '#0a0800' },
  { id: 'terminal',       label: 'Terminal',        desc: 'Amber phosphor glow',        color: '#fb923c', bg: '#0a0500' },
  { id: 'crt',            label: 'CRT',             desc: 'Retro phosphor green',       color: '#86efac', bg: '#010a01' },
  { id: 'nebula',         label: 'Nebula',          desc: 'Cosmic blue dust cloud',     color: '#60a5fa', bg: '#040214' },
  { id: 'pulsar',         label: 'Pulsar',          desc: 'Electric star pulse',        color: '#38bdf8', bg: '#020e18' },
  { id: 'quasar',         label: 'Quasar',          desc: 'Blue-violet energy burst',   color: '#818cf8', bg: '#04020e' },
  { id: 'stardust',       label: 'Stardust',        desc: 'Silver cosmic shimmer',      color: '#cbd5e1', bg: '#050508' },
  { id: 'supernova',      label: 'Supernova',       desc: 'Stellar explosion gold',     color: '#fde68a', bg: '#100a00' },
  { id: 'comet',          label: 'Comet',           desc: 'Icy blue trail',             color: '#bae6fd', bg: '#020810' },
  { id: 'mars',           label: 'Mars',            desc: 'Rust & iron red planet',     color: '#f87171', bg: '#120200' },
  { id: 'lofi',           label: 'Lo-fi',           desc: 'Dusty warm lo-fi tones',     color: '#c4b5fd', bg: '#070512' },
  { id: 'coffee',         label: 'Coffee',          desc: 'Warm espresso brown',        color: '#a16207', bg: '#0e0800' },
  { id: 'jazz',           label: 'Midnight Jazz',   desc: 'Smoky gold noir vibes',      color: '#fcd34d', bg: '#060504' },
  { id: 'electric',       label: 'Electric Dreams', desc: 'Vivid electric cyan',        color: '#22d3ee', bg: '#020c10' },
  { id: 'fog',            label: 'Fog',             desc: 'Misty grey-blue haze',       color: '#94a3b8', bg: '#060810' },
  { id: 'ember',          label: 'Ember',           desc: 'Glowing fire coal',          color: '#f97316', bg: '#100500' },
  { id: 'frost',          label: 'Frost',           desc: 'Crystal ice clear',          color: '#bae6fd', bg: '#020a10' },
  { id: 'obsidian',       label: 'Obsidian',        desc: 'Dark volcanic glass',        color: '#6b7280', bg: '#040407' },
  { id: 'mercury',        label: 'Mercury',         desc: 'Liquid silver metallic',     color: '#d1d5db', bg: '#080808' },
  { id: 'slate',          label: 'Slate',           desc: 'Cool blue-grey stone',       color: '#64748b', bg: '#06080c' },
  { id: 'copper',         label: 'Copper',          desc: 'Warm metallic copper',       color: '#b45309', bg: '#0c0600' },
  { id: 'jade',           label: 'Jade',            desc: 'Deep stone green gem',       color: '#059669', bg: '#020e08' },
  { id: 'ruby',           label: 'Ruby',            desc: 'Rich gemstone red',          color: '#be123c', bg: '#0d0004' },
  { id: 'sapphire',       label: 'Sapphire',        desc: 'Deep ocean blue gem',        color: '#1d4ed8', bg: '#020610' },
  { id: 'amethyst',       label: 'Amethyst',        desc: 'Crystal violet gemstone',    color: '#9333ea', bg: '#070212' },
  { id: 'emerald',        label: 'Emerald',         desc: 'Brilliant green gem',        color: '#10b981', bg: '#021008' },
  { id: 'topaz',          label: 'Topaz',           desc: 'Warm honey yellow gem',      color: '#f59e0b', bg: '#0e0900' },
  { id: 'platinum',       label: 'Platinum',        desc: 'Cool premium silver',        color: '#e2e8f0', bg: '#060608' },
  { id: 'winter',         label: 'Winter',          desc: 'Icy crystalline cold',       color: '#93c5fd', bg: '#04080f' },
  { id: 'spring',         label: 'Spring',          desc: 'Fresh floral bloom',         color: '#86efac', bg: '#040f06' },
  { id: 'summer',         label: 'Summer',          desc: 'Bright sunlit warmth',       color: '#fbbf24', bg: '#0c0900' },
  { id: 'autumn',         label: 'Autumn',          desc: 'Warm harvest orange',        color: '#f97316', bg: '#100600' },
  { id: 'halloween',      label: 'Halloween',       desc: 'Orange pumpkin spook',       color: '#f97316', bg: '#0a0400' },
  { id: 'christmas',      label: 'Christmas',       desc: 'Festive red & green',        color: '#22c55e', bg: '#060e04' },
  { id: 'bubblegum',      label: 'Bubblegum',       desc: 'Sweet candy pink',           color: '#f472b6', bg: '#0f0408' },
  { id: 'cotton-candy',   label: 'Cotton Candy',    desc: 'Pastel pink & blue',         color: '#e879f9', bg: '#080410' },
  { id: 'mint',           label: 'Mint',            desc: 'Fresh cool mint green',      color: '#6ee7b7', bg: '#030f08' },
  { id: 'teal',           label: 'Teal Dream',      desc: 'Deep teal serenity',         color: '#14b8a6', bg: '#020e0c' },
  { id: 'indigo',         label: 'Indigo',          desc: 'Deep violet-blue dye',       color: '#6366f1', bg: '#04040e' },
  { id: 'tokyo',          label: 'Tokyo Nights',    desc: 'Neon city after dark',       color: '#f0abfc', bg: '#06020c' },
  { id: 'rio',            label: 'Rio',             desc: 'Carnival vivid energy',      color: '#f59e0b', bg: '#0e0800' },
  { id: 'sahara',         label: 'Sahara',          desc: 'Sun-baked desert sand',      color: '#d97706', bg: '#100a00' },
  { id: 'nordic',         label: 'Nordic',          desc: 'Fjord blue-grey serenity',   color: '#60a5fa', bg: '#040810' },
  { id: 'void',           label: 'Void',            desc: 'Pure dark matter purple',    color: '#6d28d9', bg: '#020004' },
  { id: 'abyss',          label: 'Abyss',           desc: 'Ocean trench deep blue',     color: '#1e40af', bg: '#010408' },
  { id: 'coal',           label: 'Coal',            desc: 'Charcoal black depths',      color: '#374151', bg: '#020202' },
  { id: 'lime',           label: 'Lime',            desc: 'Electric neon lime',         color: '#a3e635', bg: '#050a00' },
  { id: 'hot-pink',       label: 'Hot Pink',        desc: 'Vivid hot pink energy',      color: '#ec4899', bg: '#0f020c' },
  { id: 'ultraviolet',    label: 'Ultraviolet',     desc: 'Deep UV purple wave',        color: '#7c3aed', bg: '#040010' },
  { id: 'electric-orange',label: 'Electric Orange', desc: 'Vivid high-voltage orange',  color: '#ea580c', bg: '#100400' },
  { id: 'sky',            label: 'Sky',             desc: 'Bright open sky blue',       color: '#38bdf8', bg: '#021014' },
  { id: 'pastel',         label: 'Pastel',          desc: 'Soft dreamy tones',          color: '#f9a8d4', bg: '#0d060a' },
  { id: 'magenta',        label: 'Magenta',         desc: 'Pure vivid magenta',         color: '#d946ef', bg: '#0a0210' },
  { id: 'crimson',        label: 'Crimson',         desc: 'Deep rich crimson',          color: '#dc2626', bg: '#0e0003' },
  { id: 'olive',          label: 'Olive',           desc: 'Dark earthy olive green',    color: '#65a30d', bg: '#060800' },
  { id: 'turquoise',      label: 'Turquoise',       desc: 'Bright aqua turquoise',      color: '#2dd4bf', bg: '#021010' },
  { id: 'sienna',         label: 'Sienna',          desc: 'Earthy terracotta brown',    color: '#b45309', bg: '#0d0600' },
  { id: 'violet',         label: 'Violet',          desc: 'Pure vibrant violet',        color: '#7c3aed', bg: '#060012' },
  { id: 'cobalt',         label: 'Cobalt',          desc: 'Rich cobalt blue mineral',   color: '#1d4ed8', bg: '#020810' },
  { id: 'brown',          label: 'Brown',           desc: 'Warm dark chocolate brown',  color: '#92400e', bg: '#0a0500' },
  { id: 'sand',           label: 'Sand',            desc: 'Beach sand warmth',          color: '#d97706', bg: '#0e0b04' },
  { id: 'pine',           label: 'Pine',            desc: 'Dark pine forest depth',     color: '#16a34a', bg: '#02100a' },
  { id: 'plum',           label: 'Plum',            desc: 'Dark sweet plum purple',     color: '#7e22ce', bg: '#060212' },
  { id: 'tangerine',      label: 'Tangerine',       desc: 'Bright zesty citrus',        color: '#ea580c', bg: '#100600' },
  { id: 'maroon',         label: 'Maroon',          desc: 'Deep dark maroon red',       color: '#9f1239', bg: '#0c0006' },
  { id: 'shadow',         label: 'Shadow',          desc: 'Soft penumbra dark grey',    color: '#475569', bg: '#050507' },
  { id: 'steel',          label: 'Steel',           desc: 'Cool industrial steel',      color: '#64748b', bg: '#060608' },
  { id: 'gunmetal',       label: 'Gunmetal',        desc: 'Dark industrial grey alloy', color: '#374151', bg: '#040406' },
  { id: 'peony',          label: 'Peony',           desc: 'Rich full-bloom flower pink',color: '#f43f5e', bg: '#100408' },
  { id: 'glacier',        label: 'Glacier',         desc: 'Blue-white glacial ice',     color: '#bae6fd', bg: '#030c14' },
  { id: 'wildfire',       label: 'Wildfire',        desc: 'Intense raging red-orange',  color: '#ef4444', bg: '#100200' },
  { id: 'opal',           label: 'Opal',            desc: 'Iridescent soft shimmer',    color: '#818cf8', bg: '#060614' },
  { id: 'monsoon',        label: 'Monsoon',         desc: 'Stormy blue-grey rain',      color: '#60a5fa', bg: '#040812' },
  { id: 'sepia',          label: 'Sepia',           desc: 'Old photograph warmth',      color: '#b45309', bg: '#0e0a00' },
  { id: 'neon-green',     label: 'Neon Green',      desc: 'Blazing neon green glow',    color: '#4ade80', bg: '#030a02' },
  { id: 'blood-orange',   label: 'Blood Orange',    desc: 'Dark citrus red glow',       color: '#ea580c', bg: '#110400' },
  { id: 'lagoon',         label: 'Lagoon',          desc: 'Tropical turquoise lagoon',  color: '#06b6d4', bg: '#021412' },
  { id: 'charcoal',       label: 'Charcoal',        desc: 'Soft dark charcoal matte',   color: '#6b7280', bg: '#060606' },
  // ── Sci-Fi / Cyberpunk ─────────────────────────────────────────────────────
  { id: 'galactic',       label: 'Galactic',        desc: 'Vast galactic purple expanse', color: '#a855f7', bg: '#05020f' },
  { id: 'prismatic',      label: 'Prismatic',       desc: 'Shifting prismatic spectrum',  color: '#f472b6', bg: '#060318' },
  { id: 'ethereal',       label: 'Ethereal',        desc: 'Ghostly soft glow',            color: '#c4b5fd', bg: '#06040e' },
  { id: 'phantom',        label: 'Phantom',         desc: 'Dark phantom deep slate',      color: '#818cf8', bg: '#030308' },
  { id: 'solaris',        label: 'Solaris',         desc: 'Blazing solar orange-white',   color: '#fbbf24', bg: '#100800' },
  { id: 'abyssal',        label: 'Abyssal',         desc: 'Pitch black ocean abyss',      color: '#38bdf8', bg: '#000204' },
  { id: 'zenith',         label: 'Zenith',          desc: 'Peak performance blue-white',  color: '#e0f2fe', bg: '#020810' },
  { id: 'blade-runner',   label: 'Blade Runner',    desc: 'Wet neon city night',          color: '#ff6b35', bg: '#050204' },
  { id: 'ghost-shell',    label: 'Ghost Shell',     desc: 'Cybernetic cyan-teal',         color: '#22d3ee', bg: '#030a0e' },
  { id: 'hackers',        label: 'Hackers',         desc: 'Terminal hacker green',        color: '#4ade80', bg: '#010a03' },
  { id: 'cyberpunk-2077', label: 'Cyberpunk 2077',  desc: 'Night city yellow chrome',     color: '#facc15', bg: '#080300' },
  { id: 'neon-tokyo',     label: 'Neon Tokyo',      desc: 'Japanese neon sign glow',      color: '#f43f5e', bg: '#04010a' },
  { id: 'neo-noir',       label: 'Neo Noir',        desc: 'Dark noir purple-grey',        color: '#a78bfa', bg: '#040306' },
  // ── Nature ────────────────────────────────────────────────────────────────
  { id: 'rainforest',     label: 'Rainforest',      desc: 'Dense tropical green',         color: '#16a34a', bg: '#030a03' },
  { id: 'arctic-tundra',  label: 'Arctic Tundra',   desc: 'Frozen icy white-blue',        color: '#bae6fd', bg: '#030810' },
  { id: 'volcanic-island',label: 'Volcanic Island', desc: 'Tropical volcano orange',      color: '#ea580c', bg: '#0d0200' },
  { id: 'deep-sea',       label: 'Deep Sea',        desc: 'Abyssal ocean blue-black',     color: '#0369a1', bg: '#010408' },
  { id: 'mountain-peak',  label: 'Mountain Peak',   desc: 'Alpine snow white-blue',       color: '#94a3b8', bg: '#060810' },
  { id: 'canyon',         label: 'Canyon',          desc: 'Desert canyon rusty red',      color: '#c2410c', bg: '#0e0500' },
  { id: 'meadow',         label: 'Meadow',          desc: 'Soft spring meadow green',     color: '#86efac', bg: '#040a04' },
  { id: 'swamp',          label: 'Swamp',           desc: 'Murky dark swamp green',       color: '#4d7c0f', bg: '#040700' },
  { id: 'tundra',         label: 'Tundra',          desc: 'Frozen tundra grey-white',     color: '#e2e8f0', bg: '#06080c' },
  { id: 'savanna',        label: 'Savanna',         desc: 'Golden African savanna',       color: '#eab308', bg: '#0b0800' },
  { id: 'taiga',          label: 'Taiga',           desc: 'Boreal forest dark pine',      color: '#15803d', bg: '#030704' },
  { id: 'kelp-forest',    label: 'Kelp Forest',     desc: 'Swaying kelp green-gold',      color: '#65a30d', bg: '#040800' },
  // ── Extreme Weather ───────────────────────────────────────────────────────
  { id: 'typhoon',        label: 'Typhoon',         desc: 'Swirling typhoon grey-blue',   color: '#94a3b8', bg: '#040810' },
  { id: 'tornado',        label: 'Tornado',         desc: 'Twisting tornado grey',        color: '#9ca3af', bg: '#050608' },
  { id: 'earthquake',     label: 'Earthquake',      desc: 'Shaking ground crack orange',  color: '#d97706', bg: '#0c0500' },
  { id: 'avalanche',      label: 'Avalanche',       desc: 'White rushing snow cascade',   color: '#f1f5f9', bg: '#080a10' },
  { id: 'tsunami',        label: 'Tsunami',         desc: 'Dark ocean wall of blue',      color: '#0284c7', bg: '#010610' },
  { id: 'hurricane',      label: 'Hurricane',       desc: 'Spiral hurricane dark-blue',   color: '#60a5fa', bg: '#030614' },
  // ── Space / Cosmic ────────────────────────────────────────────────────────
  { id: 'black-hole',     label: 'Black Hole',      desc: 'Event horizon dark accretion', color: '#f97316', bg: '#000000' },
  { id: 'neutron-star',   label: 'Neutron Star',    desc: 'Pulsating neutron star beam',  color: '#7dd3fc', bg: '#000208' },
  { id: 'wormhole',       label: 'Wormhole',        desc: 'Spinning wormhole tunnel',     color: '#d946ef', bg: '#04000e' },
  { id: 'galaxy-core',    label: 'Galaxy Core',     desc: 'Bright galactic core glow',   color: '#fde68a', bg: '#080400' },
  { id: 'asteroid',       label: 'Asteroid',        desc: 'Dark rocky asteroid grey',     color: '#78716c', bg: '#050504' },
  { id: 'solar-system',   label: 'Solar System',    desc: 'Golden orbital solar yellow',  color: '#fcd34d', bg: '#080600' },
  { id: 'dark-matter',    label: 'Dark Matter',     desc: 'Invisible dark matter violet', color: '#7c3aed', bg: '#020006' },
  { id: 'cosmic-ray',     label: 'Cosmic Ray',      desc: 'High energy purple beam',      color: '#a855f7', bg: '#040008' },
  { id: 'event-horizon',  label: 'Event Horizon',   desc: 'Time dilation gold-black',     color: '#fbbf24', bg: '#030000' },
  { id: 'magnetar',       label: 'Magnetar',        desc: 'Magnetic star teal-white',     color: '#06b6d4', bg: '#020a0e' },
  { id: 'quasar-v2',      label: 'Quasar II',       desc: 'Distant quasar blue burst',    color: '#3b82f6', bg: '#010210' },
  { id: 'hypernova',      label: 'Hypernova',       desc: 'Massive stellar explosion',    color: '#ef4444', bg: '#100000' },
  // ── Food / Flavors ────────────────────────────────────────────────────────
  { id: 'chocolate',      label: 'Chocolate',       desc: 'Rich dark chocolate brown',    color: '#a16207', bg: '#0c0600' },
  { id: 'strawberry',     label: 'Strawberry',      desc: 'Bright red strawberry',        color: '#f43f5e', bg: '#0d0204' },
  { id: 'blueberry',      label: 'Blueberry',       desc: 'Deep blueberry blue-purple',   color: '#6366f1', bg: '#03020e' },
  { id: 'caramel',        label: 'Caramel',         desc: 'Warm sticky caramel gold',     color: '#d97706', bg: '#0c0800' },
  { id: 'vanilla',        label: 'Vanilla',         desc: 'Soft cream vanilla white',     color: '#fef3c7', bg: '#0c0c08' },
  { id: 'pistachio',      label: 'Pistachio',       desc: 'Soft nutty pistachio green',   color: '#a3e635', bg: '#05090a' },
  { id: 'matcha',         label: 'Matcha',          desc: 'Japanese green tea matcha',    color: '#84cc16', bg: '#040800' },
  { id: 'grape',          label: 'Grape',           desc: 'Deep rich grape purple',       color: '#9333ea', bg: '#06010e' },
  { id: 'watermelon',     label: 'Watermelon',      desc: 'Fresh green-red watermelon',   color: '#f43f5e', bg: '#050d05' },
  { id: 'lemon',          label: 'Lemon',           desc: 'Zesty bright lemon yellow',    color: '#eab308', bg: '#0c0a00' },
  { id: 'lime-v2',        label: 'Lime II',         desc: 'Sharp citrus lime green',      color: '#84cc16', bg: '#040a00' },
  { id: 'mango',          label: 'Mango',           desc: 'Tropical orange mango',        color: '#fb923c', bg: '#0c0600' },
  { id: 'papaya',         label: 'Papaya',          desc: 'Warm tropical papaya glow',    color: '#f97316', bg: '#0c0800' },
  // ── Gems & Minerals ───────────────────────────────────────────────────────
  { id: 'diamond',        label: 'Diamond',         desc: 'Pure clear diamond white',     color: '#f8fafc', bg: '#080808' },
  { id: 'onyx',           label: 'Onyx',            desc: 'Pure black onyx stone',        color: '#64748b', bg: '#020202' },
  { id: 'garnet',         label: 'Garnet',          desc: 'Deep red garnet gem',          color: '#be123c', bg: '#0c0003' },
  { id: 'alexandrite',    label: 'Alexandrite',     desc: 'Color-shifting alexandrite',   color: '#7c3aed', bg: '#050108' },
  { id: 'obsidian-v2',    label: 'Obsidian II',     desc: 'Volcanic glass dark shine',    color: '#475569', bg: '#010102' },
  { id: 'quartz',         label: 'Quartz',          desc: 'Clear crystal quartz white',   color: '#e2e8f0', bg: '#080808' },
  { id: 'tourmaline',     label: 'Tourmaline',      desc: 'Pink-green tourmaline split',  color: '#f472b6', bg: '#08030a' },
  { id: 'pyrite',         label: 'Pyrite',          desc: "Fool's gold metallic shine",   color: '#d97706', bg: '#0a0600' },
  { id: 'azurite',        label: 'Azurite',         desc: 'Vivid cobalt blue azurite',    color: '#1d4ed8', bg: '#020510' },
  { id: 'carnelian',      label: 'Carnelian',       desc: 'Warm orange carnelian stone',  color: '#ea580c', bg: '#0d0400' },
  { id: 'tanzanite',      label: 'Tanzanite',       desc: 'Rare blue-violet tanzanite',   color: '#6366f1', bg: '#040312' },
  { id: 'moonstone',      label: 'Moonstone',       desc: 'Soft glowing moonstone',       color: '#c4b5fd', bg: '#060410' },
  { id: 'sunstone',       label: 'Sunstone',        desc: 'Warm glittering sunstone',     color: '#f59e0b', bg: '#0c0800' },
  { id: 'iolite',         label: 'Iolite',          desc: 'Violet-blue iolite gem',       color: '#4f46e5', bg: '#030210' },
  // ── Cities ────────────────────────────────────────────────────────────────
  { id: 'paris',          label: 'Paris',           desc: 'City of lights golden glow',   color: '#fde68a', bg: '#0a0800' },
  { id: 'london',         label: 'London',          desc: 'Foggy grey London streets',    color: '#94a3b8', bg: '#060608' },
  { id: 'dubai',          label: 'Dubai',           desc: 'Desert gold skyscraper glow',  color: '#f59e0b', bg: '#0c0800' },
  { id: 'singapore',      label: 'Singapore',       desc: 'Marina Bay blue-gold',         color: '#0284c7', bg: '#020610' },
  { id: 'las-vegas',      label: 'Las Vegas',       desc: 'Bright neon Vegas strip',      color: '#f43f5e', bg: '#0e0006' },
  { id: 'tokyo-v2',       label: 'Tokyo II',        desc: 'Electric Japanese metropolis', color: '#e879f9', bg: '#08000e' },
  { id: 'new-york',       label: 'New York',        desc: 'Steel and glass skyline blue', color: '#3b82f6', bg: '#030508' },
  { id: 'berlin',         label: 'Berlin',          desc: 'Industrial techno grey',       color: '#6b7280', bg: '#040406' },
  { id: 'sydney',         label: 'Sydney',          desc: 'Harbor bridge ocean teal',     color: '#06b6d4', bg: '#020a10' },
  { id: 'moscow',         label: 'Moscow',          desc: 'Cold snow white-red',          color: '#ef4444', bg: '#0c0202' },
  { id: 'shanghai',       label: 'Shanghai',        desc: 'Bund riverfront gold glow',    color: '#d97706', bg: '#0c0800' },
  { id: 'seoul',          label: 'Seoul',           desc: 'K-pop neon pink city',         color: '#ec4899', bg: '#0a0208' },
  { id: 'mumbai',         label: 'Mumbai',          desc: 'Bollywood orange-gold',        color: '#f97316', bg: '#0d0600' },
  { id: 'cairo',          label: 'Cairo',           desc: 'Ancient Egyptian gold-sand',   color: '#d97706', bg: '#0c0800' },
  // ── Art Styles ────────────────────────────────────────────────────────────
  { id: 'impressionist',  label: 'Impressionist',   desc: 'Soft brushstroke blue-purple', color: '#818cf8', bg: '#050410' },
  { id: 'abstract',       label: 'Abstract',        desc: 'Bold abstract color splash',   color: '#f43f5e', bg: '#04000a' },
  { id: 'pixel-art',      label: 'Pixel Art',       desc: 'Retro 8-bit pixel palette',    color: '#22c55e', bg: '#010301' },
  { id: 'watercolor',     label: 'Watercolor',      desc: 'Soft washed watercolor blue',  color: '#7dd3fc', bg: '#040a10' },
  { id: 'oil-painting',   label: 'Oil Painting',    desc: 'Rich oil paint deep tones',    color: '#b45309', bg: '#0a0600' },
  { id: 'sketch',         label: 'Sketch',          desc: 'Pencil sketch grey minimal',   color: '#94a3b8', bg: '#060606' },
  { id: 'pastel-art',     label: 'Pastel Art',      desc: 'Soft pastel dream colors',     color: '#f9a8d4', bg: '#0a060a' },
  { id: 'pop-art',        label: 'Pop Art',         desc: 'Bold primary pop art colors',  color: '#facc15', bg: '#0a0800' },
  { id: 'surrealist',     label: 'Surrealist',      desc: 'Dreamlike surreal violet',     color: '#d946ef', bg: '#08020e' },
  { id: 'bauhaus',        label: 'Bauhaus',         desc: 'Bold geometric Bauhaus red',   color: '#ef4444', bg: '#0c0000' },
  { id: 'art-nouveau',    label: 'Art Nouveau',     desc: 'Flowing organic golden lines', color: '#d97706', bg: '#0a0800' },
  // ── Music Venues ──────────────────────────────────────────────────────────
  { id: 'jazz-club',      label: 'Jazz Club',       desc: 'Smoky amber jazz club glow',   color: '#d97706', bg: '#0c0600' },
  { id: 'vinyl-record',   label: 'Vinyl Record',    desc: 'Black vinyl warm analog',      color: '#a16207', bg: '#050400' },
  { id: 'concert-hall',   label: 'Concert Hall',    desc: 'Grand hall gold curtain',      color: '#fbbf24', bg: '#0c0a00' },
  { id: 'festival',       label: 'Festival',        desc: 'Colorful outdoor festival',    color: '#f43f5e', bg: '#0a0004' },
  { id: 'lofi-cafe',      label: 'Lo-fi Café',      desc: 'Cozy warm café glow',          color: '#d97706', bg: '#0c0800' },
  { id: 'rave',           label: 'Rave',            desc: 'Underground rave electric',    color: '#a855f7', bg: '#04000e' },
  { id: 'acoustic-set',   label: 'Acoustic Set',    desc: 'Warm unplugged acoustic',      color: '#92400e', bg: '#0c0700' },
  { id: 'opera-house',    label: 'Opera House',     desc: 'Grand opera red & gold',       color: '#dc2626', bg: '#0c0000' },
  { id: 'underground',    label: 'Underground',     desc: 'Dark underground red-black',   color: '#dc2626', bg: '#080000' },
  { id: 'stadium',        label: 'Stadium',         desc: 'Bright white stadium lights',  color: '#f8fafc', bg: '#060606' },
  { id: 'rooftop',        label: 'Rooftop',         desc: 'City rooftop night glow',      color: '#818cf8', bg: '#030308' },
  { id: 'dive-bar',       label: 'Dive Bar',        desc: 'Gritty neon dive bar red',     color: '#ef4444', bg: '#0c0000' },
  // ── Moods ────────────────────────────────────────────────────────────────
  { id: 'melancholy',     label: 'Melancholy',      desc: 'Blue melancholy rain mood',    color: '#3b82f6', bg: '#020810' },
  { id: 'euphoric',       label: 'Euphoric',        desc: 'Bright euphoric rainbow',      color: '#f472b6', bg: '#0a0208' },
  { id: 'serene',         label: 'Serene',          desc: 'Calm serene teal stillness',   color: '#06b6d4', bg: '#030a10' },
  { id: 'energetic',      label: 'Energetic',       desc: 'High-energy bright orange',    color: '#f97316', bg: '#0c0600' },
  { id: 'mysterious',     label: 'Mysterious',      desc: 'Dark mysterious deep purple',  color: '#7c3aed', bg: '#040008' },
  { id: 'romantic',       label: 'Romantic',        desc: 'Warm pink romantic glow',      color: '#f43f5e', bg: '#0d0208' },
  { id: 'nostalgic',      label: 'Nostalgic',       desc: 'Warm sepia nostalgic film',    color: '#d97706', bg: '#0c0800' },
  { id: 'futuristic-v2',  label: 'Futuristic II',   desc: 'Clean white future tech',      color: '#e2e8f0', bg: '#040408' },
  { id: 'dreamy',         label: 'Dreamy',          desc: 'Soft pastel dream state',      color: '#c4b5fd', bg: '#070410' },
  { id: 'intense',        label: 'Intense',         desc: 'Bold intense crimson force',   color: '#dc2626', bg: '#0c0000' },
  { id: 'playful',        label: 'Playful',         desc: 'Fun bright playful yellow',    color: '#facc15', bg: '#0a0a00' },
  { id: 'elegant',        label: 'Elegant',         desc: 'Refined platinum elegance',    color: '#94a3b8', bg: '#040404' },
  // ── Duality ───────────────────────────────────────────────────────────────
  { id: 'fire-ice',       label: 'Fire & Ice',      desc: 'Hot red meets cold blue',      color: '#ef4444', bg: '#030a10' },
  { id: 'yin-yang',       label: 'Yin Yang',        desc: 'Balanced black and white',     color: '#f8fafc', bg: '#060606' },
  { id: 'day-night',      label: 'Day & Night',     desc: 'Sun gold meets moon silver',   color: '#fbbf24', bg: '#030810' },
  { id: 'earth-space',    label: 'Earth & Space',   desc: 'Green earth meets dark cosmos',color: '#10b981', bg: '#020506' },
  { id: 'life-death',     label: 'Life & Death',    desc: 'Bloom green meets ash grey',   color: '#22c55e', bg: '#050605' },
  { id: 'chaos-order',    label: 'Chaos & Order',   desc: 'Glitch red meets clean white', color: '#ef4444', bg: '#080808' },
  // ── Punk Subgenres ────────────────────────────────────────────────────────
  { id: 'steampunk',      label: 'Steampunk',       desc: 'Victorian steam copper-brown', color: '#d97706', bg: '#0c0800' },
  { id: 'biopunk',        label: 'Biopunk',         desc: 'Organic neon green cells',     color: '#4ade80', bg: '#030a03' },
  { id: 'dieselpunk',     label: 'Dieselpunk',      desc: 'Dirty diesel amber industrial',color: '#d97706', bg: '#0c0800' },
  { id: 'solarpunk',      label: 'Solarpunk',       desc: 'Bright solar green future',    color: '#22c55e', bg: '#050a04' },
  { id: 'atompunk',       label: 'Atompunk',        desc: 'Atomic age yellow-green',      color: '#a3e635', bg: '#060a00' },
  { id: 'nanopunk',       label: 'Nanopunk',        desc: 'Nano tech electric blue',      color: '#38bdf8', bg: '#020810' },
  // ── Colors / Neon ─────────────────────────────────────────────────────────
  { id: 'deep-purple',    label: 'Deep Purple',     desc: 'Rich saturated deep purple',   color: '#7c3aed', bg: '#040012' },
  { id: 'electric-teal',  label: 'Electric Teal',   desc: 'Vivid electric teal charge',   color: '#14b8a6', bg: '#020c10' },
  { id: 'neon-orange',    label: 'Neon Orange',     desc: 'Blazing neon orange pop',      color: '#fb923c', bg: '#0d0500' },
  { id: 'acid-green',     label: 'Acid Green',      desc: 'Corrosive acid lime green',    color: '#a3e635', bg: '#060a00' },
  { id: 'electric-red',   label: 'Electric Red',    desc: 'High voltage electric red',    color: '#ef4444', bg: '#0c0000' },
  { id: 'rose-gold',      label: 'Rose Gold',       desc: 'Warm romantic rose gold',      color: '#fb7185', bg: '#0c0508' },
  { id: 'platinum-v2',    label: 'Platinum II',     desc: 'Sleek platinum cool metal',    color: '#e2e8f0', bg: '#080808' },
  { id: 'titanium',       label: 'Titanium',        desc: 'Strong titanium blue-grey',    color: '#9ca3af', bg: '#040408' },
  { id: 'carbon-fiber',   label: 'Carbon Fiber',    desc: 'Dark woven carbon texture',    color: '#6b7280', bg: '#020202' },
  { id: 'brushed-metal',  label: 'Brushed Metal',   desc: 'Matte brushed metal silver',   color: '#94a3b8', bg: '#050508' },
  { id: 'neon-pink',      label: 'Neon Pink',       desc: 'Hot neon bubble gum pink',     color: '#f472b6', bg: '#0a020a' },
  { id: 'neon-blue',      label: 'Neon Blue',       desc: 'Electric neon blue charge',    color: '#38bdf8', bg: '#020810' },
  { id: 'neon-yellow',    label: 'Neon Yellow',     desc: 'Bright neon yellow caution',   color: '#facc15', bg: '#0a0a00' },
  { id: 'neon-purple',    label: 'Neon Purple',     desc: 'Vivid neon purple surge',      color: '#d946ef', bg: '#08020e' },
  { id: 'neon-red',       label: 'Neon Red',        desc: 'Danger neon red alarm',        color: '#f87171', bg: '#0c0200' },
  // ── Ice Cream / Sweets ────────────────────────────────────────────────────
  { id: 'bubblegum-v2',   label: 'Bubblegum II',    desc: 'Pop bubblegum candy pink',     color: '#f472b6', bg: '#0a020a' },
  { id: 'cotton-candy-v2',label: 'Cotton Candy II', desc: 'Light fluffy cotton candy',    color: '#f9a8d4', bg: '#0a0408' },
  { id: 'sherbet',        label: 'Sherbet',         desc: 'Tangy multi-color sherbet',    color: '#fb923c', bg: '#0c0808' },
  { id: 'sorbet',         label: 'Sorbet',          desc: 'Refreshing citrus sorbet',     color: '#fde68a', bg: '#0c0c04' },
  { id: 'gelato',         label: 'Gelato',          desc: 'Smooth Italian gelato cream',  color: '#fcd34d', bg: '#0c0c08' },
  // ── Optical ───────────────────────────────────────────────────────────────
  { id: 'holographic',    label: 'Holographic',     desc: 'Shifting hologram rainbow',    color: '#a78bfa', bg: '#050310' },
  { id: 'iridescent',     label: 'Iridescent',      desc: 'Oil film rainbow shimmer',     color: '#f0abfc', bg: '#060410' },
  { id: 'chrome',         label: 'Chrome',          desc: 'Mirror chrome reflection',     color: '#e2e8f0', bg: '#040404' },
  { id: 'mirror',         label: 'Mirror',          desc: 'Perfect mirror pure white',    color: '#f8fafc', bg: '#060606' },
  { id: 'prism-v2',       label: 'Prism II',        desc: 'Light splitting prism blast',  color: '#38bdf8', bg: '#030610' },
  // ── Sky Colors ────────────────────────────────────────────────────────────
  { id: 'midnight-v2',    label: 'Midnight II',     desc: 'Deep true midnight black',     color: '#1d4ed8', bg: '#010106' },
  { id: 'twilight-v2',    label: 'Twilight II',     desc: 'Soft dusk violet gradient',    color: '#a78bfa', bg: '#060412' },
  { id: 'golden-hour-v2', label: 'Golden Hour II',  desc: 'Warm last light of day',       color: '#f59e0b', bg: '#0c0a00' },
  { id: 'sunrise-v2',     label: 'Sunrise II',      desc: 'First morning light pink',     color: '#f472b6', bg: '#0a0408' },
  { id: 'blue-hour',      label: 'Blue Hour',       desc: 'Photographer blue hour dusk',  color: '#60a5fa', bg: '#030810' },
  // ── Seasons V2 ────────────────────────────────────────────────────────────
  { id: 'winter-v2',      label: 'Winter II',       desc: 'Crisp pure winter snowfall',   color: '#e2e8f0', bg: '#050810' },
  { id: 'spring-v2',      label: 'Spring II',       desc: 'Vibrant spring bloom colors',  color: '#86efac', bg: '#04080a' },
  { id: 'summer-v2',      label: 'Summer II',       desc: 'Hot bright summer sun',        color: '#fbbf24', bg: '#0c0a00' },
  { id: 'autumn-v2',      label: 'Autumn II',       desc: 'Warm autumn foliage fire',     color: '#f97316', bg: '#0d0600' },
  { id: 'monsoon-v2',     label: 'Monsoon II',      desc: 'Heavy tropical monsoon rain',  color: '#7dd3fc', bg: '#030810' },
  // ── Asian / Eastern ───────────────────────────────────────────────────────
  { id: 'sakura-v2',      label: 'Sakura II',       desc: 'Full bloom cherry blossom',    color: '#fda4af', bg: '#0d0608' },
  { id: 'maple',          label: 'Maple',           desc: 'Japanese maple red-orange',    color: '#dc2626', bg: '#0d0200' },
  { id: 'pine-forest',    label: 'Pine Forest',     desc: 'Dense dark pine forest',       color: '#15803d', bg: '#030804' },
  { id: 'bamboo-grove',   label: 'Bamboo Grove',    desc: 'Serene bamboo green grove',    color: '#84cc16', bg: '#050800' },
  { id: 'lotus',          label: 'Lotus',           desc: 'Sacred lotus pink bloom',      color: '#f472b6', bg: '#0a030a' },
  { id: 'samurai',        label: 'Samurai',         desc: 'Fierce samurai blood red',     color: '#dc2626', bg: '#0c0000' },
  { id: 'ninja',          label: 'Ninja',           desc: 'Shadow ninja dark grey',       color: '#4b5563', bg: '#020202' },
  { id: 'shogun',         label: 'Shogun',          desc: 'Noble shogun dark gold',       color: '#d97706', bg: '#0c0800' },
  { id: 'katana',         label: 'Katana',          desc: 'Razor sharp steel blue',       color: '#94a3b8', bg: '#040408' },
  { id: 'origami',        label: 'Origami',         desc: 'Delicate paper white fold',    color: '#f1f5f9', bg: '#080808' },
  // ── Fantasy & Monsters ────────────────────────────────────────────────────
  { id: 'dracula',        label: 'Dracula',         desc: 'Vampire dark crimson night',   color: '#dc2626', bg: '#0a0000' },
  { id: 'vampire',        label: 'Vampire',         desc: 'Blood red vampire glow',       color: '#ef4444', bg: '#0c0000' },
  { id: 'werewolf',       label: 'Werewolf',        desc: 'Full moon silver-grey',        color: '#9ca3af', bg: '#040608' },
  { id: 'ghost-theme',    label: 'Ghost',           desc: 'Translucent ghost white',      color: '#e2e8f0', bg: '#050508' },
  { id: 'witch',          label: 'Witch',           desc: 'Mystic witch purple-green',    color: '#84cc16', bg: '#04080a' },
  { id: 'zombie',         label: 'Zombie',          desc: 'Undead rotting green',         color: '#65a30d', bg: '#040800' },
  { id: 'mermaid',        label: 'Mermaid',         desc: 'Ocean mermaid teal-purple',    color: '#14b8a6', bg: '#030e10' },
  { id: 'unicorn',        label: 'Unicorn',         desc: 'Magic rainbow unicorn pastel', color: '#f472b6', bg: '#0a040a' },
  { id: 'dragon',         label: 'Dragon',          desc: 'Fire-breathing dragon orange', color: '#ea580c', bg: '#0d0400' },
  { id: 'phoenix',        label: 'Phoenix',         desc: 'Reborn phoenix flame red',     color: '#f97316', bg: '#0e0400' },
  { id: 'griffin',        label: 'Griffin',         desc: 'Majestic griffin gold-brown',  color: '#d97706', bg: '#0c0800' },
  { id: 'kraken',         label: 'Kraken',          desc: 'Deep sea kraken dark teal',    color: '#0f766e', bg: '#020e0c' },
  // ── Gaming Worlds ────────────────────────────────────────────────────────
  { id: 'minecraft',      label: 'Minecraft',       desc: 'Blocky grass green daylight',  color: '#65a30d', bg: '#060800' },
  { id: 'nether',         label: 'Nether',          desc: 'Hellish nether dark orange',   color: '#ea580c', bg: '#0e0200' },
  { id: 'end-realm',      label: 'End Realm',       desc: 'Void end realm purple',        color: '#a855f7', bg: '#04000e' },
  { id: 'overworld',      label: 'Overworld',       desc: 'Bright overworld blue sky',    color: '#38bdf8', bg: '#030a10' },
  { id: 'twilight-forest',label: 'Twilight Forest', desc: 'Magical dark forest green',    color: '#16a34a', bg: '#030800' },
  // ── Eras ─────────────────────────────────────────────────────────────────
  { id: 'space-age',      label: 'Space Age',       desc: '1960s space age silver',       color: '#94a3b8', bg: '#050508' },
  { id: 'retro-future',   label: 'Retro Future',    desc: 'Yesterday vision of tomorrow', color: '#f97316', bg: '#0e0600' },
  { id: 'art-deco',       label: 'Art Deco',        desc: 'Geometric gold art deco',      color: '#d97706', bg: '#0c0800' },
  { id: 'gothic',         label: 'Gothic',          desc: 'Dark gothic crimson black',    color: '#dc2626', bg: '#0a0000' },
  { id: 'baroque-v2',     label: 'Baroque II',      desc: 'Opulent baroque deep gold',    color: '#d97706', bg: '#0c0800' },
] as const;

export const SOUND_CATEGORIES = [
  'Realistic Sounds', 'Acoustic Sounds', 'Orchestral Sounds', 'Jazz Sounds', 'Classical Sounds',
  'Nature Sounds', 'Ambient Sounds', 'Atmospheric Sounds', 'Cinematic Sounds', 'Environmental Sounds',
  'Electronic / Synth Sounds', 'Futuristic / Sci-fi Sounds', 'Game / Arcade Sounds', 'Retro / Vintage Sounds',
  'Lo-fi', 'Digital / Pixel Sounds',
  'Meditation / Healing Sounds', 'Chill / Relax Sounds', 'Ambient / Chill-hop Sounds', 'ASMR Sounds', 'Meditation Bells',
  'Percussion / Rhythm Sounds', 'Ethnic / World Percussion', 'Latin / Reggae Sounds', 'Jazz Percussion',
  'Bass Sounds', 'Hip-Hop / Trap Sounds', 'Dub / Reggae Bass',
  'Experimental / Creative Sounds', 'Sound Effects (FX)', 'Vocal / Human Sounds', 'Glitch / Dub Sounds', 'IDM / Glitch Sounds',
  'Traditional / Cultural Sounds', 'World Music Sounds', 'Celtic / Irish Sounds', 'African Sounds', 'Asian Sounds',
  'Chillwave / Vaporwave Sounds', 'Synthwave Sounds', 'Ambient Electronic',
  'Horror / Dark Sounds', 'Comedy / Playful Sounds', 'Western / Country Sounds', 'Steampunk Sounds',
  'Gospel Sounds', 'Baroque Sounds',
  // ── Extended Sound Categories ──────────────────────────────────────────────
  'Dubstep / EDM Sounds', 'House / Techno Sounds', 'Trance Sounds', 'Drum & Bass Sounds',
  'Ambient Drone Sounds', 'Field Recording Sounds', 'Noise / Experimental',
  'Orchestral Strings', 'Orchestral Brass', 'Orchestral Woodwinds', 'Orchestral Percussion',
  'Piano Solo', 'Harpsichord / Clavichord', 'Organ Sounds', 'Accordion Sounds',
  'Acoustic Guitar Solo', 'Electric Guitar Clean', 'Electric Guitar Distorted', 'Bass Guitar',
  'Ukulele Sounds', 'Banjo Sounds', 'Mandolin Sounds', 'Harp Sounds', 'Sitar Sounds',
  'Didgeridoo Sounds', 'Bagpipes', 'Pan Flute', 'Shakuhachi', 'Erhu Sounds',
  'Koto Sounds', 'Taiko Drums', 'Steel Drums', 'Tabla Sounds', 'Djembe Sounds',
  'Rain Stick', 'Tibetan Bowls', 'Crystal Bowls', 'Wind Chimes', 'Bell Choir',
  'Choir / Vocals', 'Opera Vocals', 'Whisper ASMR', 'Beatbox Sounds', 'Human Beatbox',
  'Synth Pads', 'Synth Leads', 'Synth Arpeggios', 'Synth Bass', 'Synth Chords',
  'Chipmusic / Chiptune', 'Theremin Sounds', 'Mellotron Sounds', 'Ondes Martenot',
  'Vintage Casio', 'Vintage Yamaha DX7', 'Moog Synthesizer', 'Roland TB-303 Bass',
  'Typewriter Sounds', 'Office Sounds', 'City Ambience', 'Forest Ambience', 'Ocean Ambience',
  'Rain Sounds', 'Thunder Sounds', 'Fire Sounds', 'Wind Sounds', 'Waterfall Sounds',
  'Space Ambience', 'Cave Sounds', 'Jungle Sounds', 'Desert Wind', 'Arctic Wind',
] as const;
export type SoundCategory = typeof SOUND_CATEGORIES[number];

interface RecordingEvent {
  key: string;
  timestamp: number;
  instrument: string;
  velocity: number;
  rgbColor: string;
  glowIntensity: number;
  isShifted: boolean;
}

export interface SessionRecord {
  id: string;
  date: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  wordCount: number;
  duration: number;
  mode: TypingMode;
  xpEarned: number;
}

const NUMBERS_TEXT = '12345 67890 11 22 33 44 55 66 77 88 99 00 123 456 789 012 345 678 3.14 2.71 100 200 500 1000 9876 5432';

const LESSON_TEXTS: Record<number, string> = {
  1: 'asdf jkl; asdf jkl; asd fghjkl; asdf jkl;',
  2: 'qwerty uiop qwerty uiop qwerty uiop',
  3: 'zxcv bnm, zxcv bnm, zxcvb nm,.',
  4: '1234 5678 90 1234 5678 1234567890',
  5: '!@#$ %^&* () !@#$%^&*()',
  6: 'the quick brown fox jumps over the lazy dog',
  7: 'pack my box with five dozen liquor jugs',
  8: 'how vexingly quick daft zebras jump over the wall',
  9: 'sphinx of black quartz judge my vow perfectly',
  10: 'the five boxing wizards jump quickly and expertly',
};

const LESSON_INSTRUCTIONS: Record<number, string> = {
  1: 'Home row: Keep fingers resting on ASDF JKL; — your home base',
  2: 'Top row: Reach up from home row for QWERTY UIOP keys',
  3: 'Bottom row: Reach down from home row for ZXCV BNM keys',
  4: 'Numbers: Use the number row with corresponding fingers',
  5: 'Symbols: Shift + number for punctuation mastery',
  6: 'Full sentence: The classic pangram with every letter',
  7: 'Speed challenge: Pack my box with five dozen liquor jugs',
  8: 'Advanced: Long pangram for speed and accuracy',
  9: 'Expert: Sphinx of black quartz — master all keys',
  10: 'Master: Five boxing wizards — your ultimate challenge',
};

export const RGB_MODES = [
  { id: 'wave',         label: 'Wave',          desc: 'Rainbow flows left → right across all keys',    icon: '🌊' },
  { id: 'breathing',    label: 'Breathing',     desc: 'All keys pulse in & out with color',            icon: '💨' },
  { id: 'static-rainbow', label: 'Static Rainbow', desc: 'Fixed rainbow spread — no movement',         icon: '🌈' },
  { id: 'starlight',    label: 'Starlight',     desc: 'Random keys sparkle like stars',                icon: '✨' },
  { id: 'solid',        label: 'Solid Color',   desc: 'All keys glow with your custom color',          icon: '🎨' },
  { id: 'reactive',     label: 'Reactive',      desc: 'Keys only light up when pressed',               icon: '⚡' },
  { id: 'aurora',       label: 'Aurora',        desc: 'Northern lights — shifting green & violet',     icon: '🌌' },
  { id: 'thunder',      label: 'Thunder',       desc: 'Random lightning strikes on random keys',       icon: '🌩️' },
  { id: 'candy',        label: 'Candy',         desc: 'Soft pastel rainbow shimmer',                   icon: '🍭' },
  { id: 'plasma',       label: 'Plasma',        desc: 'Hot electric plasma ripple effect',             icon: '🔮' },
  { id: 'fire',         label: 'Fire',          desc: 'Blazing orange-red fire effect',                icon: '🔥' },
  { id: 'ice',          label: 'Ice',           desc: 'Cool blue-white ice shimmer',                   icon: '❄️' },
  { id: 'disco',        label: 'Disco',         desc: 'Every key gets a random color flash',           icon: '🪩' },
  { id: 'sunset',       label: 'Sunset',        desc: 'Warm orange to deep purple gradient',           icon: '🌅' },
  { id: 'neon-pulse',   label: 'Neon Pulse',    desc: 'Rapid neon cyberpunk color cycling',            icon: '💜' },
  { id: 'lava',         label: 'Lava Lamp',     desc: 'Slow hypnotic lava lamp colors',                icon: '🌋' },
  { id: 'galaxy',       label: 'Galaxy',        desc: 'Deep space blue & purple galaxy drift',         icon: '🌌' },
  { id: 'typhoon',      label: 'Typhoon',        desc: 'Swirling cyan teal & white storm',               icon: '🌀' },
  { id: 'forest',       label: 'Forest',         desc: 'Deep emerald woodland shades',                  icon: '🌲' },
  { id: 'ocean',        label: 'Ocean',           desc: 'Deep ocean blues and aquas',                    icon: '🌊' },
  { id: 'sakura',       label: 'Sakura',          desc: 'Cherry blossom pink bloom',                     icon: '🌸' },
  { id: 'desert',       label: 'Desert',          desc: 'Warm golden sand dunes',                        icon: '🏜️' },
  { id: 'toxic',        label: 'Toxic',           desc: 'Radioactive green glow',                        icon: '☢️' },
  { id: 'blood',        label: 'Blood',           desc: 'Deep crimson vampire red',                      icon: '🩸' },
  { id: 'void',         label: 'Void',            desc: 'Abyssal dark purple depths',                    icon: '🕳️' },
  { id: 'neon-green',   label: 'Neon Green',      desc: 'Bright electric lime pulse',                    icon: '💚' },
  { id: 'cyber-pink',   label: 'Cyber Pink',      desc: 'Hot magenta cyberpunk glow',                    icon: '💗' },
  { id: 'matrix-rgb',   label: 'Matrix',          desc: 'Cascading code green stream',                   icon: '💾' },
  { id: 'copper',       label: 'Copper',          desc: 'Warm metallic copper shimmer',                  icon: '🔶' },
  { id: 'emerald-rgb',  label: 'Emerald',         desc: 'Rich gemstone green brilliance',                icon: '💎' },
  { id: 'sapphire',     label: 'Sapphire',        desc: 'Deep jewel blue radiance',                      icon: '💙' },
  { id: 'ruby',         label: 'Ruby',            desc: 'Bold gemstone red fire',                        icon: '❤️' },
  { id: 'earth-tones',  label: 'Earth Tones',     desc: 'Natural warm earth palette',                    icon: '🌍' },
  { id: 'storm',        label: 'Storm',           desc: 'Swirling silver-blue storm clouds',             icon: '⛈️' },
  { id: 'coral-rgb',    label: 'Coral',           desc: 'Vivid coral reef orange-pink',                  icon: '🪸' },
  { id: 'teal-rgb',     label: 'Teal',            desc: 'Soothing teal cyan waves',                      icon: '🌊' },
  { id: 'magenta-rgb',  label: 'Magenta',         desc: 'Rich magenta-violet shimmer',                   icon: '💜' },
  { id: 'hologram',     label: 'Hologram',        desc: 'Iridescent holographic rainbow',                icon: '✨' },
  { id: 'venom',        label: 'Venom',           desc: 'Dark toxic green-yellow pulse',                 icon: '🐍' },
  { id: 'inferno',      label: 'Inferno',         desc: 'Deep scorching red-orange heat',                icon: '🔥' },
  { id: 'chrome',       label: 'Chrome',          desc: 'Polished silver metallic shine',                icon: '⚙️' },
  { id: 'peacock',      label: 'Peacock',         desc: 'Jewel-toned peacock blue-green',                icon: '🦚' },
  { id: 'jade',         label: 'Jade',            desc: 'Smooth jade stone green',                       icon: '🪨' },
  { id: 'amethyst-rgb', label: 'Amethyst',        desc: 'Crystal purple gemstone glow',                  icon: '💜' },
  { id: 'violet-rgb',   label: 'Violet',          desc: 'Electric violet-indigo shift',                  icon: '🔮' },
  { id: 'indigo-rgb',   label: 'Indigo',          desc: 'Rich indigo blue depth',                        icon: '🌌' },
  { id: 'amber',        label: 'Amber',           desc: 'Warm amber honey glow',                         icon: '🍯' },
  { id: 'citrus',       label: 'Citrus',          desc: 'Zesty citrus yellow-green',                     icon: '🍋' },
  { id: 'berry',        label: 'Berry',           desc: 'Deep berry purple-red',                         icon: '🫐' },
  { id: 'peach-rgb',    label: 'Peach',           desc: 'Soft warm peach gradient',                      icon: '🍑' },
  { id: 'lilac',        label: 'Lilac',           desc: 'Gentle lilac purple pastel',                    icon: '💐' },
  { id: 'sage',         label: 'Sage',            desc: 'Muted sage green calm',                         icon: '🌿' },
  { id: 'crimson',      label: 'Crimson',         desc: 'Bold deep crimson wave',                        icon: '🔴' },
  { id: 'cobalt',       label: 'Cobalt',          desc: 'Vivid cobalt blue shift',                       icon: '💠' },
  { id: 'turquoise-rgb',label: 'Turquoise',       desc: 'Brilliant turquoise teal gem',                  icon: '💎' },
  { id: 'navy',         label: 'Navy',            desc: 'Deep naval dark blue',                          icon: '⚓' },
  { id: 'orchid',       label: 'Orchid',          desc: 'Exotic orchid purple-pink',                     icon: '💮' },
  { id: 'sienna',       label: 'Sienna',          desc: 'Rich earthy sienna brown',                      icon: '🏺' },
  { id: 'lime-rgb',     label: 'Lime',            desc: 'Bright acidic lime green',                      icon: '🍈' },
  { id: 'electric-blue',label: 'Electric Blue',   desc: 'Vivid electric blue charge',                    icon: '⚡' },
  { id: 'hot-pink',     label: 'Hot Pink',        desc: 'Sizzling hot pink burst',                       icon: '💗' },
  { id: 'sea-green',    label: 'Sea Green',       desc: 'Fresh sea green shimmer',                       icon: '🌿' },
  { id: 'sky-blue',     label: 'Sky Blue',        desc: 'Clear daylight sky blue',                       icon: '☀️' },
  { id: 'blush',        label: 'Blush',           desc: 'Soft delicate blush rose',                      icon: '🌹' },
  { id: 'champagne',    label: 'Champagne',       desc: 'Elegant champagne gold',                        icon: '🥂' },
  { id: 'silver-rgb',   label: 'Silver',          desc: 'Cool brushed silver metallic',                  icon: '🪙' },
  { id: 'bronze',       label: 'Bronze',          desc: 'Warm antique bronze glow',                      icon: '🏺' },
  { id: 'opal',         label: 'Opal',            desc: 'Shifting iridescent opal gem',                  icon: '🔮' },
  { id: 'pearl',        label: 'Pearl',           desc: 'Lustrous pearl white shimmer',                  icon: '🫧' },
  { id: 'malachite',    label: 'Malachite',       desc: 'Deep swirling malachite green',                 icon: '🌿' },
  { id: 'lapis',        label: 'Lapis Lazuli',    desc: 'Ancient lapis blue-gold',                       icon: '🔵' },
  { id: 'aquamarine',   label: 'Aquamarine',      desc: 'Clear aquamarine blue-green',                   icon: '💎' },
  { id: 'carnival',     label: 'Carnival',        desc: 'Vivid festive carnival colors',                 icon: '🎡' },
  { id: 'retro-rgb',    label: 'Retro',           desc: 'Warm vintage retro palette',                    icon: '📺' },
  { id: 'bubblegum-rgb',label: 'Bubblegum',       desc: 'Sweet bubblegum pink candy',                    icon: '🍬' },
  { id: 'cotton',       label: 'Cotton Candy',    desc: 'Fluffy pastel pink-blue',                       icon: '🍭' },
  { id: 'mint-ice',     label: 'Mint Ice',        desc: 'Refreshing mint icy cool',                      icon: '🧊' },
  { id: 'lavender-rgb', label: 'Lavender Dream',  desc: 'Dreamy soft lavender mist',                     icon: '🌸' },
  { id: 'electric-purple', label: 'Electric Purple', desc: 'Charged electric purple surge',              icon: '⚡' },
  { id: 'golden-hour',  label: 'Golden Hour',     desc: 'Warm sunset golden light',                      icon: '🌇' },
  { id: 'midnight-blue',label: 'Midnight Blue',   desc: 'Dark midnight sky blue',                        icon: '🌙' },
  { id: 'northern-lights', label: 'Northern Lights', desc: 'Vivid aurora green-violet',                  icon: '🌌' },
  { id: 'deep-ocean',   label: 'Deep Ocean',      desc: 'Abyssal deep ocean blue',                       icon: '🌊' },
  { id: 'sunrise-rgb',  label: 'Sunrise',         desc: 'Warm amber morning glow',                       icon: '🌅' },
  { id: 'dusk-rgb',     label: 'Dusk',            desc: 'Purple-orange twilight fade',                   icon: '🌆' },
  { id: 'moonlight',    label: 'Moonlight',       desc: 'Cool silver moonlit glow',                      icon: '🌕' },
  { id: 'tropical',     label: 'Tropical',        desc: 'Vivid tropical paradise',                       icon: '🌴' },
  { id: 'cyber-red',    label: 'Cyberpunk Red',   desc: 'Dark neon red dystopia',                        icon: '🔴' },
  { id: 'toxic-waste',  label: 'Toxic Waste',     desc: 'Hazardous lime-yellow drip',                    icon: '☢️' },
  { id: 'lava-flow',    label: 'Lava Flow',       desc: 'Molten lava slow crawl',                        icon: '🌋' },
  { id: 'black-ice',    label: 'Black Ice',       desc: 'Dangerous dark icy blue',                       icon: '🧊' },
  { id: 'solar-flare',  label: 'Solar Flare',     desc: 'Intense solar burst yellow-red',                icon: '☀️' },
  { id: 'cosmic-ray',   label: 'Cosmic Ray',      desc: 'High energy cosmic purple beam',                icon: '🔭' },
  { id: 'acid-rain',    label: 'Acid Rain',       desc: 'Acidic yellow-green drizzle',                   icon: '🌧️' },
  { id: 'oil-slick',    label: 'Oil Slick',       desc: 'Rainbow iridescent oil shimmer',                icon: '🌈' },
  { id: 'prism-rgb',    label: 'Prism',           desc: 'Sharp spectrum prism split',                    icon: '🔷' },
  { id: 'waterfall',    label: 'Waterfall',       desc: 'Cascading blue-white waterfall',                icon: '💧' },
  { id: 'autumn-leaves',label: 'Autumn Leaves',   desc: 'Warm fall orange-red leaves',                   icon: '🍂' },
  { id: 'spring-bloom', label: 'Spring Bloom',    desc: 'Fresh spring pinks and greens',                 icon: '🌷' },
  { id: 'winter-frost', label: 'Winter Frost',    desc: 'Crisp icy winter white-blue',                   icon: '❄️' },
  { id: 'summer-heat',  label: 'Summer Heat',     desc: 'Blazing summer yellow-orange',                  icon: '☀️' },
  { id: 'cherry',       label: 'Cherry Blossom',  desc: 'Delicate cherry pink petals',                   icon: '🌸' },
  { id: 'bamboo-rgb',   label: 'Bamboo',          desc: 'Fresh bamboo stalk green',                      icon: '🎋' },
  { id: 'koi',          label: 'Koi Pond',        desc: 'Orange-white koi fish glow',                    icon: '🐟' },
  { id: 'thunderstorm', label: 'Thunderstorm',    desc: 'Dark storm cloud gray-purple',                  icon: '⛈️' },
  { id: 'blizzard',     label: 'Blizzard',        desc: 'Swirling white blizzard snow',                  icon: '🌨️' },
  { id: 'volcanic',     label: 'Volcanic',        desc: 'Explosive volcanic orange eruption',             icon: '🌋' },
  { id: 'deep-sea',     label: 'Deep Sea',        desc: 'Dark bioluminescent deep blue',                 icon: '🌊' },
  { id: 'pastel-rainbow', label: 'Pastel Rainbow',desc: 'Soft pastel rainbow shimmer',                   icon: '🌈' },
  { id: 'ultraviolet',  label: 'Ultraviolet',     desc: 'Invisible UV purple-white glow',                icon: '🔮' },
] as const;

export type RgbMode = typeof RGB_MODES[number]['id'];

export type BackgroundEffect =
  | 'none' | 'aurora' | 'particles' | 'matrix-rain' | 'nebula'
  | 'cyber' | 'fireworks' | 'snow' | 'bubbles' | 'starfield'
  | 'binary-rain' | 'purple-rain' | 'red-rain' | 'meteor-shower' | 'plasma-wave'
  | 'radar-sweep' | 'warp-speed' | 'dna-helix' | 'electric-arcs' | 'circuit-traces'
  | 'fireflies' | 'embers' | 'confetti' | 'cherry-blossom' | 'autumn-leaves'
  | 'glitter' | 'dust-motes' | 'neon-orbs' | 'fire-sparks' | 'hearts'
  | 'music-notes' | 'stars-drift' | 'raindrops' | 'dandelion' | 'butterflies'
  | 'diamonds' | 'soap-bubbles-xl' | 'toxic-drops' | 'lava-drops' | 'galaxy-dust'
  | 'scan-lines' | 'vhs-noise' | 'color-wash' | 'prism-rays' | 'fog-roll'
  | 'oil-slick' | 'lava-glow' | 'aurora-curtain' | 'hologram-scan' | 'glitch-bars'
  | 'neon-pulse' | 'laser-grid' | 'gradient-shift' | 'spotlight' | 'vortex'
  | 'hex-overlay' | 'dot-wave' | 'smoke-layer' | 'water-shimmer' | 'disco-floor'
  | 'crt-glow' | 'heat-haze' | 'deep-sea' | 'cave-glow' | 'neon-flicker'
  | 'thunder-flash' | 'eclipse' | 'inferno' | 'arctic-frost' | 'toxic-glow'
  | 'magma-flow' | 'void-ripple' | 'spectral' | 'chromatic-shift' | 'rainbow-wave'
  | 'sunset-gradient' | 'cosmic-flow' | 'dream-haze' | 'retro-glow' | 'hyperspace'
  | 'quantum-field' | 'galaxy-swirl' | 'nebula-bloom' | 'solar-wind' | 'black-hole'
  | 'event-horizon' | 'fractal-bloom' | 'spiral-galaxy' | 'mandala-spin' | 'mosaic-shift'
  | 'stained-glass' | 'aurora-borealis' | 'plasma-glow' | 'crystal-lattice' | 'energy-field'
  | 'wormhole' | 'dimension-rift' | 'mycelium' | 'coral-reef' | 'northern-lights'
  | 'southern-lights' | 'bioluminescence' | 'thunderstorm' | 'sandstorm' | 'blizzard'
  | 'heatwave' | 'twilight' | 'sunrise' | 'moonrise' | 'startrail';

export const BACKGROUND_EFFECTS = [
  { id: 'none',           label: 'None',            desc: 'Subtle gradient background',        icon: '⬛' },
  { id: 'aurora',         label: 'Aurora',          desc: 'Animated northern lights blobs',    icon: '🌈' },
  { id: 'particles',      label: 'Particles',       desc: 'Floating particle field',           icon: '✨' },
  { id: 'matrix-rain',    label: 'Matrix Rain',     desc: 'Classic green digital rain',        icon: '💚' },
  { id: 'nebula',         label: 'Nebula',          desc: 'Deep space nebula clouds',          icon: '🌌' },
  { id: 'cyber',          label: 'Cyber Grid',      desc: 'Neon pulsing grid lines',           icon: '🔷' },
  { id: 'fireworks',      label: 'Fireworks',       desc: 'Bursting particle explosions',      icon: '🎆' },
  { id: 'snow',           label: 'Snow',            desc: 'Gentle falling snowflakes',         icon: '❄️' },
  { id: 'bubbles',        label: 'Bubbles',         desc: 'Rising translucent bubbles',        icon: '🫧' },
  { id: 'starfield',      label: 'Starfield',       desc: 'Parallax warp speed stars',         icon: '⭐' },
  { id: 'binary-rain',    label: 'Binary Rain',     desc: 'Falling 0s and 1s digital code',    icon: '01' },
  { id: 'purple-rain',    label: 'Purple Rain',     desc: 'Purple matrix character rain',      icon: '💜' },
  { id: 'red-rain',       label: 'Red Rain',        desc: 'Crimson digital rain',              icon: '🔴' },
  { id: 'meteor-shower',  label: 'Meteor Shower',   desc: 'Diagonal shooting meteors',         icon: '☄️' },
  { id: 'plasma-wave',    label: 'Plasma Wave',     desc: 'Animated color plasma field',       icon: '🌊' },
  { id: 'radar-sweep',    label: 'Radar Sweep',     desc: 'Rotating radar scan sweep',         icon: '📡' },
  { id: 'warp-speed',     label: 'Warp Speed',      desc: 'Hyperdrive star tunnel zoom',       icon: '🚀' },
  { id: 'dna-helix',      label: 'DNA Helix',       desc: 'Rotating double helix',             icon: '🧬' },
  { id: 'electric-arcs',  label: 'Electric Arcs',   desc: 'Fractal lightning bolts',           icon: '⚡' },
  { id: 'circuit-traces', label: 'Circuit Traces',  desc: 'Growing circuit board traces',      icon: '🖥️' },
  { id: 'fireflies',      label: 'Fireflies',       desc: 'Glowing drifting fireflies',        icon: '🪲' },
  { id: 'embers',         label: 'Embers',          desc: 'Rising fire embers',                icon: '🔥' },
  { id: 'confetti',       label: 'Confetti',        desc: 'Colorful falling confetti',         icon: '🎊' },
  { id: 'cherry-blossom', label: 'Cherry Blossom',  desc: 'Drifting pink flower petals',       icon: '🌸' },
  { id: 'autumn-leaves',  label: 'Autumn Leaves',   desc: 'Swirling autumn leaves fall',       icon: '🍂' },
  { id: 'glitter',        label: 'Glitter',         desc: 'Sparkling glitter shimmer',         icon: '💎' },
  { id: 'dust-motes',     label: 'Dust Motes',      desc: 'Slow drifting dust particles',      icon: '🌫️' },
  { id: 'neon-orbs',      label: 'Neon Orbs',       desc: 'Floating colored glow orbs',        icon: '🔮' },
  { id: 'fire-sparks',    label: 'Fire Sparks',     desc: 'Rising fire spark particles',       icon: '✴️' },
  { id: 'hearts',         label: 'Hearts',          desc: 'Floating rising hearts',            icon: '❤️' },
  { id: 'music-notes',    label: 'Music Notes',     desc: 'Rising musical note symbols',       icon: '🎵' },
  { id: 'stars-drift',    label: 'Stars Drift',     desc: 'Slowly twinkling drifting stars',   icon: '🌟' },
  { id: 'raindrops',      label: 'Rain',            desc: 'Falling rain streak drops',         icon: '🌧️' },
  { id: 'dandelion',      label: 'Dandelion',       desc: 'Floating dandelion seeds',          icon: '🌬️' },
  { id: 'butterflies',    label: 'Butterflies',     desc: 'Fluttering butterfly swarm',        icon: '🦋' },
  { id: 'diamonds',       label: 'Diamonds',        desc: 'Falling gemstone diamonds',         icon: '💠' },
  { id: 'soap-bubbles-xl',label: 'Giant Bubbles',   desc: 'Large slow rising soap bubbles',    icon: '🫧' },
  { id: 'toxic-drops',    label: 'Toxic Drops',     desc: 'Falling toxic green droplets',      icon: '☣️' },
  { id: 'lava-drops',     label: 'Lava Drops',      desc: 'Falling molten lava drops',         icon: '🌋' },
  { id: 'galaxy-dust',    label: 'Galaxy Dust',     desc: 'Drifting cosmic dust particles',    icon: '🌠' },
  { id: 'scan-lines',     label: 'Scan Lines',      desc: 'CRT monitor scanline overlay',      icon: '📺' },
  { id: 'vhs-noise',      label: 'VHS Noise',       desc: 'Retro VHS static noise',            icon: '📼' },
  { id: 'color-wash',     label: 'Color Wash',      desc: 'Shifting rainbow color wash',       icon: '🎨' },
  { id: 'prism-rays',     label: 'Prism Rays',      desc: 'Rotating rainbow prism beams',      icon: '🔆' },
  { id: 'fog-roll',       label: 'Fog',             desc: 'Rolling misty fog gradient',        icon: '🌫️' },
  { id: 'oil-slick',      label: 'Oil Slick',       desc: 'Iridescent oil surface shimmer',    icon: '🌈' },
  { id: 'lava-glow',      label: 'Lava Glow',       desc: 'Pulsing molten lava glow',          icon: '🔴' },
  { id: 'aurora-curtain', label: 'Aurora Curtain',  desc: 'Slow waving light curtains',        icon: '🌅' },
  { id: 'hologram-scan',  label: 'Hologram',        desc: 'Scanning holographic overlay',      icon: '📊' },
  { id: 'glitch-bars',    label: 'Glitch Bars',     desc: 'Flickering glitch bar stripes',     icon: '⚠️' },
  { id: 'neon-pulse',     label: 'Neon Pulse',      desc: 'Pulsing neon glow radiance',        icon: '💡' },
  { id: 'laser-grid',     label: 'Laser Grid',      desc: 'Neon laser grid lines',             icon: '🔲' },
  { id: 'gradient-shift', label: 'Gradient Shift',  desc: 'Slowly cycling color gradients',    icon: '🎭' },
  { id: 'spotlight',      label: 'Spotlight',       desc: 'Pulsing soft spotlight glow',       icon: '🔦' },
  { id: 'vortex',         label: 'Vortex',          desc: 'Spinning color vortex',             icon: '🌀' },
  { id: 'hex-overlay',    label: 'Hex Grid',        desc: 'Hexagonal dot matrix overlay',      icon: '⬡' },
  { id: 'dot-wave',       label: 'Dot Wave',        desc: 'Rippling animated dot pattern',     icon: '⚫' },
  { id: 'smoke-layer',    label: 'Smoke',           desc: 'Drifting smoke gradient layer',     icon: '💨' },
  { id: 'water-shimmer',  label: 'Water Shimmer',   desc: 'Shimmering water surface light',    icon: '💧' },
  { id: 'disco-floor',    label: 'Disco Floor',     desc: 'Animated disco tile floor',         icon: '🕺' },
  { id: 'crt-glow',       label: 'CRT Glow',        desc: 'CRT phosphor green glow',           icon: '🖥️' },
  { id: 'heat-haze',      label: 'Heat Haze',       desc: 'Desert heat distortion shimmer',    icon: '🌡️' },
  { id: 'deep-sea',       label: 'Deep Sea',        desc: 'Dark ocean depth atmosphere',       icon: '🌊' },
  { id: 'cave-glow',      label: 'Cave Glow',       desc: 'Bioluminescent cave glow',          icon: '🫐' },
  { id: 'neon-flicker',   label: 'Neon Flicker',    desc: 'Flickering neon sign effect',       icon: '🔆' },
  { id: 'thunder-flash',  label: 'Thunder Flash',   desc: 'Lightning flash through clouds',    icon: '⛈️' },
  { id: 'eclipse',        label: 'Eclipse',         desc: 'Solar eclipse corona effect',       icon: '🌑' },
  { id: 'inferno',        label: 'Inferno',         desc: 'Intense fire inferno glow',         icon: '🔥' },
  { id: 'arctic-frost',   label: 'Arctic Frost',    desc: 'Icy arctic blue frost glow',        icon: '🧊' },
  { id: 'toxic-glow',     label: 'Toxic Glow',      desc: 'Pulsing toxic green radiance',      icon: '☣️' },
  { id: 'magma-flow',     label: 'Magma Flow',      desc: 'Flowing underground magma',         icon: '🌋' },
  { id: 'void-ripple',    label: 'Void Ripple',     desc: 'Dark expanding void ripples',       icon: '⚫' },
  { id: 'spectral',       label: 'Spectral',        desc: 'Spectral rainbow color bands',      icon: '🌈' },
  { id: 'chromatic-shift',label: 'Chromatic Shift', desc: 'RGB chromatic aberration shift',    icon: '🔴' },
  { id: 'rainbow-wave',   label: 'Rainbow Wave',    desc: 'Shifting rainbow wave overlay',     icon: '🌈' },
  { id: 'sunset-gradient',label: 'Sunset',          desc: 'Warm sunset color gradient',        icon: '🌇' },
  { id: 'cosmic-flow',    label: 'Cosmic Flow',     desc: 'Drifting cosmic space gradients',   icon: '🌌' },
  { id: 'dream-haze',     label: 'Dream Haze',      desc: 'Soft dreamy pastel haze',           icon: '💭' },
  { id: 'retro-glow',     label: 'Retro Glow',      desc: '80s synthwave retrowave glow',      icon: '🕹️' },
  { id: 'hyperspace',     label: 'Hyperspace',      desc: 'Hyperdrive expanding rings',        icon: '🚀' },
  { id: 'quantum-field',  label: 'Quantum Field',   desc: 'Interference pattern field',        icon: '⚛️' },
  { id: 'galaxy-swirl',   label: 'Galaxy Swirl',    desc: 'Slow rotating galaxy gradient',     icon: '🌀' },
  { id: 'nebula-bloom',   label: 'Nebula Bloom',    desc: 'Expanding nebula cloud bloom',      icon: '🌸' },
  { id: 'solar-wind',     label: 'Solar Wind',      desc: 'Streaming solar wind rays',         icon: '☀️' },
  { id: 'black-hole',     label: 'Black Hole',      desc: 'Rotating black hole gravity',       icon: '⚫' },
  { id: 'event-horizon',  label: 'Event Horizon',   desc: 'Glowing event horizon ring',        icon: '🌑' },
  { id: 'fractal-bloom',  label: 'Fractal Bloom',   desc: 'Blooming fractal ring pattern',     icon: '🔵' },
  { id: 'spiral-galaxy',  label: 'Spiral Galaxy',   desc: 'Rotating spiral galaxy arms',       icon: '🌀' },
  { id: 'mandala-spin',   label: 'Mandala',         desc: 'Spinning mandala pattern',          icon: '🔯' },
  { id: 'mosaic-shift',   label: 'Mosaic',          desc: 'Shifting color mosaic tiles',       icon: '🎨' },
  { id: 'stained-glass',  label: 'Stained Glass',   desc: 'Rotating stained glass colors',     icon: '🎨' },
  { id: 'aurora-borealis',label: 'Aurora Borealis', desc: 'Waving aurora light bands',         icon: '🌈' },
  { id: 'plasma-glow',    label: 'Plasma Glow',     desc: 'Electric plasma discharge glow',    icon: '💜' },
  { id: 'crystal-lattice',label: 'Crystal Lattice', desc: 'Crystalline geometric lattice',     icon: '💎' },
  { id: 'energy-field',   label: 'Energy Field',    desc: 'Pulsing energy force field',        icon: '⚡' },
  { id: 'wormhole',       label: 'Wormhole',        desc: 'Spinning wormhole tunnel',          icon: '🌀' },
  { id: 'dimension-rift', label: 'Dimension Rift',  desc: 'Tearing dimensional rift',          icon: '⚡' },
  { id: 'mycelium',       label: 'Mycelium',        desc: 'Fungal mycelium network web',       icon: '🍄' },
  { id: 'coral-reef',     label: 'Coral Reef',      desc: 'Warm coral reef glow',              icon: '🪸' },
  { id: 'northern-lights',label: 'Northern Lights', desc: 'Dancing northern aurora bands',     icon: '🌟' },
  { id: 'southern-lights',label: 'Southern Lights', desc: 'Southern aurora australis bands',   icon: '✨' },
  { id: 'bioluminescence',label: 'Bioluminescence', desc: 'Glowing ocean bioluminescence',     icon: '🔵' },
  { id: 'thunderstorm',   label: 'Thunderstorm',    desc: 'Dark stormy lightning flashes',     icon: '⛈️' },
  { id: 'sandstorm',      label: 'Sandstorm',       desc: 'Swirling desert sandstorm',         icon: '🌪️' },
  { id: 'blizzard',       label: 'Blizzard',        desc: 'Intense blizzard snow surge',       icon: '🌨️' },
  { id: 'heatwave',       label: 'Heat Wave',       desc: 'Shimmering summer heat wave',       icon: '🌡️' },
  { id: 'twilight',       label: 'Twilight',        desc: 'Deep purple twilight sky',          icon: '🌆' },
  { id: 'sunrise',        label: 'Sunrise',         desc: 'Warm golden sunrise gradient',      icon: '🌅' },
  { id: 'moonrise',       label: 'Moonrise',        desc: 'Silver moonrise glow',              icon: '🌙' },
  { id: 'startrail',      label: 'Star Trail',      desc: 'Long exposure star trails',         icon: '🌟' },
] as const;

// ── Combined 500+ arrays (base + extra data) ─────────────────────────────
const _dedup = <T extends { id: string }>(arr: T[]): T[] => {
  const seen = new Set<string>();
  return arr.filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
};
export const ALL_APP_THEMES = _dedup([...APP_THEMES, ...THEMES_EXTRA]);
export const ALL_RGB_MODES = _dedup([...RGB_MODES, ...RGB_MODES_EXTRA]);
export const ALL_BACKGROUND_EFFECTS = _dedup([...BACKGROUND_EFFECTS, ...BACKGROUNDS_EXTRA]);
export const ALL_TYPING_MODES_LIST = [
  'free','lesson','word','sentence','paragraph','numbers','custom','timed',
  'quotes','code','poetry','tongue-twisters','movies','programming','science','fun-facts',
  ...TYPING_MODES_EXTRA,
];

export const MUSICAL_SCALES = [
  { id: 'chromatic',   label: 'Chromatic',   desc: 'All 12 notes', semitones: [0,1,2,3,4,5,6,7,8,9,10,11] },
  { id: 'major',       label: 'Major',       desc: 'Happy, bright',  semitones: [0,2,4,5,7,9,11] },
  { id: 'minor',       label: 'Minor',       desc: 'Dark, emotional', semitones: [0,2,3,5,7,8,10] },
  { id: 'pentatonic',  label: 'Pentatonic',  desc: 'Eastern, melodic', semitones: [0,2,4,7,9] },
  { id: 'blues',       label: 'Blues',       desc: 'Soulful, gritty',  semitones: [0,3,5,6,7,10] },
  { id: 'dorian',      label: 'Dorian',      desc: 'Modal, jazzy',    semitones: [0,2,3,5,7,9,10] },
  { id: 'mixolydian',  label: 'Mixolydian',  desc: 'Rock, folk',      semitones: [0,2,4,5,7,9,10] },
  { id: 'lydian',      label: 'Lydian',      desc: 'Ethereal, dreamy', semitones: [0,2,4,6,7,9,11] },
  { id: 'phrygian',    label: 'Phrygian',    desc: 'Spanish, flamenco', semitones: [0,1,3,5,7,8,10] },
  { id: 'whole-tone',        label: 'Whole Tone',       desc: 'Impressionist, hazy',    semitones: [0,2,4,6,8,10] },
  { id: 'harmonic-minor',    label: 'Harmonic Minor',   desc: 'Classical, exotic',      semitones: [0,2,3,5,7,8,11] },
  { id: 'melodic-minor',     label: 'Melodic Minor',    desc: 'Jazz, smooth',           semitones: [0,2,3,5,7,9,11] },
  { id: 'minor-pentatonic',  label: 'Minor Pentatonic', desc: 'Rock, blues guitar',     semitones: [0,3,5,7,10] },
  { id: 'major-pentatonic',  label: 'Major Pentatonic', desc: 'Country, folk bright',   semitones: [0,2,4,7,9] },
  { id: 'locrian',           label: 'Locrian',          desc: 'Unstable, dissonant',    semitones: [0,1,3,5,6,8,10] },
  { id: 'aeolian',           label: 'Aeolian',          desc: 'Natural minor, classic', semitones: [0,2,3,5,7,8,10] },
  { id: 'ionian',            label: 'Ionian',           desc: 'Standard major scale',   semitones: [0,2,4,5,7,9,11] },
  { id: 'japanese',          label: 'Japanese',         desc: 'In scale, traditional',  semitones: [0,1,5,7,8] },
  { id: 'arabic',            label: 'Arabic',           desc: 'Exotic Middle Eastern',  semitones: [0,2,3,6,7,8,11] },
  { id: 'hungarian-minor',   label: 'Hungarian Minor',  desc: 'Eastern European',       semitones: [0,2,3,6,7,8,11] },
  { id: 'hirajoshi',         label: 'Hirajoshi',        desc: 'Japanese koto scale',    semitones: [0,2,3,7,8] },
  { id: 'iwato',             label: 'Iwato',            desc: 'Japanese Zen scale',     semitones: [0,1,5,6,10] },
  { id: 'enigmatic',         label: 'Enigmatic',        desc: 'Verdi mysterious scale',  semitones: [0,1,4,6,8,10,11] },
  { id: 'double-harmonic',   label: 'Double Harmonic',  desc: 'Byzantine, Flamenco',    semitones: [0,1,4,5,7,8,11] },
  { id: 'neapolitan-major',  label: 'Neapolitan Major', desc: 'Italian classical',       semitones: [0,1,3,5,7,9,11] },
  { id: 'prometheus',        label: 'Prometheus',       desc: 'Scriabin mystic chord',  semitones: [0,2,4,6,9,10] },
  { id: 'augmented',         label: 'Augmented',        desc: 'Symmetrical augmented',  semitones: [0,3,4,7,8,11] },
  { id: 'diminished',        label: 'Diminished',       desc: 'Symmetrical diminished',  semitones: [0,2,3,5,6,8,9,11] },
  { id: 'octatonic',         label: 'Octatonic',        desc: '8-tone symmetrical',     semitones: [0,1,3,4,6,7,9,10] },
];

export type CursorStyle = 'line' | 'block' | 'underscore' | 'beam' | 'none';
export type TypingFont = 'mono' | 'sans' | 'retro' | 'orbitron' | 'vt323' | 'ubuntu' | 'fira' | 'space';
export type KeyShape = 'rounded' | 'square' | 'pill' | 'sharp' | 'gem';
export type KeyPressEffect = 'ripple' | 'bounce' | 'scale' | 'pop' | 'glow' | 'wobble' | 'shockwave' | 'none';
export type GradientStyle = 'radial' | 'linear-h' | 'linear-v' | 'diagonal' | 'none';
export type KeyBorderStyle = 'solid' | 'glow' | 'double' | 'none';
export type KeyLabelStyle = 'key' | 'note' | 'finger' | 'chord' | 'none';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert' | 'master';
export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
export type MetronomeSound = 'click' | 'beep' | 'wood' | 'cowbell' | 'rim';
export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type ProgressBarStyle = 'line' | 'ring' | 'dots' | 'none';
export type NoteVisualizerStyle = 'bubbles' | 'sparks' | 'notes' | 'rings' | 'lines' | 'petals';
export type WpmChartStyle = 'line' | 'bar' | 'area' | 'dots';
export type AchievementPosition = 'top-right' | 'top-left' | 'bottom-right';
export type ChordVoicing = 'basic' | 'jazz' | 'power' | 'spread';
export type FpsTarget = 'max' | '60' | '30';
export type NoteOverlapBehavior = 'stop' | 'overlap' | 'fade';
export type KeyboardAlignment = 'left' | 'center' | 'right';
export type ActiveProfile = 0 | 1 | 2;

interface AppState {
  // Visual Settings
  rgbEnabled: boolean;
  rainbowModeEnabled: boolean;
  glowIntensity: number;
  animationSpeed: number;
  fadeDuration: number;
  visualsEnabled: boolean;
  rgbMode: RgbMode;
  rgbCustomColor: string;
  keyOpacity: number;
  showNoteLabels: boolean;
  backgroundEffect: BackgroundEffect;
  theme: AppTheme;

  // Audio Settings
  volume: number;
  soundCategory: SoundCategory;
  metronomeEnabled: boolean;
  bpm: number;
  reverbEnabled: boolean;
  delayEnabled: boolean;
  chorusEnabled: boolean;
  distortionEnabled: boolean;
  compressionEnabled: boolean;
  masterPitch: number;
  octaveShift: number;
  musicalScale: string;
  scaleEnabled: boolean;

  // Keyboard Settings
  keySize: number;
  showHeatmap: boolean;
  keyHeatmap: Record<string, number>;
  heatmapMax: number;

  // Accessibility
  highContrast: boolean;
  reduceMotion: boolean;

  // Typing Engine
  typingMode: TypingMode;
  targetText: string;
  typedText: string;
  startTime: number | null;
  errors: number;
  correctChars: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  lessonNumber: number;
  wordIndex: number;
  wordList: string[];
  timedDuration: number;
  timedTimeLeft: number;
  customText: string;
  sessionComplete: boolean;
  sprintDuration: number;

  // Recording
  isRecording: boolean;
  recordedEvents: RecordingEvent[];
  isPlaying: boolean;
  playbackSpeed: number;
  loopEnabled: boolean;
  recordingDuration: number;
  recordingsCount: number;

  // RGB
  rgbPhase: number;
  rainbowIndex: number;
  activeKeys: Set<string>;

  // Gamification — Personal Records
  bestWpm: number;
  bestAccuracy: number;
  bestTimedWpm: number;
  totalKeystrokes: number;
  totalSessions: number;
  totalWordsTyped: number;
  totalNotesPlayed: number;
  modesUsed: string[];
  lessonsCompleted: number[];
  xp: number;
  sessionHistory: SessionRecord[];

  // Achievements
  unlockedAchievements: string[];
  pendingAchievement: string | null;

  // Daily Goals
  dailyGoalWpm: number;
  dailyGoalKeystrokes: number;
  lastPlayDate: string;
  dailyStreak: number;
  longestStreak: number;
  dailyKeystrokesToday: number;
  dailySessionsToday: number;

  // UI / Feature Toggles
  showWelcome: boolean;
  focusMode: boolean;
  noteVisualizerEnabled: boolean;
  showWpmChart: boolean;
  wpmHistory: number[];
  cursorStyle: CursorStyle;
  typingFont: TypingFont;
  confettiEnabled: boolean;
  autoReset: boolean;
  showWordCount: boolean;
  performanceMode: boolean;
  autoPerformanceMode: boolean;

  // ── NEW: Advanced Visual ────────────────────────────────────────────────
  keyShape: KeyShape;
  keyPressEffect: KeyPressEffect;
  rgbBrightness: number;
  rgbSaturation: number;
  rgbAnimSpeed: number;
  bgBlurAmount: number;
  bgEffectSpeed: number;
  bgEffectOpacity: number;
  particleDensity: number;
  particleSpeed: number;
  keyGlowSpread: number;
  keyGlowBlur: number;
  gradientStyle: GradientStyle;
  keyBorderStyle: KeyBorderStyle;
  focusModeOpacity: number;
  topBarVisible: boolean;
  keyLabelStyle: KeyLabelStyle;
  customAccentColor: string;
  customBgColor: string;
  useCustomColors: boolean;
  keyShimmer: boolean;
  keyboardPerspective: number;
  keyDepth: number;
  keyShadowIntensity: number;
  keySpacing: number;

  // ── NEW: Advanced Audio ─────────────────────────────────────────────────
  eqBass: number;
  eqMid: number;
  eqTreble: number;
  stereoWidth: number;
  delayTime: number;
  delayFeedback: number;
  reverbAmount: number;
  reverbRoomSize: number;
  attackTime: number;
  releaseTime: number;
  polyphonyLimit: number;
  velocitySensitivity: number;
  metronomeSound: MetronomeSound;
  metronomeAccent: boolean;
  errorSoundEnabled: boolean;
  successSoundEnabled: boolean;
  ambientVolume: number;
  waveformType: WaveformType;
  noteDurationMult: number;
  audioLatencyCompensation: number;

  // ── NEW: Typing UX ──────────────────────────────────────────────────────
  difficultyLevel: DifficultyLevel;
  wordPoolSize: number;
  autoAdvanceLesson: boolean;
  breakReminderInterval: number;
  typingLineHeight: number;
  typingLetterSpacing: number;
  progressBarStyle: ProgressBarStyle;
  showWpmStat: boolean;
  showCpmStat: boolean;
  showAccuracyStat: boolean;
  showErrorsStat: boolean;
  showTimerStat: boolean;
  autoSaveSession: boolean;
  showWordNumber: boolean;
  keyboardAlignment: KeyboardAlignment;

  // ── NEW: Accessibility ──────────────────────────────────────────────────
  dyslexiaFont: boolean;
  largeTextMode: boolean;
  colorBlindMode: ColorBlindMode;
  blindMode: boolean;
  showFingerGuide: boolean;
  mirrorKeyboard: boolean;

  // ── NEW: Musical ────────────────────────────────────────────────────────
  chordMode: boolean;
  arpeggioMode: boolean;
  sustainMode: boolean;
  glideMode: boolean;
  droneNote: boolean;
  scaleLock: boolean;
  panningEnabled: boolean;
  glideSpeed: number;
  arpeggioRate: number;
  chordVoicing: ChordVoicing;

  // ── NEW: UI Features ────────────────────────────────────────────────────
  wpmChartStyle: WpmChartStyle;
  wpmChartPoints: number;
  achievementDuration: number;
  achievementPosition: AchievementPosition;
  achievementSoundEnabled: boolean;
  heatmapOpacity: number;
  heatmapDecay: boolean;
  noteVisualizerStyle: NoteVisualizerStyle;
  noteVisualizerSpeed: number;
  noteVisualizerDensity: number;
  showPrevSessionComparison: boolean;
  statsColumns: 1 | 2;
  activeProfile: ActiveProfile;
  sessionHistoryLength: number;
  transportDockVisible: boolean;

  // ── NEW: Platform Performance ───────────────────────────────────────────
  fpsTarget: FpsTarget;
  adaptiveQuality: boolean;
  gpuAcceleration: boolean;
  rafThrottling: boolean;
  debounceDelay: number;
  cssContainment: boolean;
  showFpsCounter: boolean;
  showMemoryUsage: boolean;
  audioBufferSize: number;
  audioSuspendOnIdle: boolean;
  audioSuspendDelay: number;
  noteOverlapBehavior: NoteOverlapBehavior;
  memoryOptimization: boolean;
  storageOptimization: boolean;
  offlineMode: boolean;
  networkAdaptive: boolean;
  reducedDataMode: boolean;
  hapticEnabled: boolean;
  touchOptimization: boolean;
  swipeNavigation: boolean;
  pinchZoom: boolean;
  pageVisibilityPause: boolean;
  batteryOptimization: boolean;
  wakeLock: boolean;
  analyticsEnabled: boolean;
  showKeyboardShortcuts: boolean;

  // ── NEW: Productivity & Enhanced ─────────────────────────────────────────
  blindTypingMode: boolean;
  ghostMode: boolean;
  pomodoroEnabled: boolean;
  pomodoroWorkMin: number;
  pomodoroBreakMin: number;
  pomodoroSessions: number;
  dailyChallengeMode: boolean;
  quickPreset: string;
  // ── Extended Visual Settings ────────────────────────────────────────────────
  keyGlowColor: string;
  keyGlowRadius: number;
  keyGlowPulse: boolean;
  backgroundOpacity: number;
  backgroundBlur: number;
  backgroundSaturation: number;
  backgroundContrast: number;
  themeAccentOpacity: number;
  glassEffect: boolean;
  glassBlur: number;
  glassOpacity: number;
  neonBorderEnabled: boolean;
  neonBorderWidth: number;
  scanLineEnabled: boolean;
  vhsEnabled: boolean;
  filmGrainEnabled: boolean;
  filmGrainIntensity: number;
  bloomEnabled: boolean;
  bloomStrength: number;
  chromaticAberration: boolean;
  vignetteEnabled: boolean;
  vignetteStrength: number;
  pixelateEffect: boolean;
  pixelateSize: number;
  invertColors: boolean;
  grayscaleEnabled: boolean;
  sepiaEnabled: boolean;
  hueRotate: number;
  brightnessAdjust: number;
  // ── Extended Audio Settings ─────────────────────────────────────────────────
  eqBand1: number;
  eqBand2: number;
  eqBand3: number;
  eqBand4: number;
  eqBand5: number;
  eqBand6: number;
  eqBand7: number;
  reverbSize: number;
  reverbWet: number;
  delayWet: number;
  chorusRate: number;
  chorusDepth: number;
  flangerEnabled: boolean;
  flangerRate: number;
  phaserEnabled: boolean;
  phaserRate: number;
  tremoloEnabled: boolean;
  tremoloRate: number;
  autoTuneEnabled: boolean;
  vocodeEnabled: boolean;
  stereoWidthEnabled: boolean;
  bassBoostEnabled: boolean;
  bassBoostGain: number;
  highPassEnabled: boolean;
  lowPassEnabled: boolean;
  highPassFreq: number;
  lowPassFreq: number;
  bitCrusherEnabled: boolean;
  bitCrusherBits: number;
  // ── Extended Keyboard Settings ──────────────────────────────────────────────
  keyboardLayout: string;
  keyboardSkin: string;
  keyHighlightMode: string;
  keyColorScheme: string;
  showKeyNumbers: boolean;
  showChordNames: boolean;
  showScaleDegrees: boolean;
  showOctaveNumbers: boolean;
  keyAnimationTrail: boolean;
  keyGhostEffect: boolean;
  keyClickSound: boolean;
  keyCapColor: string;
  keyStemColor: string;
  key3dDepth: number;
  keyboardTilt: number;
  keyboardZoom: number;
  // ── Extended Typing Features ────────────────────────────────────────────────
  targetWpm: number;
  targetAccuracy: number;
  autoPauseOnError: boolean;
  errorHighlightDuration: number;
  smoothScrolling: boolean;
  wordWrap: boolean;
  showCurrentWordBox: boolean;
  showWordHistory: boolean;
  caretBlink: boolean;
  caretBlinkRate: number;
  caretWidth: number;
  typingMode3d: boolean;
  punctuationEnabled: boolean;
  numbersInText: boolean;
  capitalLetters: boolean;
  emojiMode: boolean;
  spellCheckEnabled: boolean;
  autoCorrectEnabled: boolean;
  wordPrediction: boolean;
  typingPaceTracker: boolean;
  consistencyScore: boolean;
  // ── Challenges ──────────────────────────────────────────────────────────────
  dailyChallengeDone: boolean;
  weeklyChallengeMode: boolean;
  challengeStreak: number;
  challengePoints: number;
  activeChallenges: string[];
  completedChallenges: string[];
  challengeNotifications: boolean;
  challengeDifficulty: string;
  raceMode: boolean;
  raceTarget: number;
  // ── Community / Social ──────────────────────────────────────────────────────
  showLeaderboard: boolean;
  leaderboardScope: string;
  shareResults: boolean;
  publicProfile: boolean;
  playerTag: string;
  playerBio: string;
  playerCountry: string;
  playerAvatarId: number;
  friendsEnabled: boolean;
  // ── Labs / Experimental ─────────────────────────────────────────────────────
  aiAssistEnabled: boolean;
  aiWpmPrediction: boolean;
  aiSuggestions: boolean;
  mlAccuracyModel: boolean;
  biometricFeedback: boolean;
  eyeTrackingEnabled: boolean;
  voiceTypingEnabled: boolean;
  motionControlEnabled: boolean;
  brainwaveEnabled: boolean;
  quantumRngMode: boolean;
  // ── UI / Layout ─────────────────────────────────────────────────────────────
  sidebarCollapsed: boolean;
  compactMode: boolean;
  ultraWideLayout: boolean;
  floatingPanels: boolean;
  panelSnapping: boolean;
  customPanelLayout: string;
  showWelcomeScreen: boolean;
  showTutorial: boolean;
  showContextMenu: boolean;
  rightClickMenu: boolean;
  dockPosition: string;
  statusBarEnabled: boolean;
  toolbarEnabled: boolean;
  breadcrumbsEnabled: boolean;
  notificationsEnabled: boolean;
  soundNotifications: boolean;
  desktopNotifications: boolean;
  popupStyle: string;
  animationPreset: string;
  transitionStyle: string;
  // ── Profiles Extended ───────────────────────────────────────────────────────
  profileName0: string;
  profileName1: string;
  profileName2: string;
  profileColor0: string;
  profileColor1: string;
  profileColor2: string;
  profileIcon0: string;
  profileIcon1: string;
  profileIcon2: string;

  // Actions
  setTheme: (t: AppTheme) => void;
  setRgbEnabled: (v: boolean) => void;
  setRainbowEnabled: (v: boolean) => void;
  setGlowIntensity: (v: number) => void;
  setAnimationSpeed: (v: number) => void;
  setFadeDuration: (v: number) => void;
  setVisualsEnabled: (v: boolean) => void;
  setRgbMode: (mode: RgbMode) => void;
  setRgbCustomColor: (color: string) => void;
  setKeyOpacity: (v: number) => void;
  setShowNoteLabels: (v: boolean) => void;
  setBackgroundEffect: (v: BackgroundEffect) => void;
  setVolume: (v: number) => void;
  setSoundCategory: (v: SoundCategory) => void;
  setMetronome: (v: boolean) => void;
  setBpm: (v: number) => void;
  setEffect: (name: string, v: boolean) => void;
  setMasterPitch: (v: number) => void;
  setOctaveShift: (v: number) => void;
  setMusicalScale: (v: string) => void;
  setScaleEnabled: (v: boolean) => void;
  setKeySize: (v: number) => void;
  setShowHeatmap: (v: boolean) => void;
  clearHeatmap: () => void;
  setHighContrast: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setTypingMode: (m: TypingMode) => void;
  setCustomText: (t: string) => void;
  setTimedDuration: (s: number) => void;
  setLessonNumber: (n: number) => void;
  resetTyping: () => void;
  nextWord: () => void;
  pressKey: (code: string) => void;
  releaseKey: (code: string) => void;
  startRecording: () => void;
  stopRecording: () => void;
  playRecording: () => void;
  stopPlayback: () => void;
  setPlaybackSpeed: (v: number) => void;
  setLoop: (v: boolean) => void;
  loadRecording: (events: RecordingEvent[]) => void;
  getNextRainbowColor: () => string;
  setRgbPhase: (phase: number) => void;
  tickTimer: () => void;
  setDailyGoalWpm: (v: number) => void;
  setDailyGoalKeystrokes: (v: number) => void;
  dismissWelcome: () => void;
  clearPendingAchievement: () => void;
  addXp: (amount: number) => void;
  setFocusMode: (v: boolean) => void;
  setNoteVisualizerEnabled: (v: boolean) => void;
  setShowWpmChart: (v: boolean) => void;
  setCursorStyle: (v: CursorStyle) => void;
  setTypingFont: (v: TypingFont) => void;
  setConfettiEnabled: (v: boolean) => void;
  setAutoReset: (v: boolean) => void;
  setShowWordCount: (v: boolean) => void;
  setSprintDuration: (v: number) => void;
  setPerformanceMode: (v: boolean) => void;
  setAutoPerformanceMode: (v: boolean) => void;

  // ── NEW setters ──────────────────────────────────────────────────────────
  setKeyShape: (v: KeyShape) => void;
  setKeyPressEffect: (v: KeyPressEffect) => void;
  setRgbBrightness: (v: number) => void;
  setRgbSaturation: (v: number) => void;
  setRgbAnimSpeed: (v: number) => void;
  setBgBlurAmount: (v: number) => void;
  setBgEffectSpeed: (v: number) => void;
  setBgEffectOpacity: (v: number) => void;
  setParticleDensity: (v: number) => void;
  setParticleSpeed: (v: number) => void;
  setKeyGlowSpread: (v: number) => void;
  setKeyGlowBlur: (v: number) => void;
  setGradientStyle: (v: GradientStyle) => void;
  setKeyBorderStyle: (v: KeyBorderStyle) => void;
  setFocusModeOpacity: (v: number) => void;
  setTopBarVisible: (v: boolean) => void;
  setKeyLabelStyle: (v: KeyLabelStyle) => void;
  setCustomAccentColor: (v: string) => void;
  setCustomBgColor: (v: string) => void;
  setUseCustomColors: (v: boolean) => void;
  setKeyShimmer: (v: boolean) => void;
  setKeyboardPerspective: (v: number) => void;
  setKeyDepth: (v: number) => void;
  setKeyShadowIntensity: (v: number) => void;
  setKeySpacing: (v: number) => void;
  setEqBass: (v: number) => void;
  setEqMid: (v: number) => void;
  setEqTreble: (v: number) => void;
  setStereoWidth: (v: number) => void;
  setDelayTime: (v: number) => void;
  setDelayFeedback: (v: number) => void;
  setReverbAmount: (v: number) => void;
  setReverbRoomSize: (v: number) => void;
  setAttackTime: (v: number) => void;
  setReleaseTime: (v: number) => void;
  setPolyphonyLimit: (v: number) => void;
  setVelocitySensitivity: (v: number) => void;
  setMetronomeSound: (v: MetronomeSound) => void;
  setMetronomeAccent: (v: boolean) => void;
  setErrorSoundEnabled: (v: boolean) => void;
  setSuccessSoundEnabled: (v: boolean) => void;
  setAmbientVolume: (v: number) => void;
  setWaveformType: (v: WaveformType) => void;
  setNoteDurationMult: (v: number) => void;
  setAudioLatencyCompensation: (v: number) => void;
  setDifficultyLevel: (v: DifficultyLevel) => void;
  setWordPoolSize: (v: number) => void;
  setAutoAdvanceLesson: (v: boolean) => void;
  setBreakReminderInterval: (v: number) => void;
  setTypingLineHeight: (v: number) => void;
  setTypingLetterSpacing: (v: number) => void;
  setProgressBarStyle: (v: ProgressBarStyle) => void;
  setShowWpmStat: (v: boolean) => void;
  setShowCpmStat: (v: boolean) => void;
  setShowAccuracyStat: (v: boolean) => void;
  setShowErrorsStat: (v: boolean) => void;
  setShowTimerStat: (v: boolean) => void;
  setAutoSaveSession: (v: boolean) => void;
  setShowWordNumber: (v: boolean) => void;
  setKeyboardAlignment: (v: KeyboardAlignment) => void;
  setDyslexiaFont: (v: boolean) => void;
  setLargeTextMode: (v: boolean) => void;
  setColorBlindMode: (v: ColorBlindMode) => void;
  setBlindMode: (v: boolean) => void;
  setShowFingerGuide: (v: boolean) => void;
  setMirrorKeyboard: (v: boolean) => void;
  setChordMode: (v: boolean) => void;
  setArpeggioMode: (v: boolean) => void;
  setSustainMode: (v: boolean) => void;
  setGlideMode: (v: boolean) => void;
  setDroneNote: (v: boolean) => void;
  setScaleLock: (v: boolean) => void;
  setPanningEnabled: (v: boolean) => void;
  setGlideSpeed: (v: number) => void;
  setArpeggioRate: (v: number) => void;
  setChordVoicing: (v: ChordVoicing) => void;
  setWpmChartStyle: (v: WpmChartStyle) => void;
  setWpmChartPoints: (v: number) => void;
  setAchievementDuration: (v: number) => void;
  setAchievementPosition: (v: AchievementPosition) => void;
  setAchievementSoundEnabled: (v: boolean) => void;
  setHeatmapOpacity: (v: number) => void;
  setHeatmapDecay: (v: boolean) => void;
  setNoteVisualizerStyle: (v: NoteVisualizerStyle) => void;
  setNoteVisualizerSpeed: (v: number) => void;
  setNoteVisualizerDensity: (v: number) => void;
  setShowPrevSessionComparison: (v: boolean) => void;
  setStatsColumns: (v: 1 | 2) => void;
  setActiveProfile: (v: ActiveProfile) => void;
  setSessionHistoryLength: (v: number) => void;
  setTransportDockVisible: (v: boolean) => void;
  setFpsTarget: (v: FpsTarget) => void;
  setAdaptiveQuality: (v: boolean) => void;
  setGpuAcceleration: (v: boolean) => void;
  setRafThrottling: (v: boolean) => void;
  setDebounceDelay: (v: number) => void;
  setCssContainment: (v: boolean) => void;
  setShowFpsCounter: (v: boolean) => void;
  setShowMemoryUsage: (v: boolean) => void;
  setAudioBufferSize: (v: number) => void;
  setAudioSuspendOnIdle: (v: boolean) => void;
  setAudioSuspendDelay: (v: number) => void;
  setNoteOverlapBehavior: (v: NoteOverlapBehavior) => void;
  setMemoryOptimization: (v: boolean) => void;
  setStorageOptimization: (v: boolean) => void;
  setOfflineMode: (v: boolean) => void;
  setNetworkAdaptive: (v: boolean) => void;
  setReducedDataMode: (v: boolean) => void;
  setHapticEnabled: (v: boolean) => void;
  setTouchOptimization: (v: boolean) => void;
  setSwipeNavigation: (v: boolean) => void;
  setPinchZoom: (v: boolean) => void;
  setPageVisibilityPause: (v: boolean) => void;
  setBatteryOptimization: (v: boolean) => void;
  setWakeLock: (v: boolean) => void;
  setAnalyticsEnabled: (v: boolean) => void;
  setShowKeyboardShortcuts: (v: boolean) => void;
  setBlindTypingMode: (v: boolean) => void;
  setGhostMode: (v: boolean) => void;
  setPomodoroEnabled: (v: boolean) => void;
  setPomodoroWorkMin: (v: number) => void;
  setPomodoroBreakMin: (v: number) => void;
  setPomodoroSessions: (v: number) => void;
  setDailyChallengeMode: (v: boolean) => void;
  setQuickPreset: (v: string) => void;
  // ── Extended Setters ───────────────────────────────────────────────────────
  setKeyGlowColor: (v: string) => void; setKeyGlowRadius: (v: number) => void;
  setKeyGlowPulse: (v: boolean) => void; setBackgroundOpacity: (v: number) => void;
  setBackgroundBlur: (v: number) => void; setBackgroundSaturation: (v: number) => void;
  setBackgroundContrast: (v: number) => void; setThemeAccentOpacity: (v: number) => void;
  setGlassEffect: (v: boolean) => void; setGlassBlur: (v: number) => void;
  setGlassOpacity: (v: number) => void; setNeonBorderEnabled: (v: boolean) => void;
  setNeonBorderWidth: (v: number) => void; setScanLineEnabled: (v: boolean) => void;
  setVhsEnabled: (v: boolean) => void; setFilmGrainEnabled: (v: boolean) => void;
  setFilmGrainIntensity: (v: number) => void; setBloomEnabled: (v: boolean) => void;
  setBloomStrength: (v: number) => void; setChromaticAberration: (v: boolean) => void;
  setVignetteEnabled: (v: boolean) => void; setVignetteStrength: (v: number) => void;
  setPixelateEffect: (v: boolean) => void; setPixelateSize: (v: number) => void;
  setInvertColors: (v: boolean) => void; setGrayscaleEnabled: (v: boolean) => void;
  setSepiaEnabled: (v: boolean) => void; setHueRotate: (v: number) => void;
  setBrightnessAdjust: (v: number) => void;
  setEqBand1: (v: number) => void; setEqBand2: (v: number) => void;
  setEqBand3: (v: number) => void; setEqBand4: (v: number) => void;
  setEqBand5: (v: number) => void; setEqBand6: (v: number) => void;
  setEqBand7: (v: number) => void;
  setReverbSize: (v: number) => void; setReverbWet: (v: number) => void;
  setDelayWet: (v: number) => void; setChorusRate: (v: number) => void;
  setChorusDepth: (v: number) => void; setFlangerEnabled: (v: boolean) => void;
  setFlangerRate: (v: number) => void; setPhaserEnabled: (v: boolean) => void;
  setPhaserRate: (v: number) => void; setTremoloEnabled: (v: boolean) => void;
  setTremoloRate: (v: number) => void; setAutoTuneEnabled: (v: boolean) => void;
  setVocodeEnabled: (v: boolean) => void; setStereoWidthEnabled: (v: boolean) => void;
  setBassBoostEnabled: (v: boolean) => void;
  setBassBoostGain: (v: number) => void; setHighPassEnabled: (v: boolean) => void;
  setLowPassEnabled: (v: boolean) => void; setHighPassFreq: (v: number) => void;
  setLowPassFreq: (v: number) => void; setBitCrusherEnabled: (v: boolean) => void;
  setBitCrusherBits: (v: number) => void;
  setKeyboardLayout: (v: string) => void; setKeyboardSkin: (v: string) => void;
  setKeyHighlightMode: (v: string) => void; setKeyColorScheme: (v: string) => void;
  setShowKeyNumbers: (v: boolean) => void; setShowChordNames: (v: boolean) => void;
  setShowScaleDegrees: (v: boolean) => void; setShowOctaveNumbers: (v: boolean) => void;
  setKeyAnimationTrail: (v: boolean) => void; setKeyGhostEffect: (v: boolean) => void;
  setKeyClickSound: (v: boolean) => void; setKeyCapColor: (v: string) => void;
  setKeyStemColor: (v: string) => void;
  setKey3dDepth: (v: number) => void; setKeyboardTilt: (v: number) => void;
  setKeyboardZoom: (v: number) => void;
  setTargetWpm: (v: number) => void; setTargetAccuracy: (v: number) => void;
  setAutoPauseOnError: (v: boolean) => void; setErrorHighlightDuration: (v: number) => void;
  setSmoothScrolling: (v: boolean) => void; setWordWrap: (v: boolean) => void;
  setShowCurrentWordBox: (v: boolean) => void; setShowWordHistory: (v: boolean) => void;
  setCaretBlink: (v: boolean) => void; setCaretBlinkRate: (v: number) => void;
  setCaretWidth: (v: number) => void; setTypingMode3d: (v: boolean) => void;
  setPunctuationEnabled: (v: boolean) => void; setNumbersInText: (v: boolean) => void;
  setCapitalLetters: (v: boolean) => void; setEmojiMode: (v: boolean) => void;
  setSpellCheckEnabled: (v: boolean) => void; setAutoCorrectEnabled: (v: boolean) => void;
  setWordPrediction: (v: boolean) => void; setTypingPaceTracker: (v: boolean) => void;
  setConsistencyScore: (v: boolean) => void;
  setDailyChallengeDone: (v: boolean) => void; setWeeklyChallengeMode: (v: boolean) => void;
  setChallengeDifficulty: (v: string) => void; setRaceMode: (v: boolean) => void;
  setRaceTarget: (v: number) => void; setChallengeNotifications: (v: boolean) => void;
  setShowLeaderboard: (v: boolean) => void; setLeaderboardScope: (v: string) => void;
  setShareResults: (v: boolean) => void; setPublicProfile: (v: boolean) => void;
  setPlayerTag: (v: string) => void; setPlayerBio: (v: string) => void;
  setPlayerCountry: (v: string) => void; setPlayerAvatarId: (v: number) => void;
  setFriendsEnabled: (v: boolean) => void;
  setAiAssistEnabled: (v: boolean) => void; setAiWpmPrediction: (v: boolean) => void;
  setAiSuggestions: (v: boolean) => void; setMlAccuracyModel: (v: boolean) => void;
  setBiometricFeedback: (v: boolean) => void; setEyeTrackingEnabled: (v: boolean) => void;
  setVoiceTypingEnabled: (v: boolean) => void; setMotionControlEnabled: (v: boolean) => void;
  setBrainwaveEnabled: (v: boolean) => void; setQuantumRngMode: (v: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void; setCompactMode: (v: boolean) => void;
  setUltraWideLayout: (v: boolean) => void; setFloatingPanels: (v: boolean) => void;
  setPanelSnapping: (v: boolean) => void; setCustomPanelLayout: (v: string) => void;
  setShowWelcomeScreen: (v: boolean) => void; setShowTutorial: (v: boolean) => void;
  setShowContextMenu: (v: boolean) => void; setRightClickMenu: (v: boolean) => void;
  setDockPosition: (v: string) => void; setStatusBarEnabled: (v: boolean) => void;
  setToolbarEnabled: (v: boolean) => void; setBreadcrumbsEnabled: (v: boolean) => void;
  setNotificationsEnabled: (v: boolean) => void; setSoundNotifications: (v: boolean) => void;
  setDesktopNotifications: (v: boolean) => void; setPopupStyle: (v: string) => void;
  setAnimationPreset: (v: string) => void; setTransitionStyle: (v: string) => void;
  setProfileName0: (v: string) => void; setProfileName1: (v: string) => void;
  setProfileName2: (v: string) => void; setProfileColor0: (v: string) => void;
  setProfileColor1: (v: string) => void; setProfileColor2: (v: string) => void;
  setProfileIcon0: (v: string) => void; setProfileIcon1: (v: string) => void;
  setProfileIcon2: (v: string) => void;
  exportSettings: () => void;
  importSettings: (data: Record<string, unknown>) => void;
}

const _usedWordIndices = new Set<number>();

function pickFromPool(count: number): string[] {
  const total = TYPING_WORDS.length;
  if (_usedWordIndices.size > total * 0.8) _usedWordIndices.clear();
  const available: number[] = [];
  for (let i = 0; i < total; i++) if (!_usedWordIndices.has(i)) available.push(i);
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  const picked = available.slice(0, count);
  picked.forEach(idx => _usedWordIndices.add(idx));
  return picked.map(idx => TYPING_WORDS[idx]);
}

function buildModeWordList(mode: TypingMode, lesson: number, customText: string): string[] {
  if (mode === 'lesson') return (LESSON_TEXTS[lesson] || LESSON_TEXTS[1]).split(/\s+/).filter(Boolean);
  if (mode === 'numbers') return NUMBERS_TEXT.split(/\s+/).filter(Boolean);
  if (mode === 'custom') return (customText || 'type your custom text here').split(/\s+/).filter(Boolean);
  // Try content library for all named modes (80+ modes supported)
  const content = getContentForMode(mode);
  if (content.length > 0) {
    const shuffled = [...content].sort(() => Math.random() - 0.5);
    const words: string[] = [];
    for (const line of shuffled.slice(0, 18)) words.push(...line.split(/\s+/).filter(Boolean));
    return words.length > 0 ? words : pickFromPool(50);
  }
  const counts: Record<string, number> = { free: 40, word: 50, sentence: 30, paragraph: 60, timed: 120 };
  return pickFromPool(counts[mode] || 50);
}

function getInstrumentForKey(code: string, shiftHeld: boolean): string {
  if (shiftHeld && code.startsWith('Digit')) return 'flute';
  if (code.startsWith('Key')) return 'piano';
  if (code.startsWith('Digit')) return 'guitar';
  if (/^F([1-9]|1[012])$/.test(code)) return 'drums';
  if (['Minus','Equal','BracketLeft','BracketRight','Backslash','Semicolon','Quote','Comma','Period','Slash','Backquote'].includes(code)) return 'flute';
  if (code === 'Space') return 'bass';
  if (code === 'Enter' || code === 'NumpadEnter') return 'piano-chord';
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(code)) return 'synth';
  if (['ControlLeft','ControlRight','AltLeft','AltRight'].includes(code)) return 'pad';
  if (code.startsWith('Numpad') || code === 'NumpadAdd') return 'percussion';
  if (code === 'CapsLock') return 'violin';
  if (code === 'Tab') return 'trumpet';
  if (code === 'Delete') return 'organ';
  if (code === 'Insert') return 'saxophone';
  if (code === 'Home') return 'harpsichord';
  if (code === 'End') return 'electric-bass';
  if (code === 'PageUp') return 'accordion';
  if (code === 'PageDown') return 'french-horn';
  if (code === 'PrintScreen') return 'vocoder';
  if (code === 'ScrollLock') return 'glockenspiel';
  if (code === 'Pause') return 'theremin';
  if (code === 'NumLock') return 'acoustic-guitar';
  if (code === 'MetaLeft' || code === 'MetaRight') return 'vibraphone';
  return 'misc';
}

function codeToChar(code: string): string {
  if (code.startsWith('Key')) return code.charAt(3).toLowerCase();
  if (code === 'Space') return ' ';
  if (code === 'Enter') return '\n';
  if (code === 'Digit1') return '1'; if (code === 'Digit2') return '2';
  if (code === 'Digit3') return '3'; if (code === 'Digit4') return '4';
  if (code === 'Digit5') return '5'; if (code === 'Digit6') return '6';
  if (code === 'Digit7') return '7'; if (code === 'Digit8') return '8';
  if (code === 'Digit9') return '9'; if (code === 'Digit0') return '0';
  if (code === 'Period') return '.'; if (code === 'Comma') return ',';
  if (code === 'Slash') return '/'; if (code === 'Semicolon') return ';';
  if (code === 'Quote') return "'"; if (code === 'Minus') return '-';
  if (code === 'Equal') return '=';
  if (code === 'BracketLeft') return '['; if (code === 'BracketRight') return ']';
  if (code === 'Backslash') return '\\'; if (code === 'Backquote') return '`';
  return '';
}

function isPrintable(code: string): boolean {
  return code.startsWith('Key') || code.startsWith('Digit') ||
    ['Space', 'Period', 'Comma', 'Slash', 'Semicolon', 'Quote', 'Minus', 'Equal',
     'BracketLeft', 'BracketRight', 'Backslash', 'Backquote'].includes(code);
}

export const LESSON_TEXTS_EXPORT = LESSON_TEXTS;
export const LESSON_INSTRUCTIONS_EXPORT = LESSON_INSTRUCTIONS;

const _playbackTimerIds: ReturnType<typeof setTimeout>[] = [];
const POOL_MODES: TypingMode[] = ['free', 'word', 'sentence', 'paragraph', 'timed'];

function advanceWord(state: Pick<AppState, 'wordIndex' | 'wordList' | 'typingMode' | 'timedDuration' | 'correctChars'>): Partial<AppState> {
  const nextIdx = state.wordIndex + 1;
  if (POOL_MODES.includes(state.typingMode) && nextIdx >= state.wordList.length - 15) {
    const extraWords = pickFromPool(60);
    const extendedList = [...state.wordList, ...extraWords];
    return { wordList: extendedList, wordIndex: nextIdx, targetText: extendedList[nextIdx] || 'the', typedText: '' };
  }
  if (nextIdx >= state.wordList.length) return { sessionComplete: true };
  return { wordIndex: nextIdx, targetText: state.wordList[nextIdx], typedText: '' };
}

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

function checkAchievements(stats: AchievementStats, unlocked: string[]): string | null {
  for (const ach of ACHIEVEMENTS) {
    if (!unlocked.includes(ach.id) && ach.check(stats)) return ach.id;
  }
  return null;
}

const throttledStorage = (() => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingKey: string | null = null;
  let pendingValue: string | null = null;
  return {
    getItem: (name: string) => { try { return localStorage.getItem(name); } catch { return null; } },
    setItem: (name: string, value: string) => {
      pendingKey = name;
      pendingValue = value;
      if (!timer) {
        timer = setTimeout(() => {
          if (pendingKey && pendingValue !== null) {
            try { localStorage.setItem(pendingKey, pendingValue); } catch {}
          }
          timer = null;
          pendingKey = null;
          pendingValue = null;
        }, 1500);
      }
    },
    removeItem: (name: string) => { try { localStorage.removeItem(name); } catch {} },
  };
})();

let _lastAchievementCheckTime = 0;

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      const initWordList = buildModeWordList('free', 1, '');
      return {
        // Visual
        rgbEnabled: true,
        rainbowModeEnabled: true,
        glowIntensity: 85,
        animationSpeed: 1.0,
        fadeDuration: 300,
        visualsEnabled: true,
        rgbMode: 'wave' as RgbMode,
        rgbCustomColor: '#5f6bff',
        keyOpacity: 100,
        showNoteLabels: false,
        backgroundEffect: 'none' as BackgroundEffect,
        theme: 'aurora' as AppTheme,

        // Audio
        volume: 0.7,
        soundCategory: 'Realistic Sounds',
        metronomeEnabled: false,
        bpm: 120,
        reverbEnabled: false,
        delayEnabled: false,
        chorusEnabled: false,
        distortionEnabled: false,
        compressionEnabled: false,
        masterPitch: 0,
        octaveShift: 0,
        musicalScale: 'chromatic',
        scaleEnabled: false,

        // Keyboard
        keySize: 100,
        showHeatmap: false,
        keyHeatmap: {},
        heatmapMax: 0,

        // Accessibility
        highContrast: false,
        reduceMotion: false,

        // Typing
        typingMode: 'free',
        targetText: initWordList[0] || 'keyboard',
        typedText: '',
        startTime: null,
        errors: 0,
        correctChars: 0,
        wpm: 0,
        cpm: 0,
        accuracy: 100,
        lessonNumber: 1,
        wordIndex: 0,
        wordList: initWordList,
        timedDuration: 60,
        timedTimeLeft: 60,
        customText: '',
        sessionComplete: false,
        sprintDuration: 15,

        // Recording
        isRecording: false,
        recordedEvents: [],
        isPlaying: false,
        playbackSpeed: 1.0,
        loopEnabled: false,
        recordingDuration: 0,
        recordingsCount: 0,

        // RGB
        rgbPhase: 0,
        rainbowIndex: 0,
        activeKeys: new Set(),

        // Gamification
        bestWpm: 0,
        bestAccuracy: 100,
        bestTimedWpm: 0,
        totalKeystrokes: 0,
        totalSessions: 0,
        totalWordsTyped: 0,
        totalNotesPlayed: 0,
        modesUsed: ['free'],
        lessonsCompleted: [],
        xp: 0,
        sessionHistory: [],

        // Achievements
        unlockedAchievements: [],
        pendingAchievement: null,

        // Daily Goals
        dailyGoalWpm: 40,
        dailyGoalKeystrokes: 500,
        lastPlayDate: '',
        dailyStreak: 0,
        longestStreak: 0,
        dailyKeystrokesToday: 0,
        dailySessionsToday: 0,

        // UI / Feature Toggles
        showWelcome: true,
        focusMode: false,
        noteVisualizerEnabled: true,
        showWpmChart: true,
        wpmHistory: [],
        cursorStyle: 'line' as CursorStyle,
        typingFont: 'mono' as TypingFont,
        confettiEnabled: true,
        autoReset: false,
        showWordCount: true,
        performanceMode: false,
        autoPerformanceMode: true,

        // ── NEW: Advanced Visual ─────────────────────────────────────────────
        keyShape: 'rounded' as KeyShape,
        keyPressEffect: 'glow' as KeyPressEffect,
        rgbBrightness: 1.0,
        rgbSaturation: 1.0,
        rgbAnimSpeed: 1.0,
        bgBlurAmount: 0,
        bgEffectSpeed: 1.0,
        bgEffectOpacity: 0.8,
        particleDensity: 1.0,
        particleSpeed: 1.0,
        keyGlowSpread: 12,
        keyGlowBlur: 18,
        gradientStyle: 'radial' as GradientStyle,
        keyBorderStyle: 'solid' as KeyBorderStyle,
        focusModeOpacity: 0.15,
        topBarVisible: true,
        keyLabelStyle: 'key' as KeyLabelStyle,
        customAccentColor: '#8b5cf6',
        customBgColor: '#09090f',
        useCustomColors: false,
        keyShimmer: false,
        keyboardPerspective: 0,
        keyDepth: 0,
        keyShadowIntensity: 0.6,
        keySpacing: 1.0,

        // ── NEW: Advanced Audio ──────────────────────────────────────────────
        eqBass: 0,
        eqMid: 0,
        eqTreble: 0,
        stereoWidth: 0.5,
        delayTime: 0.3,
        delayFeedback: 0.35,
        reverbAmount: 0.4,
        reverbRoomSize: 0.5,
        attackTime: 0.01,
        releaseTime: 1.5,
        polyphonyLimit: 8,
        velocitySensitivity: 0.75,
        metronomeSound: 'click' as MetronomeSound,
        metronomeAccent: true,
        errorSoundEnabled: false,
        successSoundEnabled: true,
        ambientVolume: 0,
        waveformType: 'sine' as WaveformType,
        noteDurationMult: 1.0,
        audioLatencyCompensation: 0,

        // ── NEW: Typing UX ───────────────────────────────────────────────────
        difficultyLevel: 'intermediate' as DifficultyLevel,
        wordPoolSize: 50,
        autoAdvanceLesson: false,
        breakReminderInterval: 0,
        typingLineHeight: 1.6,
        typingLetterSpacing: 0,
        progressBarStyle: 'line' as ProgressBarStyle,
        showWpmStat: true,
        showCpmStat: true,
        showAccuracyStat: true,
        showErrorsStat: true,
        showTimerStat: true,
        autoSaveSession: true,
        showWordNumber: false,
        keyboardAlignment: 'center' as KeyboardAlignment,

        // ── NEW: Accessibility ────────────────────────────────────────────────
        dyslexiaFont: false,
        largeTextMode: false,
        colorBlindMode: 'none' as ColorBlindMode,
        blindMode: false,
        showFingerGuide: false,
        mirrorKeyboard: false,

        // ── NEW: Musical ──────────────────────────────────────────────────────
        chordMode: false,
        arpeggioMode: false,
        sustainMode: false,
        glideMode: false,
        droneNote: false,
        scaleLock: false,
        panningEnabled: false,
        glideSpeed: 0.05,
        arpeggioRate: 150,
        chordVoicing: 'basic' as ChordVoicing,

        // ── NEW: UI Features ──────────────────────────────────────────────────
        wpmChartStyle: 'line' as WpmChartStyle,
        wpmChartPoints: 20,
        achievementDuration: 4000,
        achievementPosition: 'top-right' as AchievementPosition,
        achievementSoundEnabled: true,
        heatmapOpacity: 0.7,
        heatmapDecay: false,
        noteVisualizerStyle: 'bubbles' as NoteVisualizerStyle,
        noteVisualizerSpeed: 1.0,
        noteVisualizerDensity: 1.0,
        showPrevSessionComparison: false,
        statsColumns: 2 as (1 | 2),
        activeProfile: 0 as ActiveProfile,
        sessionHistoryLength: 50,
        transportDockVisible: true,

        // ── NEW: Platform Performance ─────────────────────────────────────────
        fpsTarget: 'max' as FpsTarget,
        adaptiveQuality: true,
        gpuAcceleration: true,
        rafThrottling: false,
        debounceDelay: 16,
        cssContainment: true,
        showFpsCounter: false,
        showMemoryUsage: false,
        audioBufferSize: 512,
        audioSuspendOnIdle: true,
        audioSuspendDelay: 30,
        noteOverlapBehavior: 'overlap' as NoteOverlapBehavior,
        memoryOptimization: true,
        storageOptimization: true,
        offlineMode: false,
        networkAdaptive: false,
        reducedDataMode: false,
        hapticEnabled: false,
        touchOptimization: true,
        swipeNavigation: true,
        pinchZoom: true,
        pageVisibilityPause: true,
        batteryOptimization: true,
        wakeLock: false,
        analyticsEnabled: false,
        showKeyboardShortcuts: true,

        // ── NEW: Productivity & Enhanced ─────────────────────────────────────
        blindTypingMode: false,
        ghostMode: false,
        pomodoroEnabled: false,
        pomodoroWorkMin: 25,
        pomodoroBreakMin: 5,
        pomodoroSessions: 0,
        dailyChallengeMode: false,
        quickPreset: 'custom',
        // ── Extended Visual Settings ──────────────────────────────────────────
        keyGlowColor: '#8b5cf6', keyGlowRadius: 15, keyGlowPulse: false,
        backgroundOpacity: 100, backgroundBlur: 0, backgroundSaturation: 100,
        backgroundContrast: 100, themeAccentOpacity: 100,
        glassEffect: false, glassBlur: 10, glassOpacity: 20,
        neonBorderEnabled: false, neonBorderWidth: 1,
        scanLineEnabled: false, vhsEnabled: false,
        filmGrainEnabled: false, filmGrainIntensity: 20,
        bloomEnabled: false, bloomStrength: 30,
        chromaticAberration: false, vignetteEnabled: false, vignetteStrength: 30,
        pixelateEffect: false, pixelateSize: 4,
        invertColors: false, grayscaleEnabled: false, sepiaEnabled: false,
        hueRotate: 0, brightnessAdjust: 100,
        // ── Extended Audio Settings ───────────────────────────────────────────
        eqBand1: 0, eqBand2: 0, eqBand3: 0, eqBand4: 0,
        eqBand5: 0, eqBand6: 0, eqBand7: 0,
        reverbSize: 50, reverbWet: 30, delayWet: 30,
        chorusRate: 1.5, chorusDepth: 30,
        flangerEnabled: false, flangerRate: 0.5,
        phaserEnabled: false, phaserRate: 0.5,
        tremoloEnabled: false, tremoloRate: 4,
        autoTuneEnabled: false, vocodeEnabled: false,
        stereoWidthEnabled: false,
        bassBoostEnabled: false, bassBoostGain: 6,
        highPassEnabled: false, lowPassEnabled: false,
        highPassFreq: 200, lowPassFreq: 8000,
        bitCrusherEnabled: false, bitCrusherBits: 8,
        // ── Extended Keyboard Settings ────────────────────────────────────────
        keyboardLayout: 'qwerty', keyboardSkin: 'default',
        keyHighlightMode: 'active', keyColorScheme: 'theme',
        showKeyNumbers: false, showChordNames: false,
        showScaleDegrees: false, showOctaveNumbers: false,
        keyAnimationTrail: false, keyGhostEffect: false,
        keyClickSound: true, keyCapColor: '#1e1e2e', keyStemColor: '#8b5cf6',
        key3dDepth: 5,
        keyboardTilt: 0, keyboardZoom: 100,
        // ── Extended Typing Features ──────────────────────────────────────────
        targetWpm: 60, targetAccuracy: 95,
        autoPauseOnError: false, errorHighlightDuration: 500,
        smoothScrolling: true, wordWrap: true,
        showCurrentWordBox: true, showWordHistory: false,
        caretBlink: true, caretBlinkRate: 500, caretWidth: 2,
        typingMode3d: false, punctuationEnabled: false,
        numbersInText: false, capitalLetters: true,
        emojiMode: false, spellCheckEnabled: false,
        autoCorrectEnabled: false, wordPrediction: false,
        typingPaceTracker: false, consistencyScore: false,
        // ── Challenges ────────────────────────────────────────────────────────
        dailyChallengeDone: false, weeklyChallengeMode: false,
        challengeStreak: 0, challengePoints: 0,
        activeChallenges: [], completedChallenges: [],
        challengeNotifications: true, challengeDifficulty: 'normal',
        raceMode: false, raceTarget: 60,
        // ── Community / Social ────────────────────────────────────────────────
        showLeaderboard: false, leaderboardScope: 'global',
        shareResults: false, publicProfile: false,
        playerTag: '', playerBio: '', playerCountry: '', playerAvatarId: 0,
        friendsEnabled: false,
        // ── Labs / Experimental ───────────────────────────────────────────────
        aiAssistEnabled: false, aiWpmPrediction: false,
        aiSuggestions: false, mlAccuracyModel: false,
        biometricFeedback: false, eyeTrackingEnabled: false,
        voiceTypingEnabled: false, motionControlEnabled: false,
        brainwaveEnabled: false, quantumRngMode: false,
        // ── UI / Layout ───────────────────────────────────────────────────────
        sidebarCollapsed: false, compactMode: false,
        ultraWideLayout: false, floatingPanels: false,
        panelSnapping: true, customPanelLayout: 'default',
        showWelcomeScreen: true, showTutorial: true,
        showContextMenu: true, rightClickMenu: true,
        dockPosition: 'bottom', statusBarEnabled: true,
        toolbarEnabled: true, breadcrumbsEnabled: false,
        notificationsEnabled: true, soundNotifications: true,
        desktopNotifications: false, popupStyle: 'toast',
        animationPreset: 'smooth', transitionStyle: 'fade',
        // ── Profiles Extended ─────────────────────────────────────────────────
        profileName0: 'Profile 1', profileName1: 'Profile 2', profileName2: 'Profile 3',
        profileColor0: '#8b5cf6', profileColor1: '#06b6d4', profileColor2: '#f43f5e',
        profileIcon0: '🎹', profileIcon1: '🎸', profileIcon2: '🎺',

        // ── Actions ──────────────────────────────────────────────────────────
        setTheme: (t) => set({ theme: t }),
        setRgbEnabled: (v) => set({ rgbEnabled: v }),
        setRainbowEnabled: (v) => set({ rainbowModeEnabled: v }),
        setGlowIntensity: (v) => set({ glowIntensity: v }),
        setAnimationSpeed: (v) => set({ animationSpeed: v }),
        setFadeDuration: (v) => set({ fadeDuration: v }),
        setVisualsEnabled: (v) => set({ visualsEnabled: v }),
        setRgbMode: (mode) => set({ rgbMode: mode }),
        setRgbCustomColor: (color) => set({ rgbCustomColor: color }),
        setKeyOpacity: (v) => set({ keyOpacity: v }),
        setShowNoteLabels: (v) => set({ showNoteLabels: v }),
        setBackgroundEffect: (v) => set({ backgroundEffect: v }),
        setVolume: (v) => {
          set({ volume: v });
          import('@/lib/audio').then(({ audioEngine }) => audioEngine.setVolume(v));
        },
        setSoundCategory: (v) => {
          set({ soundCategory: v });
          import('@/lib/audio').then(({ audioEngine }) => audioEngine.setSoundCategory(v));
        },
        setMetronome: (v) => {
          const { bpm } = get();
          set({ metronomeEnabled: v });
          import('@/lib/audio').then(({ audioEngine }) => { audioEngine.init(); audioEngine.setMetronome(v, bpm); });
        },
        setBpm: (v) => {
          const { metronomeEnabled } = get();
          set({ bpm: v });
          if (metronomeEnabled) import('@/lib/audio').then(({ audioEngine }) => audioEngine.updateMetronomeBpm(v));
        },
        setEffect: (name, v) => {
          set({ [`${name}Enabled`]: v } as any);
          import('@/lib/audio').then(({ audioEngine }) => audioEngine.toggleEffect(name as any, v));
        },
        setMasterPitch: (v) => set({ masterPitch: v }),
        setOctaveShift: (v) => set({ octaveShift: v }),
        setMusicalScale: (v) => set({ musicalScale: v }),
        setScaleEnabled: (v) => set({ scaleEnabled: v }),
        setKeySize: (v) => set({ keySize: v }),
        setShowHeatmap: (v) => set({ showHeatmap: v }),
        clearHeatmap: () => set({ keyHeatmap: {}, heatmapMax: 0 }),
        setHighContrast: (v) => set({ highContrast: v }),
        setReduceMotion: (v) => set({ reduceMotion: v }),
        setTimedDuration: (s) => set({ timedDuration: s, timedTimeLeft: s }),
        setSprintDuration: (v) => set({ sprintDuration: v }),
        setFocusMode: (v) => set({ focusMode: v }),
        setNoteVisualizerEnabled: (v) => set({ noteVisualizerEnabled: v }),
        setShowWpmChart: (v) => set({ showWpmChart: v }),
        setCursorStyle: (v) => set({ cursorStyle: v }),
        setTypingFont: (v) => set({ typingFont: v }),
        setConfettiEnabled: (v) => set({ confettiEnabled: v }),
        setAutoReset: (v) => set({ autoReset: v }),
        setShowWordCount: (v) => set({ showWordCount: v }),
        setPerformanceMode: (v) => set({ performanceMode: v }),
        setAutoPerformanceMode: (v) => set({ autoPerformanceMode: v }),

        // ── NEW setters ────────────────────────────────────────────────────────
        setKeyShape: (v) => set({ keyShape: v }),
        setKeyPressEffect: (v) => set({ keyPressEffect: v }),
        setRgbBrightness: (v) => set({ rgbBrightness: v }),
        setRgbSaturation: (v) => set({ rgbSaturation: v }),
        setRgbAnimSpeed: (v) => set({ rgbAnimSpeed: v }),
        setBgBlurAmount: (v) => set({ bgBlurAmount: v }),
        setBgEffectSpeed: (v) => set({ bgEffectSpeed: v }),
        setBgEffectOpacity: (v) => set({ bgEffectOpacity: v }),
        setParticleDensity: (v) => set({ particleDensity: v }),
        setParticleSpeed: (v) => set({ particleSpeed: v }),
        setKeyGlowSpread: (v) => set({ keyGlowSpread: v }),
        setKeyGlowBlur: (v) => set({ keyGlowBlur: v }),
        setGradientStyle: (v) => set({ gradientStyle: v }),
        setKeyBorderStyle: (v) => set({ keyBorderStyle: v }),
        setFocusModeOpacity: (v) => set({ focusModeOpacity: v }),
        setTopBarVisible: (v) => set({ topBarVisible: v }),
        setKeyLabelStyle: (v) => set({ keyLabelStyle: v }),
        setCustomAccentColor: (v) => set({ customAccentColor: v }),
        setCustomBgColor: (v) => set({ customBgColor: v }),
        setUseCustomColors: (v) => set({ useCustomColors: v }),
        setKeyShimmer: (v) => set({ keyShimmer: v }),
        setKeyboardPerspective: (v) => set({ keyboardPerspective: v }),
        setKeyDepth: (v) => set({ keyDepth: v }),
        setKeyShadowIntensity: (v) => set({ keyShadowIntensity: v }),
        setKeySpacing: (v) => set({ keySpacing: v }),
        setEqBass: (v) => set({ eqBass: v }),
        setEqMid: (v) => set({ eqMid: v }),
        setEqTreble: (v) => set({ eqTreble: v }),
        setStereoWidth: (v) => set({ stereoWidth: v }),
        setDelayTime: (v) => set({ delayTime: v }),
        setDelayFeedback: (v) => set({ delayFeedback: v }),
        setReverbAmount: (v) => set({ reverbAmount: v }),
        setReverbRoomSize: (v) => set({ reverbRoomSize: v }),
        setAttackTime: (v) => set({ attackTime: v }),
        setReleaseTime: (v) => set({ releaseTime: v }),
        setPolyphonyLimit: (v) => set({ polyphonyLimit: v }),
        setVelocitySensitivity: (v) => set({ velocitySensitivity: v }),
        setMetronomeSound: (v) => set({ metronomeSound: v }),
        setMetronomeAccent: (v) => set({ metronomeAccent: v }),
        setErrorSoundEnabled: (v) => set({ errorSoundEnabled: v }),
        setSuccessSoundEnabled: (v) => set({ successSoundEnabled: v }),
        setAmbientVolume: (v) => set({ ambientVolume: v }),
        setWaveformType: (v) => set({ waveformType: v }),
        setNoteDurationMult: (v) => set({ noteDurationMult: v }),
        setAudioLatencyCompensation: (v) => set({ audioLatencyCompensation: v }),
        setDifficultyLevel: (v) => set({ difficultyLevel: v }),
        setWordPoolSize: (v) => set({ wordPoolSize: v }),
        setAutoAdvanceLesson: (v) => set({ autoAdvanceLesson: v }),
        setBreakReminderInterval: (v) => set({ breakReminderInterval: v }),
        setTypingLineHeight: (v) => set({ typingLineHeight: v }),
        setTypingLetterSpacing: (v) => set({ typingLetterSpacing: v }),
        setProgressBarStyle: (v) => set({ progressBarStyle: v }),
        setShowWpmStat: (v) => set({ showWpmStat: v }),
        setShowCpmStat: (v) => set({ showCpmStat: v }),
        setShowAccuracyStat: (v) => set({ showAccuracyStat: v }),
        setShowErrorsStat: (v) => set({ showErrorsStat: v }),
        setShowTimerStat: (v) => set({ showTimerStat: v }),
        setAutoSaveSession: (v) => set({ autoSaveSession: v }),
        setShowWordNumber: (v) => set({ showWordNumber: v }),
        setKeyboardAlignment: (v) => set({ keyboardAlignment: v }),
        setDyslexiaFont: (v) => set({ dyslexiaFont: v }),
        setLargeTextMode: (v) => set({ largeTextMode: v }),
        setColorBlindMode: (v) => set({ colorBlindMode: v }),
        setBlindMode: (v) => set({ blindMode: v }),
        setShowFingerGuide: (v) => set({ showFingerGuide: v }),
        setMirrorKeyboard: (v) => set({ mirrorKeyboard: v }),
        setChordMode: (v) => set({ chordMode: v }),
        setArpeggioMode: (v) => set({ arpeggioMode: v }),
        setSustainMode: (v) => set({ sustainMode: v }),
        setGlideMode: (v) => set({ glideMode: v }),
        setDroneNote: (v) => set({ droneNote: v }),
        setScaleLock: (v) => set({ scaleLock: v }),
        setPanningEnabled: (v) => set({ panningEnabled: v }),
        setGlideSpeed: (v) => set({ glideSpeed: v }),
        setArpeggioRate: (v) => set({ arpeggioRate: v }),
        setChordVoicing: (v) => set({ chordVoicing: v }),
        setWpmChartStyle: (v) => set({ wpmChartStyle: v }),
        setWpmChartPoints: (v) => set({ wpmChartPoints: v }),
        setAchievementDuration: (v) => set({ achievementDuration: v }),
        setAchievementPosition: (v) => set({ achievementPosition: v }),
        setAchievementSoundEnabled: (v) => set({ achievementSoundEnabled: v }),
        setHeatmapOpacity: (v) => set({ heatmapOpacity: v }),
        setHeatmapDecay: (v) => set({ heatmapDecay: v }),
        setNoteVisualizerStyle: (v) => set({ noteVisualizerStyle: v }),
        setNoteVisualizerSpeed: (v) => set({ noteVisualizerSpeed: v }),
        setNoteVisualizerDensity: (v) => set({ noteVisualizerDensity: v }),
        setShowPrevSessionComparison: (v) => set({ showPrevSessionComparison: v }),
        setStatsColumns: (v) => set({ statsColumns: v }),
        setActiveProfile: (v) => set({ activeProfile: v }),
        setSessionHistoryLength: (v) => set({ sessionHistoryLength: v }),
        setTransportDockVisible: (v) => set({ transportDockVisible: v }),
        setFpsTarget: (v) => set({ fpsTarget: v }),
        setAdaptiveQuality: (v) => set({ adaptiveQuality: v }),
        setGpuAcceleration: (v) => set({ gpuAcceleration: v }),
        setRafThrottling: (v) => set({ rafThrottling: v }),
        setDebounceDelay: (v) => set({ debounceDelay: v }),
        setCssContainment: (v) => set({ cssContainment: v }),
        setShowFpsCounter: (v) => set({ showFpsCounter: v }),
        setShowMemoryUsage: (v) => set({ showMemoryUsage: v }),
        setAudioBufferSize: (v) => set({ audioBufferSize: v }),
        setAudioSuspendOnIdle: (v) => set({ audioSuspendOnIdle: v }),
        setAudioSuspendDelay: (v) => set({ audioSuspendDelay: v }),
        setNoteOverlapBehavior: (v) => set({ noteOverlapBehavior: v }),
        setMemoryOptimization: (v) => set({ memoryOptimization: v }),
        setStorageOptimization: (v) => set({ storageOptimization: v }),
        setOfflineMode: (v) => set({ offlineMode: v }),
        setNetworkAdaptive: (v) => set({ networkAdaptive: v }),
        setReducedDataMode: (v) => set({ reducedDataMode: v }),
        setHapticEnabled: (v) => set({ hapticEnabled: v }),
        setTouchOptimization: (v) => set({ touchOptimization: v }),
        setSwipeNavigation: (v) => set({ swipeNavigation: v }),
        setPinchZoom: (v) => set({ pinchZoom: v }),
        setPageVisibilityPause: (v) => set({ pageVisibilityPause: v }),
        setBatteryOptimization: (v) => set({ batteryOptimization: v }),
        setWakeLock: (v) => set({ wakeLock: v }),
        setAnalyticsEnabled: (v) => set({ analyticsEnabled: v }),
        setShowKeyboardShortcuts: (v) => set({ showKeyboardShortcuts: v }),
        setBlindTypingMode: (v) => set({ blindTypingMode: v }),
        setGhostMode: (v) => set({ ghostMode: v }),
        setPomodoroEnabled: (v) => set({ pomodoroEnabled: v }),
        setPomodoroWorkMin: (v) => set({ pomodoroWorkMin: v }),
        setPomodoroBreakMin: (v) => set({ pomodoroBreakMin: v }),
        setPomodoroSessions: (v) => set({ pomodoroSessions: v }),
        setDailyChallengeMode: (v) => {
          set({ dailyChallengeMode: v });
          if (v) {
            const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const seed = parseInt(today) % TYPING_WORDS.length;
            const dailyWords = TYPING_WORDS.slice(seed, seed + 30);
            set({ typingMode: 'word', wordList: dailyWords, wordIndex: 0,
              targetText: dailyWords[0] || 'challenge', typedText: '',
              startTime: null, errors: 0, correctChars: 0 });
          }
        },
        setQuickPreset: (v) => {
          set({ quickPreset: v });
          if (v === 'gaming') set({ theme: 'neon' as any, rgbMode: 'fire' as any, soundCategory: 'Game / Arcade Sounds' as any, backgroundEffect: 'starfield' as any });
          else if (v === 'study') set({ theme: 'midnight' as any, rgbMode: 'breathing' as any, soundCategory: 'Lo-fi' as any, backgroundEffect: 'none' as any });
          else if (v === 'concert') set({ theme: 'synthwave' as any, rgbMode: 'wave' as any, soundCategory: 'Orchestral Sounds' as any, backgroundEffect: 'particles' as any });
          else if (v === 'zen') set({ theme: 'forest' as any, rgbMode: 'aurora' as any, soundCategory: 'Meditation / Healing Sounds' as any, backgroundEffect: 'none' as any });
          else if (v === 'cyberpunk') set({ theme: 'cyberpunk' as any, rgbMode: 'neon-pulse' as any, soundCategory: 'Futuristic / Sci-fi Sounds' as any, backgroundEffect: 'matrix-rain' as any });
          else if (v === 'lofi') set({ theme: 'lofi' as any, rgbMode: 'lava' as any, soundCategory: 'Lo-fi' as any, backgroundEffect: 'none' as any });
        },
        // ── Extended Setter Implementations ───────────────────────────────────
        setKeyGlowColor: (v) => set({ keyGlowColor: v }),
        setKeyGlowRadius: (v) => set({ keyGlowRadius: v }),
        setKeyGlowPulse: (v) => set({ keyGlowPulse: v }),
        setBackgroundOpacity: (v) => set({ backgroundOpacity: v }),
        setBackgroundBlur: (v) => set({ backgroundBlur: v }),
        setBackgroundSaturation: (v) => set({ backgroundSaturation: v }),
        setBackgroundContrast: (v) => set({ backgroundContrast: v }),
        setThemeAccentOpacity: (v) => set({ themeAccentOpacity: v }),
        setGlassEffect: (v) => set({ glassEffect: v }),
        setGlassBlur: (v) => set({ glassBlur: v }),
        setGlassOpacity: (v) => set({ glassOpacity: v }),
        setNeonBorderEnabled: (v) => set({ neonBorderEnabled: v }),
        setNeonBorderWidth: (v) => set({ neonBorderWidth: v }),
        setScanLineEnabled: (v) => set({ scanLineEnabled: v }),
        setVhsEnabled: (v) => set({ vhsEnabled: v }),
        setFilmGrainEnabled: (v) => set({ filmGrainEnabled: v }),
        setFilmGrainIntensity: (v) => set({ filmGrainIntensity: v }),
        setBloomEnabled: (v) => set({ bloomEnabled: v }),
        setBloomStrength: (v) => set({ bloomStrength: v }),
        setChromaticAberration: (v) => set({ chromaticAberration: v }),
        setVignetteEnabled: (v) => set({ vignetteEnabled: v }),
        setVignetteStrength: (v) => set({ vignetteStrength: v }),
        setPixelateEffect: (v) => set({ pixelateEffect: v }),
        setPixelateSize: (v) => set({ pixelateSize: v }),
        setInvertColors: (v) => set({ invertColors: v }),
        setGrayscaleEnabled: (v) => set({ grayscaleEnabled: v }),
        setSepiaEnabled: (v) => set({ sepiaEnabled: v }),
        setHueRotate: (v) => set({ hueRotate: v }),
        setBrightnessAdjust: (v) => set({ brightnessAdjust: v }),
        setEqBand1: (v) => set({ eqBand1: v }),
        setEqBand2: (v) => set({ eqBand2: v }),
        setEqBand3: (v) => set({ eqBand3: v }),
        setEqBand4: (v) => set({ eqBand4: v }),
        setEqBand5: (v) => set({ eqBand5: v }),
        setEqBand6: (v) => set({ eqBand6: v }),
        setEqBand7: (v) => set({ eqBand7: v }),
        setReverbSize: (v) => set({ reverbSize: v }),
        setReverbWet: (v) => set({ reverbWet: v }),
        setDelayWet: (v) => set({ delayWet: v }),
        setChorusRate: (v) => set({ chorusRate: v }),
        setChorusDepth: (v) => set({ chorusDepth: v }),
        setFlangerEnabled: (v) => set({ flangerEnabled: v }),
        setFlangerRate: (v) => set({ flangerRate: v }),
        setPhaserEnabled: (v) => set({ phaserEnabled: v }),
        setPhaserRate: (v) => set({ phaserRate: v }),
        setTremoloEnabled: (v) => set({ tremoloEnabled: v }),
        setTremoloRate: (v) => set({ tremoloRate: v }),
        setAutoTuneEnabled: (v) => set({ autoTuneEnabled: v }),
        setVocodeEnabled: (v) => set({ vocodeEnabled: v }),
        setStereoWidthEnabled: (v) => set({ stereoWidthEnabled: v }),
        setBassBoostEnabled: (v) => set({ bassBoostEnabled: v }),
        setBassBoostGain: (v) => set({ bassBoostGain: v }),
        setHighPassEnabled: (v) => set({ highPassEnabled: v }),
        setLowPassEnabled: (v) => set({ lowPassEnabled: v }),
        setHighPassFreq: (v) => set({ highPassFreq: v }),
        setLowPassFreq: (v) => set({ lowPassFreq: v }),
        setBitCrusherEnabled: (v) => set({ bitCrusherEnabled: v }),
        setBitCrusherBits: (v) => set({ bitCrusherBits: v }),
        setKeyboardLayout: (v) => set({ keyboardLayout: v }),
        setKeyboardSkin: (v) => set({ keyboardSkin: v }),
        setKeyHighlightMode: (v) => set({ keyHighlightMode: v }),
        setKeyColorScheme: (v) => set({ keyColorScheme: v }),
        setShowKeyNumbers: (v) => set({ showKeyNumbers: v }),
        setShowChordNames: (v) => set({ showChordNames: v }),
        setShowScaleDegrees: (v) => set({ showScaleDegrees: v }),
        setShowOctaveNumbers: (v) => set({ showOctaveNumbers: v }),
        setKeyAnimationTrail: (v) => set({ keyAnimationTrail: v }),
        setKeyGhostEffect: (v) => set({ keyGhostEffect: v }),
        setKeyClickSound: (v) => set({ keyClickSound: v }),
        setKeyCapColor: (v) => set({ keyCapColor: v }),
        setKeyStemColor: (v) => set({ keyStemColor: v }),
        setKey3dDepth: (v) => set({ key3dDepth: v }),
        setKeyboardTilt: (v) => set({ keyboardTilt: v }),
        setKeyboardZoom: (v) => set({ keyboardZoom: v }),
        setTargetWpm: (v) => set({ targetWpm: v }),
        setTargetAccuracy: (v) => set({ targetAccuracy: v }),
        setAutoPauseOnError: (v) => set({ autoPauseOnError: v }),
        setErrorHighlightDuration: (v) => set({ errorHighlightDuration: v }),
        setSmoothScrolling: (v) => set({ smoothScrolling: v }),
        setWordWrap: (v) => set({ wordWrap: v }),
        setShowCurrentWordBox: (v) => set({ showCurrentWordBox: v }),
        setShowWordHistory: (v) => set({ showWordHistory: v }),
        setCaretBlink: (v) => set({ caretBlink: v }),
        setCaretBlinkRate: (v) => set({ caretBlinkRate: v }),
        setCaretWidth: (v) => set({ caretWidth: v }),
        setTypingMode3d: (v) => set({ typingMode3d: v }),
        setPunctuationEnabled: (v) => set({ punctuationEnabled: v }),
        setNumbersInText: (v) => set({ numbersInText: v }),
        setCapitalLetters: (v) => set({ capitalLetters: v }),
        setEmojiMode: (v) => set({ emojiMode: v }),
        setSpellCheckEnabled: (v) => set({ spellCheckEnabled: v }),
        setAutoCorrectEnabled: (v) => set({ autoCorrectEnabled: v }),
        setWordPrediction: (v) => set({ wordPrediction: v }),
        setTypingPaceTracker: (v) => set({ typingPaceTracker: v }),
        setConsistencyScore: (v) => set({ consistencyScore: v }),
        setDailyChallengeDone: (v) => set({ dailyChallengeDone: v }),
        setWeeklyChallengeMode: (v) => set({ weeklyChallengeMode: v }),
        setChallengeDifficulty: (v) => set({ challengeDifficulty: v }),
        setRaceMode: (v) => set({ raceMode: v }),
        setRaceTarget: (v) => set({ raceTarget: v }),
        setChallengeNotifications: (v) => set({ challengeNotifications: v }),
        setShowLeaderboard: (v) => set({ showLeaderboard: v }),
        setLeaderboardScope: (v) => set({ leaderboardScope: v }),
        setShareResults: (v) => set({ shareResults: v }),
        setPublicProfile: (v) => set({ publicProfile: v }),
        setPlayerTag: (v) => set({ playerTag: v }),
        setPlayerBio: (v) => set({ playerBio: v }),
        setPlayerCountry: (v) => set({ playerCountry: v }),
        setPlayerAvatarId: (v) => set({ playerAvatarId: v }),
        setFriendsEnabled: (v) => set({ friendsEnabled: v }),
        setAiAssistEnabled: (v) => set({ aiAssistEnabled: v }),
        setAiWpmPrediction: (v) => set({ aiWpmPrediction: v }),
        setAiSuggestions: (v) => set({ aiSuggestions: v }),
        setMlAccuracyModel: (v) => set({ mlAccuracyModel: v }),
        setBiometricFeedback: (v) => set({ biometricFeedback: v }),
        setEyeTrackingEnabled: (v) => set({ eyeTrackingEnabled: v }),
        setVoiceTypingEnabled: (v) => set({ voiceTypingEnabled: v }),
        setMotionControlEnabled: (v) => set({ motionControlEnabled: v }),
        setBrainwaveEnabled: (v) => set({ brainwaveEnabled: v }),
        setQuantumRngMode: (v) => set({ quantumRngMode: v }),
        setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
        setCompactMode: (v) => set({ compactMode: v }),
        setUltraWideLayout: (v) => set({ ultraWideLayout: v }),
        setFloatingPanels: (v) => set({ floatingPanels: v }),
        setPanelSnapping: (v) => set({ panelSnapping: v }),
        setCustomPanelLayout: (v) => set({ customPanelLayout: v }),
        setShowWelcomeScreen: (v) => set({ showWelcomeScreen: v }),
        setShowTutorial: (v) => set({ showTutorial: v }),
        setShowContextMenu: (v) => set({ showContextMenu: v }),
        setRightClickMenu: (v) => set({ rightClickMenu: v }),
        setDockPosition: (v) => set({ dockPosition: v }),
        setStatusBarEnabled: (v) => set({ statusBarEnabled: v }),
        setToolbarEnabled: (v) => set({ toolbarEnabled: v }),
        setBreadcrumbsEnabled: (v) => set({ breadcrumbsEnabled: v }),
        setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
        setSoundNotifications: (v) => set({ soundNotifications: v }),
        setDesktopNotifications: (v) => set({ desktopNotifications: v }),
        setPopupStyle: (v) => set({ popupStyle: v }),
        setAnimationPreset: (v) => set({ animationPreset: v }),
        setTransitionStyle: (v) => set({ transitionStyle: v }),
        setProfileName0: (v) => set({ profileName0: v }),
        setProfileName1: (v) => set({ profileName1: v }),
        setProfileName2: (v) => set({ profileName2: v }),
        setProfileColor0: (v) => set({ profileColor0: v }),
        setProfileColor1: (v) => set({ profileColor1: v }),
        setProfileColor2: (v) => set({ profileColor2: v }),
        setProfileIcon0: (v) => set({ profileIcon0: v }),
        setProfileIcon1: (v) => set({ profileIcon1: v }),
        setProfileIcon2: (v) => set({ profileIcon2: v }),
        exportSettings: () => {
          const s = get();
          const exportData = {
            theme: s.theme, rgbMode: s.rgbMode, rgbEnabled: s.rgbEnabled, rgbCustomColor: s.rgbCustomColor,
            soundCategory: s.soundCategory, volume: s.volume, backgroundEffect: s.backgroundEffect,
            keyShape: s.keyShape, keyPressEffect: s.keyPressEffect, keySize: s.keySize,
            typingMode: s.typingMode, difficultyLevel: s.difficultyLevel, cursorStyle: s.cursorStyle,
            typingFont: s.typingFont, highContrast: s.highContrast, reduceMotion: s.reduceMotion,
            eqBass: s.eqBass, eqMid: s.eqMid, eqTreble: s.eqTreble,
            reverbEnabled: s.reverbEnabled, delayEnabled: s.delayEnabled, chorusEnabled: s.chorusEnabled,
            customAccentColor: s.customAccentColor, useCustomColors: s.useCustomColors,
            noteVisualizerEnabled: s.noteVisualizerEnabled, noteVisualizerStyle: s.noteVisualizerStyle,
            performanceMode: s.performanceMode, focusMode: s.focusMode,
            blindTypingMode: s.blindTypingMode, ghostMode: s.ghostMode,
            pomodoroWorkMin: s.pomodoroWorkMin, pomodoroBreakMin: s.pomodoroBreakMin,
          };
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'uk-aurora-settings.json'; a.click();
          URL.revokeObjectURL(url);
        },
        importSettings: (data) => { set(data as any); },

        setLessonNumber: (n) => {
          const state = get();
          const newWordList = buildModeWordList('lesson', n, state.customText);
          set({ lessonNumber: n, wordList: newWordList, wordIndex: 0, targetText: newWordList[0] || 'keyboard',
            typedText: '', startTime: null, errors: 0, correctChars: 0, wpm: 0, cpm: 0, accuracy: 100, sessionComplete: false });
        },

        setTypingMode: (m) => {
          const state = get();
          const newWordList = buildModeWordList(m, state.lessonNumber, state.customText);
          const modesUsed = state.modesUsed.includes(m) ? state.modesUsed : [...state.modesUsed, m];
          const timedTimeLeft = m === 'sprint' ? state.sprintDuration : state.timedDuration;
          set({ typingMode: m, targetText: newWordList[0] || 'keyboard', typedText: '', startTime: null,
            errors: 0, correctChars: 0, wpm: 0, cpm: 0, accuracy: 100, wordList: newWordList, wordIndex: 0,
            timedTimeLeft, sessionComplete: false, modesUsed });
        },

        setCustomText: (t) => {
          set({ customText: t });
          const s = get();
          if (s.typingMode === 'custom') {
            const newWordList = buildModeWordList('custom', s.lessonNumber, t);
            set({ wordList: newWordList, wordIndex: 0, targetText: newWordList[0] || 'type here',
              typedText: '', startTime: null, errors: 0, correctChars: 0 });
          }
        },

        resetTyping: () => {
          const s = get();
          const newWordList = buildModeWordList(s.typingMode, s.lessonNumber, s.customText);
          const timedTimeLeft = s.typingMode === 'sprint' ? s.sprintDuration : s.timedDuration;
          set({ typedText: '', startTime: null, errors: 0, correctChars: 0, wpm: 0, cpm: 0, accuracy: 100,
            wordList: newWordList, wordIndex: 0, timedTimeLeft, sessionComplete: false,
            targetText: newWordList[0] || 'keyboard' });
        },

        nextWord: () => { const s = get(); set(advanceWord(s)); },

        tickTimer: () => {
          const s = get();
          const isTimedMode = s.typingMode === 'timed' || s.typingMode === 'sprint';
          if (!isTimedMode || !s.startTime || s.sessionComplete) return;
          const elapsed = (Date.now() - s.startTime) / 1000;
          const duration = s.typingMode === 'sprint' ? s.sprintDuration : s.timedDuration;
          const remaining = Math.max(0, duration - elapsed);
          if (remaining <= 0) {
            const sessionXp = Math.round(s.wpm * (s.accuracy / 100));
            const sessionRecord: SessionRecord = {
              id: Date.now().toString(),
              date: Date.now(), wpm: s.wpm, cpm: s.cpm, accuracy: s.accuracy,
              errors: s.errors, wordCount: s.wordIndex, duration,
              mode: s.typingMode, xpEarned: sessionXp,
            };
            set({
              timedTimeLeft: 0, sessionComplete: true,
              bestTimedWpm: Math.max(s.bestTimedWpm, s.wpm),
              sessionHistory: [sessionRecord, ...s.sessionHistory].slice(0, 50),
            });
          } else {
            set({ timedTimeLeft: remaining });
          }
        },

        getNextRainbowColor: () => {
          const { rainbowIndex } = get();
          const color = RAINBOW_COLORS[rainbowIndex % RAINBOW_COLORS.length];
          set({ rainbowIndex: rainbowIndex + 1 });
          return color;
        },

        setRgbPhase: (phase) => set({ rgbPhase: phase }),

        addXp: (amount) => {
          const s = get();
          set({ xp: s.xp + amount });
        },

        setDailyGoalWpm: (v) => set({ dailyGoalWpm: v }),
        setDailyGoalKeystrokes: (v) => set({ dailyGoalKeystrokes: v }),
        dismissWelcome: () => set({ showWelcome: false }),
        clearPendingAchievement: () => set({ pendingAchievement: null }),

        pressKey: (code) => {
          const state = get();
          const newActive = new Set(state.activeKeys);
          newActive.add(code);
          const updates: Partial<AppState> = { activeKeys: newActive };

          // Update heatmap
          const newCount = (state.keyHeatmap[code] || 0) + 1;
          const newHeatmap = { ...state.keyHeatmap, [code]: newCount };
          updates.keyHeatmap = newHeatmap;
          if (newCount > (state.heatmapMax || 0)) updates.heatmapMax = newCount;

          // Update notes played count for musical keys
          const instrument = getInstrumentForKey(code, newActive.has('ShiftLeft') || newActive.has('ShiftRight'));
          if (instrument !== 'misc' && instrument !== 'system') {
            updates.totalNotesPlayed = (state.totalNotesPlayed || 0) + 1;
          }

          // Track total keystrokes and daily keystrokes
          if (code !== 'ShiftLeft' && code !== 'ShiftRight' && code !== 'CapsLock') {
            updates.totalKeystrokes = (state.totalKeystrokes || 0) + 1;
            const today = todayStr();
            if (state.lastPlayDate !== today) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yStr = yesterday.toISOString().slice(0, 10);
              const newStreak = state.lastPlayDate === yStr ? state.dailyStreak + 1 : 1;
              updates.lastPlayDate = today;
              updates.dailyStreak = newStreak;
              updates.longestStreak = Math.max(state.longestStreak, newStreak);
              updates.dailyKeystrokesToday = 1;
              updates.dailySessionsToday = 0;
            } else {
              updates.dailyKeystrokesToday = (state.dailyKeystrokesToday || 0) + 1;
            }
          }

          // Typing engine
          if (state.targetText && !state.sessionComplete) {
            if (!state.startTime && (isPrintable(code) || code === 'Backspace')) {
              updates.startTime = Date.now();
            }
            if (code === 'Backspace') {
              if (state.typedText.length > 0) {
                const pos = state.typedText.length - 1;
                const lastTyped = state.typedText[pos];
                const wasCorrect = state.targetText[pos] === lastTyped;
                updates.typedText = state.typedText.slice(0, -1);
                if (wasCorrect) updates.correctChars = Math.max(0, (state.correctChars || 0) - 1);
                else updates.errors = Math.max(0, (state.errors || 0) - 1);
              }
            } else if (isPrintable(code)) {
              const ch = codeToChar(code);
              if (ch) {
                if (code === 'Space') {
                  Object.assign(updates, advanceWord(state));
                } else {
                  const pos = state.typedText.length;
                  if (pos < state.targetText.length) {
                    const newTyped = state.typedText + ch;
                    updates.typedText = newTyped;
                    if (ch === state.targetText[pos]) updates.correctChars = (state.correctChars || 0) + 1;
                    else updates.errors = (state.errors || 0) + 1;
                    if (newTyped === state.targetText) Object.assign(updates, advanceWord(state));
                  }
                }
              }
            }

            // Recalculate stats
            const sTime = (updates.startTime as number) ?? state.startTime;
            if (sTime) {
              const minutes = (Date.now() - sTime) / 60000;
              if (minutes > 0.001) {
                const cc = (updates.correctChars as number) ?? state.correctChars;
                const errs = (updates.errors as number) ?? state.errors;
                const cpm = Math.round(cc / minutes);
                const wpm = Math.round(cpm / 5);
                const totalAttempts = cc + errs;
                const accuracy = totalAttempts > 0 ? Math.round((cc / totalAttempts) * 100) : 100;
                updates.wpm = wpm;
                updates.cpm = cpm;
                updates.accuracy = accuracy;
                // Update WPM history for chart (sample every ~10 keystrokes)
                if ((state.totalKeystrokes || 0) % 10 === 0 && wpm > 0) {
                  updates.wpmHistory = [...(state.wpmHistory || []).slice(-29), wpm];
                }
              }
            }

            // Check for session completion (non-pool modes)
            if ((updates as any).sessionComplete && !POOL_MODES.includes(state.typingMode)) {
              const finalWpm = (updates.wpm as number) ?? state.wpm;
              const finalAccuracy = (updates.accuracy as number) ?? state.accuracy;
              const finalErrors = (updates.errors as number) ?? state.errors;
              const sessionXp = Math.round(finalWpm * (finalAccuracy / 100) * 0.5);
              const sessionRecord: SessionRecord = {
                id: Date.now().toString(),
                date: Date.now(), wpm: finalWpm, cpm: (updates.cpm as number) ?? state.cpm,
                accuracy: finalAccuracy, errors: finalErrors,
                wordCount: (updates.wordIndex as number) ?? state.wordIndex,
                duration: state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : 0,
                mode: state.typingMode, xpEarned: sessionXp,
              };
              updates.bestWpm = Math.max(state.bestWpm, finalWpm);
              updates.bestAccuracy = Math.max(state.bestAccuracy, finalAccuracy);
              updates.totalSessions = (state.totalSessions || 0) + 1;
              updates.totalWordsTyped = (state.totalWordsTyped || 0) + ((updates.wordIndex as number) ?? state.wordIndex);
              updates.xp = (state.xp || 0) + sessionXp;
              updates.dailySessionsToday = (state.dailySessionsToday || 0) + 1;
              updates.sessionHistory = [sessionRecord, ...(state.sessionHistory || [])].slice(0, 50);
              if (state.typingMode === 'lesson' && !state.lessonsCompleted.includes(state.lessonNumber)) {
                updates.lessonsCompleted = [...state.lessonsCompleted, state.lessonNumber];
              }
            }
          }

          // Record event if recording
          if (state.isRecording) {
            const shiftHeld = newActive.has('ShiftLeft') || newActive.has('ShiftRight');
            const color = RAINBOW_COLORS[state.rainbowIndex % RAINBOW_COLORS.length];
            updates.recordedEvents = [...state.recordedEvents, {
              key: code, timestamp: Date.now(), instrument: getInstrumentForKey(code, shiftHeld),
              velocity: 0.75, rgbColor: color, glowIntensity: state.glowIntensity, isShifted: shiftHeld,
            }];
          }

          set(updates);

          // Check achievements after state update (async) — throttled to max once per 3s
          const _now = Date.now();
          if (_now - _lastAchievementCheckTime > 3000) {
            _lastAchievementCheckTime = _now;
          setTimeout(() => {
            const s = get();
            const stats: AchievementStats = {
              wpm: s.wpm, accuracy: s.accuracy, totalKeystrokes: s.totalKeystrokes,
              totalSessions: s.totalSessions, totalWordsTyped: s.totalWordsTyped,
              bestWpm: s.bestWpm, bestAccuracy: s.bestAccuracy, streak: s.dailyStreak,
              unlockedCount: s.unlockedAchievements.length, notesPlayed: s.totalNotesPlayed,
              modesUsed: s.modesUsed, lessonsCompleted: s.lessonsCompleted.length,
              recordingsCount: s.recordingsCount, totalPlaybackTime: 0,
              correctCharsInSession: s.correctChars, errorsInSession: s.errors,
              timedBestWpm: s.bestTimedWpm, longestStreak: s.longestStreak,
            };
            const newAch = checkAchievements(stats, s.unlockedAchievements);
            if (newAch && !s.pendingAchievement) {
              const achDef = ACHIEVEMENTS.find(a => a.id === newAch);
              set({
                unlockedAchievements: [...s.unlockedAchievements, newAch],
                pendingAchievement: newAch,
                xp: s.xp + (achDef?.xp || 0),
              });
            }
          }, 0);
          }
        },

        releaseKey: (code) => {
          const state = get();
          const newActive = new Set(state.activeKeys);
          newActive.delete(code);
          set({ activeKeys: newActive });
        },

        startRecording: () => {
          _playbackTimerIds.forEach(clearTimeout);
          _playbackTimerIds.length = 0;
          set({ isRecording: true, isPlaying: false, recordedEvents: [], recordingDuration: 0 });
        },

        stopRecording: () => {
          const state = get();
          const duration = state.recordedEvents.length > 1
            ? state.recordedEvents[state.recordedEvents.length - 1].timestamp - state.recordedEvents[0].timestamp
            : 0;
          set({ isRecording: false, recordingDuration: duration, recordingsCount: (state.recordingsCount || 0) + 1 });
        },

        playRecording: () => {
          const state = get();
          if (!state.recordedEvents.length) return;
          _playbackTimerIds.forEach(clearTimeout);
          _playbackTimerIds.length = 0;
          set({ isPlaying: true });
          const events = state.recordedEvents;
          const t0 = events[0].timestamp;
          const speed = state.playbackSpeed;
          events.forEach((evt) => {
            const delay = (evt.timestamp - t0) / speed;
            const id = setTimeout(async () => {
              const { audioEngine } = await import('@/lib/audio');
              audioEngine.init();
              audioEngine.playKeyAudio(evt.key, evt.velocity, evt.isShifted ?? false);
              window.dispatchEvent(new CustomEvent('playback-key', { detail: evt }));
            }, delay);
            _playbackTimerIds.push(id);
          });
          const totalDuration = (state.recordingDuration / speed) + 100;
          const endId = setTimeout(() => {
            const s = get();
            if (s.loopEnabled) { get().playRecording(); return; }
            set({ isPlaying: false });
          }, totalDuration);
          _playbackTimerIds.push(endId);
        },

        stopPlayback: () => {
          _playbackTimerIds.forEach(clearTimeout);
          _playbackTimerIds.length = 0;
          set({ isPlaying: false });
        },

        setPlaybackSpeed: (v) => set({ playbackSpeed: v }),
        setLoop: (v) => set({ loopEnabled: v }),

        loadRecording: (events) => {
          const duration = events.length > 1 ? events[events.length - 1].timestamp - events[0].timestamp : 0;
          set({ recordedEvents: events, recordingDuration: duration, isPlaying: false, isRecording: false });
        },
      };
    },
    {
      name: 'vk-settings-v9',
      version: 1,
      storage: createJSONStorage(() => throttledStorage),
      migrate: (persisted: any, version: number) => {
        if (version === 0) {
          if (typeof persisted.achievementDuration === 'number' && persisted.achievementDuration <= 20) {
            persisted.achievementDuration = persisted.achievementDuration * 1000;
          }
        }
        return persisted;
      },
      partialize: (state) => ({
        // Visual
        rgbEnabled: state.rgbEnabled, rainbowModeEnabled: state.rainbowModeEnabled,
        glowIntensity: state.glowIntensity, animationSpeed: state.animationSpeed,
        fadeDuration: state.fadeDuration, visualsEnabled: state.visualsEnabled,
        rgbMode: state.rgbMode, rgbCustomColor: state.rgbCustomColor,
        keyOpacity: state.keyOpacity, showNoteLabels: state.showNoteLabels,
        backgroundEffect: state.backgroundEffect, theme: state.theme,
        // Audio
        volume: state.volume, soundCategory: state.soundCategory, bpm: state.bpm,
        reverbEnabled: state.reverbEnabled, delayEnabled: state.delayEnabled,
        chorusEnabled: state.chorusEnabled, distortionEnabled: state.distortionEnabled,
        compressionEnabled: state.compressionEnabled, metronomeEnabled: state.metronomeEnabled,
        masterPitch: state.masterPitch, octaveShift: state.octaveShift,
        musicalScale: state.musicalScale, scaleEnabled: state.scaleEnabled,
        // Keyboard
        keySize: state.keySize, showHeatmap: state.showHeatmap, keyHeatmap: state.keyHeatmap, heatmapMax: state.heatmapMax,
        // Accessibility
        highContrast: state.highContrast, reduceMotion: state.reduceMotion,
        // Typing
        typingMode: state.typingMode, timedDuration: state.timedDuration,
        customText: state.customText, lessonNumber: state.lessonNumber,
        sprintDuration: state.sprintDuration,
        // Playback
        playbackSpeed: state.playbackSpeed, loopEnabled: state.loopEnabled,
        recordedEvents: state.recordedEvents.slice(-2000), recordingDuration: state.recordingDuration,
        recordingsCount: state.recordingsCount,
        // Gamification
        bestWpm: state.bestWpm, bestAccuracy: state.bestAccuracy, bestTimedWpm: state.bestTimedWpm,
        totalKeystrokes: state.totalKeystrokes, totalSessions: state.totalSessions,
        totalWordsTyped: state.totalWordsTyped, totalNotesPlayed: state.totalNotesPlayed,
        modesUsed: state.modesUsed, lessonsCompleted: state.lessonsCompleted,
        xp: state.xp, sessionHistory: state.sessionHistory.slice(0, 50),
        unlockedAchievements: state.unlockedAchievements,
        // Goals
        dailyGoalWpm: state.dailyGoalWpm, dailyGoalKeystrokes: state.dailyGoalKeystrokes,
        lastPlayDate: state.lastPlayDate, dailyStreak: state.dailyStreak,
        longestStreak: state.longestStreak, dailyKeystrokesToday: state.dailyKeystrokesToday,
        dailySessionsToday: state.dailySessionsToday,
        // UI / Features
        showWelcome: state.showWelcome,
        focusMode: state.focusMode,
        noteVisualizerEnabled: state.noteVisualizerEnabled,
        showWpmChart: state.showWpmChart,
        cursorStyle: state.cursorStyle,
        typingFont: state.typingFont,
        confettiEnabled: state.confettiEnabled,
        autoReset: state.autoReset,
        showWordCount: state.showWordCount,
        performanceMode: state.performanceMode,
        autoPerformanceMode: state.autoPerformanceMode,
        // NEW: Advanced Visual
        keyShape: state.keyShape, keyPressEffect: state.keyPressEffect,
        rgbBrightness: state.rgbBrightness, rgbSaturation: state.rgbSaturation, rgbAnimSpeed: state.rgbAnimSpeed,
        bgBlurAmount: state.bgBlurAmount, bgEffectSpeed: state.bgEffectSpeed, bgEffectOpacity: state.bgEffectOpacity,
        particleDensity: state.particleDensity, particleSpeed: state.particleSpeed,
        keyGlowSpread: state.keyGlowSpread, keyGlowBlur: state.keyGlowBlur,
        gradientStyle: state.gradientStyle, keyBorderStyle: state.keyBorderStyle,
        focusModeOpacity: state.focusModeOpacity, topBarVisible: state.topBarVisible,
        keyLabelStyle: state.keyLabelStyle, customAccentColor: state.customAccentColor,
        customBgColor: state.customBgColor, useCustomColors: state.useCustomColors,
        keyShimmer: state.keyShimmer, keyboardPerspective: state.keyboardPerspective,
        keyDepth: state.keyDepth, keyShadowIntensity: state.keyShadowIntensity, keySpacing: state.keySpacing,
        // NEW: Advanced Audio
        eqBass: state.eqBass, eqMid: state.eqMid, eqTreble: state.eqTreble,
        stereoWidth: state.stereoWidth, delayTime: state.delayTime, delayFeedback: state.delayFeedback,
        reverbAmount: state.reverbAmount, reverbRoomSize: state.reverbRoomSize,
        attackTime: state.attackTime, releaseTime: state.releaseTime,
        polyphonyLimit: state.polyphonyLimit, velocitySensitivity: state.velocitySensitivity,
        metronomeSound: state.metronomeSound, metronomeAccent: state.metronomeAccent,
        errorSoundEnabled: state.errorSoundEnabled, successSoundEnabled: state.successSoundEnabled,
        ambientVolume: state.ambientVolume, waveformType: state.waveformType,
        noteDurationMult: state.noteDurationMult, audioLatencyCompensation: state.audioLatencyCompensation,
        // NEW: Typing UX
        difficultyLevel: state.difficultyLevel, wordPoolSize: state.wordPoolSize,
        autoAdvanceLesson: state.autoAdvanceLesson, breakReminderInterval: state.breakReminderInterval,
        typingLineHeight: state.typingLineHeight, typingLetterSpacing: state.typingLetterSpacing,
        progressBarStyle: state.progressBarStyle,
        showWpmStat: state.showWpmStat, showCpmStat: state.showCpmStat,
        showAccuracyStat: state.showAccuracyStat, showErrorsStat: state.showErrorsStat, showTimerStat: state.showTimerStat,
        autoSaveSession: state.autoSaveSession, showWordNumber: state.showWordNumber,
        keyboardAlignment: state.keyboardAlignment,
        // NEW: Accessibility
        dyslexiaFont: state.dyslexiaFont, largeTextMode: state.largeTextMode,
        colorBlindMode: state.colorBlindMode, blindMode: state.blindMode,
        showFingerGuide: state.showFingerGuide, mirrorKeyboard: state.mirrorKeyboard,
        // NEW: Musical
        chordMode: state.chordMode, arpeggioMode: state.arpeggioMode, sustainMode: state.sustainMode,
        glideMode: state.glideMode, droneNote: state.droneNote, scaleLock: state.scaleLock,
        panningEnabled: state.panningEnabled, glideSpeed: state.glideSpeed, arpeggioRate: state.arpeggioRate,
        chordVoicing: state.chordVoicing,
        // NEW: UI Features
        wpmChartStyle: state.wpmChartStyle, wpmChartPoints: state.wpmChartPoints,
        achievementDuration: state.achievementDuration, achievementPosition: state.achievementPosition,
        achievementSoundEnabled: state.achievementSoundEnabled,
        heatmapOpacity: state.heatmapOpacity, heatmapDecay: state.heatmapDecay,
        noteVisualizerStyle: state.noteVisualizerStyle, noteVisualizerSpeed: state.noteVisualizerSpeed,
        noteVisualizerDensity: state.noteVisualizerDensity,
        showPrevSessionComparison: state.showPrevSessionComparison, statsColumns: state.statsColumns,
        activeProfile: state.activeProfile, sessionHistoryLength: state.sessionHistoryLength,
        transportDockVisible: state.transportDockVisible,
        // NEW: Platform Performance
        fpsTarget: state.fpsTarget, adaptiveQuality: state.adaptiveQuality,
        gpuAcceleration: state.gpuAcceleration, rafThrottling: state.rafThrottling,
        debounceDelay: state.debounceDelay, cssContainment: state.cssContainment,
        showFpsCounter: state.showFpsCounter, showMemoryUsage: state.showMemoryUsage,
        audioBufferSize: state.audioBufferSize, audioSuspendOnIdle: state.audioSuspendOnIdle,
        audioSuspendDelay: state.audioSuspendDelay, noteOverlapBehavior: state.noteOverlapBehavior,
        memoryOptimization: state.memoryOptimization, storageOptimization: state.storageOptimization,
        offlineMode: state.offlineMode, networkAdaptive: state.networkAdaptive,
        reducedDataMode: state.reducedDataMode, hapticEnabled: state.hapticEnabled,
        touchOptimization: state.touchOptimization, swipeNavigation: state.swipeNavigation,
        pinchZoom: state.pinchZoom, pageVisibilityPause: state.pageVisibilityPause,
        batteryOptimization: state.batteryOptimization, wakeLock: state.wakeLock,
        analyticsEnabled: state.analyticsEnabled, showKeyboardShortcuts: state.showKeyboardShortcuts,
        blindTypingMode: state.blindTypingMode, ghostMode: state.ghostMode,
        pomodoroEnabled: state.pomodoroEnabled, pomodoroWorkMin: state.pomodoroWorkMin,
        pomodoroBreakMin: state.pomodoroBreakMin, pomodoroSessions: state.pomodoroSessions,
        dailyChallengeMode: state.dailyChallengeMode, quickPreset: state.quickPreset,
      }),
    }
  )
);
