
      #  Setup Prisma with Express & TypeScript

##  Overview

This guide explains how to set up a **TypeScript backend** using:

* Node.js + Express
* Prisma ORM (with PostgreSQL & Accelerate)
* ESLint + Prettier

---

##  1. Initialize Project

```bash
npm init -y
```

### Install dependencies

```bash
npm install express dotenv @prisma/client prisma zod cors bcryptjs express-session connect-pg-simple
```

### Install dev dependencies

```bash
npm install -D typescript tsx ts-node nodemon @types/node @types/express @types/express-session @types/bcryptjs @types/cors eslint @typescript-eslint/eslint-plugin prettier eslint-config-prettier
```

---

##  2. Configure `package.json`

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "start": "node dist/index.js",
    "lint": "eslint .",
    "format": "prettier --write .",
    "eslint:fix": "eslint . --fix"
  }
}
```

---

## 🧹 3. Setup ESLint

Create: `eslint.config.mjs`

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettier,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      "prefer-arrow-callback": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" }
      ],
      eqeqeq: ["error", "always"],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error"
    }
  }
);
```

---

##  4. Configure TypeScript

```bash
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "ESNext",
    "target": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node"],
    "sourceMap": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

---

##  5. Create Project Structure

```bash
mkdir src
```

---

##  6. Setup Prisma

```bash
npx prisma init
```

---

##  7. Configure Database

Go to Prisma Console and create a PostgreSQL database.

Add `.env`:

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"
```

---

##  8. Define Schema

`prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}
```

---

##  9. Configure Prisma (New Way)

Create `prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
```

---

##  10. Run Migration

```bash
npx prisma migrate dev --name init
```

---

##  11. Generate Prisma Client

```bash
npx prisma generate
```

---

##  12. Seed Database

Create: `prisma/seed.ts`

```ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.create({
    data: {
      email: "test@example.com"
    }
  });
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:

```bash
npx prisma db seed
```

---

##  13. Build Express Server

Create: `src/index.ts`

```ts
import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

##  14. Run Server

```bash
npm run dev
```

---

## Final Result

You now have:

* ✔ TypeScript backend
* ✔ Prisma ORM with PostgreSQL
* ✔ Database migrations
* ✔ Seed data
* ✔ Express API running

---

##  Next Steps

* Add authentication (JWT / session)
* Create routes, controllers, services
* Add validation with Zod
* Connect frontend to API

---
