import { useState } from 'react';
import { useListPresets, useCreatePreset, useDeletePreset } from '@workspace/api-client-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { Save, Trash2, Download, Upload, Star, Plus, RefreshCw } from 'lucide-react';

function getSettingsSnapshot(s: ReturnType<typeof useStore.getState>) {
  return {
    theme: s.theme, rgbEnabled: s.rgbEnabled, rgbMode: s.rgbMode, rgbCustomColor: s.rgbCustomColor,
    glowIntensity: s.glowIntensity, animationSpeed: s.animationSpeed, backgroundEffect: s.backgroundEffect,
    volume: s.volume, soundCategory: s.soundCategory, bpm: s.bpm, metronomeEnabled: s.metronomeEnabled,
    reverbEnabled: s.reverbEnabled, delayEnabled: s.delayEnabled, chorusEnabled: s.chorusEnabled,
    distortionEnabled: s.distortionEnabled, compressionEnabled: s.compressionEnabled,
    masterPitch: s.masterPitch, octaveShift: s.octaveShift, musicalScale: s.musicalScale, scaleEnabled: s.scaleEnabled,
    keySize: s.keySize, keyShape: s.keyShape, keyOpacity: s.keyOpacity, keyPressEffect: s.keyPressEffect,
    typingMode: s.typingMode, timedDuration: s.timedDuration, lessonNumber: s.lessonNumber,
    highContrast: s.highContrast, reduceMotion: s.reduceMotion, focusMode: s.focusMode,
    cursorStyle: s.cursorStyle, typingFont: s.typingFont, performanceMode: s.performanceMode,
  };
}

function applySettingsSnapshot(settings: Record<string, unknown>) {
  const s = useStore.getState();
  if (settings.theme) s.setTheme(settings.theme as any);
  if (settings.rgbEnabled !== undefined) s.setRgbEnabled(settings.rgbEnabled as any);
  if (settings.rgbMode) s.setRgbMode(settings.rgbMode as any);
  if (settings.rgbCustomColor) s.setRgbCustomColor(settings.rgbCustomColor as any);
  if (settings.glowIntensity !== undefined) s.setGlowIntensity(settings.glowIntensity as any);
  if (settings.animationSpeed !== undefined) s.setAnimationSpeed(settings.animationSpeed as any);
  if (settings.backgroundEffect) s.setBackgroundEffect(settings.backgroundEffect as any);
  if (settings.volume !== undefined) s.setVolume(settings.volume as any);
  if (settings.soundCategory) s.setSoundCategory(settings.soundCategory as any);
  if (settings.bpm !== undefined) s.setBpm(settings.bpm as any);
  if (settings.metronomeEnabled !== undefined) s.setMetronome(settings.metronomeEnabled as any);
  if (settings.reverbEnabled !== undefined) s.setEffect('reverb', settings.reverbEnabled as any);
  if (settings.delayEnabled !== undefined) s.setEffect('delay', settings.delayEnabled as any);
  if (settings.chorusEnabled !== undefined) s.setEffect('chorus', settings.chorusEnabled as any);
  if (settings.masterPitch !== undefined) s.setMasterPitch(settings.masterPitch as any);
  if (settings.octaveShift !== undefined) s.setOctaveShift(settings.octaveShift as any);
  if (settings.musicalScale) s.setMusicalScale(settings.musicalScale as any);
  if (settings.scaleEnabled !== undefined) s.setScaleEnabled(settings.scaleEnabled as any);
  if (settings.keySize !== undefined) s.setKeySize(settings.keySize as any);
  if (settings.keyShape) s.setKeyShape(settings.keyShape as any);
  if (settings.keyOpacity !== undefined) s.setKeyOpacity(settings.keyOpacity as any);
  if (settings.keyPressEffect) s.setKeyPressEffect(settings.keyPressEffect as any);
  if (settings.typingMode) s.setTypingMode(settings.typingMode as any);
  if (settings.timedDuration !== undefined) s.setTimedDuration(settings.timedDuration as any);
  if (settings.highContrast !== undefined) s.setHighContrast(settings.highContrast as any);
  if (settings.reduceMotion !== undefined) s.setReduceMotion(settings.reduceMotion as any);
  if (settings.focusMode !== undefined) s.setFocusMode(settings.focusMode as any);
  if (settings.cursorStyle) s.setCursorStyle(settings.cursorStyle as any);
  if (settings.typingFont) s.setTypingFont(settings.typingFont as any);
  if (settings.performanceMode !== undefined) s.setPerformanceMode(settings.performanceMode as any);
}

