# Intelligent Alert Escalation & Resolution System

| # | Criteria                        | Implementation |
|---|----------------------------------|-------------|
| 1 | **Authentication**              | JWT-based login with protected routes & middleware |
| 2 | **Time/Space Complexity**      | O(1) Redis cache for stats, O(log n) MongoDB indexes on driverId + createdAt |
| 3 | **System Failure Handling**     | Idempotent background jobs, MongoDB replica-ready models, Winston logging, Graceful error recovery |
| 4 | **OOPS Principles**             | Full modular design: Services, Controllers, Models, Middleware — encapsulation & single responsibility |
| 5 | **Trade-offs Documented**       | See TRADEOFFS.md — Redis vs DB, Cron vs Queue, Idempotency vs Speed |
| 6 | **System Monitoring**           | Winston + Morgan logs, Real-time dashboard, Redis cache monitoring |
| 7 | **Caching**                     | Redis TTL-based caching for `/stats`, `/top-offenders`, auto-invalidation |
| 8 | **Error Handling**              | Global error handler, meaningful messages, try-catch everywhere |

## Bonus Features Implemented
- Real-time dynamic trend chart (MongoDB aggregation)
- Auto-Closed alerts with filter (24h / 7d)
- Configuration Overview (rules.config.json viewer)
- Alert drill-down with full history
- Manual resolve button
- Real-time auto-refresh (5s)

## Tech Stack
- Backend: Node.js + Express + MongoDB + Redis + JWT
- Frontend: React 18 + Vite + Tailwind + Recharts
- Architecture: MVC + Service Layer + Background Worker

## How to Run Demo 
```bash
# 1. Start backend & frontend
npm run dev    # backend (port 5001)
npm run dev    # frontend (port 5173)

# 2. Run demo script
bash demo.sh   # Creates 3 overspeed → escalation + auto-close