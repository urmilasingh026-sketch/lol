import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { ACHIEVEMENTS, RARITY_COLORS } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export function AchievementToast() {
  const { pendingAchievement, clearPendingAchievement, achievementDuration } = useStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ach = pendingAchievement ? ACHIEVEMENTS.find(a => a.id === pendingAchievement) : null;
  const duration = achievementDuration > 0 ? achievementDuration : 4000;

  useEffect(() => {
    if (!ach) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    // Confetti burst for epic/legendary
    if (ach.rarity === 'epic' || ach.rarity === 'legendary') {
      confetti({
        particleCount: ach.rarity === 'legendary' ? 150 : 80,
        spread: 70,
        origin: { x: 0.5, y: 0.3 },
        colors: ach.rarity === 'legendary' ? ['#fbbf24', '#f59e0b', '#fff'] : ['#8b5cf6', '#a78bfa', '#c4b5fd'],
        zIndex: 9999,
      });
    }

    timerRef.current = setTimeout(() => {
      clearPendingAchievement();
    }, duration);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [ach?.id]);

  return (
    <AnimatePresence>
      {ach && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-24 right-4 z-[200] max-w-[260px] cursor-pointer"
          onClick={clearPendingAchievement}
        >
          <div className={cn(
            'rounded-2xl border p-3 backdrop-blur-xl shadow-2xl',
            RARITY_COLORS[ach.rarity].bg,
            RARITY_COLORS[ach.rarity].border,
            RARITY_COLORS[ach.rarity].glow,
          )}>
            <div className="flex items-start gap-2.5">
              <div className="text-2xl leading-none mt-0.5 shrink-0">{ach.icon}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[0.48rem] font-bold uppercase tracking-[0.2em] text-white/40">Achievement Unlocked</span>
                  <span className={cn('text-[0.42rem] font-bold uppercase tracking-widest px-1 py-0.5 rounded-full border',
                    RARITY_COLORS[ach.rarity].bg, RARITY_COLORS[ach.rarity].border, RARITY_COLORS[ach.rarity].text)}>
                    {ach.rarity}
                  </span>
                </div>
                <div className="text-white font-bold text-[0.78rem] leading-tight">{ach.title}</div>
                <div className="text-white/55 text-[0.55rem] mt-0.5">{ach.desc}</div>
                <div className={cn('text-[0.52rem] font-bold mt-1', RARITY_COLORS[ach.rarity].text)}>
                  +{ach.xp} XP
                </div>
              </div>
            </div>
            <div className="mt-2 h-0.5 bg-white/05 rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', ach.rarity === 'legendary' ? 'bg-amber-400' : ach.rarity === 'epic' ? 'bg-violet-400' : ach.rarity === 'rare' ? 'bg-blue-400' : 'bg-slate-400')}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
