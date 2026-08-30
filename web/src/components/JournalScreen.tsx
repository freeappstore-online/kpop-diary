import { useState, useRef } from 'react';
import type { JournalEntry } from '../types';

const MOODS = ['😍','💗','✨','🥺','😭','🎵','💜','🔥','🌸','😊','💫','🎶','🫶','🌟','💝'];
const EMOJIS = ['😀','😂','🥰','😍','🤩','😎','🥺','😭','😤','🤗','💗','❤️','💜','💙','💚','💛','🧡','🖤','🤍','⭐','🌟','✨','💫','🎵','🎶','🎤','🎧','💿','🌸','🌺','🌷','🍀','🦋','🌈','☀️','🌙','⚡','🔥','💎','👑'];

interface Props {
  entries: JournalEntry[];
  onAdd: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export function JournalScreen({ entries, onAdd, onEdit, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [form, setForm] = useState({ text: '', mood: '💗', songTag: '', imageData: '' });
  const [showEmojis, setShowEmojis] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  function openAdd() {
    setEditingEntry(null);
    setForm({ text: '', mood: '💗', songTag: '', imageData: '' });
    setShowForm(true);
  }

  function openEdit(entry: JournalEntry) {
    setEditingEntry(entry);
    setForm({ text: entry.text, mood: entry.mood, songTag: entry.songTag, imageData: entry.imageData || '' });
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

  function insertEmoji(emoji: string) {
    const ta = textRef.current;
    if (!ta) { setForm(f => ({ ...f, text: f.text + emoji })); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newText = form.text.slice(0, start) + emoji + form.text.slice(end);
    setForm(f => ({ ...f, text: newText }));
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + emoji.length; ta.focus(); }, 0);
    setShowEmojis(false);
  }

  function handleSubmit() {
    if (!form.text.trim()) return;
    if (editingEntry) {
      onEdit({ ...editingEntry, ...form });
    } else {
      onAdd(form);
    }
    setShowForm(false);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'var(--glass)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              📔 My Journal
            </div>
            <button onClick={openAdd} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white', border: 'none', borderRadius: '0.6rem', padding: '0.4rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
              + New Entry
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)' }} className="animate-fadeIn">
            <div style={{ fontSize: 64, marginBottom: '1rem' }} className="animate-float">📔</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Start Your Diary!</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Write your K-pop thoughts and memories 💗</div>
            <button onClick={openAdd} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 2rem', fontWeight: 700, cursor: 'pointer' }}>
              + Write First Entry
            </button>
          </div>
        )}

