// Format duration in seconds to HH:MM:SS
export const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Format hours (1.5 -> "1h30")
export const formatHours = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
};

// Get today's date key
export const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};

// Get date key from timestamp
export const getDateKey = (timestamp) => {
  return new Date(timestamp).toISOString().split('T')[0];
};

// Get sessions for a specific date
export const getSessionsForDate = (sessions, dateKey) => {
  return sessions.filter(s => getDateKey(s.start) === dateKey);
};

// Get today's sessions
export const getTodaySessions = (sessions) => {
  return getSessionsForDate(sessions, getTodayKey());
};

// Calculate total hours for sessions
export const calculateTotalHours = (sessions) => {
  return sessions.reduce((sum, s) => sum + s.duration, 0) / 3600;
};

// Get last 365 days
export const getLast365Days = () => {
  const days = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }

  return days;
};

// Get color for heatmap based on hours (rouge → jaune, optimal à 7h deep OU 10h total)
export const getHeatmapColor = (hours, darkMode = true, deepHours = 0) => {
  // Optimal si 7h+ de deep work OU 10h+ total (très difficile)
  if (deepHours >= 7 || hours >= 10) {
    return darkMode ? '#fde047' : '#fef08a'; // Jaune vif clair style Vox - optimal
  }

  if (hours === 0) return darkMode ? '#27272a' : '#e4e4e7'; // Gris - pas de travail
  if (hours < 3) return darkMode ? '#991b1b' : '#fca5a5'; // Rouge foncé - très insuffisant
  if (hours < 4.5) return darkMode ? '#dc2626' : '#f87171'; // Rouge - insuffisant
  if (hours < 6.5) return darkMode ? '#ea580c' : '#fb923c'; // Orange vif - moyen
  return darkMode ? '#eab308' : '#facc15'; // Jaune citron - bon (bien visible vs orange)
};
