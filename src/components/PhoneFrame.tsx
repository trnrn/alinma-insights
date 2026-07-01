import type { ReactNode } from "react";

/** Mobile viewport wrapper — keeps content phone-sized on desktop, full-width on mobile. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      dir="rtl"
      className="min-h-screen w-full flex justify-center"
      style={{
        background:
          "radial-gradient(1200px 800px at 50% -200px, oklch(0.28 0.05 260) 0%, oklch(0.14 0.03 250) 60%)",
      }}
    >
      <div
        className="w-full max-w-[430px] min-h-screen relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        {children}
      </div>
    </div>
  );
}