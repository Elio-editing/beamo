import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  setDoc,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [dailyStats, setDailyStats] = useState({});
  const [attentionLevel, setAttentionLevel] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync sessions
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/sessions`),
      orderBy('start', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data);

      // Recalculer les stats quotidiennes
      calculateDailyStats(data);
    });

    return unsubscribe;
  }, [user]);

  // Sync projects
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/projects`),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setProjects(data);
      }
    );

    return unsubscribe;
  }, [user]);

  // Sync settings
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, `users/${user.uid}`),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setAttentionLevel(data.attentionLevel || 100);
          setDarkMode(data.darkMode || false);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Calculate daily stats from sessions
  const calculateDailyStats = (allSessions) => {
    const stats = {};

    const sessionsByDay = {};
    allSessions.forEach(session => {
      const date = new Date(session.start);
      const dateKey = date.toISOString().split('T')[0];
      if (!sessionsByDay[dateKey]) {
        sessionsByDay[dateKey] = [];
      }
      sessionsByDay[dateKey].push(session);
    });

    Object.keys(sessionsByDay).forEach(dateKey => {
      const daySessions = sessionsByDay[dateKey];
      const deepTotal = daySessions
        .filter(s => s.type === 'deep')
        .reduce((sum, s) => sum + s.duration, 0) / 3600;
      const shallowTotal = daySessions
        .filter(s => s.type === 'shallow')
        .reduce((sum, s) => sum + s.duration, 0) / 3600;

      stats[dateKey] = {
        deep: deepTotal,
        shallow: shallowTotal,
        total: deepTotal + shallowTotal
      };
    });

    setDailyStats(stats);
  };

  // Add session
  const addSession = async (session) => {
    await addDoc(collection(db, `users/${user.uid}/sessions`), {
      ...session,
      start: session.start || Date.now(),
      createdAt: Date.now()
    });
  };

  // Update session
  const updateSession = async (id, updates) => {
    await updateDoc(doc(db, `users/${user.uid}/sessions`, id), updates);
  };

  // Delete session
  const deleteSession = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/sessions`, id));
  };

  // Add project
  const addProject = async (project) => {
    await addDoc(collection(db, `users/${user.uid}/projects`), {
      ...project,
      createdAt: Date.now()
    });
  };

  // Update project
  const updateProject = async (id, updates) => {
    await updateDoc(doc(db, `users/${user.uid}/projects`, id), updates);
  };

  // Delete project
  const deleteProject = async (id) => {
    await deleteDoc(doc(db, `users/${user.uid}/projects`, id));
  };

  // Update settings
  const updateSettings = async (updates) => {
    await setDoc(doc(db, `users/${user.uid}`), updates, { merge: true });
  };

  // Toggle dark mode
  const toggleDarkMode = async () => {
    await updateSettings({ darkMode: !darkMode });
  };

  // Update attention level
  const updateAttentionLevel = async (level) => {
    await updateSettings({ attentionLevel: level });
  };

  const value = {
    sessions,
    projects,
    dailyStats,
    attentionLevel,
    darkMode,
    loading,
    addSession,
    updateSession,
    deleteSession,
    addProject,
    updateProject,
    deleteProject,
    toggleDarkMode,
    updateAttentionLevel
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
