# backend_mastery.roadmap

> phased path to core backend systems mastery — Node/Postgres foundation, going deep not wide

---

## PHASE 0 — Foundations You Already Have ✅
- [x] Node.js + Express
- [x] PostgreSQL
- [x] Basic auth flows (register/login, validation w/ Zod)

Don't relearn these. Move forward.

---

## PHASE 1 — HTTP & Networking, For Real
- [ ] TCP 3-way handshake, what a socket actually is
- [ ] HTTP/1.1 vs HTTP/2 vs HTTP/3 — keep-alive, multiplexing, head-of-line blocking
- [ ] TLS handshake basics (cert chain, symmetric key exchange)
- [ ] DNS resolution path (client → resolver → root → TLD → authoritative)
- [ ] Build a raw TCP server with Node's `net` module (no Express) — serve a hardcoded HTTP response manually

**Why:** every framework you use is a wrapper around this. Understanding it means you debug network issues instead of guessing.

---

## PHASE 2 — Node Internals
- [ ] Event loop phases (timers, poll, check, close callbacks)
- [ ] libuv thread pool — what actually goes async vs what blocks
- [ ] Microtask queue vs macrotask queue (Promise vs setTimeout ordering)
- [ ] `process.nextTick` vs `setImmediate`
- [ ] Streams — Readable/Writable/Transform, backpressure
- [ ] Cluster module — multi-core Node without a framework

**Exercise:** write a script that intentionally blocks the event loop, observe the effect, then fix it with worker_threads.

---

## PHASE 3 — Database Internals (Postgres)
- [ ] `EXPLAIN ANALYZE` — read query plans, spot seq scans vs index scans
- [ ] B-tree indexes — when they help, when they don't (low cardinality columns)
- [ ] Transaction isolation levels (Read Committed → Serializable) + what anomalies each prevents
- [ ] MVCC — how Postgres handles concurrent reads/writes without locking everything
- [ ] WAL (write-ahead log) — durability, crash recovery
- [ ] Connection pooling — why `pg` pool size matters, PgBouncer
- [ ] N+1 query problem — spot it, fix it (batching/joins/dataloader pattern)

**Exercise:** seed 1M rows, write a deliberately slow query, fix it with an index, prove the improvement with `EXPLAIN ANALYZE`.

---

## PHASE 4 — Caching & Queues
- [ ] Redis — data structures beyond string (hash, sorted set, list) + real use cases
- [ ] Cache invalidation strategies (TTL, write-through, cache-aside) — the actual hard problem
- [ ] Message queues — Kafka vs RabbitMQ, when you need one at all
- [ ] Idempotency — designing endpoints/consumers that survive retries safely
- [ ] Rate limiting — token bucket vs sliding window, implement both from scratch

---

## PHASE 5 — System Design (Applied, Not LeetCode)
- [ ] Horizontal scaling — stateless services, sticky sessions problem
- [ ] Load balancing algorithms (round robin, least connections, consistent hashing)
- [ ] Database replication (primary-replica) + replication lag consequences
- [ ] Sharding strategies + the rebalancing problem
- [ ] CAP theorem — not as trivia, as a design constraint you hit in practice

**Exercise:** design (on paper) a URL shortener that handles 10k writes/sec and 100k reads/sec. Justify every component.

---

## PHASE 6 — Security as Architecture
- [ ] JWT misconfig classes (alg confusion, none algorithm, weak secrets)
- [ ] SQLi — beyond string concat, ORM injection points too
- [ ] Race conditions in auth (double-spend on coupon codes, concurrent password resets)
- [ ] CSRF vs CORS — know the actual difference and what each protects against
- [ ] Secrets management — env vars are not enough at scale (Vault, KMS)

You already have TryHackMe/HackTheBox reps — map every backend concept above to an attack class.

---

## PHASE 7 — Rust for Systems Understanding
- [ ] Ownership/borrowing — why this eliminates whole bug classes
- [ ] Build a small concurrent TCP server in Rust (tokio) — compare mental model to Node's event loop
- [ ] Memory layout — stack vs heap, why this matters for performance

---

## PHASE 8 — Read Real Source
Pick ONE, go deep:
- [ ] Express internals (routing, middleware chain implementation)
- [ ] Postgres source (`src/backend/` — pick one subsystem, e.g. the planner)
- [ ] Redis source (single-threaded event loop implementation)

---

## PHASE 9 — Break Something On Purpose
- [ ] Load test your own API with `autocannon` or `k6` — find the breaking point
- [ ] Fix the bottleneck (connection pool exhaustion? no indexing? blocking I/O?)
- [ ] Repeat until 10k concurrent connections doesn't fall over

This phase is where "knows backend" becomes "kicks ass at backend." Nobody skips to this by reading — only by breaking real systems.

---

## Sequencing Rule
Don't jump phases. Each one exposes the failure mode the next phase fixes. Skipping Phase 3 (DB internals) means Phase 5 (system design) is cargo-culting terms without knowing why they matter.







# Question : Next, rebuild the HTTP/1.1 server from a blank file without looking at the previous code.

Your target is only:

TCP connection
   ↓
receive bytes
   ↓
buffer
   ↓
detect \r\n\r\n
   ↓
parse request
   ↓
send HTTP response
   ↓
keep connection alive

Once you can write that yourself and explain why each part exists, move to the request queue + /slow vs /fast head-of-line blocking experiment.