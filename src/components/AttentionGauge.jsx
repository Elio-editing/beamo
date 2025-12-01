import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const AttentionGauge = ({ attentionLevel, darkMode, onUpdateLevel }) => {
  const getColor = (level) => {
    if (level >= 80) return 'from-green-500 to-emerald-500';
    if (level >= 60) return 'from-yellow-500 to-orange-500';
    if (level >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-600';
  };

  const getMessage = (level) => {
    if (level >= 80) return 'Excellente concentration';
    if (level >= 60) return 'Bonne concentration';
    if (level >= 40) return 'Concentration moyenne';
    return 'Concentration faible';
  };

  const getIcon = (level) => {
    if (level >= 80) return <TrendingUp size={20} className="text-green-500" />;
    if (level >= 60) return <Minus size={20} className="text-yellow-500" />;
    return <TrendingDown size={20} className="text-red-500" />;
  };

  return (
    <div className={`p-6 rounded-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
      <h2 className="text-sm font-medium mb-4 uppercase tracking-wider opacity-60">
        Jauge d'attention
      </h2>

      {/* Gauge */}
      <div className="flex items-center justify-center gap-8 mb-6">
        {/* Circular Gauge */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={darkMode ? '#27272a' : '#e4e4e7'}
              strokeWidth="10"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - attentionLevel / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`${getColor(attentionLevel).split(' ')[0].replace('from-', '')}`} stopColor={
                  attentionLevel >= 80 ? '#22c55e' :
                  attentionLevel >= 60 ? '#eab308' :
                  attentionLevel >= 40 ? '#f97316' :
                  '#ef4444'
                } />
                <stop offset="100%" className={`${getColor(attentionLevel).split(' ')[1].replace('to-', '')}`} stopColor={
                  attentionLevel >= 80 ? '#10b981' :
                  attentionLevel >= 60 ? '#f97316' :
                  attentionLevel >= 40 ? '#ef4444' :
                  '#f43f5e'
                } />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Stats à côté */}
        <div className="flex flex-col gap-2">
          <div className="text-5xl font-bold">{attentionLevel}%</div>
          <div className="flex items-center gap-2">
            {getIcon(attentionLevel)}
            <div className="text-sm opacity-60">{getMessage(attentionLevel)}</div>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-3">
        <input
          type="range"
          min="0"
          max="100"
          value={attentionLevel}
          onChange={(e) => onUpdateLevel(parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right,
              ${attentionLevel >= 80 ? '#22c55e' :
                attentionLevel >= 60 ? '#eab308' :
                attentionLevel >= 40 ? '#f97316' :
                '#ef4444'} ${attentionLevel}%,
              ${darkMode ? '#27272a' : '#e4e4e7'} ${attentionLevel}%)`
          }}
        />

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onUpdateLevel(Math.max(0, attentionLevel - 10))}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'
            }`}
          >
            -10%
          </button>
          <button
            onClick={() => onUpdateLevel(50)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'
            }`}
          >
            Réinitialiser
          </button>
          <button
            onClick={() => onUpdateLevel(Math.min(100, attentionLevel + 10))}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'
            }`}
          >
            +10%
          </button>
        </div>
      </div>

      {/* Info */}
      <div className={`mt-4 p-3 rounded-xl ${darkMode ? 'bg-zinc-800/50' : 'bg-white'} border ${darkMode ? 'border-zinc-700' : 'border-zinc-200'}`}>
        <p className="text-xs opacity-60">
          Ajustez votre niveau d'attention en fonction de votre capacité de concentration actuelle.
          Cela vous aidera à mieux comprendre vos patterns de productivité.
        </p>
      </div>
    </div>
  );
};
