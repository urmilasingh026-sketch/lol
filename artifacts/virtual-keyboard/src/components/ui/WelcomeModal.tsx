import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { Keyboard, Music, Trophy, Zap } from 'lucide-react';
const logoImg = '/uk-aurora-logo.png';

export function WelcomeModal() {
  const { showWelcome, dismissWelcome } = useStore();

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={dismissWelcome}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative bg-[#0d0d1a] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_80px_rgba(120,40,220,0.3)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/8" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <img src={logoImg} alt="UK Aurora" className="w-16 h-16 rounded-2xl object-cover shadow-[0_0_30px_rgba(160,80,255,0.5)]" />
              </div>
              <h1 className="text-center text-xl font-black text-white mb-1 tracking-tight">UK Aurora Virtual Keyboard</h1>
              <p className="text-center text-white/40 text-xs mb-5">The world's most musical typing experience</p>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {[
                  { icon: <Keyboard className="w-4 h-4 text-violet-400" />, label: '23+ Instruments', desc: 'Every key plays music' },
                  { icon: <Music className="w-4 h-4 text-blue-400" />, label: '50+ Sound Packs', desc: 'Choose your style' },
                  { icon: <Trophy className="w-4 h-4 text-amber-400" />, label: 'Achievements', desc: '50+ to unlock' },
                  { icon: <Zap className="w-4 h-4 h-4 text-emerald-400" />, label: 'RGB & Themes', desc: '13+ lighting modes' },
                ].map(f => (
                  <div key={f.label} className="bg-white/04 border border-white/07 rounded-xl p-2.5">
                    <div className="mb-1">{f.icon}</div>
                    <div className="text-white text-[0.65rem] font-bold leading-tight">{f.label}</div>
                    <div className="text-white/35 text-[0.52rem]">{f.desc}</div>
                  </div>
                ))}
              </div>

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-2.5 mb-4 text-center">
                <p className="text-violet-300 text-[0.62rem] font-medium">
                  Use your keyboard — every key plays a unique instrument while tracking your typing speed!
                </p>
              </div>

              <button
                onClick={dismissWelcome}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-white font-bold text-sm shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                Start Playing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
