// src/components/editor/EditorToolbar.tsx (modified sections)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Share, Download, ChevronLeft, Edit, Check, AlertCircle, Clock, RefreshCw, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useProject, SaveStatus } from '../../context/ProjectContext';

interface EditorToolbarProps {
  projectTitle: string;
  onSave: () => void;
  saveStatus: SaveStatus;
  viewMode: 'sitemap' | 'wireframe'; //
  onViewModeChange: (mode: 'sitemap' | 'wireframe') => void; //
  onFitView: () => void; //
  onExport: () => void; //
  onDuplicate: () => void; //
}

export default function EditorToolbar({
  projectTitle,
  onSave,
  saveStatus,
  viewMode, //
  onViewModeChange, //
  onFitView, //
  onExport, //
  onDuplicate, //
}: EditorToolbarProps) {
  const navigate = useNavigate();
  const { updateProject, currentProject } = useProject();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(projectTitle);

  // ... (handleTitleUpdate, handleExport, SaveStatusIndicator remain the same) ...

  return (
    <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} leftIcon={<ChevronLeft size={18} />}>
          Dashboard
        </Button>
        <div className="h-8 w-px bg-gray-300" />
        <h1 className="font-semibold text-gray-900 whitespace-nowrap">{projectTitle}</h1>
        <div className="h-8 w-px bg-gray-300" />
        {/* VIEW MODE TOGGLE */}
        <div className="flex items-center bg-gray-100 rounded-md p-1">
          <button
            onClick={() => onViewModeChange('sitemap')} //
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              viewMode === 'sitemap'? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sitemap
          </button>
          <button
            onClick={() => onViewModeChange('wireframe')} //
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              viewMode === 'wireframe'? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Wireframe
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-400 cursor-not-allowed relative" title="Coming soon">
            Style Guide
            <span className="absolute -top-1 -right-1 text-xs text-red-500">Beta</span>
          </button>
        </div>
      </div>

      {/* ... (rest of the toolbar remains the same) ... */}
    </div>
  );
};