# Stories and Voice Search Setup

This document explains how to enable Instagram-like Stories, moderation, voice search, and the multilingual NLP interpret layer in the Next.js app under `eventra-saas`.

## 1) Database migration

A new Prisma `Story` model was added. Run migrations and generate the client:

- Windows PowerShell:
  - npm install
  - Set DATABASE_URL to your SQLite/DB connection
  - npx prisma generate
  - npx prisma migrate dev -n add_story_model

The app uses SQLite by default in development.

## 2) Environment variables

Create or update `eventra-saas/.env.local` with the following keys. Only set the providers you intend to use.

- MODERATION_PROVIDER=aws|google|hive|none
- HIVE_API_KEY={{HIVE_API_KEY}}  # required if MODERATION_PROVIDER=hive
- MODERATION_BLOCK_THRESHOLD=0.85
- AWS_REGION={{AWS_REGION}}
- AWS_ACCESS_KEY_ID={{AWS_ACCESS_KEY_ID}}
- AWS_SECRET_ACCESS_KEY={{AWS_SECRET_ACCESS_KEY}}
- AWS_REKOG_MIN_CONF=80
- GOOGLE_VISION_API_KEY={{GOOGLE_VISION_API_KEY}}
- SPEECH_PROVIDER=google|azure|whisper|none
- GOOGLE_SPEECH_API_KEY={{GOOGLE_SPEECH_API_KEY}}
- AZURE_SPEECH_KEY={{AZURE_SPEECH_KEY}}
- AZURE_SPEECH_REGION={{AZURE_SPEECH_REGION}}
- OPENAI_API_KEY={{OPENAI_API_KEY}}         # required if SPEECH_PROVIDER=whisper
- APP_ORIGIN=https://your-domain.tld        # used to build absolute URLs for moderation providers

Auth and DB variables (existing):
- DATABASE_URL=sqlite:./prisma/dev.db
- NEXTAUTH_SECRET={{NEXTAUTH_SECRET}}
- NEXTAUTH_URL=http://localhost:3000

## 3) Content Moderation

The upload endpoint for stories is at:
- POST /api/stories/upload (multipart/form-data)
  - file: image/jpeg, png, gif, webp OR video/mp4, webm, ogg, mov
  - venueId (optional)
  - caption (optional)
  - language (optional): en|ar|ku

Moderation providers:
- hive: Uses Hive Moderation HTTP API (skeleton included). Provide HIVE_API_KEY.
- aws / google: Placeholders are provided. Integrate the official SDKs if needed.
- none: Moderation disabled, all content approved.

Approved stories expire automatically 24 hours after upload (expiresAt); listing only returns approved, non-expired stories.

Files are stored under `public/uploads/stories` during development.

## 4) Stories UI

- Stories strip renders beneath the hero carousel on the homepage (`page.tsx`).
- Clicking a story opens a modal player:
  - Videos autoplay muted with an Unmute button, images auto-advance after ~5s.

## 5) Voice Search and NLP Interpret

- A voice-enabled search bar is placed above the categories section.
- The mic button records audio (MediaRecorder) and posts to `/api/speech/recognize`.
- Provider selection via SPEECH_PROVIDER:
  - whisper: posts to OpenAI Whisper API (requires OPENAI_API_KEY)
  - google/azure: placeholders provided (integrate SDKs/REST)

Dialect hints:
- Arabic (Iraqi): ar-IQ
- Kurdish (Sorani): ckb-IQ
- English: en

NLP interpret endpoint:
- POST /api/search/interpret { query, lang }
- Returns: { intent, entities, filters, suggestions, confidence }
- Current implementation is heuristic and multilingual; swap with spaCy/XLM-R/mBERT as needed.

## 6) Dynamic UI updates

- Client filters events using:
  - text query
  - selected category/city
  - NLP filters (e.g., city from the transcript)
- When speech recognition is unclear, suggestions are displayed in the user’s language.

## 7) Notes and production considerations

- Add real moderation and STT providers for production; current AWS/Google code is stubbed to avoid failing without credentials.
- For video thumbnails, consider generating and storing `thumbnailUrl` on upload (e.g., ffmpeg in a background job).
- For better NLP, deploy a service that runs spaCy pipelines or a transformer model (XLM-R/mBERT) with proper tokenizers for Sorani and Iraqi Arabic.
- Limit upload sizes and enforce CDN storage for production.

## 8) Testing quickstart

- Start the app (from eventra-saas):
  - npm run dev
- Create a user and sign in.
- Upload a story with curl:
  - $form = New-Object System.Net.Http.MultipartFormDataContent
  - # Use a simple PowerShell script or a GUI page you create to test uploads
- Press the mic and speak a test query:
  - English: "Plan a trip to the old bazaar tomorrow at 5 PM"
  - Arabic (Iraqi): "شوكت يبدى مهرجان الموسيقى؟"
  - Kurdish (Sorani): "کاتێ فستیڤاڵ دەست پێدەکات؟"
