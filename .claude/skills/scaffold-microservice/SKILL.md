---
name: scaffold-microservice
description: Scaffold a new NestJS microservice into this monorepo — runs the Nest CLI app generator, then wires the Dockerfile, docker-compose block, k8s deployment/service, and (if gRPC) a proto file. Use when adding or creating a new service.
argument-hint: [service-name]
disable-model-invocation: true
allowed-tools: Bash(npx nest g app *), Bash(yarn *), Read, Edit, Write, Grep
---

# Scaffold a microservice

Scaffold a new NestJS service into this monorepo, profile-appropriately, then stop
for review. Work through the steps in order. Reference detail lives in
[reference/profiles.md](reference/profiles.md) and
[reference/templates.md](reference/templates.md) — read them before generating files.

## 1. Resolve inputs

- Service name: from `$ARGUMENTS`. Must be lowercase, kebab/single word (matches
  `apps/<name>`). If missing, ask.
- **Profile**: ask the user to pick one of `http`, `http+grpc`, `rmq-consumer`,
  `grpc-only` (see profiles.md for what each emits).
- **needsDatabase** (`yes`/`no`): does it use Postgres via Prisma? Controls
  `DATABASE_URL`, `depends_on: postgres`, and the `prisma migrate deploy` command prefix.

## 2. Pick the HTTP port (auto-detect)

Only for profiles that expose HTTP (`http`, `http+grpc`). Scan
`docker-compose.yaml` for ports already mapped and choose the next free one above
the existing service range (services today use 3000–3002).

```!
max=$(grep -oE "'3[0-9]+:" docker-compose.yaml | tr -d "':" | sort -n | tail -1)
echo $(( ${max:-3002} + 1 ))
```

Show the chosen port to the user before writing anything.

## 3. Generate the Nest app

```bash
npx nest g app <name>
```

Then verify `nest-cli.json` gained a `projects.<name>` entry (the CLI adds it; do
not hand-edit unless missing).

## 4. Generate profile-conditional artifacts

Read each template from [reference/templates.md](reference/templates.md) and
substitute the name/port. Generate ONLY what the profile in profiles.md calls for:

- `apps/<name>/Dockerfile`, `apps/<name>/package.json`, `apps/<name>/.env`
- `docker-compose.yaml` service block — `ports:` only for HTTP profiles (add the
  "transitional until gateway" comment); `depends_on` matched to profile;
  `prisma migrate deploy &&` prefix only if `needsDatabase`
- `k8s/sleepr/templates/<name>/deployment.yaml` (+ `service.yaml` for HTTP,
  `service-grpc.yaml` for gRPC)
- `proto/<name>.proto` — only for `http+grpc` / `grpc-only`
- `main.ts` — replace the generated stub with the profile's bootstrap (profiles.md);
  reuse `setupRmqTopology` + `@app/common` consts for RMQ.

Run prettier conventions (`.prettierrc`) on generated TS/JSON.

## 5. Checkpoint — stop for review

Report:

- the chosen port (if any)
- every file created/modified, grouped by artifact
- any follow-ups the user must do manually (e.g. add a `<NAME>_QUEUE` const,
  fill in proto messages, add Prisma models)

Do not consider the task done until the user has reviewed this list.
