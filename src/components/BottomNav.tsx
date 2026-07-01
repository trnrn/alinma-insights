import { Grid2x2, Store, Receipt, ArrowLeftRight, Home } from "lucide-react";

const items = [
  { label: "الخدمات", icon: Grid2x2 },
  { label: "المتجر", icon: Store },
  { label: "المدفوعات", icon: Receipt },
  { label: "التحويل", icon: ArrowLeftRight },
  { label: "الرئيسية", icon: Home, active: true },
];

export function BottomNav() {
  return (
    <div
      className="sticky bottom-0 border-t backdrop-blur-xl"
      style={{
        background: "oklch(0.16 0.03 250 / 0.85)",
        borderColor: "oklch(0.32 0.03 250 / 0.6)",
      }}
    >
      <div className="flex justify-around items-center px-3 pt-3 pb-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              className="flex flex-col items-center gap-1 text-[10px] transition-transform active:scale-95"
              style={{ color: it.active ? "var(--coral)" : "oklch(0.72 0.02 250)" }}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={1.75} />
                {it.active && (
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style={{ background: "var(--coral)" }}
                  />
                )}
              </div>
              <span className="font-medium">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}