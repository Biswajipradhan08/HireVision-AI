# HireVision AI - Authentication & Payment Setup Guide

This guide covers the setup for Google OAuth, OTP authentication, and Cashfree payment integration.

## Prerequisites

- Node.js (v18+)
- npm or yarn
- API keys for:
  - Google OAuth
  - Google Gemini API
  - Cashfree Payment Gateway

---

## 1. Google OAuth Setup

### Getting Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web Application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - `https://yourdomain.com` (for production)
7. Add authorized redirect URIs:
   - `http://localhost:3000/callback` (for local development)
   - `https://yourdomain.com/callback` (for production)
8. Copy your **Client ID**

### Add to .env.local

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

---

## 2. OTP Authentication

### Overview

The OTP system uses phone number verification:
- User enters phone number during signup
- OTP is generated (10 minutes validity)
- User receives OTP (SMS integration needed for production)
- OTP is verified and user is authenticated

### Implementation Details

**File:** `services/authService.ts`

Key functions:
- `generateOTP(phone)` - Generate and store OTP
- `verifyOTP(phone, otp)` - Verify OTP
- `getOTPRemainingTime(phone)` - Get remaining OTP validity

### Production Deployment

For SMS delivery, integrate with:
- **Twilio** - Most popular SMS service
- **AWS SNS** - AWS SMS service
- **Custom SMS Provider** (local/regional)

**Integration point:** Modify `authService.ts` `generateOTP()` function to send SMS

Example (Twilio):
```typescript
// In generateOTP function, add:
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
await client.messages.create({
  body: `Your HireVision OTP: ${otp}`,
  from: TWILIO_PHONE_NUMBER,
  to: phone
});
```

### Development Mode

In development, the OTP is displayed in the UI for testing purposes.

---

## 3. Cashfree Payment Integration

### Getting Cashfree Credentials

