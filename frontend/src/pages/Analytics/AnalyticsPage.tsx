import { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { TrendingUpIcon, TrendingDownIcon, CalendarIcon } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { CATEGORIES } from '../../constants/categories';

type Period = 'week' | 'month' | 'year';

// Mock data for analytics
const MOCK_CATEGORY_DATA = [
  { id: 'food', amount: 54000 },
  { id: 'transport', amount: 28500 },
  { id: 'entertainment', amount: 12000 },
  { id: 'shopping', amount: 41200 },
  { id: 'health', amount: 5200 },
  { id: 'housing', amount: 65000 },
  { id: 'subscriptions', amount: 8900 },
];

const MOCK_WEEKLY_DATA = [
  { name: 'Пн', amount: 12500 },
  { name: 'Вт', amount: 8300 },
  { name: 'Ср', amount: 15700 },
  { name: 'Чт', amount: 6400 },
  { name: 'Пт', amount: 22100 },
  { name: 'Сб', amount: 18900 },
  { name: 'Вс', amount: 9600 },
];

const MOCK_MONTHLY_DATA = [
  { name: 'Янв', amount: 185000 },
  { name: 'Фев', amount: 162000 },
  { name: 'Мар', amount: 214800 },
  { name: 'Апр', amount: 198000 },
  { name: 'Май', amount: 175000 },
  { name: 'Июн', amount: 210000 },
];

const CHART_COLORS = [
  '#22c55e', '#3b82f6', '#a855f7', '#f97316',
  '#ef4444', '#eab308', '#8b5cf6', '#06b6d4', '#6b7280',
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month');

  const pieData = useMemo(() => 
    MOCK_CATEGORY_DATA.map(item => {
      const cat = CATEGORIES.find(c => c.id === item.id);
      return {
        name: cat?.label || 'Другое',
        value: item.amount,
        color: cat?.color || '#6b7280',
      };
    }).sort((a, b) => b.value - a.value),
    []
  );

  const totalSpent = useMemo(() => 
    MOCK_CATEGORY_DATA.reduce((s, d) => s + d.amount, 0), []
  );

  const barData = period === 'week' ? MOCK_WEEKLY_DATA : MOCK_MONTHLY_DATA;

  const periods: { key: Period; label: string }[] = [
    { key: 'week', label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
    { key: 'year', label: 'Год' },
  ];

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader title="Аналитика" />

      {/* Period Selector */}
      <div className="mx-4 flex rounded-2xl bg-muted p-1">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
              period === p.key 
                ? 'bg-card text-foreground shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="mx-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDownIcon size={16} className="text-destructive" />
            </div>
            <span className="text-xs text-muted-foreground">Расходы</span>
          </div>
          <p className="text-xl font-bold">{totalSpent.toLocaleString('ru-RU')} ₸</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUpIcon size={16} className="text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">vs прошлый</span>
          </div>
          <p className="text-xl font-bold text-primary">-12%</p>
        </div>
      </div>

      {/* Bar Chart - Spending Over Time */}
      <div className="mx-4 rounded-3xl bg-card border border-border/50 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-muted-foreground" />
          <h3 className="font-semibold">Динамика расходов</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={period === 'week' ? 28 : 20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={35}
              />
              <Tooltip 
                formatter={(value: unknown) => {
                  const numValue = value as number;
                  return [`${numValue?.toLocaleString('ru-RU')} ₸`, 'Расходы'];
                }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - By Category */}
      <div className="mx-4 rounded-3xl bg-card border border-border/50 p-5 space-y-4">
        <h3 className="font-semibold">По категориям</h3>
        
        <div className="flex items-center gap-4">
          <div className="relative size-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground">Всего</span>
              <span className="text-sm font-bold">{(totalSpent / 1000).toFixed(0)}k ₸</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2.5">
            {pieData.slice(0, 5).map((item, i) => {
              const pct = Math.round((item.value / totalSpent) * 100);
              return (
                <div key={item.name} className="flex items-center gap-2.5">
                  <div 
                    className="size-2.5 shrink-0 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} 
                  />
                  <span className="flex-1 text-xs truncate">{item.name}</span>
                  <span className="text-xs font-medium tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Categories List */}
      <div className="mx-4 space-y-2">
        <h3 className="font-semibold px-1">Топ расходов</h3>
        {pieData.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3 rounded-2xl bg-card border border-border/50 p-3.5">
            <div 
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + '18' }}
            >
              <span className="text-base font-bold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                {i + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.name}</p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ 
                    width: `${(item.value / pieData[0].value) * 100}%`,
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  }} 
                />
              </div>
            </div>
            <p className="font-semibold text-sm tabular-nums">{item.value.toLocaleString('ru-RU')} ₸</p>
          </div>
        ))}
      </div>
    </div>
  );
}
