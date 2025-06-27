import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Convert message history to Anthropic format
    const messages = [
      // Add system context about being a helpful assistant for note-taking
      {
        role: 'user' as const,
        content: 'You are Claude, an AI assistant helping users with their note-taking and writing. You are integrated into a Notion-like application. Be helpful, concise, and focus on productivity and organization tasks. You can help with writing, editing, organizing thoughts, creating outlines, and answering questions about the content in their notes.'
      },
      // Add conversation history
      ...history.slice(-8).map((msg: Message) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      // Add current message
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      messages: messages.slice(1), // Remove the system prompt from messages array
      system: 'You are Claude, an AI assistant helping users with their note-taking and writing. You are integrated into a Notion-like application. Be helpful, concise, and focus on productivity and organization tasks. You can help with writing, editing, organizing thoughts, creating outlines, and answering questions about the content in their notes.'
    });

    const assistantResponse = response.content[0];
    
    if (assistantResponse.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    return NextResponse.json({
      response: assistantResponse.text,
      usage: response.usage
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Handle different types of errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please contact support.' },
          { status: 500 }
        );
      } else if (error.status === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again in a moment.' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: 'AI service error. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 