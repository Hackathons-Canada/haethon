"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

type ImportResult = {
  duplicateScore: number;
  externalId?: string;
  hackathonId?: string;
  index: number;
  matchedHackathonId?: string;
  name: string;
  status: "imported" | "duplicate_queued";
  submissionId: string;
};

type ImportResponse = {
  data?: {
    duplicateCount: number;
    importedCount: number;
    results: ImportResult[];
    total: number;
  };
  error?: unknown;
};

const sampleJson = `[
  {
    "name": "Waterloo Build Weekend",
    "organizationName": "Waterloo Builders",
    "websiteUrl": "https://example.com",
    "imageUrl": "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
    "sourceUrl": "https://example.com/event",
    "country": "Canada",
    "startDate": "2026-09-12",
    "endDate": "2026-09-14",
    "format": "in_person",
    "shortDescription": "A weekend hackathon for students building useful software."
  }
]`;

function stringifyError(error: unknown) {
  return typeof error === "string" ? error : JSON.stringify(error, null, 2);
}

export function HackathonJsonImporter() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage(null);
    setResults([]);

    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setStatus("error");
      setMessage("Invalid JSON.");
      return;
    }

    const response = await fetch("/api/admin/hackathon-imports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    const body = (await response.json()) as ImportResponse;

    if (!response.ok || !body.data) {
      setStatus("error");
      setMessage(body.error ? stringifyError(body.error) : "Import failed.");
      return;
    }

    setStatus("success");
    setMessage(`${body.data.importedCount} imported, ${body.data.duplicateCount} queued for review.`);
    setResults(body.data.results);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#660000]">Bulk import</p>
          <h2 className="mt-2 text-2xl font-semibold text-black">Scraped hackathons JSON</h2>
        </div>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white disabled:opacity-50"
          disabled={status === "submitting" || !jsonText.trim()}
          type="submit"
        >
          <Upload aria-hidden="true" className="size-4" />
          {status === "submitting" ? "Importing" : "Import JSON"}
        </button>
      </div>

      <textarea
        aria-label="Hackathon import JSON"
        className="min-h-72 w-full rounded-lg border border-black/15 bg-[#F7F7F4] p-4 font-mono text-xs leading-5 text-black outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/15"
        onChange={(event) => setJsonText(event.target.value)}
        placeholder={sampleJson}
        spellCheck={false}
        value={jsonText}
      />

      {message ? (
        <div
          className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${
            status === "error"
              ? "border-[#B42318]/30 bg-[#FEF3F2] text-[#B42318]"
              : "border-[#027A48]/25 bg-[#ECFDF3] text-[#027A48]"
          }`}
        >
          {status === "error" ? (
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          )}
          <pre className="whitespace-pre-wrap font-sans">{message}</pre>
        </div>
      ) : null}

      {results.length ? (
        <div className="overflow-hidden rounded-lg border border-black/10">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-black/10 bg-[#F7F7F4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#706F6B]">
            <span>Name</span>
            <span>Status</span>
            <span>Duplicate</span>
          </div>
          <div className="divide-y divide-black/10 bg-white">
            {results.map((result) => (
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3 text-sm" key={`${result.status}-${result.submissionId}`}>
                <span className="font-semibold text-black">{result.name}</span>
                <span className={result.status === "imported" ? "text-[#027A48]" : "text-[#B54708]"}>
                  {result.status === "imported" ? "Imported" : "Queued"}
                </span>
                <span className="text-[#706F6B]">{result.duplicateScore.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
