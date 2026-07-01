import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Coffee,
  CreditCard,
  Radar,
  Film,
  Send,
  X,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  Sparkle,
} from "lucide-react";
import { PhoneFrame } from "@/components/PhoneFrame";
import {
  useComputed,
  dataset,
  fmtSAR,
  CATEGORY_META,
  MERCHANT_META,
  relativeDateAr,
  monthLabelAr,
  aiRespond,
} from "@/lib/insights-data";
import {
  CategoryDonut,
  IncomeExpensesBars,
  MonthlyTrendLine,
  WeeklyLine,
} from "@/components/insights/Charts";

export const Route = createFileRoute("/insights")({
  component: InsightsScreen,
  head: () => ({
    meta: [
      { title: "الإنماء إنسايتس — رؤى مالية ذكية" },
      {
        name: "description",
        content:
          "لوحة رؤى مالية ذكية داخل تطبيق مصرف الإنماء: تحليل الإنفاق، الاشتراكات، والمساعد المالي.",
      },
    ],
  }),
});

type Screen = "dashboard" | "subscriptions" | "footprint" | "wrapped";

function InsightsScreen() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [aiOpen, setAiOpen] = useState(false);
  const [wrappedOpen, setWrappedOpen] = useState(false);

  return (
    <PhoneFrame>
      <div className="flex flex-col min-h-screen relative">
        {/* Header */}
        <TopHeader screen={screen} onBackHome onScreen={setScreen} />

        <div className="flex-1 pb-28">
          <AnimatePresence mode="wait">
            {screen === "dashboard" && (
              <MotionScreen key="d">
                <Dashboard
                  onOpenScreen={setScreen}
                  onOpenAi={() => setAiOpen(true)}
                  onOpenWrapped={() => setWrappedOpen(true)}
                />
              </MotionScreen>
            )}
            {screen === "subscriptions" && (
              <MotionScreen key="s">
                <SubscriptionsScreen />
              </MotionScreen>
            )}
            {screen === "footprint" && (
              <MotionScreen key="f">
                <FootprintScreen />
              </MotionScreen>
            )}
          </AnimatePresence>
        </div>

        {/* Tab bar */}
        <InsightsTabs current={screen} onChange={setScreen} />

        {/* Floating AI FAB */}
        {!aiOpen && !wrappedOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
            onClick={() => setAiOpen(true)}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-[430px] w-full pointer-events-none"
          >
            <div className="flex justify-start pl-5 pointer-events-auto">
              <div
                className="w-14 h-14 rounded-2xl grid place-items-center shadow-xl relative"
                style={{
                  background: "var(--gradient-coral)",
                  boxShadow: "0 12px 30px -8px oklch(0.65 0.2 30 / 0.6)",
                }}
              >
                <Sparkles size={26} style={{ color: "var(--navy)" }} strokeWidth={2.5} />
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                  style={{ background: "#7ED4B5" }}
                />
              </div>
            </div>
          </motion.button>
        )}

        <AnimatePresence>
          {aiOpen && <AiAssistant onClose={() => setAiOpen(false)} />}
        </AnimatePresence>
        <AnimatePresence>
          {wrappedOpen && <MonthlyWrapped onClose={() => setWrappedOpen(false)} />}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}

function MotionScreen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function TopHeader({
  screen,
  onBackHome,
  onScreen,
}: {
  screen: Screen;
  onBackHome?: boolean;
  onScreen: (s: Screen) => void;
}) {
  const titles: Record<Screen, string> = {
    dashboard: "الإنماء إنسايتس",
    subscriptions: "الاشتراكات",
    footprint: "البصمة الرقمية",
    wrapped: "الملخص الشهري",
  };
  return (
    <div className="px-5 pt-4 pb-3">
      <div className="flex justify-between items-center text-xs text-white/90">
        <span className="font-semibold">15:27</span>
        <span className="tracking-widest">••••• 5G</span>
      </div>
      <div className="flex items-center justify-between mt-4">
        {screen === "dashboard" ? (
          <Link to="/" aria-label="رجوع">
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-white/5">
              <ArrowRight size={18} className="text-white" />
            </div>
          </Link>
        ) : (
          <button aria-label="رجوع" onClick={() => onScreen("dashboard")}>
            <div className="w-9 h-9 rounded-xl grid place-items-center bg-white/5">
              <ArrowRight size={18} className="text-white" />
            </div>
          </button>
        )}
        <h1 className="text-white text-base font-semibold flex items-center gap-2">
          {screen === "dashboard" && (
            <Sparkles size={16} style={{ color: "var(--coral)" }} />
          )}
          {titles[screen]}
        </h1>
        <div className="w-9 h-9" />
      </div>
    </div>
  );
}

