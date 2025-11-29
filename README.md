## System Design Concepts

-----

### Basics

#### Scalability
- Scalability is the capability of a system, process, or a network to grow and manage increased demand.
- Horizontal vs Vertical Scaling.

#### Reliability
- By definition, reliability is the probability a system will fail in a given period. In simple terms, a distributed system is considered reliable if it keeps delivering its services even when one or several of its software or hardware components fail.
- Redundancy has a cost and a reliable system has to pay that to achieve such resilience for services by eliminating every single point of failure.

#### Availability
- Availability is the time a system remains operational to perform its required function in a specific period. It is a simple measure of the percentage of time that a system, service, or a machine remains operational under normal conditions.
- Reliability is availability over time considering the full range of possible real-world conditions that can occur.
- If a system is reliable, it is available. However, if it is available, it is not necessarily reliable.

#### Efficiency
- Two standard measures of its efficiency are the response time (or latency) that denotes the delay to obtain the first item and the throughput (or bandwidth) which denotes the number of items delivered in a given time unit.

#### Serviceability & Maintainability
- Serviceability or manageability is the simplicity and speed with which a system can be repaired or maintained; if the time to fix a failed system increases, then availability will decrease.

-----

### Load Balancing
- It helps to spread the traffic across a cluster of servers to improve responsiveness and availability of applications, websites or databases
- Users experience faster, uninterrupted service
- Even a full server failure won’t affect the end user experience as the load balancer will simply route around it to a healthy server
- Redundant Load Balancers, as they are single points of failure.

#### Load Balancing Algorithms
- Health Check - Load balancers should only forward traffic to “healthy” backend servers
- Algorithms
    - Least Connection Method
    - Least Response Time Method
    - Least Bandwidth Method
    - Round Robin
    - Weighted Round Robin
    - IP Hash

-----

### Caching
- Caches take advantage of the locality of reference principle: recently requested data is likely to be requested again.

#### Application server cache
- Placing a cache directly on a request layer node enables the local storage of response data.
- The cache on one request layer node could also be located both in memory (which is very fast) and on the node’s local disk (faster than going to network storage).
- If your load balancer randomly distributes requests across the nodes, the same request will go to different nodes, thus increasing cache misses. Two choices for overcoming this hurdle are **global caches** and **distributed caches**.

#### CDNs
- CDNs are a kind of cache that comes into play for sites serving large amounts of static media.
- CDN will serve content if it has it locally available. If it isn’t available, the CDN will query the back-end servers for the file, cache it locally, and serve it to the requesting user.

#### Cache Invalidation
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
- **Stale-while-revalidate**
    - When a cache entry expires, the system serves the stale (old) data one last time to the user immediately, while simultaneously triggering a background process to fetch the fresh data.

#### Cache Eviction
- Least Recently Used (LRU)
- Most Recently Used (MRU)
- First In First Out (FIFO)
- Last In First Out (LIFO)
- Least Frequently Used (LFU)
- Random Replacement (RR)

-----

### Data Partitioning
- Data partitioning is a technique to break up a big database (DB) into many smaller parts.
- It is the process of splitting up a DB/table across multiple machines to improve the manageability, performance, availability, and load balancing of an application.

#### Partitioning Methods
- **Horizontal partitioning (Data Sharding)**
    - We put different rows into different tables (machines).
    - Example: ZIP codes less than 10000 are stored in one table and ZIP codes greater than 10000 are stored in a separate table.
    - Careful about the distribution of the data, otherwise it will lead to unbalanced servers.
- **Vertical Partitioning (Column Partitioning)**
    - We put different columns into different tables (machines).
    - The main problem with this approach is that if our application experiences additional growth, then it may be necessary to further partition a feature specific DB across various servers (e.g. it would not be possible for a single server to handle all the metadata queries for 10 billion photos by 140 million users).
- **Directory Based Partitioning**
    - Create a lookup service which knows your current partitioning scheme and abstracts it away from the DB access code.

#### Partitioning Criteria
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

#### Problems of Data Partitioning
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

-----

### Indexes
- Index on a column - we store that column and a pointer to the whole row in the index.
- An index can dramatically speed up data retrieval but may itself be large due to the additional keys, which slow down data insertion & update.
- Primary Index; Clustered Index; Secondary Index
- Dense Index; Sparse Index
- Bitmap Index; Reverse Index; Hash Index; Filtered Index; Function-based Index; Spatial Index


-----

### Proxies
- A proxy server is a piece of *software or hardware* that acts as an intermediary, that can observe, modify, block, or route that traffic while pretending to be the other side (to the client it looks like “the server,” to the server it looks like “the client”).
- Proxies can reside on the client’s local server or anywhere between the client and the remote servers.

#### Key Capabilities
- Can make routing decisions (which backend to hit).
- Can add/remove/transform headers and sometimes body content.
- Can cache or short‑circuit a request (serve from cache, return error, do a redirect).
- Can enforce security (auth, rate limits, IP allow/deny, TLS termination).
- The proxy can provide a stable external contract while you refactor internals (split a monolith, change URLs, migrate versions).
- The proxy is a natural place for centralized logging, metrics, tracing, and rate‑limiting, because it sees every request.
- Gradual rollouts (traffic shadowing, canary releases) by controlling routing rules in the proxy.

#### Forward Proxy
- Client → Forward proxy → Internet servers.
- Example: Corporate proxies, VPNs, etc.

#### Reverse Proxy
- Nginx/Envoy/HAProxy in front of your web/app servers. It hides servers from clients and becomes the “public face” of your system.

#### Reverse proxy vs load balancer vs API gateway
- **Reverse proxy**
    - Terminates TLS, forwards HTTP(S) to one or more backends.
    - Handles basic routing (e.g., /images → image service, /api → API service).
- **Load balancer**
    - distribute traffic across multiple instances for availability and performance.
- **API gateway**
    - A specialized reverse proxy for APIs and microservices.
    - Authentication, rate limiting, request/response transformation, versioning, and sometimes caching at the API level.
- Often, a single product is all three: an API gateway is usually implemented as a reverse proxy with load‑balancing and extra API‑specific features.

-----

### Redundancy and Replication
- Redundancy is about having extra capacity (servers, network links, power supplies, etc.) ready so that if any one element fails, the service keeps running.
- Replication means sharing information to ensure consistency between redundant resources, such as software or hardware components, to improve reliability, fault-tolerance, or accessibility.
    - Replication is widely used in many database management systems (DBMS), usually with a master-slave relationship between the original and the copies.
- Design concerns: health checks and failover logic, avoiding single points of failure (e.g., a single load balancer), and ensuring capacity headroom so remaining nodes can absorb load when one fails.
