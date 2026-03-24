# Инструкция по деплою на Vercel

## 1. Добавь переменные окружения

В Vercel Dashboard → Settings → Environment Variables добавь:

| Переменная | Значение |
|-----------|----------|
| `VITE_SUPABASE_URL` | Твой Supabase URL (например `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Твой Supabase anon key |

> ⚠️ Без этих переменных **никто не сможет войти** в приложение.
> После добавления переменных нужно **перезапустить сборку** (Redeploy).

## 2. Как получить ключи Supabase

1. Зайди на [supabase.com](https://supabase.com) → Project → Settings → API
2. Скопируй **Project URL** → это `VITE_SUPABASE_URL`
3. Скопируй **anon/public** key → это `VITE_SUPABASE_ANON_KEY`

## 3. Передеплой

После добавления переменных:
```
vercel --prod
```

Или нажми "Redeploy" в Vercel Dashboard.

## 4. Настройка Google OAuth

В Supabase Dashboard → Authentication → Providers → Google:
1. Включи Google provider
2. Добавь свой Vercel URL в Redirect URLs:
   - `https://tвоё-приложение.vercel.app`
   - `https://tвоё-приложение.vercel.app/auth/callback`
