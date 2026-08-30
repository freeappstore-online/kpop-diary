import { useState } from 'react';

const CATEGORIES = {
  'K-Pop ⭐': ['💗','⭐','🎤','🎵','🎧','🪄','✨','🎀','💿','💬','🌟','🎶','🎼','🎹','🎸','🪗','🎺','🎻','🥁','🎙️'],
  'Cute 🌸': ['🎀','🌸','☁️','⭐','💕','🦋','😊','🌷','🌺','🌻','🌹','🍀','🌈','🌙','☀️','🌟','💫','🌠','🍭','🍬'],
  'Hearts 💖': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💗','💓','💞','💕','💝','💘','💟','❣️','♥️','💔','💌'],
  'Animals 🐱': ['🐱','🐶','🐰','🐻','🐼','🐨','🦊','🐸','🐧','🦄','🐝','🦋','🐙','🦋','🐬','🦁','🐯','🐮','🐷','🐸'],
  'Decorations 🎊': ['🎊','🎉','🎈','🎁','🎀','✨','💥','🌟','⚡','🔮','💎','👑','🏆','🥇','🎗️','🎟️','🎫','🪄','🔑','💍'],
  'Food 🍓': ['🍓','🍒','🍑','🍇','🍉','🍰','🎂','🧁','🍩','🍪','🍫','🍬','🍭','🧋','☕','🍵','🥤','🧃','🍦','🍧'],
  'Nature 🌿': ['🌿','🍃','🌱','🌾','🍁','🍂','🌊','🌸','🌺','🌻','🌹','🌷','🍀','🌴','🌵','🎋','🎍','🍄','🌰','🪨'],
  'Sparkles ✨': ['✨','💫','⭐','🌟','💥','🔥','❄️','🌊','⚡','🌈','☀️','🌙','🌠','☁️','🌤️','⛅','🌦️','🌧️','⛈️','🌩️'],
};

interface Props {
  onSelect: (emoji: string) => void;
}

export function StickerPicker({ onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState('K-Pop ⭐');

  return (
    <div>
      {/* Category tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '0.35rem', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
        {Object.keys(CATEGORIES).map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ flexShrink: 0, padding: '0.3rem 0.65rem', borderRadius: '99px', border: 'none', cursor: 'pointer', background: activeCategory === cat ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--line)', color: activeCategory === cat ? 'white' : 'var(--muted)', fontWeight: 600, fontSize: '0.72rem', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {cat}
          </button>
        ))}
      </div>
      {/* Sticker grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.3rem' }}>
        {CATEGORIES[activeCategory as keyof typeof CATEGORIES].map((emoji, i) => (
          <button key={i} onClick={() => onSelect(emoji)} style={{ fontSize: 28, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.6rem', padding: '0.3rem', cursor: 'pointer', transition: 'transform 0.15s, background 0.15s', lineHeight: 1 }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.background = 'var(--line)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--panel)'; }}>
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
