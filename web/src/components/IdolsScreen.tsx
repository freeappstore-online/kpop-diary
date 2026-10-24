import { useState, useRef } from 'react';
import type { Idol } from '../types';

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// Built-in idol info database
const IDOL_DB: Omit<Idol, 'id' | 'createdAt' | 'folder'>[] = [
  { name: 'Jimin',    group: 'BTS',       favSong: 'Filter',        favEra: 'Butter',       notes: 'Main dancer & vocalist. Born Oct 13 1995.',    birthday: '1995-10-13', position: 'Main Dancer, Vocalist', nationality: 'Korean', debutYear: '2013' },
  { name: 'Jungkook', group: 'BTS',       favSong: 'Euphoria',      favEra: 'Dynamite',     notes: 'Main vocalist & maknae. Born Sep 1 1997.',     birthday: '1997-09-01', position: 'Main Vocalist, Center', nationality: 'Korean', debutYear: '2013' },
  { name: 'V',        group: 'BTS',       favSong: 'Stigma',        favEra: 'Fake Love',    notes: 'Vocalist & visual. Born Dec 30 1995.',         birthday: '1995-12-30', position: 'Vocalist, Visual',      nationality: 'Korean', debutYear: '2013' },
  { name: 'Suga',     group: 'BTS',       favSong: 'Seesaw',        favEra: 'MOTS: 7',      notes: 'Lead rapper & producer. Born Mar 9 1993.',     birthday: '1993-03-09', position: 'Lead Rapper',           nationality: 'Korean', debutYear: '2013' },
  { name: 'Jin',      group: 'BTS',       favSong: 'Epiphany',      favEra: 'Love Yourself', notes: 'Vocalist & visual. Born Dec 4 1992.',         birthday: '1992-12-04', position: 'Vocalist, Visual',      nationality: 'Korean', debutYear: '2013' },
  { name: 'Jennie',   group: 'BLACKPINK', favSong: 'Solo',          favEra: 'Pink Venom',   notes: 'Main rapper & vocalist. Born Jan 16 1996.',    birthday: '1996-01-16', position: 'Main Rapper, Vocalist', nationality: 'Korean', debutYear: '2016' },
  { name: 'Lisa',     group: 'BLACKPINK', favSong: 'Lalisa',        favEra: 'Kill This Love', notes: 'Main dancer & rapper. Born Mar 27 1997.',   birthday: '1997-03-27', position: 'Main Dancer, Rapper',   nationality: 'Thai',   debutYear: '2016' },
  { name: 'Rosé',     group: 'BLACKPINK', favSong: 'On the Ground', favEra: 'Born Pink',    notes: 'Main vocalist. Born Feb 11 1997.',             birthday: '1997-02-11', position: 'Main Vocalist',         nationality: 'Korean-Australian', debutYear: '2016' },
  { name: 'Jisoo',    group: 'BLACKPINK', favSong: 'Flower',        favEra: 'DDU-DU DDU-DU', notes: 'Vocalist & visual. Born Jan 3 1995.',        birthday: '1995-01-03', position: 'Vocalist, Visual',      nationality: 'Korean', debutYear: '2016' },
  { name: 'Karina',   group: 'aespa',     favSong: 'Spicy',         favEra: 'Savage',       notes: 'Leader & main dancer. Born Apr 11 2000.',      birthday: '2000-04-11', position: 'Leader, Main Dancer',   nationality: 'Korean', debutYear: '2020' },
  { name: 'Winter',   group: 'aespa',     favSong: 'Black Mamba',   favEra: 'MY World',     notes: 'Main vocalist. Born Jan 1 2001.',              birthday: '2001-01-01', position: 'Main Vocalist',         nationality: 'Korean', debutYear: '2020' },
  { name: 'NingNing', group: 'aespa',     favSong: 'Next Level',    favEra: 'Girls',        notes: 'Main vocalist. Born Oct 23 2002.',             birthday: '2002-10-23', position: 'Main Vocalist',         nationality: 'Chinese', debutYear: '2020' },
  { name: 'Giselle',  group: 'aespa',     favSong: 'Girls',         favEra: 'Spicy',        notes: 'Rapper & vocalist. Born Oct 30 2000.',         birthday: '2000-10-30', position: 'Rapper, Vocalist',      nationality: 'Japanese-Korean', debutYear: '2020' },
  { name: 'Nayeon',   group: 'TWICE',     favSong: 'POP!',          favEra: 'Feel Special',  notes: 'Main vocalist & center. Born Sep 22 1995.',  birthday: '1995-09-22', position: 'Main Vocalist, Center', nationality: 'Korean', debutYear: '2015' },
  { name: 'Tzuyu',    group: 'TWICE',     favSong: 'Fancy',         favEra: 'Signal',        notes: 'Vocalist & visual. Born Jun 14 1999.',        birthday: '1999-06-14', position: 'Vocalist, Visual',      nationality: 'Taiwanese', debutYear: '2015' },
  { name: 'Sana',     group: 'TWICE',     favSong: 'Cheer Up',      favEra: 'More & More',   notes: 'Vocalist. Born Dec 29 1996.',                 birthday: '1996-12-29', position: 'Vocalist',              nationality: 'Japanese', debutYear: '2015' },
  { name: 'Minji',    group: 'NewJeans',  favSong: 'Hype Boy',      favEra: 'OMG',           notes: 'Leader & vocalist. Born May 7 2004.',         birthday: '2004-05-07', position: 'Leader, Vocalist',      nationality: 'Korean', debutYear: '2022' },
  { name: 'Haerin',   group: 'NewJeans',  favSong: 'OMG',           favEra: 'Get Up',        notes: 'Vocalist. Born May 15 2006.',                 birthday: '2006-05-15', position: 'Vocalist',              nationality: 'Korean', debutYear: '2022' },
  { name: 'Danielle', group: 'NewJeans',  favSong: 'Super Shy',     favEra: 'NewJeans',      notes: 'Vocalist. Born Apr 11 2005.',                 birthday: '2005-04-11', position: 'Vocalist',              nationality: 'Korean-Australian', debutYear: '2022' },
  { name: 'Wonyoung', group: 'IVE',       favSong: 'Eleven',        favEra: 'I\'ve IVE',     notes: 'Center & vocalist. Born Aug 31 2004.',        birthday: '2004-08-31', position: 'Center, Vocalist',      nationality: 'Korean', debutYear: '2021' },
  { name: 'Yujin',    group: 'IVE',       favSong: 'Love Dive',     favEra: 'After Like',    notes: 'Leader & vocalist. Born Sep 1 2003.',         birthday: '2003-09-01', position: 'Leader, Vocalist',      nationality: 'Korean', debutYear: '2021' },
  { name: 'Rei',      group: 'IVE',       favSong: 'After Like',    favEra: 'I\'ve Mine',    notes: 'Vocalist & rapper. Born Feb 3 2004.',         birthday: '2004-02-03', position: 'Vocalist, Rapper',      nationality: 'Japanese', debutYear: '2021' },
];

