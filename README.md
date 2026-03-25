# Drama Quick Cut

Drama Quick Cut is a full-stack AI-assisted video rough-cut workflow for short-drama commentary production.

## Current stack

### Frontend
- Vite
- React 18
- TypeScript
- Wouter
- Tailwind CSS
- TanStack Query

### Backend
- Express
- tRPC
- Drizzle ORM
- SQLite / MySQL-compatible schema layer

### Processing and integrations
- FFmpeg / FFprobe
- DashScope / Qwen for video analysis and text generation
- MiniMax for TTS
- Local filesystem or cloud object storage (GCS / S3 / OSS)

## What the app does

The main workflow is:

1. Upload source video material
2. Analyze video content with AI
3. Generate commentary plan and rough-cut tasks
4. Run modular processing tasks for video, audio, subtitles, and merge
5. Review generated project outputs in the web app

## Routes

The client app currently exposes these primary routes:

- `/` landing page
- `/login` login page
- `/upload` upload workflow
- `/projects` project list
- `/project/:id` project detail
- `/assets` asset library

## Current project status

This repository is a working full-stack application, but it still behaves like an actively evolving production tool rather than a fully finalized SaaS product.

Recent cleanup focused on:
- aligning docs with the actual codebase
- removing misleading production mocks
- improving cookie security behavior
- improving SEO metadata for the landing page
- reducing synchronous filesystem usage in hot paths
- unifying provider and cloud credential configuration

See `FIXES_APPLIED.md` for a detailed summary of the applied changes.

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

## Environment

Copy `.env.template` to `.env` and fill in the required keys.

Important current variables:
- `JWT_SECRET`
- `AI_VIDEO_PROVIDER`
- `TTS_PROVIDER`
- `DASHSCOPE_API_KEY`
- `MINIMAX_API_KEY`
- `MINIMAX_GROUP_ID`
- `STORAGE_PROVIDER`

## Notes

Some historical docs remain in the repository for reference, but the current source of truth is:
- `README.md`
- `FIXES_APPLIED.md`
- `docs/CURRENT_ARCHITECTURE.md`
- `docs/guides/CURRENT_DEPLOYMENT_GUIDE.md`
