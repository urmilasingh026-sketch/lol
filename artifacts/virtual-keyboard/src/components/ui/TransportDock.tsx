import { Circle, Play, Pause, Square, Repeat, Download, Upload } from 'lucide-react';
import { useStore } from '@/store';
import { useRef, useState } from 'react';

export function TransportDock() {
  const {
    isRecording, isPlaying, recordedEvents, playbackSpeed,
    loopEnabled, startRecording, stopRecording, playRecording,
    stopPlayback, setPlaybackSpeed, setLoop, loadRecording,
  } = useStore();

  const hasRecording = recordedEvents.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleExport = () => {
    if (!hasRecording) return;
    const blob = new Blob([JSON.stringify(recordedEvents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `vk-recording-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed) || !parsed.length) { setUploadError('Invalid file'); return; }
        if (!parsed.every((x: any) => typeof x.key === 'string' && typeof x.timestamp === 'number')) {
          setUploadError('Bad format'); return;
        }
        loadRecording(parsed);
      } catch { setUploadError('Parse error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="flex flex-col gap-3.5 rounded-2xl overflow-hidden"
      style={{
        width: '11rem',
        padding: '14px',
        background: 'linear-gradient(170deg, rgba(16,11,36,0.96) 0%, rgba(10,7,24,0.98) 100%)',
        border: '1px solid rgba(139,92,246,0.18)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.035) inset, 0 12px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.055) inset',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full"
            style={{ background: isRecording ? '#ef4444' : isPlaying ? '#34d399' : 'rgba(139,92,246,0.6)' }} />
          <span className="text-[0.44rem] font-bold uppercase tracking-[0.22em]"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            {isRecording ? 'Recording' : isPlaying ? 'Playing' : 'Transport'}
          </span>
        </div>
        {isRecording && (
          <span className="font-mono text-[0.48rem] font-bold text-red-400">{recordedEvents.length}</span>
        )}
      </div>

      {/* Main transport controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Record */}
        <button onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? 'Stop Recording' : 'Record'}
          className="flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            width: '34px', height: '34px',
            background: isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
            border: isRecording ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: isRecording ? '#f87171' : 'rgba(255,255,255,0.45)',
            boxShadow: isRecording ? '0 0 14px rgba(239,68,68,0.3)' : 'none',
          }}>
          {isRecording
            ? <Square className="w-[11px] h-[11px] fill-current" />
            : <Circle className="w-[11px] h-[11px] fill-current" />}
        </button>

        {/* Play / Pause — largest */}
        <button onClick={isPlaying ? stopPlayback : playRecording}
          disabled={isRecording || (!hasRecording && !isPlaying)}
          title={isPlaying ? 'Pause' : 'Play'}
          className="flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            width: '42px', height: '42px',
            background: isPlaying
              ? 'rgba(52,211,153,0.18)'
              : 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(99,102,241,0.18))',
            border: isPlaying
              ? '1px solid rgba(52,211,153,0.45)'
              : '1px solid rgba(139,92,246,0.45)',
            color: isPlaying ? '#6ee7b7' : '#c4b5fd',
            boxShadow: isPlaying
              ? '0 0 18px rgba(52,211,153,0.25), 0 1px 0 rgba(255,255,255,0.07) inset'
              : '0 0 18px rgba(139,92,246,0.2), 0 1px 0 rgba(255,255,255,0.07) inset',
            opacity: (isRecording || (!hasRecording && !isPlaying)) ? 0.25 : 1,
            cursor: (isRecording || (!hasRecording && !isPlaying)) ? 'not-allowed' : 'pointer',
          }}>
          {isPlaying
            ? <Pause className="w-[14px] h-[14px] fill-current" />
            : <Play className="w-[14px] h-[14px] fill-current" style={{ marginLeft: '2px' }} />}
        </button>

        {/* Stop */}
        <button onClick={stopPlayback} disabled={!isPlaying}
          title="Stop"
          className="flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            width: '34px', height: '34px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
            opacity: !isPlaying ? 0.25 : 1,
            cursor: !isPlaying ? 'not-allowed' : 'pointer',
          }}>
          <Square className="w-[11px] h-[11px] fill-current" />
        </button>

        {/* Loop */}
        <button onClick={() => setLoop(!loopEnabled)} title="Toggle Loop"
          className="flex items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            width: '34px', height: '34px',
            background: loopEnabled ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
            border: loopEnabled ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: loopEnabled ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
            boxShadow: loopEnabled ? '0 0 10px rgba(139,92,246,0.25)' : 'none',
          }}>
          <Repeat className="w-[11px] h-[11px]" />
        </button>
      </div>

      {/* Speed slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[0.44rem] uppercase tracking-widest font-semibold"
            style={{ color: 'rgba(255,255,255,0.25)' }}>Speed</span>
          <span className="font-mono text-[0.6rem] font-black" style={{ color: '#a78bfa' }}>
            {playbackSpeed.toFixed(1)}×
          </span>
        </div>
        <input type="range" min="0.5" max="2" step="0.1"
          value={playbackSpeed}
          onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
          className="w-full" />
      </div>

      {/* Recording count pill */}
      {hasRecording && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)' }}>
          <span className="text-[0.44rem] uppercase tracking-wider" style={{ color: 'rgba(167,139,250,0.55)' }}>Loaded</span>
          <span className="text-[0.62rem] font-mono font-black" style={{ color: '#a78bfa' }}>
            {recordedEvents.length} <span style={{ color: 'rgba(167,139,250,0.45)', fontWeight: 400 }}>events</span>
          </span>
        </div>
      )}

      {/* Export / Upload */}
      <div className="flex gap-1.5">
        <button onClick={handleExport} disabled={!hasRecording}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[0.56rem] font-semibold transition-all active:scale-98"
          style={{
            background: hasRecording ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: hasRecording ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.04)',
            color: hasRecording ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
            cursor: hasRecording ? 'pointer' : 'not-allowed',
          }}>
          <Download className="w-2.5 h-2.5 shrink-0" />Export
        </button>
        <button onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[0.56rem] font-semibold transition-all active:scale-98"
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
          }}>
          <Upload className="w-2.5 h-2.5 shrink-0" />Upload
        </button>
        <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleUpload} />
      </div>

      {uploadError && (
        <p className="text-[0.5rem] text-center font-medium" style={{ color: '#f87171' }}>{uploadError}</p>
      )}
    </div>
  );
}
