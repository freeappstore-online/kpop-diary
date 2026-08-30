import type { Post, JournalEntry, Idol } from '../types';

interface Props {
  posts: Post[];
  journals: JournalEntry[];
  idols: Idol[];
  onPostClick: (post: Post) => void;
}

const FILTERS_CSS: Record<string, string> = {
  none: '', soft: 'brightness(1.1) contrast(0.9) saturate(0.9)',
  pastel: 'brightness(1.15) saturate(0.75)', dreamy: 'brightness(1.1) saturate(0.8)',
  pink: 'sepia(0.2) saturate(1.4) hue-rotate(300deg)', blue: 'sepia(0.1) saturate(1.3) hue-rotate(180deg)',
  purple: 'sepia(0.15) saturate(1.4) hue-rotate(240deg)', vintage: 'sepia(0.5) contrast(0.9)',
  sparkle: 'brightness(1.2) contrast(1.1) saturate(1.3)', dark: 'brightness(0.75) contrast(1.2)',
};

export function DiscoverScreen({ posts, journals, idols, onPostClick }: Props) {
  const savedPosts = posts.filter(p => p.saved);
  const likedPosts = posts.filter(p => p.liked);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'var(--glass)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 56 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🔍 My Collection
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }} className="animate-fadeIn">
          {[
            { label: 'Posts', value: posts.length, icon: '📸' },
            { label: 'Saved', value: savedPosts.length, icon: '🔖' },
            { label: 'Idols', value: idols.length, icon: '⭐' },
            { label: 'Journal', value: journals.length, icon: '📔' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '1rem', padding: '0.875rem 0.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 24, marginBottom: '0.25rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Saved Posts */}
        {savedPosts.length > 0 && (
          <Section title="🔖 Saved Posts">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {savedPosts.map(post => (
                <div key={post.id} onClick={() => onPostClick(post)} style={{ aspectRatio: '1', background: 'var(--line)', borderRadius: '0.75rem', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  {post.imageData ? <img src={post.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: FILTERS_CSS[post.filter] || '' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32 }}>{post.mood}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Liked Posts */}
        {likedPosts.length > 0 && (
          <Section title="❤️ Liked Posts">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {likedPosts.map(post => (
                <div key={post.id} onClick={() => onPostClick(post)} style={{ aspectRatio: '1', background: 'var(--line)', borderRadius: '0.75rem', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  {post.imageData ? <img src={post.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: FILTERS_CSS[post.filter] || '' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32 }}>{post.mood}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* All posts grid */}
        {posts.length > 0 && (
          <Section title="📸 All Memories">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {posts.map(post => (
                <div key={post.id} onClick={() => onPostClick(post)} style={{ aspectRatio: '1', background: 'var(--line)', borderRadius: '0.75rem', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  {post.imageData ? <img src={post.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: FILTERS_CSS[post.filter] || '' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 32 }}>{post.mood}</div>}
                  {post.liked && <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 12 }}>❤️</div>}
                  {post.saved && <div style={{ position: 'absolute', top: 4, left: 4, fontSize: 12 }}>🔖</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Recent Journal */}
        {journals.length > 0 && (
          <Section title="📔 Recent Journal">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {journals.slice(0, 3).map(entry => (
                <div key={entry.id} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.875rem', padding: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{entry.mood}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--ink)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{entry.text}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.25rem' }}>{new Date(entry.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {posts.length === 0 && journals.length === 0 && idols.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--muted)' }} className="animate-fadeIn">
            <div style={{ fontSize: 64, marginBottom: '1rem' }} className="animate-float">🌟</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nothing here yet!</div>
            <div style={{ fontSize: '0.9rem' }}>Start creating posts, adding idols, and writing journal entries to see your collection here ✨</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="animate-fadeIn">
      <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--ink)' }}>{title}</div>
      {children}
    </div>
  );
}
