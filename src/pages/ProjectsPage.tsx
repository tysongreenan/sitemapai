import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Search, Filter, Trash2, ExternalLink, FileEdit, Sparkles, Brain, Target } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useProject } from '../context/ProjectContext';
import { formatDate, truncateText } from '../lib/utils';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, loading, loadProjects, createProject, deleteProject } = useProject();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isCreatingProject, setIsCreatingProject] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);

  // Memoize the filtered projects to prevent unnecessary recalculations
  const filteredProjects = React.useMemo(() => 
    projects.filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [projects, searchTerm]
  );

  const handleCreateProject = useCallback(async () => {
    setIsCreatingProject(true);
    try {
      const newProject = await createProject(
        `AI Marketing Project ${new Date().toLocaleDateString()}`,
        'A new AI-powered marketing project with intelligent content generation'
      );
      
      if (newProject) {
        navigate(`/editor/${newProject.id}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  }, [createProject, navigate]);

  const confirmDelete = useCallback((projectId: string) => {
    setProjectToDelete(projectId);
  }, []);

  const handleDeleteProject = useCallback(async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  }, [projectToDelete, deleteProject]);

  // Load projects only once when the component mounts
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const projectTemplates = [
    {
      title: 'Blog Content Campaign',
      description: 'Create a series of blog posts with AI assistance',
      icon: <FileEdit size={20} />,
      color: 'bg-blue-500'
    },
    {
      title: 'Social Media Strategy',
      description: 'Generate social content across multiple platforms',
      icon: <Target size={20} />,
      color: 'bg-green-500'
    },
    {
      title: 'Email Marketing Series',
      description: 'Build automated email sequences with AI',
      icon: <Brain size={20} />,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Projects</h1>
              <p className="text-gray-600">Create and manage your AI-powered marketing projects</p>
            </div>
          </div>
        </div>
        
        <Button
          variant="primary"
          onClick={handleCreateProject}
          leftIcon={<Plus size={16} />}
          isLoading={isCreatingProject}
          className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          New AI Project
        </Button>
      </div>

      {/* Quick Start Templates */}
      {projects.length === 0 && !loading && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Templates</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {projectTemplates.map((template, index) => (
              <button
                key={index}
                onClick={handleCreateProject}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className={`w-12 h-12 ${template.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {template.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter size={16} />}
            >
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Clock size={16} />}
            >
              Recent
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <p className="text-gray-600">Loading your AI projects...</p>
            </div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Created</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Last Modified</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden lg:table-cell">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {project.description ? truncateText(project.description, 60) : 'AI-powered marketing project'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 hidden md:table-cell">
                      {formatDate(project.created_at)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 hidden md:table-cell">
                      {formatDate(project.updated_at)}
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(project.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          leftIcon={<Trash2 size={16} />}
                        >
                          <span className="sr-only md:not-sr-only">Delete</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<ExternalLink size={16} />}
                          onClick={() => navigate(`/editor/${project.id}`)}
                          className="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-200"
                        >
                          <span className="sr-only md:not-sr-only">Open</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchTerm ? 'No projects found' : 'Ready to create amazing content?'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or create a new project' 
                : 'Start your first AI-powered marketing project and watch your content come to life'
              }
            </p>
            <Button
              onClick={handleCreateProject}
              leftIcon={<Plus size={16} />}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Create Your First AI Project
            </Button>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this project? This action cannot be undone and all project data will be permanently lost.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setProjectToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                onClick={handleDeleteProject}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}