const GROUP_COLORS: Record<string, string> = {
  'BTS':       '#7c3aed',
  'BLACKPINK': '#e91e8c',
  'aespa':     '#1a7fe8',
  'TWICE':     '#f97316',
  'NewJeans':  '#16a34a',
  'IVE':       '#0891b2',
};

interface Props {
  idols: Idol[];
  onIdolsChange: (idols: Idol[]) => void;
}

type View = 'browse' | 'my' | 'detail';

export function IdolsScreen({ idols, onIdolsChange }: Props) {
  const [view, setView] = useState<View>('browse');
  const [selectedIdol, setSelectedIdol] = useState<Idol | null>(null);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Partial<Idol>>({ name: '', group: '', position: '', birthday: '', nationality: '', debutYear: '', favSong: '', favEra: '', notes: '' });

  const groups = ['All', ...Array.from(new Set([...IDOL_DB.map(i => i.group), ...idols.map(i => i.group)].filter(Boolean)))];

  const isStanned = (name: string, group: string) => idols.some(i => i.name === name && i.group === group);

  const toggleStan = (dbIdol: typeof IDOL_DB[0]) => {
    if (isStanned(dbIdol.name, dbIdol.group)) {
      onIdolsChange(idols.filter(i => !(i.name === dbIdol.name && i.group === dbIdol.group)));
    } else {
      const newIdol: Idol = {
        id: uid(), createdAt: new Date().toISOString(), folder: dbIdol.group,
        ...dbIdol,
      };
      onIdolsChange([...idols, newIdol]);
    }
  };

  const addCustomIdol = () => {
    if (!form.name?.trim()) return;
    const newIdol: Idol = {
      id: uid(), createdAt: new Date().toISOString(),
      name: form.name || '', group: form.group || '', position: form.position || '',
      birthday: form.birthday || '', nationality: form.nationality || '', debutYear: form.debutYear || '',
      favSong: form.favSong || '', favEra: form.favEra || '', notes: form.notes || '',
      folder: form.group || 'Custom', imageData: form.imageData,
    };
    onIdolsChange([...idols, newIdol]);
    setShowAddForm(false);
    setForm({ name: '', group: '', position: '', birthday: '', nationality: '', debutYear: '', favSong: '', favEra: '', notes: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, imageData: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const browseFiltered = IDOL_DB.filter(i => {
    const matchGroup = groupFilter === 'All' || i.group === groupFilter;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.group.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  const myFiltered = idols.filter(i => {
    const matchGroup = groupFilter === 'All' || i.group === groupFilter;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.group.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  // ── Detail view ──
  if (selectedIdol) {
    const gc = GROUP_COLORS[selectedIdol.group] || 'var(--accent)';
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--paper)' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <button onClick={() => setSelectedIdol(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--muted)', padding: 0 }}>←</button>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.1rem' }}>{selectedIdol.name}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1rem' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: selectedIdol.imageData ? 'transparent' : `linear-gradient(135deg, ${gc}33, ${gc}66)`, border: `3px solid ${gc}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: '0.75rem' }}>
              {selectedIdol.imageData ? <img src={selectedIdol.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌟'}
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.5rem' }}>{selectedIdol.name}</div>
            <div style={{ display: 'inline-block', background: gc, color: 'white', borderRadius: '99px', padding: '0.2rem 0.85rem', fontSize: '0.82rem', fontWeight: 700, marginTop: '0.25rem' }}>{selectedIdol.group}</div>
          </div>

          {/* Info cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
            {[
              { label: '🎤 Position', value: selectedIdol.position },
              { label: '🎂 Birthday', value: selectedIdol.birthday },
              { label: '🌍 Nationality', value: selectedIdol.nationality },
              { label: '📅 Debut Year', value: selectedIdol.debutYear },
              { label: '🎵 Fav Song', value: selectedIdol.favSong },
              { label: '💿 Fav Era', value: selectedIdol.favEra },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.65rem 0.75rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)' }}>{value}</div>
              </div>
            ) : null)}
          </div>

          {selectedIdol.notes && (
            <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '0.3rem' }}>📝 Notes</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--ink)', lineHeight: 1.6 }}>{selectedIdol.notes}</div>
            </div>
          )}

          <button
            onClick={() => { onIdolsChange(idols.filter(i => i.id !== selectedIdol.id)); setSelectedIdol(null); }}
            style={{ width: '100%', marginTop: '1rem', background: 'color-mix(in srgb, #dc2626 12%, transparent)', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '0.75rem', padding: '0.65rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
          >🗑️ Remove from My Idols</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--paper)' }}>

      {/* Header */}
      <div style={{ padding: '0.75rem 1rem 0.5rem', borderBottom: '1px solid var(--line)', flexShrink: 0, background: 'var(--paper)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.25rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ⭐ Idols
          </div>
          <button onClick={() => setShowAddForm(true)} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', color: 'white', border: 'none', borderRadius: '0.65rem', padding: '0.3rem 0.75rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>+ Custom</button>
        </div>

        {/* View tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
          {([['browse','🔍 Discover'],['my','⭐ My Idols']] as [View,string][]).map(([v,l]) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '0.3rem 0.85rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', background: view === v ? 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))' : 'var(--panel)', color: view === v ? 'white' : 'var(--muted)' }}>{l}</button>
          ))}
        </div>

        {/* Search */}
        <input type="text" placeholder="Search idols…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', background: 'var(--panel)', border: '1.5px solid var(--line)', borderRadius: '0.75rem', padding: '0.45rem 0.75rem', color: 'var(--ink)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginBottom: '0.4rem' }} />

        {/* Group filter */}
        <div style={{ display: 'flex', gap: '0.3rem', overflowX: 'auto', paddingBottom: '0.1rem' }}>
          {groups.map(g => (
            <button key={g} onClick={() => setGroupFilter(g)} style={{ flexShrink: 0, padding: '0.22rem 0.6rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.7rem', background: groupFilter === g ? (GROUP_COLORS[g] || 'var(--accent)') : 'var(--panel)', color: groupFilter === g ? 'white' : 'var(--muted)' }}>{g}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>

        {/* Browse tab — idol database */}
        {view === 'browse' && (
          browseFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: '0.5rem' }}>🔍</div>
              <div style={{ fontWeight: 700 }}>No idols found</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {browseFiltered.map(idol => {
                const gc = GROUP_COLORS[idol.group] || 'var(--accent)';
                const stanned = isStanned(idol.name, idol.group);
                return (
                  <div key={`${idol.group}-${idol.name}`} style={{ background: 'var(--panel)', border: `1.5px solid ${stanned ? gc : 'var(--line)'}`, borderRadius: '1rem', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${gc}33, ${gc}66)`, border: `2px solid ${gc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🌟</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ink)' }}>{idol.name}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: gc }}>{idol.group}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.1rem' }}>{idol.position}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <button
                        onClick={() => { const full = idols.find(i => i.name === idol.name && i.group === idol.group); if (full) setSelectedIdol(full); }}
                        style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.5rem', padding: '0.3rem 0.5rem', cursor: stanned ? 'pointer' : 'not-allowed', fontSize: '0.75rem', fontWeight: 700, color: stanned ? 'var(--ink)' : 'var(--muted)', opacity: stanned ? 1 : 0.4 }}
                        disabled={!stanned}
                      >Info</button>
                      <button
                        onClick={() => toggleStan(idol)}
                        style={{ background: stanned ? gc : 'var(--panel)', color: stanned ? 'white' : 'var(--muted)', border: `1px solid ${stanned ? gc : 'var(--line)'}`, borderRadius: '0.5rem', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >{stanned ? '✓ Stanning' : '+ Stan'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* My Idols tab */}
        {view === 'my' && (
          myFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: '0.5rem' }}>⭐</div>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: '0.3rem' }}>No idols stanned yet!</div>
              <div style={{ fontSize: '0.85rem' }}>Switch to Discover to add your faves.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
              {myFiltered.map(idol => {
                const gc = GROUP_COLORS[idol.group] || 'var(--accent)';
                return (
                  <button key={idol.id} onClick={() => setSelectedIdol(idol)} style={{ background: 'var(--panel)', border: `1.5px solid ${gc}`, borderRadius: '1rem', padding: '0.85rem 0.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', transition: 'transform 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: idol.imageData ? 'transparent' : `linear-gradient(135deg, ${gc}33, ${gc}66)`, border: `2px solid ${gc}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                      {idol.imageData ? <img src={idol.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌟'}
                    </div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '0.9rem', color: 'var(--ink)' }}>{idol.name}</div>
                    <div style={{ background: gc, color: 'white', borderRadius: '99px', padding: '0.15rem 0.6rem', fontSize: '0.65rem', fontWeight: 700 }}>{idol.group}</div>
                    {idol.position && <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textAlign: 'center' }}>{idol.position}</div>}
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Add custom idol modal */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowAddForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--paper)', borderRadius: '1.5rem 1.5rem 0 0', padding: '1.25rem', width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>➕ Add Custom Idol</div>

            {/* Photo upload */}
            <div onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, borderRadius: '50%', background: form.imageData ? 'transparent' : 'var(--panel)', border: '2px dashed var(--line)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, overflow: 'hidden', alignSelf: 'center' }}>
              {form.imageData ? <img src={form.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📸'}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

            {[
              { label: 'Name *', key: 'name', placeholder: 'e.g. Jimin' },
              { label: 'Group', key: 'group', placeholder: 'e.g. BTS' },
              { label: 'Position', key: 'position', placeholder: 'e.g. Main Dancer' },
              { label: 'Birthday', key: 'birthday', placeholder: 'e.g. 1995-10-13' },
              { label: 'Nationality', key: 'nationality', placeholder: 'e.g. Korean' },
              { label: 'Debut Year', key: 'debutYear', placeholder: 'e.g. 2013' },
              { label: 'Fav Song', key: 'favSong', placeholder: 'e.g. Filter' },
              { label: 'Fav Era', key: 'favEra', placeholder: 'e.g. Butter' },
            ].map(f => (
              <input key={f.key} placeholder={f.placeholder} value={(form as Record<string,string>)[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ background: 'var(--panel)', border: '1.5px solid var(--line)', borderRadius: '0.75rem', padding: '0.55rem 0.75rem', color: 'var(--ink)', fontSize: '0.88rem', outline: 'none' }} />
            ))}
            <textarea placeholder="Notes…" value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
              style={{ background: 'var(--panel)', border: '1.5px solid var(--line)', borderRadius: '0.75rem', padding: '0.55rem 0.75rem', color: 'var(--ink)', fontSize: '0.88rem', outline: 'none', resize: 'none', fontFamily: 'Manrope, sans-serif' }} />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={addCustomIdol} style={{ flex: 1, background: 'linear-gradient(135deg, var(--accent), var(--accent2, #b44fdb))', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Add Idol</button>
              <button onClick={() => setShowAddForm(false)} style={{ flex: 1, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '0.75rem', padding: '0.7rem', fontWeight: 700, cursor: 'pointer', color: 'var(--muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
