
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, InterviewSession } from '../types';

interface DashboardProps {
  user: UserProfile;
  sessions: InterviewSession[];
  onLogout: () => void;
  onNewInterview: (session: InterviewSession) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, sessions, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="flex justify-between items-end mb-16 border-b border-gray-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold tracking-tighter uppercase">Dashboard</h1>
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-[10px] font-black text-green-700 uppercase tracking-tighter border border-green-200 rounded">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              DBMS Cloud Synced
            </span>
          </div>
          <p className="text-gray-500 font-medium">Welcome back, <span className="text-black font-bold">{user.name}</span></p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/setup')}
            className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            New Interview
          </button>
          <button 
            onClick={onLogout}
            className="border border-gray-300 px-6 py-3 font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        <div className="bg-gray-50 p-8 border border-gray-100">
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Interviews Conducted</span>
          <span className="text-5xl font-black">{sessions.length}</span>
        </div>
        <div className="bg-gray-50 p-8 border border-gray-100">
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Average Score</span>
          <span className="text-5xl font-black">
            {sessions.length > 0 ? (sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length).toFixed(1) : '--'}
          </span>
        </div>
        <div className="bg-gray-50 p-8 border border-gray-100">
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Next Milestone</span>
          <span className="text-xl font-bold uppercase">Technical Pro</span>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-xl font-black uppercase tracking-widest border-l-4 border-black pl-4">Interview Backlog</h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Backing up to HireVision DBMS</span>
        </div>
        
        {sessions.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 p-20 text-center">
            <p className="text-gray-400 font-medium mb-6">No interview history found.</p>
            <button 
              onClick={() => navigate('/setup')}
              className="text-black font-bold underline decoration-2 underline-offset-4"
            >
              Start your first session
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="group border border-gray-200 p-6 flex justify-between items-center hover:border-black transition-colors cursor-pointer"
                onClick={() => navigate(`/report/${session.id}`)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-black uppercase tracking-tighter">{session.company}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500 font-medium">{session.role}</span>
                  </div>
                  <h3 className="text-xl font-bold">{session.round}</h3>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-gray-400 uppercase mb-1">{session.date}</span>
                  <div className="flex items-center gap-2">
                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${session.status === 'completed' ? 'bg-black text-white' : 'bg-gray-100'}`}>
                      {session.status}
                    </span>
                    {session.lastSynced && <span title="Backed up to DBMS" className="text-green-500 text-[10px] font-black tracking-tighter uppercase">Cloud ✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
