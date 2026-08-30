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

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [modal, setModal] = useState<Modal>('none');
  const [posts, setPosts] = useState<Post[]>(() => load('kpd_posts', []));
  const [idols, setIdols] = useState<Idol[]>(() => load('kpd_idols', []));
  const [journals, setJournals] = useState<JournalEntry[]>(() => load('kpd_journals', []));
  const [profile, setProfile] = useState<Profile>(() => load('kpd_profile', DEFAULT_PROFILE));
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sparkles, setSparkles] = useState<{ id: string; x: number; y: number }[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [cameraImage, setCameraImage] = useState<string | undefined>();

  // Apply theme
  useEffect(() => {
    const themeMap: Record<Theme, string> = {
      pink: '', blue: 'blue', lavender: 'lavender', strawberry: 'strawberry',
      midnight: 'midnight', glitter: 'glitter', dark: 'dark', softpastel: 'softpastel',
    };
    document.body.setAttribute('data-theme', themeMap[profile.theme] || '');
  }, [profile.theme]);

  // Persist
  useEffect(() => { save('kpd_posts', posts); }, [posts]);
  useEffect(() => { save('kpd_idols', idols); }, [idols]);
  useEffect(() => { save('kpd_journals', journals); }, [journals]);
  useEffect(() => { save('kpd_profile', profile); }, [profile]);

  // Sparkle on clicks
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const id = uid();
      setSparkles(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setSparkles(prev => prev.filter(s => s.id !== id)), 1500);
    }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // Posts
  function handleSavePost(data: Omit<Post, 'id' | 'createdAt' | 'liked' | 'saved'>) {
    if (editPost) {
      setPosts(prev => prev.map(p => p.id === editPost.id ? { ...editPost, ...data } : p));
      showToast('Post updated! ✨');
    } else {
      const newPost: Post = { id: uid(), createdAt: new Date().toISOString(), liked: false, saved: false, ...data };
      setPosts(prev => [newPost, ...prev]);
      showToast('Post shared! 💗');
    }
    setModal('none');
    setEditPost(null);
    setCameraImage(undefined);
    setTab('home');
  }

  function handleLike(id: string) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
  }

  function handleSaveToggle(id: string) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
  }

  function handleDeletePost(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id));
    showToast('Post deleted');
  }

  function handleEditPost(post: Post) {
    setEditPost(post);
    setModal('create');
  }

  // Camera
  function handleCameraCapture(imageData: string) {
    setCameraImage(imageData);
    setModal('create');
  }

  // Idols
  function handleAddIdol(data: Omit<Idol, 'id' | 'createdAt'>) {
    setIdols(prev => [{ id: uid(), createdAt: new Date().toISOString(), ...data }, ...prev]);
    showToast('Idol added! ⭐');
  }
  function handleEditIdol(idol: Idol) {
    setIdols(prev => prev.map(i => i.id === idol.id ? idol : i));
    showToast('Idol updated! ✨');
  }
  function handleDeleteIdol(id: string) {
    setIdols(prev => prev.filter(i => i.id !== id));
    showToast('Idol removed');
  }

  // Journals
  function handleAddJournal(data: Omit<JournalEntry, 'id' | 'createdAt'>) {
    setJournals(prev => [{ id: uid(), createdAt: new Date().toISOString(), ...data }, ...prev]);
    showToast('Entry saved! 📔');
  }
  function handleEditJournal(entry: JournalEntry) {
    setJournals(prev => prev.map(j => j.id === entry.id ? entry : j));
    showToast('Entry updated! ✨');
  }
  function handleDeleteJournal(id: string) {
    setJournals(prev => prev.filter(j => j.id !== id));
    showToast('Entry deleted');
  }

  // Profile
  function handleUpdateProfile(p: Profile) {
    setProfile(p);
    showToast('Profile saved! 💗');
  }

  function handleThemeChange(t: Theme) {
    setProfile(prev => ({ ...prev, theme: t }));
  }

  const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'discover', icon: '🔍', label: 'Discover' },
    { id: 'idols', icon: '💿', label: 'Idols' },
    { id: 'me', icon: '👤', label: 'Me' },
  ];

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--paper)', overflow: 'hidden', maxWidth: 540, margin: '0 auto', position: 'relative' }}>
      {/* Sparkles */}
      {sparkles.map(s => (
        <Sparkle key={s.id} style={{ left: s.x - 8, top: s.y - 8 }} />
      ))}

      {/* Toast */}
      {toast && (
        <div className="animate-slideDown" style={{ position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'var(--paper)', borderRadius: '99px', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, zIndex: 9998, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'home' && (
          <HomeScreen
            posts={posts}
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
          <DiscoverScreen
            posts={posts}
            journals={journals}
            idols={idols}
            onPostClick={post => { handleEditPost(post); }}
          />
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
          />
        )}
      </div>

      {/* Bottom navigation */}
      <div style={{ background: 'var(--dock)', borderTop: '1px solid var(--line)', flexShrink: 0, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', position: 'relative', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0.5rem 0.25rem', paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          {NAV_ITEMS.slice(0, 2).map(item => (
            <NavBtn key={item.id} active={tab === item.id} onClick={() => { setTab(item.id); setModal('none'); }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>{item.label}</span>
            </NavBtn>
          ))}

          {/* Create button */}
          <button onClick={() => setModal('create')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(233,30,140,0.4)', transition: 'transform 0.15s, box-shadow 0.15s', color: 'white', fontSize: 24, marginTop: -12 }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(233,30,140,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(233,30,140,0.4)'; }}>
            ＋
          </button>

          {NAV_ITEMS.slice(2).map(item => (
            <NavBtn key={item.id} active={tab === item.id} onClick={() => { setTab(item.id); setModal('none'); }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700 }}>{item.label}</span>
            </NavBtn>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal === 'camera' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000' }}>
          <CameraScreen
            onCapture={handleCameraCapture}
            onClose={() => setModal('none')}
          />
        </div>
      )}

      {modal === 'create' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => { setModal('none'); setEditPost(null); setCameraImage(undefined); }}>
          <div style={{ height: '92vh', background: 'var(--paper)', borderRadius: '1.5rem 1.5rem 0 0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <PostCreator
              onSave={handleSavePost}
              onClose={() => { setModal('none'); setEditPost(null); setCameraImage(undefined); }}
              editPost={editPost}
              initialImage={cameraImage}
            />
          </div>
        </div>
      )}

      {/* FreeAppStore link (required) */}
      <div style={{ position: 'fixed', bottom: 80, right: 12, zIndex: 30 }}>
        <a href="https://freeappstore.online" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.6rem', color: 'var(--muted)', textDecoration: 'none', opacity: 0.6 }}>
          FreeAppStore
        </a>
      </div>
    </div>
  );
}

function NavBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0.25rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: active ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.2s', borderRadius: '0.5rem', minWidth: 52 }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
      {children}
    </button>
  );
}
