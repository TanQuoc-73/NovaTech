# Frontend Architecture

NovaTech frontend uses a feature-oriented structure inspired by Feature-Sliced Design.
The goal is to keep business features independent while sharing stable UI, config, and helpers.

## Directory Map

```txt
src/
  app/        Next.js App Router routes, layouts, global styles, and route-level composition
  entities/   Core business entities such as product, user, order, and category
  features/   User-facing business actions such as catalog filtering, cart, checkout, and auth
  widgets/    Larger reusable page blocks assembled from entities and features
  shared/     Cross-cutting code: config, API clients, utilities, UI primitives, and types
```

## Rules

- `src/app` composes pages and layouts. Keep reusable business logic outside this folder.
- `src/entities` owns domain types and entity UI, for example `ProductCard`.
- `src/features` owns user actions and feature state, for example cart or catalog filters.
- `src/widgets` combines smaller pieces into page sections, for example header and product grid.
- `src/shared` must stay generic and should not import from `entities`, `features`, or `widgets`.
- Prefer public barrel exports like `@/entities/product` for cross-folder imports.

## Next Steps

- Add `src/shared/api` when the NestJS API contract is ready.
- Add `src/shared/config/env.ts` for typed environment validation.
- Add `src/features/auth` and `src/features/checkout` after Supabase auth and orders are defined.
