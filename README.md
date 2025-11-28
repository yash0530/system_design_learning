## System Design Concepts

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

### Load Balancing
- It helps to spread the traffic across a cluster of servers to improve responsiveness and availability of applications, websites or databases
- Users experience faster, uninterrupted service
- Even a full server failure won’t affect the end user experience as the load balancer will simply route around it to a healthy server
- Load Balancing Algorithms
    - 1. Health Check - Load balancers should only forward traffic to “healthy” backend servers
    - 2. Algorithms
        - Least Connection Method
        - Least Response Time Method
        - Least Bandwidth Method
        - Round Robin
        - Weighted Round Robin
        - IP Hash
- Redundant Load Balancers, as they are single points of failure.

### Caching
    