import { useEffect, useRef, useMemo } from 'react';
import { useStore } from '@/store';
import { useMobileLandscape, useLowEndDevice } from '@/hooks/use-mobile-landscape';

const CANVAS_FX = new Set([
  'matrix-rain', 'cyber', 'starfield', 'fireworks',
  'binary-rain', 'purple-rain', 'red-rain', 'meteor-shower', 'plasma-wave',
  'radar-sweep', 'warp-speed', 'dna-helix', 'electric-arcs', 'circuit-traces',
]);

const CSS_FX = new Set([
  'scan-lines', 'vhs-noise', 'color-wash', 'prism-rays', 'fog-roll',
  'oil-slick', 'lava-glow', 'aurora-curtain', 'hologram-scan', 'glitch-bars',
  'neon-pulse', 'laser-grid', 'gradient-shift', 'spotlight', 'vortex',
  'hex-overlay', 'dot-wave', 'smoke-layer', 'water-shimmer', 'disco-floor',
  'crt-glow', 'heat-haze', 'deep-sea', 'cave-glow', 'neon-flicker',
  'thunder-flash', 'eclipse', 'inferno', 'arctic-frost', 'toxic-glow',
  'magma-flow', 'void-ripple', 'spectral', 'chromatic-shift', 'rainbow-wave',
  'sunset-gradient', 'cosmic-flow', 'dream-haze', 'retro-glow', 'hyperspace',
  'quantum-field', 'galaxy-swirl', 'nebula-bloom', 'solar-wind', 'black-hole',
  'event-horizon', 'fractal-bloom', 'spiral-galaxy', 'mandala-spin', 'mosaic-shift',
  'stained-glass', 'aurora-borealis', 'plasma-glow', 'crystal-lattice', 'energy-field',
  'wormhole', 'dimension-rift', 'mycelium', 'coral-reef', 'northern-lights',
  'southern-lights', 'bioluminescence', 'thunderstorm', 'sandstorm', 'blizzard',
  'heatwave', 'twilight', 'sunrise', 'moonrise', 'startrail',
]);

const r = (a: number, b: number) => a + Math.random() * (b - a);
const pct = () => `${Math.random() * 100}%`;
const sec = (a: number, b: number) => `${r(a, b).toFixed(1)}s`;
const hsl = (h: number, s: number, l: number) => `hsl(${h},${s}%,${l}%)`;
const rH = () => Math.random() * 360;

interface PData {
  left: string; top?: string; size: string; opacity: number;
  delay: string; dur: string; color?: string; char?: string; tx?: string;
}

interface PCfg {
  cnt: [number, number];
  cls: string;
  gen: () => PData;
}

