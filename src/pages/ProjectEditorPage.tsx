import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SlickplanStyleEditor from '../components/editor/SlickplanStyleEditor';
import { useProject } from '../context/ProjectContext';
import { supabase } from '../lib/supabase';
import { LoadingScreen } from '../components/layout/LoadingScreen';

export default function ProjectEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, currentProject, setCurrentProject, loading } = useProject();

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

  if (loading || !currentProject) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen flex flex-col">
      <SlickplanStyleEditor />
    </div>
  );
}