import datasetJson from "../data/dataset.json";

export type Txn = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  currency: string;
  type: "Debit" | "Credit";
  category: string;
};

export type Subscription = {
  service: string;
  monthlyCost: number;
  annualCost: number;
  manageUrl: string;
};

export type Customer = {
  customerId: string;
  name: string;
  city: string;
  bank: string;
  occupation: string;
  monthlySalary: number;
  currentBalance: number;
  currency: string;
};

export type Dataset = {
  customer: Customer;
  transactions: Txn[];
  subscriptions: Subscription[];
  expectedAIInsights: string[];
};

export const dataset = datasetJson as unknown as Dataset;

// Give the customer an Arabic name matching reference (Yara)
dataset.customer.name = "يارا العتيبي";

export const CATEGORY_META: Record<
  string,
  { ar: string; color: string; icon: string }
> = {
  Coffee: { ar: "القهوة", color: "#F4A28C", icon: "☕" },
  Groceries: { ar: "البقالة", color: "#7ED4B5", icon: "🛒" },
  "Food Delivery": { ar: "توصيل الطعام", color: "#FF8B6B", icon: "🍔" },
  Utilities: { ar: "الفواتير", color: "#8DB4E8", icon: "💡" },
  Subscriptions: { ar: "الاشتراكات", color: "#C7A2E8", icon: "📺" },
  Electronics: { ar: "الإلكترونيات", color: "#F4D06F", icon: "💻" },
  Income: { ar: "الدخل", color: "#7ED4B5", icon: "💰" },
  Transportation: { ar: "المواصلات", color: "#8DB4E8", icon: "🚗" },
  Shopping: { ar: "التسوق", color: "#F4A28C", icon: "🛍️" },
  Other: { ar: "أخرى", color: "#B0B7C3", icon: "•" },
};

export const MERCHANT_META: Record<
  string,
  { logo: string; color: string; website?: string }
> = {
  Starbucks: { logo: "☕", color: "#00704A", website: "https://starbucks.com.sa" },
  Tamimi: { logo: "🛒", color: "#E4002B", website: "https://tamimimarkets.com" },
  Jahez: { logo: "🍔", color: "#FF3B30", website: "https://jahez.net" },
  STC: { logo: "📱", color: "#4F008C", website: "https://stc.com.sa" },
  "Saudi Electricity Company": { logo: "⚡", color: "#009FDA", website: "https://se.com.sa" },
  "National Water Company": { logo: "💧", color: "#00A9E0", website: "https://nwc.com.sa" },
  Extra: { logo: "🛍️", color: "#E30613", website: "https://extra.com" },
  Netflix: { logo: "N", color: "#E50914", website: "https://netflix.com" },
  Spotify: { logo: "♪", color: "#1DB954", website: "https://spotify.com" },
  Shahid: { logo: "S", color: "#5B2E91", website: "https://shahid.mbc.net" },
  "iCloud+": { logo: "", color: "#A2AAAD", website: "https://icloud.com" },
  "Google One": { logo: "G", color: "#4285F4", website: "https://one.google.com" },
  "Alinma Payroll": { logo: "ا", color: "#00A9A5", website: "https://alinma.com" },
};

