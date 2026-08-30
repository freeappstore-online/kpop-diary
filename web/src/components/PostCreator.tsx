import { useState, useRef, useEffect } from 'react';
import type { Post, StickerOnCanvas } from '../types';
import { DrawingCanvas } from './DrawingCanvas';
import { StickerPicker } from './StickerPicker';

const FILTERS = ['none','soft','pastel','dreamy','pink','blue','purple','vintage','sparkle','dark'];
const FILTER_LABELS: Record<string, string> = { none:'Original', soft:'Soft', pastel:'Pastel', dreamy:'Dreamy', pink:'Pink', blue:'Blue', purple:'Purple', vintage:'Vintage', sparkle:'Sparkle', dark:'Dark' };
const FILTERS_CSS: Record<string, string> = {
  none: '', soft: 'brightness(1.1) contrast(0.9) saturate(0.9)',
  pastel: 'brightness(1.15) saturate(0.75) contrast(0.85)',
  dreamy: 'brightness(1.1) saturate(0.8)',
  pink: 'sepia(0.2) saturate(1.4) hue-rotate(300deg) brightness(1.05)',
  blue: 'sepia(0.1) saturate(1.3) hue-rotate(180deg) brightness(1.05)',
  purple: 'sepia(0.15) saturate(1.4) hue-rotate(240deg) brightness(1.05)',
  vintage: 'sepia(0.5) contrast(0.9) brightness(0.95) saturate(0.8)',
  sparkle: 'brightness(1.2) contrast(1.1) saturate(1.3)',
  dark: 'brightness(0.75) contrast(1.2) saturate(1.1)',
};
const FRAMES = ['none','polaroid','film','diary','glitter','kpop'];
const FRAME_LABELS: Record<string, string> = { none:'None', polaroid:'Polaroid', film:'Film Strip', diary:'Cute Diary', glitter:'Glitter', kpop:'K-Pop Album' };
const MOODS = ['😍','💗','✨','🥺','😭','🎵','💜','🔥','🌸','😊','💫','🎶','🫶','🌟','💝'];

type Tab = 'photo' | 'draw' | 'stickers' | 'filters' | 'frames' | 'details';

interface Props {
  onSave: (post: Omit<Post, 'id' | 'createdAt' | 'liked' | 'saved'>) => void;
  onClose: () => void;
  editPost?: Post | null;
  initialImage?: string;
}

