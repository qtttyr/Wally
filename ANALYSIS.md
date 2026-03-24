# Wally — Анализ и План Исправлений

> Дата: 19 марта 2026  
> Версия проекта: v0.1.0

---

## Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Анализ кодовой базы](#анализ-кодовой-базы)
3. [Критичные проблемы](#критичные-проблемы)
4. [Важные улучшения](#важные-улучшения)
5. [Мелкие доработки](#мелкие-doberabotki)
6. [План исправлений по приоритетам](#план-исправлений-по-приоритетам)
7. [Технические детали решений](#технические-детали-решений)

---

## Обзор проекта

**Wally** — AI-powered персональный финансовый ассистент (PWA).

### Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Pages   │  │Components│  │  Hooks   │  │  Stores  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                         │                               │
│              ┌──────────┴──────────┐                    │
│              │   Supabase Client   │                    │
│              └──────────┬──────────┘                    │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼─────────────────────────────────┐
│                    Backend (FastAPI)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   API    │  │ Services │  │  Models  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                         │                                 │
│              ┌──────────┴──────────┐                      │
│              │   Supabase Client   │                      │
│              └─────────────────────┘                      │
└───────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼─────────────────────────────────┐
│                  Supabase Platform                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Database  │  │   Auth   │  │ Storage  │  │  Edge    │   │
│  │(Postgres)│  │          │  │          │  │Functions │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────────────────────────────────────────┘
```

### Технологический стек

| Слой | Технологии |
|------|------------|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand, React Router 7 |
| **Backend** | FastAPI, Pydantic, python-jose, Tesseract OCR, Google Gemini |
| **База данных** | Supabase (PostgreSQL), Row Level Security |
| **Инфраструктура** | PWA, IndexedDB (офлайн) |

---

## Анализ кодовой базы

### Структура файлов

```
C:\Wally\
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── requirements.txt
│   ├── api/
│   │   ├── deps.py                # JWT auth dependencies
│   │   └── v1/
│   │       ├── api.py             # Router aggregator
│   │       ├── auth.py
│   │       ├── scan.py            # Receipt OCR endpoint
│   │       ├── expenses.py
│   │       ├── budgets.py
│   │       ├── subscriptions.py
│   │       ├── ai.py
│   │       └── export.py
│   ├── core/
│   │   ├── config.py              # Pydantic Settings
│   │   ├── security.py            # ⚠️ ПУСТОЙ
│   │   └── logging.py             # ⚠️ ПУСТОЙ
│   ├── services/
│   │   ├── ai_service.py          # Gemini integration
│   │   ├── ocr_service.py
│   │   ├── export_service.py
│   │   └── notification_service.py
│   ├── models/                    # Pydantic schemas
│   └── db/
│       ├── supabase.py
│       └── queries.py
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Scan/
│   │   │   ├── Expenses/
│   │   │   ├── Budget/
│   │   │   ├── Subscriptions/
│   │   │   ├── Analytics/
│   │   │   └── Settings/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── features/
│   │   │   └── guards/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── constants/
│   │   └── utils/
│   └── public/
│       ├── manifest.json          # ⚠️ ПУСТОЙ
│       └── sw.js                  # ⚠️ ПУСТОЙ
│
└── supabase/
    └── init.sql                   # Database schema + RLS
```

---

## Критичные проблемы

> ⚠️ **Требуют немедленного исправления перед продакшеном**

### 1. Пустые файлы core/security.py и core/logging.py

**Файл:** `backend/core/security.py`  
**Статус:** Пустой файл  
**Риск:** Средний

Текущая реализация полагается только на Supabase Auth через `deps.py`. Это работает, но:

- Нет собственной логики работы с JWT
- Нет refresh token handling
- Сложно добавлять кастомные claims

**Решение:** Написать модуль `security.py` с функциями валидации JWT или задокументировать, почему используется только Supabase SDK.

---

### 2. Нет валидации AI-ответа

**Файл:** `backend/services/ai_service.py:55`  
**Риск:** Высокий

```python
content = response.text
return json.loads(content)  # ❌ Нет валидации
```

Если Gemini вернёт некорректный JSON или неполные данные, API упадёт.

**Решение:** Создать Pydantic-модель и валидировать ответ.

---

### 3. RLS неполная для profiles

**Файл:** `supabase/init.sql`  
**Риск:** Средний

Отсутствует DELETE policy для таблицы `profiles`. Пользователь не может удалить свой аккаунт.

```sql
-- Существует:
-- ✓ SELECT policy
-- ✓ UPDATE policy  
-- ✓ INSERT policy
-- ✗ DELETE policy — ОТСУТСТВУЕТ
```

**Решение:** Добавить DELETE policy.

---

### 4. Backend использует service_role_key

**Файл:** `backend/api/deps.py:26`  
**Риск:** Критический

```python
user_response = supabase.auth.get_user(token)
```

Если `supabase` клиент инициализирован с `service_role_key`, это **обходит RLS**. Любой пользователь с валидным токеном получит доступ к чужим данным.

**Решение:** Убедиться, что используется `SUPABASE_KEY` (anon key), не `SERVICE_ROLE_KEY`.

---

## Важные улучшения

### 5. Неполный CRUD для expenses

**Файл:** `frontend/src/store/expensesStore.ts`  
**Риск:** Средний

```typescript
// Есть:
fetchExpenses()
addExpense()

// Нет:
updateExpense()
deleteExpense()
```

При удалении/редактировании расхода store не синхронизируется.

**Решение:** Добавить `updateExpense` и `deleteExpense` методы.

---

### 6. Утечка памяти в useExpenses

**Файл:** `frontend/src/hooks/useExpenses.ts`  
**Риск:** Низкий

```typescript
useEffect(() => {
  if (expenses.length === 0 && !isLoading) {
    fetchExpenses();
  }
}, [expenses.length, isLoading, fetchExpenses]); // ❌ fetchExpenses без useCallback
```

`fetchExpenses` может меняться при каждом рендере, вызывая лишние эффекты.

**Решение:** Обернуть `fetchExpenses` в `useCallback`.

---

### 7. Нет rate limiting на OCR/AI эндпоинтах

**Файл:** `backend/api/v1/scan.py`  
**Риск:** Средний

Эндпоинт `/scan/process` вызывает Gemini API, который имеет rate limits на бесплатном плане.

**Решение:**
- Добавить кэширование результатов
- Реализовать rate limiting через slowapi
- Добавить retry с exponential backoff

---

### 8. Offline-режим не реализован

**Файлы:** `frontend/public/manifest.json`, `frontend/public/sw.js`  
**Риск:** Средний

PWA настроен, но manifest и service worker пустые. Офлайн-работа невозможна.

**Решение:** Реализовать полный service worker с кэшированием.

---

## Мелкие доработки

### 9. Нет обработки ошибок с retry

**Файл:** `frontend/src/services/expenseService.ts`

При сетевых ошибках нет повторных попыток. Пользователь увидит ошибку сразу.

---

### 10. Нет логирования на бэке

**Файл:** `backend/core/logging.py` — пустой

Невозможно отслеживать ошибки и поведение API в продакшене.

---

### 11. Отсутствуют unit-тесты

Тесты отсутствуют полностью. Критично для продакшена.

---

### 12. Нет TypeScript types для некоторых API response

Проверить полноту типизации в `frontend/src/types/`.

---

## План исправлений по приоритетам

### Фаза 1: Критичные исправления (1-2 дня)

| # | Задача | Файлы | Время |
|---|--------|-------|-------|
| 1.1 | Добавить DELETE policy для profiles | `supabase/init.sql` | 30 мин |
| 1.2 | Проверить и исправить auth на бэке (убрать service_role_key) | `backend/api/deps.py`, `backend/db/supabase.py` | 1 час |
| 1.3 | Добавить валидацию AI-ответа через Pydantic | `backend/services/ai_service.py`, `backend/models/` | 2 часа |
| 1.4 | Реализовать security.py или задокументировать | `backend/core/security.py` | 1 час |

---

### Фаза 2: Важные улучшения (2-3 дня)

| # | Задача | Файлы | Время |
|---|--------|-------|-------|
| 2.1 | Полный CRUD для expenses | `frontend/src/store/expensesStore.ts`, `frontend/src/services/expenseService.ts` | 3 часа |
| 2.2 | Исправить useCallback в useExpenses | `frontend/src/hooks/useExpenses.ts` | 30 мин |
| 2.3 | Добавить retry для API запросов | `frontend/src/services/expenseService.ts` | 2 часа |
| 2.4 | Rate limiting для /scan | `backend/api/v1/scan.py` | 2 часа |
| 2.5 | Реализовать service worker | `frontend/public/sw.js`, `vite.config.ts` | 4 часа |

---

### Фаза 3: Улучшения качества (2-3 дня)

| # | Задача | Файлы | Время |
|---|--------|-------|-------|
| 3.1 | Настроить логирование | `backend/core/logging.py` | 2 часа |
| 3.2 | Добавить unit-тесты | `backend/tests/`, `frontend/src/__tests__/` | 6 часов |
| 3.3 | Добавить типизацию для API | `frontend/src/types/` | 2 часа |
| 3.4 | Заполнить manifest.json | `frontend/public/manifest.json` | 1 час |

---

### Фаза 4: Полировка (опционально)

| # | Задача | Время |
|---|--------|-------|
| 4.1 | Анимации загрузки | 2 часа |
| 4.2 | Темная тема | 4 часа |
| 4.3 | Push-уведомления | 4 часа |
| 4.4 | Share functionality | 2 часа |

---

## Технические детали решений

### 1.3 — Валидация AI-ответа

**Новая модель:** `backend/models/ai.py`

```python
from pydantic import BaseModel, Field
from typing import Literal
from datetime import date

class ReceiptParseResult(BaseModel):
    description: str
    amount: float = Field(ge=0)
    currency: Literal["KZT", "RUB", "USD", "EUR"] = "KZT"
    date: date
    category_id: str
    confidence: float = Field(ge=0, le=1)
```

**Обновлённый ai_service.py:**

```python
from models.ai import ReceiptParseResult

async def parse_receipt(self, raw_text: str) -> ReceiptParseResult:
    # ... existing code ...
    content = response.text
    try:
        data = json.loads(content)
        return ReceiptParseResult.model_validate(data)
    except ValidationError as e:
        print(f"Invalid AI response: {e}")
        return self._fallback_parse(raw_text)
```

---

### 2.1 — Полный CRUD

**expensesStore.ts:**

```typescript
interface ExpensesState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: ExpenseCreate) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  // ... existing code ...
  
  updateExpense: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updated = await expenseService.updateExpense(id, updates);
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: handleError(error), isLoading: false });
    }
  },
  
  deleteExpense: async (id) => {
    set({ isLoading: true });
    try {
      await expenseService.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: handleError(error), isLoading: false });
    }
  },
}));
```

---

### 2.4 — Rate Limiting

```python
# backend/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/scan/process")
@limiter.limit("10/minute")  # 10 запросов в минуту
async def process_receipt(request: Request, ...):
    # ...
