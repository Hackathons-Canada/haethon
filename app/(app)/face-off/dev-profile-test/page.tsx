import { AccountProfileForm } from "@/components/forms/account-profile-form";

// Temporary unauthenticated harness for inspecting the profile hero layout.
export default function DevProfileTestPage() {
  return (
    <main className="relative min-h-[calc(100vh-80px)] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[840px]">
        <section id="profile" className="pt-2">
          <AccountProfileForm firstName="James" lastName="Cao" profile={null} />
        </section>
      </div>
    </main>
  );
}
