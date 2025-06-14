import React, { useState } from 'react';
import { Upload, FileText, Image, Link, Trash2, Download, Search, Filter, Plus, Database } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface KnowledgeItem {
  id: string;
  title: string;
  type: 'document' | 'url' | 'text' | 'image';
  content: string;
  size?: string;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
}

export function KnowledgeBase() {
  const [items, setItems] = useState<KnowledgeItem[]>([
    {
      id: '1',
      title: 'Company Brand Guidelines',
      type: 'document',
      content: 'Brand guidelines document with logos, colors, and typography rules',
      size: '2.4 MB',
      uploadedAt: new Date('2024-01-15'),
      status: 'ready'
    },
    {
      id: '2',
      title: 'Product Documentation',
      type: 'url',
      content: 'https://docs.company.com/products',
      uploadedAt: new Date('2024-01-14'),
      status: 'ready'
    },
    {
      id: '3',
      title: 'Customer Success Stories',
      type: 'text',
      content: 'Collection of customer testimonials and case studies',
      uploadedAt: new Date('2024-01-13'),
      status: 'processing'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    
    for (const file of Array.from(files)) {
      const newItem: KnowledgeItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        content: `Uploaded file: ${file.name}`,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadedAt: new Date(),
        status: 'processing'
      };
      
      setItems(prev => [...prev, newItem]);
      
      // Simulate processing
      setTimeout(() => {
        setItems(prev => prev.map(item => 
          item.id === newItem.id ? { ...item, status: 'ready' } : item
        ));
      }, 2000);
    }
    
    setIsUploading(false);
  };

  const handleUrlAdd = () => {
    const url = prompt('Enter URL to add to knowledge base:');
    if (url) {
      const newItem: KnowledgeItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: new URL(url).hostname,
        type: 'url',
        content: url,
        uploadedAt: new Date(),
        status: 'processing'
      };
      
      setItems(prev => [...prev, newItem]);
      
      // Simulate processing
      setTimeout(() => {
        setItems(prev => prev.map(item => 
          item.id === newItem.id ? { ...item, status: 'ready' } : item
        ));
      }, 3000);
    }
  };

  const handleTextAdd = () => {
    const text = prompt('Enter text content:');
    if (text) {
      const newItem: KnowledgeItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `Text Note - ${new Date().toLocaleDateString()}`,
        type: 'text',
        content: text,
        uploadedAt: new Date(),
        status: 'ready'
      };
      
      setItems(prev => [...prev, newItem]);
    }
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getTypeIcon = (type: KnowledgeItem['type']) => {
    switch (type) {
      case 'document': return <FileText size={20} className="text-blue-600" />;
      case 'url': return <Link size={20} className="text-green-600" />;
      case 'text': return <FileText size={20} className="text-purple-600" />;
      case 'image': return <Image size={20} className="text-orange-600" />;
      default: return <FileText size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: KnowledgeItem['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload company information and assets so AI can create more accurate, relevant content
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add to Knowledge Base</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* File Upload */}
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Upload Files</p>
              <p className="text-xs text-gray-500">PDF, DOC, TXT, Images</p>
            </div>
          </div>

          {/* URL Input */}
          <button
            onClick={handleUrlAdd}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <Link className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Website</p>
            <p className="text-xs text-gray-500">Import from URL</p>
          </button>

          {/* Text Input */}
          <button
            onClick={handleTextAdd}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          >
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Text</p>
            <p className="text-xs text-gray-500">Direct text input</p>
          </button>
        </div>

        {isUploading && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Processing files...</span>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="url">URLs</option>
              <option value="text">Text</option>
              <option value="image">Images</option>
            </select>
            
            <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Knowledge Items */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Knowledge Items ({filteredItems.length})
          </h2>
        </div>

        {filteredItems.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.content}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>Uploaded {item.uploadedAt.toLocaleDateString()}</span>
                        {item.size && <span>{item.size}</span>}
                        <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Download size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Database size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No items found' : 'No knowledge items yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Upload documents, add URLs, or input text to build your knowledge base'
              }
            </p>
            {!searchTerm && (
              <Button leftIcon={<Plus size={16} />}>
                Add Your First Item
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}