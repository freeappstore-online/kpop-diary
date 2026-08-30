import type { AvatarFrame } from '../types';

export const AVATAR_FRAMES: { id: AvatarFrame; label: string; icon: string; style: React.CSSProperties; overlayEmojis?: string }[] = [
  { id: 'none',     label: 'None',      icon: '⬜', style: { border: '3px solid var(--line)' } },
  { id: 'pink',     label: 'Pink',      icon: '🌸', style: { border: '4px solid #e91e8c', boxShadow: '0 0 0 2px #f9a8d4, 0 0 16px #e91e8c55' } },
  { id: 'rainbow',  label: 'Rainbow',   icon: '🌈', style: { border: '4px solid transparent', backgroundImage: 'linear-gradient(var(--paper), var(--paper)), linear-gradient(135deg,#ff0080,#ff8c00,#ffe600,#00cf55,#00b4ff,#a855f7)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', boxShadow: '0 0 14px #ff008055' } },
  { id: 'gold',     label: 'Gold',      icon: '👑', style: { border: '4px solid transparent', backgroundImage: 'linear-gradient(var(--paper), var(--paper)), linear-gradient(135deg,#f59e0b,#fde68a,#b45309,#fde68a,#f59e0b)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', boxShadow: '0 0 16px #f59e0b66' } },
  { id: 'kpop',     label: 'K-Pop',     icon: '💿', style: { border: '4px solid transparent', backgroundImage: 'linear-gradient(var(--paper), var(--paper)), linear-gradient(135deg,#e91e8c,#b44fdb,#1a7fe8,#e91e8c)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', boxShadow: '0 0 18px #b44fdb55' } },
  { id: 'hearts',   label: 'Hearts',    icon: '💗', style: { border: '4px solid #fb7185', boxShadow: '0 0 0 2px #fda4af, 0 0 0 4px #fecdd3, 0 0 14px #fb718555' } },
  { id: 'stars',    label: 'Stars',     icon: '⭐', style: { border: '4px solid transparent', backgroundImage: 'linear-gradient(var(--paper), var(--paper)), linear-gradient(135deg,#fbbf24,#f59e0b,#fde68a,#f59e0b)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', boxShadow: '0 0 0 2px #fde68a, 0 0 16px #fbbf2466' } },
  { id: 'midnight', label: 'Midnight',  icon: '🌙', style: { border: '4px solid transparent', backgroundImage: 'linear-gradient(var(--paper), var(--paper)), linear-gradient(135deg,#c084fc,#818cf8,#38bdf8,#c084fc)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', boxShadow: '0 0 18px #818cf855' } },
  { id: 'pastel',   label: 'Pastel',    icon: '🌷', style: { border: '4px solid transparent', backgroundImage: 'linear-gradient(var(--paper), var(--paper)), linear-gradient(135deg,#fbcfe8,#bae6fd,#bbf7d0,#fde68a,#fbcfe8)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', boxShadow: '0 0 12px #fbcfe855' } },
  { id: 'fire',     label: 'Fire',      icon: '🔥', style: { border: '4px solid transparent', backgroundImage: 'linear-gradient(var(--paper), var(--paper)), linear-gradient(135deg,#ef4444,#f97316,#fbbf24,#ef4444)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', boxShadow: '0 0 18px #ef444455' } },
];

interface Props {
  avatarData?: string;
  frame: AvatarFrame;
  size?: number;
  fallback?: string;
}

export function AvatarWithFrame({ avatarData, frame, size = 80, fallback = '💗' }: Props) {
  const frameStyle = AVATAR_FRAMES.find(f => f.id === frame)?.style ?? {};

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        ...frameStyle,
      }}
    >
      {avatarData ? (
        <img
          src={avatarData}
          alt="avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.4,
          }}
        >
          {fallback}
        </div>
      )}
    </div>
  );
}
