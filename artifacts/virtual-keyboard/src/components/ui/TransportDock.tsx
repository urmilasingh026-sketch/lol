import { Circle, Play, Pause, Square, Repeat, Download, Upload, Disc } from 'lucide-react';
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
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setUploadError('Invalid recording file');
          return;
        }
        const isValid = parsed.every((item: any) =>
          typeof item.key === 'string' && typeof item.timestamp === 'number'
        );
        if (!isValid) {
          setUploadError('Invalid recording format');
          return;
        }
        loadRecording(parsed);
      } catch {
        setUploadError('Could not parse file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="transport-dock px-3 sm:px-4 py-3 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Disc className="w-3 h-3 text-white/30" />
          <span className="text-[0.5rem] font-bold text-white/30 uppercase tracking-[0.18em]">Transport</span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 rec-indicator" />
            <span className="text-[0.52rem] text-red-400 font-mono font-bold">{recordedEvents.length}</span>
          </div>
        )}
        {isPlaying && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.52rem] text-emerald-400 font-mono font-bold">PLAY</span>
          </div>
        )}
      </div>

      {/* Transport buttons */}
      <div className="flex justify-center items-center gap-2">
        {/* Record */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn('transport-btn', isRecording && 'active')}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording
            ? <Square className="w-3.5 h-3.5 fill-current" />
            : <Circle className="w-3.5 h-3.5 fill-current" />}
        </button>

        {/* Play / Pause */}
        <button
          onClick={isPlaying ? stopPlayback : playRecording}
          disabled={isRecording || (!hasRecording && !isPlaying)}
          className={cn(
            'transport-btn w-11 h-11',
            isPlaying && 'play-active',
            (isRecording || (!hasRecording && !isPlaying)) && 'opacity-30 cursor-not-allowed pointer-events-none'
          )}
          title={isPlaying ? 'Stop' : 'Play'}
        >
          {isPlaying
            ? <Pause className="w-4.5 h-4.5 fill-current" />
            : <Play className="w-4.5 h-4.5 fill-current" style={{ marginLeft: '2px' }} />}
        </button>

        {/* Stop */}
        <button
          onClick={stopPlayback}
          disabled={!isPlaying}
          className={cn('transport-btn', !isPlaying && 'opacity-30 cursor-not-allowed pointer-events-none')}
          title="Stop"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Loop */}
        <button
          onClick={() => setLoop(!loopEnabled)}
          className={cn(
            'transport-btn',
            loopEnabled && 'bg-violet-500/22 border-violet-500/55 text-violet-300 shadow-[0_0_10px_rgba(160,80,255,0.3)]'
          )}
          title="Toggle Loop"
        >
          <Repeat className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Speed control */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[0.52rem] text-white/38 uppercase tracking-widest">Speed</span>
          <span className="font-mono text-[0.62rem] text-violet-400 font-bold">{playbackSpeed.toFixed(1)}×</span>
        </div>
        <input
          type="range"
          min="0.5" max="2" step="0.1"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Recording info */}
      {hasRecording && (
        <div className="bg-white/03 border border-white/07 rounded-lg px-2 py-1.5 text-center">
          <div className="text-[0.48rem] text-white/35 uppercase tracking-wider">Loaded Events</div>
          <div className="text-xs font-mono text-white font-bold">{recordedEvents.length}</div>
        </div>
      )}

      {/* Export + Upload row */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          disabled={!hasRecording}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[0.62rem] font-semibold transition-all',
            hasRecording
              ? 'bg-white/05 border-white/10 text-white/65 hover:bg-violet-500/15 hover:text-violet-200 hover:border-violet-500/35'
              : 'opacity-25 cursor-not-allowed bg-transparent border-white/05 text-white/25'
          )}
          title="Export recording as JSON"
        >
          <Download className="w-3 h-3 shrink-0" />
          Export
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[0.62rem] font-semibold transition-all bg-white/05 border-white/10 text-white/65 hover:bg-emerald-500/15 hover:text-emerald-200 hover:border-emerald-500/35"
          title="Upload a saved recording JSON"
        >
          <Upload className="w-3 h-3 shrink-0" />
          Upload
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="text-[0.55rem] text-red-400 text-center font-medium">{uploadError}</div>
      )}
    </div>
  );
}
