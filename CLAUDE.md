# CLAUDE.md - AI Artbook Platform Development Memory

## 🎯 Project Overview
**Project Name**: AI Artbook Platform (Brand: Storyr)
**Description**: Online platform for creating, browsing, and sharing picture books using AI
**GitHub Repo**: https://github.com/Meowbotz-ll/ai-storybook
**Tech Stack**: Next.js 15, React, shadcn/ui, OpenAI API, Prisma, NeonDB

## 📋 Essential Commands
```bash
# Development Environment
npm run dev --turbopack  # Start development server with Turbopack (port 3000)
npm run build            # Build production version
npm run start            # Start production server
npm run lint             # Run code linting
npx tsc --noEmit        # TypeScript type checking

# Git Workflow
git pull origin master    # Sync before starting work
git add .                 # Stage changes
git commit -m "message"   # Commit changes
git push origin master    # Push to remote
```

## 🏗️ Project Structure
```
/app              # Next.js App Router pages
  /api            # API routes
    /auth         # Better Auth endpoints
    /artbooks     # Artbook CRUD operations
      /[slug]     # Artbook routes using slug parameters (replacing UUID)
        /like     # Like functionality
        /view     # View tracking
        /comments # Comment system
    /user         # User data management
    /generate-outline          # Story outline generation (GPT-4)
    /generate-story           # Complete story generation (GPT-4)
    /generate-image           # Image generation (DALL-E 3)
    /generate-consistent-image # Consistent image generation
    /generate-audio           # Audio generation (TTS)
    /extract-character-info    # Character feature extraction
  /auth           # Authentication pages (dedicated directory)
    /login        # Login page (no sidebar)
    /signup       # Signup page (no sidebar)
  /(root)         # Main app pages (with sidebar) - Route Group
    /artbook      # Artbook-related pages
      /[slug]     # Artbook detail page using slug
    /create       # Create artbook page
    /discovery    # Discovery page
    /profile      # Profile page
    /page.tsx     # Homepage
/components       # React components
  /ui             # shadcn/ui component library
  /artbook        # Artbook creation components
  /discovery      # Discovery page components
  /profile        # Profile components
/lib              # Utility functions and API clients
  /api            # Centralized database operations (refactored)
  /stores         # Zustand state management
/prisma           # Database schema and migrations
/messages         # Translation files (en.json, zh-TW.json)
```