const PARTICLE_FX: Record<string, PCfg> = {
  'fireflies':      { cnt: [30, 15], cls: 'p-firefly',    gen: () => ({ left: pct(), top: pct(), size: `${r(4,10)}px`, opacity: r(0.4,0.9), delay: sec(0,6), dur: sec(4,9) }) },
  'embers':         { cnt: [50, 25], cls: 'p-ember',      gen: () => ({ left: pct(), top: '100%', size: `${r(2,5)}px`, opacity: r(0.6,1), delay: sec(0,8), dur: sec(3,7), tx: `${(Math.random()-.5)*60}px` }) },
  'confetti':       { cnt: [60, 30], cls: 'p-confetti',   gen: () => ({ left: pct(), top: '-10px', size: `${r(5,12)}px`, opacity: 1, delay: sec(0,8), dur: sec(4,8), color: hsl(rH(),85,60), tx: `${(Math.random()-.5)*80}px` }) },
  'cherry-blossom': { cnt: [30, 15], cls: 'p-petal',      gen: () => ({ left: pct(), top: '-20px', size: `${r(6,14)}px`, opacity: r(0.6,0.9), delay: sec(0,10), dur: sec(6,12), tx: `${(Math.random()-.5)*100}px` }) },
  'autumn-leaves':  { cnt: [25, 12], cls: 'p-leaf',       gen: () => ({ left: pct(), top: '-30px', size: `${r(10,22)}px`, opacity: r(0.6,1), delay: sec(0,10), dur: sec(5,12), color: hsl(20+Math.random()*40, 70+Math.random()*25, 40+Math.random()*30), tx: `${(Math.random()-.5)*150}px` }) },
  'glitter':        { cnt: [80, 40], cls: 'p-glitter',    gen: () => ({ left: pct(), top: pct(), size: `${r(1,4)}px`, opacity: r(0.5,1), delay: sec(0,3), dur: sec(1,3) }) },
  'dust-motes':     { cnt: [40, 20], cls: 'p-dust',       gen: () => ({ left: pct(), top: pct(), size: `${r(1,3)}px`, opacity: r(0.08,0.25), delay: sec(0,12), dur: sec(10,22), tx: `${(Math.random()-.5)*200}px` }) },
  'neon-orbs':      { cnt: [15, 8],  cls: 'p-neon-orb',   gen: () => ({ left: pct(), top: pct(), size: `${r(20,80)}px`, opacity: r(0.04,0.12), delay: sec(0,8), dur: sec(6,14), color: hsl(rH(),100,60) }) },
  'fire-sparks':    { cnt: [60, 30], cls: 'p-spark',      gen: () => ({ left: pct(), top: '100%', size: `${r(1,3)}px`, opacity: 1, delay: sec(0,5), dur: sec(1,2.5), tx: `${(Math.random()-.5)*50}px` }) },
  'hearts':         { cnt: [20, 10], cls: 'p-heart',      gen: () => ({ left: pct(), top: '110%', size: `${r(12,28)}px`, opacity: r(0.5,0.9), delay: sec(0,8), dur: sec(5,10), char: '♥' }) },
  'music-notes':    { cnt: [20, 10], cls: 'p-note',       gen: () => ({ left: pct(), top: '110%', size: `${r(14,28)}px`, opacity: r(0.4,0.8), delay: sec(0,8), dur: sec(5,10), char: ['♩','♪','♫','♬'][Math.floor(Math.random()*4)] }) },
  'stars-drift':    { cnt: [50, 25], cls: 'p-star-dot',   gen: () => ({ left: pct(), top: pct(), size: `${r(1,4)}px`, opacity: r(0.2,0.8), delay: sec(0,10), dur: sec(6,16) }) },
  'raindrops':      { cnt: [80, 40], cls: 'p-rain',       gen: () => ({ left: pct(), top: '-20px', size: `${r(1,2)}px`, opacity: r(0.15,0.4), delay: sec(0,2), dur: sec(0.3,1.2), tx: `${r(-30,-5)}px` }) },
  'dandelion':      { cnt: [25, 12], cls: 'p-dandel',     gen: () => ({ left: pct(), top: pct(), size: `${r(3,8)}px`, opacity: r(0.3,0.7), delay: sec(0,10), dur: sec(8,18), tx: `${(Math.random()-.5)*250}px` }) },
  'butterflies':    { cnt: [12, 6],  cls: 'p-butterfly',  gen: () => ({ left: pct(), top: pct(), size: `${r(16,28)}px`, opacity: r(0.5,0.9), delay: sec(0,6), dur: sec(6,12), char: '🦋' }) },
  'diamonds':       { cnt: [25, 12], cls: 'p-diamond',    gen: () => ({ left: pct(), top: '-10px', size: `${r(6,16)}px`, opacity: r(0.3,0.7), delay: sec(0,8), dur: sec(4,10), color: hsl(180+Math.random()*60, 80, 82) }) },
  'soap-bubbles-xl':{ cnt: [15, 8],  cls: 'p-bubble-xl',  gen: () => ({ left: pct(), top: '110%', size: `${r(30,80)}px`, opacity: r(0.03,0.09), delay: sec(0,10), dur: sec(12,22) }) },
  'toxic-drops':    { cnt: [30, 15], cls: 'p-toxic',      gen: () => ({ left: pct(), top: '-10px', size: `${r(4,12)}px`, opacity: r(0.4,0.8), delay: sec(0,6), dur: sec(2,5) }) },
  'lava-drops':     { cnt: [20, 10], cls: 'p-lava-drop',  gen: () => ({ left: pct(), top: '-10px', size: `${r(6,18)}px`, opacity: r(0.5,0.9), delay: sec(0,6), dur: sec(2,6) }) },
  'galaxy-dust':    { cnt: [60, 30], cls: 'p-galactic',   gen: () => ({ left: pct(), top: pct(), size: `${r(1,3)}px`, opacity: r(0.1,0.5), delay: sec(0,8), dur: sec(4,12), color: hsl(220+Math.random()*120, 80, 80) }) },
};

