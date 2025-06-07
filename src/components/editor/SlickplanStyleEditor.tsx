import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit3, ZoomIn, ZoomOut, Move, Download, Eye, Settings, Copy, Link, Home, FileText, ShoppingCart, Mail, Users, Info, Search, Grid, Layers, Star } from 'lucide-react';

interface PageSection {
  id: string;
  title: string;
  description: string;
  type: 'header' | 'hero' | 'content' | 'feature' | 'cta' | 'footer' | 'form' | 'gallery' | 'testimonial' | 'pricing';
}

interface SitemapPage {
  id: string;
  title: string;
  url: string;
  description?: string;
  pageType: 'page' | 'category' | 'product' | 'blog' | 'contact' | 'about' | 'home';
  sections: PageSection[];
  x: number;
  y: number;
  level: number;
  parentId: string | null;
  children: string[];
  status: 'draft' | 'review' | 'approved' | 'live';
  priority: 'high' | 'medium' | 'low';
}

// Quick start templates - like GlooMaps simplicity
const QUICK_TEMPLATES = {
  business: {
    name: 'Business Website',
    description: 'Professional business site with services and portfolio',
    icon: <Grid size={24} />,
    pages: [
      { title: 'Home', type: 'home' as const, sections: ['header', 'hero', 'feature', 'cta', 'footer'] },
      { title: 'About', type: 'about' as const, sections: ['header', 'hero', 'content', 'footer'] },
      { title: 'Services', type: 'page' as const, sections: ['header', 'content', 'pricing', 'footer'] },
      { title: 'Portfolio', type: 'page' as const, sections: ['header', 'gallery', 'testimonial', 'footer'] },
      { title: 'Contact', type: 'contact' as const, sections: ['header', 'form', 'footer'] }
    ]
  },
  ecommerce: {
    name: 'E-commerce Site',
    description: 'Complete online store with products and checkout',
    icon: <ShoppingCart size={24} />,
    pages: [
      { title: 'Home', type: 'home' as const, sections: ['header', 'hero', 'feature', 'cta', 'footer'] },
      { title: 'Products', type: 'category' as const, sections: ['header', 'content', 'footer'] },
      { title: 'Categories', type: 'category' as const, sections: ['header', 'content', 'footer'] },
      { title: 'Cart', type: 'page' as const, sections: ['header', 'content', 'footer'] },
      { title: 'Checkout', type: 'page' as const, sections: ['header', 'form', 'footer'] },
      { title: 'Account', type: 'page' as const, sections: ['header', 'content', 'footer'] }
    ]
  },
  blog: {
    name: 'Blog/News Site',
    description: 'Content-focused site with articles and categories',
    icon: <Edit3 size={24} />,
    pages: [
      { title: 'Home', type: 'home' as const, sections: ['header', 'hero', 'content', 'footer'] },
      { title: 'Blog', type: 'blog' as const, sections: ['header', 'content', 'footer'] },
      { title: 'About', type: 'about' as const, sections: ['header', 'content', 'footer'] },
      { title: 'Contact', type: 'contact' as const, sections: ['header', 'form', 'footer'] },
      { title: 'Categories', type: 'category' as const, sections: ['header', 'content', 'footer'] }
    ]
  },
  portfolio: {
    name: 'Portfolio Site',
    description: 'Creative portfolio with work showcase',
    icon: <Layers size={24} />,
    pages: [
      { title: 'Home', type: 'home' as const, sections: ['header', 'hero', 'gallery', 'footer'] },
      { title: 'Portfolio', type: 'page' as const, sections: ['header', 'gallery', 'footer'] },
      { title: 'About', type: 'about' as const, sections: ['header', 'content', 'footer'] },
      { title: 'Services', type: 'page' as const, sections: ['header', 'content', 'pricing', 'footer'] },
      { title: 'Contact', type: 'contact' as const, sections: ['header', 'form', 'footer'] }
    ]
  }
};

const PAGE_ICONS = {
  home: <Home size={14} />,
  page: <FileText size={14} />,
  category: <Search size={14} />,
  product: <ShoppingCart size={14} />,
  blog: <Edit3 size={14} />,
  contact: <Mail size={14} />,
  about: <Info size={14} />
};

