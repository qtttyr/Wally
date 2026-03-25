import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  SearchIcon, FilterIcon, PlusIcon, CalendarIcon,
  TrendingDownIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PageHeader } from '../../components/layout/PageHeader';
import { useExpenses } from '../../hooks/useExpenses';
import { CATEGORIES } from '../../constants/categories';
import { ROUTES } from '../../constants/routes';
import { Spinner } from '../../components/ui/spinner';

export default function ExpensesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { expenses, isLoading } = useExpenses();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = !search || 
        exp.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || 
        exp.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, selectedCategory]);

  const totalFiltered = useMemo(() => 
    filtered.reduce((sum, e) => sum + e.amount, 0), 
    [filtered]
  );

  // Group expenses by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const exp of filtered) {
      const date = exp.date || exp.created_at.split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(exp);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return t('expenses.today');
    if (dateStr === yesterday.toISOString().split('T')[0]) return t('expenses.yesterday');
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <PageHeader 
        title={t('expenses.title')} 
        rightAction={
          <Button 
            size="icon" 
            variant="ghost" 
            className="size-10 rounded-xl"
            onClick={() => navigate(ROUTES.SCAN)}
          >
            <PlusIcon size={20} />
          </Button>
        }
      />

      {/* Search & Filter Bar */}
      <div className="px-4 space-y-3">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder={t('expenses.searchExpenses')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-2xl pl-10 pr-12 bg-card border-border/50 text-base"
          />
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors ${
              showFilters || selectedCategory ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
            }`}
          >
            <FilterIcon size={18} />
          </button>
        </div>

        {/* Category Filter Chips */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                !selectedCategory 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' 
                  : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              {t('expenses.all')}
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {t(`categories.${cat.id}`)}
              </button>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between rounded-2xl bg-card border border-border/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <TrendingDownIcon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('expenses.totalSpent')}</p>
              <p className="text-lg font-bold">{totalFiltered.toLocaleString('ru-RU')} ₸</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{t('expenses.transactions')}</p>
            <p className="text-lg font-bold">{filtered.length}</p>
          </div>
        </div>
      </div>

      {/* Expenses List by Date */}
      <div className="px-4 space-y-5">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 pt-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <CalendarIcon size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {search || selectedCategory ? t('expenses.nothingFound') : t('expenses.noExpenses')}
            </p>
            <Button 
              variant="outline" 
              className="rounded-2xl"
              onClick={() => navigate(ROUTES.SCAN)}
            >
              {t('expenses.addExpense')}
            </Button>
          </div>
        ) : (
          grouped.map(([date, items]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {formatDate(date)}
                </h3>
                <span className="text-sm font-medium text-foreground">
                  {items.reduce((s, e) => s + e.amount, 0).toLocaleString('ru-RU')} ₸
                </span>
              </div>
              <div className="space-y-2">
                {items.map(expense => {
                  const cat = CATEGORIES.find(c => c.id === expense.category_id);
                  return (
                    <div 
                      key={expense.id} 
                      className="flex items-center gap-3 rounded-2xl bg-card border border-border/50 p-3.5 transition-all active:scale-[0.98]"
                    >
                      <div 
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: (cat?.color || '#6b7280') + '18' }}
                      >
                        <span className="text-lg">{cat?.icon || '📦'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{expense.description || t(`categories.${expense.category_id}`) || t('expenses.expense')}</p>
                        <p className="text-xs text-muted-foreground">{t(`categories.${expense.category_id}`)}</p>
                      </div>
                      <p className="font-semibold tabular-nums">
                        -{expense.amount.toLocaleString('ru-RU')} ₸
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
