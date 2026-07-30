import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: ["supabase/.temp/**"],
  },
  ...nextVitals,
  ...nextTypeScript,
];

export default eslintConfig;
