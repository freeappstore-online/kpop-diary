import { useState, useEffect, useCallback } from 'react';
import type { Post, Idol, JournalEntry, Profile, Theme, StickerOnCanvas } from './types';
import { HomeScreen } from './components/HomeScreen';
import { PostCreator } from './components/PostCreator';
import { CameraScreen } from './components/CameraScreen';
import { IdolsScreen } from './components/IdolsScreen';
import { JournalScreen } from './components/JournalScreen';
import { DiscoverScreen } from './components/DiscoverScreen';
import { ProfileScreen } from './components/ProfileScreen';

type Tab = 'home' | 'discover' | 'create' | 'idols' | 'me';
type Modal = 'none' | 'create' | 'camera' | 'journal';

const DEFAULT_PROFILE: Profile = {
  username: 'My K-Pop Diary',
  bio: 'Living my best K-pop life ✨💗',
  favGroup: '',
  favIdol: '',
  favColour: 'Pink',
  avatarFrame: 'none',
  theme: 'pink',
  accentColour: '#e91e8c',
};

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// Sparkle component
function Sparkle({ style }: { style: React.CSSProperties }) {
  return <div style={{ position: 'fixed', pointerEvents: 'none', zIndex: 9999, fontSize: 16, ...style }} className="animate-sparkle">✨</div>;
}

