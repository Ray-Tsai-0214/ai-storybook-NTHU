import { NextRequest, NextResponse } from 'next/server';
import { generateStoryText } from '@/lib/api/openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    const story = await generateStoryText(prompt);
    
    return NextResponse.json({ story });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}
