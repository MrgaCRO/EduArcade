import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';
import { useStore } from '../store/useStore';

const games = [
  {
    id: 'snake',
    title: 'Snake Edu',
    icon: '🐍',
    iconDropShadow: 'drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]',
    tags: ['arcade', 'edu'],
    tagLabel: 'Akcija & Kviz',
    tagColorClass: 'text-arcade-emerald',
    titleHoverClass: 'group-hover:text-primary',
    arrowHoverClass: 'group-hover:text-primary',
    cardHoverShadow: 'hover:shadow-[0_16px_36px_-10px_rgba(74,222,128,0.3)]',
    desc: 'Vježbaj matematičke operacije, povijest i geografiju uz klasičnu zmiju s modernim 360° kontrolama.',
    microTags: ['360° kontrole', 'Kvizovi'],
    buttonClass: 'bg-primary-container text-on-primary-container shadow-[0_0_18px_rgba(34,197,94,0.35)] hover:shadow-[0_0_24px_rgba(34,197,94,0.6)] group-hover:bg-primary',
  },
  {
    id: 'tablic',
    title: 'Tablić',
    icon: '🃏',
    iconDropShadow: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]',
    tags: ['cards', 'edu'],
    tagLabel: 'Strategija & Brojevi',
    tagColorClass: 'text-arcade-cyan',
    titleHoverClass: 'group-hover:text-arcade-cyan',
    arrowHoverClass: 'group-hover:text-arcade-cyan',
    cardHoverShadow: 'hover:shadow-[0_16px_36px_-10px_rgba(34,211,238,0.3)]',
    desc: 'Klasična kartaška igra strategije i zbrajanja brojeva protiv pametnog računalnog suparnika.',
    microTags: ['Pametni AI', 'Matematika'],
    buttonClass: 'bg-surface-container-high text-on-surface hover:bg-secondary-container hover:text-on-secondary-container hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]',
  },
  {
    id: 'pasijans',
    title: 'Pasijans',
    icon: '🎴',
    iconDropShadow: 'drop-shadow-[0_0_12px_rgba(192,132,252,0.5)]',
    tags: ['cards'],
    tagLabel: 'Logika & Strpljenje',
    tagColorClass: 'text-arcade-purple',
    titleHoverClass: 'group-hover:text-arcade-purple',
    arrowHoverClass: 'group-hover:text-arcade-purple',
    cardHoverShadow: 'hover:shadow-[0_16px_36px_-10px_rgba(192,132,252,0.3)]',
    desc: 'Klasična kartaška igra strpljenja i slaganja nizova od asa do kralja po znakovima.',
    microTags: ['Klondike', 'Opuštanje'],
    buttonClass: 'bg-surface-container-high text-on-surface hover:bg-tertiary-container hover:text-on-tertiary-container hover:shadow-[0_0_20px_rgba(192,132,252,0.4)]',
  },
  {
    id: 'pacman',
    title: 'Pac-Man Edu',
    icon: '🟡',
    iconDropShadow: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    tags: ['arcade', 'edu'],
    tagLabel: 'Labirint & Kviz',
    tagColorClass: 'text-arcade-amber',
    titleHoverClass: 'group-hover:text-arcade-amber',
    arrowHoverClass: 'group-hover:text-arcade-amber',
    cardHoverShadow: 'hover:shadow-[0_16px_36px_-10px_rgba(245,158,11,0.35)]',
    desc: 'Skupi sve točkice, bježi od duhova i spasi život točnim odgovorom kada te uhvate!',
    microTags: ['Duhovi', 'Spas kviz'],
    buttonClass: 'bg-surface-container-high text-on-surface hover:bg-arcade-amber hover:text-surface hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    isNew: true,
  }
];

const filterButtons = [
  { id: 'all', label: 'Sve igre', count: 4 },
  { id: 'arcade', label: 'Arkadne', emoji: '🎮' },
  { id: 'cards', label: 'Kartaške', emoji: '🃏' },
  { id: 'edu', label: 'Edukativne', emoji: '📚' },
];

