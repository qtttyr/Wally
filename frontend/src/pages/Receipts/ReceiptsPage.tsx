import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ReceiptIcon, ImageIcon, 
  ChevronRightIcon, SearchIcon, XIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CATEGORIES } from '../../constants/categories';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Spinner } from '../../components/ui/spinner';

interface Expense {
  id: string;
  amount: number;
  category_id: string;
  date: string;
  description: string;
  receipt_url: string | null;
  created_at: string;
}

export default function ReceiptsPage() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', session.user.id)
        .not('receipt_url', 'is', null)
        .order('date', { ascending: false });

      if (!error && data) {
        setExpenses(data as Expense[]);
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(exp =>
    exp.description?.toLowerCase().includes(search.toLowerCase()) ||
    CATEGORIES.find(c => c.id === exp.category_id)?.label.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || { label: 'Other', icon: '📦', color: '#6b7280' };
  };

  const currencySymbol = '₸';

  return (
    <div className="flex flex-col gap-4 pb-8 min-h-screen">
      <PageHeader title={t('receipts.title')} />

      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <ReceiptIcon size={40} className="text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t('receipts.noReceipts')}</h3>
            <p className="text-sm text-muted-foreground">{t('receipts.noReceiptsDesc')}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="px-4">
            <div className="relative">
              <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('receipts.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 rounded-2xl bg-card border border-border/50 pl-10 pr-4 text-base"
              />
            </div>
          </div>

          <div className="px-4 space-y-3">
            {filteredExpenses.map(expense => {
              const category = getCategoryInfo(expense.category_id);
              return (
                <div
                  key={expense.id}
                  onClick={() => setSelectedReceipt(expense)}
                  className="flex items-center gap-4 rounded-2xl bg-card border border-border/50 p-4 transition-all active:scale-[0.98]"
                >
                  <div 
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-muted"
                  >
                    {expense.receipt_url ? (
                      <img 
                        src={expense.receipt_url} 
                        alt="Receipt" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{expense.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{category.icon} {category.label}</span>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold">{expense.amount.toLocaleString()} {currencySymbol}</p>
                    <ChevronRightIcon size={16} className="text-muted-foreground ml-auto mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedReceipt(null)}>
          <div 
            className="w-full max-w-lg max-h-[90vh] bg-background rounded-3xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-background z-10">
              <h3 className="font-semibold">{t('receipts.receiptDetails')}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setSelectedReceipt(null)}
              >
                <XIcon size={20} />
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedReceipt.receipt_url && (
                <div className="aspect-[3/4] bg-muted">
                  <img 
                    src={selectedReceipt.receipt_url} 
                    alt="Receipt" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('receipts.store')}</span>
                  <span className="font-medium">{selectedReceipt.description}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('receipts.amount')}</span>
                  <span className="font-bold text-lg">{selectedReceipt.amount.toLocaleString()} {currencySymbol}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('receipts.category')}</span>
                  <span className="flex items-center gap-2">
                    {getCategoryInfo(selectedReceipt.category_id).icon} {getCategoryInfo(selectedReceipt.category_id).label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('receipts.date')}</span>
                  <span>{new Date(selectedReceipt.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('receipts.scanned')}</span>
                  <span>{new Date(selectedReceipt.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
