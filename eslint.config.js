// @ts-check
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/coverage/**", "docs/**"] },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // CLAUDE.md: no `any`, no non-null assertions outside tests.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      // Template literals with numbers are common and safe (e.g. `${n} books`).
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      // CLAUDE.md: named exports only.
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message: "Use named exports (see CLAUDE.md).",
        },
      ],
    },
  },

  // Tool config files must default-export, and are plain JS outside any tsconfig.
  {
    files: ["**/*.config.{js,ts}", "**/vite.config.ts", "**/vitest.config.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },

  // Tests may use non-null assertions to keep fixtures readable.
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },

  // Browser app.
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  // Node code.
  {
    files: ["apps/api/**/*.ts", "*.config.js"],
    languageOptions: { globals: globals.node },
  },
);
