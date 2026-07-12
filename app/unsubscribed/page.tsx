import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribed | Hackathons North America",
  description: "You have been unsubscribed from Haethon emails.",
};

export default function UnsubscribedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#141414] px-5 text-wheat">
      <div className="max-w-[26rem] text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">You&apos;re unsubscribed</h1>
        <p className="mt-4 text-base leading-relaxed text-wheat/65">
          You won&apos;t receive any more emails from Haethon. You can turn emails back on any time from your account
          page.
        </p>
        <Link
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-wheat px-6 text-sm font-semibold text-[#141414] transition-colors hover:bg-white"
          href="/account"
        >
          Go to account settings
        </Link>
      </div>
    </main>
  );
}
