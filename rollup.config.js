import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/index.ts",
    external: ["overpass-ts", "@turf/length"],
    output: {
      name: "superroute",
      file: "dist/superroute.js",
      format: "umd",
      globals: {
        "overpass-ts": "overpass",
        "@turf/length": "turfLength"
      }
    },
    plugins: [typescript({ module: "es2015" })],
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
      typescript({ module: "es2015" }),
    ],
  },
];
