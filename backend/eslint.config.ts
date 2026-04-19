import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["node_modules/**", "dist/**"],
  },

  js.configs.recommended,


  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      // No implicit/unsafe any
      "@typescript-eslint/no-explicit-any": "error",

      // Arrow functions
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",

      // Unused vars
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],

      // Strict equality
      eqeqeq: ["error", "always"],

      // Async safety
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",

      // Naming convention
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
    },
  },
]);