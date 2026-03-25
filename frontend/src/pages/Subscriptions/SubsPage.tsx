import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { useSubscriptions } from '../../hooks/useSubscriptions';

export default function SubsPage() {
  const { t } = useTranslation();
  const { subscriptions, isLoading } = useSubscriptions();

  return (
    <div className="flex flex-col gap-4 pb-4">
      <PageHeader title={t('subscriptions.title')} />

      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner className="size-8 text-primary" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="px-4 pt-10 text-center text-muted-foreground">
          {t('subscriptions.noSubscriptions')}
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {subscriptions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-card border border-border/50 p-4"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">
                  {t('subscriptions.nextPayment')}: {new Date(s.next_payment_date).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-bold tabular-nums">{s.amount.toLocaleString('ru-RU')} ₸</div>
                <div className="text-xs text-muted-foreground">{s.is_active ? t('subscriptions.active') : t('subscriptions.paused')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

