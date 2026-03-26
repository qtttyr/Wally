-- ================================================
-- Тестовые данные для Wally
-- Запустите этот скрипт в Supabase SQL Editor
-- ================================================

-- 1. Создаём тестовые расходы для текущего пользователя
-- Внимание: замените USER_ID на реальный ID пользователя
-- Чтобы найти ID: SELECT id, email FROM auth.users;

-- Пример (раскомментируйте и замените на ваш ID):
-- INSERT INTO public.expenses (user_id, amount, description, category_id, date, ai_categorized)
-- VALUES 
--   ('YOUR-USER-ID-HERE', 2500, 'Продукты', 'food', '2026-03-25', true),
--   ('YOUR-USER-ID-HERE', 850, 'Такси', 'transport', '2026-03-24', true),
--   ('YOUR-USER-ID-HERE', 1500, 'Кино', 'entertainment', '2026-03-23', true),
--   ('YOUR-USER-ID-HERE', 12000, 'Одежда', 'shopping', '2026-03-22', true),
--   ('YOUR-USER-ID-HERE', 3000, 'Лекарства', 'health', '2026-03-21', true);

-- 2. Создаём тестовые бюджеты для текущего пользователя
-- INSERT INTO public.budgets (user_id, category_id, amount, period)
-- VALUES 
--   ('YOUR-USER-ID-HERE', 'food', 80000, 'monthly'),
--   ('YOUR-USER-ID-HERE', 'transport', 30000, 'monthly'),
--   ('YOUR-USER-ID-HERE', 'entertainment', 25000, 'monthly'),
--   ('YOUR-USER-ID-HERE', 'shopping', 40000, 'monthly'),
--   ('YOUR-USER-ID-HERE', 'health', 15000, 'monthly');

-- 3. Проверка: посмотреть все расходы
-- SELECT * FROM public.expenses ORDER BY date DESC LIMIT 10;

-- 4. Проверка: посмотреть бюджеты
-- SELECT * FROM public.budgets;

-- 5. Проверка storage bucket для чеков
-- SELECT * FROM storage.buckets WHERE name = 'receipts';
