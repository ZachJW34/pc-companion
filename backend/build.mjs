import * as esbuild from "esbuild";
import path from "node:path";

await esbuild.build({
  entryPoints: [path.join(import.meta.dirname, "src", "index.ts")],
  platform: "node",
  bundle: true,
  packages: "external",
  allowOverwrite: true,
  outdir: path.join(import.meta.dirname, "dist"),
  format: "esm",
});
