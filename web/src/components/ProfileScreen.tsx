import { useState, useRef } from 'react';
import type { Post, Profile, Theme, AvatarFrame } from '../types';
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
  onUpdateProfile: (p: Profile) => void;
  onThemeChange: (t: Theme) => void;
  totalSaved: number;
  onSaveEverything: () => void;
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

export function ProfileScreen({ profile, posts, onUpdateProfile, onThemeChange, totalSaved, onSaveEverything }: Props) {
  const [activeSection, setActiveSection] = useState<'posts' | 'themes' | 'edit'>('posts');
  const [form, setForm] = useState<Profile>({ ...profile });
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync form when profile changes externally
  const [lastProfile, setLastProfile] = useState(profile);
  if (profile !== lastProfile) {
    setLastProfile(profile);
    setForm({ ...profile });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, avatarData: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSave() {
    onUpdateProfile(form);
    onThemeChange(form.theme);
    setActiveSection('posts');
  }

  const TABS = [
    { id: 'posts',  label: 'Posts',  icon: '📸' },
    { id: 'themes', label: 'Themes', icon: '🎨' },
    { id: 'edit',   label: 'Edit',   icon: '✏️' },
  ];

  const stats = [
    { label: 'Posts',  value: posts.length },
    { label: 'Liked',  value: posts.filter(p => p.liked).length },
    { label: 'Saved',  value: totalSaved },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--paper)' }}>
      {/* Header banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', padding: '2rem 1rem 3.5rem', position: 'relative', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>My Profile</div>
      </div>

      {/* Avatar — overlaps banner */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -48, marginBottom: '0.5rem', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative' }}>
          <AvatarWithFrame avatarData={profile.avatarData} frame={profile.avatarFrame ?? 'none'} size={96} fallback="💗" />
          {activeSection === 'edit' && (
            <button
              onClick={() => avatarInputRef.current?.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--paper)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
            >📷</button>
          )}
        </div>
        <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.3rem', marginTop: '0.75rem', marginBottom: '0.15rem' }}>
          {profile.username || 'My K-Pop Diary'}
        </div>
        {profile.bio && (
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', maxWidth: 280, textAlign: 'center', lineHeight: 1.5, padding: '0 1rem' }}>
            {profile.bio}
          </div>
        )}
        {profile.favGroup && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '0.2rem 0.65rem', borderRadius: '99px', fontWeight: 600 }}>
            💿 {profile.favGroup}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── BIG SAVE BUTTON ── */}
        <button
          onClick={onSaveEverything}
          style={{
            marginTop: '1rem',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))',
            color: 'white', border: 'none', borderRadius: '99px',
            padding: '0.6rem 1.75rem', fontWeight: 800, fontSize: '0.95rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
            boxShadow: '0 4px 18px rgba(233,30,140,0.35)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          💾 Save Everything
        </button>
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
          Posts, idols, journal & profile
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', margin: '0.75rem 1rem 0' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id as any)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0.6rem', background: 'none', border: 'none', borderBottom: activeSection === tab.id ? '2.5px solid var(--accent)' : '2.5px solid transparent', cursor: 'pointer', color: activeSection === tab.id ? 'var(--accent)' : 'var(--muted)', fontWeight: 600, fontSize: '0.72rem', transition: 'all 0.2s' }}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '1rem' }}>

        {/* ── POSTS TAB ── */}
        {activeSection === 'posts' && (
          <div>
            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: '0.5rem' }}>📸</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700 }}>No posts yet</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Create your first post!</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                {posts.map(post => (
                  <div key={post.id} style={{ aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', background: 'var(--panel)', border: '1px solid var(--line)', position: 'relative' }}>
                    {post.imageData ? (
                      <img src={post.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 15%, transparent), color-mix(in srgb, var(--accent) 5%, transparent))' }}>
                        {post.mood || '💗'}
                      </div>
                    )}
                    {post.liked && <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 12 }}>❤️</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── THEMES TAB ── */}
        {activeSection === 'themes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>🎨 Choose Your Theme</div>
            {THEMES.map(theme => (
              <button key={theme.id} onClick={() => { onThemeChange(theme.id); onUpdateProfile({ ...profile, theme: theme.id }); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', borderRadius: '1rem', border: profile.theme === theme.id ? `2px solid ${theme.colors[0]}` : '2px solid var(--line)', background: profile.theme === theme.id ? `${theme.colors[0]}18` : 'var(--panel)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{theme.icon} {theme.label}</div>
                </div>
                {profile.theme === theme.id && <span style={{ fontSize: 18 }}>✅</span>}
              </button>
            ))}
          </div>
        )}

        {/* ── EDIT TAB ── */}
        {activeSection === 'edit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem' }}>✏️ Edit Profile</div>

            {/* Avatar preview + upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <AvatarWithFrame avatarData={form.avatarData} frame={form.avatarFrame ?? 'none'} size={88} fallback="📸" />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--paper)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                >📷</button>
              </div>
              <button onClick={() => avatarInputRef.current?.click()} style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Change Photo
              </button>
            </div>

            {/* ── AVATAR FRAME PICKER ── */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>🖼️ Profile Frame</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {AVATAR_FRAMES.map(fr => (
                  <button
                    key={fr.id}
                    onClick={() => setForm(f => ({ ...f, avatarFrame: fr.id }))}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                      padding: '0.5rem 0.25rem', borderRadius: '0.75rem',
                      border: form.avatarFrame === fr.id ? '2px solid var(--accent)' : '2px solid var(--line)',
                      background: form.avatarFrame === fr.id ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--panel)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <AvatarWithFrame avatarData={form.avatarData} frame={fr.id} size={40} fallback="💗" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: form.avatarFrame === fr.id ? 'var(--accent)' : 'var(--muted)', textAlign: 'center', lineHeight: 1.2 }}>
                      {fr.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text fields */}
            {[
              { key: 'username',  label: 'Diary Name',     placeholder: 'My K-Pop Diary' },
              { key: 'bio',       label: 'Bio',            placeholder: 'Living my best K-pop life ✨' },
              { key: 'favGroup',  label: 'Fav Group',      placeholder: 'BTS, BLACKPINK…' },
              { key: 'favIdol',   label: 'Fav Idol',       placeholder: 'Your bias 💗' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--ink)' }}>{field.label}</label>
                <input
                  value={(form as any)[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}

            <button
              onClick={handleSave}
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', marginTop: '0.25rem' }}
            >
              💾 Save Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
