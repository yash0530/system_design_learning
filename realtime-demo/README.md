# 🔄 Real-Time Communication Patterns Demo

An interactive educational demo comparing **Long Polling**, **WebSockets**, and **Server-Sent Events (SSE)** using Bun.js.

## 🚀 Quick Start

```bash
cd realtime-demo
bun run server.ts
```

Open http://localhost:3000 in your browser.

---

## 📚 Understanding the Patterns

### 📡 Long Polling

**The "Fake Push" Approach**

```
Client                              Server
  │                                    │
  │────── HTTP Request ──────────────▶│
  │                                    │ (Server waits...)
  │                                    │ (waits...)
  │                                    │ (data available!)
  │◀───── HTTP Response ──────────────│
  │                                    │
  │────── New HTTP Request ──────────▶│  ← Immediately!
  │                                    │
```

**How it works:**
1. Client sends a regular HTTP request
2. Server **holds the connection open** instead of responding immediately
3. When new data is available, server responds
4. Client immediately sends another request (the "polling" part)

**Pros:** Works everywhere (just HTTP!), simple, firewall-friendly  
**Cons:** High latency, many connections, not truly real-time

**Use cases:** Email notifications, simple dashboards, legacy systems

---

### ⚡ WebSocket

**True Bidirectional Real-Time**

```
Client                              Server
  │                                    │
  │────── HTTP Upgrade Request ──────▶│
  │◀───── HTTP 101 Switching ─────────│
  │                                    │
  │═══════ WebSocket Channel ═════════│
  │                                    │
  │──────── message ──────────────────▶│
  │◀──────── message ─────────────────│
  │──────── message ──────────────────▶│
  │◀──────── message ─────────────────│
  │                                    │
```

**How it works:**
1. Client initiates HTTP request with `Upgrade: websocket` header
2. Server accepts, connection **upgrades from HTTP to WebSocket**
3. Now **both sides can send messages anytime** (full-duplex!)
4. Connection stays open until explicitly closed

**Pros:** Lowest latency, bidirectional, efficient (no HTTP overhead)  
**Cons:** More complex, may be blocked by some proxies, no auto-reconnect

**Use cases:** Chat, gaming, collaborative editing, trading platforms

---

### 📨 Server-Sent Events (SSE)

**Simple One-Way Server Push**

```
Client                              Server
  │                                    │
  │────── EventSource Request ───────▶│
  │                                    │
  │◀──────── event ───────────────────│
  │◀──────── event ───────────────────│
  │◀──────── event ───────────────────│
  │          (keeps coming...)         │
  │                                    │
```

**How it works:**
1. Client opens connection using `EventSource` API
2. Server keeps connection open indefinitely
3. Server pushes data in `text/event-stream` format
4. Client can only receive (one-way: server → client)

**Pros:** Built into browsers, auto-reconnect, simpler than WebSockets  
**Cons:** One-way only, text data only, connection limits

**Use cases:** News feeds, stock tickers, notifications, live scores

---

## 📊 Quick Comparison

| Feature | Long Polling | WebSocket | SSE |
|---------|--------------|-----------|-----|
| Direction | Request-Response | ↔ Bidirectional | → Server to Client |
| Latency | High | **Very Low** | Low |
| Complexity | **Simple** | Complex | Simple |
| Protocol | HTTP | WS (upgraded) | HTTP |
| Auto-reconnect | No | No | **Yes** |
| Binary data | Yes | **Yes** | No |
| Browser support | All | Modern | Modern |

---

## 🗂 Project Structure

```
realtime-demo/
├── server.ts        # Bun server with all 3 patterns
├── public/
│   ├── index.html   # Interactive comparison UI
│   └── styles.css   # Modern dark theme styling
├── package.json     # Bun project config
└── README.md        # This file
```

---

## 🧪 What to Observe

1. **Open Developer Tools → Network Tab**
2. Start each pattern and observe:
   - **Long Polling:** Many separate HTTP requests
   - **WebSocket:** Single `ws://` connection, frames in real-time
   - **SSE:** Single `text/event-stream` connection with chunked responses

---

## 💡 When to Use What?

| Scenario | Best Choice | Why |
|----------|-------------|-----|
| Chat application | WebSocket | Bidirectional, low latency |
| Stock ticker | SSE | One-way, auto-reconnect |
| Email notifications | Long Polling | Simple, infrequent |
| Online game | WebSocket | Real-time, two-way |
| Live blog | SSE | Server pushes updates |
| Legacy browser support | Long Polling | Works everywhere |

---

## 🔧 Built With

- **[Bun](https://bun.sh)** - Fast JavaScript runtime with built-in WebSocket support
- **Vanilla HTML/CSS/JS** - No frameworks, pure educational code
