---
title: Prickly Pear
version: '1.0.0'
sections:
  - Overview
  - Prerequisites
  - Installation
  - Usage
  - Examples
  - API Reference
  - Prompt Examples
  - Contributing
---

<p align="center">
  <h1>🌵 Prickly Pear</h1>
</p>
<p align="center"><i>AI-assisted parenting chat for prickly past partnerships.</i></p>
<p align="center">
  <a href="https://charlielabs.ai"><img src="https://img.shields.io/badge/Charlie%20works%20here-ABF716?style=flat-square" alt="Charlie Labs"></a>
</p>

+++ Quick nav

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Prompt Examples](#prompt-examples)
- [Contributing](#contributing)
  +++

## Overview

Prickly Pear is a single-page **React** chat application that helps co-parents communicate respectfully. The repo contains **both** the front end and a set of **Supabase Edge Functions** (Deno) that power AI features.

Key features:

- Threads grouped by topic (travel, education, health...)
- Connection requests plus blocking/allowing contacts
- Per-message read receipts & unread counters
- **AI helpers** powered by OpenAI
  - `review-message` -- rewrites a draft in a friendlier tone
  - `summarize-thread` -- produces a 2-3 sentence recap

High-level runtime diagram:

```text
┌────────────┐   HTTP/WebSocket   ┌─────────────────────────┐     RPC      ┌──────────────────┐
│  Browser   │ -----------------> │  Bun dev / Vercel Edge  │ -----------> │ Supabase (Postgres│
│  React App │                   │ (serves static bundle)  │              │   & Auth)        │
└────────────┘                    └─────────────────────────┘              └──────────────────┘
        ^                                   ^   invoke() / REST
        |                                   |
        |           Edge Functions (Deno) --┘
        |                review-message
        |                summarize-thread
        v
   OpenAI API
```

---

## Prerequisites

- **Bun >= 1.2** -- <https://bun.sh>
- A **Supabase project** (grab the project URL plus anon key)
- **OpenAI API key** (only if you want local AI features)
- `git` and a modern browser

---

## Installation

```bash
# 1. Clone & install dependencies
$ git clone https://github.com/gwizinc/pricklypear.git
$ cd pricklypear
$ bun install

# 2. Environment (create .env or export variables)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="pk_..."
OPENAI_API_KEY="sk_..."

# 3. Start the dev server (hot reload)
$ bun run dev
# -> http://localhost:3000 (prints when ready)
```

### Deploying Edge Functions locally

```bash
# Supabase CLI required -> https://supabase.com/docs/guides/cli
$ supabase functions serve review-message
$ supabase functions serve summarize-thread
```

---

## Usage

Common development scripts:

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `bun run dev`       | Start hot-reload dev server          |
| `bun run build`     | Produce optimized bundle in `dist/`  |
| `bun test`          | Run Vitest test suite                |
| `bun run lint`      | ESLint (React hooks + TS)            |
| `bun run typecheck` | Strict type checking (no emit)       |
| `bun run ci`        | Lint + typecheck + build (CI helper) |

Folder map:

```text
├─ src/
│  ├─ components/        # UI building blocks
│  ├─ pages/             # Route-level views
│  ├─ hooks/             # Custom React hooks
│  ├─ contexts/          # Global providers (auth, toast...)
│  ├─ services/          # Supabase data helpers
│  ├─ integrations/      # Third-party SDK wrappers
│  └─ types/             # Shared TS types
├─ supabase/functions/   # Deno Edge Functions  (see API Reference)
├─ build.ts              # Bun bundler script
└─ index.html            # SPA entry point
```

---

## Examples

Below are **copy-paste-ready** commands with expected output so an LLM can learn accurate completions.

### 1. Create a new thread via Supabase RPC

```bash
$ bun run thread:create --title "Travel Itinerary"
✔ Thread "Travel Itinerary" created (id: 42)
```

### 2. Call `review-message` Edge Function

```bash
$ curl -s -X POST \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"UR flight details suck"}' \
  "$SUPABASE_URL/functions/v1/review-message"
# -> { "revised": "Your flight details are missing. Could you please add them?" }
```

### 3. Get a thread summary

```bash
$ curl -s -X POST \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{"thread_id":42}' \
  "$SUPABASE_URL/functions/v1/summarize-thread" | jq
{
  "summary": "Alice and Bob agreed on the final itinerary and will purchase tickets by Friday."
}
```

---

## API Reference

### Edge Functions

| Name             | Path                             | Method | Body shape (JSON)       | Response example      |
| ---------------- | -------------------------------- | ------ | ----------------------- | --------------------- |
| review-message   | `/functions/v1/review-message`   | POST   | `{ message: string }`   | `{ revised: string }` |
| summarize-thread | `/functions/v1/summarize-thread` | POST   | `{ thread_id: number }` | `{ summary: string }` |

> The Supabase anonymous public key **must** be sent in the `Authorization: Bearer` header.

### Environment variables

| Variable            | Required | Description                        |
| ------------------- | -------- | ---------------------------------- |
| `SUPABASE_URL`      | Yes      | Base URL of your Supabase instance |
| `SUPABASE_ANON_KEY` | Yes      | Public API key (role = anon)       |
| `OPENAI_API_KEY`    | No       | Enables AI features when provided  |

---

## Prompt Examples

These are sample input-output pairs that downstream LLM tools can ingest to understand our AI endpoints.

```jsonc
// prompt: review-message
{
  "message": "YOU ALWAYS PAY LATE!"
}
// completion:
{
  "revised": "I noticed the last few payments came in later than expected. Could we agree on a schedule that works for both of us?"
}
```

```jsonc
// prompt: summarize-thread (20 messages about a school trip)
{
  "thread_id": 58
}
// completion:
{
  "summary": "Parents agreed on the 4/15 trip, chose the museum as the destination, and will share a packing list next week."
}
```

---

## Contributing

1. Fork & clone.
2. Create a branch: `git checkout -b feat/my-feature`.
3. **Write code + tests**. Run `bun run lint && bun run typecheck` before committing.
4. Push -> open a PR. Explain _why_, link issues, keep commits focused.
5. A maintainer will review, request tweaks if needed, and merge.

Style & tooling guidelines:

- Follow existing ESLint rules; Prettier runs via `bun run lint` and `bun run fix`.
- Keep PRs small; large refactors should be split across multiple PRs.
- Tests live next to the code they cover and use Vitest.

---

© Gwiz Inc. Licensed under the MIT License.
