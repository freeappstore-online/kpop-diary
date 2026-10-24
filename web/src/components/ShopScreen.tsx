import { useState } from 'react';
import type { ShopItem, OwnedItem, MerchType, CardRarity } from '../types';

const RARITY_BADGE: Record<CardRarity, { label: string; color: string }> = {
  common:    { label: 'Common',    color: '#888' },
  rare:      { label: 'Rare',      color: '#1a7fe8' },
  epic:      { label: 'Epic',      color: '#7c3aed' },
  legendary: { label: 'Legendary', color: '#f59e0b' },
};

const SHOP_ITEMS: ShopItem[] = [
  // Stickers
  { id: 'stk_heart',    name: 'Heart Sticker Pack',    emoji: '💗', type: 'sticker', cost: 50,  rarity: 'common',    description: 'Cute heart stickers for your posts' },
  { id: 'stk_star',     name: 'Star Sticker Pack',     emoji: '⭐', type: 'sticker', cost: 50,  rarity: 'common',    description: 'Sparkly star stickers' },
  { id: 'stk_flower',   name: 'Flower Sticker Pack',   emoji: '🌸', type: 'sticker', cost: 75,  rarity: 'common',    description: 'Pretty flower stickers' },
  { id: 'stk_music',    name: 'Music Sticker Pack',    emoji: '🎵', type: 'sticker', cost: 75,  rarity: 'common',    description: 'Music note stickers' },
  { id: 'stk_kpop',     name: 'K-Pop Sticker Pack',    emoji: '🎤', type: 'sticker', cost: 120, rarity: 'rare',      description: 'Exclusive K-Pop themed stickers' },
  { id: 'stk_diamond',  name: 'Diamond Sticker Pack',  emoji: '💎', type: 'sticker', cost: 200, rarity: 'epic',      description: 'Rare diamond stickers for your diary' },
  { id: 'stk_crown',    name: 'Crown Sticker Pack',    emoji: '👑', type: 'sticker', cost: 350, rarity: 'legendary', description: 'Legendary crown stickers — very exclusive!' },
  // Virtual Merch
  { id: 'merch_lightstick', name: 'Lightstick',        emoji: '🪄', type: 'merch',   cost: 150, rarity: 'rare',      description: 'Your very own virtual lightstick' },
  { id: 'merch_album',      name: 'Virtual Album',     emoji: '💿', type: 'merch',   cost: 200, rarity: 'rare',      description: 'A collectible virtual album' },
  { id: 'merch_photobook',  name: 'Photo Book',        emoji: '📸', type: 'merch',   cost: 250, rarity: 'epic',      description: 'A gorgeous virtual photo book' },
  { id: 'merch_hoodie',     name: 'Fan Hoodie',        emoji: '👕', type: 'merch',   cost: 300, rarity: 'epic',      description: 'Rep your fave group in style' },
  { id: 'merch_poster',     name: 'Signed Poster',     emoji: '🖼️', type: 'merch',   cost: 500, rarity: 'legendary', description: 'A legendary virtual signed poster' },
  // Profile Frames
  { id: 'frame_gold',       name: 'Gold Frame',        emoji: '🌟', type: 'frame',   cost: 300, rarity: 'epic',      description: 'A shiny gold profile frame' },
  { id: 'frame_rainbow',    name: 'Rainbow Frame',     emoji: '🌈', type: 'frame',   cost: 200, rarity: 'rare',      description: 'A colourful rainbow profile frame' },
  { id: 'frame_idol',       name: 'Idol Frame',        emoji: '💜', type: 'frame',   cost: 500, rarity: 'legendary', description: 'The ultimate idol fan frame' },
  // Badges
  { id: 'badge_stan',       name: 'Stan Badge',        emoji: '🏅', type: 'badge',   cost: 100, rarity: 'common',    description: 'Show off your stan status' },
  { id: 'badge_collector',  name: 'Collector Badge',   emoji: '🃏', type: 'badge',   cost: 250, rarity: 'rare',      description: 'For dedicated card collectors' },
  { id: 'badge_legendary',  name: 'Legend Badge',      emoji: '🏆', type: 'badge',   cost: 600, rarity: 'legendary', description: 'Only true legends have this' },
];

const TYPE_TABS: { id: MerchType | 'all'; label: string }[] = [
  { id: 'all',     label: '✨ All' },
  { id: 'sticker', label: '🎨 Stickers' },
  { id: 'merch',   label: '👕 Merch' },
  { id: 'frame',   label: '🖼️ Frames' },
  { id: 'badge',   label: '🏅 Badges' },
];

interface Props {
  coins: number;
  ownedItems: OwnedItem[];
  onCoinsChange: (c: number) => void;
  onOwnedChange: (items: OwnedItem[]) => void;
  onEarnCoins: (amount: number) => void;
}

