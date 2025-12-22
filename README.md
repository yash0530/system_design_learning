# System Design Concept Notes

## Basics

### Scalability
- Scalability is the capability of a system, process, or a network to grow and manage increased demand.
- Horizontal vs Vertical Scaling.

### Reliability
- By definition, reliability is the probability a system will fail in a given period. In simple terms, a distributed system is considered reliable if it keeps delivering its services even when one or several of its software or hardware components fail.
- Redundancy has a cost and a reliable system has to pay that to achieve such resilience for services by eliminating every single point of failure.

### Availability
- Availability is the time a system remains operational to perform its required function in a specific period. It is a simple measure of the percentage of time that a system, service, or a machine remains operational under normal conditions.
- Reliability is availability over time considering the full range of possible real-world conditions that can occur.
- If a system is reliable, it is available. However, if it is available, it is not necessarily reliable.

### Efficiency
- Two standard measures of its efficiency are the response time (or latency) that denotes the delay to obtain the first item and the throughput (or bandwidth) which denotes the number of items delivered in a given time unit.

### Serviceability & Maintainability
- Serviceability or manageability is the simplicity and speed with which a system can be repaired or maintained; if the time to fix a failed system increases, then availability will decrease.


## Load Balancing
- It helps to spread the traffic across a cluster of servers to improve responsiveness and availability of applications, websites or databases
- Users experience faster, uninterrupted service
- Even a full server failure won’t affect the end user experience as the load balancer will simply route around it to a healthy server
- Redundant Load Balancers, as they are single points of failure.

### Load Balancing Algorithms
- Health Check - Load balancers should only forward traffic to “healthy” backend servers
- Algorithms
    - Least Connection Method
    - Least Response Time Method
    - Least Bandwidth Method
    - Round Robin
    - Weighted Round Robin
    - IP Hash

## Caching
- Caches take advantage of the locality of reference principle: recently requested data is likely to be requested again.

### Application server cache
- Placing a cache directly on a request layer node enables the local storage of response data.
- The cache on one request layer node could also be located both in memory (which is very fast) and on the node’s local disk (faster than going to network storage).
- If your load balancer randomly distributes requests across the nodes, the same request will go to different nodes, thus increasing cache misses. Two choices for overcoming this hurdle are **global caches** and **distributed caches**.

### CDNs
- CDNs are a kind of cache that comes into play for sites serving large amounts of static media.
- CDN will serve content if it has it locally available. If it isn’t available, the CDN will query the back-end servers for the file, cache it locally, and serve it to the requesting user.

### Cache Invalidation
- If the data is modified in the database, it should be invalidated in the cache.

- **Write-through cache**
    - Data is written into the cache and the corresponding database at the same time.
    - Higher write latency
- **Write-around cache**
    - Data is written directly to permanent storage, bypassing the cache.
    - Reduce the cache being flooded with write operations that will not subsequently be re-read.
    - Read request for recently written data will create a “cache miss” and must be read from slower back-end storage and experience higher latency.
- **Write-back cache**
    - Data is written to cache alone and completion is immediately confirmed to the client.
    - Data is written to permanent storage at a fixed interval.
    - Lower write latency, this speed comes with the risk of data loss in case of a crash.
- **Read-Through Cache**
    - When there is a cache miss, the cache queries the database and caches the result.
- **Cache Aside (Lazy Loading)**
    - When there is a cache miss, the application (not cache) queries the database and caches the result.
- **TTL**
    - Time To Live, the cache is set to expire after a certain amount of time.
- **Refresh-Ahead**
    - The cache is configured to automatically refresh a key before it fully expires. If a key has a 60-second TTL, the system might try to reload it from the database at the 50-second mark if it is being accessed.
    - Highly popular keys (hot keys) where you cannot afford the latency of a cache miss (e.g., the homepage of a major news site or current stock prices).
- **Stale-While-Revalidate**
    - When a cache entry expires, the system serves the stale (old) data one last time to the user immediately, while simultaneously triggering a background process to fetch the fresh data.

### Cache Eviction
- Least Recently Used (LRU)
- Most Recently Used (MRU)
- First In First Out (FIFO)
- Last In First Out (LIFO)
- Least Frequently Used (LFU)
- Random Replacement (RR)

## Data Partitioning
- Data partitioning is a technique to break up a big database (DB) into many smaller parts.
- It is the process of splitting up a DB/table across multiple machines to improve the manageability, performance, availability, and load balancing of an application.

### Partitioning Methods
- **Horizontal partitioning (Data Sharding)**
    - We put different rows into different tables (machines).
    - Example: ZIP codes less than 10000 are stored in one table and ZIP codes greater than 10000 are stored in a separate table.
    - Careful about the distribution of the data, otherwise it will lead to unbalanced servers.
