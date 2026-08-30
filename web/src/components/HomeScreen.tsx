import { useState, useRef } from 'react';
import type { Post } from '../types';

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
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = diaryName || '🎀 My Diary';

  const filtered = posts.filter(post => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.caption?.toLowerCase().includes(q) ||
      post.mood?.toLowerCase().includes(q) ||
      post.songTag?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '0.75rem 1rem 0.5rem', borderBottom: '1px solid var(--line)', flexShrink: 0, background: 'var(--paper)' }}>
        {showSearch ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 20 }}>←</button>
            <input
              autoFocus
              type="text"
              placeholder="Search posts…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'var(--panel)', border: '1.5px solid var(--line)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {displayName}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <HeaderBtn onClick={() => setShowSearch(true)} title="Search">🔍</HeaderBtn>
              <HeaderBtn onClick={onOpenCamera} title="Camera">📷</HeaderBtn>
              <HeaderBtn onClick={onOpenCreate} title="Create post">✏️</HeaderBtn>
            </div>
          </div>
        )}
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.75rem 1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: 56, marginBottom: '0.75rem' }}>🌸</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.35rem', color: 'var(--ink)' }}>
              {searchQuery ? 'No posts found' : 'Start your diary!'}
            </div>
            <div style={{ fontSize: '0.88rem' }}>
              {searchQuery ? 'Try a different search' : 'Tap ✏️ to create your first post'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filtered.map((post, i) => (
              <div key={post.id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.05}s`, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

                {/* Post header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem 0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 700, flexShrink: 0 }}>
                      {post.mood || '💗'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{displayName}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                        {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  <div style={{ position: 'relative' }} ref={menuRef}>
                    <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === post.id ? null : post.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted)', padding: '0.2rem 0.4rem', borderRadius: '0.5rem' }}>⋯</button>
                    {menuOpen === post.id && (
                      <div className="animate-pop" style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, minWidth: 140, overflow: 'hidden' }}>
                        {[
                          { label: '✏️ Edit', action: () => { onEdit(post); setMenuOpen(null); } },
                          { label: '🗑️ Delete', action: () => { onDelete(post.id); setMenuOpen(null); } },
                        ].map(item => (
                          <button key={item.label} onClick={item.action} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.65rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--ink)', fontWeight: 600 }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--line)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >{item.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── IMAGE: no container height, image sizes itself naturally ── */}
                {post.imageData && (
                  <img
                    src={post.imageData}
                    alt=""
                    style={{
                      display: 'block',
                      width: '100%',
                      height: 'auto',       /* natural height — never crops */
                      filter: FILTERS_CSS[post.filter] || '',
                    }}
                  />
                )}

                {/* No-image mood card */}
                {!post.imageData && (
                  <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), color-mix(in srgb, var(--accent2, #b44fdb) 8%, transparent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                    {post.mood || '💗'}
                  </div>
                )}

                {/* Caption + song tag + actions */}
                <div style={{ padding: '0.5rem 0.75rem 0.6rem' }}>
                  {post.songTag && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.2rem' }}>🎵 {post.songTag}</div>
                  )}
                  {post.caption && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--ink)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {post.caption}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button onClick={() => onLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', gap: '0.2rem', color: post.liked ? '#e91e8c' : 'var(--muted)', transition: 'transform 0.15s', padding: 0 }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >{post.liked ? '❤️' : '🤍'}</button>
                    <button onClick={() => onSave(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', gap: '0.2rem', color: post.saved ? 'var(--accent)' : 'var(--muted)', transition: 'transform 0.15s', padding: 0 }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >{post.saved ? '🔖' : '🏷️'}</button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
