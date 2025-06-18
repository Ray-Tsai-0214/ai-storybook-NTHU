"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, AlertTriangle, Clock, BookOpen, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ArtbookPreview() {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(22);
  const [commentText, setCommentText] = useState("");

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleReadArtbook = () => {
    // Navigate to reading view
    router.push("/artbook/read");
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Hero Section with Book Cover */}
      <div className="relative h-[631px] overflow-hidden">
        {/* Blurred Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=800&fit=crop")',
            filter: 'blur(30px)',
            transform: 'scale(1.1)'
          }}
        />
        
        {/* Content Overlay */}
        <div className="relative z-10 flex h-full">
          {/* Book Cover */}
          <div className="relative w-[508px] h-full">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=508&h=631&fit=crop"
              alt="Fairy Tale Story Cover"
              className="w-full h-full object-cover"
              style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}
            />
            
            {/* Like Button */}
            <button
              onClick={handleLike}
              className="absolute top-5 right-5 flex flex-col items-center"
            >
              <Heart 
                className={`w-11 h-11 ${isLiked ? 'fill-[#FF6467] text-[#FF6467]' : 'text-[#FF6467]'}`}
              />
              <span className="text-[23px] leading-8 text-[#FF6467]" style={{ fontFamily: 'Syne, sans-serif' }}>
                {likeCount}
              </span>
            </button>
            
            {/* Report Button */}
            <button className="absolute top-6 left-6">
              <AlertTriangle className="w-10 h-10 text-white/80" />
            </button>
          </div>
          
          {/* Book Info */}
          <div className="flex-1 flex flex-col justify-center px-16">
            {/* Title */}
            <h1 className="text-[57px] leading-[80px] font-bold text-white mb-4" 
                style={{ fontFamily: 'Comic Neue, cursive' }}>
              Fairy Tale Story
            </h1>
            
            {/* View Count */}
            <div className="flex items-center gap-2 mb-8">
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
                <circle cx="11.5" cy="11.5" r="7" stroke="#99A1AF" strokeWidth="1.5"/>
                <circle cx="11.5" cy="11.5" r="3" stroke="#99A1AF" strokeWidth="1.5"/>
              </svg>
              <span className="text-[19px] text-[#99A1AF]" style={{ fontFamily: 'Syne, sans-serif' }}>
                10000
              </span>
            </div>
            
            {/* Duration */}
            <div className="flex items-center gap-2.5 mb-8">
              <Clock className="w-[34px] h-[34px] text-white" />
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Laila, serif' }}>
                3:04
              </span>
            </div>
            
            {/* Author */}
            <div className="flex items-center gap-3 mb-12">
              <Avatar className="w-[50px] h-[50px]">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Shelly" />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <span className="text-base text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Shelly
              </span>
              <ChevronRight className="w-6 h-6 text-[#FF6900] rotate-90" />
            </div>
            
            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-[48px] leading-[55px] font-bold text-white mb-4"
                  style={{ fontFamily: 'Comic Neue, cursive' }}>
                About this book
              </h2>
              <p className="text-[23px] leading-8 text-[#D1D5DC] max-w-[531px]"
                 style={{ fontFamily: 'Syne, sans-serif' }}>
                Cinderella lived with a wicked step-mother and two step-sisters.
              </p>
            </div>
            
            {/* Read Button */}
            <Button
              onClick={handleReadArtbook}
              className="w-[319px] h-16 bg-white hover:bg-gray-100 text-[#4A5565] rounded-[20px] flex items-center justify-center gap-2.5"
            >
              <BookOpen className="w-11 h-11" strokeWidth={3} />
              <span className="text-[36px] font-bold" style={{ fontFamily: 'Laila, serif' }}>
                Read Artbook
              </span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      <div className="max-w-[1124px] mx-auto p-10">
        <h2 className="text-[57px] leading-[80px] font-bold text-black mb-10"
            style={{ fontFamily: 'Comic Neue, cursive' }}>
          Comment
        </h2>
        
        {/* Comment List */}
        <div className="space-y-5">
          {/* First Comment */}
          <div className="bg-white border-2 border-black rounded-[20px] p-5 flex items-start gap-7">
            <Avatar className="w-[100px] h-[100px]">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Athur" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-[40px] leading-[56px] text-[#1E2939] mb-1"
                  style={{ fontFamily: 'Comic Neue, cursive' }}>
                Athur
              </h3>
              <p className="text-[13px] text-[#6A7282] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                3/11/2025
              </p>
              <p className="text-[19px] leading-6 text-[#4A5565]" style={{ fontFamily: 'Syne, sans-serif' }}>
                This Story is Instresting!
              </p>
            </div>
          </div>
          
          {/* Comment Input Fields */}
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-white border-2 border-black rounded-[20px] p-5 flex items-center gap-7">
              <Avatar className="w-[100px] h-[100px]">
                <AvatarImage src="/placeholder-avatar.jpg" alt="You" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <input
                type="text"
                placeholder="Comment As Athur"
                className="flex-1 text-[19px] text-[#99A1AF] outline-none"
                style={{ fontFamily: 'Syne, sans-serif' }}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
          ))}
          
          {/* Add Comment Button */}
          <div className="bg-white border-2 border-black rounded-[20px] p-5 flex items-center gap-7">
            <Avatar className="w-[100px] h-[100px]">
              <AvatarImage src="/placeholder-avatar.jpg" alt="You" />
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
            <input
              type="text"
              placeholder="Comment As Athur"
              className="flex-1 text-[19px] text-[#99A1AF] outline-none"
              style={{ fontFamily: 'Syne, sans-serif' }}
            />
          </div>
        </div>
      </div>
      
      {/* Floating Report Button */}
      <button className="fixed bottom-10 right-10 p-3 bg-white rounded-full shadow-lg">
        <AlertTriangle className="w-10 h-10 text-[#FF6900]" />
      </button>
    </div>
  );
}