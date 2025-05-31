import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import EditorCanvas from '../components/editor/EditorCanvas';
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
    } else {
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
  }, [projectId, projects, navigate, setCurrentProject]);

  if (loading || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ReactFlowProvider>
        {projectId && <EditorCanvas projectId={projectId} />}
      </ReactFlowProvider>
    </div>
  );
}