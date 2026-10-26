#!/usr/bin/env node
// Runs our eval cases against Ingot and the pinned third-party plugins, on your Claude subscription.
//
//   node evals/run.mjs                          every suite
//   node evals/run.mjs humanizer --ref v3.2.0   one suite, against a candidate tag (before moving a pin)
//   node evals/run.mjs ingot --case rules-*     extra options go to `claude plugin eval`
//
// Each suite folder here is named after its marketplace in marketplaces.txt. The plugin is cloned at its pinned tag
// (or copied from this repo for ingot) into a temp folder with our cases added, so its own files are never touched.
// Results: evals/results/<suite>.json and .html (not committed).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.dirname(here);
const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args.splice(i, 2)[1]; };
const ref = opt('--ref');
const runs = opt('--runs', '1');
const suites = [];
while (args.length && !args[0].startsWith('-')) suites.push(args.shift());
const all = fs.readdirSync(here, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'results').map((d) => d.name);
const chosen = suites.length ? suites : all;
if (ref && chosen.length !== 1) { console.error('--ref needs exactly one suite.'); process.exit(1); }
const unknown = chosen.filter((s) => !all.includes(s));
if (unknown.length) { console.error(`No suite named ${unknown.join(', ')}. Suites: ${all.join(', ')}`); process.exit(1); }

const lines = (f) => fs.readFileSync(path.join(repo, f), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
// Evals refuse shell tools where they can't sandbox them (native Windows), so those cases run on macOS, Linux or WSL.
const shellOk = process.platform !== 'win32';
const needsShell = (dir) => ['prompt.md', 'case.yaml'].some((f) => fs.existsSync(path.join(dir, f)) &&
  /allowed_tools:.*\b(Bash|PowerShell)\b/.test(fs.readFileSync(path.join(dir, f), 'utf8')));
const sh = (cmd, cwd) => spawnSync(cmd, { shell: true, stdio: 'inherit', cwd }).status;
const results = path.join(here, 'results');
fs.mkdirSync(results, { recursive: true });

// Returns the plugin folder to evaluate: a copy of ours, or the third-party plugin cloned at its pinned tag.
function pluginDir(suite, tmp) {
  if (suite === 'ingot') {
    const dest = path.join(tmp, 'ingot');
    fs.cpSync(path.join(repo, 'plugins', 'ingot'), dest, { recursive: true });
    return dest;
  }
  const line = lines('marketplaces.txt').map((l) => l.split(/\s+/)).find(([name]) => name === suite);
  if (!line) throw new Error(`${suite} is not in marketplaces.txt`);
  const [slug, pinned] = line[1].split('#');
  const tag = ref ?? pinned;
  const clone = path.join(tmp, 'src');
  if (sh(`git -c advice.detachedHead=false clone --quiet --depth 1 ${tag ? `--branch ${tag} ` : ''}https://github.com/${slug}.git "${clone}"`) !== 0) throw new Error(`could not clone ${slug}${tag ? ` at ${tag}` : ''}`);
  const plugin = lines('plugins.txt').find((p) => p.endsWith(`@${suite}`))?.split('@')[0];
  const entry = JSON.parse(fs.readFileSync(path.join(clone, '.claude-plugin', 'marketplace.json'), 'utf8')).plugins.find((p) => p.name === plugin);
  if (typeof entry?.source !== 'string') throw new Error(`${slug} has no local plugin source for ${plugin}`);
  console.log(`${suite}: ${slug} at ${tag ?? 'its default branch'}`);
  // resolve() drops the trailing slash of "./", which would escape the closing quote on Windows.
  const dir = path.resolve(clone, entry.source);
  // Some plugins are declared only in marketplace.json; write the same declaration as a plugin.json so eval loads it.
  const manifest = path.join(dir, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(manifest)) {
    const { source, strict, category, tags, ...declared } = entry;
    fs.mkdirSync(path.dirname(manifest), { recursive: true });
    fs.writeFileSync(manifest, JSON.stringify(declared, null, 2));
  }
  return dir;
}

let failed = 0;
for (const suite of chosen) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `ingot-eval-${suite}-`));
  try {
    const dir = pluginDir(suite, tmp);
    const cases = path.join(dir, 'ingot-evals');
    fs.cpSync(path.join(here, suite), cases, { recursive: true });
    for (const c of fs.readdirSync(cases)) {
      if (shellOk || !needsShell(path.join(cases, c))) continue;
      fs.rmSync(path.join(cases, c), { recursive: true });
      console.log(`${suite}/${c}: skipped, it needs a shell tool, which evals only allow on macOS, Linux or WSL`);
    }
    if (!fs.readdirSync(cases).length) continue;
    const json = path.join(results, `${suite}.json`);
    const code = sh(['claude plugin eval', `"${dir}"`, '--eval-dir ingot-evals', `--output-dir "${path.join(tmp, 'out')}"`, `--runs ${runs}`, '--trust-plugin', '--no-publish',
      `--allow-tools Write Edit${shellOk ? ' Bash' : ''}`, `--json "${json}"`, `--report "${path.join(results, `${suite}.html`)}"`, ...args].join(' '));
    if (code !== 0) failed++;
    console.log(`${suite}: ${code === 0 ? 'passed' : `FAILED (exit ${code})`}\n`);
  } catch (e) {
    failed++;
    console.log(`${suite}: FAILED (${e.message})\n`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
process.exit(failed ? 1 : 0);
