# Comment System Components

A complete comment UI system for the AI Artbook platform with nested replies, authentication integration, and real-time updates.

## Components Overview

### 1. CommentSection
Main container component that manages state and API calls.

### 2. CommentList
Renders the list of top-level comments.

### 3. CommentItem
Individual comment component with support for nested replies (max 2 levels).

### 4. CommentForm
Form component for creating new comments and replies.

### 5. CommentActions
Dropdown menu with edit/delete actions for comment owners.

## Features

- ✅ **Authentication Integration**: Uses auth store to check user permissions
- ✅ **Nested Replies**: Support for 2-level comment threading with visual indentation
- ✅ **Real-time Updates**: Optimistic UI updates for better user experience
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Orange Theme**: Matches the existing artbook platform design
- ✅ **Edit/Delete**: Comment owners can edit or delete their comments
- ✅ **Character Limits**: 1000 character limit with counter
- ✅ **Time Formatting**: Human-readable timestamps using date-fns
- ✅ **Error Handling**: Toast notifications for API errors
- ✅ **Loading States**: Visual feedback during API calls
- ✅ **Empty States**: Friendly messages when no comments exist

## Usage Example

```tsx
import { CommentSection } from "@/components/artbook/comments";

export function ArtbookPage({ artbookSlug }: { artbookSlug: string }) {
  return (
    <div className="space-y-8">
      {/* Your artbook content */}
      
      {/* Comments Section */}
      <CommentSection 
        artbookSlug={artbookSlug}
        className="mt-8"
      />
    </div>
  );
}
```

## API Integration

The components expect these API endpoints:

- `GET /api/artbooks/[slug]/comments` - Fetch comments
- `POST /api/artbooks/[slug]/comments` - Create new comment/reply
- `PUT /api/artbooks/[slug]/comments/[id]` - Edit comment (TODO)
- `DELETE /api/artbooks/[slug]/comments/[id]` - Delete comment (TODO)

## Styling

Uses the existing orange theme:
- Primary color: #FF6900 (orange-500)
- Background highlights: #FFEDD4 (orange-50)
- Font family: Syne for headings

## Dependencies

- `date-fns` - For time formatting
- `sonner` - For toast notifications
- `lucide-react` - For icons
- `@radix-ui` components via shadcn/ui

## TODO

- [ ] Implement edit comment API endpoint
- [ ] Implement delete comment API endpoint
- [ ] Add comment sorting options
- [ ] Add comment moderation features
- [ ] Add emoji reactions
- [ ] Add comment search/filtering