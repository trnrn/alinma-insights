import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LogOut,
  Bell,
  Pencil,
  Eye,
  Car,
  Smartphone,
  Send,
  FileText,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { dataset, fmtSAR } from "@/lib/insights-data";

export const Route = createFileRoute("/")({
  component: Home,
});

const quickActions = [
  { label: "المخالفات المرورية", icon: Car },
  { label: "شحن الجوال", icon: Smartphone },
  { label: "الحوالات السريعة", icon: Send },
  { label: "دفع الفواتير", icon: FileText, badge: 2 },
];

function Home() {
  const c = dataset.customer;
  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-screen">
        {/* Status bar area */}
        <div className="flex justify-between items-center px-5 pt-4 pb-2 text-xs text-white/90">
          <span className="font-semibold">15:27</span>
          <span className="tracking-widest">••••• 5G</span>
        </div>

        {/* Top bar */}
        <div className="flex justify-between items-center px-5 pt-3">
          <div className="flex items-center gap-3">
            <button aria-label="خروج">
              <LogOut size={22} style={{ color: "var(--coral)" }} strokeWidth={2} />
            </button>
            <button aria-label="الإشعارات">
              <Bell size={22} className="text-white/90" strokeWidth={1.75} />
            </button>
            <button aria-label="تعديل">
              <Pencil size={20} className="text-white/90" strokeWidth={1.75} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-white text-sm font-semibold">يارا</div>
              <div className="flex items-center gap-1 text-[10px]">
                <span
                  className="w-3 h-3 rounded-sm grid place-items-center text-[8px] font-bold"
                  style={{ background: "var(--coral)", color: "var(--navy)" }}
                >
                  ✦
                </span>
                <span className="text-white/80">10</span>
              </div>
            </div>
            <div
              className="w-10 h-10 rounded-xl grid place-items-center text-sm font-bold border"
              style={{
                borderColor: "oklch(0.4 0.03 250)",
                background: "oklch(0.28 0.04 250 / 0.5)",
                color: "white",
              }}
            >
              ي ا
            </div>
          </div>
        </div>

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center pt-10 pb-6"
        >
          <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
            <span>•••</span>
            <span>حساب جاري 1000</span>
          </div>
          <div className="flex items-baseline gap-2 justify-center">
            <Eye size={16} className="text-white/60" />
            <span className="text-white text-[42px] font-light tracking-tight">
              {fmtSAR(c.currentBalance).split(".")[0]}
              <span className="text-white/70 text-xl">
                .{fmtSAR(c.currentBalance).split(".")[1]}
              </span>
            </span>
            <span className="text-white/70 text-xl">﷼</span>
          </div>
          <div
            className="mt-4 px-5 py-1.5 rounded-full text-sm text-white font-medium"
            style={{ background: "oklch(0.32 0.04 250)" }}
          >
            جاري
          </div>
          <div className="flex gap-1.5 mt-4">
            <span className="w-6 h-1 rounded-full" style={{ background: "var(--coral)" }} />
            <span className="w-1 h-1 rounded-full bg-white/30" />
          </div>
        </motion.div>

        <div className="px-5 space-y-4 pb-4">
          {/* NEW: Insights card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Link to="/insights" className="block active:scale-[0.99] transition-transform">
              <div
                className="relative rounded-3xl overflow-hidden p-5"
                style={{
                  background:
                    "linear-gradient(120deg, oklch(0.28 0.05 260) 0%, oklch(0.32 0.06 30) 120%)",
                  boxShadow: "0 20px 40px -20px oklch(0.1 0.03 250 / 0.6)",
                }}
              >
                <div
                  className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full opacity-40 blur-2xl"
                  style={{ background: "var(--coral)" }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl grid place-items-center"
                      style={{ background: "var(--gradient-coral)" }}
                    >
                      <Sparkles size={22} style={{ color: "var(--navy)" }} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-base flex items-center gap-2">
                        الإنماء إنسايتس
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                          style={{ background: "var(--coral)", color: "var(--navy)" }}
                        >
                          جديد
                        </span>
                      </div>
                      <div className="text-white/70 text-xs mt-0.5">
                        رؤى ذكية عن أموالك مدعومة بالذكاء الاصطناعي
                      </div>
                    </div>
                  </div>
                  <ArrowLeft size={20} className="text-white/70" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Quick actions */}
          <div className="flex justify-between pt-2">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <button key={a.label} className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-2xl grid place-items-center"
                      style={{ background: "var(--gradient-coral)" }}
                    >
                      <Icon size={24} style={{ color: "var(--navy)" }} strokeWidth={2} />
                    </div>
                    {a.badge && (
                      <span
                        className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full text-[10px] grid place-items-center font-bold"
                        style={{ background: "var(--coral)", color: "var(--navy)" }}
                      >
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-white/85 text-[11px] leading-tight text-center max-w-[70px]">
                    {a.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Promo banner */}
          <div
            className="rounded-3xl overflow-hidden mt-4 p-5 relative"
            style={{
              background:
                "linear-gradient(115deg, oklch(0.7 0.13 340) 0%, oklch(0.75 0.09 40) 100%)",
            }}
          >
            <div className="text-white text-lg font-bold text-right">أكثر</div>
            <div className="text-white text-2xl font-bold text-right mt-2">
              بنقطتين <span className="inline-block px-2 py-0.5 rounded-lg bg-white/20">خصم 20%</span>
            </div>
            <div className="text-white/90 text-xs text-right mt-2">
              + 10 نقاط إضافية في أكثر
            </div>
          </div>

          <div className="text-white text-sm text-right pt-2 opacity-70">
            اكتشف البطاقات...
          </div>
        </div>

        <div className="flex-1" />
        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
