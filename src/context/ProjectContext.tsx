import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { debounce } from '../lib/utils';
import { Edge, Node } from 'react-flow-renderer';

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

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data as Project[]);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (title: string, description?: string): Promise<Project | null> => {
    if (!user) return null;

    const newProject = {
      user_id: user.id,
      title,
      description: description || null,
      sitemap_data: { nodes: [], edges: [] },
    };

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;
      
      const createdProject = data as Project;
      setProjects((prev) => [createdProject, ...prev]);
      return createdProject;
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
      return null;
    }
  };

  const updateProject = async (id: string, data: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    try {
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
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) throw error;

      setProjects((prev) => prev.filter((project) => project.id !== id));
      
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  // Debounced save function to prevent too many requests
  const debouncedSave = debounce(async (id: string, changes: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    await updateProject(id, changes);
  }, 3000);

  const saveProjectChanges = async (changes: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    if (!currentProject) return;
    
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