1. Go to [Cashfree Dashboard](https://dashboard.cashfree.com)
2. Create a merchant account (if not already created)
3. Navigate to **Settings** → **API Keys**
4. Copy your:
   - **App ID** (Client ID)
   - **Secret Key** (API Secret)

### Add to .env.local

```env
VITE_CASHFREE_APP_ID=your_app_id_here
VITE_CASHFREE_SECRET_KEY=your_secret_key_here
```

### Payment Plan Details

**Premium Plan:**
- Price: ₹299 (customizable)
- Duration: 30 days
- Features:
  - Unlimited interviews
  - Advanced analytics
  - Priority support

### Integration Architecture

```
Client (React)
    ↓
Create Payment Order
    ↓
Cashfree Payment Modal
    ↓
Payment Processing
    ↓
Webhook Verification (Backend)
    ↓
Update User Subscription
```

### Production Setup

**Files involved:**
- `services/paymentService.ts` - Payment logic
- `components/PaymentModal.tsx` - UI component
- Backend webhook handler (needs to be created)

**Steps for production:**

1. **Backend Webhook Setup**
   - Create an endpoint to receive Cashfree webhooks
   - Verify webhook signature
   - Update user subscription status
   - Send payment confirmation email

2. **Environment Configuration on Vercel**
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_CASHFREE_APP_ID`
     - `VITE_CASHFREE_SECRET_KEY`
     - Backend URL for webhooks

3. **Cashfree Dashboard Configuration**
   - Set webhook URL: `https://yourdomain.com/api/payment-webhook`
   - Enable webhook notifications for:
     - `PAYMENT_SUCCESS`
     - `PAYMENT_FAILED`

### Test Credentials

Cashfree provides test credentials for development:
- Use test app credentials from dashboard
- Test payment cards provided in documentation

---

## 4. Local Development Setup

### Install Dependencies

```bash
npm install
```

### Create .env.local

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_CASHFREE_APP_ID=your_cashfree_app_id
VITE_CASHFREE_SECRET_KEY=your_cashfree_secret_key
```

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`

### Testing Authentication Flow

1. **Email + OTP:**
   - Enter email and phone
   - Submit
   - OTP displayed in dev mode
   - Enter OTP to complete verification

2. **Google OAuth:**
   - Click "Continue with Google"
   - Sign in with Google account
   - Complete additional profile fields
   - Verify phone with OTP

3. **Premium Upgrade:**
   - Click upgrade button on dashboard
   - Review plan details
   - Complete payment (test mode)

---

## 5. Vercel Deployment

### Setup Steps

1. Push code to GitHub
2. Connect GitHub repository to Vercel
3. Add environment variables in Vercel settings:
   ```
   VITE_GOOGLE_CLIENT_ID
   VITE_GEMINI_API_KEY
   VITE_CASHFREE_APP_ID
   VITE_CASHFREE_SECRET_KEY
   ```
4. Deploy

### Post-Deployment

1. Update Google OAuth authorized origins to include your Vercel domain
2. Update Cashfree webhook configuration with your backend URL
3. Test complete auth flow in production

---

## 6. Component Overview

### Authentication Components

- **AuthPage.tsx** - Main authentication page with Google OAuth and Email/OTP options
- **OTPVerification.tsx** - OTP input and verification component
- **PaymentModal.tsx** - Premium upgrade modal with Cashfree integration

### Authentication Services

- **authService.ts**
  - Google OAuth user creation
  - OTP generation and verification
  - Subscription management

- **paymentService.ts**
  - Payment order creation
  - Cashfree integration
  - Payment verification

---

## 7. Database Schema (After Authentication)

### UserProfile Structure

```typescript
{
  id: string;              // Generated UUID
  name: string;
  email: string;
  number: string;          // Phone number
  education: string;
  city: string;
  isAuthenticated: boolean;
  photoURL?: string;       // Google profile picture
  authMethod: 'email' | 'google' | 'otp';
  subscriptionPlan: 'free' | 'premium';
  subscriptionExpiresAt?: string; // ISO date
  isOTPVerified?: boolean;
}
```

---

## 8. Key Security Considerations

1. **OTP Security**
   - 6-digit OTP with 10-minute expiry
   - Max 5 verification attempts
   - Database backups for audit trail

2. **Google OAuth**
   - Use secure OAuth flow
   - Validate JWT token on backend
   - Store encrypted tokens if needed

3. **Payment Security**
   - Never expose Cashfree secret key in frontend
   - Always verify payments on backend via webhook
   - Use HTTPS for all payment transactions
   - Implement webhook signature verification

4. **Data Protection**
   - Store sensitive data encrypted
   - Use environment variables for secrets
   - Regular security audits recommended

---

## 9. Troubleshooting

### Google OAuth Not Working

- Verify Client ID in `.env.local`
- Check authorized origins in Google Cloud Console
- Clear browser cookies and cache
- Ensure `@react-oauth/google` is installed

### OTP Not Sending (Production)

- Check SMS service integration
- Verify phone number format
- Check API credentials for SMS provider
- Review SMS service logs

### Payment Failed

- Verify Cashfree credentials
- Check internet connection
- Ensure amount is valid (> 0)
- Review Cashfree dashboard for errors

### Environment Variables Not Loading

- Restart dev server after modifying `.env.local`
- Check variable names (must start with `VITE_`)
- Ensure proper quotes in `.env.local`

---

## 10. Support & Resources

- [Google OAuth Documentation](https://developers.google.com/identity)
- [Cashfree Payment Documentation](https://docs.cashfree.com)
- [React OAuth Library](https://www.npmjs.com/package/@react-oauth/google)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)

---

## FAQ

**Q: Can I use a different SMS provider?**
A: Yes, modify `authService.ts` to integrate any SMS provider (Twilio, AWS SNS, etc.)

**Q: How do I test payment without actually charging?**
A: Use Cashfree's test credentials and test payment methods provided in their documentation.

**Q: Can users have both Google and Email accounts?**
A: Currently, the system creates one account per email. You can enhance this to link multiple auth methods.

**Q: How long is the premium subscription valid?**
A: Default is 30 days. Customize in `paymentService.ts` `getPremiumPlanDuration()`

---

For more information or issues, please refer to the main README.md or create an issue on GitHub.
