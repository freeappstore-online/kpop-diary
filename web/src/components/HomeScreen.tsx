import { useState, useRef } from 'react';
import type { Post } from '../types';

const MOODS = ['😍','💗','✨','🥺','😭','🎵','💜','🔥','🌸','😊','💫','🎶'];
const FILTERS_CSS: Record<string, string> = {
  none: '',
  soft: 'brightness(1.1) contrast(0.9) saturate(0.9)',
  pastel: 'brightness(1.15) saturate(0.75) contrast(0.85)',
  dreamy: 'brightness(1.1) blur(0.5px) saturate(0.8)',
  pink: 'sepia(0.2) saturate(1.4) hue-rotate(300deg) brightness(1.05)',
  blue: 'sepia(0.1) saturate(1.3) hue-rotate(180deg) brightness(1.05)',
  purple: 'sepia(0.15) saturate(1.4) hue-rotate(240deg) brightness(1.05)',
  vintage: 'sepia(0.5) contrast(0.9) brightness(0.95) saturate(0.8)',
  sparkle: 'brightness(1.2) contrast(1.1) saturate(1.3)',
  dark: 'brightness(0.75) contrast(1.2) saturate(1.1)',
};

interface Props {
  posts: Post[];
  diaryName: string;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (post: Post) => void;
  onOpenCreate: () => void;
  onOpenCamera: () => void;
  onOpenProfile: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

function HeaderBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: '0.25rem', borderRadius: '0.5rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </button>
  );
}

export function HomeScreen({ posts, diaryName, onLike, onSave, onDelete, onEdit, onOpenCreate, onOpenCamera, onOpenProfile, searchQuery, setSearchQuery }: Props) {
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [likeAnim, setLikeAnim] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const displayName = diaryName || '🎀 My Diary';

  const filtered = posts.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.caption || '').toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q)) || (p.idol || '').toLowerCase().includes(q);
  });

  function handleLike(id: string) {
    setLikeAnim(id);
    onLike(id);
    setTimeout(() => setLikeAnim(null), 600);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', gap: '0.5rem', borderBottom: '1px solid var(--line)', background: 'var(--paper)', flexShrink: 0 }}>
        {showSearch ? (
          <>
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }}>←</button>
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search posts, tags, idols…"
              autoFocus
              style={{ flex: 1, border: '1.5px solid var(--line)', borderRadius: '0.75rem', padding: '0.4rem 0.75rem', fontSize: '0.9rem', background: 'var(--panel)', color: 'var(--ink)', outline: 'none' }}
            />
          </>
        ) : (
          <>
            <div style={{ flex: 1, fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent)', letterSpacing: '-0.01em' }}>
              🎀 {displayName}
            </div>
            <HeaderBtn onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50); }} title="Search">🔍</HeaderBtn>
            <HeaderBtn onClick={onOpenCamera} title="Camera">📷</HeaderBtn>
            <HeaderBtn onClick={onOpenProfile} title="Profile">👤</HeaderBtn>
          </>
        )}
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: '0.75rem' }}>💗</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {searchQuery ? 'No posts found' : 'Start your diary!'}
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              {searchQuery ? 'Try a different search' : 'Tap ✏️ to create your first post'}
            </div>
          </div>
        )}

        {filtered.map((post, i) => (
          <div key={post.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.05}s`, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            {/* Post header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', gap: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {post.mood || '💗'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{displayName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              {post.idol && <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, background: 'color-mix(in srgb, var(--accent) 12%, transparent)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>⭐ {post.idol}</div>}
              {/* Menu */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted)', padding: '0.25rem' }}>⋯</button>
                {menuOpen === post.id && (
                  <div className="animate-pop" style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, minWidth: 140, overflow: 'hidden' }}>
                    <button onClick={() => { onEdit(post); setMenuOpen(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--ink)' }}>✏️ Edit</button>
                    <button onClick={() => { onDelete(post.id); setMenuOpen(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#e53e3e' }}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            </div>

            {/* Image */}
            {post.imageData && (
              <div style={{ position: 'relative', background: '#0a0a0a' }}>
                <img
                  src={post.imageData}
                  alt=""
                  style={{ width: '100%', display: 'block', objectFit: 'contain', filter: FILTERS_CSS[post.filter] || '' }}
                />
                {/* Stickers */}
                {(post.stickers || []).map(s => (
                  <div key={s.id} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, transform: `rotate(${s.rotation}deg)`, pointerEvents: 'none', userSelect: 'none' }}>{s.emoji}</div>
                ))}
                {/* Like animation */}
                {likeAnim === post.id && (
                  <div className="animate-heartbeat" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, pointerEvents: 'none' }}>❤️</div>
                )}
                {/* Frames */}
                {post.frame === 'polaroid' && <div style={{ position: 'absolute', inset: 0, border: '12px solid white', borderBottom: '40px solid white', pointerEvents: 'none' }} />}
                {post.frame === 'glitter' && <div style={{ position: 'absolute', inset: 0, border: '8px solid transparent', backgroundImage: 'linear-gradient(var(--panel), var(--panel)), linear-gradient(135deg, gold, hotpink, cyan, gold)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', pointerEvents: 'none', borderRadius: 2 }} />}
              </div>
            )}

            {/* No image — mood card */}
            {!post.imageData && (
              <div style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 15%, transparent), color-mix(in srgb, var(--accent) 5%, transparent))', padding: '2rem', textAlign: 'center', fontSize: 48 }}>
                {post.mood || '💗'}
              </div>
            )}

            {/* Caption */}
            {post.caption && (
              <div style={{ padding: '0.75rem 1rem 0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {post.mood && <span style={{ marginRight: '0.35rem' }}>{post.mood}</span>}
                {post.caption}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ padding: '0 1rem 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {post.tags.map(t => (
                  <span key={t} style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>#{t}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0.75rem', gap: '0.25rem', borderTop: '1px solid var(--line)' }}>
              <button
                onClick={() => handleLike(post.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: post.liked ? '#e53e3e' : 'var(--muted)', fontWeight: post.liked ? 700 : 400, padding: '0.4rem 0.6rem', borderRadius: '0.5rem', transition: 'all 0.15s' }}
              >
                {post.liked ? '❤️' : '🤍'} {post.likes || 0}
              </button>
              <button
                onClick={() => onSave(post.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: post.saved ? 'var(--accent)' : 'var(--muted)', fontWeight: post.saved ? 700 : 400, padding: '0.4rem 0.6rem', borderRadius: '0.5rem', transition: 'all 0.15s' }}
              >
                {post.saved ? '🔖' : '📌'} {post.saved ? 'Saved' : 'Save'}
              </button>
              <div style={{ flex: 1 }} />
              {post.frame && post.frame !== 'none' && (
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--paper)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>
                  {post.frame === 'polaroid' ? '🖼️' : post.frame === 'film' ? '🎞️' : post.frame === 'diary' ? '📔' : post.frame === 'glitter' ? '✨' : post.frame === 'kpop' ? '💿' : ''} {post.frame}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={onOpenCreate}
        style={{ position: 'fixed', bottom: '5rem', right: '1.25rem', width: 52, height: 52, borderRadius: '50%', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 22, boxShadow: '0 4px 20px color-mix(in srgb, var(--accent) 40%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
      >
        ✏️
      </button>
    </div>
  );
}
