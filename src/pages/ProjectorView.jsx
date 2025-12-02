// src/pages/ProjectorView.jsx
import { useState } from 'react';
import TitleScreen from '../components/projector/TitleScreen';
import CategoriesView from '../components/projector/CategoriesView';
import NomineesView from '../components/projector/NomineesView';
import WinnerView from '../components/projector/WinnerView';

const ProjectorView = () => {
  const [currentView, setCurrentView] = useState('title');
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="min-h-screen">
      {currentView === 'title' && (
        <TitleScreen onStart={() => setCurrentView('categories')} />
      )}

      {currentView === 'categories' && (
        <CategoriesView
          onBack={() => setCurrentView('title')}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setCurrentView('nominees');
          }}
        />
      )}

      {currentView === 'nominees' && (
        <NomineesView
          category={selectedCategory}
          onBack={() => setCurrentView('categories')}
          onShowWinner={() => setCurrentView('winner')}
        />
      )}

      {currentView === 'winner' && (
        <WinnerView
          category={selectedCategory}
          onBackToNominees={() => setCurrentView('nominees')}
        />
      )}
    </div>
  );
};

export default ProjectorView;
