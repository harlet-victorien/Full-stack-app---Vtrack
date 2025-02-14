import React, { useMemo, useState, useEffect } from 'react';
import { Activity, BarChart3 } from 'lucide-react';
import { Session, Sport } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SportRecap = () => {
  const [selectedSport, setSelectedSport] = useState<Sport>('running');
  const [sessions, setSessions] = useState<Session[]>([]);
  const { user } = useAuth();
  
  const sports: Sport[] = ['running', 'cycling', 'swimming', 'gym', 'tennis', 'basketball'];

  useEffect(() => {
    fetchSessions();
  }, [selectedSport]);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('sport', selectedSport)
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

    // Get stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessions = sessions.filter(
      (session) => new Date(session.date) >= thirtyDaysAgo
    );

    const recentTotalDuration = recentSessions.reduce(
      (acc, session) => acc + session.duration,
      0
    );

    return {
      totalSessions,
      totalDuration,
      averageDuration,
      recentSessions: recentSessions.length,
      recentTotalDuration,
    };
  }, [sessions]);

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Activity className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Sport Recap</h2>
        </div>
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value as Sport)}
          className="bg-gray-800 text-white rounded-md px-3 py-2 border border-gray-700"
        >
          {sports.map((sport) => (
            <option key={sport} value={sport}>
              {sport.charAt(0).toUpperCase() + sport.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Total Sessions</div>
          <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
          <div className="text-sm text-gray-400">
            {stats.recentSessions} in last 30 days
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Total Duration</div>
          <div className="text-2xl font-bold text-white">{stats.totalDuration} min</div>
          <div className="text-sm text-gray-400">
            {stats.recentTotalDuration} min in last 30 days
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Average Duration</div>
          <div className="text-2xl font-bold text-white">
            {Math.round(stats.averageDuration)} min
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
        </div>
        <div className="space-y-4">
          {sessions.slice(0, 10).map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <div className="text-white font-medium">
                  {new Date(session.date).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-400">
                  {session.duration} minutes
                  {session.notes && ` · ${session.notes}`}
                </div>
              </div>
              <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
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