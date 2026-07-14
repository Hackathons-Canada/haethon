// Temporary route to verify Sentry server-side reporting. Delete after testing.
export function GET() {
  throw new Error("Sentry server test");
}
