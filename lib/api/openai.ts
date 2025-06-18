import OpenAI from 'openai';

// 檢查 API Key 是否存在
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// 創建 OpenAI 客戶端實例
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API 配置
export const AI_CONFIG = {
  // GPT 模型設定
  textModel: 'gpt-4-turbo-preview',
  imageModel: 'dall-e-3',
  
  // 生成參數
  temperature: 0.7,
  maxTokens: 2000,
  
  // 圖片生成設定
  imageSize: '1024x1024' as const,
  imageQuality: 'standard' as const,
  
  // TTS 設定
  ttsModel: 'tts-1',
  ttsVoice: 'alloy' as const,
};

// 輔助函數：生成故事文本
export async function generateStoryText(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.textModel,
      messages: [
        {
          role: 'system',
          content: 'You are a creative children\'s story writer. Write engaging, age-appropriate stories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
    });
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating story text:', error);
    throw new Error('Failed to generate story text');
  }
}

// 輔助函數：生成圖片
export async function generateStoryImage(prompt: string) {
  try {
    const response = await openai.images.generate({
      model: AI_CONFIG.imageModel,
      prompt: prompt,
      n: 1,
      size: AI_CONFIG.imageSize,
      quality: AI_CONFIG.imageQuality,
    });
    
    return response.data[0]?.url || '';
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image');
  }
}

// 輔助函數：生成語音
export async function generateSpeech(text: string) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: AI_CONFIG.ttsModel,
      voice: AI_CONFIG.ttsVoice,
      input: text,
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech');
  }
}
