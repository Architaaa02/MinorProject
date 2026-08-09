/**
 * Department Routing Module (Section VII.E) and Notification Service stub.
 *
 * Records a routing timestamp for audit purposes (supports later auditing
 * of processing delay, per Section VII.E) and dispatches a notification.
 *
 * Real-time push delivery via WebSocket is called out in the paper
 * (Sections VI, VIII, XI, XII) as a planned extension rather than part of
 * the current implementation, so this module currently logs/records the
 * event; swap `notify()` for a socket.io emit or a queue publish once that
 * layer is added.
 */

function routeToDepartment(issue) {
  issue.routedAt = new Date();
  return issue;
}

function notify(event, payload) {
  // Placeholder notification channel (Section VI: "Notification Service").
  // In production this would push to WebSocket clients, email, or SMS.
  console.log(`[notify] ${event}`, JSON.stringify(payload));
}

module.exports = { routeToDepartment, notify };
