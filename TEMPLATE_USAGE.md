# Template Usage Guide

This project is a reusable React boilerplate with Clean Architecture boundaries.

## Quick Start

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```
2. Update API URL in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_USE_MOCK_API=false
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Core Rules

- Keep UI in `src/presentation`.
- Keep business orchestration in `src/application`.
- Keep contracts/models in `src/domain`.
- Keep API and repository implementations in `src/infrastructure`.
- Avoid direct API calls from components/pages.

## User Feature Reference (End-to-End)

Use the User module as the standard for all new features:

- Domain contract: `src/domain/interfaces/user.repository.interface.ts`
- Infrastructure API: `src/infrastructure/api/user.api.ts`
- Infrastructure repository: `src/infrastructure/repositories/user.repository.impl.ts`
- Application service/use-cases: `src/application/services/user.application.service.ts`
- Presentation hook: `src/presentation/hooks/useUsersPage.ts`
- Presentation page: `src/presentation/pages/UsersPage.tsx`

## Add a New Feature (Pattern)

1. Create domain model + repository interface in `src/domain`.
2. Create API client and repository implementation in `src/infrastructure`.
3. Create use-cases and application service in `src/application`.
4. Build page logic in `src/presentation/hooks`.
5. Build page/UI in `src/presentation/pages`.
6. Register route in `src/app/routes/index.tsx`.

## Configuration

- Env parsing: `src/infrastructure/config/env.config.ts`
- App config: `src/core/config/app.config.ts`
- Query client: `src/app/store/query-client.ts`
- Global providers: `src/app/providers/AppProviders.tsx`

## Error Handling

- API errors are normalized in `src/infrastructure/api/error-normalizer.ts`.
- Axios interceptors are configured in `src/infrastructure/api/http.client.ts`.

## Mock vs Real API

- Set `VITE_USE_MOCK_API=true` for frontend-only development.
- Set `VITE_USE_MOCK_API=false` to call real backend endpoints.

User repository switches mode in `src/infrastructure/repositories/user.repository.impl.ts`.
