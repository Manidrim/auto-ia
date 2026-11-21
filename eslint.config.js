import js from "@eslint/js";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "package-lock.json"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
];
