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

| Layer          | Location      | What lives here                                                                   |
| -------------- | ------------- | --------------------------------------------------------------------------------- |
| Services       | `apps/*`      | Deployable NestJS processes: gateway, auth, reservations, payments, notifications |
| Shared library | `libs/common` | Modules + primitives imported via the `@app/common` alias                         |
| Contracts      | `proto/`      | gRPC service/message contracts (governed by `COMM-*`)                             |
| Data           | `prisma/`     | Single schema + migrations; client generated into `libs/common`                   |

---

## ARCH-1: Services depend on each other only through the `@app/common` seam

- Deployable services live under `apps/`; shared building blocks live under
  `libs/common` and are consumed through the `@app/common` path alias — the barrel
  (`@app/common`) for public modules, documented subpaths for the rest
  (`@app/common/consts`, `/types/proto`, `/publishers`, `/rmq`, `/prisma/generated`).
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

## ARCH-4: Layered data access over one shared database

- The project uses one shared Database.
- The project uses Prisma as an ORM for communication with DB.
- The DB extracted into separate module Database Module in libs/common and every module that needs talk to DB just imports it.
- Every microservice that talk to the DB implements Repository pattern. Every Repository implements IBaseRepository located in libs/common.
- `PrismaService` is injected **only** into repositories — controllers and services go
  through their repository, never Prisma directly (layering: Controller → Service →
  Repository → Prisma).

**Violation:** `PrismaService` injected into a controller or service; a service running
Prisma/SQL queries instead of going through its repository; a repository that does not
implement `IBaseRepository`; a service introducing its own schema or a second datasource.

## ARCH-5: Cross-cutting concerns come from `libs/common`, not reimplemented

- Logging (`LoggerModule` / pino), health (`HealthModule` + `HealthController`), the
  gRPC-backed `JwtAuthGuard`, param decorators (`CurrentUser`, `Roles`), and the
  RabbitMQ `BasePublisher` are provided once in `libs/common` and imported by services.
- A service MUST reuse these shared primitives rather than reimplementing them.

**Violation:** a service defining its own logger, `/health` endpoint, or auth guard; a
second publisher base class; bespoke copies of shared decorators.
