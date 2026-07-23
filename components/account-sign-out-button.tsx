"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

const buttonClassName =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

export function AccountSignOutButton() {
  return (
    <SignOutButton redirectUrl="/">
      <button className={buttonClassName} type="button">
        <LogOut aria-hidden="true" className="size-4" />
        Sign out
      </button>
    </SignOutButton>
  );
}
