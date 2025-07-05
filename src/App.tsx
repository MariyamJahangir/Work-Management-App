import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AddClientForm from './components/AddClientForm';
import { AppProvider } from './context/AppContext';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-client'>('dashboard');

  const handleAddClient = () => {
    setCurrentView('add-client');
  };

  const handleViewChange = (view: 'dashboard' | 'add-client') => {
    setCurrentView(view);
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <Header 
          onAddClient={handleAddClient}
          currentView={currentView}
          onViewChange={handleViewChange}
        />
        <main>
          {currentView === 'dashboard' ? (
            <Dashboard />
          ) : (
            <AddClientForm />
          )}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;