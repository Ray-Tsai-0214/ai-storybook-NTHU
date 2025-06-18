import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, pages = 6 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate story outline using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `你是一個專業的童話故事作家。請根據用戶的提示詞，創作一個適合兒童的故事大綱。
          故事應該包含：
          1. 引人入勝的開頭
          2. 有趣的情節發展
          3. 教育意義或正面價值觀
          4. 溫馨的結局
          
          請將故事分成 ${pages} 個段落，每個段落對應繪本的一頁。
          回應格式應該是純文字，用換行符分隔每個段落。`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const outline = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      outline: outline,
      pages: outline?.split('\n\n') || []
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
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
    }

    return NextResponse.json(
      { error: 'Failed to generate outline. Please try again.' },
      { status: 500 }
    );
  }
}