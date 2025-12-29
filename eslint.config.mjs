import next from "eslint-config-next";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    extends: [
        next,
    ]
  },
  {
    ignores: [
      ".next/",
      "out/",
      "build/",
      "next-env.d.ts",
    ],
  }
);