## 🎨 Design System
- **Primary Color**: Orange (#FF6900)
- **Background**: White (#FFFFFF)
- **Sidebar**: Light Orange (#FFEDD4)
- **Fonts**: Syne, Manrope, Comic Neue, Playfair Display
- **Effects**: Neumorphic style shadows

## 🤖 AI Integration
### Text Generation (GPT-4)
- **Story Outline Generation** (`/api/generate-outline`)
  - Temperature: 0.7, Max tokens: 1000
  - Automatic pagination feature
- **Story Content Generation** (`/api/generate-story`)
- **Character Feature Extraction** (`/api/extract-character-info`)
  - Automatic analysis of character appearance
  - Used for maintaining image consistency

### Image Generation (DALL-E 3)
- **Basic Image Generation** (`/api/generate-image`)
  - Model: dall-e-3
  - Size: 1024x1024
  - Quality: standard
- **Consistent Image Generation** (`/api/generate-consistent-image`)
  - Smart character feature continuation
  - Multi-page visual consistency
- **Optimization Features**:
  - Child-friendly content filtering
  - Borderless clean illustrations
  - Cartoon style optimization

### Audio Generation (TTS-1)
- **Voice Synthesis** (`/api/generate-audio`)
  - Model: TTS-1 with 'alloy' voice
  - Supports Chinese and English content

### Environment Variables
- `OPENAI_API_KEY` (required)
- `DATABASE_URL` (NeonDB PostgreSQL)
- `BETTER_AUTH_SECRET` (authentication encryption key)

## 📈 Current Progress
### ✅ Completed Features
- [x] Basic project architecture and routing setup
- [x] **User Authentication System (Better Auth)** ⭐ Complete
- [x] **Database Integration (Prisma + NeonDB)** ⭐ Complete
- [x] **Centralized API Architecture** ⭐ Complete
- [x] Multi-language support framework (Chinese/English)
- [x] Collapsible sidebar functionality (270px ↔ 70px)
- [x] Create artbook page (multi-page navigation system)
- [x] AI story generation integration (GPT-4)
- [x] **Image Generation Integration (DALL-E 3)** ⭐ Complete
- [x] **Image Consistency System** ⭐ Complete
- [x] **Audio Generation Integration (TTS-1)** ⭐ Complete
- [x] Preview and reading interface
- [x] New design system implementation (orange theme)
- [x] **Social Features (likes/comments)** ⭐ Complete
- [x] **Profile Page** ⭐ Complete
- [x] **Route Groups Architecture** ⭐ Complete
- [x] **SEO-Friendly URLs (Slug System)** ⭐ Complete
- [x] **Complete Comment System (nested replies + likes)** ⭐ Complete
- [x] **User Home Artbook Management (edit/delete)** ⭐ Complete
- [x] **Immersive Reading Dialog** ⭐ Complete
- [x] **Artbook Report Functionality** ⭐ Complete
- [x] **Accessibility Improvements** ⭐ Complete

### 🚧 In Progress
- [ ] AWS S3 media storage integration
- [ ] PDF/PNG export functionality
- [ ] Usage limits (10 books/day, 10 pages/book)

### 📅 Planned Features
- [ ] Advanced filtering for discovery page
- [ ] Artbook sharing link generation
- [ ] Admin dashboard
- [ ] Mobile device optimization

## 🔥 Core Feature Details
### Image Consistency System
1. **Smart Character Memory**: Automatically extracts character features after generating the first page image
2. **Continuity Generation**: Subsequent pages automatically merge character features with new scenes
3. **Visual Consistency**: Ensures main characters maintain the same appearance across all pages
4. **User Experience**: Orange notification boxes display recorded character features

### Create Artbook Page Features
- **Dual-Column Layout**: Left preview area + right editing area
- **Multi-Page Navigation**: Page switching, add/delete pages
- **Real-Time Preview**: Generated images displayed instantly
- **Regeneration**: One-click regenerate button in top-right of images
- **Smart Prompts**: Different pages provide relevant input guidance
- **User Authentication Integration**: Login required to create
- **Database Storage**: Complete artbook data persistence

### Component Architecture
**Important**: Each component is split into separate files for better maintainability and reusability

```
components/
├── profile/
│   ├── profile-info-form.tsx     # Profile form (✅ Complete)
│   └── password-change-form.tsx  # Password change form (✅ Complete)
├── artbook/
│   ├── artbook-metadata-form.tsx # Artbook metadata form (✅ Complete)
│   ├── page-preview.tsx          # Page image preview (✅ Complete)
│   ├── story-outline-section.tsx # Story generation area (✅ Complete)
│   ├── image-generation-section.tsx # Image generation area (✅ Complete)
│   ├── audio-generation-section.tsx # Audio generation area (✅ Complete)
│   ├── reading-dialog.tsx        # Immersive reading dialog (✅ Complete)
│   └── comments/                 # Complete comment system (✅ Complete)
├── discovery/
│   ├── filters-bar.tsx           # Category and sort filters (✅ Complete)
│   └── artbook-card.tsx          # Artbook cards (✅ Complete)
└── ui/                          # Reusable UI components (shadcn/ui)
```

### Centralized API Architecture
**New**: Database operations are now centralized in `/lib/api/` for better separation of concerns

```
/lib/api/
├── artbooks.ts    # All artbook CRUD operations
├── comments.ts    # Comment system operations
├── likes.ts       # Like/unlike operations
├── users.ts       # User management operations
├── reports.ts     # Report functionality
└── views.ts       # View tracking operations
```

#### Architecture Benefits
- **Separation of Concerns**: Routes handle HTTP, API functions handle database logic
- **Reusability**: Database operations can be shared across multiple routes
- **Better Testability**: API functions can be unit tested independently
- **Maintainability**: Centralized database operations are easier to modify
- **No Direct Prisma in Routes**: Clean route files without database coupling

#### Optimization Highlights
- **Route Groups**: Uses `(root)` to organize main app pages, ensuring sidebar only shows when needed
- **Separated Auth Flow**: `/auth/*` routes provide distraction-free login/signup experience
- **Simplified Sidebar**: Removed redundant UserNav component and category dropdown

## 🐛 Known Issues
- [x] ~~Image generation with book borders issue~~ (Resolved)
- [x] ~~DialogContent accessibility issue~~ (Resolved)
- [ ] Sidebar spacing needs adjustment in some cases
- [ ] Mobile responsive design optimization needed

## 💡 Development Guidelines
1. **Environment Variables**: Ensure `OPENAI_API_KEY`, `DATABASE_URL`, `BETTER_AUTH_SECRET` are set
2. **Image Generation PROMPTS**: Avoid using "children's book illustration" and similar terms that create borders
3. **Image Consistency**: First page descriptions should be detailed, including character appearance
4. **TypeScript**: Run `npx tsc --noEmit` after editing any TypeScript files
5. **Component Architecture**: Each component should be in separate files, avoid writing all components in page.tsx
6. **Git Commits**: Use descriptive commit messages
7. **Code Style**: Follow existing code conventions
8. **Testing**: Ensure functionality works before pushing
9. **Documentation**: Update this file when making important changes
10. **Development Server**: Use `npm run dev --turbopack` to start, Claude won't auto-execute
11. **API Architecture**: Use centralized API functions instead of direct Prisma imports in routes
12. **Accessibility**: Ensure all Dialog components have proper DialogTitle for screen readers

## 🎯 Image Generation Best Practices
### Recommended PROMPT Keywords
- ✅ `clean illustration`, `flat design`, `cartoon style`
- ✅ `colorful artwork`, `digital painting`, `no borders`

### Keywords to Avoid
- ❌ `children's book illustration`, `storybook art`
- ❌ `book page`, `picture book`, `page illustration`

### PROMPT Template
```
First Page (Cover): [detailed character appearance], [action/pose], [environment background], cartoon style, colorful, clean flat illustration, no borders
Subsequent Pages: [scene description], [action], vibrant colors, cartoon illustration, clean artwork, no frames
```

## 🔐 Authentication System
### Better Auth Integration
- **Login/Signup**: Complete user authentication flow
- **Session Management**: Secure session handling
- **User State**: Zustand store manages authentication state
- **Protected Routes**: Login required to create artbooks

### Database Schema (Prisma)
Main Entities:
- **Users**: User data
- **Artbooks**: Artbook data (title, slug, content, visibility)
- **Pages**: Artbook pages (story text, image URL, audio URL)
- **Likes**: User like relationships
- **Comments**: Comment system (supports replies and likes)
- **Views**: View tracking
- **Reports**: Content reporting system

### Key Features
#### SEO-Friendly URL System (Slug)
- **Auto Slug Generation**: Automatically generates URL-friendly slugs from artbook titles
- **Uniqueness Guarantee**: Automatically handles duplicate slugs by adding numeric suffixes
- **URL Format**: `/artbook/my-fairy-tale-story` (replaces UUID)
- **Backward Compatibility**: Retains ID field for internal relationships

## 📝 Work Log
### 2025-07-01 (API Refactoring Session)
- ✅ **Complete API Architecture Refactoring**
  - Created 6 centralized API modules in `/lib/api/`
  - Refactored 11 route files to remove direct Prisma imports
  - Implemented proper separation of concerns
  - All TypeScript type checks pass
- ✅ **Accessibility Improvements**
  - Fixed DialogContent accessibility issue in ReadingDialog component
  - Added proper DialogTitle for screen reader support
- ✅ **Enhanced Type Safety**
  - Updated ReportCategory types to match route expectations
  - Fixed Prisma enum compatibility issues
  - Maintained existing type structure

### 2025-06-30 (Previous Sessions)
- ✅ **Comment System Complete Implementation**
  - Built complete comment API endpoints (GET, POST, PUT, DELETE)
  - Implemented nested reply functionality (max 2 levels)
  - Created comment UI component system
  - Integrated comment section into artbook detail pages with real-time count updates
- ✅ **User Home Management Features**
  - Implemented artbook edit/delete API endpoints
  - Created edit artbook modal component
  - Added management card component with hover action buttons
  - Implemented optimistic updates and confirmation dialogs
- ✅ **Comment Like System**
  - Added CommentLike database model
  - Built comment like API endpoints (GET, POST)
  - Updated comment UI components to support like functionality
  - Implemented optimistic updates and animations
- ✅ **Artbook Page Simplification and Reading Experience Optimization**
  - Simplified artbook detail page, removed audio playback, page navigation, page numbers
  - Highlighted artbook cover, added "Read Now" button
  - Created immersive reading dialog (ReadingDialog)
  - Implemented artbook report functionality (ReportArtbookDialog)
  - Left-right column reading interface: left image, right content and audio player

---
**Last Updated**: 2025-07-01 12:00
**Updated By**: Claude Code

> 💡 **Usage Note**: Check this file at the beginning of each work session to understand the latest progress. Update relevant sections after making important changes and commit.