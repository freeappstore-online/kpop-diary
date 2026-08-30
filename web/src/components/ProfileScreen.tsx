import { useState, useRef } from 'react';
import type { Post, Profile, Theme } from '../types';

const THEMES: { id: Theme; label: string; icon: string; colors: string[] }[] = [
  { id: 'pink', label: 'Pastel Pink', icon: '🌸', colors: ['#e91e8c', '#b44fdb'] },
  { id: 'blue', label: 'Baby Blue', icon: '🫧', colors: ['#1a7fe8', '#5b4fdb'] },
  { id: 'lavender', label: 'Lavender', icon: '💜', colors: ['#7c3aed', '#a855f7'] },
  { id: 'strawberry', label: 'Strawberry', icon: '🍓', colors: ['#e81a1a', '#db4f4f'] },
  { id: 'midnight', label: 'Midnight', icon: '🌙', colors: ['#c084fc', '#818cf8'] },
  { id: 'glitter', label: 'Glitter', icon: '✨', colors: ['#f59e0b', '#ec4899'] },
  { id: 'dark', label: 'Dark Mode', icon: '🖤', colors: ['#e91e8c', '#b44fdb'] },
  { id: 'softpastel', label: 'Soft Pastel', icon: '🌷', colors: ['#f97316', '#ec4899'] },
];

const FILTERS_CSS: Record<string, string> = {
  none: '', soft: 'brightness(1.1) contrast(0.9) saturate(0.9)',
  pastel: 'brightness(1.15) saturate(0.75)', dreamy: 'brightness(1.1) saturate(0.8)',
  pink: 'sepia(0.2) saturate(1.4) hue-rotate(300deg)', blue: 'sepia(0.1) saturate(1.3) hue-rotate(180deg)',
  purple: 'sepia(0.15) saturate(1.4) hue-rotate(240deg)', vintage: 'sepia(0.5) contrast(0.9)',
  sparkle: 'brightness(1.2) contrast(1.1) saturate(1.3)', dark: 'brightness(0.75) contrast(1.2)',
};

interface Props {
  profile: Profile;
  posts: Post[];
  onUpdateProfile: (p: Profile) => void;
  onThemeChange: (t: Theme) => void;
  totalSaved: number;
}

export function ProfileScreen({ profile, posts, onUpdateProfile, onThemeChange, totalSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [activeSection, setActiveSection] = useState<'posts' | 'themes' | 'edit'>('posts');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, avatarData: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function handleSave() {
    onUpdateProfile(form);
    onThemeChange(form.theme);
    setEditing(false);
  }

  const currentTheme = THEMES.find(t => t.id === profile.theme) || THEMES[0];

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100%' }}>
      {/* Profile hero */}
      <div style={{ background: `linear-gradient(160deg, ${currentTheme.colors[0]}33, ${currentTheme.colors[1]}33)`, borderBottom: '1px solid var(--line)', padding: '1.5rem 1rem 0' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1rem', color: 'var(--muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>
            MY K-POP WORLD 💗
          </div>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.colors[0]}, ${currentTheme.colors[1]})`, padding: 3, boxShadow: `0 0 0 4px ${currentTheme.colors[0]}33` }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'var(--panel)' }}>
                  {profile.avatarData ? (
                    <img src={profile.avatarData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 36 }}>🌸</div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.25rem' }}>{profile.username || 'My K-Pop Diary'}</div>
              {profile.bio && <div style={{ fontSize: '0.85rem', color: 'var(--muted)', maxWidth: 280, margin: '0 auto', lineHeight: 1.5 }}>{profile.bio}</div>}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {profile.favGroup && <Tag icon="🎤" text={profile.favGroup} />}
                {profile.favIdol && <Tag icon="⭐" text={profile.favIdol} />}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', borderTop: '1px solid var(--line)', paddingTop: '0.875rem', paddingBottom: '0.875rem', gap: '0' }}>
            {[
              { label: 'Posts', value: posts.length },
              { label: 'Liked', value: posts.filter(p => p.liked).length },
              { label: 'Saved', value: totalSaved },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.3rem', background: `linear-gradient(135deg, ${currentTheme.colors[0]}, ${currentTheme.colors[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--line)' }}>
            {[
              { id: 'posts', icon: '⊞', label: 'Posts' },
              { id: 'themes', icon: '🎨', label: 'Themes' },
              { id: 'edit', icon: '✏️', label: 'Edit Profile' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveSection(tab.id as any)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0.6rem', background: 'none', border: 'none', borderBottom: activeSection === tab.id ? `2px solid var(--accent)` : '2px solid transparent', cursor: 'pointer', color: activeSection === tab.id ? 'var(--accent)' : 'var(--muted)', fontWeight: 600, fontSize: '0.72rem', transition: 'all 0.2s' }}>
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '1rem' }}>
        {/* Posts grid */}
        {activeSection === 'posts' && (
          <div className="animate-fadeIn">
            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: '0.75rem' }}>📸</div>
                <div style={{ fontSize: '0.9rem' }}>No posts yet. Create your first memory!</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {posts.map(post => (
                  <div key={post.id} style={{ aspectRatio: '1', background: 'var(--line)', borderRadius: '0.75rem', overflow: 'hidden', position: 'relative', transition: 'transform 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    {post.imageData ? <img src={post.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: FILTERS_CSS[post.filter] || '' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 28 }}>{post.mood}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Themes */}
        {activeSection === 'themes' && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Choose Your Theme 🎨</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {THEMES.map(theme => (
                <button key={theme.id} onClick={() => { onThemeChange(theme.id); onUpdateProfile({ ...profile, theme: theme.id }); }} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', borderRadius: '1rem', border: profile.theme === theme.id ? `2px solid ${theme.colors[0]}` : '2px solid var(--line)', background: profile.theme === theme.id ? `${theme.colors[0]}18` : 'var(--panel)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{theme.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: profile.theme === theme.id ? theme.colors[0] : 'var(--ink)' }}>{theme.label}</div>
                    {profile.theme === theme.id && <div style={{ fontSize: '0.68rem', color: theme.colors[0], fontWeight: 600 }}>✓ Active</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Edit Profile */}
        {activeSection === 'edit' && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Edit Profile ✏️</div>
            {/* Avatar */}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div onClick={() => fileRef.current?.click()} style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--line)', overflow: 'hidden', cursor: 'pointer', border: '2px dashed var(--line-strong)', flexShrink: 0 }}>
                {form.avatarData ? <img src={form.avatarData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 24 }}>📸</div>}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Profile Photo</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Tap to change</div>
              </div>
            </div>
            {[
              { key: 'username', label: 'Username', placeholder: 'My K-Pop Diary' },
              { key: 'bio', label: 'Bio', placeholder: 'K-pop lover ✨' },
              { key: 'favGroup', label: '🎤 Favourite Group', placeholder: 'e.g. BTS' },
              { key: 'favIdol', label: '⭐ Favourite Idol', placeholder: 'e.g. Jimin' },
              { key: 'favColour', label: '🎨 Favourite Colour', placeholder: 'e.g. Pink' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '0.3rem' }}>{field.label}</label>
                <input value={form[field.key as keyof Profile] as string || ''} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} placeholder={field.placeholder}
                  style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <button onClick={() => { onUpdateProfile(form); onThemeChange(form.theme); setActiveSection('posts'); }} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              ✓ Save Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--glass)', border: '1px solid var(--line)', borderRadius: '99px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>
      {icon} {text}
    </div>
  );
}