export function PresetsManager() {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const store = useStore();

  const { data: presets = [], refetch, isFetching } = useListPresets({});
  const { mutateAsync: createPreset } = useCreatePreset();
  const { mutateAsync: deletePreset } = useDeletePreset();

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const settings = getSettingsSnapshot(store);
      await createPreset({ data: { name: name.trim(), sessionId: 'local', settings, isPublic: false } });
      setName('');
      setSuccessMsg('Preset saved!');
      setTimeout(() => setSuccessMsg(''), 2000);
      refetch();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await deletePreset({ id });
    refetch();
  }

  function handleLoad(settings: Record<string, unknown>) {
    applySettingsSnapshot(settings);
    setSuccessMsg('Preset loaded!');
    setTimeout(() => setSuccessMsg(''), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-white/08">
        <Star className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[0.65rem] font-bold text-white/70 uppercase tracking-wider">Saved Presets</span>
        <button onClick={() => refetch()} className="ml-auto text-white/30 hover:text-white/70 transition-colors">
          <RefreshCw className={cn('w-3 h-3', isFetching && 'animate-spin')} />
        </button>
      </div>

      {/* Save new preset */}
      <div className="space-y-2">
        <label className="text-[0.58rem] text-white/45 uppercase tracking-wider">Save Current Settings</label>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Preset name…"
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/06 border border-white/10 text-white/80 text-[0.65rem] placeholder:text-white/25 focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.62rem] font-semibold transition-all',
              name.trim() ? 'bg-violet-500/25 border border-violet-500/40 text-violet-200 hover:bg-violet-500/35' : 'bg-white/05 border border-white/08 text-white/25 cursor-not-allowed'
            )}
          >
            <Save className="w-3 h-3" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        {successMsg && (
          <p className="text-[0.58rem] text-emerald-400 font-medium">{successMsg}</p>
        )}
      </div>

      {/* Preset list */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1" style={{ touchAction: 'pan-y' }}>
        {presets.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Plus className="w-6 h-6 text-white/15" />
            <p className="text-[0.58rem] text-white/25">No presets yet. Save your current settings above.</p>
          </div>
        )}
        {presets.map((p: any) => (
          <div
            key={p.id}
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/04 border border-white/07 group hover:border-white/14 transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[0.65rem] font-semibold text-white/80 truncate">{p.name}</p>
              <p className="text-[0.5rem] text-white/30 mt-0.5">
                {new Date(p.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleLoad(p.settings || {})}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/15 border border-violet-500/25 text-violet-300 text-[0.55rem] opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-500/25"
            >
              <Download className="w-2.5 h-2.5" />
              Load
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-white/25 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Export/Import */}
      <div className="pt-2 border-t border-white/06 space-y-2">
        <label className="text-[0.58rem] text-white/35 uppercase tracking-wider">Export / Import</label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const data = JSON.stringify(getSettingsSnapshot(store), null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'ukaurora-settings.json'; a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/05 border border-white/08 text-[0.6rem] text-white/50 hover:text-white/80 transition-all"
          >
            <Upload className="w-3 h-3" /> Export JSON
          </button>
          <label className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/05 border border-white/08 text-[0.6rem] text-white/50 hover:text-white/80 transition-all cursor-pointer">
            <Download className="w-3 h-3" /> Import JSON
            <input type="file" accept=".json" className="hidden" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => {
                try {
                  const data = JSON.parse(ev.target?.result as string);
                  applySettingsSnapshot(data);
                  setSuccessMsg('Settings imported!');
                  setTimeout(() => setSuccessMsg(''), 2000);
                } catch { setSuccessMsg('Invalid file'); setTimeout(() => setSuccessMsg(''), 2000); }
              };
              reader.readAsText(file);
              e.target.value = '';
            }} />
          </label>
        </div>
      </div>
    </div>
  );
}
