import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { firstImagePrompt, storyOutline } = await request.json();

    if (!firstImagePrompt) {
      return NextResponse.json(
        { error: 'First image prompt is required' },
        { status: 400 }
      );
    }

    // Extract character information from the first image and story
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `你是一個專業的角色設計分析師。請分析用戶提供的圖片描述和故事大綱，提取出主要角色的特徵信息。

          請按照以下格式回應：
          主角特徵：[外觀特徵，包括顏色、服裝等]
          配角特徵：[如果有配角的話]
          環境風格：[背景環境的特徵]
          藝術風格：[繪畫風格描述]
          
          重點：
          1. 專注於視覺特徵（顏色、形狀、服裝）
          2. 避免情節描述，專注於角色外觀
          3. 使用具體的形容詞
          4. 適合兒童繪本風格`
        },
        {
          role: "user", 
          content: `圖片描述：${firstImagePrompt}\n故事大綱：${storyOutline || '未提供'}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const characterInfo = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      characterInfo: characterInfo
    });

  } catch (error) {
    console.error('Error extracting character info:', error);
    return NextResponse.json(
      { error: 'Failed to extract character information' },
      { status: 500 }
    );
  }
}