import { useRef, useState, useEffect, useCallback } from 'react';

type Tool = 'pencil' | 'pen' | 'highlighter' | 'eraser';

interface Props {
  width: number;
  height: number;
  onSave: (data: string) => void;
  existingData?: string;
  overlay?: boolean;
}

export function DrawingCanvas({ width, height, onSave, existingData, overlay }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#e91e8c');
  const [size, setSize] = useState(4);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    if (existingData) {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0); saveHistory(); };
      img.src = existingData;
    } else {
      saveHistory();
    }
  }, []);

  function saveHistory() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => {
      const newH = prev.slice(0, historyIdx + 1);
      newH.push(data);
      setHistoryIdx(newH.length - 1);
      return newH;
    });
  }

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, getSize() / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? 'rgba(0,0,0,0)' : getColor();
    if (tool === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    else ctx.fill();
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!drawing || !lastPos.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = getColor();
    ctx.lineWidth = getSize();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (tool === 'highlighter') { ctx.globalAlpha = 0.4; }
    if (tool === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.globalAlpha = 1; }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    lastPos.current = pos;
  }

  function endDraw() {
    if (!drawing) return;
    setDrawing(false);
    lastPos.current = null;
    saveHistory();
    const canvas = canvasRef.current!;
    onSave(canvas.toDataURL());
  }

  function getColor() {
    if (tool === 'eraser') return 'rgba(0,0,0,1)';
    return color;
  }

  function getSize() {
    if (tool === 'highlighter') return size * 3;
    if (tool === 'pen') return size * 1.5;
    return size;
  }

  function undo() {
    if (historyIdx <= 0) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const newIdx = historyIdx - 1;
    ctx.putImageData(history[newIdx], 0, 0);
    setHistoryIdx(newIdx);
    onSave(canvas.toDataURL());
  }

  function redo() {
    if (historyIdx >= history.length - 1) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const newIdx = historyIdx + 1;
    ctx.putImageData(history[newIdx], 0, 0);
    setHistoryIdx(newIdx);
    onSave(canvas.toDataURL());
  }

  function clearAll() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistory();
    onSave(canvas.toDataURL());
  }

  const COLORS = ['#e91e8c','#b44fdb','#ff6eb4','#ff0000','#ff6600','#ffcc00','#00cc44','#0088ff','#6600cc','#ffffff','#000000','#ff99cc'];
  const TOOLS: { id: Tool; label: string; icon: string }[] = [
    { id: 'pencil', label: 'Pencil', icon: '✏️' },
    { id: 'pen', label: 'Pen', icon: '🖊️' },
    { id: 'highlighter', label: 'Highlight', icon: '🖍️' },
    { id: 'eraser', label: 'Eraser', icon: '🧹' },
  ];

  return (
    <div style={{ position: overlay ? 'absolute' : 'relative', inset: overlay ? 0 : undefined, zIndex: overlay ? 10 : undefined }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.5rem', background: 'rgba(0,0,0,0.75)', flexWrap: 'wrap' }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} title={t.label} style={{ background: tool === t.id ? 'var(--accent)' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '0.4rem', padding: '0.25rem 0.4rem', cursor: 'pointer', fontSize: 14, color: 'white' }}>
            {t.icon}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.3)' }} />
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: color === c ? '2px solid white' : '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', flexShrink: 0 }} />
        ))}
        <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 24, height: 24, border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'none', padding: 0 }} title="Custom colour" />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.3)' }} />
        <input type="range" min={1} max={20} value={size} onChange={e => setSize(+e.target.value)} style={{ width: 60 }} />
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.3)' }} />
        <button onClick={undo} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '0.4rem', padding: '0.25rem 0.4rem', cursor: 'pointer', color: 'white', fontSize: 12 }}>↩</button>
        <button onClick={redo} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '0.4rem', padding: '0.25rem 0.4rem', cursor: 'pointer', color: 'white', fontSize: 12 }}>↪</button>
        <button onClick={clearAll} style={{ background: 'rgba(220,38,38,0.6)', border: 'none', borderRadius: '0.4rem', padding: '0.25rem 0.4rem', cursor: 'pointer', color: 'white', fontSize: 12 }}>Clear</button>
      </div>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: 'block', width: '100%', height: 'auto', cursor: tool === 'eraser' ? 'cell' : 'crosshair', touchAction: 'none' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
    </div>
  );
}
