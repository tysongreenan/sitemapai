import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  updateNodeData: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function PropertiesPanel({ 
  selectedNode, 
  updateNodeData, 
  onClose 
}: PropertiesPanelProps) {
  const [nodeData, setNodeData] = useState<any>(null);
  const [newComponent, setNewComponent] = useState('');

  // Update local state when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setNodeData(selectedNode.data);
    } else {
      setNodeData(null);
    }
  }, [selectedNode]);

  // Handle change in form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const updatedData = {
      ...nodeData,
      [name]: value,
    };
    
    setNodeData(updatedData);
    
    if (selectedNode) {
      updateNodeData(selectedNode.id, updatedData);
    }
  };

  // Add component to the node
  const handleAddComponent = () => {
    if (!newComponent.trim() || !selectedNode) return;
    
    // Only handle components for non-page nodes
    if (selectedNode.type !== 'page') {
      const components = [...(nodeData.components || []), newComponent.trim()];
      const updatedData = { ...nodeData, components };
      
      setNodeData(updatedData);
      updateNodeData(selectedNode.id, updatedData);
      setNewComponent('');
    }
  };

  // Remove component from the node
  const handleRemoveComponent = (index: number) => {
    if (!selectedNode || selectedNode.type === 'page') return;
    
    const components = [...(nodeData.components || [])];
    components.splice(index, 1);
    
    const updatedData = { ...nodeData, components };
    
    setNodeData(updatedData);
    updateNodeData(selectedNode.id, updatedData);
  };

  if (!selectedNode || !nodeData) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white p-4">
        <div className="text-gray-500 text-center">No node selected</div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium">Node Properties</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-1 h-auto"
          aria-label="Close panel"
        >
          <X size={18} />
        </Button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <Input
            id="label"
            name="label"
            value={nodeData.label || ''}
            onChange={handleChange}
          />
        </div>
        
        {selectedNode.type === 'page' && (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <Input
              id="url"
              name="url"
              value={nodeData.url || ''}
              onChange={handleChange}
            />
          </div>
        )}
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={nodeData.description || ''}
            onChange={handleChange}
            className="min-h-[100px]"
          />
        </div>
        
        {/* Only show components section for non-page nodes */}
        {selectedNode.type !== 'page' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Components
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newComponent}
                onChange={(e) => setNewComponent(e.target.value)}
                placeholder="Add component"
                className="flex-grow"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComponent();
                  }
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddComponent}
                leftIcon={<Plus size={16} />}
              >
                Add
              </Button>
            </div>
            
            <div className="space-y-2 mt-3">
              {nodeData.components && nodeData.components.length > 0 ? (
                nodeData.components.map((component: string, index: number) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-sm">{component}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 p-1 h-auto"
                      onClick={() => handleRemoveComponent(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No components added</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}