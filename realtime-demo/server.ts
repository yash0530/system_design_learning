import { serve } from "bun";

/*
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 *      EDUCATIONAL DEMO: Long Polling vs WebSockets vs Server-Sent Events       
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * This server demonstrates three different real-time communication patterns.
 * Run with: bun run server.ts
 * Open: http://localhost:3000
 */

const PORT = 3000;

// Shared state: a simple message counter to simulate real-time updates
let messageCounter = 0;

// Store connected SSE clients
const sseClients: Set<ReadableStreamDefaultController> = new Set();

// Store connected WebSocket clients
const wsClients: Set<WebSocket> = new Set();

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * PATTERN 1: LONG POLLING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * HOW IT WORKS:
 * 1. Client sends HTTP request
 * 2. Server HOLDS the connection open (doesn't respond immediately)
 * 3. When new data is available, server responds
 * 4. Client immediately sends another request (poll again)
 *
 * PROS:
 * - Works everywhere (just HTTP!)
 * - Simple to implement
 * - Firewall-friendly
 *
 * CONS:
 * - High latency (must wait for response + new request)
 * - Server holds many connections
 * - Not truly real-time
 *
 * USE CASES:
 * - Email notifications
 * - Simple dashboards with infrequent updates
 * - Legacy systems that can't use WebSockets
 */
async function handleLongPolling(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const lastId = parseInt(url.searchParams.get("lastId") || "0");

    // Simulate waiting for new data (2-4 seconds)
    // In real apps, you'd wait for actual data changes
    const waitTime = 2000 + Math.random() * 2000;

    await new Promise((resolve) => setTimeout(resolve, waitTime));

    messageCounter++;
    const message = {
        id: messageCounter,
        type: "long-polling",
        content: `Long Polling Update #${messageCounter}`,
        timestamp: new Date().toISOString(),
        explanation: "Server held connection, then responded with new data",
    };

    return new Response(JSON.stringify(message), {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    });
}

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * PATTERN 2: SERVER-SENT EVENTS (SSE)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * HOW IT WORKS:
 * 1. Client opens a single HTTP connection using EventSource API
 * 2. Server keeps connection open indefinitely
 * 3. Server pushes data whenever available (one-way: server → client)
 * 4. Uses special text/event-stream format
 *
 * PROS:
 * - Built into browsers (EventSource API)
 * - Automatic reconnection
 * - Simpler than WebSockets for one-way data
 * - HTTP-based (works through proxies)
 *
 * CONS:
 * - One-way only (server → client)
 * - Limited to text data
 * - Some browsers limit connections per domain
 *
 * USE CASES:
 * - Live news feeds
 * - Stock tickers
 * - Social media timelines
 * - Real-time notifications
 */
function handleSSE(req: Request): Response {
    let controller: ReadableStreamDefaultController;

    const stream = new ReadableStream({
        start(ctrl) {
            controller = ctrl;
            sseClients.add(controller);

            // Send initial connection message
            const welcomeEvent = `data: ${JSON.stringify({
                id: 0,
                type: "sse",
                content: "SSE Connection established!",
                timestamp: new Date().toISOString(),
                explanation: "Server will now push updates to you",
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(welcomeEvent));
        },
        cancel() {
            sseClients.delete(controller);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    });
}

// Broadcast to all SSE clients periodically
setInterval(() => {
    if (sseClients.size > 0) {
        messageCounter++;
        const event = `data: ${JSON.stringify({
            id: messageCounter,
            type: "sse",
            content: `SSE Push #${messageCounter}`,
            timestamp: new Date().toISOString(),
            explanation: "Server pushed this without client asking",
        })}\n\n`;

        const encoded = new TextEncoder().encode(event);
        sseClients.forEach((client) => {
            try {
                client.enqueue(encoded);
            } catch (e) {
                sseClients.delete(client);
            }
        });
    }
}, 3000);

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * PATTERN 3: WEBSOCKETS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * HOW IT WORKS:
 * 1. Client initiates HTTP request with "Upgrade: websocket" header
 * 2. Server accepts, connection upgrades from HTTP → WebSocket
 * 3. Full-duplex: both sides can send messages anytime
 * 4. Connection stays open until explicitly closed
 *
 * PROS:
 * - True real-time, bidirectional
 * - Lowest latency
 * - Efficient: no HTTP overhead after handshake
 * - Can send binary data
 *
 * CONS:
 * - More complex than HTTP
 * - May be blocked by some proxies/firewalls
 * - Requires explicit connection management
 * - No automatic reconnection
 *
 * USE CASES:
 * - Chat applications
 * - Online gaming
 * - Collaborative editing (Google Docs)
 * - Live trading platforms
 */

// Broadcast to all WebSocket clients periodically
setInterval(() => {
    if (wsClients.size > 0) {
        messageCounter++;
        const message = JSON.stringify({
            id: messageCounter,
            type: "websocket",
            content: `WebSocket Broadcast #${messageCounter}`,
            timestamp: new Date().toISOString(),
            explanation: "Server broadcast to all connected clients",
        });

        wsClients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}, 3000);

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * MAIN SERVER
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const server = serve({
    port: PORT,

    // Handle WebSocket upgrades
    websocket: {
        open(ws) {
            wsClients.add(ws);
            ws.send(
                JSON.stringify({
                    id: 0,
                    type: "websocket",
                    content: "WebSocket Connected!",
                    timestamp: new Date().toISOString(),
                    explanation: "Bidirectional channel established",
                })
            );
        },
        message(ws, message) {
            // Echo back with additional info
            messageCounter++;
            const response = JSON.stringify({
                id: messageCounter,
                type: "websocket",
                content: `You said: ${message}`,
                timestamp: new Date().toISOString(),
                explanation: "Server received your message and responded",
            });
            ws.send(response);

            // Also broadcast to other clients
            wsClients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(
                        JSON.stringify({
                            id: messageCounter,
                            type: "websocket",
                            content: `[Broadcast] Someone said: ${message}`,
                            timestamp: new Date().toISOString(),
                            explanation: "Message from another client",
                        })
                    );
                }
            });
        },
        close(ws) {
            wsClients.delete(ws);
        },
    },

    // Handle HTTP requests
    async fetch(req, server) {
        const url = new URL(req.url);

        // Serve static files
        if (url.pathname === "/" || url.pathname === "/index.html") {
            return new Response(Bun.file("./public/index.html"));
        }

        if (url.pathname === "/styles.css") {
            return new Response(Bun.file("./public/styles.css"));
        }

        // API endpoints for each pattern
        if (url.pathname === "/api/long-polling") {
            return handleLongPolling(req);
        }

        if (url.pathname === "/api/sse") {
            return handleSSE(req);
        }

        if (url.pathname === "/api/websocket") {
            // Upgrade to WebSocket
            const success = server.upgrade(req);
            if (success) {
                // Bun automatically handles the upgrade
                return undefined as unknown as Response;
            }
            return new Response("WebSocket upgrade failed", { status: 400 });
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
    🚀 Real-Time Communication Demo Server Running!                                 
╚══════════════════════════════════════════════════════════════════════════════╝
                                                                              
     Open in browser: http://localhost:${PORT}                                  
                                                                              
     Endpoints:                                                               
       • GET  /api/long-polling  - Long Polling demo                          
       • GET  /api/sse           - Server-Sent Events stream                  
       • WS   /api/websocket     - WebSocket connection                       
                                                                              
╚══════════════════════════════════════════════════════════════════════════════╝
`);
