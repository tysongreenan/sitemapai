import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Facebook, CheckCircle, AlertCircle, Loader2, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

export default function FacebookCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleFacebookCallback = async () => {
      try {
        // Check for error parameters
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          console.error('Facebook OAuth error:', error, errorDescription);
          setErrorMessage(errorDescription || 'Facebook authentication failed');
          setStatus('error');
          return;
        }

        // Check for authorization code
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          setErrorMessage('No authorization code received from Facebook');
          setStatus('error');
          return;
        }

        // Handle the OAuth callback with Supabase
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (authError) {
          console.error('Supabase auth error:', authError);
          setErrorMessage(authError.message || 'Authentication failed');
          setStatus('error');
          return;
        }

        if (data.user) {
          setStatus('success');
          toast.success(`Welcome ${data.user.user_metadata?.full_name || data.user.email}!`);
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
        } else {
          setErrorMessage('No user data received');
          setStatus('error');
        }
      } catch (error) {
        console.error('Facebook callback error:', error);
        setErrorMessage('An unexpected error occurred during authentication');
        setStatus('error');
      }
    };

    handleFacebookCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    // Redirect to sign in page to retry authentication
    navigate('/signin');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Facebook Logo */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          status === 'processing' ? 'bg-blue-100' :
          status === 'success' ? 'bg-green-100' :
          'bg-red-100'
        }`}>
          {status === 'processing' && (
            <div className="relative">
              <Facebook className="w-10 h-10 text-blue-600" />
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
            </div>
          )}
          {status === 'success' && <CheckCircle className="w-10 h-10 text-green-600" />}
          {status === 'error' && <AlertCircle className="w-10 h-10 text-red-600" />}
        </div>

        {/* Content based on status */}
        {status === 'processing' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Completing Facebook Sign In
            </h1>
            <p className="text-gray-600 mb-6">
              Please wait while we complete your Facebook authentication...
            </p>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to SiteMapAI!
            </h1>
            <p className="text-gray-600 mb-6">
              You've successfully signed in with Facebook. Redirecting to your dashboard...
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Authentication successful</span>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Failed
            </h1>
            <p className="text-gray-600 mb-2">
              We couldn't complete your Facebook sign in:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700"
                leftIcon={<Facebook size={16} />}
              >
                Try Again
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
                leftIcon={<Home size={16} />}
              >
                Go to Home
              </Button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Having trouble? Contact our{' '}
            <a href="mailto:support@sitemapai.com" className="text-blue-600 hover:text-blue-800">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}