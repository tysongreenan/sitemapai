import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-indigo-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4 mb-6">Page Not Found</h2>
        <p className="text-xl text-gray-600 max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as={Link}
            to="/"
            variant="primary"
            leftIcon={<Home size={18} />}
          >
            Back to Home
          </Button>
          <Button
            as={Link}
            to="/dashboard"
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}