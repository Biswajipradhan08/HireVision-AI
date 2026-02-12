import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface OTPVerificationProps {
  phone: string;
  email: string;
  onSuccess: (phone: string) => void;
  onBack: () => void;
  generatedOTP?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  phone,
  email,
  onSuccess,
  onBack,
  generatedOTP
}) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [remainingTime, setRemainingTime] = useState(600); // 10 minutes
  const [showOTP, setShowOTP] = useState(!!generatedOTP); // Show OTP in dev mode

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = authService.getOTPRemainingTime(phone);
      if (remaining === null) {
        setRemainingTime(0);
        setError('OTP expired. Please request a new one.');
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phone]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setIsVerifying(false);
      return;
    }

    const isValid = authService.verifyOTP(phone, otp);
    
    if (isValid) {
      onSuccess(phone);
    } else {
      setError('Invalid OTP. Please try again.');
      setOtp('');
    }
    
    setIsVerifying(false);
  };

  const handleResendOTP = () => {
    const newOTP = authService.generateOTP(phone);
    setShowOTP(true);
    setOtp('');
    setError('');
    console.log('New OTP sent to', phone);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Verify Your Phone</h2>
        <p className="text-gray-600">
          We've sent a 6-digit OTP to <strong>{phone}</strong>
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Enter OTP</label>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
            }}
            className="w-full px-4 py-3 border border-gray-900 text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-gray-900"
            disabled={isVerifying}
          />
        </div>

        {/* Development: Show OTP for testing */}
        {showOTP && generatedOTP && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm">
            <p className="text-yellow-800">
              <strong>Dev Mode - OTP:</strong> {generatedOTP}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="text-sm text-gray-600 text-center">
          OTP expires in: <strong>{formatTime(remainingTime)}</strong>
        </div>

        <button
          type="submit"
          disabled={isVerifying || remainingTime === 0}
          className="w-full bg-gray-900 text-white py-3 font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
        <button
          onClick={handleResendOTP}
          disabled={remainingTime > 540} // Allow resend only after 1 minute
          className="w-full text-center text-gray-700 hover:text-gray-900 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Resend OTP
        </button>

        <button
          onClick={onBack}
          className="w-full text-center text-gray-500 hover:text-gray-700 text-sm"
        >
          Back to Sign Up
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
