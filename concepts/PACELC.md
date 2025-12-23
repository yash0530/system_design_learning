The **PACELC theorem** is a framework used to classify distributed database systems. It builds upon and extends the well-known **CAP theorem**.

While the CAP theorem describes what happens when a network fails (a partition), PACELC goes a step further to describe what happens when the system is running **normally**.

It states that in a replicated distributed system:

> **If there is a Partition (P):**
> The system must trade off between **Availability (A)** and **Consistency (C)**.
> **Else (E) (i.e., when the system is running normally):**
> The system must trade off between **Latency (L)** and **Consistency (C)**.

---

### 1. The "PAC" Part (The CAP Theorem)

The first part of the acronym is essentially the CAP theorem. In a distributed system, network partitions (communication failures between nodes) are inevitable. When a partition occurs (`P`), you must make a choice:

* **Availability (A):** The system continues to accept reads and writes, even if some nodes are out of sync. You might get stale data, but the system stays "up."
* **Consistency (C):** The system blocks operations until the partition is resolved to ensure all nodes have the same data. The system might appear "down" or "slow" to ensure data accuracy.

### 2. The "ELC" Part (The Extension)

This is where PACELC adds value. The CAP theorem ignores the fact that network partitions are actually rare. Most of the time, systems are running normally.

The **"Else" (E)** clause asks: *What are you optimizing for when the network is healthy?*

* **Latency (L):** If you want the system to be extremely fast, you replicate data asynchronously. You return a response to the user immediately, before the data has propagated to all nodes. The trade-off is that for a split second, other nodes might not have the new data yet (weaker consistency).
* **Consistency (C):** If you want to ensure every node has the exact same data at all times, you must use synchronous replication. The system waits for an acknowledgment from multiple nodes before telling the user "success." This increases the response time (Latency).

---

### 3. Classifying Databases with PACELC

We can classify databases based on which side of the trade-off they prioritize during partitions (A vs C) and during normal operation (L vs C).

| Classification | Description | Examples |
| --- | --- | --- |
| **PA / EL** | **Partition:** Prioritizes Availability. **Else:** Prioritizes Latency. *Focus: Speed and uptime above all else.* | DynamoDB, Cassandra, Riak (Default configurations often favor eventual consistency for speed.) |
| **PC / EC** | **Partition:** Prioritizes Consistency. **Else:** Prioritizes Consistency. *Focus: Data integrity above all else.* | BigTable, HBase, PostgreSQL (ACID). Will block or fail operations to prevent data divergence. |
| **PA / EC** | **Partition:** Prioritizes Availability. **Else:** Prioritizes Consistency. *Focus: Up during failures, but strong data integrity when healthy.* | MongoDB (depending on config). Can be tuned to ensure consistency normally but allow stale reads during a split. |
| **PC / EL** | **Partition:** Prioritizes Consistency. **Else:** Prioritizes Latency. *Focus: Rarely used configuration.* | Theoretical / Rare. Generally, if you demand consistency during a failure, you also demand it during normal ops. |

### Why is this better than CAP?

The CAP theorem is often criticized for being too binary (Availability OR Consistency). PACELC acknowledges that **latency** is the most critical constraint in modern web applications.

For example, Amazon's shopping cart (Dynamo) was designed as a **PA/EL** system.

1. **If the network breaks (P):** It lets you keep adding items (Availability) rather than blocking you.
2. **When the network is fine (E):** It prioritizes instant updates (Low Latency) over ensuring that a barely-used backup server has the data immediately.

### Summary

* **CAP** only explains what happens during a disaster.
* **PACELC** explains the design philosophy of the system 100% of the time (both during disasters and normal operation).
