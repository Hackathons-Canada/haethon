import { UserProfile } from "@clerk/nextjs";

export default function AccountSettingsPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12 text-navy dark:text-wheat sm:px-10 lg:px-16">
      <UserProfile
        path="/account/settings"
        routing="path"
        appearance={{
          variables: {
            colorBackground: "#fcf9f4",
            colorInput: "#ffffff",
            colorForeground: "#1d2a44",
            colorMutedForeground: "#818793",
            colorPrimary: "#721c24",
            colorPrimaryForeground: "#f4ebd9",
            borderRadius: "0.5rem",
          },
          elements: {
            rootBox: "w-full max-w-5xl",
            cardBox: "w-full bg-white/70 dark:bg-white/10 shadow-none",
            card: "bg-white/70 dark:bg-white/10 shadow-none",
            navbar: "bg-white/70 dark:bg-white/10",
            navbarButton: "text-navy dark:text-wheat hover:bg-navy/10 dark:hover:bg-white/10",
            pageScrollBox: "bg-white/70 dark:bg-white/10",
            profileSection: "border-navy/10 dark:border-white/10",
            profileSectionContent: "bg-white/70 dark:bg-white/10",
            formFieldInput: "border-navy/15 dark:border-white/15 bg-white dark:bg-white/[0.06] text-navy dark:text-wheat",
            formButtonPrimary: "bg-cabernet text-wheat dark:bg-wheat dark:text-[#141414] dark:hover:bg-white dark:hover:bg-white/15 hover:bg-[#5c151c]",
            accordionTriggerButton: "hover:bg-navy/10 dark:hover:bg-white/10",
          },
        }}
      />
    </main>
  );
}
