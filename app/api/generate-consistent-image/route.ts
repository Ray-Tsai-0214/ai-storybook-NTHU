import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      characterInfo, 
      pageNumber, 
      style = "children's book illustration" 
    } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build consistent prompt
    let enhancedPrompt = prompt;
    
    if (characterInfo && pageNumber > 1) {
      // Use GPT-4 to intelligently combine user prompt with character info
      const promptEnhancement = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `你是一個專業的繪本插畫提示詞專家。請將用戶的場景描述與角色核心特徵輕度結合，保持創作靈活性。

            要求：
            1. 優先呈現用戶的新場景描述
            2. 只在需要時輕度提及角色特徵（如角色種類、主色調）
            3. 避免重複第一頁的具體細節
            4. 保持每頁圖片的獨特性和變化性
            5. 只回傳整合後的提示詞，不要前綴解釋`
          },
          {
            role: "user",
            content: `角色特徵：${characterInfo}\n\n新場景描述：${prompt}\n\n請生成一致性的圖片提示詞：`
          }
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      enhancedPrompt = promptEnhancement.choices[0].message.content || prompt;
    }

    // Final prompt with minimal style constraints
    const finalPrompt = `${enhancedPrompt}, colorful cartoon style, clean flat illustration, digital art, no borders, no frames, high quality`;

    // Generate image using DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
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
      enhancedPrompt: finalPrompt,
      revisedPrompt: revisedPrompt
    });

  } catch (error) {
    console.error('OpenAI Consistent Image API error:', error);
    
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
      { error: 'Failed to generate consistent image. Please try again.' },
      { status: 500 }
    );
  }
}