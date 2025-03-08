import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Session } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SportItem {
  id: string;
  name: string;
  emoji: string;
}

interface CalendarProps {
  sportsList: SportItem[];
}

const Calendar = ({ sportsList }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    sport_id: sportsList[0]?.id,
    duration: 30,
    notes: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, [currentDate]);

  const fetchSessions = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])
      .order('date');

    if (error) {
      console.error('Error fetching sessions:', error);
      return;
    }

    setSessions(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!user?.id) {
      console.error('User is not authenticated');
      return;
    }
  
    const sessionData = {
      user_id: user.id,
      ...formData,
    };
  
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
  
      if (profileError || !profileData) {
        console.error('User ID does not exist in profiles table:', profileError);
        return;
      }
  
      if (editingSession) {
        const { error } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', editingSession.id);
  
        if (error) {
          console.error('Error updating session:', error);
          return;
        }
      } else {
        const { error } = await supabase
          .from('sessions')
          .insert([sessionData]);
  
        if (error) {
          console.error('Error creating session:', error);
          return;
        }
      }
  
      setIsAddingSession(false);
      setEditingSession(null);
      setFormData({ date: '', sport_id: sportsList[0]?.id, duration: 30, notes: '' });
      fetchSessions();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleDelete = async (sessionId: string) => {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
      return;
    }
    fetchSessions();
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const getSessionsForDay = (day: number): Session[] => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return sessions.filter((session) => session.date === date);
  };

  return (
    <div className="p-6 bg-darker rounded-lg border border-white/20">
      {/* Button to open the modal */}
      <div className="flex mb-4">
        <button
          onClick={() => setIsAddingSession(true)}
          className="bg-cardinal text-white font-bold rounded px-4 py-2 hover:bg-white hover:text-black transition-colors"
        >
          New
        </button>
      </div>
      {/* Modal for adding or editing a session */}
      {(isAddingSession || editingSession) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingSession ? 'Edit Session' : 'Add New Session'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Sport</label>
                <select
                  value={formData.sport_id}
                  onChange={(e) => setFormData({ ...formData, sport_id: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2"
                  required
                >
                  {sportsList.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.emoji} {sport.name.charAt(0).toUpperCase() + sport.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
                >
                  {editingSession ? 'Update' : 'Add'} Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSession(false);
                    setEditingSession(null);
                  }}
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar grid with days of the week and sessions */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center py-2 text-gray-400 font-semibold">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="h-32 w-32 bg-dark rounded-lg p-2 m-2 transition-colors overflow-y-auto"
          />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const daySessions = getSessionsForDay(day);
          return (
            <div
              key={day}
              className="h-32 w-32 bg-dark rounded-lg m-2 hover:bg-cardinal transition-colors duration-500 overflow-y-auto border border-white/10 hover:border-cardinal"
            >
              <div className="text-gray-400 absolute ml-2 mt-1 z-0">{day}</div>
              <div className="grid grid-cols-2 grid-rows-2 gap-2 p-4 place-items-center">
              {daySessions.map((session) => {
                // Lookup the sport using the sport_id key from the session
                const sport = sportsList.find((s) => s.id === session.sport_id);
                return (
                  <button
                    key={session.id}
                    onClick={() => {
                      setEditingSession(session);
                      setFormData({
                        date: session.date,
                        sport_id: session.sport_id, // use sport_id here
                        duration: session.duration,
                        notes: session.notes || '',
                      });
                    }}
                    className="text-xs bg-darker m-0 text-center rounded-full w-10 h-10 flex items-center justify-center group hover:bg-white hover:text-black transition-colors duration-500 overflow-hidden"
                  >
                    {sport?.emoji}
                  </button>
                );
              })}
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer with navigation buttons */}
      <div className="flex pt-2">
        <button onClick={prevMonth} className="p-2 hover:bg-cardinal rounded-full mr-auto">
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        <button onClick={nextMonth} className="p-2 hover:bg-cardinal rounded-full">
          <ChevronRight className="w-5 h-5 text-gray-400 mr-0" />
        </button>
      </div>
    </div>
  );
};

export default Calendar;