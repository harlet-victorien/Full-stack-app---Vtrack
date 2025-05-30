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

const today = new Date();
today.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison+

const Calendar = ({ sportsList }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
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
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
    date.setHours(0, 0, 0, 0); // Set time to midnight for accurate comparison
    const dateString = date.toISOString().split('T')[0];
    return sessions.filter((session) => session.date === dateString);
  };

  return (
    <div className="px-4 md:px-8 flex-1 w-full max-w-full overflow-x-hidden">
      {/* Button to open the modal */}
      <div className="flex mb-4 mt-4">
        <button
          onClick={() => setIsAddingSession(true)}
          className="bg-cardinal text-white font-bold rounded px-4 py-2 hover:bg-white hover:text-black transition-colors"
        >
          New
        </button>
      </div>
      {/* Modal for adding or editing a session */}
      {(isAddingSession || editingSession) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-10"
          onClick={() => {
            setIsAddingSession(false);
            setEditingSession(null);
          }}
        >
          <div className="bg-darker p-6 rounded-lg w-full max-w-md border border-white/20" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">
              {editingSession ? 'Edit Session' : 'Add New Session'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-left text-gray-400">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-dark text-white px-3 py-2 border border-white/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-left text-gray-400">Sport</label>
                <select
                  value={formData.sport_id}
                  onChange={(e) => setFormData({ ...formData, sport_id: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-dark text-white px-3 py-2 border border-white/20"
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
                <label className="block text-sm font-medium text-left text-gray-400">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md bg-dark text-white px-3 py-2 border border-white/20"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-left text-gray-400">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-dark text-white px-3 py-2 border border-white/20"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-cardinal text-white rounded-lg px-4 py-2 hover:bg-cardinal/50 transition-colors"
                >
                  {editingSession ? 'Update' : 'Add'} Session
                </button>
                
                {editingSession && (
                  <button
                    type="button"
                    onClick={() => {
                      setSessionToDelete(editingSession);
                      setIsDeleteModalOpen(true);
                      setIsAddingSession(false);
                      setEditingSession(null);
                    }}
                    className="flex-1 bg-dark text-white rounded-lg px-4 py-2 hover:bg-dark/50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-10"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div className="bg-darker p-6 rounded-lg w-full max-w-md border border-white/20" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-white mb-4">Are you sure you want to delete this session?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (sessionToDelete) {
                    handleDelete(sessionToDelete.id);
                  }
                  setIsDeleteModalOpen(false);
                }}
                className="flex-1 bg-cardinal text-white rounded-lg px-4 py-2 hover:bg-cardinal/50 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-dark text-white rounded-lg px-4 py-2 hover:bg-dark/50 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

    {/* Calendar grid with days of the week and sessions */}
    <div className="grid grid-cols-7 gap-2 md:gap-3 bg-darker rounded-lg border border-white/20 p-3 md:p-5 overflow-hidden">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center text-gray-400 font-semibold text-xs md:text-sm pb-2">
          {day}
        </div>
      ))}
      
      {/* Empty cells for first day alignment */}
      {Array.from({ length: firstDayOfMonth }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="aspect-square bg-dark/50 rounded-lg transition-colors"
        />
      ))}
      
      {/* Calendar days */}
      {Array.from({ length: daysInMonth }).map((_, index) => {
        const day = index + 1;
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isToday = dayDate.getTime() === today.getTime();
        const daySessions = getSessionsForDay(day);
        
        return (
          <div
            key={day}
            className={`aspect-square relative rounded-lg hover:bg-cardinal transition-colors duration-500 border hover:border-cardinal ${
              isToday ? 'bg-cardinal/50 border-cardinal' : 'bg-dark border-white/10'
            }`}
          >
            {/* Day number */}
            <div className="absolute top-1 left-1 text-gray-400 text-xs md:text-sm">
              {day}
            </div>
            
            {/* Session emojis */}
            <div className="absolute inset-0 pt-5 grid grid-cols-2 grid-rows-2 gap-1 place-items-center">
              {daySessions.slice(0, 4).map((session) => {
                const sport = sportsList.find((s) => s.id === session.sport_id);
                return (
                  <button
                    key={session.id}
                    onClick={() => {
                      setEditingSession(session);
                      setFormData({
                        date: session.date,
                        sport_id: session.sport_id,
                        duration: session.duration,
                        notes: session.notes || '',
                      });
                    }}
                    className="w-[60%] aspect-square bg-darker flex items-center justify-center rounded-full hover:bg-white hover:text-black transition-colors duration-300"
                  >
                    {/* Linear text scaling using vw units for truly responsive sizing */}
                    <span className="text-[1.5vw]">
                      {sport?.emoji}
                    </span>
                  </button>
                );
              })}
              
              {/* If there are more than 4 sessions, show a +X indicator */}
              {daySessions.length > 4 && (
                <div className="text-[min(2.5vw,0.9rem)] text-cardinal font-bold">
                  +{daySessions.length - 4}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Footer with navigation buttons */}
    <div className="flex justify-between p-4 md:p-6 mt-3">
      <button 
        onClick={prevMonth} 
        className="p-2 hover:bg-cardinal rounded-full transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-gray-400" />
      </button>
      <div className="text-gray-500 font-medium uppercase">
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
      <button 
        onClick={nextMonth} 
        className="p-2 hover:bg-cardinal rounded-full transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>
    </div>
        </div>
      );
    }

export default Calendar;