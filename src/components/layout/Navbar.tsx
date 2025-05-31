import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for transparent to solid background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <Globe className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">SiteMapAI</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/products" className="text-gray-700 hover:text-indigo-600 font-medium">
                Products
              </Link>
              <Link to="/community" className="text-gray-700 hover:text-indigo-600 font-medium">
                Community
              </Link>
              <Link to="/pricing" className="text-gray-700 hover:text-indigo-600 font-medium">
                Pricing
              </Link>
              <Link to="/learn" className="text-gray-700 hover:text-indigo-600 font-medium">
                Learn
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-indigo-600 font-medium">
                Contact Sales
              </Link>
            </nav>
            
            {/* Auth buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard">
                    <Button variant="secondary">Dashboard</Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => signOut()}
                    leftIcon={<LogOut size={16} />}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    Get started
                  </Button>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white shadow-lg">
            <Link 
              to="/products" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              Products
            </Link>
            <Link 
              to="/community" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              Community
            </Link>
            <Link 
              to="/pricing" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              Pricing
            </Link>
            <Link 
              to="/learn" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              Learn
            </Link>
            <Link 
              to="/contact" 
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
            >
              Contact Sales
            </Link>
            
            {/* Mobile auth buttons */}
            <div className="pt-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-2">
                  <Link to="/dashboard" className="w-full">
                    <Button variant="secondary" className="w-full">Dashboard</Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={() => signOut()}
                    className="w-full"
                    leftIcon={<LogOut size={16} />}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full"
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full"
                  >
                    Get started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}