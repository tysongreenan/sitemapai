import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Search, Filter, Trash2, ExternalLink, FileEdit } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useProject } from '../context/ProjectContext';
import { formatDate, truncateText } from '../lib/utils';
import { AuthModal } from '../components/auth/AuthModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, loading, loadProjects, createProject, deleteProject } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateProject = async () => {
    setIsCreatingProject(true);
    try {
      const newProject = await createProject(
        `New Sitemap ${new Date().toLocaleDateString()}`,
        'A new sitemap project'
      );
      
      if (newProject) {
        navigate(`/editor/${newProject.id}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const confirmDelete = (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const handleDeleteProject = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Sitemaps</h1>
            <p className="text-gray-600 mt-1">Manage and edit your sitemap projects</p>
          </div>
          
          <Button
            variant="primary"
            onClick={handleCreateProject}
            leftIcon={<Plus size={16} />}
            isLoading={isCreatingProject}
            className="mt-4 md:mt-0"
          >
            New Sitemap
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 hidden md:table-cell">Last Modified</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {project.description ? truncateText(project.description, 60) : 'No description'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 hidden md:table-cell">
                        {formatDate(project.created_at)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 hidden md:table-cell">
                        {formatDate(project.updated_at)}
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
                            variant="ghost"
                            size="sm"
                            leftIcon={<FileEdit size={16} />}
                            onClick={() => navigate(`/editor/${project.id}`)}
                          >
                            <span className="sr-only md:not-sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<ExternalLink size={16} />}
                            onClick={() => navigate(`/editor/${project.id}`)}
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
              <p className="text-gray-500 mb-4">No projects found</p>
              <Button
                variant="secondary"
                onClick={handleCreateProject}
                leftIcon={<Plus size={16} />}
              >
                Create your first sitemap
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
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
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}