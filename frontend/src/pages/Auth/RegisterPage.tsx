import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { WalletIcon, EyeIcon, EyeOffIcon, MailIcon, LockIcon, UserIcon, CheckCircleIcon } from 'lucide-react';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, authError, clearError, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordStrength = (() => {
    if (password.length === 0) return { level: 0, text: '', color: '' };
    if (password.length < 6) return { level: 1, text: t('auth.passwordWeak'), color: 'bg-destructive' };
    if (password.length < 8) return { level: 2, text: t('auth.passwordMedium'), color: 'bg-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 4, text: t('auth.passwordStrong'), color: 'bg-chart-1' };
    return { level: 3, text: t('auth.passwordGood'), color: 'bg-primary' };
  })();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    setIsSubmitting(true);
    const success = await signUpWithEmail(email, password, name);
    setIsSubmitting(false);
    if (success) {
      setIsSuccess(true);
    }
  };

  // Success Screen
  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-chart-1/20">
            <CheckCircleIcon size={48} className="text-chart-1" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t('auth.almostDone')}</h2>
            <p className="max-w-[280px] text-muted-foreground">
              {t('auth.confirmationSent')} <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <Button
            onClick={() => navigate(ROUTES.AUTH)}
            className="h-13 w-full max-w-sm rounded-2xl text-base font-semibold"
          >
            {t('auth.signIn')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background px-6 pb-8 pt-safe">
      {/* Top: Logo & Welcome */}
      <div className="flex w-full max-w-sm flex-col items-center gap-5 pt-12">
        {/* Logo */}
        <div className="relative">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/20 blur-xl" />
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30">
            <WalletIcon size={32} className="text-primary-foreground" />
          </div>
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">{t('auth.signUp')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.registrationSuccess')}
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="w-full rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive animate-in fade-in slide-in-from-top-2">
            {authError}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="w-full space-y-3">
          <div className="relative">
            <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('auth.enterName')}
              value={name}
              onChange={(e) => { setName(e.target.value); clearError(); }}
              className="h-13 rounded-2xl pl-11 text-base"
              required
              autoComplete="name"
            />
          </div>

          <div className="relative">
            <MailIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder={t('auth.enterEmail')}
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              className="h-13 rounded-2xl pl-11 text-base"
              required
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <LockIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordMinLength')}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              className="h-13 rounded-2xl pl-11 pr-11 text-base"
              required
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="space-y-1.5 px-1">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength.level >= lvl ? passwordStrength.color : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{passwordStrength.text}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || isLoading || password.length < 6}
            className="h-13 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? t('auth.creatingAccount') : t('auth.signUp')}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{t('auth.or')}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google */}
        <Button
          variant="outline"
          onClick={signInWithGoogle}
          disabled={isLoading}
          className="h-13 w-full rounded-2xl text-base font-medium border-2 transition-all hover:bg-accent active:scale-[0.98]"
        >
          <svg className="mr-2 size-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('auth.continueWithGoogle')}
        </Button>
      </div>

      {/* Bottom: Login Link */}
      <div className="w-full max-w-sm space-y-4 pt-8">
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to={ROUTES.AUTH} className="font-semibold text-primary hover:underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
