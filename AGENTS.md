# CiviLens Web — Agent Operating Guidelines

## 1. Project Context
CiviLens is a community-driven environmental issue platform where citizens report environmental issues, AI analyzes and proposes solutions, communities vote on solutions, and government entities transparently act and resolve issues.

Authoritative cross-repository specification: `../CIVILENS_ENGINEERING.md`.

## 2. Repository Responsibility
`civilens-web` is the public-facing web client built with Next.js App Router, React, TypeScript, and Tailwind CSS.

This repository owns:
* Public web UI and layout
* Frontend interaction and state management
* Backend API consumption
* Accessibility and responsive design
* Frontend automated tests

The Laravel API (`civilens-api`) owns:
* Business rules and validation authority
* Role-based authorization
* Database operations and schema invariants
* AI analysis workflows
* Queue processing
* Domain state transitions

```text
Business logic belongs to Laravel.
```

Frontend checks are UX checks, not security boundaries.

## 3. Development Phase & Scope Boundary

```text
Current Phase:
PHASE 0 — FOUNDATION
```

```text
Do not implement future-phase features unless explicitly requested.
```

Phases roadmap:
* Phase 0 — Foundation (Active)
* Phase 1 — Auth & Identity
* Phase 2 — Reporting
* Phase 3 — AI Analysis
* Phase 4 — Community
* Phase 5 — Government
* Phase 6 — Transparency
* Phase 7 — Notifications
* Phase 8 — Admin & Moderation
* Phase 9 — Public Web Experience
* Phase 10 — QA & Hardening
* Phase 11 — Production

## 4. AI Agent Rules

Agents must:
* Inspect existing code before modifying it.
* Make minimal, scoped changes.
* Preserve existing contracts.
* Add tests for new behavior.
* Run verification (lint, typecheck, tests, build) before reporting completion.
* Never claim tests passed without actually running them.

Agents must not:
* Perform unrelated refactors.
* Install unnecessary dependencies.
* Bypass TypeScript errors or use `any` workarounds.
* Disable linting rules.
* Weaken or delete tests.
* Introduce secrets, API keys, or private credentials.
* Invent backend behavior or replicate backend state machines on the client.

## 5. Definition of Done
* [ ] Requirements implemented within active phase scope
* [ ] Strict TypeScript checks pass with zero errors
* [ ] ESLint passes with zero warnings/errors
* [ ] Automated tests pass
* [ ] Production build succeeds
* [ ] No secrets committed
* [ ] Verification results accurately reported
