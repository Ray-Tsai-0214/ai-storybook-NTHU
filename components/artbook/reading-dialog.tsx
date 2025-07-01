"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
	ChevronLeft,
	ChevronRight,
	X,
	Play,
	Pause,
	Volume2,
	VolumeX,
	RotateCcw,
	Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// TypeScript interfaces
interface Page {
	id: string;
	pageNumber: number;
	content: string;
	picture?: string;
	audio?: string;
}

interface ArtbookData {
	id: string;
	title: string;
	pages: Page[];
}

interface AudioPlayerProps {
	audioUrl: string;
	className?: string;
}

interface ReadingDialogProps {
	artbook: ArtbookData;
	children: React.ReactNode;
	initialPage?: number;
	onPageChange?: (pageNumber: number) => void;
}

// Audio Player Component
function AudioPlayer({ audioUrl, className }: AudioPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const audioRef = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleLoadedMetadata = () => {
			setDuration(audio.duration);
			setIsLoading(false);
		};

		const handleTimeUpdate = () => {
			setCurrentTime(audio.currentTime);
		};

		const handleEnded = () => {
			setIsPlaying(false);
			setCurrentTime(0);
		};

		const handleCanPlay = () => {
			setIsLoading(false);
		};

		const handleWaiting = () => {
			setIsLoading(true);
		};

		const handleCanPlayThrough = () => {
			setIsLoading(false);
		};

		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("canplay", handleCanPlay);
		audio.addEventListener("waiting", handleWaiting);
		audio.addEventListener("canplaythrough", handleCanPlayThrough);

		return () => {
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("canplay", handleCanPlay);
			audio.removeEventListener("waiting", handleWaiting);
			audio.removeEventListener("canplaythrough", handleCanPlayThrough);
		};
	}, [audioUrl]);

	const togglePlayPause = () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
		setIsPlaying(!isPlaying);
	};

	const handleSeek = (value: number[]) => {
		const audio = audioRef.current;
		if (!audio) return;

		const newTime = (value[0] / 100) * duration;
		audio.currentTime = newTime;
		setCurrentTime(newTime);
	};

	const handleVolumeChange = (value: number[]) => {
		const audio = audioRef.current;
		if (!audio) return;

		const newVolume = value[0] / 100;
		audio.volume = newVolume;
		setVolume(newVolume);
		setIsMuted(newVolume === 0);
	};

	const toggleMute = () => {
		const audio = audioRef.current;
		if (!audio) return;

		if (isMuted) {
			audio.volume = volume > 0 ? volume : 0.5;
			setIsMuted(false);
		} else {
			audio.volume = 0;
			setIsMuted(true);
		}
	};

	const restart = () => {
		const audio = audioRef.current;
		if (!audio) return;

		audio.currentTime = 0;
		setCurrentTime(0);
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<div className={cn("bg-white rounded-lg border p-4 shadow-sm", className)}>
			<audio ref={audioRef} src={audioUrl} preload="metadata" />

			<div className="space-y-3">
				{/* Progress Bar */}
				<div className="space-y-2">
					<Slider
						value={[progress]}
						onValueChange={handleSeek}
						max={100}
						step={0.1}
						className="cursor-pointer"
						disabled={isLoading}
					/>
					<div className="flex justify-between text-xs text-gray-500">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>

				{/* Controls */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={restart}
							disabled={isLoading}
							className="h-8 w-8 p-0"
						>
							<RotateCcw className="h-4 w-4" />
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onClick={togglePlayPause}
							disabled={isLoading}
							className="h-10 w-10 p-0 hover:bg-orange-100"
						>
							{isLoading ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : isPlaying ? (
								<Pause className="h-5 w-5" />
							) : (
								<Play className="h-5 w-5 ml-0.5" />
							)}
						</Button>
					</div>

					{/* Volume Control */}
					<div className="flex items-center gap-2 min-w-[100px]">
						<Button
							variant="ghost"
							size="sm"
							onClick={toggleMute}
							className="h-8 w-8 p-0"
						>
							{isMuted ? (
								<VolumeX className="h-4 w-4" />
							) : (
								<Volume2 className="h-4 w-4" />
							)}
						</Button>
						<Slider
							value={[isMuted ? 0 : volume * 100]}
							onValueChange={handleVolumeChange}
							max={100}
							step={1}
							className="w-16"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

// Main Reading Dialog Component
export function ReadingDialog({
	artbook,
	children,
	initialPage = 1,
	onPageChange,
}: ReadingDialogProps) {
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [isOpen, setIsOpen] = useState(false);
	const [imageLoading, setImageLoading] = useState(true);

	// Sort pages by page number
	const sortedPages = [...artbook.pages].sort(
		(a, b) => a.pageNumber - b.pageNumber
	);
	const currentPageData =
		sortedPages.find((p) => p.pageNumber === currentPage) || sortedPages[0];

	const handlePageChange = useCallback(
		(newPage: number) => {
			if (newPage < 1 || newPage > sortedPages.length) return;

			setCurrentPage(newPage);
			setImageLoading(true);
			onPageChange?.(newPage);
		},
		[sortedPages.length, onPageChange]
	);

	const handlePreviousPage = useCallback(() => {
		handlePageChange(currentPage - 1);
	}, [currentPage, handlePageChange]);

	const handleNextPage = useCallback(() => {
		handlePageChange(currentPage + 1);
	}, [currentPage, handlePageChange]);

	// Keyboard navigation
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			switch (event.key) {
				case "ArrowLeft":
					event.preventDefault();
					handlePreviousPage();
					break;
				case "ArrowRight":
					event.preventDefault();
					handleNextPage();
					break;
				case "Escape":
					event.preventDefault();
					setIsOpen(false);
					break;
				case "Home":
					event.preventDefault();
					handlePageChange(1);
					break;
				case "End":
					event.preventDefault();
					handlePageChange(sortedPages.length);
					break;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [
		isOpen,
		handlePreviousPage,
		handleNextPage,
		handlePageChange,
		sortedPages.length,
	]);

	// Update current page when initialPage changes
	useEffect(() => {
		setCurrentPage(initialPage);
	}, [initialPage]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className="min-w-[95vw] min-h-[95vh] w-[95vw] h-[95vh] p-0 bg-white"
				showCloseButton={false}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b bg-gray-50">
					<div className="flex items-center gap-4">
						<DialogTitle className="text-lg font-semibold text-gray-900 font-['Comic_Neue']">
							{artbook.title}
						</DialogTitle>
						<span className="text-sm text-gray-500">
							Page {currentPage} of {sortedPages.length}
						</span>
					</div>

					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsOpen(false)}
						className="h-8 w-8 p-0 hover:bg-gray-200"
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</Button>
				</div>

				{/* Main Content */}
				<div className="flex-1 flex overflow-hidden">
					{/* Left Panel - Image */}
					<div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative">
						{currentPageData?.picture ? (
							<div className="relative w-full h-full flex items-center justify-center p-8">
								{imageLoading && (
									<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
										<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
									</div>
								)}
								<Image
									src={currentPageData.picture}
									alt={`Page ${currentPage} of ${artbook.title}`}
									width={800}
									height={600}
									className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
									onLoad={() => setImageLoading(false)}
									onError={() => setImageLoading(false)}
									priority
								/>
							</div>
						) : (
							<div className="text-center text-gray-500">
								<div className="w-24 h-32 bg-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
									<div className="w-16 h-20 bg-white rounded" />
								</div>
								<p>No image available for this page</p>
							</div>
						)}

						{/* Navigation Arrows */}
						<Button
							variant="ghost"
							size="sm"
							className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-md"
							onClick={handlePreviousPage}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-6 w-6" />
							<span className="sr-only">Previous page</span>
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/80 hover:bg-white shadow-md"
							onClick={handleNextPage}
							disabled={currentPage === sortedPages.length}
						>
							<ChevronRight className="h-6 w-6" />
							<span className="sr-only">Next page</span>
						</Button>
					</div>

					{/* Right Panel - Content */}
					<div className="w-[400px] flex flex-col bg-white border-l">
						{/* Content Area */}
						<div className="flex-1 p-6 overflow-y-auto">
							<div className="space-y-4">
								<div>
									<h3 className="text-xl font-semibold mb-3 font-['Comic_Neue'] text-gray-900">
										Page {currentPage}
									</h3>
									<div className="prose prose-lg max-w-none">
										<p className="text-gray-700 leading-relaxed font-['Manrope'] text-base">
											{currentPageData?.content ||
												"No content available for this page."}
										</p>
									</div>
								</div>

								{/* Page Navigation Pills */}
								<div className="flex flex-wrap gap-2 pt-4">
									{sortedPages.map((page) => (
										<button
											key={page.id}
											onClick={() => handlePageChange(page.pageNumber)}
											className={cn(
												"px-3 py-1 text-sm rounded-full border transition-colors",
												currentPage === page.pageNumber
													? "bg-orange-500 text-white border-orange-500"
													: "bg-white text-gray-600 border-gray-300 hover:border-orange-300 hover:bg-orange-50"
											)}
										>
											{page.pageNumber}
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Audio Player */}
						{currentPageData?.audio && (
							<div className="p-4 border-t bg-gray-50">
								<h4 className="text-sm font-medium mb-3 text-gray-900">
									Audio Narration
								</h4>
								<AudioPlayer
									audioUrl={currentPageData.audio}
									className="bg-white"
								/>
							</div>
						)}

						{/* Bottom Navigation */}
						<div className="p-4 border-t bg-white">
							<div className="flex items-center justify-between">
								<Button
									variant="outline"
									size="sm"
									onClick={handlePreviousPage}
									disabled={currentPage === 1}
									className="flex items-center gap-2"
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>

								<span className="text-sm text-gray-500 font-medium">
									{currentPage} / {sortedPages.length}
								</span>

								<Button
									variant="outline"
									size="sm"
									onClick={handleNextPage}
									disabled={currentPage === sortedPages.length}
									className="flex items-center gap-2"
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
