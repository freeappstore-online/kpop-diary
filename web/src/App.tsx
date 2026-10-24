import { useState, useEffect, useCallback } from 'react';
import { initApp } from '@freeappstore/sdk';
import type { Post, Idol, JournalEntry, Profile, Theme, PhotoCard, OwnedItem } from './types';
import { HomeScreen } from './components/HomeScreen';
import { PostCreator } from './components/PostCreator';
import { CameraScreen } from './components/CameraScreen';
import { IdolsScreen } from './components/IdolsScreen';
import { CardsScreen } from './components/CardsScreen';
import { ShopScreen } from './components/ShopScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { DiscoverScreen } from './components/DiscoverScreen';

const fas = initApp({ appId: 'kpop-diary' });
void fas;

type Tab = 'home' | 'posts' | 'cards' | 'idols' | 'shop' | 'me';
type Modal = 'none' | 'create' | 'camera';

const DEFAULT_PROFILE: Profile = {
  username: 'My K-Pop World',
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

// ── Toast ──────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return msg ? (
    <div className="animate-pop" style={{ position: 'fixed', top: '4.5rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'var(--paper)', borderRadius: '99px', padding: '0.55rem 1.25rem', fontWeight: 700, fontSize: '0.85rem', zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', pointerEvents: 'none' }}>
      {msg}
    </div>
  ) : null;
}

