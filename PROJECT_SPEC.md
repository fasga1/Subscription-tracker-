# 📦 SUBSCRIPTION TRACKER — PROJECT SPECIFICATION & CURSOR AI CONTEXT

## 🎯 1. OVERVIEW
**Цель:** Веб-приложение для централизованного отслеживания семейных подписок с удобной группировкой, визуальным контролем сроков списаний и прямыми ссылками на оплату.  
**Целевая аудитория:** Личное использование + члены семьи (4–8 пользователей).  
**Ключевые функции:**
- Группировка подписок (Семейные, Мои, Мама, Сестра, Брат и т.д.)
- Поля подписки: сервис, стоимость, валюта, цикл оплаты, дата следующего списания, ссылка на оплату
- Дашборд с агрегатами (сумма/мес, ближайшие списания)
- Напоминания за 7/3/1 день до списания
- PWA-установка на iOS/Android/Desktop
- Многопользовательский доступ с изоляцией данных через RLS

---

## 🛠 2. TECH STACK & ARCHITECTURE
| Слой          | Технология                          | Обоснование                                                                 |
|---------------|-------------------------------------|-----------------------------------------------------------------------------|
| Frontend      | Next.js 14+ (App Router) + TS       | SSR/SSG, роутинг, встроенная оптимизация, отличная экосистема               |
| UI/Стили      | TailwindCSS + shadcn/ui             | Быстрая разработка, доступность (a11y), консистентные компоненты            |
| PWA           | next-pwa / native Service Worker    | Установка на устройства, офлайн-кэш статики                                 |
| Backend/БД    | Supabase (PostgreSQL + Auth + RLS)  | Готовая авторизация, строгая изоляция данных, встроенные функции/триггеры   |
| Хостинг       | Vercel                              | Бесплатный тариф, preview-деплои, cron-задачи, глобальный CDN               |
| Напоминания   | Vercel Cron / Supabase Edge Functions + Resend | Ежедневный скан БД, отправка email/push без внешнего сервера          |

---

