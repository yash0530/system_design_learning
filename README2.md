# Comprehensive System Design Guide

An in-depth guide to system design concepts, improving upon basic definitions with architectural patterns, trade-offs, and practical implementations.

---

## 1. Core Principles

### Scalability
The ability of a system to handle growing amounts of work by adding resources.
- **Vertical Scaling (Scaling Up)**: Adding more power (CPU, RAM) to an existing machine.
    - *Pros*: Simple, no code changes.
    - *Cons*: Hardware limits, single point of failure (SPOF), expensive at high end.
- **Horizontal Scaling (Scaling Out)**: Adding more machines to a pool of resources.
    - *Pros*: Limitless theoretical scale, redundancy.
    - *Cons*: Complexity (data consistency, distributed transactions).

### Reliability
The probability a system performs its required function correctly for a specified period of time.
- **Resiliency**: The ability to recover from failures.
- **Redundancy**: Eliminating single points of failure by having backups.

### Availability
The proportion of time a system is functional and accessible.
- Calculated as: `Uptime / (Uptime + Downtime)`
- **"Nines" of Availability**:
    - 99% (2 nines): ~3.65 days downtime/year
    - 99.99% (4 nines): ~52 mins downtime/year
    - 99.999% (5 nines): ~5 mins downtime/year

### Efficiency
- **Latency**: Time taken to process a single request.
- **Throughput**: Number of requests processed per unit of time.
- *Goal*: High throughput and low latency.

---

## 2. Theorems & Trade-offs

### CAP Theorem
In a distributed data store, you can only guarantee two of the three:
1.  **Consistency (C)**: Every read receives the most recent write or an error.
2.  **Availability (A)**: Every request receives a (non-error) response, without the guarantee that it contains the most recent write.
3.  **Partition Tolerance (P)**: The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.

*Reality*: In distributed systems, **P** is unavoidable. You choose between **CP** (consistency over availability during partitions) or **AP** (availability over consistency).

### PACELC Theorem
An extension of CAP.
- If there is a **P**artition (P), how does the system trade off **A**vailability and **C**onsistency (A vs C)?
- **E**lse (E) (no partition), how does the system trade off **L**atency and **C**onsistency (L vs C)?
- *Example*: DynamoDB offers tunable consistency. You can choose stronger consistency (higher latency) or eventual consistency (lower latency).

---

## 3. Networking & Communication

### Protocols
- **HTTP/HTTPS**: Stateless, text-based (HTTP/1.1) or binary (HTTP/2, HTTP/3). Standard for web.
- **TCP**: Reliable, ordered delivery. 3-way handshake.
- **UDP**: Unreliable, unordered, faster. Used for streaming, gaming.

### API Styles
- **REST**: Resource-based, stateless, standard HTTP verbs. caching friendly.
- **GraphQL**: Client specifies exactly what data it needs. Solves over-fetching/under-fetching.
- **gRPC**: Built on HTTP/2, uses Protocol Buffers (binary). High performance, strongly typed, great for internal microservices.

### Server-Client Communication
- **Short Polling**: Client requests data frequently. Wasteful.
- **Long Polling**: Server holds request open until data is available. Better than short polling but distinct connections.
- **WebSockets**: Full-duplex, persistent connection over TCP. Best for chat, real-time gaming.
- **Server-Sent Events (SSE)**: Unidirectional (Server -> Client) over HTTP. Good for news feeds, stock tickers.

---

## 4. Load Balancing & Proxies

### Load Balancer (LB)
Distributes incoming traffic across multiple servers.
- **Layer 4 (Transport)**: Routes based on logic like IP + Port (TCP/UDP level). Very fast.
- **Layer 7 (Application)**: Routes based on content (URL path, headers, cookies). Smarter but more CPU intensive.

**Algorithms**:
- **Round Robin**: Sequential.
- **Weighted Round Robin**: Sequential with capacity awareness.
- **Least Connections**: Sends to server with fewest active connections.
- **Consistent Hashing**: Use for caching LBs to minimize key redistribution.

### Proxies
- **Forward Proxy**: Sits between client and internet. Acts on behalf of client (e.g., VPN, bypassing firewalls).
- **Reverse Proxy**: Sits between internet and backend servers. Acts on behalf of server.
    - Uses: SSL Termination, Load Balancing, Caching, Compression, Security.

---

## 5. Database Layer

### SQL (Relational) vs NoSQL (Non-Relational)

| Feature | SQL (e.g., PostgreSQL, MySQL) | NoSQL (e.g., MongoDB, Cassandra, Redis) |
| :--- | :--- | :--- |
| **Schema** | Rigid, structured | Flexible, schemaless |
| **Scaling** | Vertical (mostly) | Horizontal (native) |
| **Transactions** | ACID compliant | Typically BASE (often per-document ACID) |
| **Use Case** | Complex queries, financial data | High throughput, unstructured data, analytics |

### ACID vs BASE
- **ACID** (Standard for SQL):
    - **A**tomicity: All or nothing.
    - **C**onsistency: DB moves from one valid state to another.
    - **I**solation: Concurrent transactions don't interfere.
    - **D**urability: Committed data is saved permanently.
