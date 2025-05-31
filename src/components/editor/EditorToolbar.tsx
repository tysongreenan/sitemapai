import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Share, Download, ChevronLeft, Edit, Check, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useProject, SaveStatus } from '../../context/ProjectContext';

interface EditorToolbarProps {
  projectTitle: string;
  onSave: () => void;
  saveStatus: SaveStatus;
}

export default function EditorToolbar({ 
  projectTitle, 
  onSave,
  saveStatus 
}: EditorToolbarProps) {
  const navigate = useNavigate();
  const { updateProject, currentProject } = useProject();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(projectTitle);

  const handleTitleUpdate = async () => {
    if (!currentProject) return;
    
    const success = await updateProject(currentProject.id, { title });
    if (success) {
      setIsEditingTitle(false);
    }
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

  // Save status indicator component
  const SaveStatusIndicator = () => {
    switch (saveStatus) {
      case 'pending':
        return (
          <div className="flex items-center text-blue-600 text-sm">
            <Clock size={14} className="mr-1" />
            <span>Changes pending...</span>
          </div>
        );
      case 'saving':
        return (
          <div className="flex items-center text-blue-600 text-sm">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center text-green-600 text-sm">
            <Check size={14} className="mr-1" />
            <span>All changes saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle size={14} className="mr-1" />
            <span>Save failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          leftIcon={<ChevronLeft size={18} />}
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
                } else if (e.key === 'Escape') {
                  setTitle(projectTitle);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
            />
            <Button size="sm" variant="primary" onClick={handleTitleUpdate}>
              Save
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setTitle(projectTitle);
                setIsEditingTitle(false);
              }}
            >
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
        <SaveStatusIndicator />
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
          onClick={onSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}