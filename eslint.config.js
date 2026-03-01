import nextVitals from "eslint-config-next/core-web-vitals";
import perfectionist from "eslint-plugin-perfectionist";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// Use the official ESLint core defineConfig instead of tseslint.config
export default defineConfig([
  // 1. Global Ignores via official ESLint helper
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // 2. Next.js Native Flat Config 
  ...nextVitals,

  // 3. TypeScript Configuration
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // 4. Perfectionist Plugin
  perfectionist.configs["recommended-natural"],

  // 5. Custom Overrides & Setup
  {
    files:["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js", "*.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "perfectionist/sort-imports": "error",
    },
  },
]);