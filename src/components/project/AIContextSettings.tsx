import React, { useState, useEffect } from 'react';
import { 
  Settings, ChevronDown, Plus, Check, X, Search, 
  Sparkles, Users, FileText, Link2, Upload, 
  Mic, Target, Globe, Brain, Lightbulb, Shield,
  BookOpen, Hash, AlertCircle, User
} from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'react-toastify';

interface BrandVoice {
  id: string;
  name: string;
  description?: string;
  tone?: string;
  vocabulary?: string[];
  examples?: string[];
  icon?: string;
}

interface Audience {
  id: string;
  name: string;
  description?: string;
  demographics?: any;
  painPoints?: string[];
  goals?: string[];
}

interface KnowledgeItem {
  id: string;
  name: string;
  type: 'document' | 'url' | 'text';
  content?: string;
  url?: string;
  addedAt: Date;
  tags?: string[];
}

interface AIContextSettings {
  brandVoiceId?: string;
  audienceId?: string;
  knowledgeIds: string[];
  customInstructions?: string;
  temperature?: number;
  outputFormat?: 'casual' | 'professional' | 'creative';
  language?: string;
  persona?: string; // New persona field
}

interface AIContextSettingsDropdownProps {
  projectId: string;
  currentSettings: AIContextSettings;
  onSettingsChange: (settings: AIContextSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function AIContextSettingsDropdown({ 
  projectId, 
  currentSettings, 
  onSettingsChange,
  isOpen,
  onToggle 
}: AIContextSettingsDropdownProps) {
  const [settings, setSettings] = useState<AIContextSettings>(currentSettings);
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'brand' | 'audience' | 'knowledge' | 'advanced'>('brand');
  const [showCreateModal, setShowCreateModal] = useState<'brand' | 'audience' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Available AI personas
  const personas = [
    {
      id: 'default',
      name: 'Default AI',
      description: 'Professional and balanced AI assistant',
      style: 'Clear, informative, and professional tone'
    },
    {
      id: 'seth_rogen',
      name: 'Seth Rogen',
      description: 'Casual, funny, and relatable comedian style',
      style: 'Conversational, humorous, and down-to-earth with Canadian charm'
    },
    {
      id: 'alex_hormozi',
      name: 'Alex Hormozi',
      description: 'Direct, business-focused entrepreneur style',
      style: 'No-nonsense, value-driven, and results-oriented business advice'
    },
    {
      id: 'gary_vaynerchuk',
      name: 'Gary Vaynerchuk',
      description: 'High-energy, motivational entrepreneur',
      style: 'Passionate, direct, and motivational with hustle mentality'
    },
    {
      id: 'oprah_winfrey',
      name: 'Oprah Winfrey',
      description: 'Inspirational and empowering media personality',
      style: 'Warm, inspiring, and empowering with focus on personal growth'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchContextData();
    }
  }, [isOpen]);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const fetchContextData = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - replace with actual API calls
      const mockBrandVoices: BrandVoice[] = [
        {
          id: '1',
          name: 'Professional & Friendly',
          description: 'Warm yet authoritative tone for business communications',
          tone: 'Professional',
          vocabulary: ['innovative', 'strategic', 'results-driven'],
          examples: ['We help businesses achieve their goals through innovative solutions.']
        },
        {
          id: '2',
          name: 'Casual & Creative',
          description: 'Relaxed and creative voice for social media',
          tone: 'Casual',
          vocabulary: ['awesome', 'amazing', 'game-changing'],
          examples: ['Ready to transform your business? Let\'s make it happen!']
        }
      ];

      const mockAudiences: Audience[] = [
        {
          id: '1',
          name: 'Marketing Professionals',
          description: 'Experienced marketers looking for advanced tools and insights',
          demographics: { age: '25-45', role: 'Marketing Manager' },
          painPoints: ['Time constraints', 'ROI measurement', 'Tool integration'],
          goals: ['Increase efficiency', 'Improve campaign performance']
        },
        {
          id: '2',
          name: 'Small Business Owners',
          description: 'Entrepreneurs managing their own marketing efforts',
          demographics: { age: '30-55', role: 'Business Owner' },
          painPoints: ['Limited budget', 'Lack of expertise', 'Time management'],
          goals: ['Grow customer base', 'Increase revenue']
        }
      ];

      const mockKnowledgeBase: KnowledgeItem[] = [
        {
          id: '1',
          name: 'Company Brand Guidelines',
          type: 'document',
          content: 'Brand guidelines document with logos, colors, and typography rules',
          addedAt: new Date('2024-01-15'),
          tags: ['branding', 'guidelines', 'design']
        },
        {
          id: '2',
          name: 'Product Documentation',
          type: 'url',
          url: 'https://docs.company.com/products',
          addedAt: new Date('2024-01-14'),
          tags: ['product', 'documentation', 'features']
        },
        {
          id: '3',
          name: 'Customer Success Stories',
          type: 'text',
          content: 'Collection of customer testimonials and case studies',
          addedAt: new Date('2024-01-13'),
          tags: ['testimonials', 'case-studies', 'customers']
        }
      ];

      setBrandVoices(mockBrandVoices);
      setAudiences(mockAudiences);
      setKnowledgeBase(mockKnowledgeBase);
    } catch (error) {
      toast.error('Failed to load context data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Saving AI settings for project:', projectId, settings);
      
      onSettingsChange(settings);
      toast.success('AI context settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const getSelectedBrandVoice = () => brandVoices.find(v => v.id === settings.brandVoiceId);
  const getSelectedAudience = () => audiences.find(a => a.id === settings.audienceId);
  const getSelectedKnowledge = () => knowledgeBase.filter(k => settings.knowledgeIds.includes(k.id));
  const getSelectedPersona = () => personas.find(p => p.id === settings.persona) || personas[0];

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Settings size={16} />
        <span className="text-sm font-medium">AI Context</span>
        {(settings.brandVoiceId || settings.audienceId || settings.knowledgeIds.length > 0 || settings.persona) && (
          <div className="flex items-center gap-1">
            {settings.brandVoiceId && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
            {settings.audienceId && <div className="w-2 h-2 bg-green-500 rounded-full" />}
            {settings.knowledgeIds.length > 0 && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
            {settings.persona && settings.persona !== 'default' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
          </div>
        )}
        <ChevronDown size={14} />
      </button>
    );
  }

  return (
    <div className="absolute top-16 left-0 z-50 w-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Context Settings</h3>
            <p className="text-xs text-gray-600">Configure how AI generates content</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'brand', label: 'Brand Voice', icon: Mic },
          { id: 'audience', label: 'Audience', icon: Users },
          { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
          { id: 'advanced', label: 'Advanced', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-5 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Brand Voice Tab */}
            {activeTab === 'brand' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Select Brand Voice</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Plus size={14} />}
                    onClick={() => setShowCreateModal('brand')}
                  >
                    Create New
                  </Button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setSettings({ ...settings, brandVoiceId: undefined })}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      !settings.brandVoiceId 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">None (Default)</span>
                      {!settings.brandVoiceId && <Check size={16} className="text-indigo-600" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use standard AI voice</p>
                  </button>

                  {brandVoices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSettings({ ...settings, brandVoiceId: voice.id })}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        settings.brandVoiceId === voice.id 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mic size={16} className="text-gray-400" />
                          <span className="text-sm font-medium">{voice.name}</span>
                        </div>
                        {settings.brandVoiceId === voice.id && <Check size={16} className="text-indigo-600" />}
                      </div>
                      {voice.description && (
                        <p className="text-xs text-gray-500 mt-1">{voice.description}</p>
                      )}
                      {voice.tone && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Tone: {voice.tone}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {brandVoices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Mic size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No brand voices created yet</p>
                    <Button
                      size="sm"
                      variant="primary"
                      className="mt-3"
                      onClick={() => setShowCreateModal('brand')}
                    >
                      Create Your First Brand Voice
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Audience Tab */}
            {activeTab === 'audience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Select Target Audience</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Plus size={14} />}
                    onClick={() => setShowCreateModal('audience')}
                  >
                    Create New
                  </Button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setSettings({ ...settings, audienceId: undefined })}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      !settings.audienceId 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">None (General)</span>
                      {!settings.audienceId && <Check size={16} className="text-green-600" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Create content for general audience</p>
                  </button>

                  {audiences.map((audience) => (
                    <button
                      key={audience.id}
                      onClick={() => setSettings({ ...settings, audienceId: audience.id })}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        settings.audienceId === audience.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-sm font-medium">{audience.name}</span>
                        </div>
                        {settings.audienceId === audience.id && <Check size={16} className="text-green-600" />}
                      </div>
                      {audience.description && (
                        <p className="text-xs text-gray-500 mt-1">{audience.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Tab */}
            {activeTab === 'knowledge' && (
              <div className="space-y-4">
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700">Select Knowledge Sources</label>
                  <p className="text-xs text-gray-500 mt-1">AI will reference these materials when generating content</p>
                </div>

                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search knowledge base..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {knowledgeBase
                    .filter(item => 
                      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={settings.knowledgeIds.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                knowledgeIds: [...settings.knowledgeIds, item.id]
                              });
                            } else {
                              setSettings({
                                ...settings,
                                knowledgeIds: settings.knowledgeIds.filter(id => id !== item.id)
                              });
                            }
                          }}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {item.type === 'document' && <FileText size={14} className="text-gray-400" />}
                            {item.type === 'url' && <Link2 size={14} className="text-gray-400" />}
                            {item.type === 'text' && <Hash size={14} className="text-gray-400" />}
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {item.tags.map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                </div>

                {settings.knowledgeIds.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-purple-700">
                      <strong>{settings.knowledgeIds.length} sources selected.</strong> AI will use these as reference material.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                {/* AI Persona Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700">AI Persona</label>
                  <p className="text-xs text-gray-500 mt-1 mb-3">Choose how the AI communicates and writes content</p>
                  
                  <div className="space-y-2">
                    {personas.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => setSettings({ ...settings, persona: persona.id })}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          (settings.persona || 'default') === persona.id 
                            ? 'border-orange-500 bg-orange-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="text-sm font-medium">{persona.name}</span>
                          </div>
                          {(settings.persona || 'default') === persona.id && <Check size={16} className="text-orange-600" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{persona.description}</p>
                        <p className="text-xs text-gray-400 mt-1 italic">{persona.style}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Output Format</label>
                  <select
                    value={settings.outputFormat || 'professional'}
                    onChange={(e) => setSettings({ ...settings, outputFormat: e.target.value as any })}
                    className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="casual">Casual & Conversational</option>
                    <option value="professional">Professional & Formal</option>
                    <option value="creative">Creative & Playful</option>
                  </select>
                </div>

                {/* Temperature */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Creativity Level
                    <span className="ml-2 text-xs text-gray-500">
                      ({settings.temperature || 0.7})
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature || 0.7}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Custom Instructions */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Custom Instructions
                    <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={settings.customInstructions || ''}
                    onChange={(e) => setSettings({ ...settings, customInstructions: e.target.value })}
                    placeholder="Add any specific instructions for the AI..."
                    className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    rows={3}
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Language</label>
                  <select
                    value={settings.language || 'en'}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Bar */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Active Context:</span>
          <div className="flex items-center gap-2">
            {settings.brandVoiceId && (
              <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                <Mic size={12} />
                {getSelectedBrandVoice()?.name}
              </div>
            )}
            {settings.audienceId && (
              <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                <Users size={12} />
                {getSelectedAudience()?.name}
              </div>
            )}
            {settings.knowledgeIds.length > 0 && (
              <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                <BookOpen size={12} />
                {settings.knowledgeIds.length} sources
              </div>
            )}
            {settings.persona && settings.persona !== 'default' && (
              <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                <User size={12} />
                {getSelectedPersona().name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <AlertCircle size={14} />
          <span>These settings apply to all AI-generated content</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSettings(currentSettings);
              onToggle();
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              handleSaveSettings();
              onToggle();
            }}
            leftIcon={<Check size={14} />}
          >
            Apply Settings
          </Button>
        </div>
      </div>

      {/* Create Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Create New {showCreateModal === 'brand' ? 'Brand Voice' : 'Audience'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You'll be redirected to the {showCreateModal === 'brand' ? 'Brand Voice' : 'Audience'} creation page.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (showCreateModal === 'brand') {
                    window.open('/jasper-iq', '_blank');
                  } else {
                    window.open('/jasper-iq', '_blank');
                  }
                  setShowCreateModal(null);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { AIContextSettings };