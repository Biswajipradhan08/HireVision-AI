
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InterviewSession } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface ReportViewProps {
  sessions: InterviewSession[];
}

const ReportView: React.FC<ReportViewProps> = ({ sessions }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = sessions.find(s => s.id === id);

  if (!session) {
    return <div className="p-20 text-center">Session not found.</div>;
  }

  const data = [
    { name: 'Technical', value: 85 },
    { name: 'Communication', value: 70 },
    { name: 'Behavioral', value: 90 },
    { name: 'JD Alignment', value: 82 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12 flex justify-between items-start">
        <div>
          <button onClick={() => navigate('/dashboard')} className="text-xs font-bold uppercase tracking-widest mb-6 hover:underline flex items-center gap-2">
            ← Dashboard
          </button>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Evaluation Report</h1>
          <p className="text-gray-500 font-bold uppercase text-sm tracking-widest">{session.company} | {session.role}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Overall Score</span>
          <div className="text-7xl font-black">{session.score}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="bg-gray-50 p-8 border border-gray-100">
          <h2 className="text-lg font-black uppercase tracking-widest mb-8">Performance Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{fontWeight: 'bold', fontSize: 12, fill: '#000'}} />
                <Tooltip />
                <Bar dataKey="value" fill="#000" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-l-4 border-black pl-3">Expert Verdict</h3>
            <p className="text-lg font-medium leading-relaxed italic">
              "{session.feedback}"
            </p>
          </section>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-black p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Status</span>
              <span className="text-xl font-bold uppercase">Strong Hire</span>
            </div>
            <div className="border border-black p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Rank</span>
              <span className="text-xl font-bold uppercase">Top 10%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 border-b-2 border-black pb-2 inline-block">Detailed Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="font-black uppercase text-xs tracking-widest text-green-600">What went well</h4>
              <ul className="text-sm font-medium space-y-3">
                <li>• Excellent grasp of core data structures.</li>
                <li>• Structured thinking during problem-solving.</li>
                <li>• High energy and positive professional tone.</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black uppercase text-xs tracking-widest text-red-600">Areas of Improvement</h4>
              <ul className="text-sm font-medium space-y-3">
                <li>• Behavioral answers lack specific ROI-based metrics.</li>
                <li>• Tended to speak over the interviewer twice.</li>
                <li>• Need more depth in system design constraints.</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black uppercase text-xs tracking-widest text-blue-600">Action Plan</h4>
              <ul className="text-sm font-medium space-y-3">
                <li>• Practice the STAR method for soft skills.</li>
                <li>• Review CAP theorem and database sharding.</li>
                <li>• Record one more session focusing on brevity.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Ready for the real deal?</h2>
            <p className="text-gray-400 mb-8 font-medium">Your score suggests you are ready for a Google interview. We recommend 2 more manager-level sessions before your actual interview.</p>
            <button 
              onClick={() => navigate('/setup')}
              className="bg-white text-black px-10 py-4 font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
            >
              Start Next Round
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportView;
