<!--
Sync Impact Report
Version change: none -> 1.0.0
Created initial constitution from template
Added principles: User-First React SPA; BFF-Only API Surface; Reuse Before Reinvent; Test Coverage Guarantee; Mobile + Desktop Responsiveness
Added sections: Technology and Quality Constraints; Development Workflow
Templates aligned: .specify/templates/plan-template.md ✅ aligned; .specify/templates/spec-template.md ✅ aligned; .specify/templates/tasks-template.md ✅ aligned
Follow-up TODOs: none
-->

# AnatoQuizUp Web Constitution

## Core Principles

### User-First React SPA
Every feature MUST be implemented as a maintainable React + TypeScript UI slice using the existing Vite + Tailwind stack. Components should be reusable, accessible, and aligned with the project’s feature-sliced directory structure.

### BFF-Only API Surface
The frontend MUST consume only the authorized BFF endpoints described by `VITE_API_URL`; it MUST NOT call Usuario-Service, Quiz-Service, or backend subservices directly. Reuse existing BFF integrations before adding new API contracts.

### Reuse Before Reinvent
Prefer existing `shared/ui`, `widgets`, `features`, and API service layers over new implementations. When new components or data flows are required, build them as isolated, testable modules and mock only when external BFF behavior is unavailable.

### Test Coverage Guarantee
Every new feature MUST include unit tests and coverage for new code that is at least 80%. Tests for new components, hooks, services, and pages must accompany implementation and validate behavior across expected and edge-case states.

### Mobile + Desktop Responsiveness
All new UI, pages, and interactions MUST support mobile and desktop screen sizes. Layouts should adapt responsively using Tailwind utilities, and components MUST preserve usability, touch targets, and readable typography.

## Technology and Quality Constraints

- Use React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 7, Axios, Zustand, Jest, and Testing Library.
- Do not install new dependencies without explicit authorization.
- Reuse existing BFF endpoints and page patterns. New endpoints are allowed only when existing services cannot meet the feature requirements.
- `VITE_USE_MOCKS=true` is allowed only for local development of unsupported BFF flows; production work must target the authorized BFF URL.
- Keep implementation focused, avoid unnecessary abstractions, and document complexity when a nontrivial pattern is introduced.

## Development Workflow

- Branch names follow Git Flow: `feature/<id>-descricao`.
- Commits use Conventional Commits and reference the feature or issue when possible.
- Every feature MUST include unit tests and pass `npm run test` or `npm run test:ci` before merge.
- PR review MUST verify compliance with the constitution’s core principles, especially reuse, BFF-only API access, test coverage, and responsiveness.
- Use `shared/ui`, `widgets`, and existing feature modules before creating new cross-cutting components.
- Complexity must be justified in code comments or PR descriptions when introducing new architectural patterns.

## Governance

This constitution defines the frontend development rules for the AnatoQuizUp Web repository. It supersedes informal preferences and acts as the active reference for feature planning, implementation, and review.

- Amendments require an explicit update to this file and a rationale in the PR description.
- Versioning follows semantic rules:
  - MAJOR when governance or principle definitions change in a breaking way.
  - MINOR when a new principle or substantive rule is added.
  - PATCH for wording, clarification, or non-semantic refinements.
- Each PR should explicitly state how the change satisfies the constitution principles.
- Compliance review is required for any new feature touching UI, API integration, or shared frontend infrastructure.

**Version**: 1.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-05-28
