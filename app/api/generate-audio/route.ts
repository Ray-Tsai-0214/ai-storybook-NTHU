import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/api/openai';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Generate audio using OpenAI TTS
    const audioBuffer = await generateSpeech(text);
    
    // Convert buffer to base64 for easy transport
    const audioBase64 = audioBuffer.toString('base64');
    
    return NextResponse.json({ 
      success: true,
      audioData: `data:audio/mp3;base64,${audioBase64}`
    });
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}