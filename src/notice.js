// The green or red message shown after an action. One place for the markup, so every screen announces it the same way.
export function noticeHtml(message, testId) {
  if (!message) return "";
  return `<p class="notice ${message.error ? "error" : ""}" role="status" aria-live="polite" data-testid="${testId}">${message.text}</p>`;
}
