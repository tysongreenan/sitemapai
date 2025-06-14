import React, { useState } from 'react';
import { Save, Upload, Mic, FileText, Sparkles, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface BrandVoiceData {
  name: string;
  description: string;
  tone: string;
  personality: string[];
  writingStyle: string;
  vocabulary: string[];
  examples: string[];
}

export function BrandVoiceSetup() {
  const [brandVoice, setBrandVoice] = useState<BrandVoiceData>({
    name: '',
    description: '',
    tone: 'professional',
    personality: [],
    writingStyle: '',
    vocabulary: [],
    examples: []
  });

  const [currentExample, setCurrentExample] = useState('');
  const [currentVocab, setCurrentVocab] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal, authoritative, and business-focused' },
    { value: 'friendly', label: 'Friendly', description: 'Warm, approachable, and conversational' },
    { value: 'casual', label: 'Casual', description: 'Relaxed, informal, and easy-going' },
    { value: 'authoritative', label: 'Authoritative', description: 'Expert, confident, and commanding' },
    { value: 'playful', label: 'Playful', description: 'Fun, creative, and energetic' },
    { value: 'empathetic', label: 'Empathetic', description: 'Understanding, caring, and supportive' }
  ];

  const personalityTraits = [
    'Innovative', 'Trustworthy', 'Bold', 'Caring', 'Expert', 'Approachable',
    'Reliable', 'Creative', 'Passionate', 'Authentic', 'Inspiring', 'Helpful'
  ];

  const handlePersonalityToggle = (trait: string) => {
    setBrandVoice(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(p => p !== trait)
        : [...prev.personality, trait]
    }));
  };

  const addExample = () => {
    if (currentExample.trim()) {
      setBrandVoice(prev => ({
        ...prev,
        examples: [...prev.examples, currentExample.trim()]
      }));
      setCurrentExample('');
    }
  };

  const removeExample = (index: number) => {
    setBrandVoice(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const addVocabulary = () => {
    if (currentVocab.trim()) {
      setBrandVoice(prev => ({
        ...prev,
        vocabulary: [...prev.vocabulary, currentVocab.trim()]
      }));
      setCurrentVocab('');
    }
  };

  const removeVocabulary = (index: number) => {
    setBrandVoice(prev => ({
      ...prev,
      vocabulary: prev.vocabulary.filter((_, i) => i !== index)
    }));
  };

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis results
    setBrandVoice(prev => ({
      ...prev,
      tone: 'professional',
      personality: ['Innovative', 'Trustworthy', 'Expert'],
      writingStyle: 'Clear, concise, and data-driven with a focus on practical insights',
      vocabulary: ['innovative', 'cutting-edge', 'optimize', 'strategic', 'results-driven']
    }));
    
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    // Save brand voice to database
    console.log('Saving brand voice:', brandVoice);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Voice Setup</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Define your unique brand personality so AI can create content that sounds authentically you
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Voice Name
            </label>
            <Input
              value={brandVoice.name}
              onChange={(e) => setBrandVoice(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., TechCorp Professional Voice"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Tone
            </label>
            <select
              value={brandVoice.tone}
              onChange={(e) => setBrandVoice(prev => ({ ...prev, tone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {toneOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Description
          </label>
          <Textarea
            value={brandVoice.description}
            onChange={(e) => setBrandVoice(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your brand's mission, values, and what makes it unique..."
            rows={3}
          />
        </div>
      </div>

      {/* Personality Traits */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Personality Traits</h2>
        <p className="text-gray-600 mb-4">Select traits that best describe your brand's personality</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {personalityTraits.map(trait => (
            <button
              key={trait}
              onClick={() => handlePersonalityToggle(trait)}
              className={`p-3 rounded-lg border-2 transition-all ${
                brandVoice.personality.includes(trait)
                  ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{trait}</span>
                {brandVoice.personality.includes(trait) && (
                  <Check size={16} className="text-yellow-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Writing Style */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Writing Style</h2>
        <Textarea
          value={brandVoice.writingStyle}
          onChange={(e) => setBrandVoice(prev => ({ ...prev, writingStyle: e.target.value }))}
          placeholder="Describe how your brand communicates. Are you formal or casual? Do you use technical jargon or simple language? Do you prefer short sentences or longer explanations?"
          rows={4}
        />
      </div>

      {/* Vocabulary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Brand Vocabulary</h2>
        <p className="text-gray-600 mb-4">Add words and phrases your brand commonly uses</p>
        
        <div className="flex gap-2 mb-4">
          <Input
            value={currentVocab}
            onChange={(e) => setCurrentVocab(e.target.value)}
            placeholder="Add a word or phrase..."
            onKeyPress={(e) => e.key === 'Enter' && addVocabulary()}
          />
          <Button onClick={addVocabulary} disabled={!currentVocab.trim()}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {brandVoice.vocabulary.map((word, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
            >
              {word}
              <button
                onClick={() => removeVocabulary(index)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Content Examples */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Examples</h2>
        <p className="text-gray-600 mb-4">Provide examples of your brand's existing content</p>
        
        <div className="space-y-4">
          <Textarea
            value={currentExample}
            onChange={(e) => setCurrentExample(e.target.value)}
            placeholder="Paste an example of your brand's writing (email, blog post, social media post, etc.)"
            rows={3}
          />
          <Button onClick={addExample} disabled={!currentExample.trim()}>
            Add Example
          </Button>
        </div>

        {brandVoice.examples.length > 0 && (
          <div className="mt-6 space-y-3">
            {brandVoice.examples.map((example, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">Example {index + 1}</span>
                  <button
                    onClick={() => removeExample(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{example}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Analysis */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">AI Analysis</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Let AI analyze your content examples to automatically detect your brand voice patterns
        </p>
        <Button
          onClick={analyzeContent}
          disabled={brandVoice.examples.length === 0 || isAnalyzing}
          isLoading={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? 'Analyzing Content...' : 'Analyze My Content'}
        </Button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          size="lg"
          leftIcon={<Save size={20} />}
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          Save Brand Voice
        </Button>
      </div>
    </div>
  );
}