- **Vertical Partitioning (Column Partitioning)**
    - We put different columns into different tables (machines).
    - The main problem with this approach is that if our application experiences additional growth, then it may be necessary to further partition a feature specific DB across various servers (e.g. it would not be possible for a single server to handle all the metadata queries for 10 billion photos by 140 million users).
- **Directory Based Partitioning**
    - Create a lookup service which knows your current partitioning scheme and abstracts it away from the DB access code.

### Partitioning Criteria
- **Key or Hash-based partitioning**
    - Apply a hash function to some key attributes of the entity we are storing; that yields the partition number.
    - Example: 100 servers, hash(user_id) % 100
        - Fixes the total number of DB servers;  adding new servers means changing the hash function and data redistribution, and downtime for the service.
- **Consistent Hashing**
    - It maps both keys and servers to a virtual "ring", and a key is assigned to the first server it encounters moving clockwise around the ring.
    - Node and keys are both hashed and mapped to the ring.
    - Virtual nodes for better distribution.
    - Self balancing binary search tree for searching nodes.
- **List Partitioning**
    - For example, we can decide all users living in Iceland, Norway, Sweden, Finland, or Denmark will be stored in a partition for the Nordic countries.
    - List partitioning is a partitioning method where the data is partitioned based on a list of values.
- **Round Robin Partitioning**
    - Inefficient Querying
    - Lack of Key Awareness
- **Composite partitioning**
    - Combines multiple partitioning methods.
    - Example: First applying a list partitioning scheme to get region and then use consistent hashing.

### Problems of Data Partitioning
- Most of these constraints are due to the fact that operations across multiple tables or multiple rows in the same table will no longer run on the same server.
- **Joins and Denormalization**
    - Joins will not be performance efficient since data has to be compiled from multiple servers.
    - Denormalization is a common strategy to improve performance.
    - The service now has to deal with all the perils of denormalization such as data inconsistency.
- **Referential integrity**
    - Most of RDBMS do not support foreign keys constraints across databases on different database servers.
    - Applications that require referential integrity on partitioned databases often have to enforce it in application code.
    - Applications have to run regular SQL jobs to clean up dangling references.
- **Rebalancing**
    - Scheme like directory based partitioning makes rebalancing easier at the cost of increasing the complexity. It also creates a new single point of failure (lookup service/database).


## Indexes
- Index on a column - we store that column and a pointer to the whole row in the index.
- An index can dramatically speed up data retrieval but may itself be large due to the additional keys, which slow down data insertion & update.
### Clustered vs Secondary
- **Clustered Index**
    - Determines the physical order of data in the table.
    - Only one per table (usually on Primary Key).
    - Leaf nodes contain the actual data rows.
    - Very fast for range queries `BETWEEN` and ordering `ORDER BY`.
