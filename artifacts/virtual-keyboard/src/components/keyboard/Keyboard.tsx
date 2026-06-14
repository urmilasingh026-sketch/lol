import { useEffect, useRef } from 'react';
import { KEYBOARD_LAYOUT, MOBILE_LANDSCAPE_LAYOUT } from './layout';
import { Key } from './Key';
import { useStore } from '@/store';
import { audioEngine } from '@/lib/audio';
import { useMobileLandscape, useLowEndDevice, useIsPortraitPhone } from '@/hooks/use-mobile-landscape';

const RAINBOW = ['#ff5b55', '#ff9f1c', '#ffd447', '#38e29d', '#33a1ff', '#5f6bff', '#b45cff'];

// Auto-generate palettes for wave-{color}, breathing-{color}, pulse-{color} families
const COLOR_SHADES: Record<string, string[]> = {
  'red':       ['#ff0000','#cc0000','#ff3333','#ff6666','#ff0000','#aa0000','#ff3333'],
  'blue':      ['#0000ff','#0033cc','#2255ff','#4477ff','#2266ff','#0044cc','#0022aa'],
  'green':     ['#00ff00','#00cc00','#33ff33','#66ff66','#00dd00','#00aa00','#338800'],
  'pink':      ['#ff66aa','#ff88bb','#ff44cc','#ff99dd','#ff33aa','#ff77bb','#ff55aa'],
  'cyan':      ['#00ffff','#00cccc','#33ffff','#66ffff','#00eeee','#00aaaa','#55ffff'],
  'orange':    ['#ff8800','#ff9900','#ffaa00','#ff6600','#ff7700','#ff9922','#ff8833'],
  'purple':    ['#9900cc','#aa00ee','#bb22ff','#8800bb','#cc44ff','#9922dd','#7700bb'],
  'yellow':    ['#ffff00','#ffee00','#ffcc00','#eeee00','#ffff33','#cccc00','#ffee33'],
  'white':     ['#ffffff','#eeeeee','#dddddd','#cccccc','#eeeeee','#ffffff','#eeeeee'],
  'gold':      ['#ffd700','#ffcc00','#ffbb00','#ffaa00','#eebb00','#ffcc33','#ffdd66'],
  'teal':      ['#009999','#00aaaa','#00bbbb','#00cccc','#00aabb','#008899','#009988'],
  'magenta':   ['#ff00ff','#cc00cc','#ee00ee','#ff44ff','#dd00ee','#aa00bb','#ff22ff'],
  'lime':      ['#88ff00','#99ff00','#aaff00','#bbff00','#77ff00','#66ee00','#88ee00'],
  'coral':     ['#ff7755','#ff6644','#ff8866','#ff9977','#ff5544','#ff7766','#ff8877'],
  'indigo':    ['#330099','#4400bb','#5511cc','#6622dd','#4400aa','#3300aa','#5522cc'],
  'silver':    ['#aaaaaa','#bbbbbb','#cccccc','#dddddd','#c0c0c0','#b0b0b0','#aaaaaa'],
  'rose':      ['#ff6677','#ff8888','#ff9999','#ffaaaa','#ff5566','#ff7788','#ff6688'],
  'amber':     ['#ffaa00','#ffbb00','#ff9900','#ffcc00','#ee9900','#dd8800','#ffbb22'],
  'emerald':   ['#00aa66','#00cc77','#00bb77','#00dd88','#009966','#00aa55','#00cc66'],
  'sapphire':  ['#0044cc','#0055dd','#0066ee','#2277ff','#0033bb','#0044cc','#1155dd'],
  'ruby':      ['#cc0022','#dd0033','#ee0044','#ff1155','#bb0011','#cc0033','#ee1144'],
  'turquoise': ['#00ccbb','#00eecc','#00ddbb','#00ffcc','#00bbaa','#00ccaa','#00ddbb'],
  'crimson':   ['#aa0022','#bb0033','#cc0044','#dd1155','#990011','#aa0033','#cc1144'],
  'lavender':  ['#bbaaff','#ccbbff','#ddb0ff','#eeccff','#aaaaff','#ccaaff','#ddbbff'],
  'midnight':  ['#000044','#000066','#001188','#1122aa','#000055','#000077','#001199'],
  'sunset':    ['#ff4400','#ff6600','#ff9900','#ffbb00','#ff7700','#ff5500','#ff8800'],
  'arctic':    ['#aaddff','#bbeeee','#ccffff','#ddeeff','#aaccff','#bbddff','#cceeee'],
  'sakura':    ['#ffccdd','#ffddee','#ffaabb','#ff99cc','#ffbbcc','#ffddee','#ffccee'],
  'tropical':  ['#ff6600','#ffaa00','#00ff88','#00aaff','#aa00ff','#ff00aa','#ffaa00'],
  'cosmic':    ['#4400cc','#8800ee','#cc00ff','#00ccff','#ff00cc','#6600cc','#9900ff'],
  'rainbow':   RAINBOW,
  'aurora':    ['#00ff88','#00ffcc','#00ccff','#7c3aed','#8b5cf6','#6d28d9','#00ff88'],
  'fire':      ['#ff0000','#ff3300','#ff6600','#ff9900','#ffcc00','#ff6600','#ff3300'],
  'ice':       ['#e0f7ff','#b3e9ff','#66d4ff','#33baff','#0099cc','#33baff','#66d4ff'],
  'neon':      ['#ff0080','#00ffff','#ff00ff','#00ff00','#ffff00','#ff0080','#00ffff'],
  'pastel':    ['#ff9de2','#ffb3ba','#ffdfba','#ffffba','#baffc9','#bae1ff','#c9baff'],
  'deep':      ['#1a0033','#2d0052','#440080','#6600cc','#8833ee','#6600cc','#440080'],
  'soft':      ['#ccaadd','#bbbbee','#aaccdd','#aaddcc','#bbddaa','#ccddaa','#ddccaa'],
  'slow':      RAINBOW,
  'fast':      RAINBOW,
  'ultra':     RAINBOW,
};

