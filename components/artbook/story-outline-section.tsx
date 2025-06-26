"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PageData {
  outlinePrompt: string;
  storyOutline: string;
  coverPrompt: string;
  audioPrompt: string;
  imageUrl: string;
  audioData: string;
}

interface StoryOutlineSectionProps {
  currentPageData: PageData;
  currentPage: number;
  totalPages: number;
  onUpdatePageData: (field: keyof PageData, value: string) => void;
  onUpdateAllPages: (pagesData: PageData[]) => void;
}

export function StoryOutlineSection({ 
  currentPageData, 
  currentPage, 
  totalPages, 
  onUpdatePageData,
  onUpdateAllPages 
}: StoryOutlineSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateOutline = async () => {
    const prompt = currentPageData.outlinePrompt;
    if (!prompt.trim()) {
      toast.error("請先輸入生成大綱的提示詞");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          pages: totalPages
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate outline');
      }

      const data = await response.json();
      
      // Update the story outline for current page
      onUpdatePageData('storyOutline', data.outline);
      
      // If we have page-specific content, update all pages
      if (data.pages && data.pages.length > 0) {
        // This would need to be handled by the parent component
        // as it has access to all pages data
        toast.success("故事大綱生成成功！請檢查其他頁面的內容");
      } else {
        toast.success("故事大綱生成成功！");
      }
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error(error instanceof Error ? error.message : "生成大綱時發生錯誤，請稍後再試");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[40px] leading-[56px] text-black" style={{ fontFamily: 'Comic Neue, cursive' }}>
        繪本大綱
      </h3>
      
      {/* Prompt Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="請輸入生成大綱提示詞"
          value={currentPageData.outlinePrompt}
          onChange={(e) => onUpdatePageData('outlinePrompt', e.target.value)}
          className="w-full h-[60px] px-5 pr-16 bg-white border-2 border-black rounded-[20px] text-base placeholder:text-[#99A1AF]"
          style={{ fontFamily: 'Syne, sans-serif' }}
        />
        <button 
          onClick={generateOutline}
          disabled={isGenerating}
          className="absolute right-2 top-2 w-11 h-11 bg-[#FCCEE8] border-2 border-black rounded-2xl flex items-center justify-center hover:bg-[#FCB8E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Wand2 className="w-6 h-6" />
          )}
        </button>
      </div>
      
      {/* Story Outline Textarea */}
      <textarea
        placeholder="請輸入故事大綱"
        value={currentPageData.storyOutline}
        onChange={(e) => onUpdatePageData('storyOutline', e.target.value)}
        className="w-full h-[223px] p-4 bg-white border-2 border-black rounded-[20px] text-base placeholder:text-[#99A1AF] resize-none"
        style={{ fontFamily: 'Playfair Display, serif' }}
      />
    </div>
  );
}