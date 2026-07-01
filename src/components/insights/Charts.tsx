import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const tooltipStyle = {
  background: "oklch(0.22 0.04 250)",
  border: "1px solid oklch(0.35 0.04 250)",
  borderRadius: 12,
  padding: "8px 12px",
  fontSize: 12,
  color: "white",
  fontFamily: "inherit",
};

export function CategoryDonut({
  data,
  total,
}: {
  data: { name: string; value: number; color: string; ar: string }[];
  total: number;
}) {
  return (
    <div className="relative w-full h-56">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="ar"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={((v: unknown, _n: unknown, p: unknown) => [
              `${Number(v).toLocaleString()} ﷼`,
              (p as { payload?: { ar?: string } })?.payload?.ar,
            ]) as never}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-white/60 text-xs">الإجمالي</span>
        <span className="text-white text-xl font-semibold">
          {total.toLocaleString()} ﷼
        </span>
      </div>
    </div>
  );
}

export function IncomeExpensesBars({
  data,
}: {
  data: { label: string; income: number; spend: number }[];
}) {
  return (
    <div className="w-full h-56" dir="ltr">
      <ResponsiveContainer>
        <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 250)" vertical={false} />
          <XAxis dataKey="label" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.28 0.04 250 / 0.3)" }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "white" }} />
          <Bar dataKey="income" name="الدخل" fill="#7ED4B5" radius={[8, 8, 0, 0]} />
          <Bar dataKey="spend" name="الإنفاق" fill="#F4A28C" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyLine({
  data,
}: {
  data: { week: string; amount: number }[];
}) {
  return (
    <div className="w-full h-40" dir="ltr">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F4A28C" />
              <stop offset="100%" stopColor="#FF8B6B" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 250)" vertical={false} />
          <XAxis dataKey="week" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="url(#lg1)"
            strokeWidth={3}
            dot={{ r: 4, fill: "#F4A28C", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyTrendLine({
  data,
}: {
  data: { label: string; income: number; spend: number }[];
}) {
  return (
    <div className="w-full h-56" dir="ltr">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.03 250)" vertical={false} />
          <XAxis dataKey="label" stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="oklch(0.72 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "white" }} />
          <Line type="monotone" dataKey="income" name="الدخل" stroke="#7ED4B5" strokeWidth={3} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="spend" name="الإنفاق" stroke="#F4A28C" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}