function getAutoPalette(modeId: string): string[] | null {
  const families = ['wave-', 'breathing-', 'pulse-', 'ripple-', 'flash-'];
  for (const prefix of families) {
    if (modeId.startsWith(prefix)) {
      const color = modeId.slice(prefix.length);
      return COLOR_SHADES[color] ?? null;
    }
  }
  return null;
}

const PALETTE_MAP: Record<string, string[]> = {
  'wave':           RAINBOW,
  'breathing':      RAINBOW,
  'starlight':      RAINBOW,
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

function lerpColor(a: string, b: string, t: number) {
  const ra = parseInt(a.slice(1,3),16), ga = parseInt(a.slice(3,5),16), ba = parseInt(a.slice(5,7),16);
  const rb = parseInt(b.slice(1,3),16), gb = parseInt(b.slice(3,5),16), bb = parseInt(b.slice(5,7),16);
  const r = Math.round(ra + (rb-ra)*t), g = Math.round(ga + (gb-ga)*t), bl = Math.round(ba + (bb-ba)*t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

function phaseToColor(phase: number, palette = RAINBOW): string {
  const idx = (phase % 1) * palette.length;
  const i1 = Math.floor(idx) % palette.length;
  const i2 = (i1 + 1) % palette.length;
  return lerpColor(palette[i1], palette[i2], idx - Math.floor(idx));
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const r = parseInt(full.slice(0,2), 16) || 0;
  const g = parseInt(full.slice(2,4), 16) || 0;
  const b = parseInt(full.slice(4,6), 16) || 0;
  return `${r}, ${g}, ${b}`;
}

function randomColor(palette: string[]) {
  return palette[Math.floor(Math.random() * palette.length)];
}

export function Keyboard() {
  const {
    pressKey, releaseKey, rgbEnabled, animationSpeed, setRgbPhase, keySize, rgbPhase,
    volume, soundCategory, reverbEnabled, delayEnabled, chorusEnabled, distortionEnabled,
    compressionEnabled, metronomeEnabled, bpm, visualsEnabled, rgbMode, rgbCustomColor,
  } = useStore();
  const isMobileLandscape = useMobileLandscape();
  const isPortraitPhone = useIsPortraitPhone();
  const isLowEnd = useLowEndDevice();
  const performanceMode = useStore(s => s.performanceMode);
  const autoPerformanceMode = useStore(s => s.autoPerformanceMode);
  const effectivePerf = performanceMode || (autoPerformanceMode && isLowEnd);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef(0);
  const lastTimeRef = useRef<number>(0);
  const lastStoreUpdateRef = useRef<number>(0);
  const audioInitDone = useRef(false);
  const slideKeyRef = useRef<string | null>(null);

  // Thunder: track which keys are randomly lit
  const thunderStateRef = useRef<Record<string, string>>({});
  const lastThunderRef = useRef(0);

  const syncAudioState = () => {
    if (audioInitDone.current) return;
    audioInitDone.current = true;
    audioEngine.init();
    audioEngine.setVolume(volume);
    audioEngine.setSoundCategory(soundCategory);
    audioEngine.toggleEffect('reverb', reverbEnabled);
    audioEngine.toggleEffect('delay', delayEnabled);
    audioEngine.toggleEffect('chorus', chorusEnabled);
    audioEngine.toggleEffect('distortion', distortionEnabled);
    audioEngine.toggleEffect('compression', compressionEnabled);
    if (metronomeEnabled) audioEngine.setMetronome(true, bpm);
  };

  useEffect(() => {
    // Target 30fps on mobile/low-end, 60fps on desktop
    const targetMs = (isMobileLandscape || isPortraitPhone || effectivePerf) ? 1000 / 30 : 1000 / 60;

    const animate = (time: number) => {
      rafRef.current = requestAnimationFrame(animate);
      if (lastTimeRef.current === 0) { lastTimeRef.current = time; return; }
      if (time - lastTimeRef.current < targetMs) return;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      if (rgbEnabled && !['static-rainbow', 'solid', 'reactive'].includes(rgbMode)) {
        phaseRef.current = (phaseRef.current + delta * (1 / 4) * animationSpeed) % 1;
        window.dispatchEvent(new CustomEvent('rgb-phase', { detail: { phase: phaseRef.current } }));

        // Thunder: randomly strike keys
        if (rgbMode === 'thunder' && time - lastThunderRef.current > 200 / animationSpeed) {
          lastThunderRef.current = time;
          const allKeys = document.querySelectorAll('[data-key-id]');
          if (allKeys.length > 0 && Math.random() < 0.3) {
            const target = allKeys[Math.floor(Math.random() * allKeys.length)] as HTMLElement;
            const keyId = target.dataset.keyId!;
            thunderStateRef.current[keyId] = randomColor(['#ffffff', '#ffffc0', '#c0f0ff', '#5f6bff']);
            window.dispatchEvent(new CustomEvent('thunder-hit', { detail: { keyId, color: thunderStateRef.current[keyId] } }));
            setTimeout(() => {
              delete thunderStateRef.current[keyId];
              window.dispatchEvent(new CustomEvent('thunder-hit', { detail: { keyId, color: null } }));
            }, 80 + Math.random() * 120);
          }
        }

        // Disco: each cycle randomize all key colors
        if (rgbMode === 'disco' && time - lastThunderRef.current > 150 / animationSpeed) {
          lastThunderRef.current = time;
          window.dispatchEvent(new CustomEvent('disco-tick', { detail: {} }));
        }

        const storeInterval = isMobileLandscape || isPortraitPhone || effectivePerf ? 400 : 200;
        if (time - lastStoreUpdateRef.current >= storeInterval) {
          lastStoreUpdateRef.current = time;
          setRgbPhase(phaseRef.current);
        }
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rgbEnabled, animationSpeed, setRgbPhase, rgbMode, isMobileLandscape, isPortraitPhone, effectivePerf]);

  useEffect(() => {
    const initAudio = () => { syncAudioState(); };
    window.addEventListener('pointerdown', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (!['F12', 'F5'].includes(e.key)) e.preventDefault();
      pressKey(e.code);
    };
    const handleKeyUp = (e: KeyboardEvent) => { releaseKey(e.code); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, [pressKey, releaseKey]);

  useEffect(() => {
    const handleVisibility = () => { if (document.visibilityState === 'visible') audioEngine.resume(); };
    const handleFocus = () => { audioEngine.resume(); };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const handleBlur = () => {
      const { activeKeys, releaseKey: rk } = useStore.getState();
      activeKeys.forEach(code => rk(code));
      audioEngine.stopAll();
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  const scale = keySize / 100;

  const getPalette = () => PALETTE_MAP[rgbMode] ?? getAutoPalette(rgbMode) ?? RAINBOW;

  const isBreathingMode = rgbMode === 'breathing' || rgbMode.startsWith('breathing-');
  const isPulseMode = rgbMode.startsWith('pulse-');

  const getFrameColors = (): { main: string | null; secondary: string | null } => {
    if (!rgbEnabled || !visualsEnabled) return { main: null, secondary: null };
    const palette = getPalette();
    if (isBreathingMode) {
      const breathMult = 0.2 + 0.8 * ((Math.sin(rgbPhase * Math.PI * 2 - Math.PI / 2) + 1) / 2);
      return breathMult > 0.05
        ? { main: phaseToColor(rgbPhase, palette), secondary: phaseToColor((rgbPhase + 0.33) % 1, palette) }
        : { main: null, secondary: null };
    }
    if (isPulseMode) {
      // Sharp pulse: near-binary on/off
      const raw = Math.sin(rgbPhase * Math.PI * 2);
      const pulseMult = raw > 0 ? Math.pow(raw, 0.3) : 0;
      return pulseMult > 0.05
        ? { main: phaseToColor(0, palette), secondary: phaseToColor(0.33, palette) }
        : { main: null, secondary: null };
    }
    if (rgbMode === 'static-rainbow') return { main: RAINBOW[0], secondary: RAINBOW[3] };
    if (rgbMode === 'starlight') return { main: '#1a1a3a', secondary: '#0a0a20' };
    if (rgbMode === 'solid') return { main: rgbCustomColor, secondary: rgbCustomColor };
    if (rgbMode === 'thunder') return { main: '#1a1a3a', secondary: '#0a0a20' };
    if (rgbMode === 'disco') return { main: randomColor(RAINBOW), secondary: randomColor(RAINBOW) };
    if (rgbMode === 'reactive') return { main: null, secondary: null };
    return { main: phaseToColor(rgbPhase, palette), secondary: phaseToColor((rgbPhase + 0.33) % 1, palette) };
  };

  const { main: frameColor, secondary: frameColor2 } = getFrameColors();

  const breathingFrameMult = isBreathingMode
    ? 0.2 + 0.8 * ((Math.sin(rgbPhase * Math.PI * 2 - Math.PI / 2) + 1) / 2)
    : isPulseMode
      ? (() => { const raw = Math.sin(rgbPhase * Math.PI * 2); return raw > 0 ? Math.pow(raw, 0.3) : 0; })()
      : 1;

  const frameGlowStyle: React.CSSProperties = frameColor ? {
    boxShadow: `
      0 25px 60px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 0 ${18 * breathingFrameMult}px rgba(${hexToRgb(frameColor)}, 0.55),
      0 0 ${55 * breathingFrameMult}px rgba(${hexToRgb(frameColor)}, 0.28),
      0 0 ${100 * breathingFrameMult}px rgba(${hexToRgb(frameColor2 ?? frameColor)}, 0.14),
      inset 0 0 ${30 * breathingFrameMult}px rgba(${hexToRgb(frameColor)}, 0.08)
    `,
    borderColor: `rgba(${hexToRgb(frameColor)}, ${0.45 * breathingFrameMult})`,
  } : { boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)' };

  const getStripGradient = (offset: number) => {
    if (rgbMode === 'solid') return rgbCustomColor;
    if (rgbMode === 'static-rainbow') return `linear-gradient(90deg, ${RAINBOW.join(', ')})`;
    const palette = getPalette();
    return `linear-gradient(90deg, ${
      [0, 0.14, 0.28, 0.42, 0.56, 0.70, 0.85].map(d => phaseToColor((rgbPhase + offset + d) % 1, palette)).join(', ')
    })`;
  };

  const isCompactMode = isMobileLandscape || isPortraitPhone;
  const mobileLandscapeScale = isCompactMode ? 1 : scale;
  const activeLayout = isCompactMode ? MOBILE_LANDSCAPE_LAYOUT : KEYBOARD_LAYOUT;

  return (
    <div className="w-full" style={{ transform: `scale(${mobileLandscapeScale})`, transformOrigin: 'bottom center' }}>
      <div className="keyboard-frame w-full relative overflow-hidden">
        <div
          className="glass-keyboard-body rounded-xl sm:rounded-2xl flex flex-col relative overflow-hidden"
          style={{
            ...frameGlowStyle,
            paddingTop: 'var(--key-body-pad)', paddingLeft: 'var(--key-body-pad)',
            paddingRight: 'var(--key-body-pad)', paddingBottom: '0',
            gap: 'var(--key-gap)', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
          }}
          onPointerMove={(e) => {
            if (e.buttons === 0) return;
            const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
            const keyEl = el?.closest?.('[data-key-id]') as HTMLElement | null;
            const keyId = keyEl?.dataset?.keyId ?? null;
            if (keyId && keyId !== slideKeyRef.current) {
              if (slideKeyRef.current) releaseKey(slideKeyRef.current);
              slideKeyRef.current = keyId;
              pressKey(keyId);
            }
          }}
          onPointerUp={() => { if (slideKeyRef.current) { releaseKey(slideKeyRef.current); slideKeyRef.current = null; } }}
          onPointerCancel={() => { if (slideKeyRef.current) { releaseKey(slideKeyRef.current); slideKeyRef.current = null; } }}
        >
          {rgbEnabled && visualsEnabled && frameColor && rgbMode !== 'reactive' && (
            <div className="rgb-top-strip" style={{ background: getStripGradient(0) }} />
          )}

          {activeLayout.map((row, rIdx) => {
            const totalWidth = row.reduce((s, k) => s + (k.width ?? 1), 0);
            let cumWidth = 0;
            return (
              <div key={rIdx} className="flex w-full items-stretch" style={{ gap: 'var(--key-gap)' }}>
                {row.map((k) => {
                  const rgbOffset = cumWidth / totalWidth;
                  cumWidth += (k.width ?? 1);
                  return (
                    <Key
                      key={k.id}
                      id={k.id}
                      label={k.label}
                      sub={k.sub}
                      widthMultiplier={k.width ?? 1}
                      instrumentClass={k.instrumentClass}
                      rgbOffset={rgbOffset}
                    />
                  );
                })}
              </div>
            );
          })}

          {rgbEnabled && visualsEnabled && frameColor && rgbMode !== 'reactive' && (
            <div className="rgb-bottom-strip" style={{ background: getStripGradient(0.5) }} />
          )}
        </div>
      </div>
    </div>
  );
}
