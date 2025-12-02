import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export const ManualSessionEntry = ({ darkMode, onAddSession, projects = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'deep',
    date: new Date().toISOString().split('T')[0],
    duration: 60, // en minutes
    projectId: null // projet optionnel
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Créer le timestamp de début (milieu de journée par défaut)
    const startDate = new Date(`${formData.date}T12:00:00`);
    const start = startDate.getTime();
    const duration = formData.duration * 60; // convertir en secondes
    const end = start + (duration * 1000);

    const session = {
      type: formData.type,
      start,
      duration,
      end,
      pausedDuration: 0,
      manual: true,
      ...(formData.projectId && { projectId: formData.projectId })
    };

    onAddSession(session);

    // Reset form
    setFormData({
      type: 'deep',
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      projectId: null
    });
    setShowForm(false);
  };

  const formatDurationInput = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}`;
  };

  return (
    <div className={`p-4 md:p-6 rounded-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h2 className="text-xs md:text-sm font-medium uppercase tracking-wider opacity-60">
          Ajouter une session
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`p-2 rounded-xl transition-colors ${
            showForm
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : darkMode
              ? 'bg-zinc-800 hover:bg-zinc-700'
              : 'bg-zinc-200 hover:bg-zinc-300'
          }`}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 animate-fadeIn">
          {/* Type de travail */}
          <div>
            <label className="block text-xs md:text-sm opacity-60 mb-2">Type de travail</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'deep' })}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  formData.type === 'deep'
                    ? 'bg-green-500 text-white'
                    : darkMode
                    ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                }`}
              >
                🧠 Deep Work
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'shallow' })}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  formData.type === 'shallow'
                    ? 'bg-purple-500 text-white'
                    : darkMode
                    ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                }`}
              >
                ⚡ Shallow Work
              </button>
            </div>
          </div>

          {/* Projet (optionnel) */}
          {projects.length > 0 && (
            <div>
              <label className="block text-xs md:text-sm opacity-60 mb-2">Projet (optionnel)</label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value || null })}
                className={`w-full px-3 md:px-4 py-2 rounded-xl outline-none text-sm md:text-base ${
                  darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-300'
                }`}
              >
                <option value="">Aucun projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs md:text-sm opacity-60 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-2 md:px-4 py-2 rounded-xl outline-none text-sm md:text-base ${
                darkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-300'
              }`}
              required
            />
          </div>

          {/* Durée */}
          <div>
            <label className="block text-xs md:text-sm opacity-60 mb-2">
              Durée: {formatDurationInput(formData.duration)}
            </label>
            <input
              type="range"
              min="5"
              max="480"
              step="5"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider"
              style={{
                background: `linear-gradient(to right,
                  ${formData.type === 'deep' ? '#22c55e' : '#a855f7'} ${((formData.duration - 5) / (480 - 5)) * 100}%,
                  ${darkMode ? '#27272a' : '#e4e4e7'} ${((formData.duration - 5) / (480 - 5)) * 100}%)`
              }}
            />
            <div className="flex justify-between text-xs opacity-40 mt-1">
              <span>5min</span>
              <span>8h</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                formData.type === 'deep'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              Ajouter la session
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'
              }`}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className="text-center py-4 opacity-40">
          <p className="text-sm">Cliquez sur + pour ajouter une session manuellement</p>
        </div>
      )}
    </div>
  );
};
