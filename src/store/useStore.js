import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      username: '',
      setUsername: (name) => set({ username: name }),
      
      savedGames: {}, // { pacman: { level: 5, score: 10000, lives: 3 }, snake: ... }
      
      saveGame: (gameId, data) => set((state) => ({
        savedGames: {
          ...state.savedGames,
          [gameId]: data
        }
      })),
      
      clearSavedGame: (gameId) => set((state) => {
        const newSaved = { ...state.savedGames };
        delete newSaved[gameId];
        return { savedGames: newSaved };
      }),
      
      highScores: {}, // { pacman: 25000, snake: 1500 }
      
      updateHighScore: (gameId, score) => set((state) => {
        const currentHigh = state.highScores[gameId] || 0;
        if (score > currentHigh) {
          return {
            highScores: {
              ...state.highScores,
              [gameId]: score
            }
          };
        }
        return state;
      })
    }),
    {
      name: 'eduarcade-storage', // name of the item in the storage (must be unique)
    }
  )
);
