import coreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...coreWebVitals,
  {
    ignores: [".next-build/**", ".next/**", "out/**", "build/**"],
  },
];

export default eslintConfig;
