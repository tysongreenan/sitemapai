import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Edit3, Globe, ChevronDown, ChevronRight } from 'lucide-react';

// Simple data structure - no React Flow complexity
interface SitemapPage {
  id: string;
  title: string;
  url: string;
  description?: string;
  parentId: string | null;
  children: string[];
  level: number;
  sections: string[];
}

interface SitemapData {
  pages: Record<string, SitemapPage>;
  rootId: string;
}

// Simple tree-based sitemap editor
const NewSitemapEditor = () => {
  // Initial state with just a home page
  const [sitemap, setSitemap] = useState<SitemapData>({
    pages: {
      'home': {
        id: 'home',
        title: 'Home',
        url: '/',
        description: 'Main landing page',
        parentId: null,
        children: [],
        level: 0,
        sections: ['hero', 'features']
      }
    },
    rootId: 'home'
  });

  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set(['home']));
  const [editingPageId, setEditingPageId] = useState<string | null>(null);

  // Helper function to generate new page ID
  const generateId = () => `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add a new page
  const addPage = useCallback((parentId: string, title: string = 'New Page') => {
    const newId = generateId();
    const parent = sitemap.pages[parentId];
    
    if (!parent) return;

    const newPage: SitemapPage = {
      id: newId,
      title,
      url: `/${title.toLowerCase().replace(/\s+/g, '-')}`,
      description: `A new page under ${parent.title}`,
      parentId,
      children: [],
      level: parent.level + 1,
      sections: ['header', 'content']
    };

    setSitemap(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [newId]: newPage,
        [parentId]: {
          ...prev.pages[parentId],
          children: [...prev.pages[parentId].children, newId]
        }
      }
    }));

    // Auto-expand parent and select new page
    setExpandedPages(prev => new Set([...prev, parentId]));
    setSelectedPageId(newId);
    
    console.log('✅ Added new page:', newPage);
  }, [sitemap.pages]);

  // Delete a page
  const deletePage = useCallback((pageId: string) => {
    const page = sitemap.pages[pageId];
    if (!page || pageId === sitemap.rootId) return; // Can't delete root

    // Remove from parent's children
    if (page.parentId) {
      const parent = sitemap.pages[page.parentId];
      if (parent) {
        setSitemap(prev => ({
          ...prev,
          pages: {
            ...prev.pages,
            [parent.id]: {
              ...parent,
              children: parent.children.filter(id => id !== pageId)
            }
          }
        }));
      }
    }

    // Remove the page and all its children recursively
    const removePageAndChildren = (id: string, pages: Record<string, SitemapPage>) => {
      const { [id]: removed, ...rest } = pages;
      let result = rest;
      
      if (removed) {
        removed.children.forEach(childId => {
          result = removePageAndChildren(childId, result);
        });
      }
      
      return result;
    };

    setSitemap(prev => ({
      ...prev,
      pages: removePageAndChildren(pageId, prev.pages)
    }));

    // Select parent if we deleted the selected page
    if (selectedPageId === pageId) {
      setSelectedPageId(page.parentId || sitemap.rootId);
    }

    console.log('🗑️ Deleted page:', pageId);
  }, [sitemap.pages, sitemap.rootId, selectedPageId]);

  // Update page details
  const updatePage = useCallback((pageId: string, updates: Partial<SitemapPage>) => {
    setSitemap(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageId]: {
          ...prev.pages[pageId],
          ...updates,
          // Auto-update URL when title changes
          ...(updates.title && {
            url: `/${updates.title.toLowerCase().replace(/\s+/g, '-')}`
          })
        }
      }
    }));
  }, []);

  // Toggle page expansion
  const toggleExpanded = useCallback((pageId: string) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  }, []);

  // Render a single page in the tree
  const renderPage = (pageId: string): React.ReactNode => {
    const page = sitemap.pages[pageId];
    if (!page) return null;

    const isSelected = selectedPageId === pageId;
    const isExpanded = expandedPages.has(pageId);
    const hasChildren = page.children.length > 0;
    const isEditing = editingPageId === pageId;

    return (
      <div key={pageId} className="select-none">
        {/* Page row */}
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all group ${
            isSelected 
              ? 'bg-blue-100 border-2 border-blue-300' 
              : 'hover:bg-gray-50 border-2 border-transparent'
          }`}
          style={{ marginLeft: `${page.level * 20}px` }}
          onClick={() => setSelectedPageId(pageId)}
        >
          {/* Expand/collapse button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(pageId);
            }}
            className={`w-5 h-5 flex items-center justify-center ${
              hasChildren ? 'text-gray-600' : 'text-transparent'
            }`}
          >
            {hasChildren && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </button>

          {/* Page icon */}
          <Globe size={16} className="text-blue-500 flex-shrink-0" />

          {/* Page title */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={page.title}
                onChange={(e) => updatePage(pageId, { title: e.target.value })}
                onBlur={() => setEditingPageId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingPageId(null);
                  if (e.key === 'Escape') setEditingPageId(null);
                }}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
            ) : (
              <div className="truncate">
                <div className="font-medium text-sm">{page.title}</div>
                <div className="text-xs text-gray-500">{page.url}</div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addPage(pageId);
              }}
              className="w-6 h-6 flex items-center justify-center text-green-600 hover:bg-green-100 rounded"
              title="Add child page"
            >
              <Plus size={14} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingPageId(pageId);
              }}
              className="w-6 h-6 flex items-center justify-center text-blue-600 hover:bg-blue-100 rounded"
              title="Edit page"
            >
              <Edit3 size={14} />
            </button>

            {pageId !== sitemap.rootId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(pageId);
                }}
                className="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-100 rounded"
                title="Delete page"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {page.children.map(childId => renderPage(childId))}
          </div>
        )}
      </div>
    );
  };

  // Get selected page for details panel
  const selectedPage = sitemap.pages[selectedPageId];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar - Tree View */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sitemap</h2>
          <p className="text-sm text-gray-500">
            {Object.keys(sitemap.pages).length} pages
          </p>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-auto p-2">
          <div className="group">
            {renderPage(sitemap.rootId)}
          </div>
        </div>

        {/* Add root sibling button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              const rootPage = sitemap.pages[sitemap.rootId];
              if (rootPage.parentId) {
                addPage(rootPage.parentId);
              } else {
                // Create a new root sibling (this would need more complex logic)
                console.log('Would create root sibling');
              }
            }}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Top-Level Page
          </button>
        </div>
      </div>

      {/* Main Content - Selected Page Details */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {selectedPage?.title || 'No Page Selected'}
            </h1>
            <p className="text-sm text-gray-500">{selectedPage?.url}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => selectedPage && addPage(selectedPageId)}
              className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Child
            </button>
          </div>
        </div>

        {/* Page Details */}
        <div className="flex-1 overflow-auto p-6">
          {selectedPage ? (
            <div className="max-w-2xl space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Page Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedPage.title}
                      onChange={(e) => updatePage(selectedPageId, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      value={selectedPage.url}
                      onChange={(e) => updatePage(selectedPageId, { url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={selectedPage.description || ''}
                    onChange={(e) => updatePage(selectedPageId, { description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sections */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Page Sections</h3>
                
                <div className="space-y-2">
                  {selectedPage.sections.map((section, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="flex-1 text-sm font-medium">{section}</span>
                      <button
                        onClick={() => {
                          const newSections = selectedPage.sections.filter((_, i) => i !== index);
                          updatePage(selectedPageId, { sections: newSections });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const newSection = `Section ${selectedPage.sections.length + 1}`;
                      updatePage(selectedPageId, { 
                        sections: [...selectedPage.sections, newSection] 
                      });
                    }}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                  >
                    + Add Section
                  </button>
                </div>
              </div>

              {/* Hierarchy Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hierarchy</h3>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Level:</strong> {selectedPage.level}</div>
                  <div><strong>Parent:</strong> {
                    selectedPage.parentId 
                      ? sitemap.pages[selectedPage.parentId]?.title 
                      : 'None (Root)'
                  }</div>
                  <div><strong>Children:</strong> {selectedPage.children.length}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a page from the tree to edit its details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewSitemapEditor;