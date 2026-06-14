import { useEffect, useRef } from 'react';
import { useStore } from '@/store';

export function usePlatformOptimizations() {
  const {
    pageVisibilityPause,
    audioSuspendOnIdle,
    audioSuspendDelay,
    batteryOptimization,
    wakeLock,
    gpuAcceleration,
    fpsTarget,
    showFpsCounter,
    showMemoryUsage,
    cssContainment,
    hapticEnabled,
  } = useStore();

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    if (!gpuAcceleration) return;
    const style = document.getElementById('gpu-hint-style') || document.createElement('style');
    style.id = 'gpu-hint-style';
    style.textContent = `.keyboard-row, .key-btn { will-change: transform; transform: translateZ(0); }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [gpuAcceleration]);

  useEffect(() => {
    if (!cssContainment) return;
    const style = document.getElementById('css-contain-style') || document.createElement('style');
    style.id = 'css-contain-style';
    style.textContent = `.keyboard-row { contain: layout style paint; } .key-btn { contain: layout style; }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [cssContainment]);

  useEffect(() => {
    if (!pageVisibilityPause) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        document.dispatchEvent(new CustomEvent('vk:pause'));
      } else {
        document.dispatchEvent(new CustomEvent('vk:resume'));
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [pageVisibilityPause]);

  useEffect(() => {
    if (!audioSuspendOnIdle) return;

    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      document.dispatchEvent(new CustomEvent('vk:audio-active'));
      idleTimerRef.current = setTimeout(() => {
        document.dispatchEvent(new CustomEvent('vk:audio-idle'));
      }, audioSuspendDelay * 1000);
    };

    const events = ['keydown', 'pointerdown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(e => window.removeEventListener(e, resetIdleTimer));
    };
  }, [audioSuspendOnIdle, audioSuspendDelay]);

  useEffect(() => {
    if (!wakeLock || !('wakeLock' in navigator)) return;

    let active = true;
    const acquire = async () => {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch {}
    };

    acquire();

    const onVisibility = () => {
      if (!document.hidden && active) acquire();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisibility);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [wakeLock]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof (navigator as any).getBattery !== 'function') return;
    if (!batteryOptimization) return;

    let manager: any = null;

    (navigator as any).getBattery().then((batt: any) => {
      manager = batt;
      const check = () => {
        const isLow = batt.level < 0.2 && !batt.charging;
        document.documentElement.classList.toggle('battery-saver', isLow);
      };
      check();
      batt.addEventListener('levelchange', check);
      batt.addEventListener('chargingchange', check);
    }).catch(() => {});

    return () => {
      document.documentElement.classList.remove('battery-saver');
      if (manager) {
        manager.removeEventListener?.('levelchange', () => {});
        manager.removeEventListener?.('chargingchange', () => {});
      }
    };
  }, [batteryOptimization]);

  useEffect(() => {
    let rafId: number;
    let overlay = document.getElementById('vk-fps-overlay') as HTMLDivElement | null;

    if (showFpsCounter || showMemoryUsage) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'vk-fps-overlay';
        overlay.style.cssText = [
          'position:fixed', 'top:4px', 'left:50%', 'transform:translateX(-50%)',
          'background:rgba(0,0,0,0.7)', 'color:#0f0', 'font:11px/1.4 monospace',
          'padding:3px 8px', 'border-radius:6px', 'z-index:9999',
          'pointer-events:none', 'backdrop-filter:blur(4px)',
          'border:1px solid rgba(0,255,0,0.2)',
        ].join(';');
        document.body.appendChild(overlay);
      }

      let frames = 0;
      let lastTime = performance.now();

      const tick = () => {
        frames++;
        const now = performance.now();
        if (now - lastTime >= 500) {
          const fps = Math.round((frames * 1000) / (now - lastTime));
          frames = 0;
          lastTime = now;

          const parts: string[] = [];
          if (showFpsCounter) parts.push(`${fps} FPS`);
          if (showMemoryUsage && (performance as any).memory) {
            const mb = Math.round((performance as any).memory.usedJSHeapSize / 1048576);
            parts.push(`${mb} MB`);
          }
          if (overlay) overlay.textContent = parts.join('  ·  ');
        }
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      overlay?.remove();
    };
  }, [showFpsCounter, showMemoryUsage]);

  useEffect(() => {
    if (!hapticEnabled) return;

    const onKeyPress = () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(8);
      }
    };

    document.addEventListener('keydown', onKeyPress);
    return () => document.removeEventListener('keydown', onKeyPress);
  }, [hapticEnabled]);
}
