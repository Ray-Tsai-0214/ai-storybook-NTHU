import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateStoryImage } from '@/lib/api/openai';

// Initialize OpenAI client (fallback if generateStoryImage doesn't work)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = "colorful cartoon style" } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    try {
      // Try using the centralized function first
      const imageUrl = await generateStoryImage(prompt);
      
      return NextResponse.json({ 
        success: true,
        imageUrl 
      });
    } catch {
      console.log('Fallback to direct OpenAI API call');
      
      // Fallback to direct OpenAI API call with enhanced prompts
      const enhancedPrompt = `${prompt}, ${style}, colorful, friendly, safe for children, whimsical, clean flat illustration, digital art, no borders, no frames, high quality, detailed artwork`;

      // Generate image using DALL-E 3
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const imageUrl = response.data?.[0]?.url;
      const revisedPrompt = response.data?.[0]?.revised_prompt;

      if (!imageUrl) {
        throw new Error('No image URL received from OpenAI');
      }

      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        revisedPrompt: revisedPrompt
      });
    }

  } catch (error) {
    console.error('OpenAI Image API error:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.status === 400) {
        return NextResponse.json(
          { error: 'Invalid prompt. Please try a different description.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
}