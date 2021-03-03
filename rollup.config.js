import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/index.ts",
    external: ["overpass-ts"],
    output: {
      name: "superroute",
      file: "dist/superroute.js",
      format: "umd",
    },
    plugins: [typescript()],
  },
  {
    input: "src/index.ts",
    output: {
      name: "superroute",
      file: "dist/superroute.browser.js",
      format: "umd",
    },
    plugins: [
      nodeResolve({
        browser: true,
      }),
      commonjs(),
      typescript(),
    ],
  },
];
