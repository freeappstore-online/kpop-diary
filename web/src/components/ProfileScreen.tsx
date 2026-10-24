import { useState, useRef } from 'react';
import type { Post, Profile, Theme, AvatarFrame, PhotoCard, OwnedItem } from '../types';
import { AvatarWithFrame, AVATAR_FRAMES } from './AvatarWithFrame';

const THEMES: { id: Theme; label: string; icon: string; colors: string[] }[] = [
  { id: 'pink',       label: 'Pastel Pink',  icon: '🌸', colors: ['#e91e8c', '#b44fdb'] },
  { id: 'blue',       label: 'Baby Blue',    icon: '🫧', colors: ['#1a7fe8', '#5b4fdb'] },
  { id: 'lavender',   label: 'Lavender',     icon: '💜', colors: ['#7c3aed', '#a855f7'] },
  { id: 'strawberry', label: 'Strawberry',   icon: '🍓', colors: ['#e81a1a', '#db4f4f'] },
  { id: 'midnight',   label: 'Midnight',     icon: '🌙', colors: ['#c084fc', '#818cf8'] },
  { id: 'glitter',    label: 'Glitter',      icon: '✨', colors: ['#f59e0b', '#ec4899'] },
  { id: 'dark',       label: 'Dark Mode',    icon: '🖤', colors: ['#e91e8c', '#b44fdb'] },
  { id: 'softpastel', label: 'Soft Pastel',  icon: '🌷', colors: ['#f97316', '#ec4899'] },
];

interface Props {
  profile: Profile;
  posts: Post[];
  cards: PhotoCard[];
  ownedItems: OwnedItem[];
  coins: number;
  onUpdateProfile: (p: Profile) => void;
  onThemeChange: (t: Theme) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--panel)',
  border: '1.5px solid var(--line)',
  borderRadius: '0.75rem',
  padding: '0.6rem 0.75rem',
  color: 'var(--ink)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

