"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileWarning, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

type FixImportResult = {
  duplicateScore: number;
  index: number;
  matchedHackathonId?: string;
  name: string;
  reason: string;
  source: string;
  sourceUrl: string;
  submissionId: string;
};

type FixImportResponse = {
  data?: {
    queuedCount: number;
    results: FixImportResult[];
    total: number;
  };
  error?: unknown;
};

type PreviewItem = {
  name: string;
  reason: string;
  source: string;
  sourceUrl: string;
};

const sampleFixJson = `[
  {
    "source": "luma",
    "reason": "missing country",
    "sourceUrl": "https://luma.com/fxeizoz7",
    "raw": {
      "event": {
        "api_id": "evt-sifYdPT7PVNPyde",
        "name": "FlutterFlow Champions League 2026 - Hyderabad Edition",
        "start_at": "2026-07-05T04:30:00.000Z",
        "end_at": "2026-07-05T12:30:00.000Z",
        "location_type": "offline",
        "geo_address_info": {
          "address": "The Commons Food Hall, 1st Floor, Phoenix Equinox, Hyderabad"
        }
      }
    }
  }
]`;

function stringifyError(error: unknown) {
  return typeof error === "string" ? error : JSON.stringify(error, null, 2);
}

function objectValue(value: unknown, key: string) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return (value as Record<string, unknown>)[key];
}

function stringValue(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function previewItems(value: unknown): PreviewItem[] {
  const items = Array.isArray(value) ? value : objectValue(value, "items");

  if (!Array.isArray(items)) {
    return [];
  }

  return items.slice(0, 25).map((item, index) => {
    const raw = objectValue(item, "raw");
    const event = objectValue(raw, "event") ?? raw;
    const sourceUrl = stringValue(objectValue(item, "sourceUrl"));
    const eventUrl = stringValue(objectValue(event, "url"));

    return {
      name: stringValue(objectValue(event, "name")) || `Imported item ${index + 1}`,
      reason: stringValue(objectValue(item, "reason")) || "Needs review",
      source: stringValue(objectValue(item, "source")) || "unknown",
      sourceUrl: sourceUrl || (eventUrl ? `https://luma.com/${eventUrl}` : ""),
    };
  });
}

export function HackathonFixJsonImporter() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<FixImportResult[]>([]);

  const preview = useMemo(() => {
    if (!jsonText.trim()) {
      return [];
    }

    try {
      return previewItems(JSON.parse(jsonText));
    } catch {
      return [];
    }
  }, [jsonText]);

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

    const response = await fetch("/api/admin/hackathon-fix-imports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    });
    const body = (await response.json()) as FixImportResponse;

    if (!response.ok || !body.data) {
      setStatus("error");
      setMessage(body.error ? stringifyError(body.error) : "Import failed.");
      return;
    }

    setStatus("success");
    setMessage(`${body.data.queuedCount} imported into the fix queue.`);
    setResults(body.data.results);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#660000]">Fix queue import</p>
          <h2 className="mt-2 text-2xl font-semibold text-black">Broken scraped JSON</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#706F6B]">
            Import records with `source`, `reason`, `sourceUrl`, and `raw`. Each item becomes a pending review card with editable fields and the fix reason attached.
          </p>
        </div>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white disabled:opacity-50"
          disabled={status === "submitting" || !jsonText.trim()}
          type="submit"
        >
          <Upload aria-hidden="true" className="size-4" />
          {status === "submitting" ? "Queueing" : "Queue fixes"}
        </button>
      </div>

      <textarea
        aria-label="Broken hackathon JSON"
        className="min-h-72 w-full rounded-lg border border-black/15 bg-[#F7F7F4] p-4 font-mono text-xs leading-5 text-black outline-none focus:border-[#660000] focus:ring-2 focus:ring-[#660000]/15"
        onChange={(event) => setJsonText(event.target.value)}
        placeholder={sampleFixJson}
        spellCheck={false}
        value={jsonText}
      />

      {preview.length ? (
        <div className="overflow-hidden rounded-lg border border-black/10">
          <div className="grid grid-cols-[1fr_0.75fr_0.9fr] gap-3 border-b border-black/10 bg-[#F7F7F4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#706F6B]">
            <span>Pre-populated event</span>
            <span>Source</span>
            <span>Reason</span>
          </div>
          <div className="divide-y divide-black/10 bg-white">
            {preview.map((item, index) => (
              <div className="grid grid-cols-[1fr_0.75fr_0.9fr] gap-3 px-4 py-3 text-sm" key={`${item.sourceUrl}-${index}`}>
                <span className="font-semibold text-black">{item.name}</span>
                <span className="truncate text-[#706F6B]">{item.source}</span>
                <span className="text-[#B54708]">{item.reason}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 border-b border-black/10 bg-[#F7F7F4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#706F6B]">
            <span>Queued item</span>
            <span>Duplicate</span>
            <span>Reason</span>
          </div>
          <div className="divide-y divide-black/10 bg-white">
            {results.map((result) => (
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 px-4 py-3 text-sm" key={result.submissionId}>
                <span className="font-semibold text-black">{result.name}</span>
                <span className="text-[#706F6B]">{result.duplicateScore.toFixed(2)}</span>
                <span className="inline-flex items-start gap-2 text-[#B54708]">
                  <FileWarning aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  {result.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
