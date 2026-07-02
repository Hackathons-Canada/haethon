import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

type NavAuthLinkProps = {
  className: string;
};

export async function NavAuthLink({ className }: NavAuthLinkProps) {
  const { userId } = await auth();

  if (userId) {
    return (
      <Link href="/account" className={className}>
        My account
      </Link>
    );
  }

  return (
    <Link href="/sign-in" className={className}>
      Login
    </Link>
  );
}