## 🗃 3. DATABASE SCHEMA (Supabase)
```sql
-- Таблицы создаются в public схеме
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1', -- hex для UI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL CHECK (cost >= 0),
  currency TEXT DEFAULT 'RUB',
  billing_cycle TEXT CHECK (billing_cycle IN ('daily', 'monthly', 'yearly')) NOT NULL,
  next_billing_date DATE NOT NULL,
  payment_url TEXT CHECK (payment_url ~ '^https?://'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица для шаринга групп
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'viewer')) DEFAULT 'viewer',
  PRIMARY KEY (group_id, user_id)
);




🔒 Row Level Security (RLS) Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Профили: пользователь видит/редактирует только свой
CREATE POLICY "Users see own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Группы: владелец + члены group_members
CREATE POLICY "Groups access" ON groups FOR ALL USING (
  auth.uid() = owner_id OR 
  auth.uid() IN (SELECT user_id FROM group_members WHERE group_id = groups.id)
);

-- Подписки: по группам
CREATE POLICY "Subscriptions access" ON subscriptions FOR ALL USING (
  group_id IN (SELECT id FROM groups WHERE owner_id = auth.uid() OR auth.uid() IN (SELECT user_id FROM group_members WHERE group_id = groups.id))
);

-- Group members: админ может управлять, владелец всегда видит
CREATE POLICY "Group members access" ON group_members FOR ALL USING (
  group_id IN (SELECT id FROM groups WHERE owner_id = auth.uid())
);



🖼 4. UI/UX STRUCTURE & COMPONENTS

📐 Layout
Desktop: Sidebar (группы) + Main Content (дашборд/список) + Header (поиск, профиль)
Mobile: Bottom Navigation (Главная | Группы | Напоминания | Профиль) + FAB (➕ Добавить)
Группы: горизонтальные чипы над списком или боковое меню с цветными индикаторами
Карточки подписок: сервис, стоимость/цикл, next_billing_date, кнопка Оплатить (открывает payment_url в _blank)

🎨 UX Rules
Цветовая индикация сроков: <3 дн → красный, <7 дн → жёлтый, >7 дн → серый/зелёный
Сортировка по умолчанию: ближайшие списания → сверху
Формы: валидация на клиенте (Zod) + серверная проверка
Темы: светлая/тёмная (Tailwind dark:), системная синхронизация
Доступность: aria-label, фокус-состояния, контраст ≥ 4.5:1

🧩 Компонентная иерархия
/app
  /dashboard → page.tsx
  /groups → page.tsx
  /subscriptions/[id] → edit/page.tsx
/components
  /ui → shadcn (button, dialog, input, select, card, badge, calendar)
  /layout → AppSidebar.tsx, Header.tsx, MobileNav.tsx
  /features → SubscriptionCard.tsx, AddSubscriptionModal.tsx, BillingSummary.tsx
/lib
  supabase.ts, validations.ts, date-utils.ts, constants.ts



🗺 5. DEVELOPMENT ROADMAP (8 PHASES)

Этап
Задачи
Deliverable
1. Инициализация
Next.js + TS + Tailwind + shadcn, .cursorrules, структура папок, Supabase проект
Рабочий localhost:3000, подключенный к Supabase
2. Auth & RLS
Supabase Auth (Email/Google), middleware защиты роутов, RLS политики
Логин/регистрация, изоляция данных
3. CRUD подписок
Формы, Zod-валидация, useSubscription хук, Supabase client calls
Создание/редактирование/удаление, расчёт next_billing_date
4. Группы & Дашборд
Боковое меню, агрегаты (сумма/мес, ближайшие списания), сортировка/фильтры
Полноценный обзор всех подписок
5. PWA & Напоминания
manifest.json, Service Worker, Vercel Cron + Resend (email за 7/3/1 дн)
Установка на устройства, уведомления
6. Безопасность
CSP/HSTS headers, сессионные таймауты, проверка RLS, экспорт/бэкап CSV
Готовность к продакшену
7. Тестирование
Vitest (логика дат/сумм), Playwright (E2E), Lighthouse (perf/a11y)
Стабильная сборка, покрытие >70%
8. Деплой & Docs
Vercel, custom domain, Sentry, README.md для семьи
Живой сервис, инструкция



🔐 6. SECURITY & PRIVACY CHECKLIST
RLS включён на все таблицы, политики проверены через Supabase SQL Editor
payment_url валидируется regex ^https?://, открывается с rel="noopener noreferrer"
Нет хранения токенов/паролей сервисов, только внешние ссылки
next.config.js: headers() → CSP, X-Content-Type-Options, Referrer-Policy, HSTS
Сессии: supabase.auth.getSession(), автологут при неактивности >30 дней
Бэкапы: ручной экспорт CSV раз в месяц, Supabase daily backups включены
Все внешние зависимости обновлены, npm audit чистый



🤖 7. CURSOR AI WORKFLOW & RULES
📄 Файл .cursorrules (положить в корень проекта)
- Стек: Next.js 14 App Router, TypeScript, TailwindCSS, shadcn/ui, Supabase JS v2
- Всегда используй строгую типизацию. Запрещено `any` или `// @ts-ignore` без обоснования
- Компоненты экспортируй как named exports. Пропсы типизируй интерфейсами
- Для валидации форм используй Zod + react-hook-form
- Все запросы к БД оборачивай в try/catch, логируй через консоль в dev, Sentry в prod
- Не меняй структуру папок без согласования. Добавляй файлы только в указанные директории
- Перед генерацией кода задавай уточняющие вопросы, если есть неоднозначность
- После генерации: запускай `npm run lint && tsc --noEmit && npm run build` и отчитывайся о результате


💡 Prompt-паттерны для Cursor
Инициализация:
Создай Next.js 14 проект с TS, Tailwind, shadcn/ui. Настрой папочную структуру согласно PROJECT_SPEC.md. Добавь .cursorrules. Дай команды для установки зависимостей.
Компонент:
Сгенерируй SubscriptionCard.tsx по спецификации. Используй shadcn Card, Badge для статуса даты, Tailwind dark: support. Добавь aria-labels. Напиши Zod-схему для пропсов.
Supabase хук:
Напиши useSubscriptions() хук. Подключись к таблице subscriptions с RLS. Реализуй загрузку, кэширование SWR/React Query, обработку ошибок. Верни типизированный интерфейс.
Напоминания:
Создай Vercel Cron маршрут /api/cron/reminders. Раз в день проверяй БД, найди подписки со next_billing_date ≤ 7/3/1 дней, отправь email через Resend. Добавь логирование и retry.


✅ Валидация после каждого шага
npm run lint          # ESLint + Next.js rules
npx tsc --noEmit      # Строгая проверка типов
npm run build         # Убедиться, что SSR/SSR не ломается
npx playwright test   # E2E (на этапе 7)
npx lighthouse-cli http://localhost:3000 --view  # Perf/A11y


📎 APPENDIX: QUICK REFERENCES
Supabase Docs: https://supabase.com/docs
Next.js App Router: https://nextjs.org/docs/app
shadcn/ui: https://ui.shadcn.com
Vercel Cron: https://vercel.com/docs/cron-jobs
Resend (Email): https://resend.com
PWA Checklist: https://web.dev/progressive-web-apps/