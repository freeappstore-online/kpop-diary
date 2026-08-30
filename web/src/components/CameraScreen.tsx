import { useRef, useState, useEffect, useCallback } from 'react';
import { DrawingCanvas } from './DrawingCanvas';
import { StickerPicker } from './StickerPicker';
import type { StickerOnCanvas } from '../types';

interface Props {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

type Stage = 'viewfinder' | 'preview';

export function CameraScreen({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stage, setStage] = useState<Stage>('viewfinder');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [filter, setFilter] = useState('none');
  const [showStickers, setShowStickers] = useState(false);
  const [stickers, setStickers] = useState<StickerOnCanvas[]>([]);
  const [drawingData, setDrawingData] = useState<string | undefined>();
  const [showDraw, setShowDraw] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragSticker, setDragSticker] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const FILTERS_CSS: Record<string, string> = {
    none: '', soft: 'brightness(1.1) contrast(0.9) saturate(0.9)',
    pastel: 'brightness(1.15) saturate(0.75)', pink: 'sepia(0.2) saturate(1.4) hue-rotate(300deg)',
    vintage: 'sepia(0.5) contrast(0.9)', dark: 'brightness(0.75) contrast(1.2)',
  };

  async function startCamera(facing: 'user' | 'environment') {
    try {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; }
      setCameraError(null);
    } catch (err) {
      setCameraError('Camera not available. Please allow camera access or use the upload option.');
    }
  }

  useEffect(() => {
    startCamera(facingMode);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [facingMode]);

  function flipCamera() {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }

  function takePhoto() {
    if (timerActive && timer > 0) {
      setCountdown(timer);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(interval); snap(); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      snap();
    }
  }

  function snap() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.filter = FILTERS_CSS[filter] || '';
    ctx.drawImage(video, 0, 0);
    const data = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(data);
    setStage('preview');
    streamRef.current?.getTracks().forEach(t => t.stop());
  }

  function addSticker(emoji: string) {
    setStickers(prev => [...prev, { id: Date.now().toString(), emoji, x: 30 + Math.random() * 40, y: 20 + Math.random() * 60, size: 36, rotation: Math.random() * 20 - 10 }]);
    setShowStickers(false);
  }

  function handleStickerMouseDown(e: React.MouseEvent, id: string) {
    e.preventDefault();
    setDragSticker(id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = stickers.find(s => s.id === id)!;
    setDragOffset({ x: e.clientX - (rect.left + s.x / 100 * rect.width), y: e.clientY - (rect.top + s.y / 100 * rect.height) });
  }

  useEffect(() => {
    if (!dragSticker) return;
    function onMove(e: MouseEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(100, ((e.clientX - dragOffset.x - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - dragOffset.y - rect.top) / rect.height) * 100));
      setStickers(prev => prev.map(s => s.id === dragSticker ? { ...s, x, y } : s));
    }
    function onUp() { setDragSticker(null); }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragSticker, dragOffset]);

  function handleUsePhoto() {
    onCapture(capturedImage!);
  }

  function retake() {
    setCapturedImage(null);
    setStage('viewfinder');
    setStickers([]);
    setDrawingData(undefined);
    setShowDraw(false);
    startCamera(facingMode);
  }

  const FILTER_OPTIONS = ['none','soft','pastel','pink','vintage','dark'];

  return (
    <div style={{ background: '#000', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.6)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: 'white', fontSize: 16 }}>✕</button>
        <div style={{ color: 'white', fontFamily: 'Fraunces, serif', fontWeight: 700 }}>
          {stage === 'viewfinder' ? '📸 Camera' : '🪄 Face Doodle'}
        </div>
        {stage === 'viewfinder' && <button onClick={flipCamera} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: 'white', fontSize: 18 }}>🔄</button>}
        {stage === 'preview' && <button onClick={handleUsePhoto} style={{ background: 'var(--accent)', border: 'none', borderRadius: '0.6rem', padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>Use ✓</button>}
      </div>

      {/* Viewfinder */}
      {stage === 'viewfinder' && (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {cameraError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', textAlign: 'center', padding: '2rem', gap: '1rem' }}>
              <div style={{ fontSize: 48 }}>📷</div>
              <div>{cameraError}</div>
              <button onClick={onClose} style={{ background: 'var(--accent)', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1.5rem', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Go Back</button>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none', filter: FILTERS_CSS[filter] || '' }} />
          )}

          {/* Countdown */}
          {countdown > 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, color: 'white', fontWeight: 900, textShadow: '0 0 20px rgba(0,0,0,0.5)', pointerEvents: 'none' }} className="animate-pulse">
              {countdown}
            </div>
          )}

          {/* Bottom controls */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'rgba(0,0,0,0.5)' }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem' }}>
              {FILTER_OPTIONS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ flexShrink: 0, padding: '0.25rem 0.6rem', borderRadius: '99px', border: filter === f ? '2px solid white' : '2px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                  {f}
                </button>
              ))}
            </div>
            {/* Main controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <button onClick={() => setTimerActive(!timerActive)} style={{ background: timerActive ? 'var(--accent)' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: 'white', fontSize: 18 }}>⏱️</button>
                {timerActive && (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[3, 5, 10].map(t => <button key={t} onClick={() => setTimer(t)} style={{ background: timer === t ? 'var(--accent)' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.3rem', padding: '0.15rem 0.4rem', color: 'white', fontSize: '0.7rem', cursor: 'pointer' }}>{t}s</button>)}
                  </div>
                )}
              </div>
              <button onClick={takePhoto} style={{ width: 72, height: 72, borderRadius: '50%', background: 'white', border: '4px solid rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px rgba(255,255,255,0.2)', transition: 'transform 0.1s' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }} />
              </button>
              <button onClick={() => setShowStickers(!showStickers)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: 'white', fontSize: 20 }}>🎀</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview / Face Doodle */}
      {stage === 'preview' && capturedImage && (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} ref={containerRef}>
          <img src={capturedImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

          {/* Stickers */}
          {stickers.map(s => (
            <div key={s.id} onMouseDown={e => handleStickerMouseDown(e, s.id)} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, transform: `rotate(${s.rotation}deg)`, cursor: 'grab', userSelect: 'none' }}>
              {s.emoji}
            </div>
          ))}

          {/* Drawing canvas overlay */}
          {showDraw && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
              <DrawingCanvas width={containerRef.current?.offsetWidth || 360} height={containerRef.current?.offsetHeight || 640} onSave={data => setDrawingData(data)} existingData={drawingData} overlay />
            </div>
          )}

          {/* Bottom controls */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.75rem', background: 'rgba(0,0,0,0.6)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={retake} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.6rem', padding: '0.5rem 1rem', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>🔄 Retake</button>
            <button onClick={() => setShowDraw(!showDraw)} style={{ background: showDraw ? 'var(--accent)' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.6rem', padding: '0.5rem 1rem', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>✏️ Face Doodle</button>
            <button onClick={() => setShowStickers(!showStickers)} style={{ background: showStickers ? 'var(--accent2)' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.6rem', padding: '0.5rem 1rem', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>🎀 Stickers</button>
          </div>

          {/* Sticker picker panel */}
          {showStickers && (
            <div className="animate-slideUp" style={{ position: 'absolute', bottom: 80, left: 0, right: 0, background: 'rgba(0,0,0,0.85)', padding: '0.75rem', maxHeight: 200, overflowY: 'auto' }}>
              <StickerPicker onSelect={addSticker} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