// ── Nav button ─────────────────────────────────────────
function NavBtn({ active, onClick, emoji, label }: { active: boolean; onClick: () => void; emoji: string; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.15rem', background: 'none', border: 'none', cursor: 'pointer',
        padding: '0.4rem 0.2rem', borderRadius: '0.75rem',
        color: active ? 'var(--accent)' : 'var(--muted)',
        transition: 'all 0.18s',
      }}
    >
      <span style={{ fontSize: active ? 22 : 20, transition: 'font-size 0.18s', filter: active ? 'drop-shadow(0 0 6px color-mix(in srgb, var(--accent) 60%, transparent))' : 'none' }}>{emoji}</span>
      <span style={{ fontSize: '0.58rem', fontWeight: active ? 800 : 600, letterSpacing: '0.01em' }}>{label}</span>
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [modal, setModal] = useState<Modal>('none');
  const [editPost, setEditPost] = useState<Post | undefined>();
  const [initialImage, setInitialImage] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  // Data
  const [posts, setPosts]     = useState<Post[]>(() => load('kpopworld_posts', []));
  const [idols, setIdols]     = useState<Idol[]>(() => load('kpopworld_idols', []));
  const [profile, setProfile] = useState<Profile>(() => load('kpopworld_profile', DEFAULT_PROFILE));
  const [cards, setCards]     = useState<PhotoCard[]>(() => load('kpopworld_cards', []));
  const [packs, setPacks]     = useState<number>(() => load('kpopworld_packs', 1)); // start with 1 free pack
  const [coins, setCoins]     = useState<number>(() => load('kpopworld_coins', 300)); // start with 300 coins
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>(() => load('kpopworld_owned', []));

  // Persist
  useEffect(() => { save('kpopworld_posts', posts); }, [posts]);
  useEffect(() => { save('kpopworld_idols', idols); }, [idols]);
  useEffect(() => { save('kpopworld_profile', profile); }, [profile]);
  useEffect(() => { save('kpopworld_cards', cards); }, [cards]);
  useEffect(() => { save('kpopworld_packs', packs); }, [packs]);
  useEffect(() => { save('kpopworld_coins', coins); }, [coins]);
  useEffect(() => { save('kpopworld_owned', ownedItems); }, [ownedItems]);

  // Theme
  useEffect(() => {
    document.body.setAttribute('data-theme', profile.theme || 'pink');
  }, [profile.theme]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  // Post actions
  const handleSavePost = useCallback((post: Post) => {
    setPosts(prev => {
      const exists = prev.find(p => p.id === post.id);
      return exists ? prev.map(p => p.id === post.id ? post : p) : [post, ...prev];
    });
    // Earn coins for posting
    setCoins(c => c + 15);
    setModal('none');
    setEditPost(undefined);
    setInitialImage(undefined);
    showToast('🌸 Post saved! +15 🪙');
  }, [showToast]);

  const handleLike = useCallback((id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
    setCoins(c => c + 2);
  }, []);

  const handleSaveBookmark = useCallback((id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));
    setCoins(c => c + 1);
  }, []);

  const handleDeletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    showToast('🗑️ Post deleted');
  }, [showToast]);

  const handleEditPost = useCallback((post: Post) => {
    setEditPost(post);
    setModal('create');
  }, []);

  const handleCameraCapture = useCallback((imageData: string) => {
    setInitialImage(imageData);
    setModal('create');
  }, []);

  const handleThemeChange = useCallback((t: Theme) => {
    document.body.setAttribute('data-theme', t);
    setProfile(p => ({ ...p, theme: t }));
  }, []);

  const handleEarnCoins = useCallback((amount: number) => {
    setCoins(c => c + amount);
  }, []);

  // ── Render ──────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'Manrope, sans-serif', overflow: 'hidden' }}>

      <Toast msg={toast} />

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', borderBottom: '1px solid var(--line)', background: 'var(--paper)', flexShrink: 0, zIndex: 50 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: '1.15rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ✨ K-Pop World
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>🪙 {coins}</span>
          {packs > 0 && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', background: 'color-mix(in srgb, #f59e0b 15%, transparent)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>📦 {packs}</span>}
        </div>
      </div>

      {/* ── Screen content ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'home' && (
          <HomeScreen
            posts={posts}
            diaryName={profile.username}
            onLike={handleLike}
            onSave={handleSaveBookmark}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            onOpenCreate={() => { setEditPost(undefined); setInitialImage(undefined); setModal('create'); }}
            onOpenCamera={() => setModal('camera')}
            onOpenProfile={() => setTab('me')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {tab === 'posts' && (
          <DiscoverScreen posts={posts} onPostClick={handleEditPost} />
        )}
        {tab === 'cards' && (
          <CardsScreen
            cards={cards}
            packs={packs}
            coins={coins}
            onCardsChange={setCards}
            onPacksChange={setPacks}
            onCoinsChange={setCoins}
          />
        )}
        {tab === 'idols' && (
          <IdolsScreen idols={idols} onIdolsChange={setIdols} />
        )}
        {tab === 'shop' && (
          <ShopScreen
            coins={coins}
            ownedItems={ownedItems}
            onCoinsChange={setCoins}
            onOwnedChange={setOwnedItems}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {tab === 'me' && (
          <ProfileScreen
            profile={profile}
            posts={posts}
            cards={cards}
            ownedItems={ownedItems}
            coins={coins}
            onUpdateProfile={p => { setProfile(p); save('kpopworld_profile', p); }}
            onThemeChange={handleThemeChange}
          />
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--line)', background: 'var(--paper)', flexShrink: 0, padding: '0.3rem 0.5rem', paddingBottom: 'max(0.3rem, env(safe-area-inset-bottom))', zIndex: 50 }}>
        <NavBtn active={tab === 'home'}  onClick={() => setTab('home')}  emoji="🏠" label="Diary" />
        <NavBtn active={tab === 'posts'} onClick={() => setTab('posts')} emoji="📸" label="Posts" />
        <NavBtn active={tab === 'cards'} onClick={() => setTab('cards')} emoji="🃏" label="Cards" />
        <NavBtn active={tab === 'idols'} onClick={() => setTab('idols')} emoji="⭐" label="Idols" />
        <NavBtn active={tab === 'shop'}  onClick={() => setTab('shop')}  emoji="🛍️" label="Shop" />
        <NavBtn active={tab === 'me'}    onClick={() => setTab('me')}    emoji="👤" label="Me" />
      </div>

      {/* ── Modals ── */}
      {modal === 'create' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--paper)' }}>
          <PostCreator
            onSave={handleSavePost}
            onClose={() => { setModal('none'); setEditPost(undefined); setInitialImage(undefined); }}
            editPost={editPost}
            initialImage={initialImage}
          />
        </div>
      )}
      {modal === 'camera' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000' }}>
          <CameraScreen
            onCapture={handleCameraCapture}
            onClose={() => setModal('none')}
          />
        </div>
      )}
    </div>
  );
}
