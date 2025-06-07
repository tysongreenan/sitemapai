import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SlickplanStyleEditor from '../components/editor/SlickplanStyleEditor';
import { useProject } from '../context/ProjectContext';
import { supabase } from '../lib/supabase';

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, currentProject, setCurrentProject, loading } = useProject();

  // Set current project based on URL parameter
  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard');
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
          navigate('/dashboard');
          return;
        }

        setCurrentProject(data);
      };

      fetchProject();
    }
  }, [projectId, projects, navigate, setCurrentProject, loading]);

  if (loading || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your sitemap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <SlickplanStyleEditor />
    </div>
  );
}