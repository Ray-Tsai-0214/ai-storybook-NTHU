"use client";

import Image from "next/image";

interface PageData {
  outlinePrompt: string;
  storyOutline: string;
  coverPrompt: string;
  audioPrompt: string;
  imageUrl: string;
  audioData: string;
}

interface PagePreviewProps {
  currentPage: number;
  totalPages: number;
  currentPageData: PageData;
}

export function PagePreview({ currentPage, totalPages, currentPageData }: PagePreviewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-[40px] leading-[56px] text-black" style={{ fontFamily: 'Comic Neue, cursive' }}>
        第{currentPage}頁
      </h2>
      
      <div className="flex flex-col items-center gap-5">
        {/* Page Image */}
        <div className="w-full h-[538px] bg-gradient-to-br from-blue-100 to-blue-200 rounded-[31px] flex items-center justify-center overflow-hidden">
          {currentPageData.imageUrl ? (
            <Image 
              src={currentPageData.imageUrl} 
              alt={`Page ${currentPage}`}
              fill
              className="object-cover rounded-[31px]"
              sizes="(max-width: 768px) 100vw, 50vw"
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
  );
}