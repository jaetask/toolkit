// Copies the stylesheets beside the compiled files, as the agent-native toolkit's build does, so
// dist/styles.css and its @import and @source paths work from the published package.
import { copyFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

for (const file of walk("src")) {
  if (extname(file) !== ".css") continue;
  const out = join("dist", relative("src", file));
  mkdirSync(dirname(out), { recursive: true });
  copyFileSync(file, out);
}
