import React from 'react';
import { X, ChevronRight, Search } from 'lucide-react';
import { Input } from '../ui/Input';

interface ComponentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (componentId: string) => void;
}

const componentCategories = {
  layout: {
    name: 'Layout Components',
    components: [
      { id: 'header', name: 'Header' },
      { id: 'footer', name: 'Footer' },
      { id: 'sidebar', name: 'Sidebar' },
      { id: 'container', name: 'Container' },
    ],
  },
  content: {
    name: 'Content Components',
    components: [
      { id: 'hero', name: 'Hero Section' },
      { id: 'features', name: 'Features Grid' },
      { id: 'testimonials', name: 'Testimonials' },
      { id: 'pricing', name: 'Pricing Table' },
    ],
  },
  forms: {
    name: 'Form Components',
    components: [
      { id: 'contact', name: 'Contact Form' },
      { id: 'signup', name: 'Sign Up Form' },
      { id: 'login', name: 'Login Form' },
      { id: 'newsletter', name: 'Newsletter Form' },
    ],
  },
};

export default function ComponentLibrary({ isOpen, onClose, onAddComponent }: ComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleDragStart = (event: React.DragEvent, componentId: string) => {
    event.dataTransfer.setData('componentId', componentId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return componentCategories;

    const filtered: typeof componentCategories = {};
    Object.entries(componentCategories).forEach(([key, category]) => {
      const matchingComponents = category.components.filter(comp =>
        comp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingComponents.length > 0) {
        filtered[key] = {
          ...category,
          components: matchingComponents,
        };
      }
    });
    return filtered;
  }, [searchTerm]);

  if (!isOpen) {
    return (
      <button
        onClick={() => onClose()}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-r-lg shadow-md z-10"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Components</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <Input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<Search className="h-4 w-4 text-gray-400" />}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(filteredCategories).map(([categoryId, category]) => (
          <div key={categoryId} className="mb-4">
            <button
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 mb-2"
              onClick={() => toggleCategory(categoryId)}
            >
              <span>{category.name}</span>
              <ChevronRight
                className={`h-4 w-4 transform transition-transform ${
                  expandedCategories[categoryId] ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedCategories[categoryId] && (
              <div className="space-y-2">
                {category.components.map((component) => (
                  <div
                    key={component.id}
                    className="pl-4 py-2 bg-gray-50 rounded-md cursor-move hover:bg-gray-100 transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, component.id)}
                    onClick={() => onAddComponent(component.id)}
                  >
                    <span className="text-sm text-gray-700">{component.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}