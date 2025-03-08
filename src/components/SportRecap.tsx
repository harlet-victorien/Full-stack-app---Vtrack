import React, { useMemo, useState, useEffect } from 'react';
import { Activity, BarChart3 } from 'lucide-react';
import { Session } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SportItem {
  id: string;
  name: string;
  emoji: string;
}

interface SportRecapProps {
  sportsList: SportItem[];
}

const SportRecap = ({ sportsList }: SportRecapProps) => {
  const [selectedSport, setSelectedSport] = useState<string>(
    sportsList[0]?.id
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, [selectedSport]);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('sport_id', selectedSport)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return;
    }
    setSessions(data || []);
  };

  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((acc, session) => acc + session.duration, 0);
    const averageDuration = totalDuration / (totalSessions || 1);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessions = sessions.filter(
      (session) => new Date(session.date) >= thirtyDaysAgo
    );
    const recentTotalDuration = recentSessions.reduce((acc, session) => acc + session.duration, 0);

    return {
      totalSessions,
      totalDuration,
      averageDuration,
      recentSessions: recentSessions.length,
      recentTotalDuration,
    };
  }, [sessions]);

  return (
    <div className="p-6 bg-darker rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Activity className="w-6 h-6 text-cardinal" />
          <h2 className="text-2xl font-bold text-white">Sport Recap</h2>
        </div>
        <div className="flex space-x-2">
          {sportsList.map((sport) => {
            const isSelected = sport.id === selectedSport;
            return (
              <div className="flex flex-col items-center justify-center space-y-2" key={sport.name}>
                <button
                  onClick={() => setSelectedSport(sport.id)}
                  className={`px-4 py-1 transition-colors duration-500 ${
                    isSelected ? 'text-white' : 'text-white/50 hover:text-white/75'
                  }`}
                >
                  {sport.emoji} {sport.name.charAt(0).toUpperCase() + sport.name.slice(1)}
                </button>
                <span
                  className={`relative w-1/2 py-1 h-1 rounded-t-lg animate-fade-in transition-colors duration-500 ${
                    isSelected
                      ? 'bg-cardinal shadow-[0_0px_12px_0px_rgba(196,30,58,0.5)]'
                      : 'bg-transparent'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-dark p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Total Sessions</div>
          <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
          <div className="text-sm text-gray-400">{stats.recentSessions} in last 30 days</div>
        </div>
        <div className="bg-dark p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Total Duration</div>
          <div className="text-2xl font-bold text-white">{stats.totalDuration} min</div>
          <div className="text-sm text-gray-400">{stats.recentTotalDuration} min in last 30 days</div>
        </div>
        <div className="bg-dark p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Average Duration</div>
          <div className="text-2xl font-bold text-white">{Math.round(stats.averageDuration)} min</div>
        </div>
      </div>

      <div className="bg-dark rounded-lg p-4">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-cardinal mr-2" />
          <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.slice(0, 10).map((session) => (
            <div
              key={session.id}
              className="animate-fade-in relative w-full overflow-hidden flex flex-col items-center justify-between bg-purple-200/5 border-white/10 transition-opacity border h-64 rounded py-5 px-4 gap-8"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="text-white font-bold text-3xl">
                  {new Date(session.date).toLocaleDateString()}
                </div>
                <div className="text-2xl text-gray-400">{session.duration} minutes</div>
                <div className="text-xl text-gray-400">{session.notes}</div>
              </div>
              <div className="bg-cardinal/50 text-white px-3 py-1 rounded-full text-sm">
                {session.duration} min
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SportRecap;