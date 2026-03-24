-- ================================================
-- Wally — Supabase Database Schema
-- Запустите этот скрипт в Supabase SQL Editor
-- ================================================

-- 1. PROFILES — расширенные данные пользователей
-- Автоматически создаётся при регистрации через триггер
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  currency TEXT DEFAULT 'KZT',
  monthly_budget NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES — категории расходов
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE  -- NULL = системная категория
);

-- Системные категории по умолчанию
INSERT INTO public.categories (id, label, icon, color, is_default, user_id) VALUES
  ('food',           'Еда',            'UtensilsCrossedIcon', '#22c55e', true, NULL),
  ('transport',      'Транспорт',      'CarIcon',             '#3b82f6', true, NULL),
  ('entertainment',  'Развлечения',    'GamepadIcon',         '#a855f7', true, NULL),
  ('shopping',       'Покупки',        'ShoppingBagIcon',     '#f97316', true, NULL),
  ('health',         'Здоровье',       'HeartPulseIcon',      '#ef4444', true, NULL),
  ('education',      'Образование',    'GraduationCapIcon',   '#06b6d4', true, NULL),
  ('housing',        'Жильё',          'HomeIcon',            '#eab308', true, NULL),
  ('subscriptions',  'Подписки',       'RepeatIcon',          '#8b5cf6', true, NULL),
  ('other',          'Другое',         'CircleEllipsisIcon',  '#6b7280', true, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. EXPENSES — расходы
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  category_id TEXT,  -- Убран FK constraint для надёжности, валидация на уровне приложения
  date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,           -- ссылка на фото чека в Supabase Storage
  ai_categorized BOOLEAN DEFAULT false,  -- был ли расход классифицирован AI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BUDGETS — лимиты по категориям
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, period)
);

-- 5. SUBSCRIPTIONS — отслеживаемые подписки
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KZT',
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly')),
  next_payment_date DATE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ИНДЕКСЫ для быстрых запросов
-- ================================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS) — каждый видит только свои данные
-- ================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Categories (доступ ко всем системным + своим)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view default categories"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id);

-- ================================================
-- ТРИГГЕР: автоматическое создание профиля при регистрации
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем старый триггер если есть, пересоздаём
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- STORAGE: бакет для фото чеков
-- ================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Политики доступа к Storage
CREATE POLICY "Users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ================================================
-- ФУНКЦИЯ: обновление updated_at при изменении профиля
-- ================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
