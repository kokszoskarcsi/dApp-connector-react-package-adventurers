import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import images from "@rollup/plugin-image";
import { terser } from "rollup-plugin-terser";
import dotenv from "rollup-plugin-dotenv";

export default [
  {
    input: "src/index.js",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
      },
      {
        file: "dist/index.es.js",
        format: "es",
        exports: "named",
      },
    ],
    plugins: [
      dotenv(),
      postcss({
        plugins: [],
        minimize: true,
      }),
      images(),
      babel({
        exclude: "node_modules/**",
        runtimeHelpers: true,
        presets: ["@babel/preset-react", "@babel/preset-env"],
      }),
      external(),
      resolve(),
      terser(),
    ],
  },
];
