import React from 'react';
import { getHeatmapColor } from '../utils/helpers';

export const Calendar365 = ({ dailyStats, darkMode }) => {
  // Generate 300 days from today going backwards (10 months)
  const generateDays = () => {
    const days = [];
    const today = new Date();

    for (let i = 299; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const stats = dailyStats[key] || { total: 0, deep: 0 };

      days.push({
        date: key,
        hours: stats.total || 0,
        deep: stats.deep || 0,
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
        day: date.getDate()
      });
    }

    return days;
  };

  const days = generateDays();

  // Group by weeks
  const weeks = [];
  let currentWeek = [];

  // Add empty cells for the first week if it doesn't start on Sunday
  const firstDay = days[0];
  for (let i = 0; i < firstDay.dayOfWeek; i++) {
    currentWeek.push(null);
  }

  days.forEach((day, index) => {
    currentWeek.push(day);

    if (day.dayOfWeek === 6 || index === days.length - 1) {
      // Fill remaining days of the week if needed
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className={`p-6 rounded-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
      <h2 className="text-sm font-medium mb-4 uppercase tracking-wider opacity-60">
        10 derniers mois
      </h2>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-4 text-xs opacity-60">
        <span>Moins</span>
        <div className="flex gap-1">
          <div className={`w-3 h-3 rounded ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatmapColor(1, darkMode, 0) }} />
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatmapColor(2.5, darkMode, 0) }} />
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatmapColor(4, darkMode, 0) }} />
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatmapColor(8, darkMode, 6) }} />
        </div>
        <span>Plus</span>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Day labels */}
          <div className="flex gap-1 mb-2">
            <div className="w-8" /> {/* Space for day labels */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    if (dayIndex === 0 && day) {
                      // Show month label
                      const prevDay = weekIndex > 0 ? weeks[weekIndex - 1][0] : null;
                      if (!prevDay || prevDay.month !== day.month) {
                        return (
                          <div key={`month-${weekIndex}`} className="text-xs opacity-60 h-3 mb-1">
                            {day.day <= 7 ? monthLabels[day.month] : ''}
                          </div>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex gap-1">
            {/* Day of week labels */}
            <div className="flex flex-col gap-1 text-xs opacity-60 pr-2">
              {dayLabels.map((label, index) => (
                <div key={index} className="h-3 flex items-center">
                  {index % 2 === 1 ? label : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded ${day ? 'hover:ring-2 ring-white/50 cursor-pointer' : ''}`}
                      style={{
                        backgroundColor: day
                          ? getHeatmapColor(day.hours, darkMode, day.deep)
                          : 'transparent'
                      }}
                      title={day ? `${day.date}: ${day.hours.toFixed(1)}h (${day.deep.toFixed(1)}h deep)` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
