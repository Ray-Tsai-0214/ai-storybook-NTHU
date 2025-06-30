"use client";

import { useState } from "react";
import { useAuth } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, User } from "lucide-react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  initialValue?: string;
  isSubmitting?: boolean;
  placeholder?: string;
  showCancel?: boolean;
  compact?: boolean;
  isAuthenticated?: boolean;
}

export function CommentForm({
  onSubmit,
  onCancel,
  initialValue = "",
  isSubmitting = false,
  placeholder = "Write a comment...",
  showCancel = false,
  compact = false,
  isAuthenticated = true,
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    await onSubmit(content.trim());
    setContent("");
    setIsFocused(false);
  };

  const handleCancel = () => {
    setContent(initialValue);
    setIsFocused(false);
    onCancel?.();
  };

  const getAvatarFallback = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-4 bg-orange-50 border-orange-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <User className="h-4 w-4 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-orange-800">
              Please <span className="font-medium">sign in</span> to join the conversation
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const avatarSize = compact ? "h-6 w-6" : "h-8 w-8";
  const textareaRows = compact ? 2 : 3;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex space-x-3">
        {/* User Avatar */}
        <Avatar className={`${avatarSize} flex-shrink-0`}>
          <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
            {user?.name ? getAvatarFallback(user.name) : "U"}
          </AvatarFallback>
        </Avatar>

        {/* Comment Input */}
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            rows={textareaRows}
            className={`resize-none transition-all duration-200 ${
              isFocused || content 
                ? 'border-orange-200 focus:border-orange-400' 
                : 'border-gray-200'
            }`}
            disabled={isSubmitting}
            maxLength={1000}
          />
          
          {/* Character Counter */}
          {(isFocused || content) && (
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>{content.length}/1000 characters</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {(isFocused || content || showCancel) && (
        <div className="flex justify-end space-x-2 ml-11">
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                <span>Posting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="h-3 w-3" />
                <span>{initialValue ? "Update" : "Post"}</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}