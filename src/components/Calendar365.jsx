import React, { useRef, useEffect } from 'react';
import { getHeatmapColor } from '../utils/helpers';

export const Calendar365 = ({ dailyStats, darkMode }) => {
  const scrollRef = useRef(null);

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
        day: date.getDate(),
        isToday: i === 0
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
  const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  // Auto-scroll vers le mois actuel au chargement
  useEffect(() => {
    if (scrollRef.current) {
      // Scroll vers la fin (mois actuel) avec un petit délai
      setTimeout(() => {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
      }, 100);
    }
  }, []);

  return (
    <div className={`p-4 md:p-6 rounded-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
      <h2 className="text-xs md:text-sm font-medium mb-3 md:mb-4 uppercase tracking-wider opacity-60">
        10 derniers mois
      </h2>

      {/* Legend */}
      <div className="flex items-center gap-2 mb-3 md:mb-4 text-xs opacity-60">
        <span className="text-[10px] md:text-xs">Moins</span>
        <div className="flex gap-1">
          <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded" style={{ backgroundColor: getHeatmapColor(2, darkMode, 0) }} />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded" style={{ backgroundColor: getHeatmapColor(4, darkMode, 0) }} />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded" style={{ backgroundColor: getHeatmapColor(5.5, darkMode, 0) }} />
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded" style={{ backgroundColor: getHeatmapColor(7, darkMode, 0) }} />
        </div>
        <span className="text-[10px] md:text-xs">Plus</span>
      </div>

      {/* Calendar Grid - Optimisé mobile */}
      <div ref={scrollRef} className="overflow-x-auto -mx-2 px-2" style={{ scrollBehavior: 'smooth' }}>
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-0.5 md:gap-1 mb-2">
            <div className="w-6 md:w-8" /> {/* Space for day labels */}
            <div className="flex gap-0.5 md:gap-1">
              {weeks.map((week, weekIndex) => {
                let monthToShow = null;

                // Vérifier si cette semaine contient le début d'un nouveau mois
                for (let i = 0; i < week.length; i++) {
                  const day = week[i];
                  if (!day) continue;

                  // Trouver le jour précédent dans toutes les semaines
                  let prevDay = null;
                  if (i > 0 && week[i - 1]) {
                    prevDay = week[i - 1];
                  } else if (weekIndex > 0) {
                    // Chercher dans la semaine précédente
                    for (let j = weeks[weekIndex - 1].length - 1; j >= 0; j--) {
                      if (weeks[weekIndex - 1][j]) {
                        prevDay = weeks[weekIndex - 1][j];
                        break;
                      }
                    }
                  }

                  // Si c'est le premier jour ou un nouveau mois commence
                  if (!prevDay || prevDay.month !== day.month) {
                    monthToShow = monthLabels[day.month];
                    break;
                  }
                }

                return (
                  <div key={weekIndex} className="h-2.5 md:h-3 mb-0.5 md:mb-1">
                    {monthToShow && (
                      <div className="text-[10px] md:text-xs opacity-60 whitespace-nowrap">
                        {monthToShow}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <div className="flex gap-0.5 md:gap-1">
            {/* Day of week labels */}
            <div className="flex flex-col gap-0.5 md:gap-1 text-[10px] md:text-xs opacity-60 pr-1 md:pr-2">
              {dayLabels.map((label, index) => (
                <div key={index} className="h-2.5 md:h-3 flex items-center justify-center w-5 md:w-6">
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-0.5 md:gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5 md:gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-sm ${
                        day ? 'hover:ring-1 md:hover:ring-2 ring-white/50 cursor-pointer' : ''
                      } ${day?.isToday ? 'ring-2 ring-green-500' : ''}`}
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

      {/* Swipe hint pour mobile */}
      <div className="mt-2 text-center md:hidden">
        <span className="text-[10px] opacity-40">← Glissez pour voir l'historique →</span>
      </div>
    </div>
  );
};
