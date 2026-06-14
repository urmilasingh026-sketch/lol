import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Keyboard, Zap, BarChart2 } from 'lucide-react';

const SHORTCUTS = [
  { category: 'Playback & Recording', items: [
    { keys: ['R'], desc: 'Open Settings drawer' },
    { keys: ['F5'], desc: 'Reset / new word list' },
    { keys: ['Tab'], desc: 'Plays Trumpet note' },
    { keys: ['Esc'], desc: 'System key (no sound)' },
  ]},
  { category: 'Musical Instruments', items: [
    { keys: ['A–Z'], desc: '🎹 Piano (chromatic scale)' },
    { keys: ['1–0'], desc: '🎸 Electric Guitar' },
    { keys: ['F1–F12'], desc: '🥁 Drum Kit' },
    { keys: ['- = [ ] \\ ; \' , . /'], desc: '🪈 Flute' },
    { keys: ['Space'], desc: '🎸 Bass guitar' },
    { keys: ['Enter'], desc: '🎶 Piano chord' },
    { keys: ['← ↑ → ↓'], desc: '🎛 Synthesizer' },
    { keys: ['Ctrl / Alt'], desc: '🌊 Ambient Pads' },
    { keys: ['Numpad 0–9'], desc: '🪘 Percussion' },
    { keys: ['CapsLock'], desc: '🎻 Violin' },
    { keys: ['Tab'], desc: '🎺 Trumpet' },
    { keys: ['Delete'], desc: '🎼 Organ' },
    { keys: ['Insert'], desc: '🎷 Saxophone' },
    { keys: ['Home'], desc: '🎹 Harpsichord' },
    { keys: ['End'], desc: '🎸 Electric Bass' },
    { keys: ['Page Up'], desc: '🪗 Accordion' },
    { keys: ['Page Down'], desc: '🎺 French Horn' },
    { keys: ['Win/Meta'], desc: '🎵 Vibraphone' },
  ]},
  { category: 'Typing Modes', items: [
    { keys: ['Free'], desc: 'Type freely, text accumulates' },
    { keys: ['Word'], desc: 'Cycle through 200+ common words' },
    { keys: ['Sentences'], desc: 'Practice full sentences' },
    { keys: ['Timed'], desc: 'Speed test with countdown' },
    { keys: ['Quotes'], desc: 'Famous quotes to type' },
    { keys: ['Code'], desc: 'Programming code snippets' },
    { keys: ['Poetry'], desc: 'Classic poetry lines' },
    { keys: ['Movies'], desc: 'Iconic movie quotes' },
  ]},
  { category: 'Tips', items: [
    { keys: ['RGB'], desc: 'Enable RGB in Settings → Visual' },
    { keys: ['Sound'], desc: 'Choose from 50+ sound packs' },
    { keys: ['Theme'], desc: '9 app themes in Settings → Visual' },
    { keys: ['Heatmap'], desc: 'Toggle key heatmap in Settings → Keyboard' },
  ]},
];

export function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#0d0d1a] border border-white/10 rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/08">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-violet-400" />
                <span className="font-bold text-white text-sm">Keyboard Guide</span>
              </div>
              <button onClick={onClose} className="w-6 h-6 rounded-lg bg-white/05 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(85vh - 60px)', touchAction: 'pan-y' }}>
              {SHORTCUTS.map(cat => (
                <div key={cat.category}>
                  <div className="text-[0.48rem] font-bold text-violet-400/70 uppercase tracking-widest mb-2">{cat.category}</div>
                  <div className="space-y-1">
                    {cat.items.map(item => (
                      <div key={item.desc} className="flex items-center gap-2 text-[0.6rem]">
                        <div className="flex gap-1 shrink-0">
                          {item.keys.map(k => (
                            <kbd key={k} className="px-1.5 py-0.5 bg-white/08 border border-white/14 rounded-md text-white/70 font-mono text-[0.52rem]">{k}</kbd>
                          ))}
                        </div>
                        <span className="text-white/45 text-[0.55rem] truncate">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