export function fmtSAR(n: number, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ---------- Aggregations ----------

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function useComputed() {
  const txns = dataset.transactions;
  const parsed = txns.map((t) => ({ ...t, d: new Date(t.date) }));

  // Reference "current month" = latest month in dataset
  const maxDate = parsed.reduce(
    (m, t) => (t.d > m ? t.d : m),
    new Date(0),
  );
  const currentMonth = monthKey(maxDate);
  const prevD = new Date(maxDate);
  prevD.setMonth(prevD.getMonth() - 1);
  const prevMonth = monthKey(prevD);

  const inCurrent = parsed.filter((t) => monthKey(t.d) === currentMonth);
  const inPrev = parsed.filter((t) => monthKey(t.d) === prevMonth);

  const income = inCurrent
    .filter((t) => t.type === "Credit")
    .reduce((s, t) => s + t.amount, 0);
  const spending = inCurrent
    .filter((t) => t.type === "Debit")
    .reduce((s, t) => s + t.amount, 0);
  const prevSpending = inPrev
    .filter((t) => t.type === "Debit")
    .reduce((s, t) => s + t.amount, 0);

  // Category breakdown (current month debits)
  const byCategory: Record<string, number> = {};
  inCurrent
    .filter((t) => t.type === "Debit")
    .forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
  const categoryData = Object.entries(byCategory)
    .map(([name, value]) => ({
      name,
      value: Math.round(value),
      color: CATEGORY_META[name]?.color || "#B0B7C3",
      ar: CATEGORY_META[name]?.ar || name,
    }))
    .sort((a, b) => b.value - a.value);

  // Prev month categories for comparison
  const prevByCategory: Record<string, number> = {};
  inPrev
    .filter((t) => t.type === "Debit")
    .forEach((t) => {
      prevByCategory[t.category] = (prevByCategory[t.category] || 0) + t.amount;
    });

  // Monthly trend across all months
  const monthlyMap: Record<string, { income: number; spend: number }> = {};
  parsed.forEach((t) => {
    const k = monthKey(t.d);
    if (!monthlyMap[k]) monthlyMap[k] = { income: 0, spend: 0 };
    if (t.type === "Credit") monthlyMap[k].income += t.amount;
    else monthlyMap[k].spend += t.amount;
  });
  const monthlyTrend = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({
      month: k,
      label: monthLabelAr(k),
      income: Math.round(v.income),
      spend: Math.round(v.spend),
    }));

  // Weekly trend (last 8 weeks of current month range)
  const weeklyMap: Record<string, number> = {};
  inCurrent
    .filter((t) => t.type === "Debit")
    .forEach((t) => {
      const week = Math.ceil(t.d.getDate() / 7);
      const k = `الأسبوع ${week}`;
      weeklyMap[k] = (weeklyMap[k] || 0) + t.amount;
    });
  const weeklyTrend = Object.entries(weeklyMap).map(([week, amount]) => ({
    week,
    amount: Math.round(amount),
  }));

  // Top merchants (current month)
  const merchantMap: Record<string, { total: number; count: number }> = {};
  inCurrent
    .filter((t) => t.type === "Debit")
    .forEach((t) => {
      if (!merchantMap[t.merchant])
        merchantMap[t.merchant] = { total: 0, count: 0 };
      merchantMap[t.merchant].total += t.amount;
      merchantMap[t.merchant].count += 1;
    });
  const topMerchants = Object.entries(merchantMap)
    .map(([name, v]) => ({ name, total: Math.round(v.total), count: v.count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Weekday vs weekend
  let weekend = 0;
  let weekday = 0;
  inCurrent
    .filter((t) => t.type === "Debit")
    .forEach((t) => {
      const day = t.d.getDay(); // 0=Sun ... 5=Fri, 6=Sat -> weekend in KSA
      if (day === 5 || day === 6) weekend += t.amount;
      else weekday += t.amount;
    });

  // Largest purchase (all-time)
  const largest = parsed
    .filter((t) => t.type === "Debit")
    .reduce((m, t) => (t.amount > m.amount ? t : m), parsed[0]);

  // Most expensive day
  const dayMap: Record<string, number> = {};
  inCurrent
    .filter((t) => t.type === "Debit")
    .forEach((t) => {
      const k = t.date.slice(0, 10);
      dayMap[k] = (dayMap[k] || 0) + t.amount;
    });
  const mostExpensiveDay = Object.entries(dayMap).reduce(
    (m, [k, v]) => (v > m.amount ? { day: k, amount: v } : m),
    { day: "", amount: 0 },
  );

  // Favorite merchant by visits
  const favMerchant = Object.entries(merchantMap).reduce(
    (m, [k, v]) => (v.count > m.count ? { name: k, count: v.count } : m),
    { name: "", count: 0 },
  );

  // Coffee stats
  const coffee = inCurrent.filter((t) => t.category === "Coffee");
  const coffeeSpend = coffee.reduce((s, t) => s + t.amount, 0);

  const foodDelivery = byCategory["Food Delivery"] || 0;
  const prevFoodDelivery = prevByCategory["Food Delivery"] || 0;
  const foodDeliveryChange =
    prevFoodDelivery > 0
      ? ((foodDelivery - prevFoodDelivery) / prevFoodDelivery) * 100
      : 0;

  const subscriptionsMonthly = dataset.subscriptions.reduce(
    (s, x) => s + x.monthlyCost,
    0,
  );
  const subscriptionsAnnual = dataset.subscriptions.reduce(
    (s, x) => s + x.annualCost,
    0,
  );

  const remaining = income - spending;

  // Financial personality
  let personality = "المخطط المتوازن";
  let personalityIcon = "🎯";
  if (coffee.length > 15) {
    personality = "عاشق القهوة";
    personalityIcon = "☕";
  } else if (weekend > weekday * 1.4) {
    personality = "مستكشف نهاية الأسبوع";
    personalityIcon = "🌆";
  } else if (foodDelivery > 800) {
    personality = "عاشق الطعام";
    personalityIcon = "🍔";
  } else if (remaining > income * 0.4) {
    personality = "المدخر الذكي";
    personalityIcon = "💎";
  }

  return {
    currentMonth,
    prevMonth,
    income: Math.round(income),
    spending: Math.round(spending),
    prevSpending: Math.round(prevSpending),
    remaining: Math.round(remaining),
    savingsRate: income > 0 ? Math.round((remaining / income) * 100) : 0,
    categoryData,
    monthlyTrend,
    weeklyTrend,
    topMerchants,
    weekend: Math.round(weekend),
    weekday: Math.round(weekday),
    largest,
    mostExpensiveDay,
    favMerchant,
    coffeeCount: coffee.length,
    coffeeSpend: Math.round(coffeeSpend),
    foodDelivery: Math.round(foodDelivery),
    foodDeliveryChange: Math.round(foodDeliveryChange),
    subscriptionsMonthly,
    subscriptionsAnnual,
    personality,
    personalityIcon,
    currentMonthTxns: inCurrent.sort((a, b) => (a.d < b.d ? 1 : -1)),
  };
}

export function monthLabelAr(k: string) {
  const names = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const [_, m] = k.split("-");
  return names[parseInt(m, 10) - 1];
}

export function relativeDateAr(iso: string) {
  const d = new Date(iso);
  const now = new Date(dataset.transactions[dataset.transactions.length - 1].date);
  const diff = Math.floor((+now - +d) / 86400000);
  if (diff <= 0) return "اليوم";
  if (diff === 1) return "أمس";
  if (diff < 7) return `منذ ${diff} أيام`;
  return d.toLocaleDateString("ar-SA-u-ca-gregory", {
    month: "short",
    day: "numeric",
  });
}

// ---------- AI assistant mock ----------

export function aiRespond(prompt: string): string {
  const c = useComputed();
  const name = dataset.customer.name;
  const p = prompt.toLowerCase();

  if (p.includes("save") || p.includes("توفير") || p.includes("أوفر")) {
    const potential = Math.round(c.foodDelivery * 0.3 + c.coffeeSpend * 0.4);
    return `بناءً على تحليل إنفاقك يا ${name.split(" ")[0]}، يمكنك توفير حوالي **${potential} ريال** شهرياً عبر:\n\n• تقليل طلبات توصيل الطعام بنسبة 30% → توفير ${Math.round(c.foodDelivery * 0.3)} ريال\n• تحضير القهوة في المنزل مرتين أسبوعياً → توفير ${Math.round(c.coffeeSpend * 0.4)} ريال\n• مراجعة الاشتراكات غير المستخدمة → توفير حتى ${dataset.subscriptions[0].monthlyCost + dataset.subscriptions[2].monthlyCost} ريال\n\nهل تريد أن أنشئ لك هدف ادخار تلقائي؟`;
  }
  if (p.includes("summar") || p.includes("لخص") || p.includes("ملخص")) {
    return `**ملخص شهرك:**\n\n💰 الدخل: ${fmtSAR(c.income, 0)} ريال\n💸 الإنفاق: ${fmtSAR(c.spending, 0)} ريال\n✨ المتبقي: ${fmtSAR(c.remaining, 0)} ريال (معدل ادخار ${c.savingsRate}%)\n\n🏆 أعلى فئة إنفاق: ${CATEGORY_META[c.categoryData[0]?.name]?.ar} بـ ${fmtSAR(c.categoryData[0]?.value, 0)} ريال\n🛍️ التاجر المفضل: ${c.favMerchant.name} (${c.favMerchant.count} عملية)\n\nأداؤك المالي هذا الشهر ${c.savingsRate > 30 ? "ممتاز 🎉" : c.savingsRate > 15 ? "جيد 👍" : "يحتاج تحسين"}.`;
  }
  if (p.includes("subscription") || p.includes("اشتراك")) {
    return `لديك **${dataset.subscriptions.length} اشتراكات نشطة** بإجمالي ${c.subscriptionsMonthly} ريال شهرياً (${c.subscriptionsAnnual} ريال سنوياً):\n\n${dataset.subscriptions.map((s) => `• ${s.service} — ${s.monthlyCost} ريال/شهر`).join("\n")}\n\n💡 أنصح بمراجعة **Shahid** و **Google One** — لم ألاحظ نشاطاً يستدعي الاحتفاظ بهما.`;
  }
  if (p.includes("compar") || p.includes("قارن") || p.includes("الشهر الماضي")) {
    const diff = c.spending - c.prevSpending;
    const pct = c.prevSpending > 0 ? Math.round((diff / c.prevSpending) * 100) : 0;
    return `مقارنة إنفاقك:\n\n📊 هذا الشهر: **${fmtSAR(c.spending, 0)} ريال**\n📊 الشهر الماضي: ${fmtSAR(c.prevSpending, 0)} ريال\n${diff > 0 ? "📈" : "📉"} التغيير: ${diff > 0 ? "+" : ""}${pct}% (${diff > 0 ? "زيادة" : "توفير"} ${fmtSAR(Math.abs(diff), 0)} ريال)\n\n${diff > 0 ? "الزيادة الأكبر جاءت من فئة توصيل الطعام." : "أحسنت! استمر في هذا النمط."}`;
  }
  if (p.includes("categor") || p.includes("فئة") || p.includes("أعلى")) {
    const top = c.categoryData[0];
    return `أعلى فئة إنفاق لديك هي **${CATEGORY_META[top.name]?.ar}** بمبلغ ${fmtSAR(top.value, 0)} ريال، وتمثل ${Math.round((top.value / c.spending) * 100)}% من إجمالي إنفاقك الشهري.`;
  }
  if (p.includes("payday") || p.includes("راتب") || p.includes("قبل")) {
    return `لاحظت أن إنفاقك يرتفع في الأيام التي تسبق نزول الراتب — عادةً بسبب طلبات توصيل الطعام (${c.foodDelivery} ريال هذا الشهر). قد يساعدك تخصيص ميزانية أسبوعية ثابتة على تجنب هذا النمط.`;
  }
  if (p.includes("card") || p.includes("بطاقة") || p.includes("مرتبط")) {
    return `بطاقتك مرتبطة حالياً بـ **${dataset.subscriptions.length} خدمات رقمية**:\n\n${dataset.subscriptions.map((s) => `• ${s.service}`).join("\n")}\n\nيمكنك مراجعة وإدارة كل ارتباط من صفحة "البصمة الرقمية".`;
  }
  if (p.includes("goal") || p.includes("هدف") || p.includes("ادخار")) {
    return `رائع! بناءً على دخلك (${fmtSAR(c.income, 0)} ريال) وإنفاقك الحالي، أقترح هدف ادخار شهري بقيمة **${Math.round(c.income * 0.2)} ريال** (20% من الدخل). سأخصم المبلغ تلقائياً في بداية كل شهر إلى محفظتك الادخارية. هل توافق؟`;
  }
  if (p.includes("transaction") || p.includes("معاملة") || p.includes("عملية")) {
    const t = c.currentMonthTxns[0];
    return `آخر عملية: **${t.merchant}** بمبلغ ${fmtSAR(t.amount)} ريال بتاريخ ${relativeDateAr(t.date)}. الفئة: ${CATEGORY_META[t.category]?.ar}. النوع: خصم من الحساب الجاري.`;
  }
  return `أنا مساعدك المالي في الإنماء. يمكنني تحليل إنفاقك، اقتراح فرص التوفير، ومراجعة اشتراكاتك. جرّب أن تسألني: "كيف يمكنني توفير المزيد هذا الشهر؟"`;
}