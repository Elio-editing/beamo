import React, { useState } from 'react';
import { Clock, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { formatDuration, getDateKey } from '../utils/helpers';

export const SessionHistory = ({ sessions, darkMode, onDeleteSession }) => {
  const [filter, setFilter] = useState('all'); // all, deep, shallow
  const [selectedDate, setSelectedDate] = useState('');

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filter !== 'all' && session.type !== filter) return false;
    if (selectedDate && getDateKey(session.start) !== selectedDate) return false;
    return true;
  });

  // Group sessions by date
  const sessionsByDate = {};
  filteredSessions.forEach(session => {
    const dateKey = getDateKey(session.start);
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });

  const formatDate = (dateKey) => {
    const date = new Date(dateKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get unique dates for date filter
  const uniqueDates = [...new Set(sessions.map(s => getDateKey(s.start)))].sort().reverse();

  return (
    <div className={`p-4 md:p-6 rounded-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
      <h2 className="text-xs md:text-sm font-medium mb-3 md:mb-4 uppercase tracking-wider opacity-60">
        Historique
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-3 md:mb-4">
        <div className="flex gap-2 flex-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-white text-black'
                : darkMode
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
            }`}
          >
            Tout
          </button>
          <button
            onClick={() => setFilter('deep')}
            className={`px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              filter === 'deep'
                ? 'bg-green-500 text-white'
                : darkMode
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
            }`}
          >
            Deep
          </button>
          <button
            onClick={() => setFilter('shallow')}
            className={`px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              filter === 'shallow'
                ? 'bg-purple-500 text-white'
                : darkMode
                ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
            }`}
          >
            Shallow
          </button>
        </div>

        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={`px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm outline-none ${
            darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-300'
          }`}
        >
          <option value="">Toutes les dates</option>
          {uniqueDates.map(date => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions List */}
      <div className="space-y-3 md:space-y-4 max-h-96 overflow-y-auto">
        {Object.keys(sessionsByDate).length === 0 ? (
          <div className="text-center py-8 opacity-40">
            <p className="text-xs md:text-sm">Aucune session trouvée</p>
          </div>
        ) : (
          Object.keys(sessionsByDate)
            .sort()
            .reverse()
            .map(dateKey => (
              <div key={dateKey}>
                <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-40 mb-2 sticky top-0 bg-inherit py-1">
                  {formatDate(dateKey)}
                </div>
                <div className="space-y-2">
                  {sessionsByDate[dateKey]
                    .sort((a, b) => b.start - a.start)
                    .map(session => (
                      <div
                        key={session.id}
                        className={`p-2 md:p-3 rounded-xl ${
                          darkMode ? 'bg-zinc-800/50' : 'bg-white'
                        } border ${darkMode ? 'border-zinc-700' : 'border-zinc-200'} flex items-center justify-between gap-2`}
                      >
                        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              session.type === 'deep' ? 'bg-green-500' : 'bg-purple-500'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                              <span className="font-medium truncate">
                                {session.type === 'deep' ? 'Deep Work' : 'Shallow Work'}
                              </span>
                              <span className="opacity-40">•</span>
                              <span className="opacity-60 flex-shrink-0">{formatTime(session.start)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs opacity-60 mt-1">
                              <Clock size={10} className="md:hidden flex-shrink-0" />
                              <Clock size={12} className="hidden md:block flex-shrink-0" />
                              <span className="truncate">{formatDuration(session.duration)}</span>
                              {session.pausedDuration > 0 && (
                                <>
                                  <span className="opacity-40">•</span>
                                  <span className="truncate">Pause: {formatDuration(session.pausedDuration)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="p-1.5 md:p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500 flex-shrink-0"
                        >
                          <Trash2 size={12} className="md:hidden" />
                          <Trash2 size={14} className="hidden md:block" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Summary */}
      {filteredSessions.length > 0 && (
        <div className={`mt-3 md:mt-4 pt-3 md:pt-4 border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex justify-between text-xs md:text-sm">
            <span className="opacity-60">Total sessions:</span>
            <span className="font-medium">{filteredSessions.length}</span>
          </div>
          <div className="flex justify-between text-xs md:text-sm mt-1">
            <span className="opacity-60">Temps total:</span>
            <span className="font-medium">
              {formatDuration(filteredSessions.reduce((sum, s) => sum + s.duration, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
