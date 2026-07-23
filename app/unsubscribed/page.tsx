import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribed | Hackathons North America",
  description: "You have been unsubscribed from Haethon emails.",
};

export default function UnsubscribedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
      <div className="max-w-[26rem] text-center">
        <h1 className="text-3xl font-medium tracking-tight">You&apos;re unsubscribed</h1>
        <p className="mt-4 text-base leading-relaxed text-ink/65">
          You won&apos;t receive any more emails from Haethon. You can turn emails back on any time from your account
          page.
        </p>
        <Link
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium text-ink transition-colors hover:bg-pine hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
          href="/account"
        >
          Go to account settings
        </Link>
      </div>
    </main>
  );
}
