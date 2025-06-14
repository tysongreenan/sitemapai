import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Lightbulb, FileText, Image, BarChart3, Video, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  generatedContent?: {
    type: 'text' | 'image' | 'chart' | 'video';
    title: string;
    content: string;
  };
}

interface AIChatbotProps {
  projectId: string;
  brandVoice?: string;
  audience?: string;
}

export function AIChatbot({ projectId, brandVoice, audience }: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: `Hi! I'm your AI marketing assistant. I'm here to help you create amazing content for your project. I can generate blog posts, social media content, marketing copy, images, and more!

${brandVoice ? `I'll use your "${brandVoice}" brand voice` : 'Set up your brand voice in Jasper IQ for personalized content'} ${audience ? `and target your "${audience}" audience.` : 'and define your target audience for better results.'}

What would you like to create today?`,
      timestamp: new Date(),
      suggestions: [
        'Write a blog post about our product',
        'Create social media content',
        'Generate email marketing copy',
        'Design a marketing campaign'
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Simulate AI response
  const generateAIResponse = async (userMessage: string): Promise<ChatMessage> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const messageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine response type based on user input
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('blog') || lowerMessage.includes('article') || lowerMessage.includes('post')) {
      return {
        id: messageId,
        type: 'ai',
        content: `I'll create a blog post for you! Here's a comprehensive article that aligns with your brand voice and targets your audience effectively.`,
        timestamp: new Date(),
        generatedContent: {
          type: 'text',
          title: 'AI-Powered Marketing: The Future is Here',
          content: `# AI-Powered Marketing: The Future is Here

The marketing landscape is evolving at breakneck speed, and artificial intelligence is leading the charge. As we step into 2024, businesses that embrace AI-powered marketing strategies are seeing unprecedented results.

## Why AI Marketing Matters

AI marketing isn't just a buzzword—it's a game-changer. Here's why:

- **Personalization at Scale**: AI can analyze customer data to create personalized experiences for thousands of customers simultaneously
- **Predictive Analytics**: Anticipate customer needs before they even know them
- **Automated Optimization**: Continuously improve campaigns without manual intervention

## Key AI Marketing Strategies

### 1. Intelligent Content Creation
AI can generate blog posts, social media content, and email campaigns that resonate with your audience.

### 2. Dynamic Pricing
Adjust prices in real-time based on demand, competition, and customer behavior.

### 3. Chatbot Customer Service
Provide 24/7 customer support with AI-powered chatbots that learn from every interaction.

## Getting Started

The future of marketing is here, and it's powered by AI. Start small, experiment, and scale what works. Your customers—and your bottom line—will thank you.`
        },
        suggestions: [
          'Create social media posts for this blog',
          'Generate email campaign about AI marketing',
          'Design infographic about AI benefits',
          'Write a follow-up article'
        ]
      };
    }
    
    if (lowerMessage.includes('social') || lowerMessage.includes('instagram') || lowerMessage.includes('twitter') || lowerMessage.includes('facebook')) {
      return {
        id: messageId,
        type: 'ai',
        content: `Perfect! I'll create engaging social media content that captures attention and drives engagement. Here are some posts tailored to your brand:`,
        timestamp: new Date(),
        generatedContent: {
          type: 'text',
          title: 'Social Media Content Pack',
          content: `🚀 **Instagram Post 1:**
"The future of marketing is here, and it's powered by AI! 🤖✨ 

From personalized customer experiences to predictive analytics, AI is transforming how we connect with our audience. 

What's your favorite AI marketing tool? Drop it in the comments! 👇

#AIMarketing #DigitalTransformation #MarketingTech #Innovation"

---

📱 **Twitter Thread:**
1/ AI marketing isn't just hype—it's reality. Here's how it's changing the game: 🧵

2/ Personalization at scale: AI analyzes customer data to create unique experiences for thousands simultaneously 📊

3/ Predictive analytics: Know what your customers want before they do 🔮

4/ Automated optimization: Your campaigns improve themselves 24/7 ⚡

5/ Ready to embrace the future? Start with one AI tool and scale from there 🚀

---

💼 **LinkedIn Post:**
"Just implemented AI-powered personalization in our marketing stack. The results? 

📈 40% increase in engagement
🎯 60% better targeting accuracy  
⏰ 50% time saved on content creation

AI isn't replacing marketers—it's making us superhuman. What AI tools are transforming your marketing strategy?"

---

📧 **Email Subject Lines:**
• "Your AI marketing assistant is waiting..."
• "The marketing secret your competitors don't know"
• "How AI increased our ROI by 300%"
• "Future-proof your marketing in 2024"`
        },
        suggestions: [
          'Create images for these posts',
          'Write email campaign copy',
          'Generate video script',
          'Plan content calendar'
        ]
      };
    }
    
    if (lowerMessage.includes('email') || lowerMessage.includes('newsletter') || lowerMessage.includes('campaign')) {
      return {
        id: messageId,
        type: 'ai',
        content: `I'll craft a compelling email campaign that drives conversions and builds relationships with your audience:`,
        timestamp: new Date(),
        generatedContent: {
          type: 'text',
          title: 'Email Marketing Campaign',
          content: `**Subject Line:** "The AI marketing revolution starts now (and you're invited)"

**Preview Text:** "Discover how leading brands are using AI to 10x their marketing results..."

---

**Email Body:**

Hi [First Name],

What if I told you that while you're reading this email, AI is helping thousands of marketers:

✅ Create personalized content in seconds
✅ Predict which customers will buy next
✅ Optimize campaigns automatically
✅ Generate ROI that seemed impossible just years ago

The AI marketing revolution isn't coming—it's here.

**Here's what industry leaders are saying:**

"AI helped us increase email open rates by 45% and conversions by 60% in just 3 months." - Sarah Chen, Marketing Director at TechCorp

**Ready to join them?**

We're hosting an exclusive webinar: "AI Marketing Mastery: From Zero to Hero in 30 Days"

🗓️ **When:** Next Tuesday, 2 PM EST
🎯 **What you'll learn:**
• The 3 AI tools every marketer needs
• How to implement AI without breaking the bank  
• Real case studies with actual ROI numbers
• Live Q&A with AI marketing experts

[REGISTER NOW - FREE]

**P.S.** The first 100 registrants get our "AI Marketing Toolkit" (valued at $297) absolutely free.

**Can't make it live?** No worries! All registrants get the replay + bonus materials.

Talk soon,
[Your Name]

---

**Follow-up Email 1 (3 days later):**
Subject: "Last chance: AI marketing secrets revealed tomorrow"

**Follow-up Email 2 (1 week later):**
Subject: "Missed the webinar? Here's what happened..."

**Follow-up Email 3 (2 weeks later):**
Subject: "[First Name], your AI marketing journey starts here"`
        },
        suggestions: [
          'Create landing page copy',
          'Design email templates',
          'Write follow-up sequences',
          'Generate A/B test variations'
        ]
      };
    }
    
    if (lowerMessage.includes('image') || lowerMessage.includes('visual') || lowerMessage.includes('graphic') || lowerMessage.includes('design')) {
      return {
        id: messageId,
        type: 'ai',
        content: `I'll help you create stunning visuals! Here's a concept for your marketing imagery:`,
        timestamp: new Date(),
        generatedContent: {
          type: 'image',
          title: 'AI Marketing Visual Concept',
          content: `**Visual Concept: "AI Marketing Dashboard"**

**Description:**
A sleek, modern dashboard interface showing AI marketing metrics and insights. The design features:

• Clean, minimalist layout with gradient backgrounds (blue to purple)
• Floating holographic charts and graphs
• AI brain icon with neural network connections
• Real-time data visualizations
• Futuristic UI elements with subtle animations

**Color Palette:**
- Primary: Deep blue (#1e40af) to purple (#7c3aed) gradient
- Accent: Electric blue (#06b6d4)
- Text: White and light gray
- Background: Dark navy (#0f172a)

**Typography:**
- Headlines: Bold, modern sans-serif
- Body: Clean, readable font
- Data: Monospace for numbers

**Elements to Include:**
- ROI metrics showing 300% increase
- Engagement graphs trending upward  
- AI assistant chat interface
- Social media performance indicators
- Email campaign analytics

**Dimensions:** 1200x800px (perfect for social media and web)

**Style:** Modern, tech-forward, professional yet approachable`
        },
        suggestions: [
          'Generate more image concepts',
          'Create social media graphics',
          'Design infographic layout',
          'Make video thumbnail'
        ]
      };
    }

    // Default response
    return {
      id: messageId,
      type: 'ai',
      content: `I understand you'd like help with "${userMessage}". I can assist you with creating various types of marketing content including:

• **Blog posts and articles** - SEO-optimized, engaging content
• **Social media content** - Posts, captions, and hashtags  
• **Email campaigns** - Subject lines, sequences, and newsletters
• **Marketing copy** - Landing pages, ads, and sales materials
• **Visual concepts** - Image ideas and design briefs
• **Video scripts** - YouTube, TikTok, and promotional videos

What specific type of content would you like me to create for your project?`,
      timestamp: new Date(),
      suggestions: [
        'Write a blog post',
        'Create social media content',
        'Generate email campaign',
        'Design marketing visuals'
      ]
    };
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      
      // Add content to canvas if generated
      if (aiResponse.generatedContent && (window as any).addCanvasItem) {
        (window as any).addCanvasItem(
          aiResponse.generatedContent.type,
          aiResponse.generatedContent.content,
          aiResponse.generatedContent.title
        );
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy content to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-600">Your marketing co-pilot</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Avatar */}
              <div className={`flex items-center gap-2 mb-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-gray-200 order-2' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 order-1'
                }`}>
                  {message.type === 'user' ? (
                    <User size={14} className="text-gray-600" />
                  ) : (
                    <Bot size={14} className="text-white" />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Content */}
              <div className={`rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>

                {/* Generated Content */}
                {message.generatedContent && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {message.generatedContent.type === 'text' && <FileText size={16} className="text-blue-600" />}
                        {message.generatedContent.type === 'image' && <Image size={16} className="text-green-600" />}
                        {message.generatedContent.type === 'chart' && <BarChart3 size={16} className="text-purple-600" />}
                        {message.generatedContent.type === 'video' && <Video size={16} className="text-orange-600" />}
                        <span className="text-sm font-medium text-gray-900">
                          {message.generatedContent.title}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(message.generatedContent!.content)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                      {message.generatedContent.content.length > 200 
                        ? `${message.generatedContent.content.substring(0, 200)}...`
                        : message.generatedContent.content
                      }
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Add to Canvas
                      </Button>
                      <button className="p-1 text-gray-400 hover:text-green-600">
                        <ThumbsUp size={14} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left p-2 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-colors"
                      >
                        <Lightbulb size={12} className="inline mr-2" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to create marketing content..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="sm"
            className="px-3"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}