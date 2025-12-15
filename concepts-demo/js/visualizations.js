/**
 * Interactive Visualization Utilities
 * Reusable components for system design visualizations
 */

// Animation helpers
const animate = {
    // Ease functions
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

    // Animate a value from start to end
    value: (start, end, duration, onUpdate, onComplete) => {
        const startTime = performance.now();
        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = animate.easeOutCubic(progress);
            const current = start + (end - start) * eased;
            onUpdate(current);
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else if (onComplete) {
                onComplete();
            }
        };
        requestAnimationFrame(tick);
    }
};

// Server Node Component
class ServerNode {
    constructor(container, options = {}) {
        this.container = container;
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.id = options.id || 'S1';
        this.load = 0;
        this.maxLoad = options.maxLoad || 100;
        this.active = true;

        this.element = document.createElement('div');
        this.element.className = 'server-node';
        this.element.innerHTML = `
      <span class="server-id">${this.id}</span>
      <span class="server-load">0%</span>
    `;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;

        container.appendChild(this.element);
    }

    setLoad(value) {
        this.load = Math.max(0, Math.min(value, this.maxLoad));
        const percent = Math.round((this.load / this.maxLoad) * 100);
        this.element.querySelector('.server-load').textContent = `${percent}%`;

        this.element.classList.remove('active', 'overloaded');
        if (percent > 80) {
            this.element.classList.add('overloaded');
        } else if (percent > 0) {
            this.element.classList.add('active');
        }
    }

    addLoad(amount) {
        this.setLoad(this.load + amount);
    }

    setActive(active) {
        this.active = active;
        this.element.style.opacity = active ? 1 : 0.3;
    }

    getPosition() {
        return { x: this.x + 30, y: this.y + 30 };
    }

    destroy() {
        this.element.remove();
    }
}

// Request Particle - animated dot moving through system
class RequestParticle {
    constructor(container, startX, startY, endX, endY, options = {}) {
        this.container = container;
        this.duration = options.duration || 800;
        this.color = options.color || '#6366f1';

        this.element = document.createElement('div');
        this.element.className = 'request-particle';
        this.element.style.background = this.color;
        this.element.style.boxShadow = `0 0 10px ${this.color}`;
        this.element.style.left = `${startX}px`;
        this.element.style.top = `${startY}px`;

        container.appendChild(this.element);

        // Animate
        const startTime = performance.now();
        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            const eased = animate.easeInOutCubic(progress);

            const x = startX + (endX - startX) * eased;
            const y = startY + (endY - startY) * eased;

            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                this.destroy();
                if (options.onComplete) options.onComplete();
            }
        };
        requestAnimationFrame(tick);
    }

    destroy() {
        this.element.remove();
    }
}

// Hash Ring Visualization
class HashRing {
    constructor(container, options = {}) {
        this.container = container;
        this.centerX = options.centerX || 150;
        this.centerY = options.centerY || 150;
        this.radius = options.radius || 120;
        this.nodes = new Map();
        this.keys = new Map();
        this.onNodeClick = options.onNodeClick || null;

        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div class="hash-ring" style="width: ${this.centerX * 2}px; height: ${this.centerY * 2}px;">
        <div class="ring-circle"></div>
      </div>
    `;
        this.ringElement = this.container.querySelector('.hash-ring');
    }

    addNode(id, hash) {
        const angle = (hash / 360) * 2 * Math.PI - Math.PI / 2;
        const x = this.centerX + this.radius * Math.cos(angle);
        const y = this.centerY + this.radius * Math.sin(angle);

        const node = document.createElement('div');
        node.className = 'ring-node';
        node.textContent = id;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.dataset.hash = hash;

        if (this.onNodeClick) {
            node.addEventListener('click', () => this.onNodeClick(id, hash));
        }

        this.ringElement.appendChild(node);
        this.nodes.set(id, { element: node, hash });
    }

    removeNode(id) {
        const node = this.nodes.get(id);
        if (node) {
            node.element.remove();
            this.nodes.delete(id);
        }
    }

    addKey(id, hash) {
        const angle = (hash / 360) * 2 * Math.PI - Math.PI / 2;
        const x = this.centerX + (this.radius - 25) * Math.cos(angle);
        const y = this.centerY + (this.radius - 25) * Math.sin(angle);

        const key = document.createElement('div');
        key.className = 'ring-key';
        key.textContent = id;
        key.style.left = `${x}px`;
        key.style.top = `${y}px`;

        this.ringElement.appendChild(key);
        this.keys.set(id, { element: key, hash });
    }

    findNodeForKey(keyHash) {
        const sortedNodes = Array.from(this.nodes.entries())
            .map(([id, data]) => ({ id, hash: data.hash }))
            .sort((a, b) => a.hash - b.hash);

        for (const node of sortedNodes) {
            if (node.hash >= keyHash) {
                return node.id;
            }
        }
        return sortedNodes[0]?.id || null;
    }

    clear() {
        this.nodes.forEach((_, id) => this.removeNode(id));
        this.keys.forEach((data) => data.element.remove());
        this.keys.clear();
    }
}

// Cache Visualization
class CacheVisualizer {
    constructor(container, capacity = 4) {
        this.container = container;
        this.capacity = capacity;
        this.cache = [];
        this.hits = 0;
        this.misses = 0;

        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div class="cache-display">
        <div class="cache-slots" id="cacheSlots"></div>
        <div class="cache-stats">
          <div class="metric-card">
            <div class="metric-value" id="hitRate">0%</div>
            <div class="metric-label">Hit Rate</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" id="cacheHits">0</div>
            <div class="metric-label">Hits</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" id="cacheMisses">0</div>
            <div class="metric-label">Misses</div>
          </div>
        </div>
      </div>
    `;
        this.slotsContainer = this.container.querySelector('#cacheSlots');
        this.updateDisplay();
    }

