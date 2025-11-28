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

##### Write-through cache
- Data is written into the cache and the corresponding database at the same time.
- Higher write latency

##### Write-around cache
- Data is written directly to permanent storage, bypassing the cache.
- Reduce the cache being flooded with write operations that will not subsequently be re-read.
- Read request for recently written data will create a “cache miss” and must be read from slower back-end storage and experience higher latency.

##### Write-back cache
- Data is written to cache alone and completion is immediately confirmed to the client.
- Data is written to permanent storage at a fixed interval.
- Lower write latency, this speed comes with the risk of data loss in case of a crash.

##### Read-Through Cache
- When there is a cache miss, the cache queries the database and caches the result.

##### Cache Aside (Lazy Loading)
- When there is a cache miss, the application (not cache) queries the database and caches the result.

##### TTL
- Time To Live, the cache is set to expire after a certain amount of time.

##### Refresh-Ahead
- The cache is configured to automatically refresh a key before it fully expires. If a key has a 60-second TTL, the system might try to reload it from the database at the 50-second mark if it is being accessed.
- Highly popular keys (hot keys) where you cannot afford the latency of a cache miss (e.g., the homepage of a major news site or current stock prices).

##### Stale-while-revalidate
- When a cache entry expires, the system serves the stale (old) data one last time to the user immediately, while simultaneously triggering a background process to fetch the fresh data.

#### Cache Eviction
- Least Recently Used (LRU)
- Most Recently Used (MRU)
- First In First Out (FIFO)
- Last In First Out (LIFO)
- Least Frequently Used (LFU)
- Random Replacement (RR)

-----

