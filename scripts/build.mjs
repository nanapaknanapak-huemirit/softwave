import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const out = join(root, "_site");
const entries = ["index.html", "manifest.webmanifest", "sw.js", "assets", "LICENSE", "README.md"];

for (const entry of entries) {
  if (!existsSync(join(root, entry))) {
    console.error(`Build failed: missing ${entry}`);
    process.exit(1);
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const entry of entries) {
  await cp(join(root, entry), join(out, entry), { recursive: true });
}
await writeFile(join(out, ".nojekyll"), "");

async function count(directory) {
  let total = 0;
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.isDirectory()) total += await count(join(directory, item.name));
    else total += 1;
  }
  return total;
}

const files = await count(out);
console.log(`Built _site · ${files} files · ready for static hosting`);
