# React Clean Architecture Template

Reusable React + TypeScript boilerplate for production apps with strict separation of concerns.

## Quick Start

1. Copy env file and update API URL:

```bash
cp .env.example .env
```

2. Install and run:

```bash
npm install
npm run dev
```

Default dev URL: http://localhost:5173

## Environment Configuration

Set values in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_MOCK_API=true
VITE_API_TIMEOUT_MS=30000
```

- `VITE_API_BASE_URL`: Base URL for all API requests
- `VITE_USE_MOCK_API`: `true` to use local mock services, `false` for backend API
- `VITE_API_TIMEOUT_MS`: HTTP request timeout

## Clean Architecture Layers

- `presentation`: Pages, components, layouts, hooks (no direct API calls)
- `application`: Use-cases and application services (business orchestration)
- `domain`: Models, types, interfaces (pure contracts)
- `infrastructure`: API clients, repository implementations, env/config

## Source Structure

```text
src/
  app/
    routes/
    providers/
    store/
    config/
  presentation/
    pages/
    components/
    layouts/
    hooks/
  application/
    use-cases/
    services/
  domain/
    models/
    types/
    interfaces/
  infrastructure/
    api/
    repositories/
    config/
  shared/
    utils/
    constants/
    hooks/
  assets/
```

## Implemented Core Features

- Centralized Axios client with interceptors
- API error normalization and global handling path
- Env-based configuration (`.env`)
- Repository pattern with domain contracts
- React Query global provider setup
- React Router protected route structure
- Reusable layout system (`AuthLayout`, `DashboardLayout`)
- Full User reference module across all layers

## User Module Reference

Follow this chain for every new feature:

1. Domain contract: `src/domain/interfaces/user.repository.interface.ts`
2. Infrastructure API: `src/infrastructure/api/user.api.ts`
3. Infrastructure repository: `src/infrastructure/repositories/user.repository.impl.ts`
4. Application use-cases/service: `src/application/use-cases/users/*` + `src/application/services/user.application.service.ts`
5. Presentation hook: `src/presentation/hooks/useUsersPage.ts`
6. Presentation page: `src/presentation/pages/UsersPage.tsx`

## Add New Feature (Checklist)

1. Create model/types/interfaces in `src/domain`
2. Add API + repository implementation in `src/infrastructure`
3. Add use-cases/service in `src/application`
4. Add page hook in `src/presentation/hooks`
5. Add page/component in `src/presentation/pages`
6. Register route in `src/app/routes/index.tsx`

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
```

## Developer Docs

- Template usage: [TEMPLATE_USAGE.md](./TEMPLATE_USAGE.md)
- Existing guide: [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
