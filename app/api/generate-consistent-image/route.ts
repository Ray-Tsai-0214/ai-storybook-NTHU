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
            content: `你是一個專業的繪本插畫提示詞專家。請將用戶的場景描述與已建立的角色特徵結合，生成一個完整的圖片生成提示詞。

            要求：
            1. 保持角色的視覺一致性
            2. 融合用戶的新場景描述
            3. 維持兒童繪本風格
            4. 提示詞要具體且富有描述性
            5. 只回傳最終的提示詞，不要解釋`
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

    // Final prompt with style
    const finalPrompt = `${enhancedPrompt}, ${style}, colorful, friendly, safe for children, whimsical, clean flat illustration, digital art, no borders, no frames, high quality, consistent character design, detailed artwork`;

    // Generate image using DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data[0].url;

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      enhancedPrompt: finalPrompt,
      revisedPrompt: response.data[0].revised_prompt
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