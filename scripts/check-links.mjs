import { readdir, readFile, stat } from 'node:fs/promises';
import { join, sep } from 'node:path';

const dist = 'dist';
const base = '/dil-lina';
const allowedExternal = [/^https:\/\/www\.booking\.com\/hotel\//, /^https:\/\/unsplash\.com\//, /^https:\/\/scripts\.stay22\.com\//];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function stripUrl(value) {
  const hash = value.split('#')[0];
  return hash.split('?')[0];
}

function toFile(pathname) {
  let path = pathname;
  if (path.startsWith(base)) path = path.slice(base.length);
  if (!path || path === '/') return join(dist, 'index.html');
  if (path.endsWith('/')) return join(dist, path.slice(1), 'index.html');
  return join(dist, path.slice(1));
}

const files = (await walk(dist)).filter((file) => file.endsWith('.html'));
const htmlFiles = new Set(files);
const errors = [];
const graph = new Map();

for (const file of files) {
  const html = await readFile(file, 'utf8');
  if (!html.includes("aid: 'dillina'") && !html.includes('aid: "dillina"')) {
    errors.push(`${file} is missing the Stay22 aid`);
  }
  if (file.split(sep).includes('hotels') && /\$\d/.test(html)) {
    errors.push(`${file} prints a dollar amount`);
  }
  const refs = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map((match) => match[1]);
  const internal = [];
  for (const ref of refs) {
    if (!ref || ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('data:')) continue;
    const bare = stripUrl(ref);
    let pathname = bare;
    if (bare.startsWith('https://nadavi256.github.io')) {
      pathname = new URL(bare).pathname;
    } else if (bare.startsWith('http://') || bare.startsWith('https://')) {
      if (!allowedExternal.some((pattern) => pattern.test(bare))) errors.push(`${file} has unexpected external URL ${bare}`);
      continue;
    } else if (!bare.startsWith('/')) {
      errors.push(`${file} has a relative URL ${bare}`);
      continue;
    }
    if (!pathname.startsWith(base)) {
      errors.push(`${file} escapes the base path: ${pathname}`);
      continue;
    }
    const target = toFile(pathname);
    internal.push(target);
    try {
      const info = await stat(target);
      if (!info.isFile()) errors.push(`${file} -> ${pathname} is not a file`);
    } catch {
      errors.push(`${file} -> missing ${pathname} (${target})`);
    }
  }
  graph.set(file, internal);
}

const start = join(dist, 'index.html');
const seen = new Set();
const queue = [start];
while (queue.length) {
  const current = queue.pop();
  if (!current || seen.has(current) || !htmlFiles.has(current)) continue;
  seen.add(current);
  for (const next of graph.get(current) ?? []) queue.push(next);
}

for (const file of htmlFiles) {
  if (file.endsWith(join('404.html'))) continue;
  if (!seen.has(file)) errors.push(`Unreachable page ${file}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Links ok: ${files.length} HTML files, all reachable from home.`);
