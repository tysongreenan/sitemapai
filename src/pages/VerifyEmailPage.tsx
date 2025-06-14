import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'waiting' | 'verified' | 'error'>('waiting');

  // Get email from URL params or user object
  const email = searchParams.get('email') || user?.email || '';

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Check if user is already verified
  useEffect(() => {
    if (user?.email_confirmed_at) {
      setVerificationStatus('verified');
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [user, navigate]);

  // Listen for auth state changes (email confirmation)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setVerificationStatus('verified');
        toast.success('Email verified successfully! Welcome to SiteMapAI!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!email || timeLeft > 0) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      setResendCount(prev => prev + 1);
      setTimeLeft(60); // 60 second cooldown
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Error resending email:', error);
      toast.error(error.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    navigate('/signup');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (verificationStatus === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h1>
          <p className="text-gray-600 mb-6">
            Your email has been successfully verified. You're being redirected to your dashboard.
          </p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600">
            We've sent a verification link to
          </p>
          <p className="font-semibold text-gray-900 mt-1">{email}</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Next steps:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Check your email inbox</li>
            <li>2. Look for an email from SiteMapAI</li>
            <li>3. Click the verification link</li>
            <li>4. You'll be automatically signed in</li>
          </ol>
        </div>

        {/* Resend Section */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Didn't receive the email? Check your spam folder or
          </p>
          <Button
            onClick={handleResendEmail}
            disabled={isResending || timeLeft > 0}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </div>
            ) : timeLeft > 0 ? (
              `Resend in ${timeLeft}s`
            ) : (
              `Resend verification email${resendCount > 0 ? ` (${resendCount})` : ''}`
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Having trouble?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check your spam/junk folder</li>
            <li>• Make sure {email} is correct</li>
            <li>• Try adding noreply@supabase.io to your contacts</li>
            <li>• Wait a few minutes and check again</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGoToDashboard}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Continue to Dashboard
          </Button>
          <Button
            onClick={handleBackToSignup}
            variant="ghost"
            leftIcon={<ArrowLeft size={16} />}
            className="w-full"
          >
            Back to Sign Up
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">SiteMapAI</span>
          </div>
          <p className="text-xs text-gray-500">
            Need help? Contact our{' '}
            <a href="mailto:support@sitemapai.com" className="text-indigo-600 hover:text-indigo-800">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}