```

---

### 2.5 — Service Worker (базовая реализация)

**frontend/public/sw.js:**

```javascript
const CACHE_NAME = 'wally-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/main.js',
  '/assets/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    }).catch(() => caches.match('/offline.html'))
  );
});
```

---

### 3.1 — Логирование

**backend/core/logging.py:**

```python
import logging
import sys
from core.config import settings

def setup_logging():
    logging.basicConfig(
        level=logging.DEBUG if settings.DEBUG else logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("wally.log") if not settings.DEBUG else logging.NullHandler(),
        ],
    )
    return logging.getLogger("wally")

logger = setup_logging()
```

---

## Чеклист перед продакшеном

```markdown
## Pre-production Checklist

### Безопасность
- [ ] RLS проверен для всех таблиц
- [ ] DELETE policy для profiles добавлена
- [ ] Backend использует anon_key, не service_role_key
- [ ] AI-ответы валидируются
- [ ] Rate limiting на /scan
- [ ] HTTPS везде
- [ ] CORS настроен правильно
- [ ] .env файлы не коммитятся

### Функциональность
- [ ] CRUD для expenses работает
- [ ] Offline-режим функционирует
- [ ] PWA устанавливается на устройства
- [ ] Google OAuth работает
- [ ] Email/password auth работает
- [ ] Receipt scanning работает
- [ ] Budget alerts отправляются

### Качество
- [ ] Unit-тесты написаны
- [ ] Логирование настроено
- [ ] Типизация полная
- [ ] Нет console.error в коде
- [ ] Error boundaries добавлены

### UX
- [ ] Loading states для всех операций
- [ ] Error messages информативные
- [ ] Мобильная версия протестирована
- [ ] Accessibility проверен (a11y)
```

---

## Заключение

Проект имеет хорошую архитектуру и базу, но требует доработки перед продакшеном. Приоритетны:

1. **Безопасность** — исправить RLS, валидацию AI-ответов
2. **Полный CRUD** — добавить update/delete для expenses
3. **Offline PWA** — реализовать service worker
4. **Качество** — тесты, типизация, логирование

Общая оценка зрелости проекта: **65/100**

---

*Документ создан автоматически. Требует обновления после каждой итерации.*