export function PostCreator({ onSave, onClose, editPost, initialImage }: Props) {
  const [tab, setTab] = useState<Tab>(initialImage ? 'filters' : 'photo');
  const [imageData, setImageData] = useState<string | undefined>(initialImage || editPost?.imageData);
  const [caption, setCaption] = useState(editPost?.caption || '');
  const [songTag, setSongTag] = useState(editPost?.songTag || '');
  const [mood, setMood] = useState(editPost?.mood || '💗');
  const [filter, setFilter] = useState(editPost?.filter || 'none');
  const [frame, setFrame] = useState(editPost?.frame || 'none');
  const [stickers, setStickers] = useState<StickerOnCanvas[]>(editPost?.stickers || []);
  const [drawingData, setDrawingData] = useState<string | undefined>();
  const [dragSticker, setDragSticker] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImageData(ev.target?.result as string);
      setTab('filters');
    };
    reader.readAsDataURL(file);
  }

  function addSticker(emoji: string) {
    setStickers(prev => [...prev, {
      id: Date.now().toString(),
      emoji,
      x: 20 + Math.random() * 60,
      y: 15 + Math.random() * 70,
      size: 36,
      rotation: Math.random() * 20 - 10
    }]);
  }

  function updateSticker(id: string, changes: Partial<StickerOnCanvas>) {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, ...changes } : s));
  }

  function removeSticker(id: string) {
    setStickers(prev => prev.filter(s => s.id !== id));
  }

  function handleStickerMouseDown(e: React.MouseEvent, id: string) {
    e.preventDefault();
    setDragSticker(id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = stickers.find(s => s.id === id)!;
    setDragOffset({
      x: e.clientX - (rect.left + s.x / 100 * rect.width),
      y: e.clientY - (rect.top + s.y / 100 * rect.height)
    });
  }

  useEffect(() => {
    if (!dragSticker) return;
    function onMove(e: MouseEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(100, ((e.clientX - dragOffset.x - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - dragOffset.y - rect.top) / rect.height) * 100));
      updateSticker(dragSticker!, { x, y });
    }
    function onUp() { setDragSticker(null); }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragSticker, dragOffset]);

  // Touch drag for stickers
  function handleStickerTouchStart(e: React.TouchEvent, id: string) {
    e.preventDefault();
    setDragSticker(id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = stickers.find(s => s.id === id)!;
    setDragOffset({
      x: e.touches[0].clientX - (rect.left + s.x / 100 * rect.width),
      y: e.touches[0].clientY - (rect.top + s.y / 100 * rect.height)
    });
  }

  useEffect(() => {
    if (!dragSticker) return;
    function onTouchMove(e: TouchEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(100, ((e.touches[0].clientX - dragOffset.x - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.touches[0].clientY - dragOffset.y - rect.top) / rect.height) * 100));
      updateSticker(dragSticker!, { x, y });
    }
    function onTouchEnd() { setDragSticker(null); }
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => { window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd); };
  }, [dragSticker, dragOffset]);

  function handleSave() {
    onSave({ imageData, caption, songTag, mood, filter, frame, stickers });
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'photo', label: 'Photo', icon: '📸' },
    { id: 'draw', label: 'Draw', icon: '✏️' },
    { id: 'stickers', label: 'Stickers', icon: '🎀' },
    { id: 'filters', label: 'Filters', icon: '🎨' },
    { id: 'frames', label: 'Frames', icon: '🖼️' },
    { id: 'details', label: 'Details', icon: '📝' },
  ];

  const previewHeight = imageData ? 260 : 160;

  return (
    <div className="animate-slideUp" style={{ background: 'var(--paper)', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem 0.625rem', borderBottom: '1px solid var(--line)', background: 'var(--panel)', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', fontWeight: 600, padding: '0.25rem 0.5rem' }}>✕</button>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.05rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {editPost ? '✏️ Edit Post' : '✨ Create Post'}
        </div>
        <button onClick={handleSave} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white', border: 'none', borderRadius: '0.6rem', padding: '0.45rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
          {editPost ? 'Update' : 'Share 💗'}
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', overflowX: 'auto', padding: '0.5rem 0.5rem 0', gap: '0.3rem', background: 'var(--panel)', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0.4rem 0.7rem', borderRadius: '0.6rem 0.6rem 0 0', border: 'none', cursor: 'pointer', background: tab === t.id ? 'var(--paper)' : 'transparent', color: tab === t.id ? 'var(--accent)' : 'var(--muted)', fontWeight: 700, fontSize: '0.68rem', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0, borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent' }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Preview */}
        <div ref={containerRef} style={{ position: 'relative', background: '#0a0a0a', userSelect: 'none', height: previewHeight, overflow: 'hidden', flexShrink: 0 }}>
          {imageData ? (
            <img src={imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: FILTERS_CSS[filter] || '' }} />
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#555' }}>
              <div style={{ fontSize: 40 }}>📸</div>
              <div style={{ fontSize: '0.8rem' }}>Upload or take a photo</div>
            </div>
          )}
          {/* Frame overlays */}
          {imageData && frame === 'polaroid' && (
            <div style={{ position: 'absolute', inset: 0, border: '10px solid white', borderBottom: '36px solid white', pointerEvents: 'none' }} />
          )}
          {imageData && frame === 'glitter' && (
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 8px gold', pointerEvents: 'none' }} />
          )}
          {imageData && frame === 'kpop' && (
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 6px var(--accent)', pointerEvents: 'none' }} />
          )}
          {imageData && frame === 'diary' && (
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 8px #ffb6c1', borderRadius: 4, pointerEvents: 'none' }} />
          )}
          {imageData && frame === 'film' && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 20, background: '#111', display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
                {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ width: 10, height: 12, background: '#333', borderRadius: 2, flexShrink: 0 }} />)}
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, background: '#111', display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
                {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ width: 10, height: 12, background: '#333', borderRadius: 2, flexShrink: 0 }} />)}
              </div>
            </div>
          )}
          {/* Stickers */}
          {stickers.map(s => (
            <div key={s.id}
              onMouseDown={e => tab === 'stickers' ? handleStickerMouseDown(e, s.id) : undefined}
              onTouchStart={e => tab === 'stickers' ? handleStickerTouchStart(e, s.id) : undefined}
              style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`, cursor: tab === 'stickers' ? (dragSticker === s.id ? 'grabbing' : 'grab') : 'default', userSelect: 'none', touchAction: 'none', zIndex: 5 }}>
              {s.emoji}
              {tab === 'stickers' && (
                <button onClick={e => { e.stopPropagation(); removeSticker(s.id); }}
                  style={{ position: 'absolute', top: -10, right: -10, background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, zIndex: 6 }}>×</button>
              )}
            </div>
          ))}
          {/* Drawing canvas */}
          {tab === 'draw' && imageData && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
              <DrawingCanvas
                width={containerRef.current?.offsetWidth || 400}
                height={previewHeight}
                onSave={data => setDrawingData(data)}
                existingData={drawingData}
                overlay
              />
            </div>
          )}
        </div>

        {/* Tab panels */}
        <div style={{ padding: '1rem' }}>
          {tab === 'photo' && (
            <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.25rem', background: 'var(--panel)', border: '2px dashed var(--line-strong)', borderRadius: '1rem', cursor: 'pointer', color: 'var(--ink)', fontWeight: 600, fontSize: '0.95rem', width: '100%', transition: 'border-color 0.2s' }}>
                <span style={{ fontSize: 24 }}>📁</span> Upload from Device
              </button>
              {imageData && (
                <button onClick={() => { setImageData(undefined); setFilter('none'); setFrame('none'); setStickers([]); }} style={{ padding: '0.6rem', background: 'none', border: '1px solid var(--error)', borderRadius: '0.6rem', cursor: 'pointer', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 600 }}>
                  🗑️ Remove Image
                </button>
              )}
              <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.875rem', padding: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                  After uploading, switch to <strong>Filters</strong>, <strong>Stickers</strong>, or <strong>Draw</strong> tabs to decorate your photo!
                </div>
              </div>
            </div>
          )}

          {tab === 'draw' && (
            <div className="animate-fadeIn">
              {!imageData ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', background: 'var(--panel)', borderRadius: '1rem', border: '1px dashed var(--line-strong)' }}>
                  <div style={{ fontSize: 36, marginBottom: '0.5rem' }}>✏️</div>
                  <div style={{ fontWeight: 600 }}>Upload a photo first</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Then you can draw on it!</div>
                </div>
              ) : (
                <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.875rem', padding: '0.875rem', fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                  ✏️ Use the drawing tools in the toolbar above the preview image. Draw directly on your photo!
                  <br /><br />
                  <strong>Tools:</strong> Pencil · Pen · Highlighter · Eraser<br />
                  <strong>Controls:</strong> ↩ Undo · ↪ Redo · Clear All
                </div>
              )}
            </div>
          )}

          {tab === 'stickers' && (
            <div className="animate-fadeIn">
              <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
                Tap a sticker to add it. In the preview above, drag stickers to move them.
              </div>
              <StickerPicker onSelect={addSticker} />
              {stickers.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '0.5rem' }}>Resize & Rotate Stickers</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {stickers.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem' }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{s.emoji}</span>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', width: 32 }}>Size</span>
                            <input type="range" min={16} max={72} value={s.size} onChange={e => updateSticker(s.id, { size: +e.target.value })} style={{ flex: 1 }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', width: 32 }}>Rotate</span>
                            <input type="range" min={-180} max={180} value={s.rotation} onChange={e => updateSticker(s.id, { rotation: +e.target.value })} style={{ flex: 1 }} />
                          </div>
                        </div>
                        <button onClick={() => removeSticker(s.id)} style={{ background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 12, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'filters' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.2rem', borderRadius: '0.75rem', border: filter === f ? '2px solid var(--accent)' : '2px solid var(--line)', background: filter === f ? 'var(--accent)15' : 'var(--panel)', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '0.5rem', overflow: 'hidden', background: 'linear-gradient(135deg, #ff9de2, #a8c0ff)' }}>
                      {imageData ? (
                        <img src={imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: FILTERS_CSS[f] || '' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', filter: FILTERS_CSS[f] || '', background: 'linear-gradient(135deg, #ff9de2, #a8c0ff)' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: filter === f ? 'var(--accent)' : 'var(--muted)' }}>{FILTER_LABELS[f]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'frames' && (
            <div className="animate-fadeIn">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {FRAMES.map(f => (
                  <button key={f} onClick={() => setFrame(f)} style={{ padding: '0.875rem', borderRadius: '0.875rem', border: frame === f ? '2px solid var(--accent)' : '2px solid var(--line)', background: frame === f ? 'var(--accent)15' : 'var(--panel)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: frame === f ? 'var(--accent)' : 'var(--ink)', transition: 'all 0.2s', textAlign: 'center' }}>
                    {f === 'none' && '🚫'} {f === 'polaroid' && '📷'} {f === 'film' && '🎞️'} {f === 'diary' && '📔'} {f === 'glitter' && '✨'} {f === 'kpop' && '💿'}
                    <br />
                    {FRAME_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'details' && (
            <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>Caption ✍️</label>
                <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="What's on your mind? ✨" rows={4}
                  style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.875rem', padding: '0.75rem', color: 'var(--ink)', fontSize: '0.9rem', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.35rem' }}>🎵 Song Tag</label>
                <input value={songTag} onChange={e => setSongTag(e.target.value)} placeholder="e.g. Dynamite - BTS"
                  style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.875rem', padding: '0.65rem 0.875rem', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>Mood 💭</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {MOODS.map(m => (
                    <button key={m} onClick={() => setMood(m)} style={{ fontSize: 26, background: mood === m ? 'var(--accent)22' : 'var(--line)', border: mood === m ? '2px solid var(--accent)' : '2px solid transparent', borderRadius: '0.6rem', padding: '0.3rem 0.45rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
