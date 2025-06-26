"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

interface PageData {
  outlinePrompt: string;
  storyOutline: string;
  coverPrompt: string;
  audioPrompt: string;
  imageUrl: string;
  audioData: string;
}

interface ImageGenerationSectionProps {
  currentPageData: PageData;
  onUpdatePageData: (field: keyof PageData, value: string) => void;
}

export function ImageGenerationSection({ currentPageData, onUpdatePageData }: ImageGenerationSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    const prompt = currentPageData.coverPrompt;
    if (!prompt.trim()) {
      toast.error("Please enter an image prompt first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      onUpdatePageData('imageUrl', data.imageUrl);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[40px] leading-[56px] text-black" style={{ fontFamily: 'Comic Neue, cursive' }}>
        繪本封面
      </h3>
      
      {/* Cover Prompt Input */}
      <div className="relative">
        <textarea
          placeholder="請輸入繪本封面提示詞"
          value={currentPageData.coverPrompt}
          onChange={(e) => onUpdatePageData('coverPrompt', e.target.value)}
          className="w-full h-[76px] p-4 pr-16 bg-white border-2 border-black rounded-[20px] text-base placeholder:text-[#99A1AF] resize-none"
          style={{ fontFamily: 'Playfair Display, serif' }}
        />
        <button 
          onClick={generateImage}
          disabled={isGenerating}
          className="absolute right-4 top-4 w-11 h-11 bg-[#FCCEE8] border-2 border-black rounded-2xl flex items-center justify-center hover:bg-[#FCB8E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 className="w-6 h-6" />
        </button>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2.5">
        <button 
          className="flex-1 h-10 bg-white border-2 border-black rounded-[20px] text-base text-[#364153] hover:bg-gray-50 transition-colors"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          上傳圖片
        </button>
        <button 
          onClick={generateImage}
          disabled={isGenerating || !currentPageData.coverPrompt.trim()}
          className="flex-1 h-10 bg-white border-2 border-black rounded-[20px] text-base text-[#364153] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {isGenerating ? "生成中..." : "生成封面"}
        </button>
      </div>
    </div>
  );
}