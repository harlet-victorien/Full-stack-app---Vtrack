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
  const [sportsList, setSportsList] = useState<{ name: string; emoji: string }[]>([]);
  
  useEffect(() => {
    const fetchSports = async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('name, emoji');
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
    <div className="flex min-h-screen bg-primary text-white">
      {/* Sidebar */}
      <div className="w-64 bg-darker p-6 flex flex-col fixed h-screen items-center top-0 border-r border-r-white/20 rounded-r-xl">
        <nav className="space-y-4 items-center flex flex-col mb-auto pt-20"> 
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'calendar'
                ? 'text-white text-xl'
                : 'text-white/30 text-xl'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab('recap')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              activeTab === 'recap'
                ? 'text-white text-xl'
                : 'text-white/30 text-xl'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Sport Recap</span>
          </button>
        </nav>
        <div className="mt-auto items-center">
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xl text-gray-400 hover:bg-cardinal hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
  
      {/* Main Content */}
      <div className="flex-1 p-6 ml-64 mt-0 items-center">
        <h1
          className="text-5xl font-bold mb-6 p-10 text-center"
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
        <div className="max-w-6xl mx-auto">
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