    access(key) {
        const existingIndex = this.cache.findIndex(item => item.key === key);

        if (existingIndex !== -1) {
            // Hit - move to front (most recently used)
            const item = this.cache.splice(existingIndex, 1)[0];
            this.cache.unshift(item);
            this.hits++;
            this.updateDisplay('hit', key);
            return true;
        } else {
            // Miss
            if (this.cache.length >= this.capacity) {
                // Evict LRU (last item)
                this.cache.pop();
            }
            this.cache.unshift({ key, value: `data_${key}` });
            this.misses++;
            this.updateDisplay('miss', key);
            return false;
        }
    }

    updateDisplay(event, key) {
        // Update slots
        this.slotsContainer.innerHTML = '';
        for (let i = 0; i < this.capacity; i++) {
            const slot = document.createElement('div');
            slot.className = 'cache-slot';
            if (this.cache[i]) {
                slot.classList.add('filled');
                if (event && this.cache[i].key === key) {
                    slot.classList.add(event === 'hit' ? 'hit' : 'new');
                }
                slot.innerHTML = `<span class="slot-key">${this.cache[i].key}</span>`;
            } else {
                slot.innerHTML = '<span class="slot-empty">Empty</span>';
            }
            this.slotsContainer.appendChild(slot);
        }

        // Update stats
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? Math.round((this.hits / total) * 100) : 0;

        this.container.querySelector('#hitRate').textContent = `${hitRate}%`;
        this.container.querySelector('#cacheHits').textContent = this.hits;
        this.container.querySelector('#cacheMisses').textContent = this.misses;
    }

    reset() {
        this.cache = [];
        this.hits = 0;
        this.misses = 0;
        this.updateDisplay();
    }
}

// Load Balancer Visualization
class LoadBalancerViz {
    constructor(container, options = {}) {
        this.container = container;
        this.algorithm = options.algorithm || 'round-robin';
        this.serverCount = options.serverCount || 3;
        this.servers = [];
        this.currentIndex = 0;
        this.requestCount = 0;

        this.init();
    }

    init() {
        this.container.innerHTML = `
      <div class="lb-visualization">
        <div class="lb-client">
          <div class="client-icon">👤</div>
          <span>Clients</span>
        </div>
        <div class="lb-balancer">
          <div class="balancer-icon">⚖️</div>
          <span>Load Balancer</span>
        </div>
        <div class="lb-servers" id="lbServers"></div>
      </div>
    `;

        this.serversContainer = this.container.querySelector('#lbServers');
        this.createServers();
    }

    createServers() {
        this.serversContainer.innerHTML = '';
        this.servers = [];

        for (let i = 0; i < this.serverCount; i++) {
            const server = {
                id: `S${i + 1}`,
                connections: 0,
                responseTime: 50 + Math.random() * 100,
                weight: 1
            };

            const el = document.createElement('div');
            el.className = 'lb-server';
            el.innerHTML = `
        <div class="server-icon">🖥️</div>
        <div class="server-name">${server.id}</div>
        <div class="server-conns">0 conn</div>
      `;

            server.element = el;
            this.servers.push(server);
            this.serversContainer.appendChild(el);
        }
    }

    selectServer() {
        let selected;

        switch (this.algorithm) {
            case 'round-robin':
                selected = this.servers[this.currentIndex % this.servers.length];
                this.currentIndex++;
                break;

            case 'least-connections':
                selected = this.servers.reduce((min, s) =>
                    s.connections < min.connections ? s : min
                );
                break;

            case 'least-response-time':
                selected = this.servers.reduce((min, s) =>
                    s.responseTime < min.responseTime ? s : min
                );
                break;

            case 'random':
                selected = this.servers[Math.floor(Math.random() * this.servers.length)];
                break;

            default:
                selected = this.servers[0];
        }

        return selected;
    }

