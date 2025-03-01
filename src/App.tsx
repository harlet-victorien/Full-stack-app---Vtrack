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
            className="text-white py-3.5 px-6 bg-[rgb(97,0,0)] rounded-lg font-bold text-lg shadow-[inset_-3px_-3px_9px_rgba(255,255,255,0.25),inset_0px_3px_9px_rgba(255,255,255,0.3),inset_0px_1px_1px_rgba(255,255,255,0.6),inset_0px_-8px_36px_rgba(0,0,0,0.3),inset_0px_1px_5px_rgba(255,255,255,0.6),2px_19px_31px_rgba(0,0,0,0.2)] absolute right-5 top-5 cursor-pointer select-none transition-all duration-500 transform hover:scale-105"

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