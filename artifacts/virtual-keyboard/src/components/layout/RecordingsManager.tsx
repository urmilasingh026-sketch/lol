import { useState } from 'react';
import { useListRecordings, useCreateRecording, useDeleteRecording } from '@workspace/api-client-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { Mic, Trash2, Play, Square, Save, RefreshCw, Clock, Music2 } from 'lucide-react';

function formatDuration(ms: number) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

export function RecordingsManager() {
  const store = useStore();
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);

  const { data: recordings = [], refetch, isFetching } = useListRecordings({});
  const { mutateAsync: createRecording } = useCreateRecording();
  const { mutateAsync: deleteRecording } = useDeleteRecording();

  const hasLocal = store.recordedEvents.length > 0;

  async function handleSaveLocal() {
    if (!saveName.trim() || !hasLocal) return;
    setSaving(true);
    try {
      const dur = store.recordingDuration || (store.recordedEvents.length > 0
        ? store.recordedEvents[store.recordedEvents.length - 1].timestamp : 0);
      await createRecording({
        data: {
          name: saveName.trim(),
          sessionId: 'local',
          events: store.recordedEvents,
          duration: dur,
          bpm: store.bpm,
        },
      });
      setSaveName('');
      setMsg('Recording saved!');
      setTimeout(() => setMsg(''), 2000);
      refetch();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteRecording({ id });
    refetch();
  }

  const { isRecording, isPlaying, startRecording, stopRecording } = store;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-white/08">
        <Music2 className="w-3.5 h-3.5 text-rose-400" />
        <span className="text-[0.65rem] font-bold text-white/70 uppercase tracking-wider">Recordings</span>
        <button onClick={() => refetch()} className="ml-auto text-white/30 hover:text-white/70 transition-colors">
          <RefreshCw className={cn('w-3 h-3', isFetching && 'animate-spin')} />
        </button>
      </div>

      {/* Record controls */}
      <div className="space-y-2">
        <label className="text-[0.58rem] text-white/45 uppercase tracking-wider">Live Recording</label>
        <div className="flex gap-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[0.65rem] font-semibold hover:bg-rose-500/25 transition-all"
            >
              <Mic className="w-3.5 h-3.5" /> Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/25 border border-rose-400/50 text-rose-200 text-[0.65rem] font-semibold hover:bg-rose-500/35 transition-all animate-pulse"
            >
              <Square className="w-3.5 h-3.5" /> Stop Recording
            </button>
          )}
        </div>

        {hasLocal && !isRecording && (
          <div className="space-y-2">
            <div className="flex gap-2 text-[0.6rem]">
              <span className="text-white/40">{store.recordedEvents.length} events recorded</span>
            </div>
            <div className="flex gap-2">
              <input
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveLocal()}
                placeholder="Name this recording…"
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/06 border border-white/10 text-white/80 text-[0.65rem] placeholder:text-white/25 focus:outline-none focus:border-violet-500/50"
              />
              <button
                onClick={handleSaveLocal}
                disabled={saving || !saveName.trim()}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[0.62rem] font-semibold transition-all',
                  saveName.trim() ? 'bg-violet-500/25 border border-violet-500/40 text-violet-200 hover:bg-violet-500/35' : 'bg-white/05 border border-white/08 text-white/25 cursor-not-allowed'
                )}
              >
                <Save className="w-3 h-3" />
                {saving ? '…' : 'Save'}
              </button>
            </div>
          </div>
        )}
        {msg && <p className="text-[0.58rem] text-emerald-400 font-medium">{msg}</p>}
      </div>

      {/* Saved recordings list */}
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1" style={{ touchAction: 'pan-y' }}>
        {recordings.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-5 text-center">
            <Mic className="w-5 h-5 text-white/15" />
            <p className="text-[0.58rem] text-white/25">No saved recordings yet.</p>
          </div>
        )}
        {recordings.map((r: any) => (
          <div
            key={r.id}
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/04 border border-white/07 group hover:border-white/14 transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[0.65rem] font-semibold text-white/80 truncate">{r.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 text-[0.5rem] text-white/30">
                  <Clock className="w-2 h-2" /> {r.duration ? formatDuration(r.duration) : '—'}
                </span>
                {r.bpm && <span className="text-[0.5rem] text-white/25">{r.bpm} BPM</span>}
              </div>
            </div>
            <button
              onClick={() => {
                if (playingId === r.id) { store.stopPlayback(); setPlayingId(null); }
                else { setPlayingId(r.id); store.playRecording(); }
              }}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-[0.55rem] border opacity-0 group-hover:opacity-100 transition-all',
                playingId === r.id
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-violet-500/15 border-violet-500/25 text-violet-300 hover:bg-violet-500/25'
              )}
            >
              {playingId === r.id ? <Square className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              {playingId === r.id ? 'Stop' : 'Play'}
            </button>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-white/25 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
