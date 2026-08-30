import { useState, useRef } from 'react';
import type { Idol } from '../types';

const FOLDERS = ['⭐ Favourites', '💗 Biases', '🎤 Groups', '💿 Albums', '📸 Fave Photos', '✨ Concert Memories', '🌟 All'];

interface Props {
  idols: Idol[];
  onAdd: (idol: Omit<Idol, 'id' | 'createdAt'>) => void;
  onEdit: (idol: Idol) => void;
  onDelete: (id: string) => void;
}

export function IdolsScreen({ idols, onAdd, onEdit, onDelete }: Props) {
  const [activeFolder, setActiveFolder] = useState('🌟 All');
  const [showForm, setShowForm] = useState(false);
  const [editingIdol, setEditingIdol] = useState<Idol | null>(null);
  const [form, setForm] = useState({ name: '', group: '', favSong: '', favEra: '', notes: '', folder: '⭐ Favourites', imageData: '' });
  const fileRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [viewIdol, setViewIdol] = useState<Idol | null>(null);

  const filtered = activeFolder === '🌟 All' ? idols : idols.filter(i => i.folder === activeFolder);

  function openAdd() {
    setEditingIdol(null);
    setForm({ name: '', group: '', favSong: '', favEra: '', notes: '', folder: '⭐ Favourites', imageData: '' });
    setShowForm(true);
  }

  function openEdit(idol: Idol) {
    setEditingIdol(idol);
    setForm({ name: idol.name, group: idol.group, favSong: idol.favSong, favEra: idol.favEra, notes: idol.notes, folder: idol.folder, imageData: idol.imageData || '' });
    setShowForm(true);
    setMenuOpen(null);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, imageData: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.name) return;
    if (editingIdol) {
      onEdit({ ...editingIdol, ...form });
    } else {
      onAdd(form);
    }
    setShowForm(false);
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'var(--glass)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              💿 My Idols
            </div>
            <button onClick={openAdd} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white', border: 'none', borderRadius: '0.6rem', padding: '0.4rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
              + Add Idol
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
        {/* Folder tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: '0.4rem', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          {FOLDERS.map(f => (
            <button key={f} onClick={() => setActiveFolder(f)} style={{ flexShrink: 0, padding: '0.4rem 0.8rem', borderRadius: '99px', border: 'none', cursor: 'pointer', background: activeFolder === f ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--panel)', color: activeFolder === f ? 'white' : 'var(--muted)', fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap', border: activeFolder === f ? 'none' : '1px solid var(--line)', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)' }} className="animate-fadeIn">
            <div style={{ fontSize: 64, marginBottom: '1rem' }} className="animate-float">💿</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>No idols yet!</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Add your favourite K-pop idols ✨</div>
            <button onClick={openAdd} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 2rem', fontWeight: 700, cursor: 'pointer' }}>
              + Add First Idol
            </button>
          </div>
        )}

        {/* Idol grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {filtered.map((idol, i) => (
            <div key={idol.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.05}s`, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => setViewIdol(idol)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}>
              {/* Photo */}
              <div style={{ height: 180, background: 'linear-gradient(135deg, var(--accent)22, var(--accent2)22)', position: 'relative', overflow: 'hidden' }}>
                {idol.imageData ? (
                  <img src={idol.imageData} alt={idol.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>⭐</div>
                )}
                {/* Menu button */}
                <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === idol.id ? null : idol.id); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⋯</button>
                {menuOpen === idol.id && (
                  <div className="animate-pop" style={{ position: 'absolute', top: 40, right: 8, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 10, overflow: 'hidden', minWidth: 120 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(idol)} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '0.5rem 0.75rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 500 }}>✏️ Edit</button>
                    <button onClick={() => { onDelete(idol.id); setMenuOpen(null); }} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '0.5rem 0.75rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--error)', fontWeight: 500 }}>🗑️ Delete</button>
                  </div>
                )}
              </div>
              {/* Info */}
              <div style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{idol.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>{idol.group}</div>
                {idol.favSong && <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>🎵 {idol.favSong}</div>}
                <div style={{ marginTop: '0.4rem', display: 'inline-block', background: 'var(--line)', borderRadius: '99px', padding: '0.15rem 0.5rem', fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600 }}>{idol.folder}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowForm(false)}>
          <div className="animate-slideUp" style={{ background: 'var(--paper)', borderRadius: '1.25rem 1.25rem 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.1rem' }}>{editingIdol ? 'Edit Idol' : 'Add Idol'} ⭐</div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }}>✕</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            {/* Photo upload */}
            <div onClick={() => fileRef.current?.click()} style={{ height: 140, background: form.imageData ? 'transparent' : 'var(--line)', borderRadius: '1rem', marginBottom: '1rem', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--line-strong)' }}>
              {form.imageData ? <img src={form.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', color: 'var(--muted)' }}><div style={{ fontSize: 32 }}>📸</div><div style={{ fontSize: '0.8rem' }}>Tap to add photo</div></div>}
            </div>
            {/* Fields */}
            {[
              { key: 'name', label: 'Idol Name *', placeholder: 'e.g. Jimin' },
              { key: 'group', label: 'Group', placeholder: 'e.g. BTS' },
              { key: 'favSong', label: '🎵 Favourite Song', placeholder: 'e.g. Filter' },
              { key: 'favEra', label: '✨ Favourite Era', placeholder: 'e.g. Butter Era' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>{field.label}</label>
                <input value={form[field.key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} placeholder={field.placeholder}
                  style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Notes 📝</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Personal notes about this idol..." rows={2}
                style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--ink)', fontSize: '0.9rem', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>Folder</label>
              <select value={form.folder} onChange={e => setForm(f => ({ ...f, folder: e.target.value }))} style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none' }}>
                {FOLDERS.filter(f => f !== '🌟 All').map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <button onClick={handleSubmit} style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
              {editingIdol ? '✓ Update Idol' : '+ Add to Collection'}
            </button>
          </div>
        </div>
      )}

      {/* View Idol Modal */}
      {viewIdol && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setViewIdol(null)}>
          <div className="animate-pop" style={{ background: 'var(--paper)', borderRadius: '1.25rem', width: '100%', maxWidth: 380, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 260, background: 'linear-gradient(135deg, var(--accent)22, var(--accent2)22)', position: 'relative' }}>
              {viewIdol.imageData ? <img src={viewIdol.imageData} alt={viewIdol.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 72 }}>⭐</div>}
              <button onClick={() => setViewIdol(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'white', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.25rem' }}>{viewIdol.name}</div>
              <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '1rem' }}>{viewIdol.group}</div>
              {viewIdol.favSong && <InfoRow icon="🎵" label="Fave Song" value={viewIdol.favSong} />}
              {viewIdol.favEra && <InfoRow icon="✨" label="Fave Era" value={viewIdol.favEra} />}
              {viewIdol.notes && <InfoRow icon="📝" label="Notes" value={viewIdol.notes} />}
              <div style={{ marginTop: '0.75rem', display: 'inline-block', background: 'var(--line)', borderRadius: '99px', padding: '0.25rem 0.75rem', fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>{viewIdol.folder}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
      <span>{icon}</span>
      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{label}:</span>
      <span style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  );
}
