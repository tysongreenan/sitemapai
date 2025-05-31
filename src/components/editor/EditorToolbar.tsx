import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Share, Download, ChevronLeft, Edit, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useProject } from '../../context/ProjectContext';

interface EditorToolbarProps {
  projectTitle: string;
  isSaving: boolean;
  onSave: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export default function EditorToolbar({ 
  projectTitle, 
  isSaving, 
  onSave,
  saveStatus 
}: EditorToolbarProps) {
  const navigate = useNavigate();
  const { updateProject, currentProject } = useProject();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(projectTitle);

  const handleTitleUpdate = () => {
    if (!currentProject) return;
    
    updateProject(currentProject.id, { title });
    setIsEditingTitle(false);
  };

  const handleExport = () => {
    if (!currentProject) return;
    
    const dataStr = JSON.stringify(currentProject.sitemap_data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `${currentProject.title.replace(/\s+/g, '-').toLowerCase()}-sitemap.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Save status indicator
  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center text-yellow-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            Saving...
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center text-green-600 text-sm">
            <Check size={16} className="mr-1" />
            Saved
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle size={16} className="mr-1" />
            Error saving
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          leftIcon={<ChevronLeft size={18} />}
          className="mr-4"
        >
          Back
        </Button>
        
        {isEditingTitle ? (
          <div className="flex items-center space-x-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-64"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTitleUpdate();
                }
              }}
              autoFocus
            />
            <Button size="sm" variant="primary" onClick={handleTitleUpdate}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <h1 className="text-xl font-semibold mr-2">{projectTitle}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingTitle(true)}
              className="p-1 h-auto"
            >
              <Edit size={14} />
            </Button>
          </div>
        )}
        
        {/* Save status indicator */}
        <div className="ml-4">
          <SaveStatusIndicator />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download size={16} />}
          onClick={handleExport}
        >
          Export
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Share size={16} />}
          onClick={() => {/* TODO: Implement sharing */}}
        >
          Share
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Save size={16} />}
          isLoading={isSaving}
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
}