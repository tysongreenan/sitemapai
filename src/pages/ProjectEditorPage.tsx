import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Share, Save, Sparkles } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LoadingScreen } from '../components/layout/LoadingScreen';
import { Button } from '../components/ui/Button';
import { ProjectCanvas, ProjectCanvasRef } from '../components/project/ProjectCanvas';
import { AIChatbot, AIChatbotRef } from '../components/project/AIChatbot';
import { AIContextSettings } from '../components/project/AIContextSettings';

export default function ProjectEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, currentProject, setCurrentProject, loading, saveStatus } = useProject();
  const [selectedCanvasItem, setSelectedCanvasItem] = useState(null);
  const [aiSettings, setAiSettings] = useState<AIContextSettings>({
    brandVoiceId: undefined,
    audienceId: undefined,
    knowledgeIds: [],
    customInstructions: '',
    temperature: 0.7,
    outputFormat: 'professional',
    language: 'en',
    persona: 'default'
  });
  const chatbotRef = useRef<AIChatbotRef>(null);
  const canvasRef = useRef<ProjectCanvasRef>(null);

  // Set current project based on URL parameter
  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }

    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      setCurrentProject(project);
    } else if (!loading) {
      // Try to fetch the project directly if not in the loaded projects
      const fetchProject = async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error || !data) {
          console.error('Error fetching project:', error);
          navigate('/projects');
          return;
        }

        setCurrentProject(data);
      };

      fetchProject();
    }
  }, [projectId, projects, navigate, setCurrentProject, loading]);

  // Load AI settings for this project
  useEffect(() => {
    if (projectId) {
      fetchProjectAISettings();
    }
  }, [projectId]);

  const fetchProjectAISettings = async () => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Loading AI settings for project:', projectId);
      
      // For now, check if there are any saved settings in localStorage
      const savedSettings = localStorage.getItem(`ai-settings-${projectId}`);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setAiSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
  };

  const handleAISettingsChange = (newSettings: AIContextSettings) => {
    setAiSettings(newSettings);
    
    // Save to localStorage for persistence (replace with actual API call)
    localStorage.setItem(`ai-settings-${projectId}`, JSON.stringify(newSettings));
    
    console.log('AI settings updated:', newSettings);
  };

  // Function to handle sending text to AI chatbot
  const handleSendTextToChat = (text: string) => {
    if (chatbotRef.current) {
      chatbotRef.current.setInputValueFromOutside(text);
    }
  };

  // Function to handle updating selected node content
  const handleUpdateSelectedNodeContent = (nodeId: string, newContent: string) => {
    if (canvasRef.current) {
      canvasRef.current.updateNodeContent(nodeId, newContent);
    }
  };

  if (loading || !currentProject) {
    return <LoadingScreen message="Loading your project..." />;
  }

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'text-yellow-600';
      case 'saved': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved';
      case 'error': return 'Error saving';
      default: return 'All changes saved';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Project Header */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projects')}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Projects
          </Button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentProject.title}
              </h1>
              <p className="text-sm text-gray-500">
                {currentProject.description || 'No description'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Save Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
              saveStatus === 'saved' ? 'bg-green-500' :
              saveStatus === 'error' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
            <span className={`text-sm ${getSaveStatusColor()}`}>
              {getSaveStatusText()}
            </span>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Settings size={16} />}>
              Settings
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Share size={16} />}>
              Share
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Save size={16} />}>
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <ProjectCanvas
          ref={canvasRef}
          projectId={projectId!}
          onItemSelect={setSelectedCanvasItem}
          selectedItem={selectedCanvasItem}
          onSendTextToChat={handleSendTextToChat}
          aiSettings={aiSettings}
          onAISettingsChange={handleAISettingsChange}
        />

        {/* AI Chatbot Sidebar */}
        <AIChatbot
          ref={chatbotRef}
          projectId={projectId!}
          aiSettings={aiSettings}
          selectedCanvasItem={selectedCanvasItem}
          onUpdateSelectedNodeContent={handleUpdateSelectedNodeContent}
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="h-8 bg-gray-100 border-t border-gray-200 px-6 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>Project ID: {projectId}</span>
          <span>•</span>
          <span>Last updated: {new Date(currentProject.updated_at).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>User: {user?.email}</span>
          <span>•</span>
          <span>Canvas items: {selectedCanvasItem ? '1 selected' : '0 selected'}</span>
          {/* AI Context Indicator */}
          {(aiSettings.brandVoiceId || aiSettings.audienceId || aiSettings.knowledgeIds.length > 0) && (
            <>
              <span>•</span>
              <span className="text-indigo-600 font-medium">AI Context Active</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}