// src/context/ProjectContext.tsx - Fix the auto-save logic

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { debounce } from '../lib/utils';
import { Edge, Node } from 'reactflow';
import { validateProject, validateSitemapData } from '../lib/validation';
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

type ProjectContextType = {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  createProject: (title: string, description?: string) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'created_at'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  saveProjectChanges: (changes: Partial<Omit<Project, 'id' | 'created_at'>>) => Promise<void>;
  clearError: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Track if we've shown a save notification recently
  const lastSaveToastRef = useRef<number>(0);
  const TOAST_COOLDOWN = 5000; // 5 seconds between toast notifications

  const clearError = () => setError(null);

  const loadProjects = async () => {
    if (!user) return;

    const result = await handleAsyncError(async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setProjects(data as Project[]);
    }, { operation: 'loadProjects', userId: user.id });

    setLoading(false);
  };

  const createProject = async (title: string, description?: string): Promise<Project | null> => {
    if (!user) {
      AppErrorHandler.handle({ type: 'auth', message: 'You must be logged in to create a project' });
      return null;
    }

    // Validate input
    const validation = validateProject({ title, description });
    if (!validation.isValid) {
      AppErrorHandler.handle({ type: 'validation', message: validation.error }, 
        { operation: 'createProject' });
      return null;
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
      return createdProject;
    }, { operation: 'createProject', title, description });

    return result;
  };

  const updateProject = async (id: string, data: Partial<Omit<Project, 'id' | 'created_at'>>, showToast = true) => {
    // Validate the update data
    if (data.title || data.description || data.sitemap_data) {
      const validation = validateProject({
        title: data.title || '',
        description: data.description,
        sitemap_data: data.sitemap_data
      });
      
      if (!validation.isValid) {
        AppErrorHandler.handle({ type: 'validation', message: validation.error });
        setSaveStatus('error');
        return;
      }
    }

    setSaveStatus('saving');

    const success = await handleAsyncError(async () => {
      const { error } = await supabase
        .from('projects')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

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

      // Only show toast if requested and enough time has passed
      if (showToast) {
        const now = Date.now();
        if (now - lastSaveToastRef.current > TOAST_COOLDOWN) {
          toast.success('Project updated successfully');
          lastSaveToastRef.current = now;
        }
      }
    }, { operation: 'updateProject', projectId: id, updates: data });

    if (!success) {
      setSaveStatus('error');
    }
  };

  const deleteProject = async (id: string) => {
    await handleAsyncError(async () => {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;

      setProjects((prev) => prev.filter((project) => project.id !== id));
      
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }

      toast.success('Project deleted successfully');
    }, { operation: 'deleteProject', projectId: id });
  };

  // Create a debounced save function that doesn't show toast notifications
  const debouncedSave = useCallback(
    debounce(async (id: string, changes: Partial<Omit<Project, 'id' | 'created_at'>>) => {
      await updateProject(id, changes, false); // false = don't show toast for auto-save
    }, 2000), // Increased debounce time to 2 seconds
    []
  );

  const saveProjectChanges = async (changes: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    if (!currentProject) return;
    
    // Validate sitemap data if it's being updated
    if (changes.sitemap_data) {
      const validation = validateSitemapData(changes.sitemap_data);
      if (!validation.isValid) {
        AppErrorHandler.handle({ type: 'validation', message: validation.error });
        return;
      }
    }
    
    // Update the local state immediately for responsive UI
    setCurrentProject((prev) => 
      prev ? { ...prev, ...changes } : null
    );

    // Set status to indicate changes are pending
    setSaveStatus('saving');

    // Debounce the actual save to Supabase (without toast)
    debouncedSave(currentProject.id, changes);
  };

  // Load projects when user changes
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user]);

  const value = {
    projects,
    currentProject,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    saveProjectChanges,
    clearError,
    saveStatus,
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