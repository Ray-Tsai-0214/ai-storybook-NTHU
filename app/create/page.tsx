"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Wand2, Plus, Minus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PageData {
  outlinePrompt: string;
  storyOutline: string;
  coverPrompt: string;
  audioPrompt: string;
}

export default function Create() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize pages data
  const [pagesData, setPagesData] = useState<PageData[]>(
    Array(6).fill(null).map(() => ({
      outlinePrompt: "",
      storyOutline: "",
      coverPrompt: "",
      audioPrompt: "",
    }))
  );

  // Get current page data
  const currentPageData = pagesData[currentPage - 1] || {
    outlinePrompt: "",
    storyOutline: "",
    coverPrompt: "",
    audioPrompt: "",
  };

  // Update current page data
  const updatePageData = (field: keyof PageData, value: string) => {
    const newPagesData = [...pagesData];
    newPagesData[currentPage - 1] = {
      ...newPagesData[currentPage - 1],
      [field]: value,
    };
    setPagesData(newPagesData);
  };

  // Add new page
  const addPage = () => {
    setPagesData([...pagesData, {
      outlinePrompt: "",
      storyOutline: "",
      coverPrompt: "",
      audioPrompt: "",
    }]);
    setTotalPages(totalPages + 1);
  };

  // Remove page
  const removePage = () => {
    if (totalPages > 1) {
      const newPagesData = [...pagesData];
      newPagesData.splice(currentPage - 1, 1);
      setPagesData(newPagesData);
      setTotalPages(totalPages - 1);
      
      // Adjust current page if needed
      if (currentPage > totalPages - 1) {
        setCurrentPage(totalPages - 1);
      }
    }
  };

  // Navigate to specific page
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  // Handle complete editing
  const handleCompleteEditing = () => {
    // Save the artbook data here if needed
    // Navigate to artbook preview page
    router.push("/artbook");
  };

  // Generate story outline using OpenAI
  const generateOutline = async (pageIndex: number) => {
    const prompt = pagesData[pageIndex].outlinePrompt;
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
      updatePageData('storyOutline', data.outline);
      
      // If we have page-specific content, update all pages
      if (data.pages && data.pages.length > 0) {
        const newPagesData = [...pagesData];
        data.pages.forEach((pageContent: string, index: number) => {
          if (index < newPagesData.length) {
            newPagesData[index] = {
              ...newPagesData[index],
              storyOutline: pageContent.trim()
            };
          }
        });
        setPagesData(newPagesData);
      }
      
      toast.success("故事大綱生成成功！");
    } catch (error) {
      console.error('Error generating outline:', error);
      toast.error(error instanceof Error ? error.message : "生成大綱時發生錯誤，請稍後再試");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="pb-48">
        <div className="max-w-[1200px] mx-auto">{/* Increased max width */}
          {/* Page Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
                Create Artbook
              </h1>
              <div className="flex items-center gap-2 ml-8">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                      style={{ fontFamily: 'Syne, sans-serif' }}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Add/Remove Page Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={addPage}
                    className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                    title="新增頁面"
                  >
                    <Plus className="w-5 h-5 text-green-600" />
                  </button>
                  <button
                    onClick={removePage}
                    disabled={totalPages === 1}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="刪除當前頁面"
                  >
                    <Minus className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500" style={{ fontFamily: 'Syne, sans-serif' }}>
              總共 {totalPages} 頁
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-12">
            {/* Left Column - Page Preview */}
            <div className="space-y-6">
              <h2 className="text-[40px] leading-[56px] text-black" style={{ fontFamily: 'Comic Neue, cursive' }}>
                第{currentPage}頁
              </h2>
              
              <div className="flex flex-col items-center gap-5">
                {/* Page Image Placeholder */}
                <div className="w-full h-[538px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-[31px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-40 bg-blue-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <div className="w-20 h-24 bg-white rounded" />
                    </div>
                  </div>
                </div>
                
                {/* Page Number */}
                <p className="text-[28px] leading-8 text-center text-black" style={{ fontFamily: 'Comic Neue, cursive' }}>
                  第{currentPage}/{totalPages}頁
                </p>
              </div>
            </div>

            {/* Right Column - Forms */}
            <div className="space-y-8">
              {/* Story Outline Section */}
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
                    onChange={(e) => updatePageData('outlinePrompt', e.target.value)}
                    className="w-full h-[60px] px-5 pr-16 bg-white border-2 border-black rounded-[20px] text-base placeholder:text-[#99A1AF]"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  />
                  <button 
                    onClick={() => generateOutline(currentPage - 1)}
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
                  onChange={(e) => updatePageData('storyOutline', e.target.value)}
                  className="w-full h-[223px] p-4 bg-white border-2 border-black rounded-[20px] text-base placeholder:text-[#99A1AF] resize-none"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                />
              </div>

              {/* Book Cover Section */}
              <div className="space-y-4">
                <h3 className="text-[40px] leading-[56px] text-black" style={{ fontFamily: 'Comic Neue, cursive' }}>
                  繪本封面
                </h3>
                
                {/* Cover Prompt Input */}
                <div className="relative">
                  <textarea
                    placeholder="請輸入繪本封面提示詞"
                    value={currentPageData.coverPrompt}
                    onChange={(e) => updatePageData('coverPrompt', e.target.value)}
                    className="w-full h-[76px] p-4 pr-16 bg-white border-2 border-black rounded-[20px] text-base placeholder:text-[#99A1AF] resize-none"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  />
                  <button className="absolute right-4 top-4 w-11 h-11 bg-[#FCCEE8] border-2 border-black rounded-2xl flex items-center justify-center hover:bg-[#FCB8E0] transition-colors">
                    <Wand2 className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2.5">
                  <button className="flex-1 h-10 bg-white border-2 border-black rounded-[20px] text-base text-[#364153] hover:bg-gray-50 transition-colors"
                          style={{ fontFamily: 'Syne, sans-serif' }}>
                    上傳圖片
                  </button>
                  <button className="flex-1 h-10 bg-white border-2 border-black rounded-[20px] text-base text-[#364153] hover:bg-gray-50 transition-colors"
                          style={{ fontFamily: 'Syne, sans-serif' }}>
                    生成封面
                  </button>
                </div>
              </div>

              {/* Book Audio Section */}
              <div className="space-y-4">
                <h3 className="text-[40px] leading-[56px] text-black" style={{ fontFamily: 'Comic Neue, cursive' }}>
                  繪本語音
                </h3>
                
                {/* Audio Theme Input */}
                <textarea
                  placeholder="請輸入故事主題"
                  value={currentPageData.audioPrompt}
                  onChange={(e) => updatePageData('audioPrompt', e.target.value)}
                  className="w-full h-[89px] p-4 bg-white border-2 border-black rounded-[20px] text-base placeholder:text-[#676767] resize-none"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                />
                
                {/* Action Buttons */}
                <div className="flex gap-2.5">
                  <button className="flex-1 h-10 bg-white border-2 border-black rounded-[20px] text-base text-[#364153] hover:bg-gray-50 transition-colors"
                          style={{ fontFamily: 'Syne, sans-serif' }}>
                    上傳音檔
                  </button>
                  <button className="flex-1 h-10 bg-white border-2 border-black rounded-[20px] text-base text-[#364153] hover:bg-gray-50 transition-colors"
                          style={{ fontFamily: 'Syne, sans-serif' }}>
                    生成音樂
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-0.5">
        {/* Navigation Buttons */}
        <div className="flex gap-4 p-2.5">
          <button 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-[210px] h-[52px] bg-white border-2 border-black rounded-[20px] text-[23px] leading-8 text-black hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            上一頁
          </button>
          
          {currentPage < totalPages ? (
            <button 
              onClick={() => goToPage(currentPage + 1)}
              className="w-[210px] h-[52px] bg-white border-2 border-black rounded-[20px] text-[23px] leading-8 text-black hover:bg-gray-50 transition-colors"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              下一頁
            </button>
          ) : (
            <button 
              onClick={handleCompleteEditing}
              className="w-[210px] h-[52px] bg-primary text-white border-2 border-primary rounded-[20px] text-[23px] leading-8 hover:bg-primary/90 transition-colors"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              完成編輯
            </button>
          )}
        </div>
        
        {/* Export Button */}
        <div className="p-2.5">
          <button 
            className="w-[437px] h-16 bg-white border-2 border-black rounded-[20px] text-2xl text-black hover:shadow-lg transition-all"
            style={{ 
              fontFamily: 'Syne, sans-serif',
              boxShadow: '10px 10px 0px #FB64B6'
            }}
          >
            輸出繪本
          </button>
        </div>
      </div>
    </div>
  );
}