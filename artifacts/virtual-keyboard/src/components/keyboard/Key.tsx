import { useEffect, useRef, useState, memo } from 'react';
import { useStore } from '@/store';
import { useShallow } from 'zustand/shallow';
import { cn } from '@/lib/utils';
import { audioEngine } from '@/lib/audio';
import { INSTRUMENT_COLORS, INSTRUMENT_NAMES, InstrumentClass } from './layout';
import { useMobileLandscape, useIsPortraitPhone } from '@/hooks/use-mobile-landscape';

interface KeyProps {
  id: string;
  label: string;
  sub?: string;
  widthMultiplier?: number;
  instrumentClass?: InstrumentClass;
  rgbOffset?: number;
}

const RAINBOW = ['#ff5b55', '#ff9f1c', '#ffd447', '#38e29d', '#33a1ff', '#5f6bff', '#b45cff'];

const COLOR_SHADES: Record<string, string[]> = {
  'red':['#ff0000','#cc0000','#ff3333','#ff6666','#ff0000','#aa0000','#ff3333'],
  'blue':['#0000ff','#0033cc','#2255ff','#4477ff','#2266ff','#0044cc','#0022aa'],
  'green':['#00ff00','#00cc00','#33ff33','#66ff66','#00dd00','#00aa00','#338800'],
  'pink':['#ff66aa','#ff88bb','#ff44cc','#ff99dd','#ff33aa','#ff77bb','#ff55aa'],
  'cyan':['#00ffff','#00cccc','#33ffff','#66ffff','#00eeee','#00aaaa','#55ffff'],
  'orange':['#ff8800','#ff9900','#ffaa00','#ff6600','#ff7700','#ff9922','#ff8833'],
  'purple':['#9900cc','#aa00ee','#bb22ff','#8800bb','#cc44ff','#9922dd','#7700bb'],
  'yellow':['#ffff00','#ffee00','#ffcc00','#eeee00','#ffff33','#cccc00','#ffee33'],
  'white':['#ffffff','#eeeeee','#dddddd','#cccccc','#eeeeee','#ffffff','#eeeeee'],
  'gold':['#ffd700','#ffcc00','#ffbb00','#ffaa00','#eebb00','#ffcc33','#ffdd66'],
  'teal':['#009999','#00aaaa','#00bbbb','#00cccc','#00aabb','#008899','#009988'],
  'magenta':['#ff00ff','#cc00cc','#ee00ee','#ff44ff','#dd00ee','#aa00bb','#ff22ff'],
  'lime':['#88ff00','#99ff00','#aaff00','#bbff00','#77ff00','#66ee00','#88ee00'],
  'coral':['#ff7755','#ff6644','#ff8866','#ff9977','#ff5544','#ff7766','#ff8877'],
  'indigo':['#330099','#4400bb','#5511cc','#6622dd','#4400aa','#3300aa','#5522cc'],
  'silver':['#aaaaaa','#bbbbbb','#cccccc','#dddddd','#c0c0c0','#b0b0b0','#aaaaaa'],
  'rose':['#ff6677','#ff8888','#ff9999','#ffaaaa','#ff5566','#ff7788','#ff6688'],
  'amber':['#ffaa00','#ffbb00','#ff9900','#ffcc00','#ee9900','#dd8800','#ffbb22'],
  'emerald':['#00aa66','#00cc77','#00bb77','#00dd88','#009966','#00aa55','#00cc66'],
  'sapphire':['#0044cc','#0055dd','#0066ee','#2277ff','#0033bb','#0044cc','#1155dd'],
  'ruby':['#cc0022','#dd0033','#ee0044','#ff1155','#bb0011','#cc0033','#ee1144'],
  'turquoise':['#00ccbb','#00eecc','#00ddbb','#00ffcc','#00bbaa','#00ccaa','#00ddbb'],
  'crimson':['#aa0022','#bb0033','#cc0044','#dd1155','#990011','#aa0033','#cc1144'],
  'lavender':['#bbaaff','#ccbbff','#ddb0ff','#eeccff','#aaaaff','#ccaaff','#ddbbff'],
  'midnight':['#000044','#000066','#001188','#1122aa','#000055','#000077','#001199'],
  'sunset':['#ff4400','#ff6600','#ff9900','#ffbb00','#ff7700','#ff5500','#ff8800'],
  'arctic':['#aaddff','#bbeeee','#ccffff','#ddeeff','#aaccff','#bbddff','#cceeee'],
  'sakura':['#ffccdd','#ffddee','#ffaabb','#ff99cc','#ffbbcc','#ffddee','#ffccee'],
  'tropical':['#ff6600','#ffaa00','#00ff88','#00aaff','#aa00ff','#ff00aa','#ffaa00'],
  'cosmic':['#4400cc','#8800ee','#cc00ff','#00ccff','#ff00cc','#6600cc','#9900ff'],
  'rainbow':RAINBOW,'aurora':['#00ff88','#00ffcc','#00ccff','#7c3aed','#8b5cf6','#6d28d9','#00ff88'],
  'fire':['#ff0000','#ff3300','#ff6600','#ff9900','#ffcc00','#ff6600','#ff3300'],
  'ice':['#e0f7ff','#b3e9ff','#66d4ff','#33baff','#0099cc','#33baff','#66d4ff'],
  'neon':['#ff0080','#00ffff','#ff00ff','#00ff00','#ffff00','#ff0080','#00ffff'],
  'pastel':['#ff9de2','#ffb3ba','#ffdfba','#ffffba','#baffc9','#bae1ff','#c9baff'],
  'deep':['#1a0033','#2d0052','#440080','#6600cc','#8833ee','#6600cc','#440080'],
  'soft':['#ccaadd','#bbbbee','#aaccdd','#aaddcc','#bbddaa','#ccddaa','#ddccaa'],
  'slow':RAINBOW,'fast':RAINBOW,'ultra':RAINBOW,
};