// Toast component
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))',
      color: 'white', padding: '0.65rem 1.25rem', borderRadius: '99px',
      fontWeight: 700, fontSize: '0.9rem', zIndex: 9998,
      opacity: visible ? 1 : 0, transition: 'all 0.3s ease',
      pointerEvents: 'none', whiteSpace: 'nowrap',
      boxShadow: '0 4px 20px rgba(233,30,140,0.4)',
    }}>
      {message}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [modal, setModal] = useState<Modal>('none');
  const [posts, setPosts] = useState<Post[]>(() => load('kpd_posts', []));
  const [idols, setIdols] = useState<Idol[]>(() => load('kpd_idols', []));
  const [journals, setJournals] = useState<JournalEntry[]>(() => load('kpd_journals', []));
  const [profile, setProfile] = useState<Profile>(() => {
    const p = load('kpd_profile', DEFAULT_PROFILE);
    return { ...DEFAULT_PROFILE, ...p }; // merge so avatarFrame always exists
  });
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [cameraImage, setCameraImage] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sparkles, setSparkles] = useState<{ id: string; x: number; y: number }[]>([]);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // ── Auto-save on every change ──
  useEffect(() => { save('kpd_posts', posts); }, [posts]);
  useEffect(() => { save('kpd_idols', idols); }, [idols]);
  useEffect(() => { save('kpd_journals', journals); }, [journals]);
  useEffect(() => { save('kpd_profile', profile); }, [profile]);

  // ── Manual save everything ──
  function saveEverything() {
    save('kpd_posts', posts);
    save('kpd_idols', idols);
    save('kpd_journals', journals);
    save('kpd_profile', profile);
    showToast('💾 Everything saved!');
  }

  function showToast(message: string) {
    setToast({ message, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  }

  // ── Apply theme ──
  useEffect(() => {
    const THEME_MAP: Record<string, { accent: string; accent2: string; accent3: string }> = {
      pink:       { accent: '#e91e8c', accent2: '#b44fdb', accent3: '#ff6eb4' },
      blue:       { accent: '#1a7fe8', accent2: '#5b4fdb', accent3: '#60a5fa' },
      lavender:   { accent: '#7c3aed', accent2: '#a855f7', accent3: '#c084fc' },
      strawberry: { accent: '#e81a1a', accent2: '#db4f4f', accent3: '#f87171' },
      midnight:   { accent: '#c084fc', accent2: '#818cf8', accent3: '#38bdf8' },
      glitter:    { accent: '#f59e0b', accent2: '#ec4899', accent3: '#fde68a' },
      dark:       { accent: '#e91e8c', accent2: '#b44fdb', accent3: '#ff6eb4' },
      softpastel: { accent: '#f97316', accent2: '#ec4899', accent3: '#fda4af' },
    };
    const colors = THEME_MAP[profile.theme] ?? THEME_MAP.pink;
    const root = document.documentElement;
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent2', colors.accent2);
    root.style.setProperty('--accent3', colors.accent3);
    if (profile.theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [profile.theme]);

  // ── Sparkle on click ──
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const id = uid();
      setSparkles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setSparkles(prev => prev.filter(s => s.id !== id)), 1500);
    }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  // ── Handlers ──
  function handleSavePost(data: Omit<Post, 'id' | 'createdAt' | 'liked' | 'saved'>) {
    if (editPost) {
      setPosts(prev => prev.map(p => p.id === editPost.id ? { ...editPost, ...data } : p));
    } else {
      const newPost: Post = { ...data, id: uid(), createdAt: new Date().toISOString(), liked: false, saved: false };
      setPosts(prev => [newPost, ...prev]);
    }
    setModal('none');
    setEditPost(null);
    setCameraImage(undefined);
    setTab('home');
    showToast('✨ Post saved!');
  }

  function handleLike(id: string) { setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p)); }
  function handleSaveToggle(id: string) { setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p)); }
  function handleDeletePost(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id));
    showToast('🗑️ Post deleted');
  }
  function handleEditPost(post: Post) { setEditPost(post); setModal('create'); }
  function handleCameraCapture(imageData: string) { setCameraImage(imageData); setModal('create'); }

  function handleAddIdol(data: Omit<Idol, 'id' | 'createdAt'>) {
    setIdols(prev => [{ ...data, id: uid(), createdAt: new Date().toISOString() }, ...prev]);
    showToast('💗 Idol added!');
  }
  function handleEditIdol(idol: Idol) { setIdols(prev => prev.map(i => i.id === idol.id ? idol : i)); }
  function handleDeleteIdol(id: string) {
    setIdols(prev => prev.filter(i => i.id !== id));
    showToast('🗑️ Idol removed');
  }

  function handleAddJournal(data: Omit<JournalEntry, 'id' | 'createdAt'>) {
    setJournals(prev => [{ ...data, id: uid(), createdAt: new Date().toISOString() }, ...prev]);
    showToast('📓 Journal saved!');
  }
  function handleEditJournal(entry: JournalEntry) { setJournals(prev => prev.map(j => j.id === entry.id ? entry : j)); }
  function handleDeleteJournal(id: string) {
    setJournals(prev => prev.filter(j => j.id !== id));
    showToast('🗑️ Entry deleted');
  }

  function handleUpdateProfile(p: Profile) {
    setProfile(p);
    showToast('💾 Profile saved!');
  }
  function handleThemeChange(t: Theme) { setProfile(prev => ({ ...prev, theme: t })); }

  const NAV_ITEMS_LEFT  = [
    { id: 'home',     icon: '🏠', label: 'Home' },
    { id: 'discover', icon: '🔍', label: 'Discover' },
  ];
  const NAV_ITEMS_RIGHT = [
    { id: 'idols',    icon: '💿', label: 'Idols' },
    { id: 'me',       icon: '👤', label: 'Me' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'Manrope, sans-serif', overflow: 'hidden' }}>

      {/* Sparkles */}
      {sparkles.map(s => <Sparkle key={s.id} style={{ left: s.x - 8, top: s.y - 8 }} />)}

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />

      {/* ── SAVE EVERYTHING BUTTON (top-right, always visible) ── */}
      <button
        onClick={saveEverything}
        title="Save everything"
        style={{
          position: 'fixed', top: 12, right: 12, zIndex: 500,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))',
          color: 'white', border: 'none', borderRadius: '99px',
          padding: '0.4rem 0.85rem', fontWeight: 700, fontSize: '0.78rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
          boxShadow: '0 2px 12px rgba(233,30,140,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        💾 Save
      </button>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'home' && (
          <HomeScreen
            posts={posts}
            diaryName={profile.username}
            onLike={handleLike}
            onSave={handleSaveToggle}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            onOpenCreate={() => setModal('create')}
            onOpenCamera={() => setModal('camera')}
            onOpenProfile={() => setTab('me')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {tab === 'discover' && (
          <DiscoverScreen posts={posts} onPostClick={post => { handleEditPost(post); }} />
        )}
        {tab === 'idols' && (
          <IdolsScreen
            idols={idols}
            onAdd={handleAddIdol}
            onEdit={handleEditIdol}
            onDelete={handleDeleteIdol}
          />
        )}
        {tab === 'me' && (
          <ProfileScreen
            profile={profile}
            posts={posts}
            onUpdateProfile={handleUpdateProfile}
            onThemeChange={handleThemeChange}
            totalSaved={posts.filter(p => p.saved).length}
            onSaveEverything={saveEverything}
          />
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', borderTop: '1px solid var(--line)', background: 'var(--paper)', padding: '0.25rem 0 0.5rem', flexShrink: 0, position: 'relative', zIndex: 100 }}>
        {NAV_ITEMS_LEFT.map(item => (
          <NavBtn key={item.id} active={tab === item.id} onClick={() => { setTab(item.id as Tab); setModal('none'); }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavBtn>
        ))}

        {/* Centre create button */}
        <button onClick={() => setModal('create')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(233,30,140,0.4)', transition: 'transform 0.15s, box-shadow 0.15s', color: 'white', fontSize: 24, marginTop: -12 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >✏️</button>

        {NAV_ITEMS_RIGHT.map(item => (
          <NavBtn key={item.id} active={tab === item.id} onClick={() => { setTab(item.id as Tab); setModal('none'); }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavBtn>
        ))}
      </nav>

      {/* ── CAMERA MODAL ── */}
      {modal === 'camera' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000' }}>
          <CameraScreen
            onCapture={handleCameraCapture}
            onClose={() => setModal('none')}
          />
        </div>
      )}

      {/* ── CREATE / EDIT POST MODAL ── */}
      {modal === 'create' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => { setModal('none'); setEditPost(null); setCameraImage(undefined); }}>
          <div onClick={e => e.stopPropagation()} style={{ maxHeight: '92vh', overflowY: 'auto', borderRadius: '1.5rem 1.5rem 0 0', background: 'var(--paper)' }}>
            <PostCreator
              onSave={handleSavePost}
              onClose={() => { setModal('none'); setEditPost(null); setCameraImage(undefined); }}
              editPost={editPost}
              initialImage={cameraImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0.3rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: active ? 'var(--accent)' : 'var(--muted)', fontWeight: active ? 700 : 500, fontSize: '0.68rem', transition: 'color 0.2s', minWidth: 48 }}>
      {children}
    </button>
  );
}
