module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:tailwindcss/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "tailwindcss", "simple-import-sort"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "tailwindcss/no-custom-classname": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
};
