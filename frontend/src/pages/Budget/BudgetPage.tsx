import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PageHeader } from "../../components/layout/PageHeader";
import { useBudget } from "../../hooks/useBudget";
import { useExpenses } from "../../hooks/useExpenses";
import { CATEGORIES } from "../../constants/categories";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

export default function BudgetPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { budgets, isLoading: isBudgetsLoading } = useBudget();
  const { expenses, isLoading: isExpensesLoading } = useExpenses();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const budgetsWithSpent = useMemo(() => {
    if (isBudgetsLoading || isExpensesLoading) return [];
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = expenses.filter(e => 
      e.date && e.date.startsWith(currentMonth)
    );

    return budgets.map(budget => {
      const spent = monthlyExpenses
        .filter(e => e.category_id === budget.category_id)
        .reduce((sum, e) => sum + e.amount, 0);
      
      return {
        categoryId: budget.category_id,
        limit: budget.amount,
        spent
      };
    });
  }, [budgets, expenses, isBudgetsLoading, isExpensesLoading]);

  const totalLimit = budgetsWithSpent.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetsWithSpent.reduce((s, b) => s + b.spent, 0);
  const totalPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const getStatus = (spent: number, limit: number) => {
    const pct = (spent / limit) * 100;
    if (pct >= 100) {
      return {
        label: t("budget.statusOver"),
        color: "text-destructive",
        bg: "bg-destructive",
      };
    }
    if (pct >= 80) {
      return {
        label: t("budget.statusNearLimit"),
        color: "text-amber-500",
        bg: "bg-amber-500",
      };
    }
    return {
      label: t("budget.statusNormal"),
      color: "text-primary",
      bg: "bg-primary",
    };
  };

  const handleAddBudget = async () => {
    if (!newCategory || !newLimit || !user) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: newCategory,
        amount: Number(newLimit),
        period: 'monthly'
      });

    if (!error) {
      setNewCategory("");
      setNewLimit("");
      setShowAddForm(false);
      window.location.reload();
    }
    setIsSaving(false);
  };

  const isLoading = isBudgetsLoading || isExpensesLoading;

  return (
    <div className="flex flex-col gap-5 pb-4">
      <PageHeader
        title={t("budget.title")}
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

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Overall Progress */}
          {budgetsWithSpent.length > 0 && (
            <div className="mx-4 rounded-3xl bg-card border border-border/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("budget.totalBudget")}</p>
                  <p className="text-2xl font-bold">{totalSpent.toLocaleString()} ₸</p>
                  <p className="text-sm text-muted-foreground">
                    {t("budget.of")} {totalLimit.toLocaleString()} ₸
                  </p>
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
          )}

          {/* Add Budget Form */}
          {showAddForm && (
            <div className="mx-4 rounded-2xl bg-card border border-primary/20 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              <h3 className="font-semibold">{t("budget.newLimit")}</h3>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="h-12 w-full rounded-xl border bg-background px-3 text-sm"
              >
                <option value="">{t("budget.selectCategory")}</option>
                {CATEGORIES.filter(
                  (c) => !budgets.find((b) => b.category_id === c.id),
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(`categories.${c.id}`)}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder={t("budget.limitAmount")}
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
              <Button
                className="w-full h-12 rounded-xl"
                disabled={!newCategory || !newLimit || isSaving}
                onClick={handleAddBudget}
              >
                {isSaving ? t('common.loading') : t("budget.addLimit")}
              </Button>
            </div>
          )}

          {/* Budget Cards */}
          {budgetsWithSpent.length === 0 && !showAddForm ? (
            <div className="mx-4 text-center py-10 text-muted-foreground">
              <p>{t("budget.noBudgets")}</p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-2xl"
                onClick={() => setShowAddForm(true)}
              >
                {t("budget.addBudget")}
              </Button>
            </div>
          ) : (
            <div className="px-4 space-y-3">
              {budgetsWithSpent.map((budget) => {
                const cat = CATEGORIES.find((c) => c.id === budget.categoryId);
                const pct = Math.round((budget.spent / budget.limit) * 100);
                const status = getStatus(budget.spent, budget.limit);
                const remaining = budget.limit - budget.spent;

                return (
                  <div
                    key={budget.categoryId}
                    className="rounded-2xl bg-card border border-border/50 p-4 space-y-3 transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-10 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: (cat?.color || "#6b7280") + "18",
                          }}
                        >
                          <span className="text-lg">{cat?.icon || "📦"}</span>
                        </div>
                        <div>
                          <p className="font-medium">{t(`categories.${budget.categoryId}`)}</p>
                          <div className="flex items-center gap-1.5">
                            {pct >= 100 ? (
                              <AlertTriangleIcon
                                size={12}
                                className="text-destructive"
                              />
                            ) : (
                              <CheckCircleIcon size={12} className={status.color} />
                            )}
                            <span className={`text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums">
                          {budget.spent.toLocaleString()} ₸
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("budget.of")} {budget.limit.toLocaleString()} ₸
                        </p>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${status.bg}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {pct}% {t("budget.used")}
                      </span>
                      <span
                        className={
                          remaining < 0 ? "text-destructive font-medium" : ""
                        }
                      >
                        {remaining >= 0
                          ? t("budget.remainingAmount", {
                              amount: remaining.toLocaleString() + " ₸",
                            })
                          : t("budget.overBudgetAmount", {
                              amount: Math.abs(remaining).toLocaleString() + " ₸",
                            })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
