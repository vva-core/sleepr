# Rule: Service-to-Service Communication

Conventions for how services in this monorepo talk to each other. Review agents
evaluate changes against these rules and **cite the rule id (e.g. `COMM-2`) in
every finding it supports**.

Two transport mechanisms are sanctioned:

| Mechanism      | NestJS API                                                          | Pattern consts    | Shape                                  | Example                        |
| -------------- | ------------------------------------------------------------------- | ----------------- | -------------------------------------- | ------------------------------ |
| gRPC           | `Transport.GRPC`, `@GrpcMethod`, `ClientGrpc`                       | proto in `/proto` | sync request/response                  | auth `authenticate`, JWT guard |
| RabbitMQ event | `Transport.RMQ`, `@EventPattern`, `ClientProxy.emit()` / publishers | `*_EVENTS`        | async fire-and-forget (topic exchange) | `payment.created` fan-out      |

---

## COMM-1: Contracts are defined in their canonical place, never inlined

- gRPC calls MUST use a contract from `/proto`; the generated types live in
  `libs/common/src/types/proto`. Do not hand-roll gRPC request/response shapes.
- RabbitMQ events MUST use a named constant from `libs/common/src/consts/messages.ts`
  (`*_EVENTS` for `emit()`). No string literals at call sites.

**Violation:** raw pattern strings, ad-hoc payload interfaces, or a contract defined
outside its canonical location.

## COMM-2: Async event-driven flows use a RabbitMQ topic exchange, not direct calls

- One-to-many / fire-and-forget notifications (a thing happened, N services may care)
  MUST be published as events (`emit()` / publisher) on the topic exchange, consumed
  with `@EventPattern`.
- The publisher MUST NOT know or wait on its consumers. Do not turn an event into a
  synchronous call just to get an acknowledgement.

**Violation:** a producer awaiting a consumer's result over an event channel; an event
that is really a disguised request/response; a new exchange where the existing
`topic` exchange fits.

## COMM-3: Events are fire-and-forget; request/response must not ride `@EventPattern`

- `emit()` / `@EventPattern` returns nothing to the caller. If the caller needs a
  result, that is a request/response interaction (see COMM-4) — not an event.

**Violation:** code that emits an event and then polls/queries for the side effect it
expected the consumer to produce.

## COMM-4: Synchronous service-to-service calls use gRPC

- Synchronous request/response between services MUST use gRPC (`Transport.GRPC`,
  proto contract from `/proto`). gRPC is the only sanctioned sync transport.
- RabbitMQ is for asynchronous event-driven flows only (COMM-2, COMM-3).

**Violation:** a synchronous service-to-service call implemented over any transport
other than gRPC.
