"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReadArtbook() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(105); // 1:45 in seconds
  const [showEnding, setShowEnding] = useState(false);
  const totalPages = 6;
  const totalDuration = 282; // 4:42 in seconds

  // Sample page content
  const pages = [
    {
      image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&h=600&fit=crop",
      text: "Once upon a time, in a faraway kingdom, there lived a beautiful girl named Cinderella..."
    },
    {
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop",
      text: "She lived with her wicked stepmother and two stepsisters who made her do all the housework..."
    },
    {
      image: "https://images.unsplash.com/photo-1488554378835-f7acf46e6c98?w=800&h=600&fit=crop",
      text: "One day, an invitation arrived from the palace for a grand ball..."
    },
    {
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop",
      text: "With the help of her fairy godmother, Cinderella went to the ball..."
    },
    {
      image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&h=600&fit=crop",
      text: "At midnight, she had to leave, but lost her glass slipper..."
    },
    {
      image: "https://images.unsplash.com/photo-1488554378835-f7acf46e6c98?w=800&h=600&fit=crop",
      text: "The prince found her with the slipper, and they lived happily ever after."
    }
  ];

  // Full story text for overlay reading view
  const fullStory = `Cinderella lived with a wicked step-mother and two step-sisters. Cinderella lived in rags and worked day and night, cleaning the floor and dusting the house. One day, there was a royal ball in their kingdom, the two step-sisters hurried off to the ball, leaving poor Cinderella alone. She was crying bitterly. Suddenly, her fairy godmother appeared and helped her to dress up for the ball and made a magical carriage and sent her off to the royal ball, reminding her to be back by 12 midnight as the magic spell would last until that time, after which she would be back in her old form. Cinderella was very happy! She hurried off to the ball in her magic carriage and danced all night long with Prince Charming there. When the clock struck midnight, she hurried off to return from the ball. However, while running, one of her glass slippers fell off her foot on the stairs and the prince who followed her picked up the glass slipper. Now, he wanted to marry this beautiful lady. The next day, Prince Charming sent out his men to search for the girl in the kingdom. They carried Cinderella's glass slipper to see whose foot perfectly fits into it. The actual owner of the slipper, which was Cinderella, would get to marry Prince Charming immediately.`;

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else if (pageNum > totalPages) {
      // Show ending screen when reaching beyond last page
      setShowEnding(true);
    }
  };

  const handleClose = () => {
    router.push("/artbook");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  // Auto play simulation
  useEffect(() => {
    if (isPlaying && currentTime < totalDuration) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration - 1) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, currentTime]);

  if (showEnding) {
    return <EndingScreen onClose={handleClose} />;
  }

  return (
    <div className="fixed inset-0 bg-[#F3F4F6] z-50 flex">
      {/* Main Reading Area */}
      <div className="flex-1 flex">
        {/* Left Page - Image */}
        <div className="w-[824px] relative">
          <img
            src={pages[currentPage - 1].image}
            alt={`Page ${currentPage}`}
            className="w-full h-full object-cover"
            style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}
          />
          
          {/* Navigation Arrows */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#F9FAFB] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            className="absolute right-7 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#F9FAFB] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Page Number */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
            <p className="text-[48px] font-bold text-[#F9FAFB]" style={{ fontFamily: 'Comic Neue, cursive' }}>
              {currentPage}/{totalPages}
            </p>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 flex flex-col">
          {/* Title Bar */}
          <div className="px-12 py-4">
            <h1 className="text-[48px] font-bold text-[#364153]" style={{ fontFamily: 'Comic Neue, cursive' }}>
              Fairy Tale Story
            </h1>
          </div>
          
          {/* Text Content */}
          <div className="flex-1 px-12 overflow-y-auto">
            <p className="text-[28px] leading-relaxed text-black" style={{ fontFamily: 'Comic Neue, cursive' }}>
              {fullStory}
            </p>
          </div>
          
          {/* Music Player */}
          <div className="px-12 pb-12">
            <div className="bg-[#FCE7F3] border-2 border-[#1E2939] rounded-[20px] p-5 flex items-center gap-4">
              {/* Album Art */}
              <img
                src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=58&h=58&fit=crop"
                alt="Music"
                className="w-[58px] h-[58px] rounded"
              />
              
              {/* Progress */}
              <div className="flex-1">
                <div className="flex justify-between text-base text-[#1E2939] mb-1">
                  <span style={{ fontFamily: 'Syne, sans-serif' }}>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-[#F9FAFB] rounded-full">
                    <div 
                      className="h-full bg-[#F6339A] rounded-full relative"
                      style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#FDA5D5] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-[55px] h-[55px] bg-[#F9FAFB] rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-[#F6339A]" fill="#F6339A" />
                ) : (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-6 bg-[#F6339A] rounded-full" />
                    <div className="w-1.5 h-6 bg-[#F6339A] rounded-full" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ending Screen Component
function EndingScreen({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  
  return (
    <div className="fixed inset-0 bg-[#F3F4F6] z-50 flex">
      {/* Music Card */}
      <div className="absolute left-[304px] top-[114px] w-[328px] h-[529px] bg-white/70 backdrop-blur rounded-3xl p-5">
        <div className="flex flex-col items-center gap-7">
          {/* Album Cover */}
          <img
            src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=290&h=273&fit=crop"
            alt="Album Cover"
            className="w-[290px] h-[273px] rounded-2xl"
            style={{ filter: 'drop-shadow(0px 20px 60px rgba(20, 10, 4, 0.08))' }}
          />
          
          {/* Song Info */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-1">Living My Best Life</h3>
            <p className="text-sm text-gray-500">DaBaby</p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full px-5">
            <div className="h-2 bg-[#FFECE1] rounded-full mb-2">
              <div className="h-[7px] bg-primary rounded-full relative" style={{ width: '37%' }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] bg-primary rounded-full border border-[#FFF2EB]" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>1:21</span>
              <span>-2:36</span>
            </div>
          </div>
          
          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <button className="text-primary">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4v16l4-8zm8 0v16l4-8z"/>
              </svg>
            </button>
            <button className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </button>
            <button className="text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 4v16l-4-8zm-8 0v16l-4-8z" transform="scale(-1, 1) translate(-24, 0)"/>
              </svg>
            </button>
            <button className="text-primary">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 ml-[670px] p-16">
        <h2 className="text-2xl font-medium mb-12">Music of the Book</h2>
        
        {/* Comment Search */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Leave a Message for the Author"
              className="w-[701px] h-[52px] bg-white border-2 border-[#3D3C3C] rounded-[20px] px-5 pr-12 text-sm"
              style={{ 
                fontFamily: 'Syne, sans-serif',
                boxShadow: '0 10px 0 #FFB86A'
              }}
            />
          </div>
        </div>
        
        {/* Comments List */}
        <div className="space-y-5 max-w-[701px]">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="bg-white border-2 border-black rounded-[20px] p-5 flex items-start gap-7">
              <img
                src="/placeholder-avatar.jpg"
                alt="Athur"
                className="w-[100px] h-[100px] rounded-full"
              />
              <div className="flex-1">
                <h3 className="text-[40px] leading-[56px] text-[#1E2939]" style={{ fontFamily: 'Comic Neue, cursive' }}>
                  Athur
                </h3>
                <p className="text-[13px] text-[#6A7282] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  3/11/2025
                </p>
                <p className="text-[19px] text-[#4A5565]" style={{ fontFamily: 'Syne, sans-serif' }}>
                  This Story is Instresting!
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Related Story Books */}
        <div className="mt-16">
          <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Related Story Books
          </h3>
          <div className="flex gap-4 overflow-x-auto">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="relative w-[385px] h-[280px] flex-shrink-0">
                <div className="absolute left-0 top-2.5 w-[183px] h-[259px] bg-cover rounded-[20px] shadow-[4px_4px_0px_#FB64B6]"
                     style={{ 
                       backgroundImage: 'url("https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop")',
                       transform: 'rotate(-3.24deg)'
                     }} />
                <div className="absolute left-[54px] top-[35px] w-[314px] h-[209px] bg-[#FDA5D5] rounded-[20px]">
                  <div className="absolute right-0 top-3 w-[164px] p-2.5">
                    <h4 className="text-base font-bold text-[#F3F4F6] mb-4" style={{ fontFamily: 'Laila, serif' }}>
                      Fairy Tale Story
                    </h4>
                    <p className="text-xs text-[#F9FAFB]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa elit lectus enim id euismod.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Back to Home Button */}
        <Button
          onClick={onClose}
          className="mt-12 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Back to Artbook
        </Button>
      </div>
    </div>
  );
}