
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AuthPageProps {
  onLogin: (profile: UserProfile) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    education: '',
    city: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Authentication Logic
    onLogin({
      ...formData,
      isAuthenticated: true
    });
  };

  const handleGoogleLogin = () => {
    // Simulate Google OAuth
    onLogin({
      name: 'John Doe',
      email: 'john.doe@google.com',
      number: '+91 98765 43210',
      education: 'B.Tech in Computer Science',
      city: 'Bangalore',
      isAuthenticated: true
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white border border-gray-200 p-10 shadow-sm rounded-none">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tighter mb-2">HIREVISION AI</h1>
          <p className="text-gray-500 font-medium">Empowering candidates with Top-graded live interview.</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-900 py-3 font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm uppercase tracking-widest font-bold">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Mobile Number</label>
                <input 
                  required
                  type="tel" 
                  className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium" 
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Education</label>
                <input 
                  required
                  type="text" 
                  className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium" 
                  value={formData.education}
                  onChange={e => setFormData({...formData, education: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">City</label>
                <input 
                  required
                  type="text" 
                  className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-black text-white py-4 font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors mt-4"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold underline decoration-2 underline-offset-4"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