- **BASE** (Standard for NoSQL):
    - **B**asically **A**vailable: System guarantees availability.
    - **S**oft state: State may change over time (even without input).
    - **E**ventual consistency: System will become consistent over time.

### Database Indexing
Speed up reads at the cost of slower writes and storage space.
- **B-Tree**: Standard for relational DBs. Good for range queries and equality.
- **LSM Tree (Log-Structured Merge-Tree)**: Optimized for heavy write workloads (used in Cassandra, Kafka).
- **Bloom Filters**: Probabilistic data structure to quickly test if an element is *definitely not* in a set. Used to avoid expensive disk lookups for non-existent keys.

### Partitioning / Sharding
Splitting data across machines.
- **Horizontal**: Rows distributed across nodes.
    - *Key-based*: `hash(id) % N` (Hard to rebalance).
    - *Consistent Hashing*: Maps keys and nodes to a ring. Minimizes data movement when nodes add/leave.
    - *Directory-based*: Lookup service determines location.
- **Vertical**: Columns distributed (e.g., storing images in blob storage, metadata in DB).

---

## 6. Caching
Temporary storage for frequently accessed data.
- **Locations**: Browser, CDN, Load Balancer, Application (local), Database (Internal).

### Strategies
1.  **Cache-Aside (Lazy Loading)**: App checks cache. If miss, app fetches from DB and updates cache.
    - *Pros*: Only requests data. Resilience (if cache fails, DB takes load).
    - *Cons*: Stale data gap. Initial latency on miss.
2.  **Write-Through**: App writes to cache; cache writes to DB synchronously.
    - *Pros*: Data consistency, cache always matches DB.
    - *Cons*: Higher write latency.
3.  **Write-Back (Write-Behind)**: App writes to cache; cache asynchronously writes to DB.
    - *Pros*: Fast writes.
    - *Cons*: Data loss risk if cache crashes before sync.

### Eviction Policies
- **LRU (Least Recently Used)**: Discard items not used for the longest time. Most common.
- **LFU (Least Frequently Used)**: Discard items with lowest frequency count.
- **TTL (Time to Live)**: Automatic expiration.

---

## 7. Asynchronous Processing

### Message Queues
Decouple producers and consumers. Buffer bursts of traffic.
- **Point-to-Point**: One consumer gets the message (e.g., RabbitMQ work queues).
- **Pub-Sub**: Many consumers get the message (e.g., Kafka concepts, SNS).

### Benefits
- **Decoupling**: Services scale independently.
- **Backpressure**: Consumers process at their own pace.
- **Durability**: Messages persist until processed.

---

## 8. Distributed System Patterns

### Leader Election
In a cluster, one node is designated as Leader to handle writes/coordination.
- **Algorithms**: Raft (most common in modern systems like etcd, Consul), Paxos (foundational but complex), ZAB (ZooKeeper Atomic Broadcast).
- **Split Brain**: Network partition creates two partial clusters, both electing a leader. Solved by Quorum (majority vote required - need >50% of nodes to agree).

### Distributed Transactions
- **2-Phase Commit (2PC)**: Coordinator asks "Can you commit?" -> Participants say "Yes" -> Coordinator says "Commit". Blocking, single point of failure.
- **Saga Pattern**: Sequence of local transactions. If one fails, execute compensating transactions (undo steps) in reverse order. Better for microservices.

### Idempotency
- The property that an operation can be applied multiple times without changing the result.
- *Crucial for retries*.
- Implementation: Use a unique `idempotency-key` in requests. Server checks if key was already processed.

### Heartbeats & Health Checks
- **Push**: Nodes send "I'm alive" signals (heartbeats) to a central registry.
- **Pull**: Central registry pings nodes.

---

## 9. Microservices & Resilience

### Service Discovery
How services find each other's IP addresses in dynamic environments (Kubernetes).
- **Client-Side**: Client queries service registry (e.g., Eureka), then calls service.
- **Server-Side**: Client calls LB, LB queries registry and forwards.

### Rate Limiting
Protecting resources from abuse.
- **Token Bucket**: Tokens added at rate `r`. Request consumes token. Allows bursts.
- **Leaky Bucket**: Request enters queue. Queue processed at constant rate. Smooths traffic.
- **Fixed Window**: Counters reset every minute. Can allow up to 2x limit at window boundaries.
- **Sliding Window Log**: Track timestamps. Accurate but expensive.
- **Sliding Window Counter**: Hybrid approximation.

### Circuit Breaker
If a service fails repeatedly, stop calling it ("open" the circuit) to prevent cascading failures and allow it to recover.
- States: **Closed** (Normal), **Open** (Fail immediately), **Half-Open** (Test if recovered).

### Bulkhead Pattern
Isolate resources into pools. If one subsystem fails (e.g., Image Processing), it doesn't exhaust connections for others (e.g., User Auth).

---

## 10. Storage Types

- **Block Storage**: Raw blocks (like a hard drive). High performance. (e.g., AWS EBS).
- **File Storage**: Hierarchical files/folders. Shared access. (e.g., AWS EFS, NAS).
- **Object Storage**: Flat structure with unique ID. Metadata heavy. Unlimited scale. Immutable objects. (e.g., AWS S3, Google Cloud Storage). Best for static assets, backups.
