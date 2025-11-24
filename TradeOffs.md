# System Design Trade-offs & Rationale

| Decision                          | Chosen Approach           | Trade-off & Reason                                                                                   |
|-----------------------------------|---------------------------|-----------------------------------------------------------------------------------------------------|
| Rules Storage                     | JSON file (rules.config.json) | Fast reload without restart vs DB overhead. Hot-reload in 2s, perfect for ops team.                |
| Background Job                    | node-cron (every 5 mins)  | Simplicity & reliability vs RabbitMQ/Redis Queue. Cron is idempotent & zero dependency.            |
| Caching Layer                     | Redis with TTL            | O(1) stats vs DB load. Cache invalidated on every alert creation → always fresh.                   |
| Real-time Updates                 | Polling every 5s          | Simple & reliable vs WebSocket complexity. Polling is sufficient for ops dashboard.               |
| Trend Chart Data                  | MongoDB Aggregation       | Accurate real data vs pre-computed. Runs in <50ms even with 10k alerts.                            |
| Authentication                    | JWT + HttpOnly cookies    | Secure & stateless vs session DB. Scales horizontally.                                             |
| Error Handling                    | Global handler + Winston  | Structured logs + user-friendly messages vs basic console.log.                                      |
| Idempotency                       | alertId + driverId checks | Prevent duplicate escalation/auto-close vs allowing duplicates. Safety first.                     |
| Manual Resolve                    | PATCH endpoint            | Allows ops override vs fully automated. Required for edge cases.                                    |

All decisions prioritize **reliability, maintainability, and operational visibility** — exactly what MoveInSync needs.