import { NextRequest, NextResponse } from 'next/server';
import { generateStoryImage } from '@/lib/api/openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Generate image using OpenAI DALL-E
    const imageUrl = await generateStoryImage(prompt);
    
    return NextResponse.json({ 
      success: true,
      imageUrl 
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}