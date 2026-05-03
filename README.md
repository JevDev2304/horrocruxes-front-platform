# Horrocruxes — Frontend

> Harry Potter themed AI chat platform. Chat with iconic HP characters, each powered by a multi-agent RAG system that answers in character using real book knowledge.

---

## What it does

Users register, take a personality quiz (Sorting Hat style), and are matched to a Harry Potter character. They can then chat with that character — or any other — through a conversational interface where each response cites the actual book chapters used as context.

**Core flows:**
- **Auth** — Register / confirm / login via AWS Cognito
- **Quiz** — 9-question personality test → character match with % score, house, traits, and a character quote
- **Chat** — Multi-conversation interface with any HP character; responses include cited sources from the books

---

## Architecture overview

This repo is the **frontend layer** of a three-tier system:

```
Angular SPA (this repo)
    └─► Business API  (FastAPI · RDS/PostgreSQL)
            └─► AI Lambda  (Multi-agent · RAG · NVIDIA/Gemma 4 31B)
```

The frontend communicates only with the Business API. JWT tokens from Cognito are attached to every request via an HTTP interceptor. The multi-agent + RAG layer is fully encapsulated in the Lambda.

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Angular 19 (standalone components) |
| Styling | Tailwind CSS |
| Icons | Lucide Angular |
| Auth | AWS Cognito — JWT via `@aws-sdk/client-cognito-identity-provider` |
| HTTP | Angular `HttpClient` + auth interceptor |
| Routing | Lazy-loaded feature modules with `authGuard` |

---

## Project structure

```
src/app/
├── core/
│   ├── auth/         # Cognito service, auth guard, HTTP interceptor
│   └── services/     # Character service (S3 image resolution)
├── features/
│   ├── auth/         # Login, register, confirm-signup pages
│   ├── chat/         # Chat page, sidebar, message bubbles, input
│   └── quiz/         # Quiz form, results page
└── shared/
    ├── components/   # Reusable UI (loading overlay, etc.)
    └── models/       # TypeScript interfaces (User, Chat, Quiz)
```

Feature modules are lazy-loaded. All protected routes require a valid Cognito JWT enforced by `authGuard`.

---

## Local setup

```bash
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
# Fill in your Cognito credentials in environment.ts
npm start
# → http://localhost:4200
```

**environment.ts fields:**

```ts
{
  apiUrl: 'http://localhost:8000',   // Business API base URL
  cognito: {
    region: 'us-east-1',
    userPoolId: 'YOUR_USER_POOL_ID',
    clientId: 'YOUR_CLIENT_ID',
  }
}
```

---

## Key design decisions

- **Lazy loading** on all feature routes keeps the initial bundle small.
- **Auth interceptor** automatically appends the Cognito JWT to every API request — no manual token handling in services.
- **Standalone components** (Angular 19) — no NgModules, cleaner dependency graph.
- **Responsive** — layout adapts from mobile to desktop; chat uses a collapsible sidebar pattern.
