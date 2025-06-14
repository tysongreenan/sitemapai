import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Users, Target, BarChart3, Clock, ArrowRight, Sparkles, Zap, Brain, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, createProject } = useProject();
  const { user } = useAuth();

  const handleCreateProject = async () => {
    const newProject = await createProject(
      `New Project ${new Date().toLocaleDateString()}`,
      'A new AI-powered marketing project'
    );
    
    if (newProject) {
      navigate(`/editor/${newProject.id}`);
    }
  };

  const recentProjects = projects.slice(0, 3);

  const stats = [
    { name: 'Total Projects', value: projects.length, icon: BarChart3, change: '+12%', color: 'text-blue-600' },
    { name: 'AI Generations', value: '247', icon: Sparkles, change: '+23%', color: 'text-purple-600' },
    { name: 'Active Campaigns', value: '8', icon: Target, change: '+5%', color: 'text-green-600' },
    { name: 'Conversion Rate', value: '24.5%', icon: TrendingUp, change: '+3.2%', color: 'text-orange-600' },
  ];

  const quickActions = [
    {
      title: 'Create New Project',
      description: 'Start a new AI-powered marketing project with intelligent assistance',
      icon: Plus,
      action: handleCreateProject,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      iconBg: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Browse AI Apps',
      description: 'Explore pre-built AI tools for specific marketing tasks',
      icon: Zap,
      action: () => navigate('/apps'),
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      iconBg: 'bg-green-100 text-green-600'
    },
    {
      title: 'Setup Brand Voice',
      description: 'Configure your brand voice and knowledge base in Jasper IQ',
      icon: Brain,
      action: () => navigate('/jasper-iq'),
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      iconBg: 'bg-purple-100 text-purple-600'
    }
  ];

  const aiInsights = [
    {
      title: 'Content Performance',
      description: 'Your blog posts are performing 23% better this month',
      icon: FileText,
      trend: 'up'
    },
    {
      title: 'Audience Engagement',
      description: 'Social media engagement increased by 18%',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Campaign Optimization',
      description: 'AI suggests optimizing your email campaigns',
      icon: Target,
      trend: 'neutral'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.email?.split('@')[0] || 'there'}! 👋
            </h1>
            <p className="text-gray-600">
              Your AI-powered marketing command center is ready
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group hover:shadow-lg bg-gradient-to-br from-gray-50 to-white"
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
              <Button
                variant="ghost"
                onClick={() => navigate('/projects')}
                rightIcon={<ArrowRight size={16} />}
              >
                View all
              </Button>
            </div>
            
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/editor/${project.id}`)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {project.description || 'No description'}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock size={12} className="mr-1" />
                        Updated {new Date(project.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first AI-powered project to get started</p>
                <Button onClick={handleCreateProject} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  Create Project
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain size={20} className="mr-2 text-purple-600" />
              AI Insights
            </h3>
            <div className="space-y-4">
              {aiInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Onboarding Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Account created</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">First project created</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-sm text-gray-400">Setup brand voice</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-sm text-gray-400">Invite team members</span>
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">2 of 4 steps completed</p>
          </div>

          {/* Help & Resources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Help & Resources</h3>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
                📚 Getting Started Guide
              </a>
              <a href="#" className="block text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
                🎥 Video Tutorials
              </a>
              <a href="#" className="block text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
                💬 Join Community
              </a>
              <a href="#" className="block text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
                📧 Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}