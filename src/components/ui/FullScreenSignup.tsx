"use client";

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { validateEmail, validatePassword } from "../../lib/validation";
import { AppErrorHandler } from "../../lib/errorHandling";
import { toast } from "react-toastify";

export const FullScreenSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError("");
    setPasswordError("");
    
    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    let hasErrors = false;
    
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "Please enter a valid email address.");
      hasErrors = true;
    }
    
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || "Password must be at least 8 characters.");
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      if (data.user && !data.user.email_confirmed_at) {
        // User needs to verify email
        toast.success("Account created! Please check your email to verify your account.");
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else if (data.user && data.user.email_confirmed_at) {
        // User is already verified (shouldn't happen with new signups, but just in case)
        toast.success("Account created successfully! Welcome to SiteMapAI!");
        navigate("/dashboard");
      }
    } catch (error) {
      AppErrorHandler.handle(error, { context: 'FullScreenSignup.handleSubmit' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 bg-gray-50">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-2xl">
        {/* Left Panel - Brand/Marketing */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 md:p-12 md:w-1/2 relative rounded-l-2xl overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-1/3 right-0 w-24 h-24 bg-white rounded-full translate-x-12"></div>
            <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white rounded-full translate-y-20"></div>
          </div>
          
          {/* Gradient overlay bars */}
          <div className="absolute inset-0 flex opacity-20">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="h-full w-16 bg-gradient-to-b from-transparent via-white to-transparent"
                style={{ marginLeft: i * 64 }}
              />
            ))}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SiteMapAI</h1>
                <p className="text-gray-300 text-sm">AI Marketing Platform</p>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
              Transform your ideas into professional content with AI
            </h2>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Join thousands of marketers, designers, and entrepreneurs who are creating amazing content faster than ever before.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">AI-powered content generation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Professional templates & tools</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Collaborative workspace</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Sign Up Form */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white rounded-r-2xl">
          <div className="flex flex-col items-left mb-8">
            <div className="text-indigo-600 mb-4">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight text-gray-900">
              Get Started
            </h2>
            <p className="text-gray-600">
              Create your account and start building amazing content
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@company.com"
                className={`w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  emailError ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
                disabled={isLoading}
              />
              {emailError && (
                <p id="email-error" className="text-red-500 text-sm mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Create password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Create a strong password"
                  className={`w-full py-3 px-4 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    passwordError ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!passwordError}
                  aria-describedby="password-error"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="text-red-500 text-sm mt-1">
                  {passwordError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                "Create your account"
              )}
            </button>

            <div className="text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <Link 
                to="/signin" 
                className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
              >
                Sign in
              </Link>
            </div>

            <div className="text-xs text-gray-500 text-center leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-800">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};