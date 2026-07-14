"use client";

// Temporary page to verify Sentry client-side reporting. Delete after testing.
export default function SentryTest() {
  return (
    <button
      style={{ margin: "4rem", padding: "1rem" }}
      onClick={() => {
        throw new Error("Sentry client test");
      }}
    >
      Throw client error
    </button>
  );
}
