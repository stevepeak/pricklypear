# 🌵 Prickly Pear

> **AI-assisted co-parenting communication app**

**Repository**: `https://github.com/gwizinc/pricklypear.git`  
**Type**: React Single Page Application (SPA) with Supabase backend  
**Primary Language**: TypeScript  
**Runtime**: Bun (JavaScript runtime)  
**Database**: PostgreSQL via Supabase  
**AI Integration**: OpenAI API via Deno Edge Functions

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Development Workflow](#development-workflow)
- [Project Scripts](#project-scripts)
- [Project Structure](#project-structure)
- [API & Edge Functions](#api--edge-functions)
- [Database Schema](#database-schema)
- [Contributing](#contributing)

## 🎯 Project Overview

**Prickly Pear** is a **single-page React application** designed for respectful co-parenting communication with AI assistance. The application provides a comprehensive chat platform that enables separated parents to communicate effectively about their children.

### Core Features

- **Threads Management**: Conversations organized by topic (travel, education, health, etc.)
- **Connection System**: Invite, accept, decline, or disable contact with other parents
- **AI-Powered Assistance**:
  - Message tone rewriting via `review-message` Edge Function
  - Thread summarization via `summarize-thread` Edge Function
- **Read Receipts**: Per-message read tracking with unread counters
- **Authentication & Storage**: Supabase-powered (PostgreSQL + Row Level Security)
- **Real-time Updates**: WebSocket connections for live message synchronization

### Repository Structure

This repository contains both:

- **Frontend**: React single-page application (`src/` directory)
- **Backend**: Supabase Edge Functions (Deno runtime) (`supabase/functions/` directory)

## 🏗️ Architecture

### System Architecture Diagram

```
┌────────────┐   HTTP/WebSocket   ┌─────────────────────────┐     RPC      ┌──────────────────┐
│  Browser   │ ─────────────────▶ │  Bun dev / Vercel Edge  │ ───────────▶ │ Supabase (Postgres│
│  React App │                   │ (serves static bundle)  │              │   & Auth)        │
└────────────┘                    └─────────────────────────┘              └──────────────────┘
        ▲                                   ▲   invoke() / REST
        │                                   │
        │           Edge Functions (Deno) ──┘
        │                review-message
        │                summarize-thread
        ▼
   OpenAI API
```

### Data Flow

1. **Frontend**: React SPA served by Bun dev server or Vercel Edge
2. **Backend**: Supabase PostgreSQL database with Row Level Security
3. **AI Processing**: OpenAI API integration via Deno Edge Functions
4. **Real-time**: WebSocket connections for live updates

### Component Architecture

- **React Context API**: Global state management
- **Custom Hooks**: Data fetching and business logic
- **Service Layer**: API abstraction for Supabase interactions
- **Edge Functions**: Serverless AI processing functions

## 🛠️ Technology Stack

### Frontend Technologies

- **Framework**: React 18+ (Single Page Application)
- **Build Tool**: Bun (JavaScript runtime & bundler)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router
- **Analytics**: Vercel Analytics & Google Analytics
- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript (strict mode)

### Backend Technologies

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Edge Functions**: Deno runtime
- **AI Integration**: OpenAI API
- **Real-time**: Supabase Realtime
- **Row Level Security**: Database-level access control

### Development Tools

- **Package Manager**: Bun
- **Type Checking**: TypeScript
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest
- **Deployment**: Vercel (frontend), Supabase (backend)
- **Version Control**: Git

## 🚀 Installation & Setup

### Prerequisites

Before setting up the project, ensure you have the following installed:

1. **Bun ≥ 1.2** - [Install Bun](https://bun.sh)
2. **Git** - Version control system
3. **Modern Browser** - Chrome, Firefox, Safari, or Edge
4. **Supabase CLI** (optional) - For local Edge Function development

### Environment Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration (for AI features)
OPENAI_API_KEY=your-openai-api-key-here
```

> **Note**: The project includes demo credentials in `src/integrations/supabase/client.ts`. Replace these with your own Supabase project credentials for production use.

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/gwizinc/pricklypear.git
cd pricklypear

# 2. Install dependencies
bun install

# 3. Set up environment variables (optional)
cp .env.example .env
# Edit .env with your credentials

# 4. Start the development server
bun run dev
```

The application will be available at `http://localhost:3000`

### Local Edge Function Development

To run Edge Functions locally for development:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Start Edge Functions locally
supabase functions serve review-message
supabase functions serve summarize-thread
```

## 🔄 Development Workflow

### Development Commands

```bash
# Start development server with hot reload
bun run dev

# Run tests
bun test

# Run linting and formatting
bun run lint
bun run fix

# Type checking
bun run typecheck

# Build for production
bun run build

# Run full CI pipeline
bun run ci
```

### Code Quality Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: React hooks and TypeScript rules
- **Prettier**: Automatic code formatting
- **Testing**: Vitest for unit and integration tests
- **File Naming**: kebab-case for files and directories
- **Component Structure**: Function components with TypeScript interfaces

## 📜 Project Scripts

| Command             | Purpose                  | Output                  |
| ------------------- | ------------------------ | ----------------------- |
| `bun run dev`       | Start development server | `http://localhost:3000` |
| `bun run build`     | Build production bundle  | `dist/` directory       |
| `bun test`          | Run test suite           | Test results            |
| `bun run lint`      | ESLint + Prettier check  | Linting report          |
| `bun run fix`       | Auto-fix linting issues  | Fixed code              |
| `bun run typecheck` | TypeScript type checking | Type errors             |
| `bun run ci`        | Full CI pipeline         | Build + test + lint     |

## 📁 Project Structure

```
pricklypear/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── thread/               # Thread-related components
│   │   ├── connections/          # Connection management
│   │   └── commands/             # Command menu components
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                 # React context providers
│   ├── services/                 # Data access layer
│   ├── integrations/             # Third-party integrations
│   │   └── supabase/             # Supabase client & types
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   └── index.tsx                 # Application entry point
├── supabase/                     # Backend configuration
│   ├── functions/                # Edge Functions
│   │   ├── review-message/       # Message tone rewriting
│   │   ├── summarize-thread/     # Thread summarization
│   │   └── utils/                # Shared utilities
│   ├── migrations/               # Database migrations
│   └── seeds/                    # Database seed data
├── tests/                        # Test files
├── build.ts                      # Bun build script
├── index.html                    # HTML entry point
└── package.json                  # Dependencies & scripts
```

### Key Directories Explained

- **`src/components/`**: React components organized by feature
- **`src/hooks/`**: Custom React hooks for data fetching and state management
- **`src/services/`**: API layer for Supabase interactions
- **`src/integrations/supabase/`**: Generated TypeScript client and types
- **`supabase/functions/`**: Deno Edge Functions for AI processing

## 🔌 API & Edge Functions

### Available Edge Functions

#### `review-message`

- **Purpose**: Rewrite message text in different tones
- **Input**: Message text, target tone
- **Output**: Rewritten message
- **Technology**: OpenAI API integration
- **Location**: `supabase/functions/review-message/`

#### `summarize-thread`

- **Purpose**: Generate concise thread summaries
- **Input**: Thread ID
- **Output**: 2-3 sentence summary
- **Technology**: OpenAI API integration
- **Location**: `supabase/functions/summarize-thread/`

### API Endpoints

- **Supabase Client**: Generated TypeScript client in `src/integrations/supabase/`
- **Edge Functions**: Invoked via `supabase.functions.invoke()`
- **Real-time**: WebSocket subscriptions via Supabase Realtime

## 🗄️ Database Schema

### Key Tables

- **`threads`**: Conversation topics and metadata

  - `id`: Primary key
  - `title`: Thread title
  - `created_at`: Creation timestamp
  - `updated_at`: Last update timestamp

- **`messages`**: Individual chat messages

  - `id`: Primary key
  - `thread_id`: Foreign key to threads
  - `content`: Message text
  - `sender_id`: User ID of sender
  - `created_at`: Creation timestamp

- **`connections`**: User relationships and permissions

  - `id`: Primary key
  - `user_id`: Primary user
  - `connected_user_id`: Connected user
  - `status`: Connection status (pending, accepted, declined)

- **`users`**: User profiles and authentication
  - `id`: Primary key (from Supabase Auth)
  - `email`: User email
  - `created_at`: Account creation timestamp

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. JWT token stored in browser
3. API requests authenticated via token
4. Row Level Security enforces data access permissions

### Row Level Security (RLS)

- **Threads**: Users can only access threads they're participants in
- **Messages**: Users can only see messages in threads they have access to
- **Connections**: Users can only see their own connections
