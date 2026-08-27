# CiviLens Web (`civilens-web`)

Public-facing web client for CiviLens — the community-driven environmental issue reporting and resolution platform.

## Repository Responsibility

`civilens-web` owns the presentation, client-side interaction, accessibility, and user experience of CiviLens.

All authoritative business decisions, authorization checks, state machine transitions, and persistence belong to the backend service (`civilens-api`).

## Technology Stack

* **Framework:** Next.js (App Router)
* **Library:** React
* **Language:** TypeScript (Strict mode)
* **Styling:** Tailwind CSS
* **Testing:** Vitest + React Testing Library

## Prerequisites

* Node.js >= 20.x
* npm >= 10.x

## Environment Setup

1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Configure backend API URL:
   * **Development default:** `http://localhost:8000/api/cv/v1`
   * **Production target:** `https://api.razzan.site/cv/v1`

## Development

Start local development server:

```bash
npm run dev
```

Application URL: `http://localhost:3000`

## Quality & Testing

Run linting:

```bash
npm run lint
```

Run TypeScript type check:

```bash
npm run typecheck
```

Run test suite:

```bash
npm run test
```

## Production Build

Generate production build:

```bash
npm run build
```

Start production server locally:

```bash
npm run start
```

## Deployment

* **Target Platform:** Vercel
* **Production Domain:** `https://civilens.razzan.site`
