# PhoneMarket — магазин смартфонов

Полнофункциональный full-stack интернет-магазин на стеке:

- **Frontend**: React + TypeScript + Vite + Tailwind + Zustand + React Router (→ Vercel)
- **Backend**: NestJS + Prisma + JWT (access + refresh) (→ Railway)
- **DB**: PostgreSQL (→ Railway)

## Функционал

### Покупатель
- Главная, каталог с **фильтрами** (бренд, цена, память, RAM, цвет), **поиском с автодополнением**, сортировками, пагинацией
- Страница товара: галерея, выбор **цвета + памяти + RAM** (каждый вариант = свой SKU/остаток/цена), характеристики, **отзывы со звёздами**, **Q&A**
- **Корзина** (привязана к пользователю, в БД)
- **Оформление заказа**: несколько адресов, выбор сохранённого, комментарий
- **Мои заказы** + детальная карточка, **отмена** с возвратом остатка
- **Избранное** (wishlist)
- **Сравнение** до 4 моделей в табличном виде
- **Недавно просмотренные** (трекинг в БД)
- Профиль + менеджер адресов
- JWT access + refresh, авто-обновление токена на 401

### Админ
- Дашборд: выручка, счётчики, топ товаров, заказы по статусам, последние заказы
- CRUD товаров с вариантами и галереей
- Управление заказами, смена статуса (PENDING → CONFIRMED → PACKED → SHIPPED → DELIVERED, CANCELLED)
- Управление пользователями, смена ролей
- CRUD брендов

## Структура

```
.
├── backend/          NestJS API
│   ├── src/
│   │   ├── auth/      JWT + refresh + роли
│   │   ├── users/
│   │   ├── addresses/
│   │   ├── brands/
│   │   ├── categories/
│   │   ├── products/  фильтры, facets, suggest, compare, related
│   │   ├── cart/
│   │   ├── favorites/
│   │   ├── orders/    с транзакционной резервацией остатков
│   │   ├── reviews/
│   │   ├── questions/ Q&A с ответами
│   │   ├── recently-viewed/
│   │   └── admin/     дашборд, юзеры
│   └── prisma/
│       ├── schema.prisma
│       └── seed.ts    6 брендов, 4 категории, 12 смартфонов
└── frontend/         React SPA
    └── src/
        ├── components/
        ├── pages/
        │   └── admin/
        ├── store/     Zustand
        ├── api.ts     axios + auto-refresh
        └── types.ts
```

## Локальный запуск

### 1. Backend

```bash
cd backend
cp .env.example .env
# пропишите DATABASE_URL (можно локальный Postgres или Railway)
# задайте JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

API: http://localhost:3000/api

Тестовые аккаунты после seed:
- Админ: `admin@shop.local` / `admin12345`
- Пользователь: `user@shop.local` / `user12345`

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000/api
npm install
npm run dev
```

UI: http://localhost:5173

## Деплой

### PostgreSQL (Railway)
1. В проекте Railway → **New → Database → PostgreSQL**
2. Скопируйте `DATABASE_URL` из вкладки **Connect**

### Backend (Railway)
1. В том же проекте → **New → GitHub Repo** → укажите папку `backend` как Root Directory
2. Переменные окружения:
   - `DATABASE_URL` — из Postgres
   - `JWT_ACCESS_SECRET` — случайная строка (`openssl rand -base64 32`)
   - `JWT_REFRESH_SECRET` — другая случайная строка
   - `JWT_ACCESS_TTL=15m`
   - `JWT_REFRESH_TTL=30d`
   - `CORS_ORIGIN` — URL фронтенда на Vercel (через запятую можно несколько)
   - `PORT=3000` (Railway сам прокинет)
3. Railway подтянет `railway.json` и выполнит миграции + старт
4. Для первичного seed вызовите в Railway shell: `npm run prisma:seed`

### Frontend (Vercel)
1. Import Project → укажите папку `frontend`
2. Переменные:
   - `VITE_API_URL` = `https://<your-backend>.up.railway.app/api`
3. Build: `npm run build`, Output: `dist`

## API endpoints (всё под `/api`)

| Метод | Путь | Описание |
|---|---|---|
| POST | `/auth/register` | Регистрация |
| POST | `/auth/login` | Вход |
| POST | `/auth/refresh` | Обновить токен |
| POST | `/auth/logout` | Выход |
| GET | `/users/me` | Профиль |
| PATCH | `/users/me` | Обновить профиль |
| GET/POST/PATCH/DELETE | `/addresses[/…]` | Адреса |
| GET | `/brands` | Все бренды |
| GET | `/categories` | Все категории |
| GET | `/products?search=&brand=&sort=&…` | Каталог |
| GET | `/products/facets` | Доступные фильтры |
| GET | `/products/suggest?q=` | Автодополнение |
| GET | `/products/compare?ids=` | Сравнение |
| GET | `/products/:slug` | Карточка товара |
| GET | `/products/:slug/related` | Похожие |
| POST/PATCH/DELETE | `/products[/…]` | CRUD (admin) |
| GET/POST/PATCH/DELETE | `/cart[/…]` | Корзина |
| GET | `/favorites` / POST `/favorites/toggle/:productId` | Избранное |
| POST | `/orders` | Создать заказ |
| GET | `/orders/my` | Мои заказы |
| GET | `/orders/admin?status=&search=` | Все заказы (admin) |
| GET | `/orders/:id` | Детали |
| POST | `/orders/:id/cancel` | Отменить |
| PATCH | `/orders/:id/status` | Сменить статус (admin) |
| POST/DELETE | `/reviews[/…]` | Отзывы |
| POST/DELETE | `/questions[/…]` + `/answers/:id` | Q&A |
| GET/POST | `/recently-viewed[/:productId]` | Недавние |
| GET | `/admin/stats` | Дашборд |
| GET/PATCH | `/admin/users[/…]/role` | Пользователи |

## Сравнение с ATELIER

| | ATELIER | PhoneMarket |
|---|---|---|
| Варианты товара | ❌ | ✅ цвет + память + RAM |
| Несколько фото | ❌ | ✅ галерея |
| Бренды как сущность | ❌ | ✅ |
| Поиск с автодополнением | ❌ | ✅ |
| Фильтры-facets | ❌ | ✅ |
| Отзывы | ❌ | ✅ со звёздами и «проверено» |
| Q&A | ❌ | ✅ |
| Избранное | ❌ | ✅ |
| Сравнение | ❌ | ✅ до 4 товаров |
| Недавно просмотренные | ❌ | ✅ |
| Несколько адресов | ❌ | ✅ |
| Refresh-токены | ❌ | ✅ |
| Роли USER/ADMIN | ✅ | ✅ |
| Админка с дашбордом | частично | ✅ полная |
| Резервация остатков | ❌ | ✅ транзакционно |
