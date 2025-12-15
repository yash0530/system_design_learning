/**
 * System Design Mastery - Core Application
 * Handles navigation, progress tracking, and dynamic content
 */

// Lesson data
const lessons = [
    {
        id: 1,
        title: 'System Design Fundamentals',
        description: 'Scalability, reliability, availability, and the core principles that define great systems.',
        tags: ['Scalability', 'Reliability', 'Availability'],
        file: 'lessons/01-fundamentals.html',
        icon: '🏗️'
    },
    {
        id: 2,
        title: 'Load Balancing',
        description: 'Distribute traffic intelligently with round-robin, weighted, and adaptive algorithms.',
        tags: ['Algorithms', 'Traffic Distribution', 'Health Checks'],
        file: 'lessons/02-load-balancing.html',
        icon: '⚖️'
    },
    {
        id: 3,
        title: 'Caching Strategies',
        description: 'Master cache invalidation, eviction policies, and write strategies.',
        tags: ['LRU', 'Write-Through', 'CDN'],
        file: 'lessons/03-caching.html',
        icon: '⚡'
    },
    {
        id: 4,
        title: 'Data Partitioning',
        description: 'Shard data effectively with consistent hashing and partitioning schemes.',
        tags: ['Sharding', 'Consistent Hashing', 'Rebalancing'],
        file: 'lessons/04-data-partitioning.html',
        icon: '🗂️'
    },
    {
        id: 5,
        title: 'Database Indexes',
        description: 'Understand index structures and their trade-offs for query optimization.',
        tags: ['B-Tree', 'Hash Index', 'Query Performance'],
        file: 'lessons/05-indexes.html',
        icon: '📑'
    },
    {
        id: 6,
        title: 'Proxies & Gateways',
        description: 'Forward proxies, reverse proxies, and API gateways explained.',
        tags: ['Reverse Proxy', 'API Gateway', 'TLS Termination'],
        file: 'lessons/06-proxies.html',
        icon: '🛡️'
    },
    {
        id: 7,
        title: 'Replication & Redundancy',
        description: 'Leader election, failover, and keeping data consistent across replicas.',
        tags: ['Leader Election', 'Raft', 'Sync vs Async'],
        file: 'lessons/07-replication.html',
        icon: '🔄'
    },
    {
        id: 8,
        title: 'SQL vs NoSQL',
        description: 'Choose the right database type for your use case.',
        tags: ['ACID', 'Document Store', 'Graph DB'],
        file: 'lessons/08-sql-nosql.html',
        icon: '🗄️'
    },
    {
        id: 9,
        title: 'CAP Theorem',
        description: 'The fundamental trade-off in distributed systems.',
        tags: ['Consistency', 'Availability', 'Partition Tolerance'],
        file: 'lessons/09-cap-theorem.html',
        icon: '📐'
    },
    {
        id: 10,
        title: 'Consistent Hashing',
        description: 'Distribute keys across nodes with minimal redistribution on changes.',
        tags: ['Hash Ring', 'Virtual Nodes', 'Load Distribution'],
        file: 'lessons/10-consistent-hashing.html',
        icon: '💍'
    },
    {
        id: 11,
        title: 'Real-Time Communication',
        description: 'Long polling, WebSockets, and Server-Sent Events compared.',
        tags: ['WebSockets', 'SSE', 'Long Polling'],
        file: 'lessons/11-realtime.html',
        icon: '📡'
    }
];

// Progress tracking
class ProgressTracker {
    constructor() {
        this.storageKey = 'systemDesignProgress';
        this.progress = this.load();
    }

    load() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {};
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    markComplete(lessonId) {
        this.progress[lessonId] = { completed: true, timestamp: Date.now() };
        this.save();
    }

    isComplete(lessonId) {
        return this.progress[lessonId]?.completed || false;
    }

    getCompletionPercentage() {
        const completed = Object.values(this.progress).filter(p => p.completed).length;
        return Math.round((completed / lessons.length) * 100);
    }
}

const progress = new ProgressTracker();

// Render lessons grid
function renderLessons() {
    const grid = document.getElementById('lessonsGrid');
    if (!grid) return;

    grid.innerHTML = lessons.map(lesson => `
    <a href="${lesson.file}" class="lesson-card glass-card" data-lesson="${lesson.id}">
      <div class="lesson-number">${lesson.icon}</div>
      <h4 class="lesson-title">${lesson.title}</h4>
      <p class="lesson-desc">${lesson.description}</p>
      <div class="lesson-tags">
        ${lesson.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      ${progress.isComplete(lesson.id) ? `
        <div class="progress-container">
          <div class="progress-bar" style="width: 100%"></div>
        </div>
      ` : ''}
    </a>
  `).join('');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    renderLessons();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// Export for use in lesson pages
window.SystemDesign = {
    lessons,
    progress,
    markLessonComplete: (id) => {
        progress.markComplete(id);
    }
};
