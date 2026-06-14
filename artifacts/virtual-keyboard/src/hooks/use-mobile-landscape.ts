import { useState, useEffect } from 'react';

function checkMobileLandscape(): boolean {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return h < 520 && w > h && w <= 1024;
}

function checkIsTablet(): boolean {
  const w = window.innerWidth;
  return w >= 768 && w <= 1280;
}

function checkIsPhone(): boolean {
  const w = window.innerWidth;
  return w < 768;
}

function checkIsPortraitPhone(): boolean {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return w < 768 && h > w;
}

function checkLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory as number | undefined;
  const conn = (navigator as any).connection as { saveData?: boolean; effectiveType?: string } | undefined;
  const saveData = conn?.saveData ?? false;
  const slowConn = conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g';
  const lowMemory = memory !== undefined && memory < 2;
  const lowCpu = cores < 4;
  return lowCpu || lowMemory || saveData || slowConn;
}

function makeOrientationHook(checkFn: () => boolean) {
  return function useFlag() {
    const [flag, setFlag] = useState<boolean>(() =>
      typeof window === 'undefined' ? false : checkFn()
    );
    useEffect(() => {
      const check = () => setFlag(checkFn());
      window.addEventListener('resize', check, { passive: true });
      window.addEventListener('orientationchange', check, { passive: true });
      try { screen.orientation.addEventListener('change', check); } catch {}
      return () => {
        window.removeEventListener('resize', check);
        window.removeEventListener('orientationchange', check);
        try { screen.orientation.removeEventListener('change', check); } catch {}
      };
    }, []);
    return flag;
  };
}

export const useMobileLandscape = makeOrientationHook(checkMobileLandscape);
export const useIsTablet = makeOrientationHook(checkIsTablet);
export const useIsPhone = makeOrientationHook(checkIsPhone);
export const useIsPortraitPhone = makeOrientationHook(checkIsPortraitPhone);

export function useLowEndDevice(): boolean {
  const [isLowEnd] = useState<boolean>(() => checkLowEndDevice());
  return isLowEnd;
}
