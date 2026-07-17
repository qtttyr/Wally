import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExpenses } from '../../hooks/useExpenses';
import { Spinner } from '../../components/ui/spinner';
import { CATEGORIES } from '../../constants/categories';
import { 
  SettingsIcon, ArrowRightIcon, SparklesIcon,
  TrendingDownIcon, WalletIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PageHeader } from '../../components/layout/PageHeader';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expenses, isLoading } = useExpenses();

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyBudget = user?.monthly_budget || 200000;
  const remaining = monthlyBudget - totalSpent;

  const firstName = user?.name?.split(' ')[0] || t('dashboard.hello');

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader 
        title={`${firstName} 👋`} 
        rightAction={
          <Button variant="ghost" size="icon" className="size-10 rounded-xl" onClick={() => navigate(ROUTES.SETTINGS)}>
            <SettingsIcon size={20} />
          </Button>
        }
      />
      
      {/* AI Insight Card */}
      <div className="mx-4 group relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary/85 p-5 text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-[0.99]">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 size-32 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <div className="flex size-6 items-center justify-center rounded-full bg-white/20">
              <SparklesIcon size={12} />
            </div>
            {t('dashboard.aiAdviceToday')}
          </div>
          <p className="text-base font-semibold leading-snug">
            {t('dashboard.foodSpendingAdvice')}
          </p>
          <Button variant="secondary" size="sm" className="rounded-full bg-white/90 text-primary hover:bg-white shadow-none">
            {t('dashboard.seeMore')}
            <ArrowRightIcon size={14} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mx-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-1 transition-all hover:shadow-md">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDownIcon size={16} className="text-destructive" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t('dashboard.spent')}</p>
          <h3 className="text-xl font-bold">{totalSpent.toLocaleString('ru-RU')} ₸</h3>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-1 transition-all hover:shadow-md">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <WalletIcon size={16} className="text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t('dashboard.remaining')}</p>
          <h3 className={`text-xl font-bold ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {remaining.toLocaleString('ru-RU')} ₸
          </h3>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="mx-4 rounded-2xl bg-card border border-border/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('dashboard.monthlyBudget')}</span>
          <span className="font-medium">{Math.round((totalSpent / monthlyBudget) * 100)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${
              totalSpent > monthlyBudget ? 'bg-destructive' : totalSpent > monthlyBudget * 0.8 ? 'bg-amber-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min((totalSpent / monthlyBudget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-base font-bold">{t('dashboard.recentTransactions')}</h2>
          <Button variant="link" size="sm" className="text-primary" onClick={() => navigate(ROUTES.EXPENSES)}>
            {t('dashboard.all')}
            <ArrowRightIcon size={14} className="ml-1" />
          </Button>
        </div>
        
        <div className="px-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-muted-foreground">{t('dashboard.noExpenses')}</p>
              <Button variant="outline" className="rounded-2xl" onClick={() => navigate(ROUTES.SCAN)}>
                {t('dashboard.addFirst')}
              </Button>
            </div>
          ) : (
            expenses.slice(0, 5).map((expense) => {
              const category = CATEGORIES.find(c => c.id === expense.category_id);
              return (
                <div key={expense.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border/50 p-3.5 transition-all active:scale-[0.98]">
                  <div 
                    className="flex size-11 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: (category?.color || '#6b7280') + '18' }}
                  >
                    {category?.icon || '💳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{expense.description || t(`categories.${expense.category_id}`)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('ru-RU')} • {t(`categories.${expense.category_id}`)}
                    </p>
                  </div>
                  <p className="font-semibold text-sm tabular-nums">-{expense.amount.toLocaleString('ru-RU')} ₸</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
