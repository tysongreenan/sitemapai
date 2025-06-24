import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLegalMenuOpen, setIsLegalMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    setIsLegalMenuOpen(false);
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
              
              {/* Legal Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLegalMenuOpen(!isLegalMenuOpen)}
                  className="flex items-center gap-1 text-gray-700 hover:text-indigo-600 font-medium"
                >
                  Legal
                  <ChevronDown size={16} className={`transition-transform ${isLegalMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLegalMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link 
                      to="/privacy-policy" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      onClick={() => setIsLegalMenuOpen(false)}
                    >
                      Privacy Policy
                    </Link>
                    <Link 
                      to="/terms-of-service" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      onClick={() => setIsLegalMenuOpen(false)}
                    >
                      Terms of Service
                    </Link>
                    <Link 
                      to="/delete-my-data" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      onClick={() => setIsLegalMenuOpen(false)}
                    >
                      Delete My Data
                    </Link>
                  </div>
                )}
              </div>
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
                    onClick={() => navigate('/signin')}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
            
            {/* Legal section in mobile */}
            <div className="pt-2 border-t border-gray-200">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Legal
              </div>
              <Link 
                to="/privacy-policy" 
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms-of-service" 
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
              >
                Terms of Service
              </Link>
              <Link 
                to="/delete-my-data" 
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-red-600"
              >
                Delete My Data
              </Link>
            </div>
            
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
                    onClick={() => navigate('/signin')}
                    className="w-full"
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/signup')}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    Get started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}