export function BackgroundEffects() {
  const backgroundEffect = useStore(s => s.backgroundEffect);
  const reduceMotion = useStore(s => s.reduceMotion);
  const performanceMode = useStore(s => s.performanceMode);
  const autoPerformanceMode = useStore(s => s.autoPerformanceMode);
  const bgEffectOpacity = useStore(s => s.bgEffectOpacity);
  const bgEffectSpeed = useStore(s => s.bgEffectSpeed);
  const isMobileLandscape = useMobileLandscape();
  const isLowEnd = useLowEndDevice();
  const effectivePerf = performanceMode || (autoPerformanceMode && isLowEnd);
  const isLowBw = isMobileLandscape || effectivePerf;
  const speedRef = useRef(bgEffectSpeed);
  speedRef.current = bgEffectSpeed;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!CANVAS_FX.has(backgroundEffect) || reduceMotion || effectivePerf) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize, { passive: true });

    let t = 0, frame = 0;
    // Throttle heavy effects: plasma needs extra skip, rain/starfield every other frame on mobile
    const isMobile = window.innerWidth < 1024;
    const plasmaSkip = 3;
    const defaultSkip = isMobile ? 2 : 1;
    let skipCount = 0;

    // Rain drops shared state (lazily sized to current w)
    let drops: number[] = Array(Math.floor(w / 16)).fill(1);

    // Fireworks state
    interface FwP { x: number; y: number; vx: number; vy: number; alpha: number; color: string; size: number; }
    interface Rocket { x: number; y: number; vy: number; color: string; exploded: boolean; }
    const rockets: Rocket[] = [];
    const fwP: FwP[] = [];
    const FWC = ['#ff5b55','#ff9f1c','#ffd447','#38e29d','#33a1ff','#b45cff','#ff85cc','#00ffcc'];

    // Starfield state
    const stars = Array.from({ length: 200 }, () => ({
      x: (Math.random() - .5) * w, y: (Math.random() - .5) * h,
      z: Math.random() * w, pz: 0,
    }));
    stars.forEach(s => { s.pz = s.z; });

    // Meteors
    interface Meteor { x: number; y: number; vx: number; vy: number; alpha: number; }
    const meteors: Meteor[] = [];

    // Electric arcs
    interface EArc { pts: {x:number;y:number}[]; alpha: number; color: string; }
    const arcs: EArc[] = [];

    // Circuit traces
    interface CTrace { x: number; y: number; dir: number; len: number; maxLen: number; }
    const traces: CTrace[] = Array.from({ length: 10 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      dir: Math.floor(Math.random() * 4),
      len: 0, maxLen: 50 + Math.random() * 150,
    }));

    const draw = () => {
      // Frame throttling: skip frames for performance on mobile & for heavy effects
      const frameSkip = backgroundEffect === 'plasma-wave' ? plasmaSkip : defaultSkip;
      skipCount = (skipCount + 1) % frameSkip;
      if (skipCount !== 0) {
        t += 0.03 * speedRef.current; frame++;
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      switch (backgroundEffect) {

        case 'matrix-rain':
        case 'binary-rain':
        case 'purple-rain':
        case 'red-rain': {
          const color = backgroundEffect === 'matrix-rain' ? '#00ff41'
            : backgroundEffect === 'purple-rain' ? '#bf5fff'
            : backgroundEffect === 'red-rain' ? '#ff3333' : '#00aaff';
          ctx.fillStyle = 'rgba(0,0,0,0.05)';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = color;
          ctx.font = '14px JetBrains Mono, monospace';
          const isBin = backgroundEffect === 'binary-rain';
          if (drops.length !== Math.floor(w / 16)) drops = Array(Math.floor(w / 16)).fill(1);
          for (let i = 0; i < drops.length; i++) {
            const text = isBin
              ? String(Math.floor(Math.random() * 2))
              : String.fromCharCode(0x30a0 + Math.random() * 96);
            ctx.fillText(text, i * 16, drops[i] * 16);
            if (drops[i] * 16 > h && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
          }
          break;
        }

        case 'cyber': {
          ctx.clearRect(0, 0, w, h);
          const g = 60;
          const p1 = 0.3 + 0.2 * Math.sin(t * 0.8);
          const p2 = 0.25 + 0.15 * Math.sin(t * 0.5 + 1);
          ctx.shadowBlur = 6;
          ctx.strokeStyle = `rgba(0,200,255,${p1})`; ctx.lineWidth = 1;
          ctx.shadowColor = 'rgba(0,200,255,0.6)';
          for (let x = 0; x < w; x += g) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
          for (let y = 0; y < h; y += g) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
          ctx.strokeStyle = `rgba(255,0,160,${p2})`; ctx.shadowColor = 'rgba(255,0,160,0.6)'; ctx.lineWidth = 0.5;
          for (let x = -h; x < w + h; x += g * 3) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+h,h); ctx.stroke(); }
          ctx.shadowBlur = 0;
          break;
        }

        case 'starfield':
        case 'warp-speed': {
          const speed = backgroundEffect === 'warp-speed' ? 7 : 3;
          ctx.fillStyle = backgroundEffect === 'warp-speed' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.12)';
          ctx.fillRect(0, 0, w, h);
          const cx = w / 2, cy = h / 2;
          for (const s of stars) {
            s.pz = s.z; s.z -= speed;
            if (s.z <= 0) { s.x = (Math.random()-.5)*w; s.y = (Math.random()-.5)*h; s.z = w; s.pz = w; }
            const sx = (s.x / s.z) * w + cx, sy = (s.y / s.z) * h + cy;
            const px = (s.x / s.pz) * w + cx, py = (s.y / s.pz) * h + cy;
            const bright = 1 - s.z / w;
            const col = Math.floor(bright * (backgroundEffect === 'warp-speed' ? 155 : 200) + 55);
            ctx.strokeStyle = backgroundEffect === 'warp-speed'
              ? `rgba(${col},${col},255,${bright})`
              : `rgba(255,255,255,${bright})`;
            ctx.lineWidth = Math.max(0.5, (1 - s.z / w) * (backgroundEffect === 'warp-speed' ? 2 : 3));
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
          }
          break;
        }

        case 'fireworks': {
          ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, 0, w, h);
          if (frame % 60 === 0 || rockets.length === 0) {
            rockets.push({ x: 0.2*w + Math.random()*0.6*w, y: h, vy: -(8+Math.random()*6), color: FWC[Math.floor(Math.random()*FWC.length)], exploded: false });
          }
          for (let i = rockets.length - 1; i >= 0; i--) {
            const rk = rockets[i];
            if (!rk.exploded) {
              rk.y += rk.vy; rk.vy += 0.1;
              if (rk.vy >= -2) {
                rk.exploded = true;
                const cnt = 60 + Math.floor(Math.random() * 40);
                for (let j = 0; j < cnt; j++) {
                  const ang = (Math.PI * 2 * j) / cnt, sp = 2 + Math.random() * 5;
                  fwP.push({ x: rk.x, y: rk.y, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp, alpha: 1, color: rk.color, size: 1.5+Math.random()*2 });
                }
                rockets.splice(i, 1);
              } else {
                ctx.beginPath(); ctx.arc(rk.x, rk.y, 3, 0, Math.PI*2);
                ctx.fillStyle = rk.color; ctx.shadowBlur = 8; ctx.shadowColor = rk.color; ctx.fill();
              }
            }
          }
          for (let i = fwP.length - 1; i >= 0; i--) {
            const p = fwP[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.alpha -= 0.016;
            if (p.alpha <= 0) { fwP.splice(i, 1); continue; }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.shadowBlur = 4; ctx.shadowColor = p.color; ctx.fill();
          }
          ctx.globalAlpha = 1; ctx.shadowBlur = 0;
          break;
        }

        case 'meteor-shower': {
          ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(0, 0, w, h);
          if (frame % 18 === 0) {
            meteors.push({ x: Math.random() * w * 1.5, y: -50, vx: -6 - Math.random()*4, vy: 4 + Math.random()*4, alpha: 1 });
          }
          for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i]; m.x += m.vx; m.y += m.vy; m.alpha -= 0.007;
            if (m.alpha <= 0 || m.y > h) { meteors.splice(i, 1); continue; }
            const len = 80;
            const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 10, m.y - m.vy * 10);
            grad.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grad; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 10, m.y - m.vy * 10); ctx.stroke();
          }
          break;
        }

        case 'plasma-wave': {
          const SCALE = isMobile ? 16 : 10;
          ctx.globalAlpha = 0.14;
          for (let y = 0; y < h; y += SCALE) {
            for (let x = 0; x < w; x += SCALE) {
              const v = Math.sin(x*0.012 + t*1.5) + Math.sin(y*0.012 + t) + Math.sin((x+y)*0.006 + t*0.7);
              const hue = (v + 3) * 60;
              ctx.fillStyle = `hsl(${hue},100%,55%)`;
              ctx.fillRect(x, y, SCALE, SCALE);
            }
          }
          ctx.globalAlpha = 1;
          break;
        }

        case 'radar-sweep': {
          ctx.clearRect(0, 0, w, h);
          const cx = w/2, cy = h/2, R = Math.min(w,h) * 0.45;
          ctx.strokeStyle = 'rgba(0,255,80,0.15)'; ctx.lineWidth = 0.5;
          for (let r2 = R/4; r2 <= R; r2 += R/4) { ctx.beginPath(); ctx.arc(cx, cy, r2, 0, Math.PI*2); ctx.stroke(); }
          for (let a = 0; a < Math.PI*2; a += Math.PI/6) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx+R*Math.cos(a), cy+R*Math.sin(a)); ctx.stroke(); }
          const sweep = t % (Math.PI * 2);
          ctx.save(); ctx.translate(cx, cy);
          for (let i = 0; i < 10; i++) {
            const a = sweep - i * 0.07;
            ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, R, a - 0.07, a); ctx.closePath();
            ctx.fillStyle = `rgba(0,255,80,${(10-i)/10 * 0.1})`; ctx.fill();
          }
          ctx.strokeStyle = 'rgba(0,255,80,0.9)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(R*Math.cos(sweep), R*Math.sin(sweep)); ctx.stroke();
          ctx.restore();
          break;
        }

        case 'dna-helix': {
          ctx.clearRect(0, 0, w, h);
          const cx = w / 2, amp = Math.min(80, w * 0.08);
          for (let y = 0; y < h; y += 3) {
            const twist = (y / h) * Math.PI * 10 + t;
            const x1 = cx + Math.sin(twist) * amp;
            const x2 = cx + Math.sin(twist + Math.PI) * amp;
            const alpha = Math.abs(Math.cos(twist * 0.5)) * 0.7 + 0.15;
            ctx.fillStyle = `rgba(100,200,255,${alpha})`;
            ctx.beginPath(); ctx.arc(x1, y, 3, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = `rgba(255,100,200,${alpha})`;
            ctx.beginPath(); ctx.arc(x2, y, 3, 0, Math.PI*2); ctx.fill();
            if (y % 18 === 0) {
              ctx.strokeStyle = `rgba(150,200,255,0.25)`; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
            }
          }
          break;
        }

        case 'electric-arcs': {
          ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 0, w, h);
          if (frame % 6 === 0) {
            const genPts = (x1: number, y1: number, x2: number, y2: number, d: number): {x:number;y:number}[] => {
              if (d === 0) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
              const mx = (x1+x2)/2 + (Math.random()-.5)*70;
              const my = (y1+y2)/2 + (Math.random()-.5)*70;
              return [...genPts(x1, y1, mx, my, d-1), ...genPts(mx, my, x2, y2, d-1)];
            };
            const colors = ['rgba(100,150,255', 'rgba(200,100,255', 'rgba(100,255,200', 'rgba(255,220,100'];
            arcs.push({ pts: genPts(Math.random()*w, Math.random()*h, Math.random()*w, Math.random()*h, 4), alpha: 1, color: colors[Math.floor(Math.random()*colors.length)] });
          }
          for (let i = arcs.length - 1; i >= 0; i--) {
            const a = arcs[i]; a.alpha -= 0.04;
            if (a.alpha <= 0) { arcs.splice(i, 1); continue; }
            ctx.strokeStyle = `${a.color},${a.alpha})`; ctx.lineWidth = 1;
            ctx.shadowBlur = 10; ctx.shadowColor = `${a.color},0.5)`;
            ctx.beginPath();
            for (let j = 0; j < a.pts.length; j++) {
              if (j === 0) ctx.moveTo(a.pts[j].x, a.pts[j].y);
              else ctx.lineTo(a.pts[j].x, a.pts[j].y);
            }
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
          break;
        }

        case 'circuit-traces': {
          ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, w, h);
          const DIRS = [{ dx:1,dy:0 },{ dx:0,dy:1 },{ dx:-1,dy:0 },{ dx:0,dy:-1 }];
          for (const tr of traces) {
            tr.len += 2;
            if (tr.len >= tr.maxLen || tr.x < 0 || tr.x > w || tr.y < 0 || tr.y > h) {
              tr.x = Math.random()*w; tr.y = Math.random()*h;
              tr.dir = Math.floor(Math.random()*4); tr.len = 0; tr.maxLen = 50 + Math.random()*150;
            }
            const d = DIRS[tr.dir];
            ctx.strokeStyle = 'rgba(0,200,120,0.4)'; ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tr.x - d.dx * tr.len, tr.y - d.dy * tr.len);
            ctx.lineTo(tr.x + d.dx * 2, tr.y + d.dy * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0,255,150,0.7)';
            ctx.beginPath(); ctx.arc(tr.x + d.dx*2, tr.y + d.dy*2, 2, 0, Math.PI*2); ctx.fill();
            tr.x += d.dx * 2; tr.y += d.dy * 2;
            if (Math.random() < 0.02) tr.dir = (tr.dir + (Math.random() > 0.5 ? 1 : -1) + 4) % 4;
          }
          break;
        }
      }

      t += 0.03 * speedRef.current; frame++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      ctx.clearRect(0, 0, w, h);
    };
  }, [backgroundEffect, reduceMotion, effectivePerf]);

  // Particle generation
  const pCfg = PARTICLE_FX[backgroundEffect as string];
  const particles = useMemo(() => {
    if (!pCfg) return [];
    const n = isLowBw ? pCfg.cnt[1] : pCfg.cnt[0];
    return Array.from({ length: n }, pCfg.gen);
  }, [backgroundEffect, isLowBw]);

  // Legacy memos for existing snow/bubbles
  const snowflakes = useMemo(() =>
    Array.from({ length: isLowBw ? 20 : 50 }, () => ({
      left: `${Math.random() * 100}%`, delay: sec(0,10), dur: sec(6,16),
      size: `${3 + Math.random() * 6}px`, opacity: 0.3 + Math.random() * 0.5,
      drift: `${(Math.random() - .5) * 100}px`,
    })), []);

  const bubbles = useMemo(() =>
    Array.from({ length: isLowBw ? 10 : 25 }, () => ({
      left: `${Math.random() * 100}%`, delay: sec(0,8), dur: sec(8,20),
      size: `${12 + Math.random() * 28}px`, opacity: 0.06 + Math.random() * 0.12,
    })), []);

  if (backgroundEffect === 'none') return null;

  // Canvas effects
  if (CANVAS_FX.has(backgroundEffect)) {
    const isRain = ['matrix-rain','binary-rain','purple-rain','red-rain'].includes(backgroundEffect);
    const isDna = backgroundEffect === 'dna-helix';
    const isPlasma = backgroundEffect === 'plasma-wave';
    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          opacity: (isRain ? 0.22 : isDna ? 0.6 : isPlasma ? 0.5 : 0.65) * bgEffectOpacity,
          mixBlendMode: isRain || isDna ? 'screen' : 'normal',
        }}
      />
    );
  }

  // Aurora blobs
  if (backgroundEffect === 'aurora') {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: bgEffectOpacity }} aria-hidden>
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>
    );
  }

  // Floating particles
  if (backgroundEffect === 'particles') {
    const cnt = isLowBw ? 12 : 30;
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: bgEffectOpacity }} aria-hidden>
        {Array.from({ length: cnt }).map((_, i) => (
          <div key={i} className="particle-dot" style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`, animationDuration: `${(6 + Math.random() * 8) / bgEffectSpeed}s`,
            width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
            opacity: 0.15 + Math.random() * 0.25,
          }} />
        ))}
      </div>
    );
  }

  // Nebula blobs
  if (backgroundEffect === 'nebula') {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: bgEffectOpacity }} aria-hidden>
        <div className="nebula-cloud nebula-1" /><div className="nebula-cloud nebula-2" /><div className="nebula-cloud nebula-3" />
      </div>
    );
  }

  // Snow
  if (backgroundEffect === 'snow') {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: bgEffectOpacity }} aria-hidden>
        {snowflakes.map((f, i) => (
          <div key={i} className="snowflake-particle" style={{
            left: f.left, width: f.size, height: f.size, opacity: f.opacity,
            animationDelay: f.delay, animationDuration: `${parseFloat(f.dur) / bgEffectSpeed}s`, '--drift': f.drift,
          } as React.CSSProperties} />
        ))}
      </div>
    );
  }

  // Bubbles
  if (backgroundEffect === 'bubbles') {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: bgEffectOpacity }} aria-hidden>
        {bubbles.map((b, i) => (
          <div key={i} className="bubble-particle" style={{
            left: b.left, width: b.size, height: b.size, opacity: b.opacity,
            animationDelay: b.delay, animationDuration: `${parseFloat(b.dur) / bgEffectSpeed}s`,
          }} />
        ))}
      </div>
    );
  }

  // New particle effects
  if (pCfg) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ opacity: bgEffectOpacity }} aria-hidden>
        {particles.map((p, i) => (
          <div
            key={i}
            className={pCfg.cls}
            style={{
              left: p.left,
              ...(p.top ? { top: p.top } : {}),
              width: p.size,
              height: p.size,
              fontSize: p.size,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: `${parseFloat(p.dur) / bgEffectSpeed}s`,
              ...(p.color ? { backgroundColor: p.color, borderColor: p.color, color: p.color } : {}),
              ...(p.tx ? { '--tx': p.tx } as React.CSSProperties : {}),
            } as React.CSSProperties}
          >
            {p.char ?? null}
          </div>
        ))}
      </div>
    );
  }

  // Pure CSS effects
  if (CSS_FX.has(backgroundEffect)) {
    return (
      <div
        className={`fixed inset-0 z-0 pointer-events-none overflow-hidden bg-fx-${backgroundEffect}`}
        style={{ opacity: bgEffectOpacity }}
        aria-hidden
      />
    );
  }

  // Smart fallback for BACKGROUNDS_EXTRA effects — gradient + animation based on theme
  const id = backgroundEffect as string;
  const fallbackGradient = (() => {
    if (/galaxy|nebula|milky|andromeda|cosmic|spiral|void|wormhole|hyperspace|dimension|quantum|fractal|black.hole|neutron|supernova/.test(id))
      return 'radial-gradient(ellipse at 30% 40%, #4f46e5 0%, #1a1a2e 40%, #0a0a1e 100%)';
    if (/star|meteor|asteroid|comet|space.station|alien|warp|travel/.test(id))
      return 'radial-gradient(ellipse at 60% 30%, #1e3a5f 0%, #0a0a1e 60%, #000010 100%)';
    if (/solar|sun|corona|flare|jupiter|saturn|mars|moon.surface|earth.orbit|planet/.test(id))
      return 'radial-gradient(ellipse at 50% 60%, #7c3200 0%, #3a1800 40%, #0a0500 100%)';
    if (/aurora|northern.lights|southern.lights|borealis/.test(id))
      return 'linear-gradient(180deg, #001a00 0%, #003300 30%, #00aa44 55%, #004488 80%, #001133 100%)';
    if (/forest|jungle|bamboo|tree|canopy|mycelium|vine/.test(id))
      return 'linear-gradient(180deg, #001400 0%, #003300 40%, #005500 70%, #002200 100%)';
    if (/ocean|sea|water|coral|underwater|biolum|depth|reef|river|waterfall|glacier/.test(id))
      return 'linear-gradient(180deg, #001144 0%, #002288 35%, #003399 65%, #001155 100%)';
    if (/snow|blizzard|winter|arctic|ice|glacier|frost/.test(id))
      return 'linear-gradient(180deg, #aabbcc 0%, #ccdde0 30%, #ddeeff 60%, #eef5ff 100%)';
    if (/fire|lava|volcano|eruption|inferno|ember|flame|magma/.test(id))
      return 'radial-gradient(ellipse at 50% 80%, #ff6600 0%, #cc2200 30%, #880000 60%, #220000 100%)';
    if (/desert|sand|dune|savanna|mars|sienna/.test(id))
      return 'linear-gradient(180deg, #331100 0%, #663300 25%, #cc6600 55%, #aa4400 100%)';
    if (/cherry|sakura|blossom|spring|meadow|flower|bloom|petal/.test(id))
      return 'linear-gradient(135deg, #ff99cc 0%, #ffbbdd 35%, #ffddee 60%, #ffe0f0 100%)';
    if (/autumn|leaf|leaves|fall/.test(id))
      return 'linear-gradient(180deg, #1a0a00 0%, #663300 30%, #aa5500 55%, #884400 100%)';
    if (/thunder|storm|lightning|rain|cloud/.test(id))
      return 'linear-gradient(180deg, #0a0a1a 0%, #1a1a33 30%, #2a2a4a 60%, #3a3a5a 100%)';
    if (/purple|violet|amethyst|orchid|berry/.test(id))
      return 'radial-gradient(ellipse at 40% 50%, #6600cc 0%, #330066 45%, #110022 100%)';
    if (/neon|cyber|glitch|matrix|circuit|holo/.test(id))
      return 'linear-gradient(135deg, #000a00 0%, #001100 40%, #002200 70%, #000800 100%)';
    if (/sunset|dusk|twilight|dawn|sunrise|golden/.test(id))
      return 'linear-gradient(180deg, #220011 0%, #882200 25%, #ff6600 50%, #ffaa00 75%, #1a0a00 100%)';
    if (/mountain|valley|peak|cliff|hill/.test(id))
      return 'linear-gradient(180deg, #aabbcc 0%, #778899 25%, #334455 55%, #112233 100%)';
    if (/cave|underground|dark|abyss/.test(id))
      return 'radial-gradient(ellipse at 50% 80%, #110022 0%, #050010 50%, #000005 100%)';
    if (/gold|champagne|luxury/.test(id))
      return 'linear-gradient(135deg, #332200 0%, #664400 30%, #aa7700 55%, #ffaa00 100%)';
    // Default dark space fallback
    return 'radial-gradient(ellipse at 50% 50%, #1a1a2e 0%, #0a0a1e 60%, #050510 100%)';
  })();

  const fallbackAnimation = (() => {
    if (/fire|lava|flame|inferno/.test(id)) return 'bg-fx-inferno';
    if (/star|galaxy|nebula|space|cosmic|meteor/.test(id)) return 'bg-fx-cosmic-flow';
    if (/aurora|northern|southern/.test(id)) return 'bg-fx-aurora-borealis';
    if (/ocean|water|sea|wave/.test(id)) return 'bg-fx-water-shimmer';
    if (/forest|jungle|nature|leaf/.test(id)) return 'bg-fx-fog-roll';
    if (/storm|thunder|lightning/.test(id)) return 'bg-fx-thunderstorm';
    if (/snow|blizzard|winter/.test(id)) return 'bg-fx-blizzard';
    if (/neon|cyber|glitch/.test(id)) return 'bg-fx-neon-pulse';
    if (/sunset|dusk|dawn/.test(id)) return 'bg-fx-sunset-gradient';
    return 'bg-fx-dream-haze';
  })();

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${fallbackAnimation}`}
      style={{ opacity: bgEffectOpacity, background: fallbackGradient }}
      aria-hidden
    />
  );
}
