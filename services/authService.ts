import { UserProfile, OTPVerification } from '../types';
import { v4 as uuidv4 } from 'uuid';

const OTP_KEY_PREFIX = 'hirevision_otp_';
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

/**
 * Authentication Service
 * Handles Google OAuth, OTP generation, verification, and session management
 */
export const authService = {
  /**
   * Generate OTP - In production, this would be sent via SMS
   * For demo, it returns the OTP for testing
   */
  generateOTP(phone: string): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const otpData: OTPVerification = {
      phone,
      otp,
      attempts: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_TIME).toISOString()
    };
    
    localStorage.setItem(OTP_KEY_PREFIX + phone, JSON.stringify(otpData));
    
    // In production, send OTP via SMS here
    console.log(`[OTP] Generated OTP for ${phone}: ${otp}`);
    
    return otp; // For demo purposes - remove in production
  },

  /**
   * Verify OTP
   */
  verifyOTP(phone: string, otp: string): boolean {
    const storedOtpJson = localStorage.getItem(OTP_KEY_PREFIX + phone);
    
    if (!storedOtpJson) {
      return false;
    }
    
    const storedOtp: OTPVerification = JSON.parse(storedOtpJson);
    
    // Check if OTP has expired
    if (new Date(storedOtp.expiresAt) < new Date()) {
      localStorage.removeItem(OTP_KEY_PREFIX + phone);
      return false;
    }
    
    // Check attempts
    if (storedOtp.attempts >= MAX_OTP_ATTEMPTS) {
      localStorage.removeItem(OTP_KEY_PREFIX + phone);
      return false;
    }
    
    // Verify OTP
    if (storedOtp.otp === otp) {
      localStorage.removeItem(OTP_KEY_PREFIX + phone);
      return true;
    }
    
    // Increment attempts
    storedOtp.attempts++;
    localStorage.setItem(OTP_KEY_PREFIX + phone, JSON.stringify(storedOtp));
    
    return false;
  },

  /**
   * Get remaining time for OTP (in seconds)
   */
  getOTPRemainingTime(phone: string): number | null {
    const storedOtpJson = localStorage.getItem(OTP_KEY_PREFIX + phone);
    
    if (!storedOtpJson) {
      return null;
    }
    
    const storedOtp: OTPVerification = JSON.parse(storedOtpJson);
    const expiresAt = new Date(storedOtp.expiresAt);
    const now = new Date();
    
    const diff = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
    
    return diff > 0 ? diff : null;
  },

  /**
   * Create user from email and OTP verification
   */
  createUserFromEmail(email: string, phone: string, name: string, education: string, city: string): UserProfile {
    return {
      id: uuidv4(),
      name,
      email,
      number: phone,
      education,
      city,
      isAuthenticated: true,
      authMethod: 'otp',
      isOTPVerified: true,
      subscriptionPlan: 'free'
    };
  },

  /**
   * Create user from Google OAuth
   */
  createUserFromGoogle(googleUser: any): UserProfile {
    return {
      id: uuidv4(),
      name: googleUser.name || '',
      email: googleUser.email || '',
      number: '', // Will be filled in next step
      education: '',
      city: '',
      isAuthenticated: true,
      authMethod: 'google',
      photoURL: googleUser.picture || '',
      subscriptionPlan: 'free'
    };
  },

  /**
   * Update user with OTP
   */
  updateUserWithOTP(user: UserProfile, phone: string): UserProfile {
    return {
      ...user,
      number: phone,
      isOTPVerified: true,
      authMethod: 'otp'
    };
  },

  /**
   * Check if subscription is still valid
   */
  isSubscriptionActive(user: UserProfile): boolean {
    if (!user.subscriptionExpiresAt || user.subscriptionPlan === 'free') {
      return false;
    }
    
    return new Date(user.subscriptionExpiresAt) > new Date();
  },

  /**
   * Get subscription remaining days
   */
  getSubscriptionRemainingDays(user: UserProfile): number {
    if (!user.subscriptionExpiresAt) {
      return 0;
    }
    
    const diff = new Date(user.subscriptionExpiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
};