- **Secondary Index (Non-Clustered)**
    - Stored separately from the data; contains the key and a pointer (or PK) to the data row.
    - Can have multiple secondary indexes per table.
    - Slower than clustered because of the extra lookup step (unless it's a covering index).
- **Primary Index**
    - The index automatically created on the Primary Key. In most DBs (like MySQL InnoDB), this is the Clustered Index.

### Index Structures
- **Dense Index**
    - Has an index entry for *every* search key value in the data file.
    - Faster lookup, consumes more memory/disk space.
- **Sparse Index**
    - Has index entries for only *some* of the search values (e.g., one per block/page).
    - Requires less space, but finding a record involves finding the block and then scanning it.

### Specialized Indexes
- **Hash Index**
    - Uses a hash table. O(1) for equality lookups (`=`).
    - **Pros**: Extremely fast for exact matches.
    - **Cons**: Cannot handle range queries (`>`, `<`) or sorting.
- **Bitmap Index**
    - Uses bit arrays (0s and 1s) for columns with low cardinality (few unique values like Gender, Boolean, Status).
    - fast bitwise operations (AND, OR).
- **Reverse Index (Inverted Index)**
    - Maps content to its location (e.g., Word → List of Document IDs).
    - The backbone of search engines (Elasticsearch, Lucene).
- **Filtered Index (Partial Index)**
    - Indexes only a subset of rows (e.g., `WHERE active = true`).
    - Smaller size, faster maintenance.
- **Function-based Index**
    - Indexes the result of a function rather than the raw column value.
    - Example: Index on `UPPER(username)` ensures case-insensitive login queries are fast.
- **Spatial Index**
    - Designed for multidimensional data.
    - structures: R-Tree, Quad-Tree, Geohash.
    - Efficient for "find nearest neighbor" or "within radius" queries.

## Proxies
- A proxy server is a piece of *software or hardware* that acts as an intermediary, that can observe, modify, block, or route that traffic while pretending to be the other side (to the client it looks like “the server,” to the server it looks like “the client”).
- Proxies can reside on the client’s local server or anywhere between the client and the remote servers.

### Key Capabilities
- Can make routing decisions (which backend to hit).
- Can add/remove/transform headers and sometimes body content.
- Can cache or short‑circuit a request (serve from cache, return error, do a redirect).
- Can enforce security (auth, rate limits, IP allow/deny, TLS termination).
- The proxy can provide a stable external contract while you refactor internals (split a monolith, change URLs, migrate versions).
- The proxy is a natural place for centralized logging, metrics, tracing, and rate‑limiting, because it sees every request.
- Gradual rollouts (traffic shadowing, canary releases) by controlling routing rules in the proxy.

### Forward Proxy
- Client → Forward proxy → Internet servers.
- Example: Corporate proxies, VPNs, etc.

### Reverse Proxy
- Nginx/Envoy/HAProxy in front of your web/app servers. It hides servers from clients and becomes the “public face” of your system.

### Reverse proxy vs load balancer vs API gateway
- **Reverse proxy**
    - Terminates TLS, forwards HTTP(S) to one or more backends.
    - Handles basic routing (e.g., /images → image service, /api → API service).
- **Load balancer**
    - distribute traffic across multiple instances for availability and performance.
- **API gateway**
    - A specialized reverse proxy for APIs and microservices.
    - Authentication, rate limiting, request/response transformation, versioning, and sometimes caching at the API level.
- Often, a single product is all three: an API gateway is usually implemented as a reverse proxy with load‑balancing and extra API‑specific features.

## Redundancy and Replication

### Redundancy
- Redundancy is about having extra capacity (servers, network links, power supplies, etc.) ready so that if any one element fails, the service keeps running.
- Design concerns: health checks and failover logic, avoiding single points of failure (e.g., a single load balancer), and ensuring capacity headroom so remaining nodes can absorb load when one fails.

### Replication
- Replication means **sharing information to ensure consistency** between redundant resources, such as software or hardware components, to improve reliability, fault-tolerance, or accessibility.
- Replication is widely used in many database management systems (DBMS), usually with a master-slave relationship between the original and the copies.

### Replication Strategies
- Replication is more nuanced because it **must preserve a chosen consistency model while handling partition and failure scenarios**.
- Leader–follower (master–slave): one node accepts writes, propagates changes to followers; reads can be offloaded to followers to scale reads.
- Multi-leader: multiple leaders accept writes, often per region, with conflict resolution (timestamps, version vectors, app-specific rules).
- Sync vs Async 
    - Sync waits for replicas to acknowledge before commit → stronger consistency, higher latency, more sensitive to replica failures.
    - Async commits locally then ships updates → better latency and availability, but risks temporary divergence and data loss on leader failure.​
- Design concerns: replication lag (stale reads), write amplification and bandwidth costs, conflict handling, and disaster recovery RPO/RTO targets.

### Redundancy and replication interact
- This layering is also how systems navigate CAP-style trade-offs: for example, a globally distributed service might replicate data asynchronously between regions (favoring availability and latency) while keeping strongly consistent synchronous replication within a region.

### Recovery Life Cycle
- Failure detection: heartbeats and timeouts at both service and storage layers.
    - All non-leaders are followers; they accept log entries and heartbeats from the leader.
- Leader election: one of Raft/Bully/Ring/ZooKeeper-style approaches to pick a single new leader (DB primary, coordinator, partition owner).
    - If a follower’s election timeout expires with no heartbeat or AppendEntries RPC from the leader, it assumes the leader failed or is unreachable.
    - It increments its term, transitions to candidate, and votes for itself.​
    - The candidate sends RequestVote RPCs to all other nodes, including its current term and its last log index/term.​
    - If the candidate receives votes from a majority of nodes, it becomes the new leader for that term and immediately begins sending heartbeats (AppendEntries with no new log entries) to assert leadership.
- State catch-up: new leader ensures it has all committed writes (via replicated log or replication backlog) before serving writes.
- Client failover: load balancers or client libraries detect failed endpoints and retry against the new leader or healthy replicas.
- Simpler Clusters
    - For smaller or simpler clusters, a priority-based algorithm like Bully is sometimes enough.
    - Node P notices the leader is down. It sends an “election” message to all nodes with higher ID than itself.
    - If no higher-ID node replies, P declares itself leader and broadcasts a “coordinator” message to everyone.​
    - If any higher-ID node responds, P knows it lost; that higher node now runs its own election (asking nodes with ID higher than it), and so on.
    - Eventually the highest-ID alive node wins and broadcasts that it is the new leader.

## SQL vs NoSQL

### NoSQL
- **Key-Value Stores**
    - Data is stored in an array of key-value pairs
    - Example: Redis, Voldemort, and Dynamo
- **Document Databases**
    - Data is stored in documents (instead of rows and columns in a table) and these documents are grouped together in collections.
    - Each document can have an entirely different structure.
    - Example: MongoDB, CouchDB, and Firebase
- **Wide-Column Databases**
    - A column family is roughly like a table, but each row can have a different set of columns, and new columns can be added at any time without changing a global schema.
    - Columnar databases are best suited for analyzing large datasets, distributed workloads where you need to scale horizontally across many machines.
    - Commonly used for analytics, metrics, log aggregation, and recommendation features because they can efficiently handle billions of rows and high write throughput.
    - Example: Cassandra, HBase, Bigtable
- **Graph Databases**
    - Data is saved in graph structures with nodes (entities), properties (information about the entities), and lines (connections between the entities)
    - Both nodes and edges can have properties (key–value pairs) that store information like timestamps, weights, or labels, which makes queries about relationships very expressive and efficient.
    - Example: Neo4j, JanusGraph

### High level Differences
- Storage - Discussed above
- Schema
    - SQL: The schema can be altered later, but it involves modifying the whole database and going offline.
- Querying
- Scalability
    - SQL databases are vertically scalable. (Challenging to scale horizontally: Spanner)
    - NoSQL databases are horizontally scalable. Any cheap commodity hardware or cloud instances can host NoSQL databases.
- Reliability or ACID Compliancy (Atomicity, Consistency, Isolation, Durability)
    - SQL: ACID Compliant
    - NoSQL: Offer looser, to gain high availability, partition tolerance, and horizontal scalability.
        - Eventual consistency: all replicas converge if no new updates happen, but reads can be stale for a while.​
        - Tunable consistency: clients can choose how many replicas must acknowledge a read/write (e.g., QUORUM in Cassandra) to trade off latency vs. consistency per operation.

### Reasons for choosing SQL
- ACID compliance
- Your data is structured and unchanging + vertical scalability is okay

### Reasons for choosing NoSQL
- When all the other components of our application are fast and seamless, NoSQL databases prevent data from being the bottleneck.
- Big data is contributing to a large success for NoSQL databases.
- Making the most of cloud computing and storage, often cheaper and easier to scale.
- Rapid development. NoSQL is extremely useful for rapid development as it doesn’t need to be prepped ahead of time.
    - Making frequent updates to the data structure without a lot of downtime between versions.

## CAP Theorem
- CAP is saying: in the presence of a network partition, you must sacrifice either strict consistency or full availability; you cannot keep both at the same time in a general distributed store.​
- CAP theorem states that it is impossible for a distributed software system to simultaneously provide more than two out of three of the following guarantees.
- Consistency: All nodes see the same data at the same time.
    - Consistency is achieved by updating several nodes before allowing further reads.
- Availability: All nodes respond to reads and writes.
    - Availability is achieved by replicating the data across different servers.
- Partition Tolerance: A system that is partition-tolerant can sustain any amount of network failure that doesn’t result in a failure of the entire network.
    - Data is sufficiently replicated across combinations of nodes and networks to keep the system up through intermittent outages.

## Consistent Hashing
- It maps both keys and servers to a virtual "ring", and a key is assigned to the first server it encounters moving clockwise around the ring.
- Node and keys are both hashed and mapped to the ring.
- Virtual nodes for better distribution.
- Self balancing binary search tree for searching nodes.

## Long Polling vs WebSockets vs Server Sent Events
- Popular communication protocols between a client like a web browser and a web server.

### AJAX 
* The client periodically polls the server for new data using standard HTTP requests.

### Long Polling
* The browser sends an HTTP request and the server holds it open until it has new data (or times out), then responds and closes it. The browser then immediately sends another request. So it’s still “request/response,” just with very slow responses.
* Complexity: Simple to build; hard to scale well

### WebSockets
* WebSocket provides Full duplex communication channels over a single TCP connection, client establishes a WebSocket connection through a process known as the WebSocket handshake.
    * Browser and server upgrade an HTTP connection to the WebSocket protocol.
* The server and client can exchange data in both directions at any time, with lower overheads, facilitating real-time data transfer.
* Standardized way for the server to send content to the browser without being asked by the client - back and forth while keeping the connection open.
* Best for: Chats, games, collaborative apps
* Complexity: More complex infra/protocol handling

### Server Sent Events (SSEs)
* Browser opens a special HTTP connection (using EventSource) that the server keeps open and continuously streams text events down to the browser. Only the server can push data; the browser cannot send messages back on that same channel.
* Live feeds, notifications, dashboards
* Complexity: Moderate; simpler than WebSockets
