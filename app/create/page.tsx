"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Plus, Minus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/stores/auth-store";

interface PageData {
  outlinePrompt: string;
  storyOutline: string;
  coverPrompt: string;
  audioPrompt: string;
  imageUrl: string;
  audioData: string;
}

interface ArtbookData {
  title: string;
  description: string;
  category: string;
  coverPhoto: string;
}

export default function Create() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Artbook metadata
  const [artbookData, setArtbookData] = useState<ArtbookData>({
    title: "",
    description: "",
    category: "",
    coverPhoto: "",
  });
  
  // Initialize pages data
  const [pagesData, setPagesData] = useState<PageData[]>(
    Array(4).fill(null).map(() => ({
      outlinePrompt: "",
      storyOutline: "",
      coverPrompt: "",
      audioPrompt: "",
      imageUrl: "",
      audioData: "",
    }))
  );

  // Get current page data
  const currentPageData = pagesData[currentPage - 1] || {
    outlinePrompt: "",
    storyOutline: "",
    coverPrompt: "",
    audioPrompt: "",
    imageUrl: "",
    audioData: "",
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
    if (totalPages >= 10) {
      toast.error("Maximum 10 pages allowed");
      return;
    }
    setPagesData([...pagesData, {
      outlinePrompt: "",
      storyOutline: "",
      coverPrompt: "",
      audioPrompt: "",
      imageUrl: "",
      audioData: "",
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

  // Generate image for current page
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
      updatePageData('imageUrl', data.imageUrl);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate audio for current page
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
      updatePageData('audioData', data.audioData);
      toast.success("Audio generated successfully!");
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate audio");
    } finally {
      setIsGenerating(false);
    }
  };


  // Save artbook
  const saveArtbook = async () => {
    if (!user) {
      toast.error("Please sign in to save artbook");
      return;
    }

    if (!artbookData.title.trim()) {
      toast.error("Please enter an artbook title");
      return;
    }

    if (!artbookData.category) {
      toast.error("Please select a category");
      return;
    }

    // Validate that at least one page has content
    const hasContent = pagesData.some(page => page.storyOutline.trim());
    if (!hasContent) {
      toast.error("Please add content to at least one page");
      return;
    }

    setIsSaving(true);
    try {
      const pages = pagesData
        .map((page, index) => ({
          pageNumber: index + 1,
          content: page.storyOutline,
          picture: page.imageUrl,
          audio: page.audioData,
        }))
        .filter(page => page.content.trim()); // Only include pages with content

      const response = await fetch('/api/artbooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: artbookData.title,
          description: artbookData.description,
          category: artbookData.category.toUpperCase(),
          coverPhoto: artbookData.coverPhoto,
          isPublic: true,
          pages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save artbook');
      }

      const data = await response.json();
      toast.success("Artbook saved successfully!");
      router.push(`/artbook/${data.artbook.id}`);
    } catch (error) {
      console.error('Error saving artbook:', error);
      toast.error(error instanceof Error ? error.message : "Failed to save artbook");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle complete editing
  const handleCompleteEditing = () => {
    saveArtbook();
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to create artbooks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content Area */}
      <div className="pb-48">
        <div className="max-w-[1200px] mx-auto">{/* Increased max width */}
          {/* Artbook Metadata Form */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Artbook Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={artbookData.title}
                  onChange={(e) => setArtbookData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter artbook title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={artbookData.category} 
                  onValueChange={(value) => setArtbookData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="horror">Horror</SelectItem>
                    <SelectItem value="action">Action</SelectItem>
                    <SelectItem value="romantic">Romantic</SelectItem>
                    <SelectItem value="figure">Figure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={artbookData.description}
                  onChange={(e) => setArtbookData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter artbook description (optional)"
                />
              </div>
            </div>
          </div>

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
                {/* Page Image */}
                <div className="w-full h-[538px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-[31px] flex items-center justify-center overflow-hidden">
                  {currentPageData.imageUrl ? (
                    <img 
                      src={currentPageData.imageUrl} 
                      alt={`Page ${currentPage}`}
                      className="w-full h-full object-cover rounded-[31px]"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-32 h-40 bg-blue-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <div className="w-20 h-24 bg-white rounded" />
                      </div>
                      <p className="text-gray-600">No image generated yet</p>
                    </div>
                  )}
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
        
        {/* Save/Export Button */}
        <div className="p-2.5">
          <button 
            onClick={saveArtbook}
            disabled={isSaving || !artbookData.title.trim() || !artbookData.category}
            className="w-[437px] h-16 bg-white border-2 border-black rounded-[20px] text-2xl text-black hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              fontFamily: 'Syne, sans-serif',
              boxShadow: '10px 10px 0px #FB64B6'
            }}
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                保存中...
              </div>
            ) : (
              "保存繪本"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}