export function ProfileScreen({ profile, posts, cards, ownedItems, coins, onUpdateProfile, onThemeChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(profile);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => { onUpdateProfile(draft); onThemeChange(draft.theme); setEditing(false); };
  const cancel = () => { setDraft(profile); setEditing(false); };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setDraft(d => ({ ...d, avatarData: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const likedPosts = posts.filter(p => p.liked).length;
  const savedPosts = posts.filter(p => p.saved).length;
  const legendaryCards = cards.filter(c => c.rarity === 'legendary').length;

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--paper)' }}>

      {/* Banner */}
      <div style={{ height: 100, background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', position: 'relative', flexShrink: 0 }} />

      {/* Avatar + name */}
      <div style={{ padding: '0 1rem', position: 'relative', marginTop: -48 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ position: 'relative', cursor: editing ? 'pointer' : 'default' }} onClick={() => editing && fileRef.current?.click()}>
            <AvatarWithFrame
              imageData={editing ? draft.avatarData : profile.avatarData}
              frame={editing ? draft.avatarFrame : profile.avatarFrame}
              size={88}
            />
            {editing && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📸</div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          {!editing ? (
            <button onClick={() => { setDraft(profile); setEditing(true); }} style={{ background: 'var(--panel)', border: '1.5px solid var(--line)', borderRadius: '0.75rem', padding: '0.45rem 1rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--ink)' }}>✏️ Edit</button>
          ) : (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={cancel} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.45rem 0.85rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', color: 'var(--muted)' }}>Cancel</button>
              <button onClick={save} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.45rem 0.85rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>Save</button>
            </div>
          )}
        </div>

        {!editing ? (
          <>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--ink)' }}>{profile.username || 'My K-Pop Diary'}</div>
            {profile.bio && <div style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>{profile.bio}</div>}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {profile.favGroup && <span style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', borderRadius: '99px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}>💜 {profile.favGroup}</span>}
              {profile.favIdol && <span style={{ background: 'color-mix(in srgb, var(--accent2, #b44fdb) 12%, transparent)', color: 'var(--accent2, #b44fdb)', borderRadius: '99px', padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}>⭐ {profile.favIdol}</span>}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input placeholder="Username" value={draft.username} onChange={e => setDraft(d => ({ ...d, username: e.target.value }))} style={inputStyle} />
            <textarea placeholder="Bio" value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'none', fontFamily: 'Manrope, sans-serif' }} />
            <input placeholder="Fav Group" value={draft.favGroup} onChange={e => setDraft(d => ({ ...d, favGroup: e.target.value }))} style={inputStyle} />
            <input placeholder="Fav Idol" value={draft.favIdol} onChange={e => setDraft(d => ({ ...d, favIdol: e.target.value }))} style={inputStyle} />
          </div>
        )}
      </div>

      <div style={{ padding: '1rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { label: 'Posts', value: posts.length, emoji: '📸' },
            { label: 'Cards', value: cards.length, emoji: '🃏' },
            { label: '🪙 Coins', value: coins, emoji: '' },
            { label: 'Items', value: ownedItems.length, emoji: '🎁' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.85rem', padding: '0.65rem 0.4rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600, marginTop: '0.1rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>🏆 Achievements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { emoji: '📸', label: 'First Post', unlocked: posts.length >= 1 },
              { emoji: '💗', label: 'Liker (5 likes)', unlocked: likedPosts >= 5 },
              { emoji: '🔖', label: 'Saver (3 saved)', unlocked: savedPosts >= 3 },
              { emoji: '🃏', label: 'Card Collector (10 cards)', unlocked: cards.length >= 10 },
              { emoji: '🏆', label: 'Legendary! (1 legendary card)', unlocked: legendaryCards >= 1 },
              { emoji: '🛍️', label: 'Shopper (3 items)', unlocked: ownedItems.length >= 3 },
              { emoji: '📖', label: 'Diary Keeper (5 posts)', unlocked: posts.length >= 5 },
              { emoji: '💎', label: 'Super Fan (20 posts)', unlocked: posts.length >= 20 },
            ].map(a => (
              <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: a.unlocked ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--panel)', border: `1px solid ${a.unlocked ? 'var(--accent)' : 'var(--line)'}`, borderRadius: '0.75rem', padding: '0.55rem 0.75rem', opacity: a.unlocked ? 1 : 0.5 }}>
                <span style={{ fontSize: 20 }}>{a.emoji}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: a.unlocked ? 'var(--ink)' : 'var(--muted)' }}>{a.label}</span>
                {a.unlocked && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800 }}>✓ Unlocked</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Theme picker */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>🎨 Theme</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => { onThemeChange(t.id); onUpdateProfile({ ...profile, theme: t.id }); }}
                style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`, borderRadius: '0.75rem', border: profile.theme === t.id ? '3px solid var(--ink)' : '2px solid transparent', padding: '0.6rem 0.3rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Avatar frame picker */}
        {editing && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>🖼️ Avatar Frame</div>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {AVATAR_FRAMES.map(f => (
                <button key={f.id} onClick={() => setDraft(d => ({ ...d, avatarFrame: f.id as AvatarFrame }))} style={{ flexShrink: 0, background: draft.avatarFrame === f.id ? 'var(--accent)' : 'var(--panel)', border: `1.5px solid ${draft.avatarFrame === f.id ? 'var(--accent)' : 'var(--line)'}`, borderRadius: '0.65rem', padding: '0.4rem 0.65rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: draft.avatarFrame === f.id ? 'white' : 'var(--muted)' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent posts grid */}
        {posts.length > 0 && (
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>📸 Recent Posts</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {posts.slice(0, 9).map(post => (
                <div key={post.id} style={{ aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', background: 'var(--panel)', border: '1px solid var(--line)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {post.imageData ? (
                    <img src={post.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 28 }}>{post.mood || '💗'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
