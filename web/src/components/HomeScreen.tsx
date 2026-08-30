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

export function HomeScreen({ posts, onLike, onSave, onDelete, onEdit, onOpenCreate, onOpenCamera, onOpenProfile, searchQuery, setSearchQuery }: Props) {
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [likeAnim, setLikeAnim] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = posts.filter(p =>
    p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.songTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mood.includes(searchQuery)
  );

  function handleLike(id: string) {
    onLike(id);
    setLikeAnim(id);
    setTimeout(() => setLikeAnim(null), 400);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'var(--glass)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 1rem' }}>
          {showSearch ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: 56 }} className="animate-slideDown">
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }}>←</button>
              <input
                ref={searchRef}
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search posts, songs, moods…"
                style={{ flex: 1, background: 'var(--line)', border: 'none', borderRadius: '0.75rem', padding: '0.5rem 1rem', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🎀 K-Pop Diary
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <HeaderBtn onClick={() => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 50); }} title="Search">🔍</HeaderBtn>
                <HeaderBtn onClick={onOpenCamera} title="Camera">📷</HeaderBtn>
                <HeaderBtn onClick={onOpenProfile} title="Profile">
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                </HeaderBtn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)' }} className="animate-fadeIn">
            <div style={{ fontSize: 64, marginBottom: '1rem' }} className="animate-float">🎀</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your K-Pop World Awaits!</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Start creating your first memory ✨</div>
            <button onClick={onOpenCreate} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 2rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
              + Create First Post
            </button>
          </div>
        )}

        {filtered.map((post, i) => (
          <div key={post.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.05}s`, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            {/* Post header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌸</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>My K-Pop Diary</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{formatDate(post.createdAt)}</div>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted)', padding: '0.25rem 0.5rem' }}>⋯</button>
                {menuOpen === post.id && (
                  <div className="animate-pop" style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, minWidth: 140, overflow: 'hidden' }}>
                    <MenuBtn onClick={() => { onEdit(post); setMenuOpen(null); }}>✏️ Edit Post</MenuBtn>
                    <MenuBtn onClick={() => { onDelete(post.id); setMenuOpen(null); }} danger>🗑️ Delete</MenuBtn>
                  </div>
                )}
              </div>
            </div>

            {/* Image */}
            {post.imageData && (
              <div style={{ position: 'relative', background: '#000' }}>
                <img
                  src={post.imageData}
                  alt=""
                  style={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'cover', filter: FILTERS_CSS[post.filter] || '' }}
                  onDoubleClick={() => handleLike(post.id)}
                />
                {/* Stickers on post */}
                {post.stickers.map(s => (
                  <div key={s.id} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, transform: `rotate(${s.rotation}deg)`, pointerEvents: 'none', userSelect: 'none' }}>{s.emoji}</div>
                ))}
                {likeAnim === post.id && (
                  <div className="animate-heartbeat" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, pointerEvents: 'none' }}>❤️</div>
                )}
                {/* Frame overlay */}
                {post.frame === 'polaroid' && <div style={{ position: 'absolute', inset: 0, border: '12px solid white', borderBottom: '40px solid white', pointerEvents: 'none' }} />}
                {post.frame === 'glitter' && <div style={{ position: 'absolute', inset: 0, border: '8px solid transparent', backgroundImage: 'linear-gradient(var(--panel), var(--panel)), linear-gradient(135deg, gold, hotpink, cyan, gold)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', pointerEvents: 'none', borderRadius: 2 }} />}
              </div>
            )}

            {/* No image placeholder */}
            {!post.imageData && (
              <div style={{ background: 'linear-gradient(135deg, var(--accent)22, var(--accent2)22)', padding: '2rem', textAlign: 'center', fontSize: 48 }}>
                {post.mood || '💗'}
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: '0.5rem 1rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ActionBtn onClick={() => handleLike(post.id)} active={post.liked} activeColor="var(--accent)">
                  {post.liked ? '❤️' : '🤍'} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{post.liked ? 'Liked' : 'Like'}</span>
                </ActionBtn>
                <ActionBtn onClick={() => onSave(post.id)} active={post.saved} activeColor="var(--accent2)">
                  {post.saved ? '🔖' : '🏷️'} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{post.saved ? 'Saved' : 'Save'}</span>
                </ActionBtn>
                <div style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>{post.mood}</div>
              </div>
            </div>

            {/* Caption & tags */}
            <div style={{ padding: '0.5rem 1rem 1rem' }}>
              {post.caption && <div style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.4rem' }}>{post.caption}</div>}
              {post.songTag && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'linear-gradient(135deg, var(--accent)18, var(--accent2)18)', border: '1px solid var(--line-strong)', borderRadius: '99px', padding: '0.2rem 0.7rem', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>
                  🎵 {post.songTag}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeaderBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{ background: 'var(--line)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'transform 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
      {children}
    </button>
  );
}

function MenuBtn({ onClick, danger, children }: { onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '0.6rem 1rem', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: danger ? 'var(--error)' : 'var(--ink)', fontWeight: 500 }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--line)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
      {children}
    </button>
  );
}

function ActionBtn({ onClick, active, activeColor, children }: { onClick: () => void; active: boolean; activeColor: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: active ? `${activeColor}18` : 'none', border: active ? `1px solid ${activeColor}44` : '1px solid transparent', borderRadius: '99px', padding: '0.3rem 0.75rem', cursor: 'pointer', color: active ? activeColor : 'var(--muted)', transition: 'all 0.2s' }}>
      {children}
    </button>
  );
}
