import { useState } from 'react';
import type { PhotoCard, CardRarity } from '../types';

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

const RARITY_STYLES: Record<CardRarity, { label: string; color: string; bg: string; glow: string }> = {
  common:    { label: 'Common',    color: '#888',    bg: 'linear-gradient(135deg,#e0e0e0,#bdbdbd)',    glow: 'rgba(0,0,0,0.1)' },
  rare:      { label: 'Rare',      color: '#1a7fe8', bg: 'linear-gradient(135deg,#bbdefb,#64b5f6)',    glow: 'rgba(26,127,232,0.4)' },
  epic:      { label: 'Epic',      color: '#7c3aed', bg: 'linear-gradient(135deg,#e1bee7,#ce93d8)',    glow: 'rgba(124,58,237,0.4)' },
  legendary: { label: 'Legendary', color: '#f59e0b', bg: 'linear-gradient(135deg,#fff9c4,#ffd54f)',    glow: 'rgba(245,158,11,0.5)' },
};

const RARITY_ORDER: CardRarity[] = ['legendary','epic','rare','common'];

const PACK_POOLS: { rarity: CardRarity; weight: number }[] = [
  { rarity: 'legendary', weight: 3 },
  { rarity: 'epic',      weight: 12 },
  { rarity: 'rare',      weight: 30 },
  { rarity: 'common',    weight: 55 },
];

const IDOL_POOL = [
  { idolName: 'Jimin',   group: 'BTS',       era: 'Butter' },
  { idolName: 'Jungkook',group: 'BTS',       era: 'Dynamite' },
  { idolName: 'V',       group: 'BTS',       era: 'Fake Love' },
  { idolName: 'Jennie',  group: 'BLACKPINK', era: 'Pink Venom' },
  { idolName: 'Lisa',    group: 'BLACKPINK', era: 'Lovesick Girls' },
  { idolName: 'Rosé',    group: 'BLACKPINK', era: 'On the Ground' },
  { idolName: 'Jisoo',   group: 'BLACKPINK', era: 'Flower' },
  { idolName: 'Karina',  group: 'aespa',     era: 'Spicy' },
  { idolName: 'Winter',  group: 'aespa',     era: 'Black Mamba' },
  { idolName: 'NingNing',group: 'aespa',     era: 'Next Level' },
  { idolName: 'Giselle', group: 'aespa',     era: 'Girls' },
  { idolName: 'Nayeon',  group: 'TWICE',     era: 'POP!' },
  { idolName: 'Tzuyu',   group: 'TWICE',     era: 'Fancy' },
  { idolName: 'Sana',    group: 'TWICE',     era: 'Cheer Up' },
  { idolName: 'Minji',   group: 'NewJeans',  era: 'Hype Boy' },
  { idolName: 'Haerin',  group: 'NewJeans',  era: 'OMG' },
  { idolName: 'Danielle',group: 'NewJeans',  era: 'Super Shy' },
  { idolName: 'Wonyoung',group: 'IVE',       era: 'Eleven' },
  { idolName: 'Yujin',   group: 'IVE',       era: 'Love Dive' },
  { idolName: 'Rei',     group: 'IVE',       era: 'After Like' },
];

function pickRarity(): CardRarity {
  const total = PACK_POOLS.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of PACK_POOLS) { r -= p.weight; if (r <= 0) return p.rarity; }
  return 'common';
}

function generateCard(): PhotoCard {
  const idol = IDOL_POOL[Math.floor(Math.random() * IDOL_POOL.length)];
  const rarity = pickRarity();
  return {
    id: uid(),
    idolName: idol.idolName,
    group: idol.group,
    era: idol.era,
    rarity,
    foil: rarity === 'legendary' || (rarity === 'epic' && Math.random() < 0.3),
    obtainedAt: new Date().toISOString(),
    count: 1,
    favourite: false,
  };
}

interface Props {
  cards: PhotoCard[];
  packs: number;
  coins: number;
  onCardsChange: (cards: PhotoCard[]) => void;
  onPacksChange: (packs: number) => void;
  onCoinsChange: (coins: number) => void;
}

type View = 'collection' | 'opening';
type Filter = 'all' | CardRarity | 'favourite';