function InsightsTabs({
  current,
  onChange,
}: {
  current: Screen;
  onChange: (s: Screen) => void;
}) {
  const tabs: { id: Screen; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "الرئيسية", icon: TrendingUp },
    { id: "subscriptions", label: "الاشتراكات", icon: Film },
    { id: "footprint", label: "البصمة", icon: Radar },
  ];
  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full border-t backdrop-blur-xl z-30"
      style={{
        background: "oklch(0.16 0.03 250 / 0.9)",
        borderColor: "oklch(0.32 0.03 250 / 0.6)",
      }}
    >
      <div className="flex justify-around items-center pt-3 pb-6 px-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = current === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="flex flex-col items-center gap-1 text-[11px] transition-transform active:scale-95"
              style={{ color: active ? "var(--coral)" : "oklch(0.72 0.02 250)" }}
            >
              <Icon size={22} strokeWidth={1.75} />
              <span className="font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// -------------------- DASHBOARD --------------------
function Dashboard({
  onOpenScreen,
  onOpenAi,
  onOpenWrapped,
}: {
  onOpenScreen: (s: Screen) => void;
  onOpenAi: () => void;
  onOpenWrapped: () => void;
}) {
  const c = useComputed();
  const customer = dataset.customer;
  const first = customer.name.split(" ")[0];

  return (
    <div className="px-5 space-y-5">
      {/* Greeting */}
      <div>
        <div className="text-white/70 text-sm">مساء الخير،</div>
        <div className="text-white text-2xl font-semibold mt-1">{first} 👋</div>
        <div className="text-white/60 text-xs mt-1">
          إليك ملخص شهر {monthLabelAr(c.currentMonth)} حتى الآن
        </div>
      </div>

      {/* AI Highlight */}
      <motion.button
        onClick={onOpenAi}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="w-full text-right"
      >
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(120deg, oklch(0.3 0.06 260) 0%, oklch(0.32 0.09 30) 100%)",
          }}
        >
          <div
            className="absolute -left-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-50"
            style={{ background: "var(--coral)" }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} style={{ color: "var(--coral)" }} />
              <span className="text-white/80 text-xs font-semibold">
                إضاءة اليوم من الذكاء الاصطناعي
              </span>
            </div>
            <p className="text-white text-[15px] leading-7">
              أنفقت <span className="font-bold">{fmtSAR(c.foodDelivery, 0)} ﷼</span> على توصيل
              الطعام هذا الشهر
              {c.foodDeliveryChange !== 0 && (
                <>
                  {" "}
                  ({c.foodDeliveryChange > 0 ? "+" : ""}
                  {c.foodDeliveryChange}% مقارنة بالشهر الماضي)
                </>
              )}
              . بتقليل الطلبات بنسبة 30% يمكنك توفير حوالي{" "}
              <span className="font-bold" style={{ color: "var(--coral)" }}>
                {Math.round(c.foodDelivery * 0.3)} ﷼
              </span>{" "}
              شهرياً.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-white/80">
              <span>اسأل المساعد الذكي</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </motion.button>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="الرصيد الحالي"
          value={fmtSAR(customer.currentBalance)}
          icon={Wallet}
          delay={0.1}
        />
        <StatCard
          label="الدخل الشهري"
          value={fmtSAR(c.income, 0)}
          icon={TrendingUp}
          accent="#7ED4B5"
          delay={0.15}
        />
        <StatCard
          label="الإنفاق الشهري"
          value={fmtSAR(c.spending, 0)}
          icon={TrendingDown}
          accent="#F4A28C"
          delay={0.2}
        />
        <StatCard
          label="المتبقي من الميزانية"
          value={fmtSAR(c.remaining, 0)}
          icon={PiggyBank}
          accent="var(--coral)"
          delay={0.25}
          hint={`معدل الادخار ${c.savingsRate}%`}
        />
      </div>

      {/* Cashflow bar */}
      <Card delay={0.3}>
        <div className="flex justify-between items-center mb-3">
          <div className="text-white font-semibold">التدفق النقدي</div>
          <div className="text-white/60 text-xs">
            {monthLabelAr(c.currentMonth)}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mb-2 text-white/70">
          <span>الدخل {fmtSAR(c.income, 0)} ﷼</span>
          <span>الإنفاق {fmtSAR(c.spending, 0)} ﷼</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden bg-white/5 flex" dir="ltr">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (c.spending / c.income) * 100)}%` }}
            transition={{ duration: 1, delay: 0.4 }}
            style={{ background: "linear-gradient(90deg,#F4A28C,#FF8B6B)" }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, 100 - (c.spending / c.income) * 100)}%` }}
            transition={{ duration: 1, delay: 0.6 }}
            style={{ background: "linear-gradient(90deg,#7ED4B5,#5FBF97)" }}
          />
        </div>
      </Card>

      {/* Category donut */}
      <Card delay={0.35}>
        <div className="flex justify-between items-center mb-2">
          <div className="text-white font-semibold">الإنفاق حسب الفئة</div>
          <div className="text-white/50 text-xs">هذا الشهر</div>
        </div>
        <CategoryDonut data={c.categoryData} total={c.spending} />
        <div className="grid grid-cols-2 gap-2 mt-2">
          {c.categoryData.slice(0, 6).map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-white/85 flex-1">{d.ar}</span>
              <span className="text-white/60">{fmtSAR(d.value, 0)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Insight card 2 */}
      <InsightCard
        icon={Coffee}
        text={`مشتريات القهوة تحدث تقريباً كل صباح من أيام الأسبوع (${c.coffeeCount} مرة هذا الشهر، بمعدل ${fmtSAR(c.coffeeSpend / Math.max(c.coffeeCount, 1))} ﷼ للمرة).`}
      />

      {/* Income vs Expenses */}
      <Card delay={0.4}>
        <div className="flex justify-between items-center mb-3">
          <div className="text-white font-semibold">الدخل مقابل الإنفاق</div>
          <div className="text-white/50 text-xs">آخر الأشهر</div>
        </div>
        <IncomeExpensesBars data={c.monthlyTrend} />
      </Card>

      {/* Weekly trend */}
      <Card delay={0.42}>
        <div className="flex justify-between items-center mb-3">
          <div className="text-white font-semibold">اتجاه الإنفاق الأسبوعي</div>
          <div className="text-white/50 text-xs">{monthLabelAr(c.currentMonth)}</div>
        </div>
        <WeeklyLine data={c.weeklyTrend} />
      </Card>

      {/* Monthly trend */}
      <Card delay={0.44}>
        <div className="flex justify-between items-center mb-3">
          <div className="text-white font-semibold">اتجاه الإنفاق الشهري</div>
        </div>
        <MonthlyTrendLine data={c.monthlyTrend} />
      </Card>

      {/* Weekend vs weekday */}
      <InsightCard
        icon={TrendingUp}
        text={`إنفاقك في نهاية الأسبوع (${fmtSAR(c.weekend, 0)} ﷼) ${c.weekend > c.weekday ? "أعلى من" : "أقل من"} إنفاقك في أيام الأسبوع (${fmtSAR(c.weekday, 0)} ﷼).`}
      />

      {/* Top merchants */}
      <Card delay={0.5}>
        <div className="flex justify-between items-center mb-3">
          <div className="text-white font-semibold">أعلى التجار</div>
          <div className="text-white/50 text-xs">هذا الشهر</div>
        </div>
        <div className="space-y-3">
          {c.topMerchants.map((m, i) => {
            const meta = MERCHANT_META[m.name];
            const max = c.topMerchants[0].total;
            return (
              <div key={m.name}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl grid place-items-center text-white font-bold text-sm shrink-0"
                    style={{ background: meta?.color || "#666" }}
                  >
                    {meta?.logo || m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium">{m.name}</div>
                    <div className="text-white/50 text-xs">{m.count} عملية</div>
                  </div>
                  <div className="text-white text-sm font-semibold">
                    {fmtSAR(m.total, 0)} ﷼
                  </div>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden" dir="ltr">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.total / max) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                    className="h-full"
                    style={{ background: meta?.color || "var(--coral)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent transactions */}
      <Card delay={0.55}>
        <div className="flex justify-between items-center mb-3">
          <div className="text-white font-semibold">المعاملات الأخيرة</div>
          <button className="text-xs" style={{ color: "var(--coral)" }}>
            عرض الكل
          </button>
        </div>
        <div className="space-y-1">
          {c.currentMonthTxns.slice(0, 6).map((t) => (
            <TransactionRow key={t.id} t={t} />
          ))}
        </div>
      </Card>

      {/* Upcoming subscriptions */}
      <Card delay={0.6}>
        <div className="flex justify-between items-center mb-3">
          <div className="text-white font-semibold">الاشتراكات القادمة</div>
          <button
            className="text-xs"
            style={{ color: "var(--coral)" }}
            onClick={() => onOpenScreen("subscriptions")}
          >
            إدارة
          </button>
        </div>
        <div className="space-y-2">
          {dataset.subscriptions.slice(0, 3).map((s) => {
            const meta = MERCHANT_META[s.service];
            return (
              <div key={s.service} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl grid place-items-center text-white font-bold"
                  style={{ background: meta?.color || "#666" }}
                >
                  {meta?.logo || s.service[0]}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm">{s.service}</div>
                  <div className="text-white/50 text-xs">التجديد خلال أيام</div>
                </div>
                <div className="text-white text-sm font-semibold">
                  {s.monthlyCost} ﷼
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick AI suggestions */}
      <div>
        <div className="text-white/70 text-xs mb-2 font-semibold">
          اقتراحات ذكية سريعة
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            "كيف يمكنني توفير المال؟",
            "لخّص إنفاقي هذا الشهر",
            "قارن هذا الشهر بالسابق",
            "أي اشتراكات يجب أن أراجعها؟",
          ].map((q) => (
            <button
              key={q}
              onClick={onOpenAi}
              className="text-right p-3 rounded-2xl text-xs text-white/90 transition-colors active:scale-95"
              style={{
                background: "oklch(0.26 0.04 250 / 0.7)",
                border: "1px solid oklch(0.32 0.04 250)",
              }}
            >
              <MessageCircle size={14} className="mb-1.5" style={{ color: "var(--coral)" }} />
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Wrapped preview */}
      <motion.button
        onClick={onOpenWrapped}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full text-right"
      >
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.35 0.15 320) 0%, oklch(0.4 0.16 30) 100%)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl grid place-items-center text-2xl"
              style={{ background: "white/20", backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Play size={26} className="text-white fill-white" />
            </div>
            <div className="flex-1">
              <div className="text-white/80 text-xs">جديد</div>
              <div className="text-white font-bold text-lg">
                ملخص شهر {monthLabelAr(c.currentMonth)}
              </div>
              <div className="text-white/80 text-xs mt-0.5">
                شاهد رحلتك المالية في قصة تفاعلية
              </div>
            </div>
            <ArrowRight size={20} className="text-white" />
          </div>
        </div>
      </motion.button>
    </div>
  );
}

function Card({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-3xl p-4"
      style={{
        background: "oklch(0.24 0.04 250 / 0.7)",
        border: "1px solid oklch(0.32 0.03 250 / 0.6)",
        boxShadow: "0 8px 24px -12px oklch(0.1 0.02 250 / 0.6)",
      }}
    >
      {children}
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "white",
  hint,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent?: string;
  hint?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl p-4"
      style={{
        background: "oklch(0.24 0.04 250 / 0.7)",
        border: "1px solid oklch(0.32 0.03 250 / 0.6)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-white/60 text-xs">{label}</div>
        <Icon size={16} style={{ color: accent }} />
      </div>
      <CountUp value={value} className="text-white text-lg font-semibold mt-2 block" />
      {hint && <div className="text-[10px] text-white/50 mt-1">{hint}</div>}
    </motion.div>
  );
}

function CountUp({ value, className }: { value: string; className?: string }) {
  // For simplicity, static; animate opacity
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {value} <span className="text-white/50 text-sm">﷼</span>
    </motion.span>
  );
}

function InsightCard({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl p-4 flex gap-3 items-start"
      style={{
        background: "linear-gradient(120deg, oklch(0.24 0.05 260 / 0.8), oklch(0.26 0.05 30 / 0.5))",
        border: "1px solid oklch(0.4 0.06 30 / 0.4)",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
        style={{ background: "var(--gradient-coral)" }}
      >
        <Icon size={18} style={{ color: "var(--navy)" }} />
      </div>
      <div className="text-white text-sm leading-6">{text}</div>
    </motion.div>
  );
}

function TransactionRow({ t }: { t: import("@/lib/insights-data").Txn }) {
  const meta = MERCHANT_META[t.merchant];
  const catMeta = CATEGORY_META[t.category];
  const isCredit = t.type === "Credit";
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-10 h-10 rounded-xl grid place-items-center text-white font-bold shrink-0"
        style={{ background: meta?.color || catMeta?.color || "#666" }}
      >
        {meta?.logo || catMeta?.icon || t.merchant[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm truncate">{t.merchant}</div>
        <div className="text-white/50 text-[11px] flex items-center gap-1.5">
          <span>{catMeta?.ar || t.category}</span>
          <span>•</span>
          <span>{relativeDateAr(t.date)}</span>
          <span>•</span>
          <CreditCard size={10} />
        </div>
      </div>
      <div
        className="text-sm font-semibold"
        style={{ color: isCredit ? "#7ED4B5" : "white" }}
      >
        {isCredit ? "+" : "-"} {fmtSAR(t.amount)} ﷼
      </div>
    </div>
  );
}

// -------------------- SUBSCRIPTIONS --------------------
function SubscriptionsScreen() {
  const c = useComputed();
  const potential = 66;
  return (
    <div className="px-5 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="شهرياً" value={`${c.subscriptionsMonthly} ﷼`} />
        <MiniStat label="سنوياً" value={`${c.subscriptionsAnnual} ﷼`} />
        <MiniStat
          label="وفر محتمل"
          value={`${potential} ﷼`}
          accent="var(--coral)"
        />
      </div>
      <InsightCard
        icon={Sparkles}
        text={`يبدو أن اشتراك Shahid و Google One غير مستخدمين بشكل نشط. مراجعتهما يمكن أن توفر لك ${potential} ﷼ شهرياً.`}
      />
      <div className="space-y-3">
        {dataset.subscriptions.map((s, i) => {
          const meta = MERCHANT_META[s.service];
          const inactive = s.service === "Shahid" || s.service === "Google One";
          return (
            <motion.div
              key={s.service}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl p-4"
              style={{
                background: "oklch(0.24 0.04 250 / 0.7)",
                border: "1px solid oklch(0.32 0.03 250 / 0.6)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl grid place-items-center text-white text-lg font-bold"
                  style={{ background: meta?.color || "#666" }}
                >
                  {meta?.logo || s.service[0]}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{s.service}</div>
                  <div className="text-white/50 text-xs mt-0.5">
                    التجديد التالي: 5 من الشهر القادم
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-white font-bold">{s.monthlyCost} ﷼</div>
                  <div className="text-white/50 text-[10px]">شهرياً</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <MiniField label="شهرياً" value={`${s.monthlyCost} ﷼`} />
                <MiniField label="سنوياً" value={`${s.annualCost} ﷼`} />
                <MiniField
                  label="الحالة"
                  value={inactive ? "غير نشط" : "نشط"}
                  accent={inactive ? "#FFB347" : "#7ED4B5"}
                />
              </div>
              <div
                className="mt-3 text-xs p-3 rounded-xl"
                style={{
                  background: inactive
                    ? "oklch(0.32 0.09 60 / 0.25)"
                    : "oklch(0.32 0.05 160 / 0.2)",
                  color: inactive ? "#FFCB8A" : "#A5E5C8",
                }}
              >
                {inactive
                  ? "لم نلاحظ استخداماً مؤخراً. يمكنك إيقاف الاشتراك مؤقتاً."
                  : "الاشتراك مستخدم بانتظام. لا حاجة لإجراء."}
              </div>
              <a
                href={s.manageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm"
                style={{ background: "var(--gradient-coral)", color: "var(--navy)" }}
              >
                إدارة الاشتراك
                <ExternalLink size={14} />
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl p-3 text-center"
      style={{
        background: "oklch(0.24 0.04 250 / 0.7)",
        border: "1px solid oklch(0.32 0.03 250 / 0.6)",
      }}
    >
      <div className="text-white/60 text-[11px]">{label}</div>
      <div
        className="text-base font-bold mt-1"
        style={{ color: accent || "white" }}
      >
        {value}
      </div>
    </div>
  );
}
function MiniField({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl py-2" style={{ background: "oklch(0.2 0.03 250 / 0.6)" }}>
      <div className="text-white/50 text-[10px]">{label}</div>
      <div className="text-xs font-semibold" style={{ color: accent || "white" }}>
        {value}
      </div>
    </div>
  );
}

// -------------------- FOOTPRINT --------------------
function FootprintScreen() {
  const merchants = [
    { name: "Amazon.sa", logo: "a", color: "#FF9900", last: "منذ 12 يوم" },
    { name: "Noon", logo: "n", color: "#FEEE00", last: "منذ 5 أيام", darkText: true },
    { name: "Netflix", logo: "N", color: "#E50914", last: "أمس" },
    { name: "Spotify", logo: "♪", color: "#1DB954", last: "أمس" },
    { name: "Apple", logo: "", color: "#A2AAAD", last: "منذ يومين" },
    { name: "Google", logo: "G", color: "#4285F4", last: "منذ 3 أيام" },
    { name: "Uber", logo: "U", color: "#000000", last: "منذ 20 يوم" },
    { name: "Careem", logo: "K", color: "#00C389", last: "منذ 30 يوم" },
  ];
  return (
    <div className="px-5 space-y-4">
      <InsightCard
        icon={Radar}
        text="اكتشفنا 8 تجار يبدو أن بطاقتك محفوظة لديهم. راجع الوصول واحذف ما لا تستخدمه لتعزيز أمانك المالي."
      />
      <div className="grid grid-cols-1 gap-3">
        {merchants.map((m, i) => {
          const inactive = m.last.includes("20") || m.last.includes("30");
          return (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-3xl p-4"
              style={{
                background: "oklch(0.24 0.04 250 / 0.7)",
                border: "1px solid oklch(0.32 0.03 250 / 0.6)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl grid place-items-center text-lg font-bold"
                  style={{
                    background: m.color,
                    color: m.darkText ? "black" : "white",
                  }}
                >
                  {m.logo}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{m.name}</div>
                  <div className="text-white/50 text-xs mt-0.5">
                    آخر عملية: {m.last}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: inactive ? "#FFB347" : "#7ED4B5" }}
                    />
                    <span className="text-[10px] text-white/60">
                      البطاقة مرتبطة
                    </span>
                  </div>
                </div>
              </div>
              {inactive && (
                <div
                  className="mt-3 text-xs p-2.5 rounded-xl"
                  style={{
                    background: "oklch(0.32 0.09 60 / 0.25)",
                    color: "#FFCB8A",
                  }}
                >
                  لم تشترِ من هذا التاجر مؤخراً. ننصح بمراجعة طرق الدفع المحفوظة.
                </div>
              )}
              <a
                href={`https://${m.name.toLowerCase()}.com`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-medium text-xs border"
                style={{
                  borderColor: "oklch(0.4 0.03 250)",
                  color: "white",
                }}
              >
                فتح الموقع <ExternalLink size={12} />
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------- AI ASSISTANT --------------------
type Msg = { role: "user" | "ai"; text: string };

