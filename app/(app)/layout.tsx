import { auth } from "@clerk/nextjs/server";

import { AppAtmosphere } from "@/components/app-atmosphere";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentRole, isAdminRole } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [{ userId }, role] = await Promise.all([auth(), getCurrentRole()]);

  return (
    <div className="relative flex min-h-screen flex-col text-ink lg:flex-row">
      <AppAtmosphere />
      <AppSidebar isAdmin={isAdminRole(role)} isOrganizer={role === "organizer"} isSignedIn={Boolean(userId)} />
      <div className="app-shell-content relative z-10 min-w-0 flex-1">{children}</div>
      <div aria-hidden="true" className="app-shell-wipe">
        <span className="app-shell-wipe-label font-mono text-xs font-medium uppercase tracking-[0.3em] text-ivory">
          HNA
        </span>
      </div>
    </div>
  );
}
