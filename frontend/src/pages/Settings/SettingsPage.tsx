import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, PaletteIcon, BellIcon, ShieldIcon,
  LogOutIcon, ChevronRightIcon, MoonIcon, SunIcon,
  GlobeIcon, CrownIcon, HelpCircleIcon, HeartIcon, WalletIcon
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

const SettingsItem = ({ 
  icon: Icon, label, value, onClick, danger 
}: { 
  icon: React.ElementType; label: string; value?: string; onClick?: () => void; danger?: boolean;
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
    <div className="flex-1">
      <p className="font-medium text-sm">{label}</p>
      {value && <p className="text-xs text-muted-foreground">{value}</p>}
    </div>
    {!danger && <ChevronRightIcon size={18} className="text-muted-foreground" />}
  </button>
);

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isDark, setIsDark] = useState(() => 
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

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

  return (
    <div className="flex flex-col gap-5 pb-8">
      <PageHeader title="Настройки" />

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
            <h2 className="text-lg font-bold truncate">{user?.name || 'Пользователь'}</h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {(user?.plan as string) === 'premium' ? (
                <><CrownIcon size={12} /> Premium</>
              ) : (
                'Free план'
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
              <p className="font-bold">Перейти на Premium</p>
              <p className="text-sm opacity-80">Безлимитные сканы, AI-советник, экспорт</p>
            </div>
            <Button 
              variant="secondary" 
              className="rounded-xl font-semibold shadow-none"
            >
              $4.99/мес
            </Button>
          </div>
        </div>
      )}

      {/* Settings Groups */}
      <div className="mx-4 rounded-3xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
        <SettingsItem icon={UserIcon} label="Редактировать профиль" value={user?.name} />
        <SettingsItem icon={GlobeIcon} label="Валюта" value="KZT (₸)" />
        <SettingsItem icon={BellIcon} label="Уведомления" value="Включены" />
      </div>

      <div className="mx-4 rounded-3xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
        <div className="flex items-center gap-3.5 px-4 py-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            {isDark ? <MoonIcon size={20} className="text-primary" /> : <SunIcon size={20} className="text-primary" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Тёмная тема</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative h-7 w-12 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`absolute top-0.5 size-6 rounded-full bg-white shadow-md transition-transform ${isDark ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <SettingsItem icon={PaletteIcon} label="Внешний вид" value="Emerald" />
      </div>

      <div className="mx-4 rounded-3xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
        <SettingsItem icon={ShieldIcon} label="Конфиденциальность" />
        <SettingsItem icon={HelpCircleIcon} label="Помощь и FAQ" />
        <SettingsItem icon={HeartIcon} label="Оценить приложение" />
      </div>

      <div className="mx-4 rounded-3xl bg-card border border-border/50 overflow-hidden">
        <SettingsItem icon={LogOutIcon} label="Выйти" danger onClick={handleSignOut} />
      </div>

      {/* App Version */}
      <p className="text-center text-xs text-muted-foreground/50 pt-2">
        Wally v1.0.0 • AI Financial Assistant
      </p>
    </div>
  );
}
