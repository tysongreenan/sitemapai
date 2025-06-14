import React, { useState } from 'react';
import { X, Sparkles, Send, Copy, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface AppModalProps {
  app: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    inputs: Array<{
      id: string;
      label: string;
      type: 'text' | 'textarea' | 'select';
      placeholder?: string;
      options?: string[];
      required?: boolean;
    }>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppModal({ app, isOpen, onClose }: AppModalProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string>('');

  if (!app || !isOpen) return null;

  const handleInputChange = (inputId: string, value: string) => {
    setInputs(prev => ({ ...prev, [inputId]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock result based on app type
    let mockResult = '';
    
    switch (app.id) {
      case 'blog-post':
        mockResult = `# ${inputs.topic || 'Your Topic Here'}

## Introduction

In today's rapidly evolving digital landscape, ${inputs.topic?.toLowerCase() || 'this topic'} has become increasingly important for businesses looking to stay competitive and relevant.

## Key Points

### 1. Understanding the Fundamentals
${inputs.topic || 'This subject'} requires a deep understanding of both technical and strategic elements. Companies that master these fundamentals often see significant improvements in their overall performance.

### 2. Implementation Strategies
When implementing ${inputs.topic?.toLowerCase() || 'these concepts'}, it's crucial to:
- Start with a clear strategy
- Measure progress consistently
- Adapt based on results
- Invest in the right tools and training

### 3. Best Practices
Industry leaders recommend focusing on:
- User experience optimization
- Data-driven decision making
- Continuous improvement processes
- Cross-functional collaboration

## Conclusion

${inputs.topic || 'This approach'} represents a significant opportunity for forward-thinking organizations. By embracing these strategies and maintaining a commitment to excellence, businesses can achieve remarkable results.

---

*Ready to implement these strategies? Contact our team for personalized guidance.*`;
        break;
        
      case 'social-media':
        mockResult = `🚀 **Instagram Post:**
"${inputs.message || 'Your message here'} ✨

Ready to transform your approach? Here's what we've learned:

💡 Tip 1: Start small, think big
📈 Tip 2: Measure everything
🎯 Tip 3: Focus on value

What's your biggest challenge? Drop it below! 👇

#Marketing #Growth #Success #Innovation"

---

📱 **Twitter Post:**
"${inputs.message || 'Your message here'} 

3 game-changing insights:
→ Quality over quantity
→ Consistency beats perfection  
→ Community drives growth

What would you add to this list? 🤔"

---

💼 **LinkedIn Post:**
"${inputs.message || 'Your message here'}

After working with 100+ companies, here's what separates the leaders from the followers:

1. They embrace change instead of resisting it
2. They invest in their people, not just technology
3. They measure impact, not just activity

The question isn't whether you should adapt—it's how quickly you can do it.

What's your experience been? Share your thoughts below."`;
        break;
        
      default:
        mockResult = `Generated content for ${app.name}:

Based on your inputs, here's a customized result that addresses your specific needs and requirements. This content has been optimized for your target audience and brand voice.

Key elements included:
- Relevant messaging for your industry
- Optimized structure and formatting
- Call-to-action elements
- SEO-friendly content

You can use this content directly or modify it to better fit your specific requirements.`;
    }
    
    setResult(mockResult);
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  const addToProject = () => {
    // Add to current project canvas
    if ((window as any).addCanvasItem) {
      (window as any).addCanvasItem('text', result, `${app.name} Output`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-indigo-600">
              {app.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{app.name}</h2>
              <p className="text-sm text-gray-600">{app.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Input Panel */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
            
            <div className="space-y-4">
              {app.inputs.map(input => (
                <div key={input.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {input.label}
                    {input.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {input.type === 'text' && (
                    <Input
                      value={inputs[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                    />
                  )}
                  
                  {input.type === 'textarea' && (
                    <Textarea
                      value={inputs[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                      rows={4}
                    />
                  )}
                  
                  {input.type === 'select' && (
                    <select
                      value={inputs[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select an option</option>
                      {input.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              isLoading={isGenerating}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              leftIcon={<Sparkles size={16} />}
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </Button>
          </div>

          {/* Output Panel */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
              {result && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy size={16} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download size={16} />
                  </Button>
                </div>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {result}
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={addToProject}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Add to Project
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save as Template
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Configure the inputs and click "Generate Content" to see your results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}