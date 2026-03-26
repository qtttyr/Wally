-- ================================================
-- ДИАГНОСТИКА И ТЕСТОВЫЕ ДАННЫЕ
-- Запустите этот скрипт в Supabase SQL Editor
-- ================================================

-- 1. Проверка: есть ли пользователи
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Проверка: есть ли расходы
SELECT e.id, e.amount, e.description, e.category_id, e.date, u.email
FROM public.expenses e
JOIN auth.users u ON e.user_id = u.id
ORDER BY e.date DESC
LIMIT 10;

-- 3. Проверка: есть ли бюджеты
SELECT b.id, b.category_id, b.amount, u.email
FROM public.budgets b
JOIN auth.users u ON b.user_id = u.id;

-- 4. Проверка: есть ли чеки с фото
SELECT id, description, receipt_url, date
FROM public.expenses
WHERE receipt_url IS NOT NULL
LIMIT 10;

-- 5. Проверка: storage bucket
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'receipts';

-- ================================================
-- СОЗДАНИЕ ТЕСТОВЫХ ДАННЫХ
-- ================================================

-- ВНИМАНИЕ: Сначала выполните запрос 1, чтобы получить ваш user_id
-- Затем замените 'YOUR_USER_ID' на реальный ID

-- Пример создания тестовых расходов:
-- INSERT INTO public.expenses (user_id, amount, description, category_id, date, ai_categorized)
-- VALUES 
--   ('YOUR_USER_ID', 2500, 'Магнит', 'food', '2026-03-25', true),
--   ('YOUR_USER_ID', 850, 'Яндекс Такси', 'transport', '2026-03-24', true),
--   ('YOUR_USER_ID', 1500, 'Синема Парк', 'entertainment', '2026-03-23', true),
--   ('YOUR_USER_ID', 12000, 'Zara', 'shopping', '2026-03-22', true),
--   ('YOUR_USER_ID', 3000, 'Аптека', 'health', '2026-03-21', true),
--   ('YOUR_USER_ID', 45000, 'Аренда', 'housing', '2026-03-20', true);

-- Пример создания бюджетов:
-- INSERT INTO public.budgets (user_id, category_id, amount, period)
-- VALUES 
--   ('YOUR_USER_ID', 'food', 80000, 'monthly'),
--   ('YOUR_USER_ID', 'transport', 30000, 'monthly'),
--   ('YOUR_USER_ID', 'entertainment', 25000, 'monthly'),
--   ('YOUR_USER_ID', 'shopping', 40000, 'monthly'),
--   ('YOUR_USER_ID', 'health', 15000, 'monthly'),
--   ('YOUR_USER_ID', 'housing', 60000, 'monthly');

-- Проверка после вставки:
-- SELECT * FROM public.expenses WHERE user_id = 'YOUR_USER_ID';
-- SELECT * FROM public.budgets WHERE user_id = 'YOUR_USER_ID';
