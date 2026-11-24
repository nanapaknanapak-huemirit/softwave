import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(process.cwd());
const errors = [];
const notes = [];

function fail(message) {
  errors.push(message);
}

function read(relative) {
  const file = join(root, relative);
  if (!existsSync(file)) {
    fail(`Missing file: ${relative}`);
    return "";
  }
  return readFileSync(file, "utf8");
}

function walk(directory, output = []) {
  for (const entry of readdirSync(directory)) {
    if (entry === "node_modules" || entry === "_site" || entry === ".git") continue;
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) walk(full, output);
    else output.push(full);
  }
  return output;
}

const required = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "package.json",
  "README.md",
  "LICENSE",
  "PROJECT.md",
  "project.json",
  ".nojekyll",
  "assets/favicon.svg",
  "assets/css/theme.css",
  "assets/css/studio.css",
  "assets/js/app.js",
  "assets/js/state.js",
  "assets/js/ui.js",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/og.png",
  "01-concept/concept.md",
  "02-music-design/music-design.md",
  "03-arrangement/arrangement.md",
  "04-documentation/production-report.md",
  "05-review/review.md"
];
for (const file of required) {
  if (!existsSync(join(root, file))) fail(`Missing required file: ${file}`);
}

const html = read("index.html");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const seen = new Set();
for (const id of ids) {
  if (seen.has(id)) fail(`Duplicate id in index.html: ${id}`);
  seen.add(id);
}

const localReferences = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
for (const reference of localReferences) {
  if (!reference || reference.startsWith("#")) continue;
  if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(reference)) continue;
  if (reference.startsWith("/")) fail(`Root-relative reference breaks project Pages: ${reference}`);
  const clean = reference.split(/[?#]/)[0];
  if (!existsSync(join(root, clean))) fail(`HTML reference does not exist: ${reference}`);
}

const css = read("assets/css/theme.css") + read("assets/css/studio.css");
if (!/\[hidden\]\s*\{\s*display:\s*none/.test(css)) {
  fail("CSS must force [hidden] { display: none } so hidden controls stay hidden.");
}
for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
  const reference = match[1].trim().replace(/^["']|["']$/g, "");
  if (/^(?:data:|https?:|\/\/|#)/i.test(reference)) continue;
  if (!existsSync(join(root, "assets/css", reference.split(/[?#]/)[0]))) {
    fail(`CSS reference does not exist: ${reference}`);
  }
}

const app = read("assets/js/app.js");
const referencedIds = new Set([...app.matchAll(/\$\("#([A-Za-z0-9_-]+)"/g)].map((match) => match[1]));
const htmlIds = new Set(ids);
for (const id of referencedIds) {
  if (!htmlIds.has(id)) fail(`app.js references missing element id: #${id}`);
}

const jsFiles = walk(join(root, "assets/js"));
for (const file of jsFiles) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/(?:from|import)\s+"([^"]+)"/g)) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) continue;
    const target = resolve(dirname(file), specifier);
    if (!existsSync(target)) fail(`Unresolved import in ${file.replace(root + "/", "")}: ${specifier}`);
  }
}

let manifest = null;
try {
  manifest = JSON.parse(read("manifest.webmanifest"));
} catch (error) {
  fail(`manifest.webmanifest is not valid JSON: ${error.message}`);
}
if (manifest) {
  for (const key of ["name", "short_name", "start_url", "display", "icons"]) {
    if (!(key in manifest)) fail(`manifest.webmanifest is missing "${key}"`);
  }
  for (const icon of manifest.icons || []) {
    if (!existsSync(join(root, icon.src))) fail(`Manifest icon does not exist: ${icon.src}`);
  }
}

const sw = read("sw.js");
const shellMatch = sw.match(/const SHELL = \[([\s\S]*?)\];/);
if (!shellMatch) fail("sw.js does not declare a SHELL array");
else {
  for (const match of shellMatch[1].matchAll(/"([^"]+)"/g)) {
    const entry = match[1];
    if (entry === "./") continue;
    if (!existsSync(join(root, entry))) fail(`Service worker shell file does not exist: ${entry}`);
  }
}

try {
  const pkg = JSON.parse(read("package.json"));
  for (const script of ["serve", "check", "test", "build", "icons"]) {
    if (!pkg.scripts || !pkg.scripts[script]) fail(`package.json is missing the "${script}" script`);
  }
} catch (error) {
  fail(`package.json is not valid JSON: ${error.message}`);
}

try {
  const project = JSON.parse(read("project.json"));
  for (const key of ["name", "slug", "type", "status"]) {
    if (!(key in project)) fail(`project.json is missing "${key}"`);
  }
} catch (error) {
  fail(`project.json is not valid JSON: ${error.message}`);
}

if (!existsSync(join(root, ".nojekyll"))) fail("Missing .nojekyll for GitHub Pages");

notes.push(`${jsFiles.length} modules`);
notes.push(`${ids.length} ids`);
notes.push(`${localReferences.length} local references`);

if (errors.length) {
  console.error(`Check failed with ${errors.length} issue${errors.length === 1 ? "" : "s"}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Checks passed · ${notes.join(" · ")}`);
