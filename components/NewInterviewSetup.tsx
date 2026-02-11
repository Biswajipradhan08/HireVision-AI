
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, InterviewSession, InterviewRound } from '../types';
import { COMPANIES, ROLES, INTERVIEW_ROUNDS } from '../constants';

interface NewInterviewSetupProps {
  user: UserProfile;
  onStart: (session: InterviewSession) => void;
}

const NewInterviewSetup: React.FC<NewInterviewSetupProps> = ({ onStart }) => {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [company, setCompany] = useState(COMPANIES[0]);
  const [role, setRole] = useState(ROLES[0]);
  const [round, setRound] = useState<InterviewRound>('HR Screening');

  const handleStart = (action: 'analysis' | 'interview') => {
    if (!resumeFile) {
      alert("Resume is mandatory to start.");
      return;
    }

    const session: InterviewSession = {
      id: Math.random().toString(36).substr(2, 9),
      company,
      role,
      round,
      date: new Date().toLocaleDateString(),
      status: 'pending',
      resumeText: "Resume Text Mock...", // In a real app, extract text from PDF
      jdText
    };

    onStart(session);
    if (action === 'analysis') {
      navigate('/analysis');
    } else {
      navigate('/interview');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12">
        <button onClick={() => navigate('/dashboard')} className="text-xs font-bold uppercase tracking-widest mb-6 hover:underline flex items-center gap-2">
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-black tracking-tighter uppercase">Interview Config</h1>
      </header>

      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-3">Company</label>
            <select 
              className="w-full border border-gray-900 p-4 font-bold appearance-none bg-white rounded-none focus:bg-gray-50 outline-none"
              value={company}
              onChange={e => setCompany(e.target.value)}
            >
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-3">Role</label>
            <select 
              className="w-full border border-gray-900 p-4 font-bold appearance-none bg-white rounded-none focus:bg-gray-50 outline-none"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-3">Interview Round</label>
          <div className="flex flex-wrap gap-3">
            {INTERVIEW_ROUNDS.map(r => (
              <button
                key={r}
                onClick={() => setRound(r as InterviewRound)}
                className={`px-6 py-3 text-xs font-black uppercase tracking-widest border transition-all ${round === r ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-10">
          <label className="block text-xs font-black uppercase tracking-widest mb-3">Upload Resume (Mandatory)</label>
          <div className={`relative border-2 border-dashed p-10 text-center transition-colors ${resumeFile ? 'bg-gray-50 border-black' : 'border-gray-300'}`}>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={e => setResumeFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx"
            />
            {resumeFile ? (
              <div>
                <span className="font-bold text-lg">{resumeFile.name}</span>
                <p className="text-gray-400 text-xs mt-2 uppercase font-bold">Click to replace</p>
              </div>
            ) : (
              <div>
                <p className="font-bold mb-1">Select Resume File</p>
                <p className="text-gray-400 text-xs uppercase font-bold">PDF, DOCX up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-3">Job Description (Optional)</label>
          <textarea 
            className="w-full border border-gray-900 p-6 font-medium h-48 focus:bg-gray-50 outline-none resize-none"
            placeholder="Paste the JD here for precise analysis..."
            value={jdText}
            onChange={e => setJdText(e.target.value)}
          />
        </div>

        <div className="flex gap-4 pt-6">
          <button 
            onClick={() => handleStart('analysis')}
            className="flex-1 border-2 border-black py-4 font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Am I a Good Fit?
          </button>
          <button 
            onClick={() => handleStart('interview')}
            className="flex-1 bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewInterviewSetup;
