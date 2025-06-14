import React, { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { AppErrorHandler } from '../../lib/errorHandling';
import { validateEmail, validatePassword } from '../../lib/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

type AuthView = 'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password' | 'verify_email';

export function AuthModal({ isOpen, onClose, redirectTo }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<AuthView>('sign_in');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string | null;
  }>({ type: null, message: null });

  // Handle animation by mounting the component before showing it
  useEffect(() => {
    if (isOpen && !mounted) {
      setMounted(true);
    } else if (!isOpen && mounted) {
      const timer = setTimeout(() => {
        setMounted(false);
        // Reset state when modal closes
        setView('sign_in');
        setEmail('');
        setStatus({ type: null, message: null });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('update_password');
      } else if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        onClose();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onClose]);

  const handleEmailSubmit = async (email: string, view: AuthView) => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setStatus({ type: 'error', message: emailValidation.error || 'Invalid email' });
      return;
    }

    try {
      let response;
      if (view === 'forgotten_password') {
        response = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
      } else if (view === 'verify_email') {
        response = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo || window.location.origin
          }
        });
      }

      if (response?.error) throw response.error;

      setEmail(email);
      setStatus({
        type: 'success',
        message: view === 'forgotten_password'
          ? 'Check your email for password reset instructions'
          : 'Check your email for the magic link'
      });
    } catch (error) {
      AppErrorHandler.handle(error, { context: 'AuthModal.handleEmailSubmit', view });
    }
  };

  const getStatusColor = (type: 'success' | 'error' | 'info' | null) => {
    switch (type) {
      case 'success': return 'bg-green-50 text-green-800 border-green-200';
      case 'error': return 'bg-red-50 text-red-800 border-red-200';
      case 'info': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return '';
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {view === 'sign_in' ? 'Welcome back' :
             view === 'sign_up' ? 'Create an account' :
             view === 'forgotten_password' ? 'Reset your password' :
             view === 'update_password' ? 'Update password' :
             'Sign in with magic link'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 rounded-full"
            aria-label="Close"
          >
            <X size={20} />
          </Button>
        </div>

        {status.type && (
          <div className={`m-6 p-4 rounded-lg border ${getStatusColor(status.type)}`}>
            {status.message}
          </div>
        )}

        <div className="p-6">
          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#4338ca',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg transition-all duration-200',
                input: 'block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors',
                label: 'block text-sm font-medium text-gray-700 mb-2',
                message: 'text-sm text-red-600 mt-2',
                anchor: 'text-indigo-600 hover:text-indigo-800 font-medium transition-colors',
              },
            }}
            providers={['google', 'github']}
            redirectTo={redirectTo || window.location.origin}
            onlyThirdPartyProviders={false}
            magicLink={true}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create a password',
                  button_label: 'Sign up',
                  loading_button_label: 'Creating account...',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                },
                forgotten_password: {
                  email_label: 'Email address',
                  button_label: 'Send reset instructions',
                  loading_button_label: 'Sending reset instructions...',
                  link_text: 'Remember your password? Sign in',
                },
              },
            }}
          />
          
          {/* Additional sign up CTA */}
          {view === 'sign_in' && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-3">
                New to SiteMapAI?
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  // Navigate to signup page
                  window.location.href = '/signup';
                }}
                className="w-full"
              >
                Create your free account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}