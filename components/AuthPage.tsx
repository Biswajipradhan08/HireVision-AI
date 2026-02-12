
import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import OTPVerification from './OTPVerification';

interface AuthPageProps {
  onLogin: (profile: UserProfile) => void;
}

type AuthStep = 'method' | 'form' | 'otp' | 'google-complete';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [authStep, setAuthStep] = useState<AuthStep>('method');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    education: '',
    city: ''
  });
  const [tempUser, setTempUser] = useState<UserProfile | null>(null);
  const [generatedOTP, setGeneratedOTP] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

  // Step 1: Email/Phone form -> OTP
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.number) {
      setError('Email and phone number are required');
      return;
    }

    setIsLoading(true);

    // Generate OTP
    const otp = authService.generateOTP(formData.number);
    setGeneratedOTP(otp);

    // Create temp user object
    const tempUserData: UserProfile = {
      name: formData.name || 'User',
      email: formData.email,
      number: formData.number,
      education: formData.education,
      city: formData.city,
      isAuthenticated: false,
      authMethod: 'otp',
      subscriptionPlan: 'free'
    };

    setTempUser(tempUserData);
    setAuthStep('otp');
    setIsLoading(false);
  };

  // Step 2: OTP verification -> Complete signup
  const handleOTPSuccess = (phone: string) => {
    if (!tempUser) return;

    const completedUser: UserProfile = {
      ...tempUser,
      isAuthenticated: true,
      isOTPVerified: true,
      number: phone
    };

    onLogin(completedUser);
  };

  // Step 3: Google OAuth
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setError('');

      // Decode JWT token (in production, verify on backend)
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const googleUser = JSON.parse(jsonPayload);
      const user = authService.createUserFromGoogle(googleUser);

      // Store temp user and show form to complete profile
      setTempUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        number: user.number,
        education: user.education,
        city: user.city
      });
      setAuthStep('google-complete');
    } catch (err) {
      setError('Google login failed. Please try again.');
      console.error('Google login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  // Complete Google signup with additional details
  const handleGoogleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.number) {
      setError('Phone number is required');
      return;
    }

    if (!tempUser) return;

    // Generate OTP for phone verification
    const otp = authService.generateOTP(formData.number);
    setGeneratedOTP(otp);

    const updatedUser = {
      ...tempUser,
      name: formData.name,
      education: formData.education,
      city: formData.city,
      number: formData.number
    };

    setTempUser(updatedUser);
    setAuthStep('otp');
  };

  // ============= RENDER METHODS =============

  // Method selection screen
  if (authStep === 'method') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white border border-gray-200 p-10 shadow-sm rounded-none">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tighter mb-2">HIREVISION AI</h1>
            <p className="text-gray-500 font-medium">Empowering candidates with top-graded live interviews.</p>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold mb-6">Sign Up or Log In</h2>

            {/* Google OAuth */}
            <div>
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                />
              </GoogleOAuthProvider>
            </div>

            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm uppercase tracking-widest font-bold">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Email/OTP method */}
            <button
              onClick={() => setAuthStep('form')}
              className="w-full border border-gray-900 py-3 font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              Continue with Email & OTP
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Email/Phone form
  if (authStep === 'form') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white border border-gray-200 p-10 shadow-sm rounded-none">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tighter mb-2">HIREVISION AI</h1>
          </div>

          <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Full Name</label>
              <input
                required
                type="text"
                className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Email Address</label>
              <input
                required
                type="email"
                className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Mobile Number</label>
              <input
                required
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Education</label>
              <input
                required
                type="text"
                placeholder="e.g., B.Tech in Computer Science"
                className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">City</label>
              <input
                required
                type="text"
                placeholder="e.g., Bangalore"
                className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Verify with OTP'}
            </button>
          </form>

          <button
            onClick={() => setAuthStep('method')}
            className="w-full text-center text-gray-500 hover:text-gray-700 font-medium mt-6"
          >
            ← Back to Sign In Methods
          </button>
        </div>
      </div>
    );
  }

  // OTP verification
  if (authStep === 'otp' && tempUser) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white border border-gray-200 p-10 shadow-sm rounded-none">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tighter mb-2">HIREVISION AI</h1>
          </div>

          <OTPVerification
            phone={tempUser.number}
            email={tempUser.email}
            generatedOTP={generatedOTP}
            onSuccess={handleOTPSuccess}
            onBack={() => {
              setAuthStep('form');
              setGeneratedOTP('');
            }}
          />
        </div>
      </div>
    );
  }

  // Google complete profile
  if (authStep === 'google-complete' && tempUser) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white border border-gray-200 p-10 shadow-sm rounded-none">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tighter mb-2">HIREVISION AI</h1>
          </div>

          <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
          <p className="text-gray-600 text-sm mb-6">We need a few more details to complete your signup</p>

          <form onSubmit={handleGoogleComplete} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Full Name</label>
              <input
                required
                type="text"
                className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Mobile Number</label>
              <input
                required
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Education</label>
              <input
                type="text"
                placeholder="e.g., B.Tech in Computer Science"
                className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">City</label>
              <input
                type="text"
                placeholder="e.g., Bangalore"
                className="w-full border-b border-gray-900 py-2 focus:outline-none focus:border-blue-600 font-medium"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Verify Phone with OTP'}
            </button>
          </form>

          <button
            onClick={() => setAuthStep('method')}
            className="w-full text-center text-gray-500 hover:text-gray-700 font-medium mt-6"
          >
            ← Back to Sign In Methods
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthPage;
