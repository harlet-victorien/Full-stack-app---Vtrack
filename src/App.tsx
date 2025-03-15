import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Activity, LogOut } from 'lucide-react';
import Calendar from './components/Calendar';
import SportRecap from './components/SportRecap';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'recap'>('calendar');
  const { user, loading, signOut } = useAuth();
  const [sportsList, setSportsList] = useState<{ id: string; name: string; emoji: string }[]>([]);
  
  useEffect(() => {
    const fetchSports = async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('id, name, emoji');
      if (error) {
        console.error('Error fetching sports:', error);
        return;
      }
      console.log(data[0].name);
      setSportsList(data);
    };
    fetchSports();
  }, []);

  useEffect(() => {
    console.log('Updated sportsList:', sportsList);
  }, [sportsList]);

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
    <div className="flex min-h-screen bg-dark text-white">
      {/* Sidebar */}
      <div className="md:w-1/6 h-16 md:h-screen w-screen md:top-0 bottom-0 bg-darker flex md:flex-col flex-row fixed items-start md:items-center justify-center md:border-r md:border-t-0 border-t md:border-r-white/20 border-t-white/20 sm:rounded-t-lg md:rounded-r-lg md:rounded-l-none z-20">
      <nav className="md:space-y-4 md:items-center justify-start flex md:flex-col flex-row md:mb-auto md:pt-20"> 
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'calendar'
                ? 'text-white md:text-xl'
                : 'text-white/30 md:text-xl'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('recap')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'recap'
                ? 'text-white md:text-xl'
                : 'text-white/30 md:text-xl'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Sport Recap</span>
          </button>
        </nav>
        <div className="md:mt-auto md:items-center">
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg md:text-xl md:mb-8 text-gray-400 hover:bg-cardinal hover:text-white transition-colors duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
  
      {/* Main Content */}
      <div className="flex-1 md:ml-1/6 items-center bg-dark">
        <h1
          className="md:text-5xl text-3xl font-bold mb-1 pt-10 text-center"
          style={{
            textShadow:
              '0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.15)',
          }}
        >
          {new Date().toLocaleDateString('default', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </h1>
        <div className="mx-auto">
          {activeTab === 'calendar' ? (
            <Calendar sportsList={sportsList} />
          ) : (
            <SportRecap sportsList={sportsList} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;