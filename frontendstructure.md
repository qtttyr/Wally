frontend/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── src/
│   ├── main.tsx
│   ├── App.tsx                        # Роутер + провайдеры
│   ├── vite-env.d.ts
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   │   └── LoginPage.tsx          # Google OAuth экран
│   │   ├── Dashboard/
│   │   │   ├── DashboardPage.tsx      # Главный экран
│   │   │   └── components/
│   │   │       ├── SummaryCards.tsx   # Карточки: траты, лимит, подписки
│   │   │       └── RecentExpenses.tsx # Последние 5 трат
│   │   ├── Scan/
│   │   │   ├── ScanPage.tsx           # Камера + загрузка фото
│   │   │   └── components/
│   │   │       ├── CameraView.tsx     # Компонент камеры
│   │   │       └── ParseResult.tsx    # Результат парсинга — редактирование
│   │   ├── Expenses/
│   │   │   ├── ExpensesPage.tsx       # Список всех трат + фильтры
│   │   │   └── components/
│   │   │       ├── ExpenseItem.tsx    # Строка траты
│   │   │       └── ExpenseFilters.tsx # Фильтр по дате/категории
│   │   ├── Budget/
│   │   │   ├── BudgetPage.tsx         # Лимиты по категориям
│   │   │   └── components/
│   │   │       └── BudgetCategory.tsx # Прогресс + редактирование лимита
│   │   ├── Subscriptions/
│   │   │   ├── SubsPage.tsx           # Список подписок
│   │   │   └── components/
│   │   │       └── SubCard.tsx        # Карточка одной подписки
│   │   ├── Analytics/
│   │   │   ├── AnalyticsPage.tsx      # Графики и отчёты
│   │   │   └── components/
│   │   │       ├── SpendingChart.tsx  # Donut/Bar по категориям
│   │   │       └── TrendChart.tsx     # Линейный тренд по месяцам
│   │   └── Settings/
│   │       └── SettingsPage.tsx       # Профиль, Pro, logout
│   │
│   ├── components/                    # Переиспользуемые компоненты
│   │   ├── ui/
│   │   │   ├── Button.tsx             # variant: primary | ghost | danger
│   │   │   ├── Input.tsx              # + label + error состояние
│   │   │   ├── Modal.tsx              # Portal + backdrop
│   │   │   ├── Card.tsx               # Базовая карточка
│   │   │   ├── Badge.tsx              # Категория, статус
│   │   │   ├── Spinner.tsx            # Лоадер
│   │   │   └── Toast.tsx              # Враппер react-hot-toast
│   │   │
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Обёртка: BottomNav + контент
│   │   │   ├── BottomNav.tsx          # Нижняя навигация (мобайл)
│   │   │   └── PageHeader.tsx         # Заголовок страницы + back кнопка
│   │   │
│   │   ├── features/
│   │   │   ├── AiInsightCard.tsx      # Карточка AI совета
│   │   │   ├── StreakBadge.tsx        # Streak + ачивки
│   │   │   ├── InstallPrompt.tsx      # PWA install баннер
│   │   │   ├── CategoryIcon.tsx       # Иконка + цвет категории
│   │   │   └── ProBanner.tsx          # Баннер апгрейда до Pro
│   │   │
│   │   └── guards/
│   │       └── PrivateRoute.tsx       # Редирект если не авторизован
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                 # Текущий юзер, login, logout
│   │   ├── useExpenses.ts             # CRUD трат
│   │   ├── useBudget.ts               # Лимиты, прогресс по категориям
│   │   ├── useSubscriptions.ts        # CRUD подписок
│   │   ├── useAiInsights.ts           # Запрос AI советов
│   │   ├── useInstallPrompt.ts        # beforeinstallprompt event
│   │   └── useOfflineSync.ts          # IndexedDB ↔ API синхронизация
│   │
│   ├── store/
│   │   ├── authStore.ts               # user, isLoading, token
│   │   ├── expensesStore.ts           # expenses[], фильтры
│   │   └── uiStore.ts                 # activeModal, toast queue
│   │
│   ├── services/
│   │   ├── api.ts                     # Axios instance + auth interceptor
│   │   ├── expenseService.ts          # GET/POST/PUT/DELETE /expenses
│   │   ├── scanService.ts             # POST /scan/receipt (FormData)
│   │   ├── budgetService.ts           # GET/POST /budgets
│   │   ├── subscriptionService.ts     # GET/POST /subscriptions
│   │   └── aiService.ts               # GET /ai/insights
│   │
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client (anon key)
│   │   └── idb.ts                     # IndexedDB helpers (offline)
│   │
│   ├── types/
│   │   ├── expense.ts                 # Expense, Category, ExpenseCreate
│   │   ├── budget.ts                  # Budget, BudgetProgress
│   │   ├── subscription.ts            # Subscription
│   │   ├── ai.ts                      # AiInsight
│   │   └── user.ts                    # User, Plan (free | pro)
│   │
│   ├── utils/
│   │   ├── formatCurrency.ts          # formatCurrency(amount, currency)
│   │   ├── formatDate.ts              # formatDate, getMonthRange
│   │   └── cn.ts                      # clsx helper для Tailwind
│   │
│   ├── constants/
│   │   ├── categories.ts              # CATEGORIES[] с иконкой и цветом
│   │   ├── routes.ts                  # ROUTES объект всех путей
│   │   └── plans.ts                   # FREE_LIMITS, PRO_FEATURES
│   │
│   └── styles/
│       ├── globals.css                # Tailwind directives + base стили
│       └── variables.css              # CSS переменные (цвета, радиусы)
│
├── .env
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json


backend/
├── app/
│   ├── main.py                 # Точка входа FastAPI
│   │
│   ├── api/                    # Роуты
│   │   ├── __init__.py
│   │   ├── deps.py             # Зависимости (get_current_user и тд)
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py       # Главный роутер v1
│   │       ├── auth.py         # POST /auth/verify-token
│   │       ├── scan.py         # POST /scan/receipt
│   │       ├── expenses.py     # CRUD /expenses
│   │       ├── budgets.py      # CRUD /budgets
│   │       ├── subscriptions.py
│   │       ├── ai.py           # GET /ai/insights
│   │       └── export.py       # GET /export/pdf, /export/csv
│   │
│   ├── core/                   # Конфиг и безопасность
│   │   ├── config.py           # Все настройки (pydantic BaseSettings)
│   │   ├── security.py         # JWT верификация Supabase токена
│   │   └── logging.py          # Логгер
│   │
│   ├── services/               # Бизнес-логика
│   │   ├── ocr_service.py      # Google ML Kit / Tesseract OCR
│   │   ├── ai_service.py       # OpenRouter — категоризация + советы
│   │   ├── export_service.py   # Генерация PDF/CSV
│   │   └── notification_service.py  # Push через FCM
│   │
│   ├── models/                 # Pydantic схемы
│   │   ├── expense.py
│   │   ├── budget.py
│   │   ├── subscription.py
│   │   ├── scan.py             # Входные/выходные данные скана
│   │   └── ai.py               # Схемы AI инсайтов
│   │
│   ├── db/
│   │   ├── supabase.py         # Supabase client (service role)
│   │   └── queries.py          # Готовые SQL запросы
│   │
│   └── utils/
│       ├── image_utils.py      # Сжатие/обработка фото перед OCR
│       └── currency.py         # Конвертация валют
│
├── tests/
│   ├── conftest.py
│   ├── test_scan.py
│   ├── test_ai.py
│   └── test_expenses.py
│
├── .env                        # Не в git!
├── .env.example
├── .gitignore
├── Dockerfile
├── requirements.txt
└── pyproject.toml