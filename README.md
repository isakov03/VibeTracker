This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Установка
Установка зависимостей:
```bash
npm install
```
Создание бд с помощью скрипта docker:
```bash
docker compose up -d
```
Команда на случай, если способ выше не работает:
```bash
docker run --name vibetracker-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD={твой пароль} -e POSTGRES_DB=vibetracker -p 5432:5432 -d postgres:15-alpine
```
Инициализация Prisma
```bash
npx prisma generate
npx prisma db push
```

Измени расширение файла .env.example -> .env и сгенерируй AUTH_SECRET:
```bash
openssl rand -base64 32
```

Запуск:
```bash
npm run dev
```