function getAutoPalette(modeId: string): string[] | null {
  const prefixes = ['wave-','breathing-','pulse-','ripple-','flash-'];
  for (const p of prefixes) {
    if (modeId.startsWith(p)) return COLOR_SHADES[modeId.slice(p.length)] ?? null;
  }
  return null;
}

const PALETTE_MAP: Record<string, string[]> = {
  'wave': RAINBOW, 'breathing': RAINBOW, 'starlight': RAINBOW,
  'aurora':         ['#00ff88', '#00ffcc', '#00ccff', '#7c3aed', '#8b5cf6', '#6d28d9', '#00ff88'],
  'candy':          ['#ff9de2', '#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#c9baff'],
  'fire':           ['#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ff6600', '#ff3300'],
  'ice':            ['#e0f7ff', '#b3e9ff', '#66d4ff', '#33baff', '#0099cc', '#33baff', '#66d4ff'],
  'plasma':         ['#ff00ff', '#cc00ff', '#8800ff', '#00ccff', '#0088ff', '#00ffcc', '#ff00cc'],
  'sunset':         ['#ff6b35', '#ff4365', '#f72585', '#c77dff', '#7b2d8b', '#ff9f1c', '#ff6b35'],
  'neon-pulse':     ['#ff0080', '#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff0080', '#00ffff'],
  'lava':           ['#ff3a00', '#ff6500', '#ff9100', '#c84b00', '#a30000', '#ff3a00', '#ff6500'],
  'galaxy':         ['#0d0221', '#190a4e', '#3c1678', '#7c3aed', '#a78bfa', '#60a5fa', '#2563eb'],
  'typhoon':        ['#ffffff', '#a5f3fc', '#22d3ee', '#0891b2', '#06b6d4', '#67e8f9', '#ffffff'],
  'forest':         ['#052e07', '#0a5210', '#1a8a1a', '#2db82d', '#52cc52', '#86e86e', '#b8f2a0'],
  'ocean':          ['#001830', '#003080', '#0066cc', '#0099e6', '#33bbff', '#88ddff', '#ccf0ff'],
  'sakura':         ['#ff8fb0', '#ff69a0', '#ff4d88', '#ff2d6e', '#ff6699', '#ffb3cc', '#ffd9e8'],
  'desert':         ['#8b5e00', '#b07700', '#cc9900', '#e8b800', '#ffd700', '#ffe066', '#fff4cc'],
  'toxic':          ['#3dff00', '#7aff00', '#b8ff00', '#e8ff00', '#aaee00', '#66cc00', '#339900'],
  'blood':          ['#8b0000', '#a00000', '#cc0000', '#ff0000', '#ff3333', '#cc0000', '#8b0000'],
  'void':           ['#1a0033', '#2d0052', '#440080', '#6600cc', '#8833ee', '#6600cc', '#440080'],
  'neon-green':     ['#00ff00', '#33ff33', '#00ee00', '#55ff00', '#99ff00', '#ccff00', '#00ff44'],
  'cyber-pink':     ['#ff0080', '#ff0066', '#ff0044', '#cc0066', '#ff3399', '#ff66bb', '#ff99dd'],
  'matrix-rgb':     ['#001100', '#003300', '#005500', '#009900', '#00cc00', '#00ff00', '#33ff33'],
  'copper':         ['#7c3200', '#a04400', '#c85800', '#e87000', '#ff8c00', '#e87000', '#c85800'],
  'emerald-rgb':    ['#004d2e', '#008855', '#00aa66', '#00cc77', '#00ff99', '#66ffbb', '#aaffdd'],
  'sapphire':       ['#00006e', '#0000cc', '#2244ff', '#4488ff', '#66aaff', '#99ccff', '#cce0ff'],
  'ruby':           ['#6e0000', '#a80000', '#cc0022', '#ee0033', '#ff1144', '#ee3355', '#cc1133'],
  'earth-tones':    ['#3d2b1f', '#7a5c44', '#a87c5a', '#c8a07a', '#ddc090', '#c8a07a', '#a87c5a'],
  'storm':          ['#2a2a4a', '#44446a', '#7777aa', '#9999cc', '#bbbbee', '#ccccff', '#9999cc'],
  'coral-rgb':      ['#ff4500', '#ff6600', '#ff8866', '#ff6699', '#ff4477', '#ff7744', '#ff9966'],
  'teal-rgb':       ['#003333', '#006666', '#009999', '#00cccc', '#00ffff', '#66ffff', '#99ffff'],
  'magenta-rgb':    ['#6600cc', '#9900cc', '#cc00cc', '#ee00cc', '#ff00ee', '#cc00aa', '#aa0088'],
  'hologram':       ['#aaccff', '#ccaaff', '#ffaacc', '#aaffcc', '#ccffaa', '#ffccaa', '#aaddff'],
  'venom':          ['#1a3300', '#336600', '#55aa00', '#88dd00', '#aaff00', '#88cc00', '#559900'],
  'inferno':        ['#220000', '#550000', '#991100', '#cc3300', '#ff5500', '#ff8800', '#ffcc00'],
  'chrome':         ['#888888', '#aaaaaa', '#cccccc', '#eeeeee', '#ffffff', '#dddddd', '#aaaaaa'],
  'peacock':        ['#003366', '#005599', '#006688', '#007766', '#009944', '#006688', '#005599'],
  'jade':           ['#1a5c3c', '#2a7a52', '#3a9868', '#4ab67e', '#5ad494', '#3a9868', '#2a7a52'],
  'amethyst-rgb':   ['#4a006a', '#7700cc', '#aa00ee', '#cc33ff', '#ee66ff', '#cc33ff', '#aa00ee'],
  'violet-rgb':     ['#3300aa', '#5500ee', '#7733ff', '#9966ff', '#bbaaff', '#9966ff', '#7733ff'],
  'indigo-rgb':     ['#001a6e', '#0033cc', '#1155ee', '#3377ff', '#66aaff', '#3377ff', '#1155ee'],
  'amber':          ['#7a4400', '#cc7700', '#ee9900', '#ffaa00', '#ffcc00', '#ffaa00', '#ee9900'],
  'citrus':         ['#aa6600', '#ccaa00', '#eedd00', '#ffff00', '#ccff00', '#88ee00', '#55cc00'],
  'berry':          ['#440022', '#880044', '#aa0066', '#cc0088', '#ee00aa', '#cc0088', '#aa0066'],
  'peach-rgb':      ['#ff8844', '#ff9966', '#ffaa88', '#ffcc99', '#ffddbb', '#ffcc99', '#ffaa88'],
  'lilac':          ['#8866aa', '#aa88cc', '#bbaadd', '#ccbbee', '#ddccff', '#ccbbee', '#bbaadd'],
  'sage':           ['#445533', '#667755', '#889966', '#aabb88', '#ccdd99', '#aabb88', '#889966'],
  'crimson':        ['#550011', '#990022', '#bb0033', '#dd0044', '#ff1155', '#dd0044', '#bb0033'],
  'cobalt':         ['#001a66', '#003399', '#0055bb', '#0077dd', '#22aaff', '#0077dd', '#0055bb'],
  'turquoise-rgb':  ['#003344', '#006688', '#009999', '#00bbbb', '#00dddd', '#00ffff', '#66ffff'],
  'navy':           ['#000033', '#000066', '#000099', '#0000bb', '#1122cc', '#000099', '#000066'],
  'orchid':         ['#8800aa', '#cc22dd', '#ee55ff', '#dd44ee', '#cc33dd', '#dd44ee', '#ee55ff'],
  'sienna':         ['#552200', '#996633', '#bb8844', '#dd9933', '#bb8844', '#996633', '#774422'],
  'lime-rgb':       ['#335500', '#55aa00', '#77ee00', '#99ff00', '#bbff33', '#99ff00', '#77ee00'],
  'electric-blue':  ['#0022cc', '#0044ff', '#2266ff', '#55aaff', '#88ccff', '#55aaff', '#2266ff'],
  'hot-pink':       ['#ff0066', '#ff0099', '#ff33bb', '#ff66cc', '#ff99dd', '#ff66cc', '#ff33bb'],
  'sea-green':      ['#003322', '#007744', '#00aa55', '#00cc66', '#00ff88', '#00cc66', '#00aa55'],
  'sky-blue':       ['#0088ee', '#22aaff', '#55ccff', '#88ddff', '#aaeeff', '#88ddff', '#55ccff'],
  'blush':          ['#ffaaaa', '#ffbbcc', '#ffccdd', '#ffddee', '#ffeeee', '#ffddee', '#ffccdd'],
  'champagne':      ['#cc9933', '#ddaa44', '#ffcc66', '#ffdd88', '#ffeeaa', '#ffdd88', '#ffcc66'],
  'silver-rgb':     ['#888888', '#aaaaaa', '#cccccc', '#dddddd', '#eeeeee', '#dddddd', '#cccccc'],
  'bronze':         ['#886633', '#aa7744', '#cc8855', '#eeaa77', '#ddaa88', '#cc8855', '#aa7744'],
  'opal':           ['#aaddff', '#ddaaff', '#ffaadd', '#ffddaa', '#aaffdd', '#ddffaa', '#aaddff'],
  'pearl':          ['#eeeeff', '#f0f0ff', '#f5f5ff', '#ffffee', '#f8f8ee', '#ffffee', '#f5f5ff'],
  'malachite':      ['#004433', '#008855', '#00aa66', '#00cc77', '#00ee88', '#00cc77', '#00aa66'],
  'lapis':          ['#001166', '#0033bb', '#1155dd', '#2277ff', '#4499ff', '#2277ff', '#1155dd'],
  'aquamarine':     ['#00bb99', '#00ddbb', '#00ffcc', '#33ffdd', '#66ffee', '#33ffdd', '#00ffcc'],
  'carnival':       ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff', '#8800ff', '#ff0088'],
  'retro-rgb':      ['#c85500', '#dd7700', '#ee9900', '#ddbb00', '#bb8800', '#996600', '#775500'],
  'bubblegum-rgb':  ['#ff88aa', '#ffaacc', '#ffbbdd', '#ffccee', '#ffddee', '#ffccee', '#ffbbdd'],
  'cotton':         ['#ffaacc', '#ffbbdd', '#ddaaff', '#bbaaff', '#aabbff', '#bbaaff', '#ddaaff'],
  'mint-ice':       ['#aaffee', '#ccffee', '#ddfff0', '#eeffee', '#ccffff', '#aaffff', '#88ffee'],
  'lavender-rgb':   ['#cc99ff', '#ddaaff', '#eeccff', '#ffffee', '#eeddff', '#ddccff', '#cc99ff'],
  'electric-purple':['#8800ff', '#aa22ff', '#cc55ff', '#ee88ff', '#ddaaff', '#cc55ff', '#aa22ff'],
  'golden-hour':    ['#ff4400', '#ff6600', '#ff9900', '#ffbb00', '#ffdd00', '#ffbb00', '#ff9900'],
  'midnight-blue':  ['#000022', '#000055', '#000088', '#0011aa', '#2233bb', '#0011aa', '#000088'],
  'northern-lights':['#00ff88', '#00ffaa', '#00aaff', '#2200ff', '#8800ff', '#dd00ff', '#00ffaa'],
  'deep-ocean':     ['#000033', '#001155', '#002277', '#003399', '#1155bb', '#003399', '#002277'],
  'sunrise-rgb':    ['#221100', '#884422', '#cc6633', '#ff9966', '#ffcc88', '#ffee99', '#ffcc88'],
  'dusk-rgb':       ['#220033', '#553366', '#885588', '#bb7799', '#ddaacc', '#bb7799', '#885588'],
  'moonlight':      ['#001133', '#001155', '#aabbcc', '#ccddee', '#ddeeff', '#ccddee', '#aabbcc'],
  'tropical':       ['#ff4400', '#ff8800', '#ffdd00', '#00ff88', '#00aaff', '#aa00ff', '#ff0088'],
  'cyber-red':      ['#330000', '#660011', '#990022', '#cc0033', '#ff1144', '#ff3366', '#ff6699'],
  'toxic-waste':    ['#223300', '#446600', '#779900', '#aacc00', '#ddff00', '#bbee00', '#88cc00'],
  'lava-flow':      ['#1a0000', '#550000', '#aa2200', '#ff4400', '#ff6600', '#ff8800', '#ff4400'],
  'black-ice':      ['#001122', '#003366', '#005599', '#0077cc', '#00aaee', '#22ccff', '#00eeff'],
  'solar-flare':    ['#ffff00', '#ffee00', '#ffcc00', '#ffaa00', '#ff8800', '#ff6600', '#ff4400'],
  'cosmic-ray':     ['#00007a', '#3300cc', '#7700ff', '#cc44ff', '#ff88ff', '#cc44ff', '#7700ff'],
  'acid-rain':      ['#aaff00', '#ccff00', '#eeff00', '#ffff00', '#ddff00', '#aaff00', '#88ee00'],
  'oil-slick':      ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'],
  'prism-rgb':      ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'],
  'waterfall':      ['#001144', '#0055bb', '#2288ee', '#55aaff', '#88ccff', '#aaddff', '#cceeee'],
  'autumn-leaves':  ['#884400', '#cc6600', '#ee8800', '#ffaa00', '#ffcc33', '#ffee88', '#ffcc33'],
  'spring-bloom':   ['#ff88aa', '#ffaacc', '#ffddee', '#ccffcc', '#aaffaa', '#66ff88', '#aaffcc'],
  'winter-frost':   ['#aaccee', '#ccddff', '#ddeeff', '#eef8ff', '#ffffff', '#eef8ff', '#ddeeff'],
  'summer-heat':    ['#ff8800', '#ffaa00', '#ffcc00', '#ffee00', '#ffff00', '#ffee00', '#ffcc00'],
  'cherry':         ['#ffaabb', '#ffbbcc', '#ffccdd', '#ffddee', '#ffeeff', '#ffddee', '#ffccdd'],
  'bamboo-rgb':     ['#227700', '#338800', '#44aa00', '#55cc00', '#66ee00', '#55cc00', '#44aa00'],
  'koi':            ['#ff6600', '#ff8800', '#ffaa00', '#ffffff', '#ff4400', '#cc2200', '#ff8800'],
  'thunderstorm':   ['#221133', '#443355', '#666688', '#8888aa', '#aaaacc', '#8888aa', '#666688'],
  'blizzard':       ['#aabbcc', '#bbccdd', '#ddeeff', '#eef5ff', '#ffffff', '#eef5ff', '#ddeeff'],
  'volcanic':       ['#221100', '#663300', '#aa5500', '#ee7700', '#ffaa00', '#ffcc00', '#ffaa00'],
  'deep-sea':       ['#000022', '#001133', '#002255', '#003377', '#005599', '#003377', '#002255'],
  'pastel-rainbow': ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#d0baff', '#ffb3e6'],
  'ultraviolet':    ['#220033', '#550077', '#8800cc', '#aa33ff', '#cc66ff', '#aa33ff', '#8800cc'],
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function lerpColor(a: string, b: string, t: number) {
  const ra = parseInt(a.slice(1,3),16), ga = parseInt(a.slice(3,5),16), ba = parseInt(a.slice(5,7),16);
  const rb = parseInt(b.slice(1,3),16), gb = parseInt(b.slice(3,5),16), bb = parseInt(b.slice(5,7),16);
  const r = Math.round(ra + (rb-ra)*t), g = Math.round(ga + (gb-ga)*t), bl = Math.round(ba + (bb-ba)*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

function computeAmbientColor(phase: number, rgbMode: string, rgbOffset: number, rgbCustomColor: string): string | null {
  const palette = PALETTE_MAP[rgbMode] ?? getAutoPalette(rgbMode) ?? RAINBOW;
  const isBreathing = rgbMode === 'breathing' || rgbMode.startsWith('breathing-');
  const isPulse = rgbMode.startsWith('pulse-');
  if (isBreathing) {
    const breathIdx = phase * palette.length;
    return lerpColor(palette[Math.floor(breathIdx) % palette.length], palette[Math.ceil(breathIdx) % palette.length], breathIdx - Math.floor(breathIdx));
  }
  if (isPulse) {
    const raw = Math.sin(phase * Math.PI * 2);
    if (raw <= 0) return null;
    return palette[0];
  }
  switch (rgbMode) {
    case 'static-rainbow': {
      const idx = rgbOffset * RAINBOW.length;
      return lerpColor(RAINBOW[Math.floor(idx) % RAINBOW.length], RAINBOW[Math.ceil(idx) % RAINBOW.length], idx - Math.floor(idx));
    }
    case 'solid': return rgbCustomColor;
    case 'thunder':
    case 'disco':
    case 'reactive':
    case 'starlight': return null;
    default: {
      const perKeyPhase = (phase + rgbOffset * 0.8) % 1;
      const idx = perKeyPhase * palette.length;
      return lerpColor(palette[Math.floor(idx) % palette.length], palette[Math.ceil(idx) % palette.length], idx - Math.floor(idx));
    }
  }
}

const DISCO_PALETTE = ['#ff5b55', '#ff9f1c', '#ffd447', '#38e29d', '#33a1ff', '#b45cff', '#ff7eb3', '#00ffcc', '#ff6f3c'];
function randomDiscoColor() { return DISCO_PALETTE[Math.floor(Math.random() * DISCO_PALETTE.length)]; }

const NO_AUDIO_KEYS = new Set(['ShiftLeft', 'ShiftRight', 'ContextMenu', 'Escape']);
const SUSTAIN_CLASSES = new Set([
  'piano', 'flute', 'bass', 'pad', 'synth', 'violin', 'saxophone',
  'organ', 'bass-ext', 'accordion', 'french-horn', 'vocoder', 'theremin',
  'trumpet', 'acoustic-guitar'
]);
const RELEASE_TIMES: Record<string, number> = {
  piano: 0.3, flute: 0.35, bass: 0.4, pad: 0.7, synth: 0.25,
  violin: 0.35, saxophone: 0.3, organ: 0.1, 'bass-ext': 0.45,
  accordion: 0.28, 'french-horn': 0.32, vocoder: 0.35, theremin: 0.5,
  trumpet: 0.25, 'acoustic-guitar': 0.35,
};

// Musical note labels for piano keys (A-Z)
const KEY_NOTE_LABELS: Record<string, string> = {
  KeyA: 'C4', KeyS: 'D4', KeyD: 'E4', KeyF: 'F4', KeyG: 'G4',
  KeyH: 'A4', KeyJ: 'B4', KeyK: 'C5', KeyL: 'D5',
  KeyQ: 'E5', KeyW: 'F5', KeyE: 'G5', KeyR: 'A5', KeyT: 'B5',
  KeyY: 'C6', KeyU: 'D6', KeyI: 'E6', KeyO: 'F6', KeyP: 'G6',
  KeyZ: 'A3', KeyX: 'B3', KeyC: 'C3', KeyV: 'D3', KeyB: 'E3',
  KeyN: 'F3', KeyM: 'G3',
};

function KeyComponent({ id, label, sub, widthMultiplier = 1, instrumentClass, rgbOffset = 0 }: KeyProps) {
  const isMobileLandscape = useMobileLandscape();
  const isPortraitPhone = useIsPortraitPhone();
  const isCompactKey = isMobileLandscape || isPortraitPhone;
  const {
    isPressed, shiftHeld,
    rgbEnabled, visualsEnabled, rgbMode, rgbCustomColor, glowIntensity,
    rainbowModeEnabled, fadeDuration, getNextRainbowColor, pressKey, releaseKey,
    showHeatmap, keyHeatmap, showNoteLabels,
    keyShape, keyPressEffect, keyShadowIntensity, keyGlowSpread, keyGlowBlur,
    keyBorderStyle, keyShimmer, mirrorKeyboard, keyLabelStyle, showFingerGuide,
  } = useStore(useShallow(s => ({
    isPressed: s.activeKeys.has(id),
    shiftHeld: s.activeKeys.has('ShiftLeft') || s.activeKeys.has('ShiftRight'),
    rgbEnabled: s.rgbEnabled,
    visualsEnabled: s.visualsEnabled,
    rgbMode: s.rgbMode,
    rgbCustomColor: s.rgbCustomColor,
    glowIntensity: s.glowIntensity,
    rainbowModeEnabled: s.rainbowModeEnabled,
    fadeDuration: s.fadeDuration,
    getNextRainbowColor: s.getNextRainbowColor,
    pressKey: s.pressKey,
    releaseKey: s.releaseKey,
    showHeatmap: s.showHeatmap,
    keyHeatmap: s.keyHeatmap,
    showNoteLabels: s.showNoteLabels,
    keyShape: s.keyShape,
    keyPressEffect: s.keyPressEffect,
    keyShadowIntensity: s.keyShadowIntensity,
    keyGlowSpread: s.keyGlowSpread,
    keyGlowBlur: s.keyGlowBlur,
    keyBorderStyle: s.keyBorderStyle,
    keyShimmer: s.keyShimmer,
    keySpacing: s.keySpacing,
    mirrorKeyboard: s.mirrorKeyboard,
    keyLabelStyle: s.keyLabelStyle,
    showFingerGuide: s.showFingerGuide,
  })));

  const keyRef = useRef<HTMLDivElement>(null);
  const isPressedRef = useRef(false);
  const isAfterGlowRef = useRef(false);
  const settingsRef = useRef({ rgbEnabled, visualsEnabled, rgbMode, rgbCustomColor, glowIntensity, rgbOffset });
  const [keyRainbowColor, setKeyRainbowColor] = useState<string | null>(null);
  const prevPressed = useRef(false);
  const wasShifted = useRef(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [rippleCount, setRippleCount] = useState(0);
  const [afterGlow, setAfterGlow] = useState(false);
  const afterGlowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [starlitBrightness, setStarlitBrightness] = useState(0);
  const starlightRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeDurationRef = useRef(fadeDuration);
  // For thunder/disco per-key colors applied via DOM
  const extraColorRef = useRef<string | null>(null);
  // For disco: each key has its own color
  const [discoColor, setDiscoColor] = useState<string | null>(null);

  useEffect(() => { isPressedRef.current = isPressed; }, [isPressed]);
  useEffect(() => { isAfterGlowRef.current = afterGlow; }, [afterGlow]);
  useEffect(() => {
    settingsRef.current = { rgbEnabled, visualsEnabled, rgbMode, rgbCustomColor, glowIntensity, rgbOffset };
  }, [rgbEnabled, visualsEnabled, rgbMode, rgbCustomColor, glowIntensity, rgbOffset]);
  useEffect(() => { fadeDurationRef.current = fadeDuration; }, [fadeDuration]);

  // Starlight effect
  useEffect(() => {
    if (rgbMode !== 'starlight' || !rgbEnabled) { setStarlitBrightness(0); return; }
    let mounted = true;
    const scheduleFlash = () => {
      const delay = 700 + Math.random() * 4000;
      starlightRef.current = setTimeout(() => {
        if (!mounted) return;
        setStarlitBrightness(0.4 + Math.random() * 0.6);
        setTimeout(() => {
          if (!mounted) return;
          setStarlitBrightness(0);
          scheduleFlash();
        }, 250 + Math.random() * 450);
      }, delay);
    };
    starlightRef.current = setTimeout(scheduleFlash, Math.random() * 3500);
    return () => {
      mounted = false;
      if (starlightRef.current) clearTimeout(starlightRef.current);
    };
  }, [rgbMode, rgbEnabled]);

  const applyAmbientStyle = (phase: number) => {
    const el = keyRef.current;
    if (!el) return;
    const s = settingsRef.current;
    if (!s.rgbEnabled || !s.visualsEnabled) {
      el.style.removeProperty('box-shadow');
      el.style.removeProperty('border-color');
      el.style.removeProperty('background');
      return;
    }
    if (s.rgbMode === 'reactive' || s.rgbMode === 'starlight' || s.rgbMode === 'thunder' || s.rgbMode === 'disco') return;

    const color = computeAmbientColor(phase, s.rgbMode, s.rgbOffset, s.rgbCustomColor);
    if (!color) {
      el.style.removeProperty('box-shadow');
      el.style.removeProperty('border-color');
      el.style.removeProperty('background');
      return;
    }
    let intensityMult = 1.0;
    if (s.rgbMode === 'breathing' || s.rgbMode.startsWith('breathing-')) {
      intensityMult = 0.15 + 0.85 * ((Math.sin(phase * Math.PI * 2 - Math.PI / 2) + 1) / 2);
    } else if (s.rgbMode.startsWith('pulse-')) {
      const raw = Math.sin(phase * Math.PI * 2);
      intensityMult = raw > 0 ? Math.pow(raw, 0.3) : 0;
    }
    const intensity = (s.glowIntensity / 100) * intensityMult;
    const rgb = hexToRgb(color);
    el.style.boxShadow = `0 0 ${7*intensity}px rgba(${rgb},0.65), 0 0 ${16*intensity}px rgba(${rgb},0.32), inset 0 0 ${9*intensity}px rgba(${rgb},0.25)`;
    el.style.borderColor = `rgba(${rgb},0.7)`;
    el.style.background = `rgba(${rgb},0.055)`;
  };

  // RGB phase event
  useEffect(() => {
    const handlePhase = (e: Event) => {
      if (isPressedRef.current || isAfterGlowRef.current) return;
      const phase = (e as CustomEvent<{ phase: number }>).detail.phase;
      applyAmbientStyle(phase);
    };
    window.addEventListener('rgb-phase', handlePhase);
    return () => window.removeEventListener('rgb-phase', handlePhase);
  }, []);

  // Thunder event — per-key flashes
  useEffect(() => {
    const handleThunder = (e: Event) => {
      const { keyId, color } = (e as CustomEvent<{ keyId: string; color: string | null }>).detail;
      if (keyId !== id) return;
      const el = keyRef.current;
      if (!el) return;
      if (color) {
        const rgb = hexToRgb(color);
        el.style.boxShadow = `0 0 12px rgba(${rgb},0.9), 0 0 30px rgba(${rgb},0.6), inset 0 0 15px rgba(${rgb},0.5)`;
        el.style.borderColor = color;
        el.style.background = `rgba(${rgb}, 0.18)`;
      } else {
        el.style.removeProperty('box-shadow');
        el.style.removeProperty('border-color');
        el.style.removeProperty('background');
      }
    };
    window.addEventListener('thunder-hit', handleThunder);
    return () => window.removeEventListener('thunder-hit', handleThunder);
  }, [id]);

  // Disco event — randomize all key colors on each tick
  useEffect(() => {
    const handleDisco = () => {
      if (isPressedRef.current || isAfterGlowRef.current) return;
      const s = settingsRef.current;
      if (!s.rgbEnabled || !s.visualsEnabled) return;
      const el = keyRef.current;
      if (!el) return;
      const color = randomDiscoColor();
      const rgb = hexToRgb(color);
      const intensity = s.glowIntensity / 100;
      el.style.boxShadow = `0 0 ${7*intensity}px rgba(${rgb},0.65), 0 0 ${16*intensity}px rgba(${rgb},0.32), inset 0 0 ${9*intensity}px rgba(${rgb},0.25)`;
      el.style.borderColor = `rgba(${rgb},0.7)`;
      el.style.background = `rgba(${rgb},0.055)`;
    };
    window.addEventListener('disco-tick', handleDisco);
    return () => window.removeEventListener('disco-tick', handleDisco);
  }, []);

  // Static modes: apply on change
  useEffect(() => {
    if (!keyRef.current) return;
    if (!rgbEnabled || !visualsEnabled || ['reactive', 'starlight', 'thunder', 'disco'].includes(rgbMode)) {
      keyRef.current.style.removeProperty('box-shadow');
      keyRef.current.style.removeProperty('border-color');
      keyRef.current.style.removeProperty('background');
      return;
    }
    if (rgbMode === 'static-rainbow' || rgbMode === 'solid') {
      applyAmbientStyle(0);
    }
  }, [rgbEnabled, visualsEnabled, rgbMode, rgbCustomColor, glowIntensity, rgbOffset]);

  // Key press audio + visuals
  useEffect(() => {
    if (isPressed && !prevPressed.current) {
      prevPressed.current = true;
      if (afterGlowTimer.current) clearTimeout(afterGlowTimer.current);
      setAfterGlow(false);
      setRippleCount(c => c + 1);
      if (rainbowModeEnabled) setKeyRainbowColor(getNextRainbowColor());

      audioEngine.init();
      if (!NO_AUDIO_KEYS.has(id)) {
        if (id === 'Backspace') {
          audioEngine.stopAll();
        } else {
          const activeKeys = useStore.getState().activeKeys;
          const shiftDown = activeKeys.has('ShiftLeft') || activeKeys.has('ShiftRight');
          wasShifted.current = shiftDown;
          audioEngine.playKeyAudio(id, 0.75, shiftDown);
          if (id === 'ShiftLeft' || id === 'ShiftRight') audioEngine.setVelocityBoost(true);
        }
      }
    } else if (!isPressed && prevPressed.current) {
      prevPressed.current = false;
      setAfterGlow(true);
      afterGlowTimer.current = setTimeout(() => {
        setAfterGlow(false);
        afterGlowTimer.current = null;
      }, fadeDurationRef.current);

      if (id === 'ShiftLeft' || id === 'ShiftRight') audioEngine.setVelocityBoost(false);
      if (wasShifted.current && id.startsWith('Digit')) {
        audioEngine.stopNote(`${id}_shift`, 0.35);
        wasShifted.current = false;
        return;
      }
      wasShifted.current = false;
      if (instrumentClass && SUSTAIN_CLASSES.has(instrumentClass)) {
        const rel = RELEASE_TIMES[instrumentClass] ?? 0.3;
        audioEngine.stopNote(id, rel);
        if (id === 'Enter' || id === 'NumpadEnter') {
          ['chord_c', 'chord_e', 'chord_g', 'chord_c2'].forEach(cn => audioEngine.stopNote(cn, 0.4));
        }
      }
    }
  }, [isPressed]);

  useEffect(() => () => { if (afterGlowTimer.current) clearTimeout(afterGlowTimer.current); }, []);

  const effectiveClass = (shiftHeld && id.startsWith('Digit')) ? 'flute' : (instrumentClass ?? 'system');
  const instrumentColor = INSTRUMENT_COLORS[effectiveClass] || '#ffffff';
  const isVisuallyActive = isPressed || afterGlow;
  const glowColor = isVisuallyActive
    ? (rainbowModeEnabled && keyRainbowColor ? keyRainbowColor : instrumentColor)
    : null;
  const baseIntensity = (glowIntensity / 100) * (visualsEnabled ? 1 : 0);
  const activeIntensity = isPressed ? baseIntensity : baseIntensity * 0.6;

  const baseStyle: React.CSSProperties = {
    flexGrow: widthMultiplier,
    flexShrink: widthMultiplier,
    flexBasis: `${widthMultiplier * 2.5}rem`,
    minWidth: 0,
  };

  const pressedStyle: React.CSSProperties = isVisuallyActive && glowColor ? {
    boxShadow: `
      0 0 ${8 * activeIntensity}px rgba(${hexToRgb(glowColor)}, 0.95),
      0 0 ${22 * activeIntensity}px rgba(${hexToRgb(glowColor)}, 0.7),
      0 0 ${45 * activeIntensity}px rgba(${hexToRgb(glowColor)}, 0.45),
      inset 0 0 ${12 * activeIntensity}px rgba(${hexToRgb(glowColor)}, 0.6)
    `,
    borderColor: glowColor,
    background: `linear-gradient(160deg, rgba(${hexToRgb(glowColor)}, ${isPressed ? 0.32 : 0.16}) 0%, rgba(${hexToRgb(glowColor)}, ${isPressed ? 0.14 : 0.06}) 100%)`,
    transform: isPressed ? 'translateY(2px) scale(0.962)' : 'translateY(1px) scale(0.978)',
    color: glowColor,
  } : {};

  const starlightAmbientStyle: React.CSSProperties = !isVisuallyActive && rgbMode === 'starlight' && rgbEnabled && visualsEnabled && starlitBrightness > 0 ? (() => {
    const color = lerpColor('#ffffff', '#33a1ff', 0.3);
    const intensity = baseIntensity * starlitBrightness;
    const rgb = hexToRgb(color);
    return {
      boxShadow: `0 0 ${7*intensity}px rgba(${rgb},0.65), 0 0 ${16*intensity}px rgba(${rgb},0.32), inset 0 0 ${9*intensity}px rgba(${rgb},0.25)`,
      borderColor: `rgba(${rgb},0.7)`,
      background: `rgba(${rgb},0.055)`,
      transition: 'box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease',
    };
  })() : {};

  // Heatmap overlay
  const heatmapCount = (showHeatmap && keyHeatmap) ? (keyHeatmap[id] ?? 0) : 0;
  const heatmapMax = (showHeatmap && keyHeatmap) ? Math.max(1, ...Object.values(keyHeatmap)) : 1;
  const heatmapNorm = heatmapCount / heatmapMax;
  const heatmapStyle: React.CSSProperties = showHeatmap && heatmapCount > 0 ? {
    '--heatmap-opacity': `${heatmapNorm * 0.65}`,
  } as any : {};

  const instrName = instrumentClass ? INSTRUMENT_NAMES[instrumentClass] : null;
  const noteLabel = showNoteLabels ? KEY_NOTE_LABELS[id] : null;

  const KEY_SHAPE_RADIUS: Record<string, string> = {
    rounded: '0.375rem',
    square:  '0.1rem',
    pill:    '9999px',
    sharp:   '0',
    gem:     '0.6rem 0.1rem 0.6rem 0.1rem',
  };

  const keyShapeStyle: React.CSSProperties = {
    borderRadius: KEY_SHAPE_RADIUS[keyShape] || KEY_SHAPE_RADIUS.rounded,
  };

  const keyBorderCSS: React.CSSProperties = (() => {
    if (keyBorderStyle === 'none') return { border: 'none' };
    if (keyBorderStyle === 'double') return { outline: '2px solid rgba(255,255,255,0.12)', outlineOffset: '-2px' };
    return {};
  })();

  const shimmerClass = keyShimmer ? 'key-shimmer' : '';

  const effectClass = (() => {
    if (!isPressed) return '';
    switch (keyPressEffect) {
      case 'bounce':    return 'key-effect-bounce';
      case 'scale':     return 'key-effect-scale';
      case 'pop':       return 'key-effect-pop';
      case 'wobble':    return 'key-effect-wobble';
      case 'shockwave': return 'key-effect-shockwave';
      default:          return '';
    }
  })();

  return (
    <div
      ref={keyRef}
      data-key-id={id}
      className={cn(
        'glass-key key-btn flex flex-col justify-end cursor-pointer select-none relative overflow-hidden touch-none',
        isCompactKey ? 'p-[3px]' : 'p-1.5',
        isPressed ? 'pressed' : 'idle',
        shimmerClass,
        effectClass,
      )}
      style={{ ...baseStyle, ...(isVisuallyActive ? pressedStyle : starlightAmbientStyle), ...heatmapStyle, ...keyShapeStyle, ...keyBorderCSS, minHeight: 'var(--key-row-h)' }}
      onPointerDown={(e) => { e.preventDefault(); pressKey(id); }}
      onPointerUp={() => releaseKey(id)}
      onPointerEnter={(e) => { if (e.buttons > 0) pressKey(id); setShowTooltip(true); }}
      onPointerLeave={() => { releaseKey(id); setShowTooltip(false); }}
      onPointerCancel={() => releaseKey(id)}
    >
      {/* Instrument color stripe */}
      {instrumentClass && instrumentClass !== 'system' && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg"
          style={{
            backgroundColor: INSTRUMENT_COLORS[instrumentClass] || 'transparent',
            opacity: isVisuallyActive ? 1 : 0.55,
            boxShadow: isVisuallyActive ? `0 0 6px ${INSTRUMENT_COLORS[instrumentClass]}` : undefined,
          }}
        />
      )}

      {/* Heatmap overlay */}
      {showHeatmap && heatmapCount > 0 && (
        <div
          className="absolute inset-0 rounded-md pointer-events-none z-[1]"
          style={{
            backgroundColor: `rgba(255, 80, 60, ${heatmapNorm * 0.55})`,
            boxShadow: `inset 0 0 ${8 * heatmapNorm}px rgba(255,80,60,${heatmapNorm * 0.5})`,
          }}
        />
      )}

      {/* Instrument tooltip */}
      {showTooltip && instrName && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none">
          <div className="bg-black/95 text-white text-[0.52rem] px-2 py-1 rounded-lg whitespace-nowrap border border-white/12 shadow-xl">
            {instrName}{noteLabel ? ` · ${noteLabel}` : ''}
          </div>
        </div>
      )}

      {/* Ripple */}
      {rippleCount > 0 && glowColor && (
        <span
          key={rippleCount}
          className="key-ripple"
          style={{ background: `radial-gradient(circle, rgba(${hexToRgb(glowColor)}, 0.72) 0%, transparent 70%)` }}
        />
      )}

      {/* Sub label */}
      {sub && !isCompactKey && (
        <span className="absolute top-1 left-1.5 text-[0.44rem] leading-none opacity-40 font-mono select-none text-white/70">
          {sub}
        </span>
      )}

      {/* Note label */}
      {noteLabel && !isCompactKey && (
        <span className="absolute top-1 right-1 text-[0.38rem] leading-none font-mono select-none text-white/35" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {noteLabel}
        </span>
      )}

      {/* Main label */}
      <span className={cn(
        'font-bold leading-none tracking-tight select-none relative z-10',
        isCompactKey ? 'text-[0.62rem]' : 'text-[0.55rem] sm:text-[0.62rem]',
        isVisuallyActive ? 'text-white' : 'text-white/75'
      )}>
        {label}
      </span>
    </div>
  );
}

export const Key = memo(KeyComponent);
