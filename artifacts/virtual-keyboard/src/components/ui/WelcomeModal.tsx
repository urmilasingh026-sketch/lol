import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { Keyboard, Music, Trophy, Zap, ArrowRight } from 'lucide-react';
const logoImg = '/uk-aurora-logo.png';

const FEATURES = [
  { icon: Keyboard, label: '23+ Instruments', desc: 'Every key plays music', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  { icon: Music,    label: '50+ Sound Packs',  desc: 'Choose your style',   color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
  { icon: Trophy,   label: 'Achievements',      desc: '50+ to unlock',       color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  { icon: Zap,      label: 'RGB & Themes',      desc: '13+ lighting modes',  color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
];

export function WelcomeModal() {
  const { showWelcome, dismissWelcome } = useStore();

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: 'rgba(5,4,15,0.85)', backdropFilter: 'blur(20px)' }}
          onClick={dismissWelcome}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden"
            style={{
              borderRadius: '28px',
              background: 'linear-gradient(160deg, rgba(14,11,32,0.98) 0%, rgba(9,7,24,0.99) 100%)',
              border: '1px solid rgba(139,92,246,0.22)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 80px rgba(0,0,0,0.7), 0 0 100px rgba(120,40,220,0.15)',
            }}
          >
            {/* Aurora orbs */}
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(24px)' }} />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)', filter: 'blur(20px)' }} />
            <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', filter: 'blur(16px)' }} />

            {/* Top shine */}
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5) 40%, rgba(96,165,250,0.5) 60%, transparent)' }} />

            <div className="relative z-10 p-7">
              {/* Logo + brand */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-3xl"
                    style={{ boxShadow: '0 0 40px rgba(139,92,246,0.55)', borderRadius: '22px' }} />
                  <img src={logoImg} alt="UK Aurora"
                    className="relative w-20 h-20 object-cover"
                    style={{ borderRadius: '22px', border: '1px solid rgba(139,92,246,0.35)' }} />
                </div>
                <h1 className="text-2xl font-black text-center tracking-tight mb-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #fff 30%, #c4b5fd 60%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                  UK Aurora
                </h1>
                <p className="text-[0.72rem] font-medium tracking-widest uppercase"
                  style={{ color: 'rgba(167,139,250,0.6)', letterSpacing: '0.2em' }}>
                  Virtual Keyboard
                </p>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {FEATURES.map(f => (
                  <div key={f.label}
                    className="flex items-center gap-2.5 p-3 rounded-2xl transition-all"
                    style={{ background: f.bg, border: `1px solid ${f.color}25` }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                      <f.icon className="w-4 h-4" style={{ color: f.color }} />
                    </div>
                    <div>
                      <div className="text-[0.67rem] font-bold leading-tight text-white">{f.label}</div>
                      <div className="text-[0.52rem] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tagline */}
              <div className="text-center mb-5 px-2">
                <p className="text-[0.68rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  Every keystroke plays a unique musical note while tracking your typing speed & accuracy
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={dismissWelcome}
                className="w-full flex items-center justify-center gap-2 font-bold text-sm transition-all active:scale-[0.98]"
                style={{
                  padding: '13px 24px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)',
                  boxShadow: '0 0 0 1px rgba(167,139,250,0.3) inset, 0 4px 20px rgba(124,58,237,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
                  color: '#fff',
                  letterSpacing: '0.01em',
                }}
              >
                Start Playing
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[0.52rem] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Click anywhere outside to dismiss
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
