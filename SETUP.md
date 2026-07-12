# EcoSphere — Local Setup Guide

Follow these steps exactly after pulling the repo for the first time.

## 1. Prerequisites

- Node.js version 20 or higher (`node -v` to check)
- Docker Desktop installed and running (for local PostgreSQL)
- Git

## 2. Clone and install
git clone <repo-url>
cd ecosphere
npm install

text

## 3. Start your local PostgreSQL database
docker run --name ecosphere-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ecosphere -p 5432:5432 -d postgres:16

text

If port 5432 is already in use on your machine, change the left side of the port mapping, e.g. `-p 5433:5432`, and update DATABASE_URL accordingly.

## 4. Create your own .env file

Copy `.env.example` to `.env` and fill in your own values:
cp .env.example .env

text

On Windows PowerShell use:
Copy-Item .env.example .env

text

Do NOT commit your `.env` file. It is already in `.gitignore`.

## 5. Generate Prisma Client and sync schema
npx prisma generate
npx prisma migrate dev

text

If `migrate dev` says the database is already up to date, that is fine — it means the schema matches.

## 6. Seed test data
npx tsx prisma/seed.ts

text

This creates test departments. Copy one department ID from the terminal output for signup testing.

## 7. Run the app
npm run dev

text

Open http://localhost:3000/signup and create a test account using a department ID from step 6.

## 8. Branching rules

- Never commit directly to main except for shared infra (Member A only).
- Create your branch: `git checkout -b feature/<your-module-name>`
- Push every 1-2 hours: `git push -u origin feature/<your-module-name>`
- Open a PR into main, or message Member A to merge it.
- Always `git pull origin main` before starting new work each session to avoid stale schema/code.

## 9. If Prisma commands fail with a "url no longer supported" error

This project uses Prisma 7. The database URL lives in `prisma.config.ts`, NOT in `schema.prisma`. Do not add `url = env("DATABASE_URL")` back into schema.prisma — it will break the build for everyone.

## 10. Common issues

- "Cannot connect to database": check Docker container is running with `docker ps`.
- "Module not found @prisma/client": run `npx prisma generate` again.
- Port 3000 already in use: run `npm run dev -- -p 3001` instead.
