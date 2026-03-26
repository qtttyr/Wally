import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon, PaletteIcon, BellIcon, ShieldIcon,
  LogOutIcon, ChevronRightIcon, MoonIcon, SunIcon,
  GlobeIcon, CrownIcon, HelpCircleIcon, HeartIcon, WalletIcon,
  CheckIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { LanguageSelector } from '../../components/ui/LanguageSelector';
import { Modal } from '../../components/ui/Modal';
import { CURRENCIES, getCurrencySymbol } from '../../constants/currencies';

const SettingsItem = ({ 
  icon: Icon, label, value, onClick, danger, trailing 
}: { 
  icon: React.ElementType; label: string; value?: string; onClick?: () => void; danger?: boolean; trailing?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.99] ${
      danger ? 'text-destructive' : ''
    }`}
  >
    <div className={`flex size-10 items-center justify-center rounded-xl ${
      danger ? 'bg-destructive/10' : 'bg-primary/10'
    }`}>
      <Icon size={20} className={danger ? 'text-destructive' : 'text-primary'} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm">{label}</p>
      {value && <p className="text-xs text-muted-foreground">{value}</p>}
    </div>
    {trailing || (!danger && <ChevronRightIcon size={18} className="text-muted-foreground" />)}
  </button>
);

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut, updateProfile } = useAuth();
  const [isDark, setIsDark] = useState(() => 
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  
  const [editName, setEditName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    weekly: true,
  });

  const toggleTheme = () => {
    const newDark = !isDark;
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsDark(newDark);
    localStorage.setItem('wally-theme', newDark ? 'dark' : 'light');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.AUTH);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    await updateProfile({ name: editName });
    setIsSavingProfile(false);
    setShowProfileModal(false);
  };

  const handleCurrencyChange = async (currency: string) => {
    await updateProfile({ currency });
    setShowCurrencyModal(false);
  };

  return (
    <div className="flex flex-col gap-5 pb-8">
      <PageHeader title={t('settings.title')} />

      {/* Profile Card */}
      <div className="mx-4 rounded-3xl bg-card border border-border/50 p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt="Avatar" 
                className="size-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/70">
                <UserIcon size={28} className="text-primary-foreground" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary shadow-lg">
              <WalletIcon size={12} className="text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">{user?.name || t('settings.profile')}</h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {(user?.plan as string) === 'premium' ? (
                <><CrownIcon size={12} /> Premium</>
              ) : (
                'Free'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Banner (for free users) */}
      {(user?.plan as string) !== 'premium' && (
        <div className="mx-4 rounded-2xl bg-linear-to-br from-primary to-primary/80 p-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <CrownIcon size={24} />
            <div className="flex-1">
              <p className="font-bold">Premium</p>
              <p className="text-sm opacity-80">Unlimited scans, AI advisor, export</p>
            </div>
            <Button 
              variant="secondary" 
              className="rounded-xl font-semibold shadow-none"
            >
              $4.99/mo
            </Button>
          </div>
        </div>
      )}

      {/* Settings Groups */}
      <div className="mx-4 rounded-3xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
        <SettingsItem 
          icon={UserIcon} 
          label={t('settings.editProfile')} 
          value={user?.name} 
          onClick={() => {
            setEditName(user?.name || '');
            setShowProfileModal(true);
          }} 
        />
        <div className="flex items-center gap-3.5 px-4 py-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <GlobeIcon size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{t('settings.language')}</p>
          </div>
          <LanguageSelector />
        </div>
        <SettingsItem 
          icon={GlobeIcon} 
          label={t('settings.currency')} 
          value={`${user?.currency || 'KZT'} (${getCurrencySymbol(user?.currency || 'KZT')})`}
          onClick={() => setShowCurrencyModal(true)} 
        />
        <SettingsItem 
          icon={BellIcon} 
          label={t('settings.notifications')} 
          value={notifications.push ? t('settings.notificationsEnabled') : t('settings.notificationsDisabled')}
          onClick={() => setShowNotificationsModal(true)} 
        />
      </div>

      <div className="mx-4 rounded-3xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
        <div className="flex items-center gap-3.5 px-4 py-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            {isDark ? <MoonIcon size={20} className="text-primary" /> : <SunIcon size={20} className="text-primary" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{t('settings.darkTheme')}</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative h-7 w-12 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`absolute top-0.5 size-6 rounded-full bg-white shadow-md transition-transform ${isDark ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <SettingsItem icon={PaletteIcon} label={t('settings.appearance')} value="Emerald" />
      </div>

      <div className="mx-4 rounded-3xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
        <SettingsItem icon={ShieldIcon} label={t('settings.privacyPolicy')} onClick={() => setShowPrivacyModal(true)} />
        <SettingsItem icon={HelpCircleIcon} label={t('settings.helpAndFAQ')} onClick={() => setShowHelpModal(true)} />
        <SettingsItem icon={HeartIcon} label={t('settings.rateApp')} onClick={() => setShowRateModal(true)} />
      </div>

      <div className="mx-4 rounded-3xl bg-card border border-border/50 overflow-hidden">
        <SettingsItem icon={LogOutIcon} label={t('settings.logout')} danger onClick={handleSignOut} />
      </div>

      {/* App Version */}
      <p className="text-center text-xs text-muted-foreground/50 pt-2">
        Wally v1.0.0 • AI Financial Assistant
      </p>

      {/* Edit Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title={t('settings.editProfile')}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">{t('auth.name')}</label>
            <Input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
          >
            {isSavingProfile ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </Modal>

      {/* Currency Modal */}
      <Modal isOpen={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} title={t('settings.currency')}>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {CURRENCIES.map(currency => (
            <button
              key={currency.code}
              onClick={() => handleCurrencyChange(currency.code)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                user?.currency === currency.code 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              <span className="text-2xl">{currency.symbol}</span>
              <div className="flex-1 text-left">
                <p className="font-medium">{currency.code}</p>
                <p className="text-xs opacity-70">{currency.name}</p>
              </div>
              {user?.currency === currency.code && <CheckIcon size={20} />}
            </button>
          ))}
        </div>
      </Modal>

      {/* Notifications Modal */}
      <Modal isOpen={showNotificationsModal} onClose={() => setShowNotificationsModal(false)} title={t('settings.notifications')}>
        <div className="space-y-4">
          <button
            onClick={() => setNotifications(n => ({ ...n, push: !n.push }))}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted"
          >
            <div className="text-left">
              <p className="font-medium">Push-уведомления</p>
              <p className="text-xs text-muted-foreground">Уведомления на телефон</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${notifications.push ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`size-5 bg-white rounded-full mt-0.5 transition-transform ${notifications.push ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </div>
          </button>
          
          <button
            onClick={() => setNotifications(n => ({ ...n, email: !n.email }))}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted"
          >
            <div className="text-left">
              <p className="font-medium">Email-уведомления</p>
              <p className="text-xs text-muted-foreground">Рассылка на почту</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${notifications.email ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`size-5 bg-white rounded-full mt-0.5 transition-transform ${notifications.email ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </div>
          </button>
          
          <button
            onClick={() => setNotifications(n => ({ ...n, weekly: !n.weekly }))}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted"
          >
            <div className="text-left">
              <p className="font-medium">Еженедельный отчёт</p>
              <p className="text-xs text-muted-foreground">Сводка расходов за неделю</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${notifications.weekly ? 'bg-primary' : 'bg-muted'}`}>
              <div className={`size-5 bg-white rounded-full mt-0.5 transition-transform ${notifications.weekly ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title={t('settings.privacyPolicy')}>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Wally — ваш персональный финансовый помощник. Мы заботимся о конфиденциальности ваших данных.</p>
          <p><strong>Какие данные мы собираем:</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Данные профиля (имя, email)</li>
            <li>История расходов и сканированные чеки</li>
            <li>Настройки приложения</li>
          </ul>
          <p><strong>Как мы используем данные:</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Для работы приложения и синхронизации данных</li>
            <li>Для анализа трат и рекомендаций</li>
            <li>Для улучшения качества сканирования чеков</li>
          </ul>
          <p>Ваши данные хранятся в зашифрованном виде на серверах Supabase. Вы можете в любое время удалить все данные через настройки.</p>
        </div>
      </Modal>

      {/* Help & FAQ Modal */}
      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} title={t('settings.helpAndFAQ')}>
        <div className="space-y-4 text-sm">
          <div className="border-b pb-3">
            <p className="font-medium mb-1">Как сканировать чек?</p>
            <p className="text-muted-foreground">Нажмите кнопку камеры на экране сканирования. Вы можете сделать фото или загрузить из галереи.</p>
          </div>
          <div className="border-b pb-3">
            <p className="font-medium mb-1">Как изменить валюту?</p>
            <p className="text-muted-foreground">Перейдите в Настройки → Валюта и выберите нужную.</p>
          </div>
          <div className="border-b pb-3">
            <p className="font-medium mb-1">Как работает бюджет?</p>
            <p className="text-muted-foreground">Установите лимиты на категории в разделе Бюджет. Приложение будет следить за расходами.</p>
          </div>
          <div className="pb-3">
            <p className="font-medium mb-1">Что такое Premium?</p>
            <p className="text-muted-foreground">Премиум открывает безлимитное сканирование, AI-консультанта и экспорт данных.</p>
          </div>
        </div>
      </Modal>

      {/* Rate App Modal */}
      <Modal isOpen={showRateModal} onClose={() => setShowRateModal(false)} title={t('settings.rateApp')}>
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">Насколько вы довольны приложением Wally?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} className="text-4xl hover:scale-110 transition-transform">⭐</button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Спасибо за ваш отзыв!</p>
        </div>
      </Modal>
    </div>
  );
}
