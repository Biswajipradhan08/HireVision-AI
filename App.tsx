
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import NewInterviewSetup from './components/NewInterviewSetup';
import FitAnalysis from './components/FitAnalysis';
import LiveInterview from './components/LiveInterview';
import ReportView from './components/ReportView';
import { UserProfile, InterviewSession } from './types';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);

  // Initial Load from DBMS (Backup)
  useEffect(() => {
    const initApp = async () => {
      const [storedUser, storedSessions] = await Promise.all([
        dbService.getUser(),
        dbService.getSessions()
      ]);
      setUser(storedUser);
      setSessions(storedSessions);
      setIsLoading(false);
    };
    initApp();
  }, []);

  const handleLogin = async (profile: UserProfile) => {
    setUser(profile);
    await dbService.saveUser(profile);
  };

  const handleLogout = async () => {
    setUser(null);
    setSessions([]);
    await dbService.clearAll();
  };

  const startNewInterview = (session: InterviewSession) => {
    setCurrentSession(session);
  };

  const updateSession = async (updatedSession: InterviewSession) => {
    // Update local state for immediate UI feedback
    setSessions(prev => {
      const index = prev.findIndex(s => s.id === updatedSession.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = updatedSession;
        return next;
      }
      return [updatedSession, ...prev];
    });
    
    // Backup to DBMS
    await dbService.saveSession(updatedSession);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-black uppercase tracking-widest">Restoring Cloud Backup...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} sessions={sessions} onLogout={handleLogout} onNewInterview={startNewInterview} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/setup" 
            element={user ? <NewInterviewSetup user={user} onStart={startNewInterview} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/analysis" 
            element={user && currentSession ? <FitAnalysis session={currentSession} onStartInterview={() => {}} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/interview" 
            element={user && currentSession ? <LiveInterview session={currentSession} onComplete={updateSession} /> : <Navigate to="/dashboard" />} 
          />
           <Route 
            path="/report/:id" 
            element={user ? <ReportView sessions={sessions} /> : <Navigate to="/dashboard" />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
