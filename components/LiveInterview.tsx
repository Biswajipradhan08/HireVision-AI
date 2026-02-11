
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { InterviewSession, TranscriptionItem } from '../types';

interface LiveInterviewProps {
  session: InterviewSession;
  onComplete: (session: InterviewSession) => void;
}

const LiveInterview: React.FC<LiveInterviewProps> = ({ session, onComplete }) => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const transcriptionRef = useRef<string>('');
  const userTranscriptionRef = useRef<string>('');

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsLive(false);
  }, []);

  const handleEndInterview = () => {
    stopSession();
    const updatedSession: InterviewSession = {
      ...session,
      status: 'completed',
      score: 82, // Simulated score
      feedback: "Great performance. Focused well on technical fundamentals but could improve behavioral responses."
    };
    onComplete(updatedSession);
    navigate(`/report/${session.id}`);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are a high-level senior recruiter from ${session.company}. 
          You are conducting a ${session.round} for a ${session.role} position. 
          Use the following resume for context: ${session.resumeText}. 
          If a JD is provided, use it: ${session.jdText}. 
          Be professional, rigorous, and follow up on candidate's specific answers. 
          Analyze emotion and prosody to adjust your tone.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Process Transcription
            if (msg.serverContent?.outputTranscription) {
              transcriptionRef.current += msg.serverContent.outputTranscription.text;
            } else if (msg.serverContent?.inputTranscription) {
              userTranscriptionRef.current += msg.serverContent.inputTranscription.text;
            }

            if (msg.serverContent?.turnComplete) {
               if (userTranscriptionRef.current) {
                 setTranscription(prev => [...prev, { speaker: 'Candidate', text: userTranscriptionRef.current, timestamp: Date.now() }]);
                 userTranscriptionRef.current = '';
               }
               if (transcriptionRef.current) {
                setTranscription(prev => [...prev, { speaker: 'Interviewer', text: transcriptionRef.current, timestamp: Date.now() }]);
                transcriptionRef.current = '';
               }
            }

            // Process Audio
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            setError("Connection lost. Please try again.");
          },
          onclose: () => {
            setIsLive(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Microphone access denied or API error.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Live Session</h2>
          <p className="text-xl font-bold">{session.company} — {session.role}</p>
        </div>
        <button 
          onClick={handleEndInterview}
          className="bg-black text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
        >
          End & Submit
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-12 relative">
          <div className={`w-64 h-64 rounded-full siri-orb flex items-center justify-center transition-all duration-500 ${isLive ? 'scale-110' : 'grayscale opacity-50'}`}>
            <div className="w-48 h-48 rounded-full border-4 border-white/20 animate-pulse"></div>
          </div>
          
          <div className="mt-12 text-center">
            {isLive ? (
              <p className="text-xl font-black uppercase tracking-widest animate-pulse">Listening...</p>
            ) : (
              <button 
                onClick={startSession}
                className="bg-black text-white px-12 py-5 font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl"
              >
                Initiate Interview
              </button>
            )}
            {error && <p className="mt-4 text-red-500 font-bold uppercase text-xs">{error}</p>}
          </div>
        </div>

        <div className="w-full md:w-96 border-l border-gray-100 bg-gray-50 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xs font-black uppercase tracking-widest">Live Transcript</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {transcription.map((t, i) => (
              <div key={i} className={`flex flex-col ${t.speaker === 'Candidate' ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest mb-1 text-gray-400">{t.speaker}</span>
                <p className={`p-4 text-sm font-medium ${t.speaker === 'Candidate' ? 'bg-black text-white rounded-l-2xl rounded-tr-2xl' : 'bg-white border border-gray-200 rounded-r-2xl rounded-tl-2xl'}`}>
                  {t.text}
                </p>
              </div>
            ))}
            {transcription.length === 0 && (
              <div className="text-center mt-20 text-gray-400">
                <p className="text-xs font-bold uppercase tracking-widest">Transcript will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="p-4 bg-gray-900 text-white text-[10px] uppercase font-black tracking-widest text-center">
        Powered by Google Gemini 2.5 Flash Native Audio
      </footer>
    </div>
  );
};

export default LiveInterview;
