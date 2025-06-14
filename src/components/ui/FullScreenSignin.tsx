"use client";

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { validateEmail } from "../../lib/validation";
import { AppErrorHandler } from "../../lib/errorHandling";
import { toast } from "react-toastify";

export const FullScreenSignin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError("");
    setPasswordError("");
    
    // Validate inputs
    const emailValidation = validateEmail(email);
    
    let hasErrors = false;
    
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "Please enter a valid email address.");
      hasErrors = true;
    }
    
    if (!password.trim()) {
      setPasswordError("Password is required.");
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        if (!data.user.email_confirmed_at) {
          // User exists but email not verified
          toast.info("Please verify your email address to continue.");
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          // User is verified, redirect to dashboard
          toast.success(`Welcome back, ${data.user.email?.split('@')[0] || 'there'}!`);
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      if (error.message?.includes('Invalid login credentials')) {
        setPasswordError("Invalid email or password. Please try again.");
      } else if (error.message?.includes('Email not confirmed')) {
        toast.info("Please verify your email address to continue.");
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        AppErrorHandler.handle(error, { context: 'FullScreenSignin.handleSubmit' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError("Please enter your email address first.");
      return;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "Please enter a valid email address.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
    } catch (error) {
      AppErrorHandler.handle(error, { context: 'FullScreenSignin.handleForgotPassword' });
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
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
                Reset your password
              </h2>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>
          </div>

          {/* Right Panel - Reset Password Form */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white rounded-r-2xl">
            <div className="flex flex-col items-left mb-8">
              <div className="text-indigo-600 mb-4">
                <Sparkles className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight text-gray-900">
                Forgot Password
              </h2>
              <p className="text-gray-600">
                We'll send you a reset link
              </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleForgotPassword} noValidate>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending reset link...
                  </div>
                ) : (
                  "Send reset link"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
              Welcome back to your AI marketing workspace
            </h2>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Continue creating amazing content with the power of artificial intelligence. Your projects and AI assistants are waiting for you.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Access your AI projects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Continue content generation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Collaborate with your team</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Sign In Form */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-white rounded-r-2xl">
          <div className="flex flex-col items-left mb-8">
            <div className="text-indigo-600 mb-4">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to your account to continue
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
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in to your account"
              )}
            </button>

            <div className="text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
              >
                Sign up for free
              </Link>
            </div>

            <div className="text-xs text-gray-500 text-center leading-relaxed">
              By signing in, you agree to our{" "}
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