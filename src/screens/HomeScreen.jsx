import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatDuration, getTodayKey, getTodaySessions, calculateTotalHours } from '../utils/helpers';
import { Play, Pause, Square, Moon, Sun, LogOut } from 'lucide-react';
import { Calendar365 } from '../components/Calendar365';
import { Projects } from '../components/Projects';
import { SessionHistory } from '../components/SessionHistory';
import { XPGauge } from '../components/XPGauge';
import { ManualSessionEntry } from '../components/ManualSessionEntry';
import { MonthlyStats } from '../components/MonthlyStats';

export const HomeScreen = () => {
  const { user, logout } = useAuth();
  const { sessions, projects, dailyStats, attentionLevel, darkMode, toggleDarkMode, addSession, deleteSession, addProject, updateProject, deleteProject, updateAttentionLevel } = useData();

  // Timer state
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workType, setWorkType] = useState('deep');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null);

  // Stats
  const todayKey = getTodayKey();
  const todayStats = dailyStats[todayKey] || { deep: 0, shallow: 0, total: 0 };

  // Timer tick
  useEffect(() => {
    let interval;
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sessionStart - pausedTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused, sessionStart, pausedTime]);

  const startSession = () => {
    setSessionStart(Date.now());
    setElapsedTime(0);
    setPausedTime(0);
    setIsTracking(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume
      setPausedTime(pausedTime + (Date.now() - pauseStartTime));
      setPauseStartTime(null);
      setIsPaused(false);
    } else {
      // Pause
      setPauseStartTime(Date.now());
      setIsPaused(true);
    }
  };

  const stopSession = async () => {
    const duration = elapsedTime;
    const session = {
      type: workType,
      start: sessionStart,
      duration,
      end: Date.now(),
      pausedDuration: Math.floor(pausedTime / 1000)
    };

    await addSession(session);

    setIsTracking(false);
    setIsPaused(false);
    setElapsedTime(0);
    setSessionStart(null);
    setPausedTime(0);
  };

  const handleToggleProject = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      await updateProject(projectId, { completed: !project.completed });
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-zinc-950 text-white' : 'bg-white text-black'} transition-colors pb-safe`}>
      {/* Header */}
      <div className="max-w-4xl mx-auto px-3 py-3 md:p-6">
        <div className="flex justify-between items-center mb-3 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-1">Beamo</h1>
            <p className={`text-xs md:text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>
              Deep Work & Shallow Work
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl ${darkMode ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-100 hover:bg-zinc-200'} transition-colors`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={logout}
              className={`p-2 rounded-xl ${darkMode ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-100 hover:bg-zinc-200'} transition-colors`}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Timer Card */}
        <div className={`p-4 md:p-8 rounded-2xl ${darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'} mb-3 md:mb-6`}>
          {/* Work Type Selector */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => !isTracking && setWorkType('deep')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                workType === 'deep'
                  ? 'bg-green-500 text-white'
                  : darkMode
                  ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
              } ${isTracking ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isTracking}
            >
              🧠 Deep Work
            </button>
            <button
              onClick={() => !isTracking && setWorkType('shallow')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                workType === 'shallow'
                  ? 'bg-purple-500 text-white'
                  : darkMode
                  ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
              } ${isTracking ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isTracking}
            >
              ⚡ Shallow Work
            </button>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4 md:mb-6">
            <div className="text-5xl md:text-7xl font-mono font-semibold mb-2">
              {formatDuration(elapsedTime)}
            </div>
            {isPaused && (
              <div className="text-yellow-500 text-sm">⏸️ En pause</div>
            )}
          </div>

          {/* Timer Controls */}
          <div className="flex gap-3">
            {!isTracking ? (
              <button
                onClick={startSession}
                className="flex-1 py-4 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <Play size={20} fill="currentColor" />
                Démarrer
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className={`flex-1 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'
                  }`}
                >
                  <Pause size={20} />
                  {isPaused ? 'Reprendre' : 'Pause'}
                </button>
                <button
                  onClick={stopSession}
                  className="flex-1 py-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Square size={20} fill="currentColor" />
                  Terminer
                </button>
              </>
            )}
          </div>
        </div>

        {/* Manual Session Entry */}
        <div className="mb-3 md:mb-6">
          <ManualSessionEntry darkMode={darkMode} onAddSession={addSession} projects={projects} />
        </div>

        {/* Monthly Stats */}
        <div className="mb-3 md:mb-6">
          <MonthlyStats dailyStats={dailyStats} darkMode={darkMode} />
        </div>

        {/* XP Gauge */}
        <div className="mb-3 md:mb-6">
          <XPGauge
            dailyStats={dailyStats}
            darkMode={darkMode}
          />
        </div>

        {/* Calendar 365 */}
        <div className="mb-3 md:mb-6">
          <Calendar365 dailyStats={dailyStats} darkMode={darkMode} />
        </div>

        {/* Projects */}
        <div className="mb-3 md:mb-6">
          <Projects
            projects={projects}
            sessions={sessions}
            darkMode={darkMode}
            onAddProject={addProject}
            onDeleteProject={deleteProject}
            onToggleProject={handleToggleProject}
            onUpdateProject={updateProject}
          />
        </div>

        {/* Session History */}
        <SessionHistory
          sessions={sessions}
          darkMode={darkMode}
          onDeleteSession={deleteSession}
        />
      </div>
    </div>
  );
};