function AiAssistant({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: `مرحباً ${dataset.customer.name.split(" ")[0]} 👋 أنا مساعدك المالي في الإنماء. كيف يمكنني مساعدتك اليوم؟`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = aiRespond(text);
      setTyping(false);
      setMsgs((m) => [...m, { role: "ai", text: reply }]);
    }, 900);
  };

  const suggestions = [
    "كيف يمكنني توفير المال هذا الشهر؟",
    "لخّص إنفاقي",
    "أي اشتراكات يجب أن أراجعها؟",
    "قارن هذا الشهر بالسابق",
    "ما هي أعلى فئة إنفاق لدي؟",
    "ساعدني في إنشاء هدف ادخار",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-center"
      style={{ background: "oklch(0.1 0.02 250 / 0.6)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        className="w-full max-w-[430px] h-[90vh] mt-auto rounded-t-3xl flex flex-col"
        style={{
          background: "linear-gradient(180deg, oklch(0.22 0.05 260) 0%, oklch(0.16 0.03 250) 100%)",
          border: "1px solid oklch(0.32 0.04 250)",
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "oklch(0.3 0.03 250)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl grid place-items-center"
              style={{ background: "var(--gradient-coral)" }}
            >
              <Sparkles size={20} style={{ color: "var(--navy)" }} />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">مساعد الإنماء الذكي</div>
              <div className="flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-white/60">متصل • مدعوم بالذكاء الاصطناعي</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-full bg-white/10">
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((m, i) => (
            <MessageBubble key={i} msg={m} />
          ))}
          {typing && (
            <div className="flex gap-1 items-center px-4 py-3 rounded-2xl w-fit" style={{ background: "oklch(0.28 0.04 250)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0.1s" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
          )}
        </div>

        {msgs.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="text-white/50 text-[11px] mb-2">أسئلة مقترحة</div>
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="shrink-0 text-xs px-3 py-2 rounded-full text-white/90"
                  style={{
                    background: "oklch(0.3 0.05 260 / 0.6)",
                    border: "1px solid oklch(0.4 0.06 260 / 0.5)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="p-4 flex gap-2 border-t"
          style={{ borderColor: "oklch(0.3 0.03 250)" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل عن أموالك..."
            className="flex-1 rounded-full px-4 py-3 text-sm text-white outline-none"
            style={{
              background: "oklch(0.28 0.04 250)",
              border: "1px solid oklch(0.36 0.04 250)",
            }}
          />
          <button
            type="submit"
            className="w-12 h-12 rounded-full grid place-items-center shrink-0"
            style={{ background: "var(--gradient-coral)", color: "var(--navy)" }}
          >
            <Send size={18} />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isAi = msg.role === "ai";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAi ? "justify-start" : "justify-end"}`}
    >
      <div
        className="max-w-[85%] px-4 py-3 text-sm text-white whitespace-pre-line leading-6"
        style={{
          background: isAi
            ? "oklch(0.28 0.04 250)"
            : "var(--gradient-coral)",
          color: isAi ? "white" : "var(--navy)",
          borderRadius: isAi ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
        }}
      >
        {msg.text.split("**").map((chunk, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="font-bold">
              {chunk}
            </strong>
          ) : (
            <span key={i}>{chunk}</span>
          ),
        )}
      </div>
    </motion.div>
  );
}

// -------------------- MONTHLY WRAPPED --------------------
function MonthlyWrapped({ onClose }: { onClose: () => void }) {
  const c = useComputed();
  const [i, setI] = useState(0);
  const stories = [
    {
      bg: "linear-gradient(135deg, oklch(0.3 0.15 30) 0%, oklch(0.4 0.15 340) 100%)",
      title: "شهر مذهل",
      subtitle: `ملخص ${monthLabelAr(c.currentMonth)}`,
      big: `${fmtSAR(c.spending, 0)} ﷼`,
      caption: "إجمالي إنفاقك هذا الشهر",
    },
    {
      bg: "linear-gradient(135deg, oklch(0.35 0.13 160) 0%, oklch(0.3 0.12 220) 100%)",
      title: "الدخل",
      subtitle: "استلمت",
      big: `${fmtSAR(c.income, 0)} ﷼`,
      caption: `ووفّرت ${c.savingsRate}% منه`,
    },
    {
      bg: "linear-gradient(135deg, oklch(0.35 0.15 20) 0%, oklch(0.3 0.15 60) 100%)",
      title: "أكبر عملية",
      subtitle: c.largest?.merchant,
      big: `${fmtSAR(c.largest?.amount || 0, 0)} ﷼`,
      caption: "أعلى عملية شراء لديك",
    },
    {
      bg: "linear-gradient(135deg, oklch(0.35 0.12 280) 0%, oklch(0.3 0.14 320) 100%)",
      title: "التاجر المفضل",
      subtitle: "زرته أكثر من غيره",
      big: c.favMerchant.name,
      caption: `${c.favMerchant.count} عملية هذا الشهر`,
    },
    {
      bg: "linear-gradient(135deg, oklch(0.35 0.12 40) 0%, oklch(0.3 0.14 20) 100%)",
      title: "☕ قهوتك",
      subtitle: "الطقس الصباحي",
      big: `${c.coffeeCount} قهوة`,
      caption: `أنفقت ${fmtSAR(c.coffeeSpend, 0)} ﷼ على القهوة`,
    },
    {
      bg: "linear-gradient(135deg, oklch(0.3 0.14 220) 0%, oklch(0.4 0.13 260) 100%)",
      title: "الفئة الأولى",
      subtitle: "أعلى فئة إنفاق",
      big: CATEGORY_META[c.categoryData[0]?.name]?.ar || "-",
      caption: `${fmtSAR(c.categoryData[0]?.value || 0, 0)} ﷼`,
    },
    {
      bg: "linear-gradient(135deg, oklch(0.35 0.12 340) 0%, oklch(0.3 0.15 30) 100%)",
      title: "نهاية الأسبوع vs الأسبوع",
      subtitle: "متى تنفق أكثر؟",
      big: c.weekend > c.weekday ? "نهاية الأسبوع 🌆" : "أيام الأسبوع 💼",
      caption: `${fmtSAR(c.weekend, 0)} ﷼ مقابل ${fmtSAR(c.weekday, 0)} ﷼`,
    },
    {
      bg: "linear-gradient(135deg, oklch(0.4 0.15 30) 0%, oklch(0.35 0.15 340) 100%)",
      title: "شخصيتك المالية",
      subtitle: "بناءً على أنماط إنفاقك",
      big: `${c.personalityIcon} ${c.personality}`,
      caption: "أنت مميز في التوازن بين الإنفاق والادخار",
    },
    {
      bg: "linear-gradient(135deg, oklch(0.35 0.15 160) 0%, oklch(0.3 0.14 30) 100%)",
      title: "توصية الإنماء الذكية",
      subtitle: "لتحسين شهرك القادم",
      big: `وفّر ${Math.round(c.foodDelivery * 0.3 + c.coffeeSpend * 0.4)} ﷼`,
      caption:
        "بتقليل توصيل الطعام 30% وتحضير القهوة أحياناً في المنزل. هيا نبدأ! 🎉",
    },
  ];

  useEffect(() => {
    const t = setTimeout(() => {
      if (i < stories.length - 1) setI(i + 1);
    }, 4200);
    return () => clearTimeout(t);
  }, [i, stories.length]);

  const story = stories[i];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-center"
    >
      <div className="relative w-full max-w-[430px] h-full flex flex-col" style={{ background: story.bg }}>
        {/* Progress */}
        <div className="flex gap-1 p-3 pt-6">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: idx < i ? "100%" : "0%" }}
                animate={{ width: idx <= i ? "100%" : "0%" }}
                transition={{ duration: idx === i ? 4 : 0 }}
                className="h-full bg-white"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2 text-white">
            <Sparkle size={16} />
            <span className="text-xs font-semibold">الإنماء إنسايتس • ملخص شهرك</span>
          </div>
          <button onClick={onClose} className="w-9 h-9 grid place-items-center rounded-full bg-white/15">
            <X size={18} className="text-white" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col justify-center items-center text-center px-8"
          >
            <div className="text-white/80 text-sm font-medium">{story.subtitle}</div>
            <div className="text-white text-3xl font-bold mt-3">{story.title}</div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-5xl font-black mt-8 leading-tight"
            >
              {story.big}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-white/85 text-base mt-6 max-w-xs"
            >
              {story.caption}
            </motion.div>

            {i === stories.length - 1 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={onClose}
                className="mt-10 px-6 py-3 rounded-full font-semibold text-sm"
                style={{ background: "white", color: "var(--navy)" }}
              >
                ابدأ هدف الادخار ✨
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tap zones */}
        <button
          className="absolute inset-y-0 left-0 w-1/3"
          onClick={() => setI(Math.max(0, i - 1))}
          aria-label="السابق"
        />
        <button
          className="absolute inset-y-0 right-0 w-1/3"
          onClick={() => setI(Math.min(stories.length - 1, i + 1))}
          aria-label="التالي"
        />

        <div className="flex justify-between items-center px-6 pb-6 text-white/70 text-xs">
          <button onClick={() => setI(Math.max(0, i - 1))} className="flex items-center gap-1">
            <ChevronRight size={16} /> السابق
          </button>
          <span>{i + 1} / {stories.length}</span>
          <button onClick={() => setI(Math.min(stories.length - 1, i + 1))} className="flex items-center gap-1">
            التالي <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}