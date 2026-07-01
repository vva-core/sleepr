# Transport profiles

A new service belongs to exactly one transport profile. The profile decides which
artifacts get generated and how `main.ts` boots. Pick the profile from what the
service does, then generate ONLY the rows marked for it.

| Profile         | Exposes HTTP port | proto + gRPC service | k8s `service.yaml` (HTTP) | `depends_on` baseline | `main.ts` template source            |
| :-------------- | :---------------- | :------------------- | :------------------------ | :-------------------- | :----------------------------------- |
| `http`          | yes               | no                   | yes                       | (db? postgres)        | `apps/reservations/src/main.ts`      |
| `http+grpc`     | yes               | yes                  | yes (+ `service-grpc.yaml`) | (db? postgres)      | `apps/auth/src/main.ts`              |
| `rmq-consumer`  | no                | no                   | no                        | rabbitmq              | `apps/notifications/src/main.ts`     |
| `grpc-only`     | no (gRPC only)    | yes                  | no (only `service-grpc.yaml`) | (db? postgres)    | `apps/auth/src/main.ts` (drop HTTP `listen`) |

## Profile notes

### `http`
Plain REST service. Boots with `app.listen(PORT)`. Add the RMQ
`connectMicroservice` + `setupRmqTopology` block ONLY if it also consumes events
(reservations does both — copy that block when needed).

### `http+grpc`
Serves HTTP **and** a gRPC server (like `auth`). Needs:
- `proto/<name>.proto` (see [templates.md](templates.md))
- `connectMicroservice<GrpcOptions>` reading `<NAME>_GRPC_URL`
- k8s `service-grpc.yaml` (ClusterIP, port 50051) **and** `service.yaml` (HTTP)
- env: both `HTTP_PORT` and `<NAME>_GRPC_URL` (convention: `<name>-grpc:50051`)

### `rmq-consumer`
Event-driven worker (like `notifications`). NO HTTP port, NO `service.yaml`, NO
`ports:` in compose. `depends_on: rabbitmq`. Boots via `setupRmqTopology` +
`connectMicroservice<RmqOptions>` + `startAllMicroservices()` (no `listen`).
Reuse `setupRmqTopology` and the queue/exchange consts from `@app/common`.

### `grpc-only`
gRPC server with no public HTTP surface. Like `http+grpc` minus the HTTP
`listen()` and minus `service.yaml`. Keep `service-grpc.yaml`.

## The `needsDatabase` toggle (orthogonal to profile)

If the service reads/writes Postgres via Prisma, set `needsDatabase: yes`:
- compose: `depends_on: postgres (condition: service_healthy)` and prefix the
  command with `npx prisma migrate deploy && ...`
- k8s deployment: add the `DATABASE_URL` env from the `database-url` secret
- Do NOT edit `prisma/schema` — connectivity only; models are added separately.

A service can be both DB-backed and event-driven (reservations is). Combine the
postgres `depends_on` with the RMQ wiring as needed.

## Port exposure is transitional

HTTP services still get an exposed port (chosen by the user) for now, but the
gateway app is slated to become the **sole** entry point. When generating the compose
block for an HTTP service, add a short comment noting the `ports:` mapping is
temporary until the gateway fronts all traffic.
