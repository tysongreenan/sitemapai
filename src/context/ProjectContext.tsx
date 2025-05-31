import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { debounce } from '../lib/utils';
import { Edge, Node } from 'reactflow';
import { validateProject, validateSitemapData } from '../lib/validation';
import { AppErrorHandler, handleAsyncError } from '../lib/errorHandling';

export type Project = {
  id: string;
  title: string;
  description: string | null;
  sitemap_data: {
    nodes: Node[];
    edges: Edge[];
  };
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
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const result = await handleAsyncError(async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    }, { context: 'ProjectContext.loadProjects', userId: user.id });

    if (result) {
      setProjects(result);
    }
    setLoading(false);
  };

  const createProject = async (title: string, description?: string): Promise<Project | null> => {
    if (!user) return null;

    const validation = validateProject({ title, description });
    if (!validation.isValid) {
      AppErrorHandler.handle({
        type: 'validation',
        message: validation.error
      });
      return null;
    }

    const newProject = {
      user_id: user.id,
      title,
      description: description || null,
      sitemap_data: { nodes: [], edges: [] },
    };

    const result = await handleAsyncError(async () => {
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    }, { context: 'ProjectContext.createProject', project: newProject });

    if (result) {
      setProjects((prev) => [result, ...prev]);
      return result;
    }
    return null;
  };

  const updateProject = async (id: string, data: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    const validation = validateProject({ 
      title: data.title || '', 
      description: data.description,
      sitemap_data: data.sitemap_data 
    });
    
    if (!validation.isValid) {
      AppErrorHandler.handle({
        type: 'validation',
        message: validation.error
      });
      return;
    }

    await handleAsyncError(async () => {
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
    }, { context: 'ProjectContext.updateProject', projectId: id, updateData: data });
  };

  const deleteProject = async (id: string) => {
    await handleAsyncError(async () => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;

      setProjects((prev) => prev.filter((project) => project.id !== id));
      
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    }, { context: 'ProjectContext.deleteProject', projectId: id });
  };

  // Debounced save function to prevent too many requests
  const debouncedSave = debounce(async (id: string, changes: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    await updateProject(id, changes);
  }, 3000);

  const saveProjectChanges = async (changes: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    if (!currentProject) return;
    
    if (changes.sitemap_data) {
      const validation = validateSitemapData(changes.sitemap_data);
      if (!validation.isValid) {
        AppErrorHandler.handle({
          type: 'validation',
          message: validation.error
        });
        return;
      }
    }
    
    // Update the local state immediately
    setCurrentProject((prev) => 
      prev ? { ...prev, ...changes } : null
    );

    // Debounce the actual save to Supabase
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