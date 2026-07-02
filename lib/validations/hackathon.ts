import { z } from "zod";

export const hackathonSearchSchema = z.object({
  q: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  format: z.enum(["online", "in_person", "hybrid"]).optional(),
  status: z.enum(["draft", "upcoming", "live", "completed", "archived"]).optional(),
  startsAfter: z.coerce.date().optional(),
  startsBefore: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const hackathonSubmissionSchema = z.object({
  name: z.string().min(3).max(180),
  websiteUrl: z.string().url(),
  applicationUrl: z.string().url().optional().or(z.literal("")),
  city: z.string().max(120).optional(),
  region: z.string().max(120).optional(),
  country: z.string().min(2).max(120),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  format: z.enum(["online", "in_person", "hybrid"]),
  shortDescription: z.string().min(20).max(500),
});

export const sponsorLeadSchema = z.object({
  companyName: z.string().min(2).max(180),
  contactName: z.string().min(2).max(180),
  email: z.string().email(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  budgetUsd: z.coerce.number().int().min(0).optional(),
  message: z.string().min(20).max(2000),
});
