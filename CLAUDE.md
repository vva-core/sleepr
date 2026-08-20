# sleepr

## Architecture

NestJS monorepo for a hotel reservation system. Services are organized by responsibility under `apps/`, with shared code in `libs/`:

- **gateway** — API gateway / entry point for client traffic (WIP)
- **auth** — issues and validates JWTs; exposed to other services over gRPC
- **domain services** — reservations, payments (Stripe), notifications (email), etc.
- **common lib** (`libs/common`) — shared building blocks: JWT guard & auth decorators, RabbitMQ topology helpers, logger, the base repository contract, and shared DTOs

**Communication:**

- **gRPC** for synchronous inter-service calls (e.g. token validation)
- **RabbitMQ topic exchange** for async event-driven flows (e.g. payment events fan out to subscribers)

Each service owns its own PostgreSQL database, Prisma schema and migration history. Proto definitions live in `/proto`.

## Infrastructure

- **Containerization** — Each service has a multi-stage `Dockerfile` (separate development and production targets), built from the repo root so shared libraries and the service's Prisma schema are in build context.
- **Local development** — `docker-compose` runs the full stack on the development target with source bind-mounted for hot reload, alongside Postgres, RabbitMQ, and a database admin UI. Database migrations run automatically on startup.
- **End-to-end tests** — A separate compose setup runs prebuilt production images with health checks.
- **CI/CD** — AWS CodeBuild builds service images and pushes them to Amazon ECR.
- **Cloud** — Deployed to AWS EKS via a Helm chart, fronted by an ALB Ingress that routes HTTP traffic and probes service health endpoints.

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- Plan first: for all non-trivial tasks (3+ steps or architectural decisions) write plan to .docs/todo.md with checkable items
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: record the pattern as a project memory (write a memory file + MEMORY.md pointer)
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Project memory is loaded at session start — apply relevant entries

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `.docs/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `.docs/todo.md`
6. **Capture Lessons**: Record corrections in project memory (MEMORY.md) after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimat Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
