import React from 'react';
import { Users, Plus, BarChart3 } from 'lucide-react';

interface HeaderProps {
  onAddClient: () => void;
  currentView: 'dashboard' | 'add-client';
  onViewChange: (view: 'dashboard' | 'add-client') => void;
}

const Header: React.FC<HeaderProps> = ({ onAddClient, currentView, onViewChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aieera Digital</h1>
              <p className="text-sm text-gray-600">Work Management System</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => onViewChange('add-client')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'add-client'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;