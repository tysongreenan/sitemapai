// src/lib/openai.ts
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  static async generateMarketingContent(
    userRequest: string,
    context: any = {}
  ) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Build system prompt based on persona and context
    let systemPrompt = `You are an expert AI marketing copywriter. When asked to write marketing content, IMMEDIATELY provide the requested content without asking questions or listing what you can do.

You specialize in:
- High-converting landing pages
- Compelling sales copy
- Email campaigns
- Social media content
- Ad copy

Always write in a persuasive, engaging style optimized for conversions.`;

    // Add persona-specific instructions
    if (context.persona && context.persona !== 'default') {
      switch (context.persona) {
        case 'seth_rogen':
          systemPrompt += `\n\nIMPORTANT: Write in Seth Rogen's style - casual, funny, relatable, and down-to-earth with Canadian charm. Use conversational language, occasional humor, and make it feel like a friendly chat. Say things like "dude", "man", "eh?", and keep it relaxed but helpful.`;
          break;
        case 'alex_hormozi':
          systemPrompt += `\n\nIMPORTANT: Write in Alex Hormozi's style - direct, no-nonsense, business-focused, and results-oriented. Focus on value, ROI, and practical business advice. Be authoritative but not arrogant. Cut through the fluff and get straight to what works.`;
          break;
        case 'gary_vaynerchuk':
          systemPrompt += `\n\nIMPORTANT: Write in Gary Vaynerchuk's style - high-energy, passionate, motivational, and direct. Use ALL CAPS for emphasis, exclamation points, and hustle mentality. Be inspiring and push for action. Talk about CRUSHING it and WINNING.`;
          break;
        case 'oprah_winfrey':
          systemPrompt += `\n\nIMPORTANT: Write in Oprah Winfrey's style - warm, inspiring, empowering, and uplifting. Focus on personal growth, transformation, and empowerment. Use inclusive language and make people feel valued and capable of greatness.`;
          break;
      }
    }

    // Add brand voice context
    if (context.brandVoiceId) {
      systemPrompt += `\n\nBrand Voice: Use the user's established brand voice and tone consistently throughout the content.`;
    }

    // Add audience context
    if (context.audienceId) {
      systemPrompt += `\n\nTarget Audience: Tailor the content specifically for the user's defined target audience.`;
    }

    // Add output format context
    if (context.outputFormat) {
      const formatInstructions = {
        casual: 'Use a casual, conversational tone that feels approachable and friendly.',
        professional: 'Use a professional, formal tone that establishes authority and credibility.',
        creative: 'Use a creative, playful tone that stands out and engages the audience.'
      };
      systemPrompt += `\n\nTone: ${formatInstructions[context.outputFormat]}`;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // or 'gpt-4' for better results
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userRequest }
          ],
          temperature: context.temperature || 0.8,
          max_tokens: 2000,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  static async generateCampaignContent(
    userRequest: string,
    context: any = {}
  ) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert marketing strategist. Create a comprehensive campaign response that explains what you're building and why each piece matters. Be enthusiastic and strategic.

The user is asking for a complete marketing campaign. Respond with:
1. A brief explanation of the campaign strategy
2. Why each piece of content works together
3. How it moves customers through the journey
4. Next steps for optimization

Keep it concise but strategic. Match the persona style if specified.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userRequest }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}