        {entries.map((entry, i) => (
          <div key={entry.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.05}s`, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }}
            onClick={() => setViewEntry(entry)}>
            {/* Date header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>{formatDate(entry.createdAt)}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{formatTime(entry.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: 24 }}>{entry.mood}</span>
                <div style={{ position: 'relative' }}>
                  <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === entry.id ? null : entry.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18, padding: '0.2rem 0.4rem' }}>⋯</button>
                  {menuOpen === entry.id && (
                    <div className="animate-pop" style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, minWidth: 130, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(entry)} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '0.55rem 0.9rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--ink)', fontWeight: 500 }}>✏️ Edit</button>
                      <button onClick={() => { onDelete(entry.id); setMenuOpen(null); }} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '0.55rem 0.9rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--error)', fontWeight: 500 }}>🗑️ Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Content */}
            <div style={{ padding: '0.875rem 1rem' }}>
              {entry.imageData && <img src={entry.imageData} alt="" style={{ width: '100%', borderRadius: '0.75rem', marginBottom: '0.75rem', maxHeight: 200, objectFit: 'cover' }} />}
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{entry.text}</div>
              {entry.songTag && (
                <div style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'linear-gradient(135deg, var(--accent)15, var(--accent2)15)', border: '1px solid var(--line-strong)', borderRadius: '99px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                  🎵 {entry.songTag}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Write/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowForm(false)}>
          <div className="animate-slideUp" style={{ background: 'var(--paper)', borderRadius: '1.25rem 1.25rem 0 0', width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', padding: '1.25rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.1rem' }}>{editingEntry ? 'Edit Entry' : 'New Entry'} 📔</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSubmit} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white', border: 'none', borderRadius: '0.6rem', padding: '0.4rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                  {editingEntry ? 'Update' : 'Save'}
                </button>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }}>✕</button>
              </div>
            </div>

            {/* Mood picker */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '0.4rem' }}>Mood</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {MOODS.map(m => (
                  <button key={m} onClick={() => setForm(f => ({ ...f, mood: m }))} style={{ fontSize: 22, background: form.mood === m ? 'var(--accent)22' : 'var(--line)', border: form.mood === m ? '2px solid var(--accent)' : '2px solid transparent', borderRadius: '0.5rem', padding: '0.2rem 0.35rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Text area with toolbar */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <textarea ref={textRef} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Write your thoughts... OMG THIS SONG IS SO GOOD 😭💗" rows={6}
                style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.75rem', paddingBottom: '2.5rem', color: 'var(--ink)', fontSize: '0.95rem', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
              <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', display: 'flex', gap: '0.35rem' }}>
                <button onClick={() => setShowEmojis(!showEmojis)} style={{ background: 'var(--line)', border: 'none', borderRadius: '0.4rem', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: 16 }}>😊</button>
                <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} ref={fileRef} />
                <button onClick={() => fileRef.current?.click()} style={{ background: 'var(--line)', border: 'none', borderRadius: '0.4rem', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: 16 }}>📸</button>
              </div>
            </div>

            {/* Emoji picker */}
            {showEmojis && (
              <div className="animate-slideDown" style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.5rem', marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxHeight: 150, overflowY: 'auto' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => insertEmoji(e)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: '0.15rem', borderRadius: '0.3rem', transition: 'transform 0.1s' }}
                    onMouseEnter={el => (el.currentTarget.style.transform = 'scale(1.3)')}
                    onMouseLeave={el => (el.currentTarget.style.transform = 'scale(1)')}>
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* Image preview */}
            {form.imageData && (
              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <img src={form.imageData} alt="" style={{ width: '100%', borderRadius: '0.75rem', maxHeight: 180, objectFit: 'cover' }} />
                <button onClick={() => setForm(f => ({ ...f, imageData: '' }))} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white', fontSize: 14 }}>✕</button>
              </div>
            )}

            {/* Song tag */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>🎵 Song Tag</label>
              <input value={form.songTag} onChange={e => setForm(f => ({ ...f, songTag: e.target.value }))} placeholder="e.g. LOVE DIVE - IVE"
                style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {viewEntry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setViewEntry(null)}>
          <div className="animate-pop" style={{ background: 'var(--paper)', borderRadius: '1.25rem', width: '100%', maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>{formatDate(viewEntry.createdAt)}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{formatTime(viewEntry.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: 28 }}>{viewEntry.mood}</span>
                <button onClick={() => setViewEntry(null)} style={{ background: 'var(--line)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: 'var(--muted)', fontSize: 16 }}>✕</button>
              </div>
            </div>
            {viewEntry.imageData && <img src={viewEntry.imageData} alt="" style={{ width: '100%', borderRadius: '0.75rem', marginBottom: '1rem', maxHeight: 240, objectFit: 'cover' }} />}
            <div style={{ fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--ink)' }}>{viewEntry.text}</div>
            {viewEntry.songTag && (
              <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'linear-gradient(135deg, var(--accent)15, var(--accent2)15)', border: '1px solid var(--line-strong)', borderRadius: '99px', padding: '0.3rem 0.8rem', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}>
                🎵 {viewEntry.songTag}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function formatDate(iso: string) { return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function formatTime(iso: string) { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
}
