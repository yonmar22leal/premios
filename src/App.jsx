import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import VotingPage from './pages/VotingPage.jsx';
import ProjectorView from './pages/ProjectorView.jsx';
import ControlPanel from './pages/ControlPanel.jsx';
import ChristmasLayout from './components/ChristmasLayout.jsx';

function App() {
  // Detectar admin DESPUÉS del hash
  const fullPath = window.location.hash.substring(1);
  const url = new URL('http://fake' + fullPath);
  const params = new URLSearchParams(url.search);
  const isAdmin = params.get('admin') === 'true';

  console.log('FULL PATH:', fullPath);
  console.log('IS ADMIN:', isAdmin);

  // MODO ADMIN (todas las rutas disponibles)
  if (isAdmin) {
    return (
      <HashRouter>
        <Routes>
          <Route element={<ChristmasLayout />}>
            <Route path="/" element={<ProjectorView />} />
            <Route path="/votar" element={<VotingPage isAdmin={true} />} />
            <Route path="/control" element={<ControlPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    );
  }

  // MODO PÚBLICO (solo votar)
  return (
    <HashRouter>
      <Routes>
        <Route element={<ChristmasLayout />}>
          <Route path="/" element={<ProjectorView />} />
          <Route path="/votar" element={<VotingPage isAdmin={false} />} />
          <Route path="/control" element={<ControlPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
