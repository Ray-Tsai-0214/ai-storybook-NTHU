# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered artbook creation platform that allows users to create, browse, and share AI-generated children's stories with illustrations. The platform supports both Traditional Chinese and English through next-intl internationalization and includes social interaction features.

## Development Commands

- `npm run dev --turbopack` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Type check without emitting files (run after every TypeScript file edit)

## Architecture

### Full Tech Stack (from PRD)

- **Framework**: Next.js 15 with App Router
- **UI**: React + shadcn/ui components + Tailwind CSS v4
- **State Management**: Zustand
- **Validation**: Zod
- **Database**: NeonDB (PostgreSQL) + Prisma ORM
- **Authentication**: Better Auth
- **Media Storage**: AWS S3
- **AI Integration**: OpenAI API (GPT-4, DALL-E 3, TTS-1)
- **Internationalization**: next-intl (Traditional Chinese / English)
- **Deployment**: Vercel
- **DNS**: Cloudflare DNS
- **Domain**: Namecheap

### Core Directory Structure

```
app/
├── api/
│   ├── generate-outline/   # Story outline generation
│   └── generate-story/     # Story text generation
├── artbook/               # Artbook reading interface
│   └── read/              # Reading page
├── create/                # Multi-step artbook creation
├── discovery/             # Browse and search artbooks
└── profile/               # User profile pages
```

### Key Components

- `components/app-layout.tsx` - Main layout with collapsible sidebar and responsive design
- `components/sidebar.tsx` - Left side panel navigation
- `components/ui/` - Reusable UI components based on Radix UI
- `lib/api/openai.ts` - Centralized OpenAI API integration

### Environment Variables

Required:

- `OPENAI_API_KEY` - OpenAI API key for story and image generation
- `DATABASE_URL` - NeonDB PostgreSQL connection string

Optional:

- `REPLICATE_API_KEY` - Alternative AI service
- `ELEVENLABS_API_KEY` - Voice generation
- AWS S3 configuration for media storage

## Core Features & User Flow

### Navigation Structure

- **Home**: User dashboard with creation stats and personal artbook list
- **Discovery**: Browse, search, and filter public artbooks
- **Create Artbook**: Multi-step creation process
- **User Profile**: Public profile with artbook collections

### Artbook Creation Flow

1. **Initial Setup**: Topic input, story outline generation, cover creation, page count selection (max 10)
2. **Page-by-Page Editing**: Each page contains story text, AI-generated images, and TTS audio
3. **Preview & Export**: Full artbook preview with PDF/PNG export options

### Social Features

- Like/unlike artbooks
- Comment system with replies
- View count tracking
- Public/private artbook settings
- User profile visibility controls

### Usage Limits

- 10 artbooks per user per day
- Maximum 10 pages per artbook
- Content quotas only count after saving

## AI Integration Pattern

### OpenAI Configuration (`lib/api/openai.ts`)

- **Text Model**: GPT-4 Turbo Preview
- **Image Model**: DALL-E 3 (1024x1024, standard quality)
- **TTS Model**: TTS-1 with 'alloy' voice
- **Temperature**: 0.7, Max Tokens: 2000

### Helper Functions

- `generateStoryText()` - Story content generation
- `generateStoryImage()` - Image generation with prompts
- `generateSpeech()` - Text-to-speech conversion

## Internationalization

### Language Support

- Traditional Chinese (zh-TW) - Primary language
- English (en) - Secondary language
- Auto-detection based on browser language
- Language switcher in navbar

### Implementation

- Messages in `messages/en.json` and `messages/zh-TW.json`
- Configuration in `i18n/request.ts`
- No i18n routing (single domain for all languages)

## Database Schema (Prisma)

Key entities to implement:

- Users (authentication via Better Auth)
- Artbooks (title, content, visibility, creation date)
- Pages (story text, image URLs, audio URLs)
- Likes (user-artbook relationships)
- Comments (with replies support)
- View tracking

## Export & Sharing

### Export Formats

- PDF export for full artbook
- Individual page PNG downloads
- Unique shareable links for public artbooks

### Media Management

- All images and audio stored in AWS S3
- Automatic cleanup of unsaved/expired files
- CDN delivery for optimal performance

## Development Notes

### Component Architecture

**IMPORTANT**: Each component should be split into separate files for better maintainability and reusability. Do NOT write all components in page.tsx files.

**Component Organization Guidelines**:
- Split page components into logical sub-components in `/components` directory
- Create component-specific directories when components have multiple related files
- Use descriptive component names that indicate their purpose
- Keep page.tsx files focused on layout and data fetching
- Reusable UI logic should be extracted into separate components

**Implemented Component Structure**:
```
components/
├── profile/
│   ├── profile-info-form.tsx      # Profile picture and name form (✅ Complete)
│   └── password-change-form.tsx   # Password change form (✅ Complete)
├── artbook/
│   ├── artbook-metadata-form.tsx  # Title, description, category (✅ Complete)
│   ├── page-preview.tsx           # Page image preview (✅ Complete)
│   ├── story-outline-section.tsx  # Story generation section (✅ Complete)
│   ├── image-generation-section.tsx # Image generation section (✅ Complete)
│   └── audio-generation-section.tsx # Audio generation section (✅ Complete)
├── discovery/
│   ├── filters-bar.tsx            # Category and sort filters (✅ Complete)
│   └── artbook-card.tsx           # Individual artbook display card (✅ Complete)
└── ui/                           # Reusable UI components (shadcn/ui)
```

**Page Structure**:
```
app/
├── profile/settings/page.tsx      # Profile settings (✅ Refactored with components)
├── create/page.tsx                # Artbook creation (⚠️ Needs refactoring)
├── discovery/page.tsx             # Browse artbooks (✅ Complete with components)
└── artbook/[id]/page.tsx          # Individual artbook view (📝 TODO)
```

### TypeScript Requirement

Always run `npx tsc --noEmit` after editing any TypeScript file to ensure type safety.

### External Package Documentation

**IMPORTANT**: Always check the latest package documentation online before using external packages. Package APIs can change between versions. Key packages to verify:

- **OpenAI SDK** (v5.5.1+): https://github.com/openai/openai-node
- **Better Auth** (v1.2.10+): https://www.better-auth.com/docs
- **Prisma** (v6.9.0+): https://www.prisma.io/docs
- **next-intl** (v4.1.0+): https://next-intl-docs.vercel.app
- **Radix UI** components: https://www.radix-ui.com/primitives/docs
- **Zustand**: https://github.com/pmndrs/zustand
- **Tailwind CSS v4**: https://tailwindcss.com/docs

### Package Version Notes

- **Better Auth**: Recently updated to v1.2.10 - check for API changes
- **OpenAI SDK**: v5.x has different API structure than v4.x
- **Tailwind CSS**: Using v4 (beta) - may have breaking changes from v3
- **Next.js**: v15.3.3 with App Router - verify compatibility with other packages

### Responsive Design

- Mobile-first approach with collapsible sidebar
- Touch-friendly interfaces for mobile creation
- Audio playback support across devices

### Error Handling

- Comprehensive OpenAI API error handling
- User-friendly error messages
- Graceful degradation for AI service failures

### Performance Considerations

- Lazy loading for artbook galleries
- Image optimization and caching
- Efficient state management with Zustand
