import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-8 py-12 sm:px-14 lg:px-20">
      <UserProfile path="/account" routing="path" />
    </main>
  );
}
