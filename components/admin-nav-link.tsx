import Link from "next/link";

import { getCurrentRole, isAdminRole } from "@/lib/auth";

type AdminNavLinkProps = {
  active?: boolean;
  className: string;
};

export async function AdminNavLink({ active = false, className }: AdminNavLinkProps) {
  const role = await getCurrentRole();

  if (!isAdminRole(role)) {
    return null;
  }

  return (
    <Link aria-current={active ? "page" : undefined} className={className} href="/admin">
      Admin
    </Link>
  );
}
