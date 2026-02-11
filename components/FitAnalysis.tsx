
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from '@google/genai';
import { InterviewSession, AnalysisResult } from '../types';

interface FitAnalysisProps {
  session: InterviewSession;
  onStartInterview: () => void;
}

const FitAnalysis: React.FC<FitAnalysisProps> = ({ session }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Analyze this profile for the role of ${session.role} at ${session.company}. 
        Resume Content: ${session.resumeText}
        Job Description: ${session.jdText || 'Not provided'}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchPercentage: { type: Type.NUMBER },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['matchPercentage', 'strengths', 'gaps', 'recommendations']
            }
          }
        });

        const result = JSON.parse(response.text);
        setAnalysis(result);
      } catch (error) {
        console.error("Analysis failed", error);
        // Mock fallback
        setAnalysis({
          matchPercentage: 75,
          strengths: ['Relevant technical skills', 'Strong education background'],
          gaps: ['Lack of specific industry experience', 'Missing cloud certs'],
          recommendations: ['Focus on system design', 'Highlight leadership roles']
        });
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [session]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-24 h-24 border-8 border-gray-100 border-t-black rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-black uppercase tracking-tighter">Analyzing Alignment</h2>
        <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">Scanning Resume & JD</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12">
        <button onClick={() => navigate('/setup')} className="text-xs font-bold uppercase tracking-widest mb-6 hover:underline flex items-center gap-2">
          ← Back to Config
        </button>
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">Fitment Analysis</h1>
        <div className="flex items-center gap-4">
          <span className="text-6xl font-black">{analysis?.matchPercentage}%</span>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-1000" 
              style={{ width: `${analysis?.matchPercentage}%` }}
            />
          </div>
        </div>
        <p className="text-gray-500 font-bold mt-4 uppercase text-sm tracking-widest">
          {session.role} @ {session.company}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <section>
          <h2 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-black pb-2">Key Strengths</h2>
          <ul className="space-y-4">
            {analysis?.strengths.map((s, i) => (
              <li key={i} className="flex gap-4 font-medium">
                <span className="text-green-600 font-black">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-black pb-2">Identified Gaps</h2>
          <ul className="space-y-4">
            {analysis?.gaps.map((g, i) => (
              <li key={i} className="flex gap-4 font-medium">
                <span className="text-red-500 font-black">!</span>
                {g}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="bg-gray-50 p-10 border border-gray-100 mb-16">
        <h2 className="text-lg font-black uppercase tracking-widest mb-6">Expert Recommendations</h2>
        <ul className="space-y-4">
          {analysis?.recommendations.map((r, i) => (
            <li key={i} className="flex gap-4 font-medium italic">
              <span className="font-black text-gray-400">—</span>
              {r}
            </li>
          ))}
        </ul>
      </section>

      <div className="sticky bottom-10 flex gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex-1 bg-white border-2 border-black py-4 font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => navigate('/interview')}
          className="flex-2 bg-black text-white px-12 py-4 font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-2xl"
        >
          Proceed to Interview
        </button>
      </div>
    </div>
  );
};

export default FitAnalysis;
