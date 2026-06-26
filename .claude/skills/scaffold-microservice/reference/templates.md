# Template sources (read-and-adapt)

Do NOT hardcode large blobs. Read the existing file, then substitute the service
name (and port where relevant). This keeps the skill in sync as conventions evolve.

| Artifact                         | Read from (template)                                   | Substitute |
| :------------------------------- | :----------------------------------------------------- | :--------- |
| `apps/<name>/Dockerfile`         | `apps/reservations/Dockerfile`                         | every `reservations` → `<name>` |
| `apps/<name>/package.json`       | `apps/reservations/package.json`                       | name field |
| `apps/<name>/.env`               | `apps/<name-of-closest-profile>/.env`                  | port, queue/exchange consts, grpc url |
| `apps/<name>/tsconfig.app.json`  | created by `nest g app` (do not hand-write)            | — |
| compose block (HTTP/db)          | `docker-compose.yaml` → `reservations` service block   | name, port, command prefix |
| compose block (rmq-consumer)     | `docker-compose.yaml` → `notifications` service block  | name (NO ports) |
| k8s `deployment.yaml`            | `k8s/sleepr/templates/reservations/deployment.yaml`    | name, port, image repo path, env |
| k8s `service.yaml` (HTTP)        | `k8s/sleepr/templates/reservations/service.yaml`       | name, port |
| k8s `service-grpc.yaml` (gRPC)   | `k8s/sleepr/templates/auth/service-grpc.yaml`          | name |
| `proto/<name>.proto`            | `proto/reservation.proto`                              | package + messages (stub) |
| `main.ts`                        | per profile — see [profiles.md](profiles.md)           | module name, queue/url consts |

## Shared helpers to reuse (do not reinvent)

- `setupRmqTopology` from `@app/common/rmq` — exchange/queue/binding setup.
- Queue/exchange name consts from `@app/common/consts` (e.g. `PAYMENTS_EXCHANGE`,
  `RESERVATIONS_QUEUE`). Add a new `<NAME>_QUEUE` const here if the service
  consumes events.
- `Logger` from `nestjs-pino`, `ValidationPipe`, `cookieParser` — standard in
  HTTP bootstraps.

## nest-cli.json

`npx nest g app <name>` adds the `projects.<name>` entry automatically. Verify it
landed; the CLI is the source of truth for that file — do not hand-edit it unless
the entry is missing.

## Substitution checklist (per generated file)

1. Service name in all paths, labels, `app:` selectors, container/image names.
2. Port (HTTP profiles only) — the auto-detected free port.
3. `depends_on` target matches the profile (postgres vs rabbitmq).
4. gRPC url/env only for `http+grpc` / `grpc-only`.
5. Run prettier conventions from `.prettierrc` on generated TS/JSON.
