"use client";

import { FormEvent, useState } from "react";
import { AtSign, Camera, Code, ExternalLink, Globe, Link2, MapPin, Pencil, Save, School, X } from "lucide-react";

type ProfileValues = {
  headline?: string | null;
  bio?: string | null;
  locationCity?: string | null;
  locationRegion?: string | null;
  school?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  xUrl?: string | null;
  devpostUrl?: string | null;
  portfolioUrl?: string | null;
};

type ProfileFormProps = {
  displayEmail: string;
  displayName: string;
  profile: ProfileValues | null;
};

type ProfileLink = {
  href: string;
  icon: typeof Code;
  label: string;
};

const inputClassName =
  "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-[#706F6B] focus:border-[#660000] focus:bg-white focus:ring-2 focus:ring-[#660000]/15";
const labelClassName = "mb-1.5 block text-sm font-semibold text-black";
const headingClassName = "text-sm font-semibold uppercase tracking-[0.2em] text-[#660000]";

function formValue(formData: FormData, name: keyof ProfileValues) {
  return formData.get(name)?.toString() ?? "";
}

function labelFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "") + parsed.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

function compactHandle(url: string, fallback: string) {
  try {
    const parsed = new URL(url);
    const handle = parsed.pathname.split("/").filter(Boolean).at(-1);
    return handle ? `/${handle}` : fallback;
  } catch {
    return fallback;
  }
}

export function AccountProfileForm({ displayEmail, displayName, profile }: ProfileFormProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<ProfileValues>({
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    locationCity: profile?.locationCity ?? "",
    locationRegion: profile?.locationRegion ?? "",
    school: profile?.school ?? "",
    githubUrl: profile?.githubUrl ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
    instagramUrl: profile?.instagramUrl ?? "",
    xUrl: profile?.xUrl ?? "",
    devpostUrl: profile?.devpostUrl ?? "",
    portfolioUrl: profile?.portfolioUrl ?? "",
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");

    const formData = new FormData(event.currentTarget);
    const payload = {
      headline: formValue(formData, "headline"),
      bio: formValue(formData, "bio"),
      locationCity: formValue(formData, "locationCity"),
      locationRegion: formValue(formData, "locationRegion"),
      school: formValue(formData, "school"),
      githubUrl: formValue(formData, "githubUrl"),
      linkedinUrl: formValue(formData, "linkedinUrl"),
      instagramUrl: formValue(formData, "instagramUrl"),
      xUrl: formValue(formData, "xUrl"),
      devpostUrl: formValue(formData, "devpostUrl"),
      portfolioUrl: formValue(formData, "portfolioUrl"),
    };

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setValues(payload);
      setStatus("saved");
      setIsEditing(false);
      return;
    }

    setStatus("error");
  }

  const location = [values.locationCity, values.locationRegion].filter(Boolean).join(", ");
  const links = [
    { label: values.githubUrl ? compactHandle(values.githubUrl, "GitHub") : "GitHub", href: values.githubUrl, icon: Code },
    { label: values.linkedinUrl ? compactHandle(values.linkedinUrl, "LinkedIn") : "LinkedIn", href: values.linkedinUrl, icon: Link2 },
    { label: values.instagramUrl ? compactHandle(values.instagramUrl, "Instagram") : "Instagram", href: values.instagramUrl, icon: Camera },
    { label: values.xUrl ? compactHandle(values.xUrl, "X") : "X", href: values.xUrl, icon: X },
    { label: values.devpostUrl ? labelFromUrl(values.devpostUrl) : "Devpost", href: values.devpostUrl, icon: ExternalLink },
    { label: values.portfolioUrl ? labelFromUrl(values.portfolioUrl) : "Portfolio", href: values.portfolioUrl, icon: Globe },
  ].filter((link): link is ProfileLink => Boolean(link.href));

  return (
    <section className="space-y-4">
      <div>
        <p className={headingClassName}>My account</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-black">{displayName}</h1>
        <p className="mt-1 break-all text-sm text-[#706F6B]">{displayEmail}</p>
      </div>

      <div className="space-y-2 text-sm text-black">
        {values.headline ? <p className="font-semibold">{values.headline}</p> : null}
        {values.bio ? <p className="leading-6 text-black">{values.bio}</p> : null}
      </div>

      <button
        type="button"
        onClick={() => {
          setStatus("idle");
          setIsEditing((current) => !current);
        }}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#660000] bg-white px-4 text-sm font-semibold text-[#660000] transition hover:bg-[#660000] hover:text-white focus-visible:bg-[#660000] focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#660000]"
      >
        <Pencil aria-hidden="true" className="size-4" />
        Edit profile
      </button>

      {isEditing ? (
        <form onSubmit={onSubmit} className="rounded-lg border border-black/10 bg-[#F7F7F4] p-4">
          <h2 className={headingClassName}>Profile</h2>

          <div className="mt-4 grid gap-4">
            <div>
              <label className={labelClassName} htmlFor="headline">
                Headline
              </label>
              <input id="headline" name="headline" defaultValue={values.headline ?? ""} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName} htmlFor="school">
                School
              </label>
              <input id="school" name="school" defaultValue={values.school ?? ""} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName} htmlFor="locationCity">
                City
              </label>
              <input id="locationCity" name="locationCity" defaultValue={values.locationCity ?? ""} className={inputClassName} />
            </div>
            <div>
              <label className={labelClassName} htmlFor="locationRegion">
                Region
              </label>
              <input id="locationRegion" name="locationRegion" defaultValue={values.locationRegion ?? ""} className={inputClassName} />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClassName} htmlFor="bio">
              Bio
            </label>
            <textarea id="bio" name="bio" rows={4} defaultValue={values.bio ?? ""} className={inputClassName} />
          </div>

          <div className="mt-5 grid gap-4">
            {[
              ["linkedinUrl", "LinkedIn"],
              ["instagramUrl", "Instagram"],
              ["xUrl", "X"],
              ["devpostUrl", "Devpost"],
              ["githubUrl", "GitHub"],
              ["portfolioUrl", "Portfolio"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className={labelClassName} htmlFor={name}>
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type="url"
                  defaultValue={values[name as keyof ProfileValues] ?? ""}
                  className={inputClassName}
                />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              disabled={status === "saving"}
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#660000] px-4 text-sm font-semibold text-[#EFEDEA] transition hover:bg-[#4d0000] disabled:opacity-60"
            >
              <Save aria-hidden="true" className="size-4" />
              {status === "saving" ? "Saving" : "Save profile"}
            </button>
            {status === "error" ? <p className="text-sm font-semibold text-[#B42318]">Could not save</p> : null}
          </div>
        </form>
      ) : null}

      {status === "saved" ? <p className="text-sm font-semibold text-[#027A48]">Saved</p> : null}

      <div className="space-y-3 border-t border-black/10 pt-4 text-sm text-black">
        <p className="flex items-center gap-2">
          <AtSign aria-hidden="true" className="size-4 shrink-0 text-[#706F6B]" />
          <span className="break-all">{displayEmail}</span>
        </p>
        {values.school ? (
          <p className="flex items-center gap-2">
            <School aria-hidden="true" className="size-4 shrink-0 text-[#706F6B]" />
            <span>{values.school}</span>
          </p>
        ) : null}
        {location ? (
          <p className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-[#706F6B]" />
            <span>{location}</span>
          </p>
        ) : null}
        {links.map(({ href, icon: Icon, label }) => (
          <a
            className="flex items-center gap-2 text-[#706F6B] hover:text-[#660000]"
            href={href}
            key={href}
            rel="noreferrer"
            target="_blank"
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span className="break-all">{label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