    sendRequest() {
        const server = this.selectServer();
        server.connections++;
        this.requestCount++;

        // Update display
        server.element.classList.add('active');
        server.element.querySelector('.server-conns').textContent =
            `${server.connections} conn`;

        // Simulate response time
        setTimeout(() => {
            server.connections--;
            server.element.querySelector('.server-conns').textContent =
                `${server.connections} conn`;
            if (server.connections === 0) {
                server.element.classList.remove('active');
            }
        }, 500 + Math.random() * 500);

        return server.id;
    }

    setAlgorithm(algo) {
        this.algorithm = algo;
        this.currentIndex = 0;
    }

    reset() {
        this.servers.forEach(s => {
            s.connections = 0;
            s.element.classList.remove('active');
            s.element.querySelector('.server-conns').textContent = '0 conn';
        });
        this.currentIndex = 0;
        this.requestCount = 0;
    }
}

// CAP Theorem Interactive Triangle
class CAPTriangle {
    constructor(container) {
        this.container = container;
        this.selected = new Set();
        this.examples = {
            'CA': ['Traditional RDBMS', 'Single-node systems'],
            'CP': ['MongoDB', 'HBase', 'Redis Cluster'],
            'AP': ['Cassandra', 'DynamoDB', 'CouchDB']
        };

        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div class="cap-container">
        <svg class="cap-triangle" viewBox="0 0 300 260">
          <defs>
            <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6366f1"/>
              <stop offset="100%" style="stop-color:#8b5cf6"/>
            </linearGradient>
          </defs>
          <polygon class="triangle-bg" points="150,20 280,230 20,230" 
            fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" stroke-width="2"/>
          <circle class="cap-node" data-cap="C" cx="150" cy="30" r="25"/>
          <circle class="cap-node" data-cap="A" cx="30" cy="220" r="25"/>
          <circle class="cap-node" data-cap="P" cx="270" cy="220" r="25"/>
          <text x="150" y="35" class="cap-label">C</text>
          <text x="30" y="225" class="cap-label">A</text>
          <text x="270" y="225" class="cap-label">P</text>
        </svg>
        <div class="cap-info">
          <h4>Select any 2</h4>
          <p id="capDescription">Click on two properties to see what you get and what you sacrifice.</p>
          <div id="capExamples" class="cap-examples"></div>
        </div>
      </div>
      <style>
        .cap-container { display: flex; gap: 2rem; align-items: center; flex-wrap: wrap; }
        .cap-triangle { width: 300px; height: 260px; }
        .cap-node { fill: var(--bg-tertiary); stroke: var(--border-light); stroke-width: 2; cursor: pointer; transition: all 0.2s; }
        .cap-node:hover { stroke: var(--accent-primary); }
        .cap-node.selected { fill: url(#capGradient); stroke: var(--accent-primary); }
        .cap-label { fill: var(--text-primary); font-size: 16px; font-weight: 600; text-anchor: middle; pointer-events: none; }
        .cap-info { flex: 1; min-width: 250px; }
        .cap-examples { margin-top: 1rem; }
        .cap-example { padding: 0.5rem 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); margin: 0.25rem 0; font-size: 0.9rem; }
      </style>
    `;

        const nodes = this.container.querySelectorAll('.cap-node');
        nodes.forEach(node => {
            node.addEventListener('click', () => this.toggle(node.dataset.cap));
        });
    }

    toggle(prop) {
        if (this.selected.has(prop)) {
            this.selected.delete(prop);
        } else if (this.selected.size < 2) {
            this.selected.add(prop);
        } else {
            // Replace oldest
            const first = this.selected.values().next().value;
            this.selected.delete(first);
            this.selected.add(prop);
        }

        this.updateDisplay();
    }

    updateDisplay() {
        // Update node styles
        const nodes = this.container.querySelectorAll('.cap-node');
        nodes.forEach(node => {
            node.classList.toggle('selected', this.selected.has(node.dataset.cap));
        });

        // Update description
        const desc = this.container.querySelector('#capDescription');
        const examples = this.container.querySelector('#capExamples');

        if (this.selected.size === 2) {
            const props = Array.from(this.selected).sort().join('');
            const sacrificed = ['C', 'A', 'P'].find(p => !this.selected.has(p));
            const propNames = { C: 'Consistency', A: 'Availability', P: 'Partition Tolerance' };

            desc.innerHTML = `<strong>${Array.from(this.selected).map(p => propNames[p]).join(' + ')}</strong><br>
        You sacrifice: <span style="color: var(--error)">${propNames[sacrificed]}</span>`;

            examples.innerHTML = this.examples[props]
                .map(ex => `<div class="cap-example">${ex}</div>`)
                .join('');
        } else {
            desc.textContent = 'Click on two properties to see what you get and what you sacrifice.';
            examples.innerHTML = '';
        }
    }
}

// Export visualizations
window.Visualizations = {
    animate,
    ServerNode,
    RequestParticle,
    HashRing,
    CacheVisualizer,
    LoadBalancerViz,
    CAPTriangle
};
