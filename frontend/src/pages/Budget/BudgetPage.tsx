import { useState } from 'react';
import { PlusIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PageHeader } from '../../components/layout/PageHeader';
import { CATEGORIES } from '../../constants/categories';

interface Budget {
  categoryId: string;
  limit: number;
  spent: number;
}

// Mock budgets
const MOCK_BUDGETS: Budget[] = [
  { categoryId: 'food', limit: 80000, spent: 54000 },
  { categoryId: 'transport', limit: 30000, spent: 28500 },
  { categoryId: 'entertainment', limit: 25000, spent: 12000 },
  { categoryId: 'shopping', limit: 40000, spent: 41200 },
  { categoryId: 'health', limit: 15000, spent: 5200 },
];

export default function BudgetPage() {
  const [budgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalPercent = Math.round((totalSpent / totalLimit) * 100);

  const getStatus = (b: Budget) => {
    const pct = (b.spent / b.limit) * 100;
    if (pct >= 100) return { label: 'Превышен', color: 'text-destructive', bg: 'bg-destructive', ring: 'ring-destructive/20' };
    if (pct >= 80) return { label: 'Почти лимит', color: 'text-amber-500', bg: 'bg-amber-500', ring: 'ring-amber-500/20' };
    return { label: 'В норме', color: 'text-primary', bg: 'bg-primary', ring: 'ring-primary/20' };
  };

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title="Бюджет"
        rightAction={
          <Button
            size="icon"
            variant="ghost"
            className="size-10 rounded-xl"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <PlusIcon size={20} />
          </Button>
        }
      />

      {/* Overall Progress */}
      <div className="mx-4 rounded-3xl bg-card border border-border/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Общий бюджет</p>
            <p className="text-2xl font-bold">{totalSpent.toLocaleString('ru-RU')} ₸</p>
            <p className="text-sm text-muted-foreground">из {totalLimit.toLocaleString('ru-RU')} ₸</p>
          </div>
          <div className="relative flex size-20 items-center justify-center">
            <svg className="size-20 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/60"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${Math.min(totalPercent, 100)}, 100`}
                strokeLinecap="round"
                className={totalPercent >= 100 ? 'text-destructive' : totalPercent >= 80 ? 'text-amber-500' : 'text-primary'}
              />
            </svg>
            <span className="absolute text-sm font-bold">{totalPercent}%</span>
          </div>
        </div>

        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${totalPercent >= 100 ? 'bg-destructive' : totalPercent >= 80 ? 'bg-amber-500' : 'bg-primary'}`}
            style={{ width: `${Math.min(totalPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Add Budget Form */}
      {showAddForm && (
        <div className="mx-4 rounded-2xl bg-card border border-primary/20 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <h3 className="font-semibold">Новый лимит</h3>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="h-12 w-full rounded-xl border bg-background px-3 text-sm"
          >
            <option value="">Выберите категорию</option>
            {CATEGORIES.filter(c => !budgets.find(b => b.categoryId === c.id)).map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Лимит (₸)"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            className="h-12 rounded-xl text-base"
          />
          <Button className="w-full h-12 rounded-xl" disabled={!newCategory || !newLimit}>
            Добавить лимит
          </Button>
        </div>
      )}

      {/* Budget Cards */}
      <div className="px-4 space-y-3">
        {budgets.map(budget => {
          const cat = CATEGORIES.find(c => c.id === budget.categoryId);
          const pct = Math.round((budget.spent / budget.limit) * 100);
          const status = getStatus(budget);
          const remaining = budget.limit - budget.spent;

          return (
            <div key={budget.categoryId} className="rounded-2xl bg-card border border-border/50 p-4 space-y-3 transition-all active:scale-[0.99]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex size-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: (cat?.color || '#6b7280') + '18' }}
                  >
                    <span className="text-lg">{cat?.icon || '📦'}</span>
                  </div>
                  <div>
                    <p className="font-medium">{cat?.label || 'Другое'}</p>
                    <div className="flex items-center gap-1.5">
                      {pct >= 100 ? (
                        <AlertTriangleIcon size={12} className="text-destructive" />
                      ) : (
                        <CheckCircleIcon size={12} className={status.color} />
                      )}
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{budget.spent.toLocaleString('ru-RU')} ₸</p>
                  <p className="text-xs text-muted-foreground">из {budget.limit.toLocaleString('ru-RU')} ₸</p>
                </div>
              </div>

              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${status.bg}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{pct}% использовано</span>
                <span className={remaining < 0 ? 'text-destructive font-medium' : ''}>
                  {remaining >= 0 
                    ? `Осталось ${remaining.toLocaleString('ru-RU')} ₸` 
                    : `Превышен на ${Math.abs(remaining).toLocaleString('ru-RU')} ₸`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
