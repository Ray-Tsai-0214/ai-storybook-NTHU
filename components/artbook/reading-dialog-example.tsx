/**
 * Example usage of the ReadingDialog component
 * This file demonstrates how to integrate the reading dialog in different scenarios
 */

"use client";

import { ReadingDialog } from "./reading-dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Play } from "lucide-react";

// Example artbook data structure
const exampleArtbook = {
  id: "example-artbook-1",
  title: "The Magic Forest Adventure",
  pages: [
    {
      id: "page-1",
      pageNumber: 1,
      content: "Once upon a time, in a magical forest filled with talking animals and sparkling streams, there lived a young girl named Luna who had the power to speak with nature itself.",
      picture: "https://example.com/page1.jpg",
      audio: "https://example.com/page1.mp3"
    },
    {
      id: "page-2", 
      pageNumber: 2,
      content: "Luna discovered that the ancient oak tree at the heart of the forest was losing its magic, and all the woodland creatures were asking for her help to save their home.",
      picture: "https://example.com/page2.jpg",
      audio: "https://example.com/page2.mp3"
    },
    {
      id: "page-3",
      pageNumber: 3,
      content: "With courage in her heart and the wisdom of the forest spirits guiding her, Luna embarked on a quest to find the legendary Crystal of Life that could restore the oak tree's power.",
      picture: "https://example.com/page3.jpg",
      audio: "https://example.com/page3.mp3"
    }
  ]
};

// Example 1: Basic usage with a button trigger
export function BasicReadingDialogExample() {
  return (
    <ReadingDialog
      artbook={exampleArtbook}
      initialPage={1}
      onPageChange={(pageNumber) => {
        console.log(`User is now reading page ${pageNumber}`);
      }}
    >
      <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
        <BookOpen className="mr-2 h-5 w-5" />
        Read Story
      </Button>
    </ReadingDialog>
  );
}

// Example 2: Custom trigger with different styling
export function CustomReadingDialogExample() {
  return (
    <ReadingDialog
      artbook={exampleArtbook}
      initialPage={2} // Start from page 2
      onPageChange={(pageNumber) => {
        // Custom page change handler
        console.log(`Page changed to: ${pageNumber}`);
        // You could track reading progress here
      }}
    >
      <div className="group cursor-pointer">
        <div className="relative bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-4 hover:shadow-lg transition-all duration-200">
          <Play className="absolute top-2 right-2 h-6 w-6 text-white opacity-75 group-hover:opacity-100" />
          <h3 className="text-white font-bold text-lg mb-2">{exampleArtbook.title}</h3>
          <p className="text-white text-sm opacity-90">Click to read in immersive mode</p>
        </div>
      </div>
    </ReadingDialog>
  );
}

// Example 3: Minimal usage for card components
export function CardReadingDialogExample({ artbook }: { artbook: typeof exampleArtbook }) {
  return (
    <ReadingDialog
      artbook={artbook}
      onPageChange={(pageNumber) => {
        // Track reading analytics
        console.log(`Reading ${artbook.title}, page ${pageNumber}`);
      }}
    >
      <Button variant="outline" size="sm">
        <BookOpen className="h-4 w-4" />
      </Button>
    </ReadingDialog>
  );
}