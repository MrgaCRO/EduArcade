import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function ProfileModal({ isOpen, onClose }) {
  const username = useStore((state) => state.username);
  const setUsername = useStore((state) => state.setUsername);
  const highScores = useStore((state) => state.highScores);
  
  const [inputName, setInputName] = useState(username);

  if (!isOpen) return null;

  const handleSave = () => {
    setUsername(inputName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-[cardSlideIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">account_circle</span>
            Tvoj Profil
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Nadimak</label>
            <input 
              type="text" 
              value={inputName} 
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Upiši svoj nadimak..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">Ovo ime će se prikazivati na tvojoj spremljenoj igri.</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-sm">trophy</span>
              Najbolji lokalni rezultati
            </h3>
            <div className="space-y-2">
              {Object.keys(highScores).length === 0 ? (
                <div className="text-sm text-slate-500 italic bg-slate-800/50 p-3 rounded-lg text-center">Još nema odigranih igara.</div>
              ) : (
                Object.entries(highScores).map(([gameId, score]) => (
                  <div key={gameId} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-slate-300 capitalize font-medium">{gameId}</span>
                    <span className="text-green-400 font-mono font-bold">{score}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Odustani</button>
          <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-slate-950 font-bold rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20">
            Spremi
          </button>
        </div>
      </div>
    </div>
  );
}
