"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { hackathonSubmissionSchema } from "@/lib/validations/hackathon";

type SubmissionValues = z.input<typeof hackathonSubmissionSchema>;

export function HackathonSubmissionForm() {
  const form = useForm<SubmissionValues>({
    resolver: zodResolver(hackathonSubmissionSchema),
    defaultValues: {
      name: "",
      websiteUrl: "",
      applicationUrl: "",
      city: "",
      region: "",
      country: "Canada",
      format: "in_person",
      shortDescription: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    console.info("Hackathon submission draft", values);
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border border-white/10 bg-black/30 p-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-200" htmlFor="name">
          Event name
        </label>
        <input
          id="name"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          {...form.register("name")}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-200" htmlFor="websiteUrl">
            Website URL
          </label>
          <input
            id="websiteUrl"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            {...form.register("websiteUrl")}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-200" htmlFor="applicationUrl">
            Application URL
          </label>
          <input
            id="applicationUrl"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            {...form.register("applicationUrl")}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <input
          aria-label="City"
          placeholder="City"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          {...form.register("city")}
        />
        <input
          aria-label="Region"
          placeholder="Province / state"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          {...form.register("region")}
        />
        <input
          aria-label="Country"
          placeholder="Country"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          {...form.register("country")}
        />
      </div>
      <textarea
        aria-label="Short description"
        placeholder="Short description"
        className="min-h-32 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        {...form.register("shortDescription")}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="date"
          aria-label="Start date"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          {...form.register("startDate")}
        />
        <input
          type="date"
          aria-label="End date"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          {...form.register("endDate")}
        />
      </div>
      <button
        type="submit"
        className="rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-200"
      >
        Save draft
      </button>
    </form>
  );
}
