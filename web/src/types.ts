export type Theme = 'pink' | 'blue' | 'lavender' | 'strawberry' | 'midnight' | 'glitter' | 'dark' | 'softpastel';

export type AvatarFrame = 'none' | 'pink' | 'rainbow' | 'gold' | 'kpop' | 'hearts' | 'stars' | 'midnight' | 'pastel' | 'fire';

export interface StickerOnCanvas {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface Post {
  id: string;
  imageData?: string;
  caption: string;
  songTag: string;
  mood: string;
  liked: boolean;
  saved: boolean;
  createdAt: string;
  stickers: StickerOnCanvas[];
  filter: string;
  frame: string;
  idol?: string;
  tags?: string[];
}

export interface Idol {
  id: string;
  imageData?: string;
  name: string;
  group: string;
  favSong: string;
  favEra: string;
  notes: string;
  folder: string;
  createdAt: string;
  // extra info fields
  birthday?: string;
  position?: string;
  nationality?: string;
  debutYear?: string;
}

export interface JournalEntry {
  id: string;
  text: string;
  imageData?: string;
  mood: string;
  songTag: string;
  createdAt: string;
}

export interface Profile {
  username: string;
  bio: string;
  favGroup: string;
  favIdol: string;
  favColour: string;
  avatarData?: string;
  avatarFrame: AvatarFrame;
  theme: Theme;
  accentColour: string;
}

// ── Cards ──────────────────────────────────────────────
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PhotoCard {
  id: string;
  idolName: string;
  group: string;
  era: string;
  imageData?: string;
  rarity: CardRarity;
  foil: boolean;
  obtainedAt: string;
  count: number; // duplicates
  favourite: boolean;
}

// ── Shop / Merch ───────────────────────────────────────
export type MerchType = 'sticker' | 'merch' | 'frame' | 'badge';

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  type: MerchType;
  cost: number;
  rarity: CardRarity;
  description: string;
}

export interface OwnedItem {
  itemId: string;
  obtainedAt: string;
  count: number;
}

export interface UserInventory {
  coins: number;
  ownedItems: OwnedItem[];
  cardPacks: number; // unopened packs
}
