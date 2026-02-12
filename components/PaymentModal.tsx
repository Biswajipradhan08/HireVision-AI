import React, { useState } from 'react';
import { UserProfile } from '../types';
import { paymentService } from '../services/paymentService';
import { authService } from '../services/authService';

interface PaymentModalProps {
  user: UserProfile;
  onClose: () => void;
  onPaymentSuccess: (user: UserProfile) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ user, onClose, onPaymentSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'plan' | 'payment'>('plan');

  const premiumPrice = paymentService.getPremiumPlanPrice();
  const duration = paymentService.getPremiumPlanDuration();

  const handleUpgradeToPremium = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Create payment order
      const order = await paymentService.createPaymentOrder(
        user.id || user.email,
        premiumPrice,
        'premium'
      );

      // In production, initiate Cashfree payment here
      // const paymentSession = await paymentService.initiatePayment(order);
      
      // For demo: simulate successful payment after 2 seconds
      setTimeout(async () => {
        await paymentService.updatePaymentStatus(order.orderId, 'success');
        
        // Update user subscription
        const updatedUser: UserProfile = {
          ...user,
          subscriptionPlan: 'premium',
          subscriptionExpiresAt: new Date(
            Date.now() + duration * 24 * 60 * 60 * 1000
          ).toISOString()
        };

        onPaymentSuccess(updatedUser);
        
        // Close modal
        setTimeout(onClose, 500);
      }, 2000);

      setStep('payment');
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualPayment = () => {
    // Show Cashfree payment form
    setStep('payment');
    alert(
      'Cashfree Payment Modal would open here.\n\n' +
      'Configuration needed:\n' +
      '1. Set VITE_CASHFREE_APP_ID in environment\n' +
      '2. Set VITE_CASHFREE_SECRET_KEY in environment\n' +
      '3. Configure webhook URL on Cashfree dashboard'
    );
  };

  if (step === 'payment') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we process your payment...</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Premium Plan</span>
              <span className="font-semibold">₹{premiumPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Duration</span>
              <span className="font-semibold">{duration} days</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="animate-pulse flex justify-center">
            <div className="w-3 h-3 bg-gray-900 rounded-full animate-bounce mr-1" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-gray-900 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">₹{premiumPrice}</div>
            <div className="text-gray-600 mb-4">for {duration} days</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Unlimited Interviews</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Advanced Analytics</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Priority Support</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleUpgradeToPremium}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 mb-3"
        >
          {isLoading ? 'Processing...' : 'Upgrade Now'}
        </button>

        <button
          onClick={onClose}
          disabled={isLoading}
          className="w-full border border-gray-300 text-gray-700 py-3 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Cancel
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by <strong>Cashfree</strong>
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
