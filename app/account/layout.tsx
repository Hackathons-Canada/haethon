import { PrimaryNav } from "@/components/primary-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <PrimaryNav activeHref="/account" />
      {children}
    </div>
  );
}
