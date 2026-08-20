# Rule: Project Architecture

General architecture conventions for this NestJS monorepo. Review agents evaluate
changes against these rules and **cite the rule id (e.g. `ARCH-3`) in every finding
it supports**.

**Scope.** This rule governs **static structure** — how code is organized, where
boundaries sit, and who may depend on whom.

> **Related rule → [`service-communication.md`](./service-communication.md) (`COMM-*`)**
> covers **runtime interaction between services**: which transport carries a call,
> where the contract lives, and event semantics. This file does **not** restate
> transport rules — it defers to `COMM-*` wherever services talk at runtime.

For the descriptive tour of what each piece _is_, see `CLAUDE.md` → Architecture.

Layers of the system:

| Layer          | Location         | What lives here                                                                   |
| -------------- | ---------------- | --------------------------------------------------------------------------------- |
| Services       | `apps/*`         | Deployable NestJS processes: gateway, auth, reservations, payments, notifications |
| Shared library | `libs/common`    | Modules + primitives imported via the `@app/common` alias                         |
| Contracts      | `proto/`         | gRPC service/message contracts (governed by `COMM-*`)                             |
| Data           | `apps/*/prisma/` | Each service's own schema + migration history; client generated beside its owner  |

---

## ARCH-1: Services depend on each other only through the `@app/common` seam

- Deployable services live under `apps/`; shared building blocks live under
  `libs/common` and are consumed through the `@app/common` path alias — the barrel
  (`@app/common`) for public modules, documented subpaths for the rest
  (`@app/common/consts`, `/types/proto`, `/publishers`, `/rmq`, `/guards`).
- A service MUST NOT import another service's `apps/*` code. Anything two services
  both need moves into `libs/common`.
- This covers _static_ dependencies only. When one service needs another at
  _runtime_, that interaction goes over a sanctioned transport — see `COMM-*`.

**Violation:** an `apps/<a>` file importing from `apps/<b>`; a deep relative import
into the library (`../../../libs/...`) instead of `@app/common`; a shared helper
copy-pasted into a service instead of living in `libs/common`.

## ARCH-2: The gateway is the single entry point for client traffic

- External / client-facing HTTP enters the system through the **gateway** only. The
  gateway authenticates the request and forwards to downstream services over internal
  transports (gRPC / RMQ, per `COMM-*`).
- Downstream services (auth, reservations, payments, notifications) expose only
  internal transports plus a `/health` endpoint — not their own public client-facing
  HTTP API. New client-facing endpoints are added to the gateway, not bolted onto a
  domain service.
- _Migration note:_ reservations still serves some HTTP directly; that is legacy and
  is being consolidated behind the gateway. Flag **new** direct client exposure, not
  the pre-existing surface.

**Violation:** a domain service adding a public client HTTP route; a client calling a
domain service directly instead of through the gateway; auth/business endpoints added
outside the gateway.

## ARCH-3: Each service is a self-contained process that owns its config

- Every service owns its `main.ts` bootstrap, its `ConfigModule.forRoot` (env files +
  a Joi validation schema), and selects its own transport surface at bootstrap:
  `app.listen` for HTTP, `connectMicroservice` + `startAllMicroservices` for a hybrid
  app, or `createMicroservice` for a pure broker consumer.
- Config is per-service and validated at startup. A service never reads another
  service's env or reaches into another service's bootstrap.

**Violation:** a new service without a Joi validation schema on its config; config or
env shared/mutated across services; environment access outside the owning service's
`ConfigModule`.

## ARCH-4: Layered data access over a database the service owns

- The project uses Prisma as its ORM.
- **Database-per-service is the target state.** A service that owns its data owns the
  whole vertical: its `apps/<svc>/prisma/schema.prisma`, its own migration history, its
  own generated client (`apps/<svc>/src/prisma/generated`), its own `DATABASE_URL`, and
  its own Prisma module + service under `apps/<svc>/src/database/`. Every service that owns
  data is extracted; there is no root schema and no shared Prisma client.
- **No shared databases.** From now on, every service has its own database. A common
  database is not created or enforced at the `libs/common` level, nor inside any service.
- **A model belongs to exactly one schema file.** Cross-service relations are not
  merely discouraged — across separate databases a foreign key is _unexpressible_.
  Where one used to be, the reference survives as a plain scalar id, and existence is
  checked over gRPC (`COMM-4`), not by the database.
- Every service that talks to a DB implements the Repository pattern, and every
  repository implements `IBaseRepository` from `libs/common` — this contract stays
  shared even though the clients do not.
- A Prisma service is injected **only** into repositories — controllers and services go
  through their repository, never Prisma directly (layering: Controller → Service →
  Repository → Prisma).

**Violation:** a Prisma service injected into a controller or service; a service running
Prisma/SQL queries instead of going through its repository; a repository that does not
implement `IBaseRepository`; a service reading another service's schema, client or
`DATABASE_URL`; a relation declared across two services' models.

## ARCH-5: Cross-cutting concerns come from `libs/common`, not reimplemented

- Logging (`LoggerModule` / pino), health (`HealthModule` + `HealthController`), the
  gRPC-backed `JwtAuthGuard`, param decorators (`CurrentUser`, `Roles`), and the
  RabbitMQ `BasePublisher` are provided once in `libs/common` and imported by services.
- A service MUST reuse these shared primitives rather than reimplementing them.
- Database access is deliberately **not** in this list. It is owned per service
  (`ARCH-4`): each service writes its own Prisma module and service. That is the pattern,
  not a duplication — a shared `DatabaseModule` would recouple every service to one client.
  `IBaseRepository` is the one database concern that stays shared, because it is a contract
  and not a connection.

**Violation:** a service defining its own logger, `/health` endpoint, or auth guard; a
second publisher base class; bespoke copies of shared decorators.
