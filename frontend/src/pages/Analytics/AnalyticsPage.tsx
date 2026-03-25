import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { TrendingUpIcon, TrendingDownIcon, CalendarIcon } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { CATEGORIES } from '../../constants/categories';
import { useExpenses } from '../../hooks/useExpenses';
import { Spinner } from '../../components/ui/spinner';

type Period = 'week' | 'month' | 'year';

const CHART_COLORS = [
  '#22c55e', '#3b82f6', '#a855f7', '#f97316',
  '#ef4444', '#eab308', '#8b5cf6', '#06b6d4', '#6b7280',
];

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { expenses, isLoading } = useExpenses();
  const [period, setPeriod] = useState<Period>('month');

  const categoryData = useMemo(() => {
    const currentDate = new Date();
    let filteredExpenses = expenses;

    if (period === 'week') {
      const weekAgo = new Date(currentDate);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredExpenses = expenses.filter(e => new Date(e.date) >= weekAgo);
    } else if (period === 'month') {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      filteredExpenses = expenses.filter(e => new Date(e.date) >= monthStart);
    } else if (period === 'year') {
      const yearStart = new Date(currentDate.getFullYear(), 0, 1);
      filteredExpenses = expenses.filter(e => new Date(e.date) >= yearStart);
    }

    const byCategory: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      byCategory[exp.category_id] = (byCategory[exp.category_id] || 0) + exp.amount;
    });

    return Object.entries(byCategory)
      .map(([id, amount]) => ({
        id,
        name: t(`categories.${id}`),
        value: amount,
        color: CATEGORIES.find(c => c.id === id)?.color || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, period, t]);

  const totalSpent = useMemo(() => 
    categoryData.reduce((s, d) => s + d.value, 0),
    [categoryData]
  );

  const lastMonthTotal = useMemo(() => {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        return d >= lastMonthStart && d <= lastMonthEnd;
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const percentChange = lastMonthTotal > 0 
    ? Math.round(((totalSpent - lastMonthTotal) / lastMonthTotal) * 100)
    : 0;

  const weeklyData = useMemo(() => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const result = days.map(day => ({ name: t(`time.${day}`), amount: 0 }));
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    expenses
      .filter(e => new Date(e.date) >= weekAgo)
      .forEach(exp => {
        const dayIndex = new Date(exp.date).getDay();
        result[dayIndex].amount += exp.amount;
      });
    
    return result;
  }, [expenses, t]);

  const monthlyData = useMemo(() => {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const currentYear = new Date().getFullYear();
    const result = months.slice(0, new Date().getMonth() + 1).map(month => ({ 
      name: t(`time.${month}`), 
      amount: 0 
    }));
    
    expenses
      .filter(e => new Date(e.date).getFullYear() === currentYear)
      .forEach(exp => {
        const monthIndex = new Date(exp.date).getMonth();
        if (monthIndex < result.length) {
          result[monthIndex].amount += exp.amount;
        }
      });
    
    return result;
  }, [expenses, t]);

  const barData = period === 'week' ? weeklyData : monthlyData;

  const periods: { key: Period; label: string }[] = [
    { key: 'week', label: t('analytics.week') },
    { key: 'month', label: t('analytics.month') },
    { key: 'year', label: t('analytics.year') },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 pb-4">
        <PageHeader title={t('analytics.title')} />
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader title={t('analytics.title')} />

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
            <span className="text-xs text-muted-foreground">{t('analytics.expenses')}</span>
          </div>
          <p className="text-xl font-bold">{totalSpent.toLocaleString()} ₸</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUpIcon size={16} className="text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">{t('analytics.vsPrevious')}</span>
          </div>
          <p className={`text-xl font-bold ${percentChange > 0 ? 'text-destructive' : 'text-primary'}`}>
            {percentChange > 0 ? '+' : ''}{percentChange}%
          </p>
        </div>
      </div>

      {totalSpent === 0 ? (
        <div className="mx-4 text-center py-10 text-muted-foreground">
          <p>{t('common.noData')}</p>
        </div>
      ) : (
        <>
          {/* Bar Chart - Spending Over Time */}
          <div className="mx-4 rounded-3xl bg-card border border-border/50 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-muted-foreground" />
              <h3 className="font-semibold">{t('analytics.spendingDynamics')}</h3>
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
                      return [`${numValue?.toLocaleString()} ₸`, t('analytics.expenses')];
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
            <h3 className="font-semibold">{t('analytics.byCategory')}</h3>
            
            <div className="flex items-center gap-4">
              <div className="relative size-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={entry.id} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground">{t('analytics.total')}</span>
                  <span className="text-sm font-bold">{(totalSpent / 1000).toFixed(0)}k ₸</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2.5">
                {categoryData.slice(0, 5).map((item, i) => {
                  const pct = Math.round((item.value / totalSpent) * 100);
                  return (
                    <div key={item.id} className="flex items-center gap-2.5">
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
            <h3 className="font-semibold px-1">{t('analytics.topExpenses')}</h3>
            {categoryData.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border/50 p-3.5">
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
                        width: `${(item.value / categoryData[0].value) * 100}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }} 
                    />
                  </div>
                </div>
                <p className="font-semibold text-sm tabular-nums">{item.value.toLocaleString()} ₸</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