const SECTION_TYPES = {
  header: { name: 'Header', color: 'bg-blue-100 text-blue-800' },
  hero: { name: 'Hero', color: 'bg-purple-100 text-purple-800' },
  content: { name: 'Content', color: 'bg-gray-100 text-gray-800' },
  feature: { name: 'Features', color: 'bg-green-100 text-green-800' },
  cta: { name: 'Call to Action', color: 'bg-orange-100 text-orange-800' },
  footer: { name: 'Footer', color: 'bg-slate-100 text-slate-800' },
  form: { name: 'Form', color: 'bg-yellow-100 text-yellow-800' },
  gallery: { name: 'Gallery', color: 'bg-pink-100 text-pink-800' },
  testimonial: { name: 'Testimonials', color: 'bg-indigo-100 text-indigo-800' },
  pricing: { name: 'Pricing', color: 'bg-emerald-100 text-emerald-800' }
};

const SlickplanStyleEditor = () => {
  const [sitemap, setSitemap] = useState<{ pages: Record<string, SitemapPage>; rootId: string }>({
    pages: {},
    rootId: ''
  });
  
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Quick start with template - GlooMaps style simplicity
  const startWithTemplate = useCallback((templateKey: keyof typeof QUICK_TEMPLATES) => {
    const template = QUICK_TEMPLATES[templateKey];
    const newPages: Record<string, SitemapPage> = {};
    let rootId = '';

    template.pages.forEach((pageTemplate, index) => {
      const id = `page_${index}`;
      const isRoot = index === 0;
      
      if (isRoot) rootId = id;
      
      newPages[id] = {
        id,
        title: pageTemplate.title,
        url: pageTemplate.title === 'Home' ? '/' : `/${pageTemplate.title.toLowerCase().replace(/\s+/g, '-')}`,
        description: `${pageTemplate.title} page for your ${template.name.toLowerCase()}`,
        pageType: pageTemplate.type,
        sections: pageTemplate.sections.map((sectionType, sIndex) => ({
          id: `${id}_section_${sIndex}`,
          title: SECTION_TYPES[sectionType as keyof typeof SECTION_TYPES]?.name || sectionType,
          description: `${SECTION_TYPES[sectionType as keyof typeof SECTION_TYPES]?.name || sectionType} section`,
          type: sectionType as PageSection['type']
        })),
        x: isRoot ? 400 : 200 + (index - 1) * 220,
        y: isRoot ? 100 : 350,
        level: isRoot ? 0 : 1,
        parentId: isRoot ? null : rootId,
        children: isRoot ? template.pages.slice(1).map((_, i) => `page_${i + 1}`) : [],
        status: 'draft',
        priority: isRoot ? 'high' : 'medium'
      };
    });

    setSitemap({ pages: newPages, rootId });
    setSelectedPageId(rootId);
    setShowQuickStart(false);
  }, []);

  // Start from scratch - one home page
  const startFromScratch = useCallback(() => {
    const homeId = 'home';
    const homePage: SitemapPage = {
      id: homeId,
      title: 'Home',
      url: '/',
      description: 'Main landing page',
      pageType: 'home',
      sections: [
        { id: 'header', title: 'Header', description: 'Site navigation and logo', type: 'header' },
        { id: 'hero', title: 'Hero Section', description: 'Main value proposition', type: 'hero' },
        { id: 'features', title: 'Features', description: 'Key product features', type: 'feature' },
        { id: 'cta', title: 'Call to Action', description: 'Primary conversion section', type: 'cta' },
        { id: 'footer', title: 'Footer', description: 'Links and contact info', type: 'footer' }
      ],
      x: 400,
      y: 100,
      level: 0,
      parentId: null,
      children: [],
      status: 'draft',
      priority: 'high'
    };

    setSitemap({ pages: { [homeId]: homePage }, rootId: homeId });
    setSelectedPageId(homeId);
    setShowQuickStart(false);
  }, []);

  // Generate unique ID
  const generateId = () => `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new page - Slickplan style with smart positioning
  const addPage = useCallback((parentId: string, pageType: SitemapPage['pageType'] = 'page') => {
    const parent = sitemap.pages[parentId];
    if (!parent) return;

    const newId = generateId();
    
    // Smart positioning - arrange children in a row below parent
    const siblingCount = parent.children.length;
    const startX = parent.x - (siblingCount * 110);
    
    const newPage: SitemapPage = {
      id: newId,
      title: `New ${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`,
      url: `/new-${pageType}`,
      description: `A new ${pageType} page`,
      pageType,
      sections: [
        { id: `${newId}_header`, title: 'Header', description: 'Page header', type: 'header' },
        { id: `${newId}_content`, title: 'Content', description: 'Main page content', type: 'content' },
        { id: `${newId}_footer`, title: 'Footer', description: 'Page footer', type: 'footer' }
      ],
      x: startX + (siblingCount * 220),
      y: parent.y + 280,
      level: parent.level + 1,
      parentId,
      children: [],
      status: 'draft',
      priority: 'medium'
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

    setSelectedPageId(newId);
  }, [sitemap.pages]);

  // Delete page
  const deletePage = useCallback((pageId: string) => {
    if (pageId === sitemap.rootId) return;

    const page = sitemap.pages[pageId];
    if (!page || !page.parentId) return;

    setSitemap(prev => {
      const newPages = { ...prev.pages };
      
      // Remove from parent
      if (page.parentId) {
        newPages[page.parentId] = {
          ...newPages[page.parentId],
          children: newPages[page.parentId].children.filter(id => id !== pageId)
        };
      }

      // Delete page and all children recursively
      const deleteRecursive = (id: string) => {
        const pageToDelete = newPages[id];
        if (pageToDelete) {
          pageToDelete.children.forEach(deleteRecursive);
          delete newPages[id];
        }
      };
      
      deleteRecursive(pageId);

      return { ...prev, pages: newPages };
    });

    if (selectedPageId === pageId) {
      setSelectedPageId(page.parentId || sitemap.rootId);
    }
  }, [sitemap.pages, sitemap.rootId, selectedPageId]);

  // Update page
  const updatePage = useCallback((pageId: string, updates: Partial<SitemapPage>) => {
    setSitemap(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageId]: {
          ...prev.pages[pageId],
          ...updates
        }
      }
    }));
  }, []);

  // Add section to page
  const addSection = useCallback((pageId: string, sectionType: PageSection['type']) => {
    const page = sitemap.pages[pageId];
    if (!page) return;

    const newSection: PageSection = {
      id: `${pageId}_section_${Date.now()}`,
      title: SECTION_TYPES[sectionType]?.name || sectionType,
      description: `${SECTION_TYPES[sectionType]?.name || sectionType} section`,
      type: sectionType
    };

    updatePage(pageId, {
      sections: [...page.sections, newSection]
    });
  }, [sitemap.pages, updatePage]);

  // Remove section from page
  const removeSection = useCallback((pageId: string, sectionId: string) => {
    const page = sitemap.pages[pageId];
    if (!page) return;

    updatePage(pageId, {
      sections: page.sections.filter(s => s.id !== sectionId)
    });
  }, [sitemap.pages, updatePage]);

  // Zoom controls
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(0.25, Math.min(2, prev + delta)));
  }, []);

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Fit view to show all pages
  const fitView = useCallback(() => {
    if (Object.keys(sitemap.pages).length === 0) return;

    const pages = Object.values(sitemap.pages);
    const minX = Math.min(...pages.map(p => p.x)) - 50;
    const maxX = Math.max(...pages.map(p => p.x + 200)) + 50;
    const minY = Math.min(...pages.map(p => p.y)) - 50;
    const maxY = Math.max(...pages.map(p => p.y + 200)) + 50;

    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1) * 0.9;

    setZoom(newZoom);
    setPanOffset({
      x: (canvasWidth - contentWidth * newZoom) / 2 - minX * newZoom,
      y: (canvasHeight - contentHeight * newZoom) / 2 - minY * newZoom
    });
  }, [sitemap.pages]);

  // Render connection lines - Slickplan style
  const renderConnections = () => {
    return Object.values(sitemap.pages).map(page => {
      if (!page.parentId) return null;
      
      const parent = sitemap.pages[page.parentId];
      if (!parent) return null;

      const startX = (parent.x + 100) * zoom + panOffset.x;
      const startY = (parent.y + 160) * zoom + panOffset.y;
      const endX = (page.x + 100) * zoom + panOffset.x;
      const endY = (page.y) * zoom + panOffset.y;

      const midY = startY + (endY - startY) * 0.5;

      return (
        <svg
          key={`connection-${page.id}`}
          className="absolute pointer-events-none"
          style={{ left: 0, top: 0, width: '100%', height: '100%', zIndex: 0 }}
        >
          <defs>
            <marker
              id={`arrowhead-${page.id}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
            </marker>
          </defs>
          <path
            d={`M ${startX} ${startY} 
                C ${startX} ${midY} ${endX} ${midY} ${endX} ${endY}`}
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            markerEnd={`url(#arrowhead-${page.id})`}
            className="drop-shadow-sm"
          />
        </svg>
      );
    });
  };

  // Render page card - Slickplan style with rich details
  const renderPageCard = (page: SitemapPage) => {
    const isSelected = selectedPageId === page.id;
    const pageIcon = PAGE_ICONS[page.pageType] || PAGE_ICONS.page;

    const statusColors = {
      draft: 'bg-gray-100 text-gray-700 border-gray-300',
      review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      approved: 'bg-blue-100 text-blue-700 border-blue-300',
      live: 'bg-green-100 text-green-700 border-green-300'
    };

    const priorityColors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };

    return (
      <div
        key={page.id}
        className={`absolute bg-white rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
          isSelected 
            ? 'ring-3 ring-indigo-400 shadow-2xl scale-105' 
            : 'hover:shadow-xl border border-gray-200 hover:scale-102'
        }`}
        style={{ 
          left: page.x * zoom + panOffset.x, 
          top: page.y * zoom + panOffset.y,
          width: `${200 * zoom}px`,
          zIndex: isSelected ? 20 : 10,
          fontSize: `${zoom}rem`
        }}
        onClick={() => setSelectedPageId(page.id)}
      >
        {/* Priority Indicator */}
        <div 
          className={`absolute -top-1 -left-1 w-3 h-3 rounded-full ${priorityColors[page.priority]} ring-2 ring-white`}
          title={`${page.priority} priority`}
        />

        {/* Page Header */}
        <div className={`px-4 py-3 rounded-t-xl ${
          page.pageType === 'home' 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
            : 'bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className={page.pageType === 'home' ? 'text-white' : 'text-gray-600'}>
              {pageIcon}
            </span>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-sm truncate ${
                page.pageType === 'home' ? 'text-white' : 'text-gray-900'
              }`}>
                {page.title}
              </div>
              <div className={`text-xs truncate ${
                page.pageType === 'home' ? 'text-indigo-100' : 'text-gray-500'
              }`}>
                {page.url}
              </div>
            </div>
            {page.pageType === 'home' && (
              <Star size={12} className="text-yellow-300 fill-current" />
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="px-4 py-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[page.status]}`}>
            {page.status}
          </span>
        </div>

        {/* Page Content */}
        <div className="px-4 pb-4">
          {page.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {page.description}
            </p>
          )}

          {/* Sections Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                Sections ({page.sections.length})
              </span>
            </div>
            
            <div className="space-y-1">
              {page.sections.slice(0, 3).map(section => (
                <div 
                  key={section.id}
                  className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mr-1 mb-1 ${
                    SECTION_TYPES[section.type]?.color || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {section.title}
                </div>
              ))}
              {page.sections.length > 3 && (
                <span className="text-xs text-gray-400 block">
                  +{page.sections.length - 3} more sections
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isSelected && (
          <div className="absolute -top-3 -right-3 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addPage(page.id);
              }}
              className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 shadow-lg transition-all hover:scale-110"
              title="Add child page"
            >
              <Plus size={16} />
            </button>
            
            {page.id !== sitemap.rootId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(page.id);
                }}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all hover:scale-110"
                title="Delete page"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const selectedPage = sitemap.pages[selectedPageId];

  // Quick Start Screen - GlooMaps style
  if (showQuickStart) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-6xl w-full mx-auto p-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Create Your Sitemap
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with a professional template or build from scratch. Get your website structure planned in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.entries(QUICK_TEMPLATES).map(([key, template]) => (
              <div
                key={key}
                onClick={() => startWithTemplate(key as keyof typeof QUICK_TEMPLATES)}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-indigo-200 hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-indigo-600">{template.icon}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="text-xs text-indigo-600 font-medium mb-3">
                    {template.pages.length} pages included
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {template.pages.slice(0, 4).map(page => (
                      <span key={page.title} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {page.title}
                      </span>
                    ))}
                    {template.pages.length > 4 && (
                      <span className="text-xs text-gray-400">+{template.pages.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={startFromScratch}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus size={20} />
              Start from Scratch
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Build your sitemap from a single home page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Toolbar - Slickplan style */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-900">Sitemap Editor</h1>
          
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.25)}
              className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={fitView}
              className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
              title="Fit to view"
            >
              <Move size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
            <Eye size={16} />
            Preview
          </button>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2 transition-colors shadow-sm">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-hidden cursor-move bg-gradient-to-br from-gray-50 to-gray-100"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="relative transition-transform duration-200"
            style={{ 
              width: '4000px', 
              height: '3000px'
            }}
          >
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  radial-gradient(circle, #d1d5db 1px, transparent 1px)
                `,
                backgroundSize: `${25 * zoom}px ${25 * zoom}px`,
                backgroundPosition: `${panOffset.x % (25 * zoom)}px ${panOffset.y % (25 * zoom)}px`
              }}
            />
            
            {/* Connection Lines */}
            {renderConnections()}
            
            {/* Page Cards */}
            {Object.values(sitemap.pages).map(renderPageCard)}
          </div>

          {/* Empty State */}
          {Object.keys(sitemap.pages).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pages yet</h3>
                <p className="text-gray-500 mb-4">Start building your sitemap</p>
                <button
                  onClick={startFromScratch}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  Add Home Page
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Slickplan style details */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedPage ? selectedPage.title : 'Select a page'}
            </h3>
            {selectedPage && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-600">{PAGE_ICONS[selectedPage.pageType]}</span>
                <span className="text-sm text-gray-500 font-mono">{selectedPage.url}</span>
              </div>
            )}
          </div>

          {selectedPage ? (
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Page Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Page Type
                  </label>
                  <select
                    value={selectedPage.pageType}
                    onChange={(e) => updatePage(selectedPageId, { pageType: e.target.value as SitemapPage['pageType'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="page">Page</option>
                    <option value="category">Category</option>
                    <option value="product">Product</option>
                    <option value="blog">Blog</option>
                    <option value="contact">Contact</option>
                    <option value="about">About</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedPage.status}
                    onChange={(e) => updatePage(selectedPageId, { status: e.target.value as SitemapPage['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                    <option value="live">Live</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={selectedPage.priority}
                  onChange={(e) => updatePage(selectedPageId, { priority: e.target.value as SitemapPage['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => addPage(selectedPageId)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  Add Child
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors">
                  <Copy size={16} />
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors">
                  <Link size={16} />
                </button>
              </div>

              {/* Page Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={selectedPage.title}
                    onChange={(e) => updatePage(selectedPageId, { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="text"
                    value={selectedPage.url}
                    onChange={(e) => updatePage(selectedPageId, { url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={selectedPage.description || ''}
                    onChange={(e) => updatePage(selectedPageId, { description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Describe this page's purpose and content..."
                  />
                </div>
              </div>

              {/* Sections Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Page Sections</h4>
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addSection(selectedPageId, e.target.value as PageSection['type']);
                          e.target.value = '';
                        }
                      }}
                      className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Add Section</option>
                      {Object.entries(SECTION_TYPES).map(([key, type]) => (
                        <option key={key} value={key}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedPage.sections.map((section, index) => (
                    <div key={section.id} className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            SECTION_TYPES[section.type]?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {section.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{section.description}</p>
                      </div>
                      <button
                        onClick={() => removeSection(selectedPageId, section.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {selectedPage.sections.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Layers size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No sections yet</p>
                      <p className="text-xs">Add sections to structure your page</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hierarchy Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Page Hierarchy</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{selectedPage.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parent:</span>
                    <span className="font-medium">
                      {selectedPage.parentId 
                        ? sitemap.pages[selectedPage.parentId]?.title 
                        : 'None (Root)'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Children:</span>
                    <span className="font-medium">{selectedPage.children.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Grid size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Select a page to edit</p>
                <p className="text-sm">Click on any page in the canvas to view and edit its details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlickplanStyleEditor;