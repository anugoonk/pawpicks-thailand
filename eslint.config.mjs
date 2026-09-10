import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "legacy-static/**",
    ],
  },
  {
    // The storefront intentionally uses <img> for the original CSS crop
    // effects (transform: scale / object-position) that next/image overrides.
    files: ["components/**/*.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
];

export default eslintConfig;
