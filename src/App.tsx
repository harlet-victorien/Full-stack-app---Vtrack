import React from 'react';
import { Calendar as CalendarIcon, Activity, LogOut } from 'lucide-react';
import Calendar from './components/Calendar';
import SportRecap from './components/SportRecap';
import Auth from './components/Auth';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [activeTab, setActiveTab] = React.useState<'calendar' | 'recap'>('calendar');
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('recap')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                activeTab === 'recap'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>Sport Recap</span>
            </button>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {activeTab === 'calendar' ? <Calendar /> : <SportRecap />}
      </div>
    </div>
  );
}

export default App;