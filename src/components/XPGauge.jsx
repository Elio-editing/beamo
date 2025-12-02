import React, { useMemo } from 'react';
import { Trophy, Star, Award, Zap } from 'lucide-react';

export const XPGauge = ({ dailyStats, darkMode }) => {
  // Calcul de l'XP et du niveau
  const { totalXP, currentLevel, xpForNextLevel, currentLevelXP, seasonProgress, seasonEnd, rank } = useMemo(() => {
    // Date de début de saison (tous les 60 jours)
    const today = new Date();
    const seasonStartDate = new Date('2025-01-01'); // Début de la première saison
    const daysSinceStart = Math.floor((today - seasonStartDate) / (1000 * 60 * 60 * 24));
    const currentSeasonDay = daysSinceStart % 60;
    const daysRemaining = 60 - currentSeasonDay;

    const seasonEndDate = new Date(today);
    seasonEndDate.setDate(seasonEndDate.getDate() + daysRemaining);

    // Calculer l'XP total de la saison actuelle
    let xp = 0;
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - currentSeasonDay + i);
      if (date > today) break;

      const dateKey = date.toISOString().split('T')[0];
      const stats = dailyStats[dateKey] || { deep: 0, shallow: 0, total: 0 };

      // XP: 100 par heure de deep work, 50 par heure de shallow
      xp += stats.deep * 100;
      xp += stats.shallow * 50;

      // Bonus si objectif atteint (6h deep OU 8h total)
      if (stats.deep >= 6 || stats.total >= 8) {
        xp += 200;
      }
    }

    // Calcul du niveau (progression exponentielle - très difficile)
    const calculateLevel = (totalXP) => {
      let level = 1;
      let xpAccumulated = 0;
      let xpForNextLevel = 500; // XP de base pour niveau 2

      while (totalXP >= xpAccumulated + xpForNextLevel) {
        xpAccumulated += xpForNextLevel;
        level++;
        xpForNextLevel = Math.floor(xpForNextLevel * 1.35); // Augmentation de 35% par niveau
      }

      return {
        level,
        xpInLevel: totalXP - xpAccumulated,
        xpForNextLevel
      };
    };

    const { level, xpInLevel, xpForNextLevel } = calculateLevel(xp);

    // Déterminer le rang basé sur le niveau
    const getRank = (level) => {
      if (level >= 51) return { name: 'Master', color: '#a855f7', icon: Trophy };
      if (level >= 41) return { name: 'Diamond', color: '#3b82f6', icon: Award };
      if (level >= 31) return { name: 'Platinum', color: '#06b6d4', icon: Star };
      if (level >= 21) return { name: 'Gold', color: '#fde047', icon: Zap };
      if (level >= 11) return { name: 'Silver', color: '#94a3b8', icon: Star };
      return { name: 'Bronze', color: '#f97316', icon: Award };
    };

    return {
      totalXP: xp,
      currentLevel: level,
      xpForNextLevel,
      currentLevelXP: xpInLevel,
      seasonProgress: currentSeasonDay,
      seasonEnd: seasonEndDate,
      rank: getRank(level)
    };
  }, [dailyStats]);

  const xpProgress = xpForNextLevel > 0 ? (currentLevelXP / xpForNextLevel) * 100 : 0;
  const RankIcon = rank.icon;

  return (
    <div className={`p-4 md:p-6 rounded-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
      <h2 className="text-xs md:text-sm font-medium mb-3 md:mb-4 uppercase tracking-wider opacity-60">
        Saison en cours
      </h2>

      {/* Niveau et rang */}
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="relative">
          <div
            className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4"
            style={{ borderColor: rank.color }}
          >
            <div className="text-center">
              <div className="text-[10px] md:text-xs opacity-60">NIV</div>
              <div className="text-xl md:text-2xl font-bold">{currentLevel}</div>
            </div>
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: rank.color }}
          >
            <RankIcon size={14} className="text-white md:hidden" />
            <RankIcon size={16} className="text-white hidden md:block" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-base md:text-lg truncate" style={{ color: rank.color }}>{rank.name}</span>
            <span className="text-xs opacity-40">#{currentLevel}</span>
          </div>
          <div className="text-[10px] md:text-xs opacity-60 mb-2">
            {currentLevelXP.toFixed(0)} / {xpForNextLevel.toFixed(0)} XP
          </div>

          {/* Barre de progression XP */}
          <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${xpProgress}%`,
                backgroundColor: rank.color,
                boxShadow: `0 0 10px ${rank.color}40`
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats de la saison */}
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        <div className={`p-2 md:p-3 rounded-xl ${darkMode ? 'bg-zinc-800/50' : 'bg-white'} border ${darkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
          <div className="text-[10px] md:text-xs opacity-40 mb-1">XP Total</div>
          <div className="text-xl md:text-2xl font-bold">{totalXP.toFixed(0)}</div>
        </div>

        <div className={`p-2 md:p-3 rounded-xl ${darkMode ? 'bg-zinc-800/50' : 'bg-white'} border ${darkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
          <div className="text-[10px] md:text-xs opacity-40 mb-1">Fin de saison</div>
          <div className="text-base md:text-lg font-semibold">{Math.ceil((seasonEnd - new Date()) / (1000 * 60 * 60 * 24))}j</div>
        </div>
      </div>

      {/* Info XP */}
      <div className={`mt-3 md:mt-4 p-2 md:p-3 rounded-xl ${darkMode ? 'bg-zinc-800/50' : 'bg-white'} border ${darkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
        <div className="text-[10px] md:text-xs opacity-60 space-y-1">
          <div>• Deep Work: <span className="text-green-500 font-medium">100 XP/h</span></div>
          <div>• Shallow Work: <span className="text-purple-500 font-medium">50 XP/h</span></div>
          <div>• Objectif atteint: <span className="text-yellow-500 font-medium">+200 XP</span></div>
        </div>
      </div>
    </div>
  );
};
