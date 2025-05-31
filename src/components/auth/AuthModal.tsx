import React, { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function AuthModal({ isOpen, onClose, redirectTo }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);

  // Handle animation by mounting the component before showing it
  useEffect(() => {
    if (isOpen && !mounted) {
      setMounted(true);
    } else if (!isOpen && mounted) {
      const timer = setTimeout(() => {
        setMounted(false);
      }, 300); // Match this with the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

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
        className={`bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Sign in or sign up</h2>
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
        <div className="p-4">
          <Auth
            supabaseClient={supabase}
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
            }}
            providers={['google', 'github']}
            redirectTo={redirectTo || window.location.origin}
            onlyThirdPartyProviders={false}
            magicLink={true}
          />
        </div>
      </div>
    </div>
  );
}