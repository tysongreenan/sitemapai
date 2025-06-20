import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Edge, Node } from 'reactflow';
import { validateProjectTitle, validateDescription, validateSitemapData } from '../lib/validation';
import { AppErrorHandler, handleAsyncError } from '../lib/errorHandling';
import { toast } from 'react-toastify';

export type Project = {
  id: string;
  title: string;
  description: string | null;
  sitemap_data: {
    nodes: Node[];
    edges: Edge[];
  };
  is_template?: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
};

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

type ProjectContextType = {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  saveStatus: SaveStatus;
  connectionStatus: 'connected' | 'disconnected' | 'checking';
  loadProjects: () => Promise<void>;
  createProject: (title: string, description?: string) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'created_at'>>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  updateCurrentProjectLocally: (changes: Partial<Omit<Project, 'id' | 'created_at'>>) => void;
  setSaveStatus: (status: SaveStatus) => void;
  clearError: () => void;
  retryConnection: () => Promise<void>;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Refs to prevent unnecessary re-renders and race conditions
  const loadingRef = useRef(false);
  const projectsRef = useRef<Project[]>([]);
  const lastLoadRef = useRef<number>(0);

  const clearError = useCallback(() => setError(null), []);

  // Check connection status
  const retryConnection = useCallback(async () => {
    setConnectionStatus('checking');
    const isConnected = await checkSupabaseConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    
    if (isConnected) {
      toast.success('Connection restored');
      // Retry loading projects if we have a user
      if (user) {
        loadProjects();
      }
    } else {
      toast.error('Connection failed. Please check your internet connection and Supabase configuration.');
    }
  }, [user]);

  // Enhanced error handling for network issues
  const handleNetworkError = useCallback((error: any, operation: string) => {
    console.error(`Network error in ${operation}:`, error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      setConnectionStatus('disconnected');
      setError('Connection lost. Please check your internet connection.');
      toast.error('Connection lost. Click retry to reconnect.', {
        autoClose: false,
        closeOnClick: false,
        onClick: retryConnection
      });
    } else {
      AppErrorHandler.handle(error, { operation, userId: user?.id });
    }
  }, [user?.id, retryConnection]);

  const loadProjects = useCallback(async () => {
    if (!user || loadingRef.current) return;

    const now = Date.now();
    // Prevent multiple simultaneous loads and rapid re-loads
    if (now - lastLoadRef.current < 1000) return;
    lastLoadRef.current = now;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      projectsRef.current = data as Project[];
      setProjects(data as Project[]);
      setConnectionStatus('connected');
    } catch (error) {
      handleNetworkError(error, 'loadProjects');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [user, handleNetworkError]);

  const createProject = async (title: string, description?: string): Promise<Project | null> => {
    if (!user) {
      AppErrorHandler.handle({ type: 'auth', message: 'You must be logged in to create a project' });
      return null;
    }

    // Check connection first
    if (connectionStatus === 'disconnected') {
      toast.error('No connection. Please retry to reconnect.');
      return null;
    }

    // Validate input
    const titleValidation = validateProjectTitle(title);
    if (!titleValidation.isValid) {
      AppErrorHandler.handle({ type: 'validation', message: titleValidation.error });
      return null;
    }

    if (description) {
      const descValidation = validateDescription(description);
      if (!descValidation.isValid) {
        AppErrorHandler.handle({ type: 'validation', message: descValidation.error });
        return null;
      }
    }

    const result = await handleAsyncError(async () => {
      const newProject = {
        user_id: user.id,
        title,
        description: description || null,
        sitemap_data: { nodes: [], edges: [] },
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;
      
      const createdProject = data as Project;
      setProjects((prev) => [createdProject, ...prev]);
      setConnectionStatus('connected');
      return createdProject;
    }, { 
      operation: 'createProject', 
      title, 
      description,
      onError: (error) => handleNetworkError(error, 'createProject')
    });

    return result;
  };

  const updateProject = async (id: string, data: Partial<Omit<Project, 'id' | 'created_at'>>): Promise<boolean> => {
    // Check connection first
    if (connectionStatus === 'disconnected') {
      console.warn('Skipping update - no connection');
      setSaveStatus('error');
      return false;
    }

    // Validate fields being updated
    if (data.title !== undefined) {
      const titleValidation = validateProjectTitle(data.title);
      if (!titleValidation.isValid) {
        AppErrorHandler.handle({ type: 'validation', message: titleValidation.error });
        setSaveStatus('error');
        return false;
      }
    }

    if (data.description !== undefined) {
      const descValidation = validateDescription(data.description);
      if (!descValidation.isValid) {
        AppErrorHandler.handle({ type: 'validation', message: descValidation.error });
        setSaveStatus('error');
        return false;
      }
    }

    if (data.sitemap_data !== undefined) {
      const sitemapValidation = validateSitemapData(data.sitemap_data);
      if (!sitemapValidation.isValid) {
        AppErrorHandler.handle({ type: 'validation', message: sitemapValidation.error });
        setSaveStatus('error');
        return false;
      }
    }

    setSaveStatus('saving');

    const success = await handleAsyncError(async () => {
      const { error } = await supabase
        .from('projects')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setProjects((prev) =>
        prev.map((project) =>
          project.id === id
            ? { ...project, ...data, updated_at: new Date().toISOString() }
            : project
        )
      );

      if (currentProject?.id === id) {
        setCurrentProject((prev) =>
          prev ? { ...prev, ...data, updated_at: new Date().toISOString() } : null
        );
      }

      setSaveStatus('saved');
      setConnectionStatus('connected');
      
      // Auto-clear saved status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

      return true;
    }, { 
      operation: 'updateProject', 
      projectId: id,
      onError: (error) => {
        handleNetworkError(error, 'updateProject');
        setSaveStatus('error');
      }
    });

    if (!success) {
      setSaveStatus('error');
      return false;
    }

    return true;
  };

  const deleteProject = async (id: string) => {
    // Check connection first
    if (connectionStatus === 'disconnected') {
      toast.error('No connection. Please retry to reconnect.');
      return;
    }

    await handleAsyncError(async () => {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;

      setProjects((prev) => prev.filter((project) => project.id !== id));
      
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }

      setConnectionStatus('connected');
      toast.success('Project deleted successfully');
    }, { 
      operation: 'deleteProject', 
      projectId: id,
      onError: (error) => handleNetworkError(error, 'deleteProject')
    });
  };

  // Update current project locally without saving
  const updateCurrentProjectLocally = (changes: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    setCurrentProject((prev) => 
      prev ? { ...prev, ...changes } : null
    );
  };

  // Load projects when user changes
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setConnectionStatus('checking');
    }
  }, [user, loadProjects]);

  // Initial connection check
  useEffect(() => {
    retryConnection();
  }, [retryConnection]);

  const value = {
    projects,
    currentProject,
    loading,
    error,
    saveStatus,
    connectionStatus,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    updateCurrentProjectLocally,
    setSaveStatus,
    clearError,
    retryConnection,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}