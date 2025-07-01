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
          content: `你是一個專業的角色設計分析師。請分析圖片描述，只提取**核心視覺特徵**，避免限制後續創作靈活性。

          請用簡潔格式回應：
          主角：[種族/類型]，[顏色特徵]，[主要服裝特色]
          風格：[藝術風格關鍵詞]
          
          重點：
          1. 只保留不變的核心特徵（如角色種類、主色調）
          2. 避免具體動作、表情、背景描述
          3. 避免過於詳細的服裝描述
          4. 保持 20 字以內的精簡描述
          5. 適合用於變化場景的一致性參考
          
          範例：
          主角：橘色小貓，藍色運動服
          風格：卡通插畫`
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