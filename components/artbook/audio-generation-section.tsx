"use client";

import { useState } from "react";
import { toast } from "sonner";

interface PageData {
  outlinePrompt: string;
  storyOutline: string;
  coverPrompt: string;
  audioPrompt: string;
  imageUrl: string;
  audioData: string;
}

interface AudioGenerationSectionProps {
  currentPageData: PageData;
  onUpdatePageData: (field: keyof PageData, value: string) => void;
}

export function AudioGenerationSection({ currentPageData, onUpdatePageData }: AudioGenerationSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAudio = async () => {
    const text = currentPageData.storyOutline || currentPageData.audioPrompt;
    if (!text.trim()) {
      toast.error("Please enter story content or audio prompt first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate audio');
      }

      const data = await response.json();
      onUpdatePageData('audioData', data.audioData);
      toast.success("Audio generated successfully!");
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate audio");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[40px] leading-[56px] text-black" style={{ fontFamily: 'Comic Neue, cursive' }}>
        繪本語音
      </h3>
      
      {/* Audio Theme Input */}
      <textarea
        placeholder="請輸入故事主題"
        value={currentPageData.audioPrompt}
        onChange={(e) => onUpdatePageData('audioPrompt', e.target.value)}
        className="w-full h-[89px] p-4 bg-white border-2 border-black rounded-[20px] text-base placeholder:text-[#676767] resize-none"
        style={{ fontFamily: 'Playfair Display, serif' }}
      />
      
      {/* Audio Controls */}
      {currentPageData.audioData && (
        <div className="mb-4">
          <audio controls className="w-full">
            <source src={currentPageData.audioData} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2.5">
        <button 
          className="flex-1 h-10 bg-white border-2 border-black rounded-[20px] text-base text-[#364153] hover:bg-gray-50 transition-colors"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          上傳音檔
        </button>
        <button 
          onClick={generateAudio}
          disabled={isGenerating || (!currentPageData.storyOutline.trim() && !currentPageData.audioPrompt.trim())}
          className="flex-1 h-10 bg-white border-2 border-black rounded-[20px] text-base text-[#364153] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {isGenerating ? "生成中..." : "生成音樂"}
        </button>
      </div>
    </div>
  );
}