export default function Hub() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingGame, setPendingGame] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const username = useStore(state => state.username);
  const savedGames = useStore(state => state.savedGames);
  const highScores = useStore(state => state.highScores);
  const navigate = useNavigate();

  const bestOverallScore = Object.values(highScores).reduce((max, s) => Math.max(max, s || 0), 24850);

  const filteredGames = games.filter(g => {
    const matchesCategory = filter === 'all' || g.tags.includes(filter);
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleGameClick = (e, game) => {
    e.preventDefault();
    if (savedGames[game.id]) {
      setPendingGame(game);
    } else {
      navigate('/' + game.id);
    }
  };

  return (
    <div className="bg-canvas-deep text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary/30">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-primary/20 shadow-[0_4px_24px_rgba(34,197,94,0.08)]">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <a onClick={(e) => { e.preventDefault(); setFilter('all'); setSearchQuery(''); }} className="flex items-center gap-3 group cursor-pointer" href="#">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(75,226,119,0.25)] group-hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-primary text-[22px]">sports_esports</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[20px] leading-[28px] font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors">EduArcade</span>
                <span className="text-[11px] leading-[14px] font-bold text-on-surface-variant tracking-wider uppercase">Uči kroz igru</span>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* Telemetry Bar */}
            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-xl bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-arcade-emerald text-[18px]">play_circle</span>
                <div className="flex flex-col">
                  <span className="text-[11px] leading-[14px] font-bold text-on-surface-variant uppercase tracking-wider">Odigrano</span>
                  <span className="text-[12px] leading-[16px] text-arcade-emerald font-bold stat-value">128</span>
                </div>
              </div>
              <div className="w-px h-6 bg-surface-container-highest"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-arcade-cyan text-[18px]">military_tech</span>
                <div className="flex flex-col">
                  <span className="text-[11px] leading-[14px] font-bold text-on-surface-variant uppercase tracking-wider">Najbolji</span>
                  <span className="text-[12px] leading-[16px] text-arcade-cyan font-bold stat-value">{bestOverallScore.toLocaleString('hr-HR')}</span>
                </div>
              </div>
              <div className="w-px h-6 bg-surface-container-highest"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-arcade-purple text-[18px]">bolt</span>
                <div className="flex flex-col">
                  <span className="text-[11px] leading-[14px] font-bold text-on-surface-variant uppercase tracking-wider">Level</span>
                  <span className="text-[12px] leading-[16px] text-arcade-purple font-bold">LVL 14</span>
                </div>
              </div>
            </div>

            {/* Action & Profile Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                title="Postavke profila"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-primary/20 transition-all cursor-pointer"
                title="Tvoj profil"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[16px]">person</span>
                </div>
                <span className="text-xs font-bold text-on-surface">{username || 'Gost'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-20 bg-canvas-deep flex-1">
        <div className="flex flex-col w-full relative overflow-hidden">
          {/* Dynamic Ambient Arcade Background Glows */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-primary/10 rounded-full blur-[140px] -z-10"></div>
          <div className="pointer-events-none absolute top-96 left-12 w-96 h-96 bg-arcade-cyan/5 rounded-full blur-[120px] -z-10"></div>
          <div className="pointer-events-none absolute top-96 right-12 w-96 h-96 bg-arcade-purple/5 rounded-full blur-[120px] -z-10"></div>

          {/* Interactive Filter Bar Section */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full flex flex-col md:flex-row items-center justify-between gap-4 pt-10 pb-4">
            {/* Category Pills */}
            <div className="flex items-center flex-wrap gap-2.5">
              {filterButtons.map(btn => {
                const isActive = filter === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setFilter(btn.id)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] leading-[16px] tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'font-bold bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(74,222,128,0.35)]'
                        : 'font-medium text-on-surface-variant bg-surface-container-low hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    {btn.emoji && <span>{btn.emoji}</span>}
                    <span>{btn.label}</span>
                    {btn.count !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-canvas-deep/20">{btn.count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Search & Status Display */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-card/90 text-on-surface pl-10 pr-4 py-2 rounded-xl text-[14px] placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-arcade-cyan transition-all border border-surface-card-border"
                  placeholder="Pretraži igre..."
                  type="text"
                />
              </div>
              <div className="hidden lg:flex items-center gap-2 text-on-surface-variant text-[11px] font-bold bg-surface-container-low px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span>Live Server</span>
              </div>
            </div>
          </section>

          {/* High-Impact Games Grid */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGames.map((game, i) => {
                const hasSave = Boolean(savedGames[game.id]);
                return (
                  <article
                    key={game.id}
                    onClick={(e) => handleGameClick(e, game)}
                    style={{ animationDelay: `${(i + 1) * 0.08}s` }}
                    className={`game-card relative flex flex-col justify-between rounded-2xl bg-surface-card/90 backdrop-blur-xl p-6 shadow-xl hover:-translate-y-2 ${game.cardHoverShadow} transition-all duration-300 group cursor-pointer border border-surface-card-border/60`}
                  >
                    {/* Floating NOVO! or SPREMLJENO! Pill */}
                    {hasSave ? (
                      <div className="absolute -top-3.5 right-6 z-10 px-3 py-1 rounded-full bg-arcade-cyan text-canvas-deep text-[11px] font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.7)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-canvas-deep animate-ping"></span>
                        <span>LVL {savedGames[game.id]?.level || 1} SPREMLJENO</span>
                      </div>
                    ) : game.isNew ? (
                      <div className="absolute -top-3.5 right-6 z-10 px-3 py-1 rounded-full bg-primary text-on-primary text-[11px] font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(75,226,119,0.7)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-on-primary animate-ping"></span>
                        <span>NOVO!</span>
                      </div>
                    ) : null}

                    <div>
                      {/* Header: Icon & Category Tag */}
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                          <span className={`text-3xl filter ${game.iconDropShadow}`}>{game.icon}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-container-low ${game.tagColorClass}`}>
                          {game.tagLabel}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="flex items-center justify-between mb-2">
                        <h2 className={`text-[24px] leading-[32px] font-bold text-on-surface ${game.titleHoverClass} transition-colors`}>
                          {game.title}
                        </h2>
                        <span className={`material-symbols-outlined text-outline ${game.arrowHoverClass} group-hover:translate-x-0.5 transition-all text-[20px]`}>
                          arrow_forward
                        </span>
                      </div>
                      <p className="text-[14px] leading-[20px] text-on-surface-variant mb-6">
                        {game.desc}
                      </p>

                      {/* Micro Tags */}
                      <div className="flex items-center flex-wrap gap-2 mb-6">
                        {game.microTags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface-variant text-[11px] font-bold tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <a
                      href={`/${game.id}`}
                      onClick={(e) => handleGameClick(e, game)}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[14px] font-bold transition-all ${game.buttonClass}`}
                    >
                      <span>{hasSave ? 'Nastavi / Pokreni' : 'Pokreni'}</span>
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-surface-container py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[16px]">sports_esports</span>
            </div>
            <span className="text-[12px] font-semibold text-on-surface-variant">EduArcade Portal • Uči kroz igru</span>
          </div>
          <div className="flex items-center flex-wrap justify-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-container-low text-primary border border-primary/30">v2.4.0 PROD</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-container-low text-on-surface-variant">LATENCY 18ms</span>
            <span className="text-[11px] font-bold text-on-surface-variant">© 2025 EduArcade. Sva prava pridržana.</span>
          </div>
        </div>
      </footer>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      
      {pendingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface-card border border-surface-card-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center animate-[cardSlideIn_0.2s_ease-out]">
            <div className="text-4xl mb-4">{pendingGame.icon}</div>
            <h3 className="text-xl font-bold text-on-surface mb-2">Pronađena spremljena igra!</h3>
            <p className="text-on-surface-variant text-sm mb-6">
              Imate spremljen napredak u igri <strong className="text-on-surface">{pendingGame.title}</strong> (Razina {savedGames[pendingGame.id]?.level || 1}, Bodovi: {savedGames[pendingGame.id]?.score || 0}). Želite li nastaviti?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/' + pendingGame.id + '?resume=true')}
                className="w-full px-4 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:bg-primary transition-colors shadow-[0_0_18px_rgba(34,197,94,0.35)] cursor-pointer"
              >
                Nastavi igru
              </button>
              <button
                onClick={() => { useStore.getState().clearSavedGame(pendingGame.id); navigate('/' + pendingGame.id); }}
                className="w-full px-4 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-container-highest transition-colors border border-surface-card-border cursor-pointer"
              >
                Započni novu igru
              </button>
              <button
                onClick={() => setPendingGame(null)}
                className="w-full py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors mt-1 cursor-pointer"
              >
                Odustani
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
