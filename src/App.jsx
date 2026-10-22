import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Hub from './pages/Hub';
import { useStore } from './store/useStore';

function IframeGame({ gameId, src }) {
  const navigate = useNavigate();
  const location = useLocation();
  const iframeRef = useRef(null);
  
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data === 'go_home') {
        navigate('/');
      } else if (e.data && e.data.type === 'navigate' && e.data.to) {
        navigate(e.data.to);
      } else if (e.data === 'game_ready') {
        const params = new URLSearchParams(location.search);
        const state = useStore.getState();
        // Send user profile info to the game
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'user_info',
            username: state.username || 'Gost',
            highScore: state.highScores[gameId] || 0
          }, '*');
        }
        if (params.get('resume') === 'true') {
          const savedData = state.savedGames[gameId];
          if (savedData && iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'load_progress', data: savedData }, '*');
          }
        }
      } else if (e.data && e.data.type === 'save_progress') {
        if (e.data.data === null) {
          useStore.getState().clearSavedGame(gameId);
        } else {
          useStore.getState().saveGame(gameId, e.data.data);
        }
      } else if (e.data && e.data.type === 'update_highscore') {
        useStore.getState().updateHighScore(gameId, e.data.score);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate, location, gameId]);

  return <iframe ref={iframeRef} src={src} className="w-full h-screen border-none" allowFullScreen />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/pacman" element={<IframeGame gameId="pacman" src="/games/pacman/index.html" />} />
        <Route path="/snake" element={<IframeGame gameId="snake" src="/games/snake/index.html" />} />
        <Route path="/tablic" element={<IframeGame gameId="tablic" src="/games/tablic/index.html" />} />
        <Route path="/pasijans" element={<IframeGame gameId="pasijans" src="/games/pasijans/index.html" />} />
        <Route path="*" element={<Hub />} />
      </Routes>
    </Router>
  );
}

export default App;