export function ShopScreen({ coins, ownedItems, onCoinsChange, onOwnedChange, onEarnCoins }: Props) {
  const [tab, setTab] = useState<MerchType | 'all'>('all');
  const [toast, setToast] = useState('');
  const [lastEarn, setLastEarn] = useState(0);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const isOwned = (id: string) => ownedItems.some(o => o.itemId === id);
  const ownedCount = (id: string) => ownedItems.find(o => o.itemId === id)?.count ?? 0;

  const buy = (item: ShopItem) => {
    if (coins < item.cost) { showToast('❌ Not enough coins!'); return; }
    onCoinsChange(coins - item.cost);
    const existing = ownedItems.find(o => o.itemId === item.id);
    if (existing) {
      onOwnedChange(ownedItems.map(o => o.itemId === item.id ? { ...o, count: o.count + 1 } : o));
    } else {
      onOwnedChange([...ownedItems, { itemId: item.id, obtainedAt: new Date().toISOString(), count: 1 }]);
    }
    showToast(`✅ Got ${item.emoji} ${item.name}!`);
  };

  const earnCoins = () => {
    const now = Date.now();
    if (now - lastEarn < 30000) { showToast('⏳ Wait a bit before earning again!'); return; }
    const amount = Math.floor(Math.random() * 30) + 10;
    onEarnCoins(amount);
    setLastEarn(now);
    showToast(`🪙 Earned ${amount} coins!`);
  };

  const displayed = SHOP_ITEMS.filter(i => tab === 'all' || i.type === tab);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--paper)' }}>

      {/* Toast */}
      {toast && (
        <div className="animate-pop" style={{ position: 'fixed', top: '5rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--ink)', color: 'var(--paper)', borderRadius: '99px', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.88rem', zIndex: 999, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '0.75rem 1rem 0.5rem', borderBottom: '1px solid var(--line)', flexShrink: 0, background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🛍️ Shop
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', padding: '0.25rem 0.75rem', borderRadius: '99px' }}>
              🪙 {coins}
            </span>
            <button onClick={earnCoins} style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: '99px', padding: '0.3rem 0.75rem', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
              + Earn
            </button>
          </div>
        </div>

        {/* Earn coins hint */}
        <div style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #f59e0b 15%, transparent), color-mix(in srgb, #ec4899 10%, transparent))', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--ink)', fontWeight: 600 }}>
          💡 Tap <strong>+ Earn</strong> to collect daily coins! Also earn coins by liking & saving posts.
        </div>

        {/* Type tabs */}
        <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '0.1rem' }}>
          {TYPE_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: '0.25rem 0.65rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem', background: tab === t.id ? 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))' : 'var(--panel)', color: tab === t.id ? 'white' : 'var(--muted)', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
          {displayed.map(item => {
            const owned = isOwned(item.id);
            const count = ownedCount(item.id);
            const rb = RARITY_BADGE[item.rarity];
            const canAfford = coins >= item.cost;
            return (
              <div key={item.id} style={{ background: 'var(--panel)', border: `1.5px solid ${owned ? 'var(--accent)' : 'var(--line)'}`, borderRadius: '1rem', padding: '0.85rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
                {owned && count > 0 && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--accent)', color: 'white', borderRadius: '99px', fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.4rem' }}>×{count}</div>
                )}
                <div style={{ fontSize: 36, textAlign: 'center' }}>{item.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', textAlign: 'center', color: 'var(--ink)', lineHeight: 1.2 }}>{item.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.3 }}>{item.description}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ background: rb.color, color: 'white', borderRadius: '99px', padding: '0.1rem 0.5rem', fontSize: '0.62rem', fontWeight: 800 }}>{rb.label}</span>
                </div>
                <button
                  onClick={() => buy(item)}
                  style={{ background: canAfford ? 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))' : 'var(--line)', color: canAfford ? 'white' : 'var(--muted)', border: 'none', borderRadius: '0.65rem', padding: '0.5rem', fontWeight: 700, fontSize: '0.8rem', cursor: canAfford ? 'pointer' : 'not-allowed', marginTop: '0.2rem' }}
                >
                  🪙 {item.cost} {owned ? '(Buy Again)' : 'Buy'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Inventory section */}
        {ownedItems.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>🎒 Your Inventory</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {ownedItems.map(o => {
                const item = SHOP_ITEMS.find(i => i.id === o.itemId);
                if (!item) return null;
                return (
                  <div key={o.itemId} style={{ background: 'var(--panel)', border: '1.5px solid var(--accent)', borderRadius: '0.75rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700 }}>
                    <span>{item.emoji}</span>
                    <span style={{ color: 'var(--ink)' }}>{item.name}</span>
                    {o.count > 1 && <span style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>×{o.count}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