export function CardsScreen({ cards, packs, coins, onCardsChange, onPacksChange, onCoinsChange }: Props) {
  const [view, setView] = useState<View>('collection');
  const [filter, setFilter] = useState<Filter>('all');
  const [openedCards, setOpenedCards] = useState<PhotoCard[]>([]);
  const [revealIdx, setRevealIdx] = useState(-1);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ idolName: '', group: '', era: '', rarity: 'common' as CardRarity });
  const [selectedCard, setSelectedCard] = useState<PhotoCard | null>(null);

  const PACK_COST = 200;

  const buyPack = () => {
    if (coins < PACK_COST) return;
    onCoinsChange(coins - PACK_COST);
    onPacksChange(packs + 1);
  };

  const openPack = () => {
    if (packs < 1) return;
    onPacksChange(packs - 1);
    const newCards = Array.from({ length: 5 }, generateCard);
    setOpenedCards(newCards);
    setRevealIdx(0);
    setView('opening');
  };

  const revealNext = () => {
    if (revealIdx < openedCards.length - 1) {
      setRevealIdx(revealIdx + 1);
    } else {
      // merge into collection
      const updated = [...cards];
      for (const c of openedCards) {
        const existing = updated.find(e => e.idolName === c.idolName && e.rarity === c.rarity && e.era === c.era);
        if (existing) { existing.count += 1; }
        else { updated.push(c); }
      }
      onCardsChange(updated);
      setView('collection');
      setOpenedCards([]);
      setRevealIdx(-1);
    }
  };

  const toggleFav = (id: string) => {
    onCardsChange(cards.map(c => c.id === id ? { ...c, favourite: !c.favourite } : c));
  };

  const addCustomCard = () => {
    if (!addForm.idolName.trim()) return;
    const card: PhotoCard = {
      id: uid(),
      idolName: addForm.idolName.trim(),
      group: addForm.group.trim(),
      era: addForm.era.trim(),
      rarity: addForm.rarity,
      foil: addForm.rarity === 'legendary',
      obtainedAt: new Date().toISOString(),
      count: 1,
      favourite: false,
    };
    onCardsChange([...cards, card]);
    setShowAdd(false);
    setAddForm({ idolName: '', group: '', era: '', rarity: 'common' });
  };

  const filtered = cards.filter(c => {
    if (filter === 'favourite') return c.favourite;
    if (filter === 'all') return true;
    return c.rarity === filter;
  }).sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));

  // ── Pack opening view ──
  if (view === 'opening') {
    const card = openedCards[revealIdx];
    const rs = card ? RARITY_STYLES[card.rarity] : null;
    const isLast = revealIdx === openedCards.length - 1;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem', background: 'var(--paper)' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.4rem', textAlign: 'center' }}>
          ✨ Card {revealIdx + 1} of {openedCards.length}
        </div>
        {card && rs && (
          <div
            className="animate-pop"
            style={{
              width: 200, height: 300, borderRadius: '1.25rem', background: rs.bg,
              boxShadow: `0 0 40px ${rs.glow}, 0 8px 32px rgba(0,0,0,0.2)`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.75rem', position: 'relative', overflow: 'hidden',
              border: card.foil ? '3px solid rgba(255,255,255,0.8)' : '2px solid rgba(255,255,255,0.3)',
            }}
          >
            {card.foil && (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)', pointerEvents: 'none' }} />
            )}
            <div style={{ fontSize: 64 }}>🌟</div>
            <div style={{ textAlign: 'center', padding: '0 1rem' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.2rem', color: rs.color }}>{card.idolName}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: rs.color, opacity: 0.8 }}>{card.group}</div>
              <div style={{ fontSize: '0.75rem', color: rs.color, opacity: 0.7 }}>{card.era} era</div>
            </div>
            <div style={{ background: rs.color, color: 'white', borderRadius: '99px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              {card.foil ? '✨ FOIL ' : ''}{rs.label.toUpperCase()}
            </div>
          </div>
        )}
        <button
          onClick={revealNext}
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', color: 'white', border: 'none', borderRadius: '99px', padding: '0.85rem 2.5rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
        >
          {isLast ? '🎉 Finish!' : 'Next Card →'}
        </button>
      </div>
    );
  }

  // ── Collection view ──
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--paper)' }}>

      {/* Header */}
      <div style={{ padding: '0.75rem 1rem 0.5rem', borderBottom: '1px solid var(--line)', flexShrink: 0, background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🃏 Card Collection
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>
              🪙 {coins}
            </span>
            <button onClick={() => setShowAdd(true)} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.6rem', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)' }}>+ Add</button>
          </div>
        </div>

        {/* Pack actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            onClick={buyPack}
            disabled={coins < PACK_COST}
            style={{ flex: 1, background: coins >= PACK_COST ? 'linear-gradient(135deg, #f59e0b, #ec4899)' : 'var(--panel)', color: coins >= PACK_COST ? 'white' : 'var(--muted)', border: 'none', borderRadius: '0.75rem', padding: '0.55rem', fontWeight: 700, fontSize: '0.8rem', cursor: coins >= PACK_COST ? 'pointer' : 'not-allowed' }}
          >🛍️ Buy Pack ({PACK_COST} 🪙)</button>
          <button
            onClick={openPack}
            disabled={packs < 1}
            style={{ flex: 1, background: packs > 0 ? 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))' : 'var(--panel)', color: packs > 0 ? 'white' : 'var(--muted)', border: 'none', borderRadius: '0.75rem', padding: '0.55rem', fontWeight: 700, fontSize: '0.8rem', cursor: packs > 0 ? 'pointer' : 'not-allowed' }}
          >📦 Open Pack {packs > 0 ? `(${packs})` : '(0)'}</button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '0.1rem' }}>
          {(['all','favourite','legendary','epic','rare','common'] as (Filter)[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ flexShrink: 0, padding: '0.25rem 0.65rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem', background: filter === f ? 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))' : 'var(--panel)', color: filter === f ? 'white' : 'var(--muted)', transition: 'all 0.2s' }}>
              {f === 'all' ? '✨ All' : f === 'favourite' ? '⭐ Faves' : f === 'legendary' ? '🏆 Legendary' : f === 'epic' ? '💜 Epic' : f === 'rare' ? '💙 Rare' : '⬜ Common'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: 56, marginBottom: '0.75rem' }}>🃏</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.3rem' }}>No cards yet!</div>
            <div style={{ fontSize: '0.85rem' }}>Buy a pack or add a card manually to start your collection.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            {filtered.map(card => {
              const rs = RARITY_STYLES[card.rarity];
              return (
                <button
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  style={{ background: rs.bg, borderRadius: '1rem', border: card.foil ? '2px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.3)', padding: '0.6rem 0.4rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', boxShadow: `0 2px 12px ${rs.glow}`, position: 'relative', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                >
                  {card.favourite && <span style={{ position: 'absolute', top: 4, right: 4, fontSize: 12 }}>⭐</span>}
                  {card.count > 1 && <span style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '99px', fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.35rem' }}>×{card.count}</span>}
                  <div style={{ fontSize: 32 }}>🌟</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '0.72rem', color: rs.color, textAlign: 'center', lineHeight: 1.2 }}>{card.idolName}</div>
                  <div style={{ fontSize: '0.6rem', color: rs.color, opacity: 0.8, fontWeight: 600 }}>{card.group}</div>
                  <div style={{ background: rs.color, color: 'white', borderRadius: '99px', padding: '0.1rem 0.4rem', fontSize: '0.55rem', fontWeight: 800 }}>{card.foil ? '✨ FOIL' : rs.label}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Card detail overlay */}
      {selectedCard && (() => {
        const rs = RARITY_STYLES[selectedCard.rarity];
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedCard(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'var(--paper)', borderRadius: '1.5rem', padding: '1.5rem', width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 180, height: 270, borderRadius: '1.25rem', background: rs.bg, boxShadow: `0 0 40px ${rs.glow}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', position: 'relative', overflow: 'hidden', border: selectedCard.foil ? '3px solid rgba(255,255,255,0.8)' : '2px solid rgba(255,255,255,0.3)' }}>
                {selectedCard.foil && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)', pointerEvents: 'none' }} />}
                <div style={{ fontSize: 64 }}>🌟</div>
                <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.3rem', color: rs.color }}>{selectedCard.idolName}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: rs.color, opacity: 0.8 }}>{selectedCard.group}</div>
                  <div style={{ fontSize: '0.78rem', color: rs.color, opacity: 0.7 }}>{selectedCard.era} era</div>
                </div>
                <div style={{ background: rs.color, color: 'white', borderRadius: '99px', padding: '0.2rem 0.75rem', fontSize: '0.72rem', fontWeight: 800 }}>{selectedCard.foil ? '✨ FOIL ' : ''}{rs.label.toUpperCase()}</div>
              </div>
              <div style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { toggleFav(selectedCard.id); setSelectedCard(c => c ? { ...c, favourite: !c.favourite } : null); }} style={{ flex: 1, background: selectedCard.favourite ? '#f59e0b' : 'var(--panel)', color: selectedCard.favourite ? 'white' : 'var(--muted)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.6rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                  {selectedCard.favourite ? '⭐ Faved' : '☆ Favourite'}
                </button>
                <button onClick={() => setSelectedCard(null)} style={{ flex: 1, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.6rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--muted)' }}>Close</button>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>Obtained {new Date(selectedCard.obtainedAt).toLocaleDateString()} · Copies: {selectedCard.count}</div>
            </div>
          </div>
        );
      })()}

      {/* Add custom card modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowAdd(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--paper)', borderRadius: '1.5rem 1.5rem 0 0', padding: '1.5rem', width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.1rem' }}>➕ Add Custom Card</div>
            {[
              { label: 'Idol Name *', key: 'idolName', placeholder: 'e.g. Jimin' },
              { label: 'Group', key: 'group', placeholder: 'e.g. BTS' },
              { label: 'Era', key: 'era', placeholder: 'e.g. Butter' },
            ].map(f => (
              <input key={f.key} placeholder={f.placeholder} value={(addForm as Record<string,string>)[f.key]} onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ background: 'var(--panel)', border: '1.5px solid var(--line)', borderRadius: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none' }} />
            ))}
            <select value={addForm.rarity} onChange={e => setAddForm(p => ({ ...p, rarity: e.target.value as CardRarity }))}
              style={{ background: 'var(--panel)', border: '1.5px solid var(--line)', borderRadius: '0.75rem', padding: '0.6rem 0.75rem', color: 'var(--ink)', fontSize: '0.9rem', outline: 'none' }}>
              {(['common','rare','epic','legendary'] as CardRarity[]).map(r => <option key={r} value={r}>{RARITY_STYLES[r].label}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={addCustomCard} style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Add Card</button>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.7rem', fontWeight: 700, cursor: 'pointer', color: 'var(--muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
