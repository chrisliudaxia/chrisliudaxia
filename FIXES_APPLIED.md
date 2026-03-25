# Fixes Applied

This project was updated in two passes to better match the current codebase, deployment model, and production expectations.

## Pass 1

### 1. Align docs with actual stack
- Rewrote the root `README.md` to describe the current app correctly as **Vite + React + Express + tRPC**, not Next.js.
- Documented the current production flow instead of the outdated framework claims.

### 2. Remove obvious mock / placeholder production behavior
- Normalized local upload URLs from `/mock-upload/...` to `/api/upload/...`.
- Added a protected authenticated local file-serving route at `/api/upload/:fileKey`.
- Preserved backward compatibility for old `/mock-upload/:fileKey` URLs.
- Prevented production TTS fallback from returning `mock_audio_data`; development-only mocks now require an explicit opt-in.

### 3. Improve cookie security handling
- Enabled `trust proxy` in Express.
- Made cookie `secure`, `sameSite`, and `domain` settings environment-aware.
- Auto-derived production cookie domains from request hosts when possible.

### 4. Improve public landing page SEO
- Added proper `lang="zh-CN"`.
- Added title, description, keywords, canonical, Open Graph, and Twitter tags in `client/index.html`.
- Added a `usePageMeta()` hook and used it on the landing page.

### 5. Clean React auth state side effects
- Moved `localStorage` writes out of `useMemo()` and into `useEffect()` in `useAuth()`.

### 6. Reduce synchronous filesystem usage on hot paths
- Added shared async helpers in `server/utils/fsAsync.ts`.
- Converted local upload serving and several storage operations to async FS APIs.

## Pass 2

### 1. Archive and replace stale documentation
- Added `docs/CURRENT_ARCHITECTURE.md` describing the real production architecture.
- Added `docs/guides/CURRENT_DEPLOYMENT_GUIDE.md` describing the real deployment path.
- Added archive notices to outdated historical guides so they are no longer mistaken for the current setup.
- Reworked `.env.template` to describe the current provider and storage configuration.

### 2. Unify AI provider configuration
- Added provider-based selection with:
  - `AI_VIDEO_PROVIDER=qwen`
  - `TTS_PROVIDER=minimax`
- Kept `server/services/gemini.ts` as a compatibility layer while clarifying that the actual current providers are Qwen and MiniMax.
- Centralized development-only AI mock handling behind `ALLOW_DEV_AI_MOCKS=true`.

### 3. Unify GCP credential loading
- Added `server/services/gcpCredentials.ts`.
- Reused the same credential resolution logic across GCS-related services.
- Supported:
  - JSON file paths
  - inline JSON in `GCP_CREDENTIALS_PATH`
  - inline JSON in `GCP_CREDENTIALS`

### 4. Continue removing synchronous filesystem APIs
- Converted additional hot-path code to async FS use in:
  - `server/routers.ts`
  - `server/routers/projectRouter.ts`
  - `server/services/videoProcessor.ts`
  - `server/services/jamendo.ts`
  - `server/services/workflow/videoWorkflow.ts`

## Remaining suggestions

The core runtime code is much cleaner now, but a future third pass could still improve:
- provider-specific service naming (`gemini.ts` could eventually be renamed fully)
- further pruning of historical docs that are intentionally preserved for reference
- installing dependencies and running a full build / test pass in CI
