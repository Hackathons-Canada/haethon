import { auth } from "@clerk/nextjs/server";

import { AppAtmosphere } from "@/components/app-atmosphere";
import { AppShellContent, AppShellWipe } from "@/components/app-shell-transition";
import { AppSidebar } from "@/components/app-sidebar";
import { isAdminRole, roleFromSessionClaims } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth();
  const role = roleFromSessionClaims(sessionClaims);

  return (
    <div className="relative flex min-h-screen flex-col text-navy dark:text-wheat lg:flex-row">
      <AppAtmosphere />
      <AppSidebar isAdmin={isAdminRole(role)} isOrganizer={role === "organizer"} isSignedIn={Boolean(userId)} />
      <AppShellContent>{children}</AppShellContent>
      <AppShellWipe />
    </div>
  );
}
