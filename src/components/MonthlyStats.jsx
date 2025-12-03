import React, { useMemo } from 'react';

export const MonthlyStats = ({ dailyStats, darkMode }) => {
  // Calculer les données du mois avec useMemo pour forcer la mise à jour
  const { monthData, totalDeep, totalShallow, totalHours, avgDeep, avgShallow, avgTotal, daysWithData, daysInMonth } = useMemo(() => {
    // Obtenir le mois en cours
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Obtenir tous les jours du mois en cours
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const data = [];

    for (let day = 1; day <= daysInMonth; day++) {
      // Créer la clé de date sans conversion UTC pour éviter les décalages
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
      const stats = dailyStats[dateKey] || { deep: 0, shallow: 0, total: 0 };
      data.push({
        day,
        dateKey,
        ...stats
      });
    }

    // Calculer les moyennes et totaux
    const tDeep = data.reduce((sum, d) => sum + d.deep, 0);
    const tShallow = data.reduce((sum, d) => sum + d.shallow, 0);
    const tHours = tDeep + tShallow;
    const daysData = data.filter(d => d.total > 0).length;

    // Moyenne sur les jours PRÉCÉDENTS uniquement (exclu aujourd'hui)
    const todayDay = new Date().getDate();
    const daysToConsider = Math.max(1, todayDay - 1); // Jours avant aujourd'hui (minimum 1 pour éviter division par 0)

    // Calculer totaux sans aujourd'hui
    const dataWithoutToday = data.filter(d => d.day < todayDay);
    const tDeepPrev = dataWithoutToday.reduce((sum, d) => sum + d.deep, 0);
    const tShallowPrev = dataWithoutToday.reduce((sum, d) => sum + d.shallow, 0);
    const tHoursPrev = tDeepPrev + tShallowPrev;

    const aDeep = tDeepPrev / daysToConsider;
    const aShallow = tShallowPrev / daysToConsider;
    const aTotal = tHoursPrev / daysToConsider;

    return {
      monthData: data,
      totalDeep: tDeep,
      totalShallow: tShallow,
      totalHours: tHours,
      avgDeep: aDeep,
      avgShallow: aShallow,
      avgTotal: aTotal,
      daysWithData: daysData,
      daysInMonth
    };
  }, [dailyStats]);

  // Trouver le max pour l'échelle du graphique
  const maxHours = monthData.length > 0 ? Math.max(...monthData.map(d => d.total), 8) : 8;

  // Nom du mois
  const now = new Date();
  const monthName = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className={`p-4 md:p-6 rounded-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Graphique - 2/3 de l'espace */}
        <div className="lg:col-span-2">
          <div className="relative h-48">
            {/* Lignes horizontales de référence */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 2, 4, 6, 8].reverse().map((hour) => (
                <div key={hour} className="flex items-center">
                  <span className="text-xs opacity-40 w-6">{hour}h</span>
                  <div className={`flex-1 h-px ml-2 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                </div>
              ))}
            </div>

            {/* Barres du graphique */}
            <div className="absolute inset-0 pl-8 flex items-end gap-px pb-1">
              {monthData.map((day) => {
                // Calculer la hauteur en pixels (le conteneur fait 192px de haut)
                const containerHeight = 192;
                const minHeightPx = 8;
                const heightDeepPx = day.deep > 0 ? Math.max(minHeightPx, (day.deep / maxHours) * containerHeight) : 0;
                const heightShallowPx = day.shallow > 0 ? Math.max(minHeightPx, (day.shallow / maxHours) * containerHeight) : 0;
                const today = new Date();
                const isToday = day.day === today.getDate();

                return (
                  <div
                    key={day.day}
                    className="flex-1 flex flex-col justify-end gap-px group relative"
                  >
                    {/* Tooltip */}
                    {day.total > 0 && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className={`px-2 py-1 rounded text-xs whitespace-nowrap ${darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-200'}`}>
                          <div className="font-medium">{day.day} {monthName.split(' ')[0]}</div>
                          <div className="text-green-500">{day.deep.toFixed(1)}h Deep</div>
                          <div className="text-purple-500">{day.shallow.toFixed(1)}h Shallow</div>
                        </div>
                      </div>
                    )}

                    {/* Barre Shallow Work */}
                    {heightShallowPx > 0 && (
                      <div
                        className="w-full bg-purple-500 rounded-t transition-all duration-300"
                        style={{ height: `${heightShallowPx}px` }}
                      />
                    )}

                    {/* Barre Deep Work */}
                    {heightDeepPx > 0 && (
                      <div
                        className={`w-full bg-green-500 transition-all duration-300 ${heightShallowPx === 0 ? 'rounded-t' : ''}`}
                        style={{ height: `${heightDeepPx}px` }}
                      />
                    )}

                    {/* Indicateur du jour actuel */}
                    {isToday && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Légende des jours */}
          <div className="flex justify-between mt-2 text-xs opacity-40">
            <span>1</span>
            <span>{Math.floor(daysInMonth / 2)}</span>
            <span>{daysInMonth}</span>
          </div>
        </div>

        {/* Moyennes - 1/3 de l'espace */}
        <div className="space-y-3 md:space-y-4">
          <div>
            <div className="text-[10px] md:text-xs opacity-60 mb-2 uppercase tracking-wider">Moyennes journalières</div>

            <div className="space-y-2 md:space-y-3">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs md:text-sm opacity-60">Deep Work</span>
                  <span className="text-xl md:text-2xl font-semibold text-green-500">{avgDeep.toFixed(1)}h</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs md:text-sm opacity-60">Shallow Work</span>
                  <span className="text-xl md:text-2xl font-semibold text-purple-500">{avgShallow.toFixed(1)}h</span>
                </div>
              </div>

              <div className={`pt-2 md:pt-3 border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs md:text-sm opacity-60">Total</span>
                  <span className="text-xl md:text-2xl font-semibold">{avgTotal.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total mensuel */}
          <div className={`p-2 md:p-3 rounded-xl ${darkMode ? 'bg-zinc-800/50' : 'bg-white'} border ${darkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
            <div className="text-[10px] md:text-xs opacity-40 mb-1">Total du mois</div>
            <div className="flex items-baseline gap-2">
              <span className="text-base md:text-lg font-semibold">{totalHours.toFixed(1)}h</span>
              <span className="text-[10px] md:text-xs opacity-40">sur {daysWithData} jours</span>
            </div>
            <div className="flex gap-2 mt-1 md:mt-2 text-[10px] md:text-xs">
              <span className="text-green-500">{totalDeep.toFixed(1)}h Deep</span>
              <span className="opacity-20">•</span>
              <span className="text-purple-500">{totalShallow.toFixed(1)}h Shallow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
