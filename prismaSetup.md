How to set up Prisma 7 with Express and TypeScript
1. Initialize the project
npm init -y
npm install express dotenv @prisma/client@6.17 @prisma6.17 

npm install -D typescript@5 ts-node tsx nodemon @types/node @types/express eslint @typescript-eslint/eslint-plugin prettier eslint-config-prettier @types/node


2. Configure package.json--
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.ts",
  "scripts": {
    "dev": "nodemon index.ts",
    "start": "node index.ts",
    "test": "echo \"Error: no test specified\" && exit 1",
    "lint": "eslint .",
    "format": "prettier --write .",
    "eslint:fix": "eslint . --fix"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "@prisma/client": "^6.17.0",
    "bcryptjs": "^3.0.3",
    "connect-pg-simple": "^10.0.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.1",
    "express": "^5.2.1",
    "express-session": "^1.19.0",
    "prisma": "^6.17.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/express-session": "^1.18.2",
    "eslint": "^10.2.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.5",
    "nodemon": "^3.1.10",
    "prettier": "^3.8.1",
    "ts-node": "^10.9.2",
    "tsx": "^4.21.0",
    "typescript": "^6.0.2"
  }
}

2. Set up ESLint
Create a new at the root eslint.config.js:

// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

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
      // No implicit/unsafe any style
      "@typescript-eslint/no-explicit-any": "error",

      // Consistent arrow functions
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      "prefer-arrow-callback": "error",

      // No unused vars
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],

      // Strict equality
      eqeqeq: ["error", "always"],

      // Async/await safety
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",

      // Naming style
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        { selector: "typeLike", format: ["PascalCase"] },
      ],
    },
  },

);
3. Configure tsconfig.json
npx tsc --init
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "ESNext",
    "target": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  }
  "include": ["src/**/*"]
}
Create src folder at the root

npx tsc

4. Set up Prisma
npx prisma init
Then go to https://console.prisma.io, create a new project, select Prisma Postgres and enable Accelerate.

Copy the connection string into your .env:

DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_key_here"

5. Write your schema
In prisma/schema.prisma:

generator client {
  provider            = "prisma-client-js"  
  importFileExtension = "ts"
}

datasource db {
  provider = "postgresql"
}

model User {
}

6. Configure prisma.config.ts
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
7. Run the migration
npx prisma migrate dev --name create_table

8. Generate the Prisma client
npx prisma generate

9. Write the seed file
In prisma/seed.ts:

import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client.js"
import { withAccelerate } from "@prisma/extension-accelerate"

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate())

const seed = async () {
  await 
}

seed().then(() => prisma.$disconnect())
Then run:
npx prisma db seed


10. Build the Express API
In src/index.ts import PrismaClient from the generated path:

import { PrismaClient } from "./generated/prisma/client.js"
import { withAccelerate } from "@prisma/extension-accelerate"
import { z } from "zod"

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate())
Then add your routes and start the server with:

npm run dev
