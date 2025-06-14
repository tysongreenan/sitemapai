import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Loader2, ArrowRight, Lightbulb, FileText, Image, Video, Mail, Target, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { createProject } = useProject();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const quickSuggestions = [
    {
      text: "Create a blog post about summer projects",
      icon: <FileText size={16} />,
      category: "Content"
    },
    {
      text: "Generate social media content for product launch",
      icon: <Image size={16} />,
      category: "Social"
    },
    {
      text: "Write email campaign for newsletter subscribers",
      icon: <Mail size={16} />,
      category: "Email"
    },
    {
      text: "Design marketing strategy for Q4",
      icon: <Target size={16} />,
      category: "Strategy"
    },
    {
      text: "Create video script for product demo",
      icon: <Video size={16} />,
      category: "Video"
    },
    {
      text: "Build landing page copy for new service",
      icon: <BarChart3 size={16} />,
      category: "Landing"
    }
  ];

  const recentProjects = [
    { name: "Summer Project Blog Post", assets: 1, time: "just now" },
    { name: "MWS - July Blog", assets: 2, time: "5 minutes ago" },
    { name: "FDB_Ad-Creative-Direction_V1_060425", assets: 8, time: "yesterday" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsProcessing(true);
    
    try {
      // Stage 1: Understanding request
      setProcessingStage('Understanding your request...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stage 2: Creating project
      setProcessingStage('Creating your project...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create the project in the background
      const projectTitle = inputValue.length > 50 
        ? `${inputValue.substring(0, 47)}...` 
        : inputValue;
      
      const project = await createProject(projectTitle, inputValue);
      
      if (!project) {
        throw new Error('Failed to create project');
      }
      
      // Stage 3: Generating content
      setProcessingStage('Generating AI content...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stage 4: Finalizing
      setProcessingStage('Finalizing your workspace...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Navigate to the project editor with the user's request as a parameter
      // This will trigger the AI chatbot to automatically generate content
      navigate(`/editor/${project.id}?autoGenerate=${encodeURIComponent(inputValue)}`);
      
    } catch (error) {
      console.error('Error processing request:', error);
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Show processing screen
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          {/* AI Processing Animation */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Sparkles className="w-16 h-16 text-white animate-pulse" />
            </div>
            
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border-4 border-indigo-200 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-4 border-purple-200 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI is working on your request
          </h1>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <p className="text-gray-600 italic mb-4">"{inputValue}"</p>
            <div className="flex items-center justify-center gap-3 text-indigo-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">{processingStage}</span>
            </div>
          </div>
          
          {/* Processing Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 font-bold text-xs">✓</span>
              </div>
              <span className="text-gray-600">Understanding</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 font-bold text-xs">✓</span>
              </div>
              <span className="text-gray-600">Project Setup</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <span className="text-gray-600">AI Generation</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-400 font-bold text-xs">4</span>
              </div>
              <span className="text-gray-400">Finalizing</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mt-6">
            This usually takes 10-30 seconds. Hang tight!
          </p>
        </div>
      </div>
    );
  }

  // Main homepage interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Welcome {user?.email?.split('@')[0] || 'there'}, what do you want to work on?
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your project and let AI create amazing content for you in seconds
          </p>
        </div>

        {/* Main Input */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Jasper anything..."
              className="w-full px-6 py-6 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 shadow-lg bg-white"
              disabled={isProcessing}
            />
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Button
                type="submit"
                disabled={!inputValue.trim() || isProcessing}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl px-6 py-3"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => navigate('/projects')}
            className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create a Project</h3>
            <p className="text-sm text-gray-600">Start a new AI-powered project</p>
            <ArrowRight className="w-4 h-4 text-gray-400 mt-2 group-hover:text-indigo-600 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/apps')}
            className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Discover Apps</h3>
            <p className="text-sm text-gray-600">Browse AI-powered tools</p>
            <ArrowRight className="w-4 h-4 text-gray-400 mt-2 group-hover:text-purple-600 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/jasper-iq')}
            className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create an App</h3>
            <p className="text-sm text-gray-600">Build custom AI workflows</p>
            <ArrowRight className="w-4 h-4 text-gray-400 mt-2 group-hover:text-green-600 transition-colors" />
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick suggestions</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{suggestion.text}</p>
                  <p className="text-xs text-gray-500">{suggestion.category}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentProjects.map((project, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate('/projects')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.assets} assets</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{project.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}