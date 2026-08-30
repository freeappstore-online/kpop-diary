import { useState } from 'react';
import type { Post } from '../types';

interface Props {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

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

type SortMode = 'newest' | 'liked' | 'saved';

export function DiscoverScreen({ posts, onPostClick }: Props) {
  const [sort, setSort] = useState<SortMode>('newest');
  const [selected, setSelected] = useState<Post | null>(null);

  const sorted = [...posts].sort((a, b) => {
    if (sort === 'liked') return (b.liked ? 1 : 0) - (a.liked ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'saved') return (b.saved ? 1 : 0) - (a.saved ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--paper)' }}>

      {/* Header */}
      <div style={{ padding: '0.75rem 1rem 0.5rem', borderBottom: '1px solid var(--line)', flexShrink: 0, background: 'var(--paper)' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          🔍 All Posts
        </div>

        {/* Sort tabs */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {([['newest', '🕐 Recent'], ['liked', '❤️ Liked'], ['saved', '🔖 Saved']] as [SortMode, string][]).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSort(mode)}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: '99px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.75rem',
                background: sort === mode ? 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))' : 'var(--panel)',
                color: sort === mode ? 'white' : 'var(--muted)',
                transition: 'all 0.2s',
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: 56, marginBottom: '0.75rem' }}>📸</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.3rem' }}>No posts yet</div>
            <div style={{ fontSize: '0.85rem' }}>Create your first post from the home page!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            {sorted.map(post => (
              <button
                key={post.id}
                onClick={() => setSelected(post)}
                style={{
                  position: 'relative', background: 'var(--panel)', border: '1px solid var(--line)',
                  borderRadius: '0.75rem', overflow: 'hidden', cursor: 'pointer', padding: 0,
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
              >
                {post.imageData ? (
                  <img
                    src={post.imageData}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: FILTERS_CSS[post.filter] || '', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 15%, transparent), color-mix(in srgb, var(--accent2, #b44fdb) 8%, transparent))' }}>
                    {post.mood || '💗'}
                  </div>
                )}
                {/* Badges */}
                <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'flex-end' }}>
                  {post.liked && <span style={{ fontSize: 11 }}>❤️</span>}
                  {post.saved && <span style={{ fontSize: 11 }}>🔖</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Post detail overlay ── */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--paper)', borderRadius: '1.25rem', overflow: 'hidden', width: '100%', maxWidth: 420, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
          >
            {/* Detail header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: 20 }}>{selected.mood || '💗'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  {selected.songTag && <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>🎵 {selected.songTag}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => { onPostClick(selected); setSelected(null); }}
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', color: 'white', border: 'none', borderRadius: '99px', padding: '0.35rem 0.85rem', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                >✏️ Edit</button>
                <button onClick={() => setSelected(null)} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '99px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)' }}>✕</button>
              </div>
            </div>

            {/* Full image */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {selected.imageData && (
                <div style={{ background: '#0a0a0a' }}>
                  <img
                    src={selected.imageData}
                    alt=""
                    style={{ width: '100%', display: 'block', objectFit: 'contain', filter: FILTERS_CSS[selected.filter] || '' }}
                  />
                </div>
              )}
              {selected.caption && (
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--ink)', wordBreak: 'break-word' }}>
                  {selected.caption}
                </div>
              )}
              {/* Badges row */}
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1rem 1rem', flexWrap: 'wrap' }}>
                {selected.liked && <span style={{ background: 'color-mix(in srgb, #e91e8c 12%, transparent)', color: '#e91e8c', borderRadius: '99px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>❤️ Liked</span>}
                {selected.saved && <span style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', borderRadius: '99px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>🔖 Saved</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
