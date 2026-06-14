import { Circle, Play, Pause, Square, Repeat, Download, Upload } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
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
    const data = JSON.stringify(recordedEvents, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vk-recording-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed) || parsed.length === 0) { setUploadError('Invalid file'); return; }
        const isValid = parsed.every((item: any) => typeof item.key === 'string' && typeof item.timestamp === 'number');
        if (!isValid) { setUploadError('Bad format'); return; }
        loadRecording(parsed);
      } catch { setUploadError('Parse error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="flex flex-col gap-3 p-3 sm:p-4 rounded-2xl w-44 sm:w-52"
      style={{
        background: 'linear-gradient(160deg, rgba(20,15,40,0.92) 0%, rgba(12,10,28,0.95) 100%)',
        border: '1px solid rgba(139,92,246,0.2)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(139,92,246,0.7)' }} />
          <span className="text-[0.48rem] font-bold uppercase tracking-[0.2em]"
            style={{ color: 'rgba(255,255,255,0.3)' }}>Transport</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isRecording && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[0.48rem] text-red-400 font-mono font-bold">{recordedEvents.length}</span>
            </>
          )}
          {isPlaying && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[0.48rem] text-emerald-400 font-mono font-bold">PLAY</span>
            </>
          )}
        </div>
      </div>

      {/* Transport buttons */}
      <div className="flex justify-center items-center gap-2">
        {/* Record */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? 'Stop Recording' : 'Record'}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
            border: isRecording ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: isRecording ? '#f87171' : 'rgba(255,255,255,0.5)',
            boxShadow: isRecording ? '0 0 12px rgba(239,68,68,0.25)' : 'none',
          }}
        >
          {isRecording
            ? <Square className="w-3 h-3 fill-current" />
            : <Circle className="w-3 h-3 fill-current" />}
        </button>

        {/* Play / Pause — largest button */}
        <button
          onClick={isPlaying ? stopPlayback : playRecording}
          disabled={isRecording || (!hasRecording && !isPlaying)}
          title={isPlaying ? 'Pause' : 'Play'}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isPlaying ? 'rgba(52,211,153,0.15)' : 'rgba(139,92,246,0.15)',
            border: isPlaying ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(139,92,246,0.4)',
            color: isPlaying ? '#6ee7b7' : '#a78bfa',
            boxShadow: isPlaying
              ? '0 0 14px rgba(52,211,153,0.2)'
              : (isRecording || (!hasRecording && !isPlaying)) ? 'none' : '0 0 14px rgba(139,92,246,0.15)',
            opacity: (isRecording || (!hasRecording && !isPlaying)) ? 0.3 : 1,
            cursor: (isRecording || (!hasRecording && !isPlaying)) ? 'not-allowed' : 'pointer',
            pointerEvents: (isRecording || (!hasRecording && !isPlaying)) ? 'none' : 'auto',
          }}
        >
          {isPlaying
            ? <Pause className="w-4 h-4 fill-current" />
            : <Play className="w-4 h-4 fill-current" style={{ marginLeft: '2px' }} />}
        </button>

        {/* Stop */}
        <button
          onClick={stopPlayback}
          disabled={!isPlaying}
          title="Stop"
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            opacity: !isPlaying ? 0.3 : 1,
            cursor: !isPlaying ? 'not-allowed' : 'pointer',
            pointerEvents: !isPlaying ? 'none' : 'auto',
          }}
        >
          <Square className="w-3 h-3 fill-current" />
        </button>

        {/* Loop */}
        <button
          onClick={() => setLoop(!loopEnabled)}
          title="Toggle Loop"
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{
            background: loopEnabled ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.06)',
            border: loopEnabled ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(255,255,255,0.1)',
            color: loopEnabled ? '#c4b5fd' : 'rgba(255,255,255,0.45)',
            boxShadow: loopEnabled ? '0 0 10px rgba(139,92,246,0.2)' : 'none',
          }}
        >
          <Repeat className="w-3 h-3" />
        </button>
      </div>

      {/* Speed control */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[0.48rem] uppercase tracking-widest font-medium"
            style={{ color: 'rgba(255,255,255,0.3)' }}>Speed</span>
          <span className="font-mono text-[0.62rem] font-bold" style={{ color: '#a78bfa' }}>
            {playbackSpeed.toFixed(1)}×
          </span>
        </div>
        <input
          type="range" min="0.5" max="2" step="0.1"
          value={playbackSpeed}
          onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Loaded events info */}
      {hasRecording && (
        <div className="text-center rounded-xl py-1.5 px-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[0.44rem] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Loaded
          </div>
          <div className="text-xs font-mono font-bold text-white">{recordedEvents.length} events</div>
        </div>
      )}

      {/* Export + Upload */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleExport}
          disabled={!hasRecording}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[0.58rem] font-semibold transition-all"
          style={{
            background: hasRecording ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: hasRecording ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.04)',
            color: hasRecording ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)',
            opacity: hasRecording ? 1 : 0.4,
            cursor: hasRecording ? 'pointer' : 'not-allowed',
          }}
          title="Export JSON"
        >
          <Download className="w-2.5 h-2.5 shrink-0" />Export
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[0.58rem] font-semibold transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.55)',
          }}
          title="Upload recording"
        >
          <Upload className="w-2.5 h-2.5 shrink-0" />Upload
        </button>

        <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleUpload} />
      </div>

      {uploadError && (
        <div className="text-[0.52rem] text-center font-medium" style={{ color: '#f87171' }}>{uploadError}</div>
      )}
    </div>
  );
}
