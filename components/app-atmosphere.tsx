import { filmGrainClassName } from "@/lib/tailwind";

export function AppAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className={`${filmGrainClassName} absolute inset-0 opacity-[0.04] mix-blend-overlay dark:opacity-[0.07]`} />
    </div>
  );
}
