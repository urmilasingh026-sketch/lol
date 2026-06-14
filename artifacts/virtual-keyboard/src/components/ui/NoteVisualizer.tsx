import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store';

const NOTE_SYMBOLS = ['♩', '♪', '♫', '♬', '🎵', '🎶', '🎼'];
const NOTE_COLORS = [
  '#ff5b55', '#ff9f1c', '#ffd447', '#38e29d',
  '#33a1ff', '#5f6bff', '#b45cff', '#ff85cc',
  '#00ffcc', '#ff6680', '#60efff', '#ffb347',
];

interface Particle {
  id: number;
  x: number;
  y: number;
  symbol: string;
  color: string;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  rotation: number;
  rotSpeed: number;
}

let _particleId = 0;

export function NoteVisualizer() {
  const noteVisualizerEnabled = useStore(s => s.noteVisualizerEnabled);
  const reduceMotion = useStore(s => s.reduceMotion);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const spawnParticle = useCallback((x: number, y: number, color?: string) => {
    if (!noteVisualizerEnabled || reduceMotion) return;
    const symbol = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];
    const particleColor = color || NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    particlesRef.current.push({
      id: _particleId++,
      x, y,
      symbol,
      color: particleColor,
      size: 14 + Math.random() * 12,
      opacity: 0.9,
      vx: (Math.random() - 0.5) * 2,
      vy: -(1.5 + Math.random() * 2.5),
      born: performance.now(),
      life: 1200 + Math.random() * 600,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 4,
    });
  }, [noteVisualizerEnabled, reduceMotion]);

  useEffect(() => {
    if (!noteVisualizerEnabled || reduceMotion) return;

    const handleKey = (e: KeyboardEvent) => {
      const el = document.querySelector(`[data-key-id="${e.code}"]`);
      if (!el) {
        spawnParticle(Math.random() * window.innerWidth, window.innerHeight * 0.6);
        return;
      }
      const rect = el.getBoundingClientRect();
      spawnParticle(rect.left + rect.width / 2, rect.top + rect.height / 2);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [spawnParticle, noteVisualizerEnabled, reduceMotion]);

  useEffect(() => {
    if (!noteVisualizerEnabled || reduceMotion) {
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const ctx = canvas.getContext('2d')!;

    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        const elapsed = now - p.born;
        if (elapsed >= p.life) continue;
        alive.push(p);

        const progress = elapsed / p.life;
        const opacity = p.opacity * (1 - progress * progress);
        const y = p.y + p.vy * elapsed * 0.06;
        const x = p.x + p.vx * elapsed * 0.04;
        const rotation = (p.rotation + p.rotSpeed * elapsed * 0.02) * Math.PI / 180;
        const scale = 1 + progress * 0.4;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color + '88';
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }
      particlesRef.current = alive;
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [noteVisualizerEnabled, reduceMotion]);

  if (!noteVisualizerEnabled || reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 9999 }}
      aria-hidden
    />
  );
}
