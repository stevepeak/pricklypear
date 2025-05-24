# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `bun install` (requires Bun ≥ 1.2)
- **Start dev server**: `bun run dev` (hot reload at http://localhost:3000)
- **Build**: `bun run build` (outputs to dist/)
- **Test**: `bun test` (Vitest with jsdom)
- **Lint**: `bun run lint` (ESLint + React hooks rules)
- **Type check**: `bun run typecheck` (strict TypeScript checking)
- **CI pipeline**: `bun run ci` (lint + typecheck + build)

## Architecture Overview

Prickly Pear is an AI-assisted co-parenting chat application built with React + Supabase. The codebase includes both the frontend and Supabase Edge Functions.

**Tech Stack:**

- Frontend: React 19 + TypeScript + Tailwind CSS 4
- UI Components: Radix UI primitives with shadcn/ui patterns
- Backend: Supabase (Auth, PostgreSQL, Real-time, Edge Functions)
- State Management: TanStack Query + React Context
- Build Tool: Custom Bun bundler (build.ts)
- AI Features: OpenAI integration via Edge Functions

**Key Data Flow:**

- Authentication managed by Supabase Auth with AuthContext provider
- Real-time updates via Supabase subscriptions for messages/threads
- AI assistance through Edge Functions (review-message, summarize-thread)
- Thread-based conversations organized by topics (travel, health, education)
- Parent-to-parent connection system with invite/accept workflow

## Code Organization

**Services Pattern:**

- `src/services/` - Data access layer for threads, messages, connections
- `src/hooks/` - Custom React hooks for state management
- `src/contexts/` - Global providers (AuthContext, ConnectionsContext)
- `src/types/` - Shared TypeScript models

**UI Components:**

- `src/components/ui/` - Reusable primitives (buttons, dialogs, forms)
- `src/components/` - Feature-specific components organized by domain
- Layout uses SidebarProvider + breadcrumb navigation
- Forms use React Hook Form + Zod validation

**Key Files:**

- `src/integrations/supabase/client.ts` - Supabase client configuration
- `src/App.tsx` - Main routing and auth-gated layout
- `build.ts` - Custom Bun bundler with Tailwind plugin
- `supabase/functions/` - Edge Functions for AI features

## Development Notes

- Environment variables for Supabase/OpenAI can override demo keys
- Edge Functions can be served locally with Supabase CLI
- Tests should be written alongside code using Vitest
- Follow existing ESLint rules - no Prettier formatting
- Keep PRs focused and run lint/typecheck before committing
