#!/usr/bin/env node
// Cross-platform installer for this Claude Code setup (Windows, macOS, Linux). No dependencies.
//
//   npx -y github:CIGIBWARIN/claude-setup            set up the current folder (./.claude, project scope)
//   npx -y github:CIGIBWARIN/claude-setup --user     set up for every project on this machine (~/.claude)
//   node setup.mjs export                            (inside a clone) copy ~/.claude changes back into the repo
//
// Options: --force  replace files that differ (old copies go to ~/.claude/backups)
//          --no-tools  skip Python / language-server installs
//          --no-plugins  skip plugin installs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const isWin = process.platform === 'win32';
const userClaude = path.join(os.homedir(), '.claude');

function readList(name) {
  return fs.readFileSync(path.join(repo, name), 'utf8')
    .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

// shell:true so Windows .cmd shims (npm, claude) resolve; all arguments here are fixed strings from this repo.
function run(cmd, cmdArgs, opts = {}) {
  const r = spawnSync([cmd, ...cmdArgs].join(' '), { shell: true, stdio: opts.quiet ? 'pipe' : 'inherit', encoding: 'utf8', cwd: opts.cwd });
  return { ok: r.status === 0, out: (r.stdout || '').trim() };
}

function onPath(cmd) {
  return run(isWin ? 'where' : 'command -v', [cmd], { quiet: true }).ok;
}

function filesUnder(p) {
  const st = fs.statSync(p);
  if (!st.isDirectory()) return [''];
  return fs.readdirSync(p, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => path.relative(p, path.join(d.parentPath ?? d.path, d.name)));
}

function copyTree(srcRoot, dstRoot, rels, { force, backupRoot }) {
  const stats = { added: 0, same: 0, replaced: 0, kept: [] };
  for (const rel of rels) {
    const src = path.join(srcRoot, rel);
    if (!fs.existsSync(src)) { console.warn(`  missing in source: ${rel}`); continue; }
    for (const sub of filesUnder(src)) {
      const s = path.join(src, sub);
      const d = path.join(dstRoot, rel, sub);
      if (fs.existsSync(d)) {
        if (fs.readFileSync(s).equals(fs.readFileSync(d))) { stats.same++; continue; }
        if (!force) { stats.kept.push(path.join(rel, sub)); continue; }
        const b = path.join(backupRoot, rel, sub);
        fs.mkdirSync(path.dirname(b), { recursive: true });
        fs.copyFileSync(d, b);
        stats.replaced++;
      } else {
        stats.added++;
      }
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
  return stats;
}

function findPython() {
  for (const cmd of ['python3', 'python', 'py -3']) {
    const r = run(cmd, ['-c', '"import sys; print(sys.version_info >= (3, 10))"'], { quiet: true });
    if (r.ok && r.out === 'True') return cmd;
  }
  return null;
}

function installTools() {
  if (!findPython()) {
    console.log('Python 3.10+ not found (needed by security-guidance).');
    if (isWin && onPath('winget')) {
      run('winget', ['install', '--id', 'Python.Python.3.13', '--scope', 'user', '--silent', '--accept-package-agreements', '--accept-source-agreements']);
      console.log('  Python installed; restart your terminal / Claude so it is on PATH.');
    } else if (process.platform === 'darwin' && onPath('brew')) {
      run('brew', ['install', 'python@3.13']);
    } else if (process.platform === 'linux') {
      const sudo = process.getuid?.() === 0 ? '' : 'sudo ';
      const pm = [['apt-get', 'apt-get update && ' + sudo + 'apt-get install -y python3'], ['dnf', 'dnf install -y python3'],
        ['pacman', 'pacman -S --noconfirm python'], ['zypper', 'zypper install -y python3'], ['apk', 'apk add python3']].find(([b]) => onPath(b));
      if (pm) run(sudo + pm[1], []);
      else console.log('  Install Python 3.10+ with your package manager.');
    } else {
      console.log('  Install Python 3.10+ from https://www.python.org/downloads/');
    }
    if (!findPython()) console.log('  Python still not found; security-guidance stays inactive until it is installed.');
  }
  const binFor = { pyright: 'pyright', 'typescript-language-server': 'typescript-language-server', typescript: 'tsc' };
  const missing = readList('npm-globals.txt').filter((p) => !onPath(binFor[p] ?? p));
  if (missing.length) {
    console.log(`Installing language servers: ${missing.join(', ')}`);
    // A system-wide Node on Linux/macOS needs root for global installs; retry with sudo.
    if (!run('npm', ['install', '-g', ...missing]).ok && !isWin && onPath('sudo')) {
      run('sudo', ['npm', 'install', '-g', ...missing]);
    }
  }
}

function installPlugins(scope, cwd) {
  if (!onPath('claude')) { console.log('Claude Code CLI not found; skipping plugins. Install Claude Code, then re-run.'); return; }
  // marketplaces.txt lines: "<name> <github owner/repo>"
  const wanted = readList('marketplaces.txt').map((l) => l.split(/\s+/));
  const known = new Set(JSON.parse(run('claude', ['plugin', 'marketplace', 'list', '--json'], { quiet: true }).out || '[]').map((m) => m.name));
  for (const [name, repoSlug] of wanted) {
    if (known.has(name)) run('claude', ['plugin', 'marketplace', 'update', name], { quiet: true });
    else run('claude', ['plugin', 'marketplace', 'add', repoSlug]);
  }
  for (const p of readList('plugins.txt')) {
    console.log(`Plugin ${p} (${scope})`);
    run('claude', ['plugin', 'install', p, '--scope', scope], { quiet: true, cwd });
  }
  // Declare the marketplaces in the project too, so cloud sessions and teammates can resolve its plugins.
  if (scope === 'project') {
    const file = path.join(cwd, '.claude', 'settings.json');
    const settings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    settings.extraKnownMarketplaces ??= {};
    for (const [name, repoSlug] of wanted) {
      if (name !== 'claude-plugins-official') settings.extraKnownMarketplaces[name] = { source: { source: 'github', repo: repoSlug } };
    }
    fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
  }
  // i-have-adhd only applies itself every session when this flag file exists.
  fs.mkdirSync(userClaude, { recursive: true });
  fs.writeFileSync(path.join(userClaude, '.i-have-adhd-always'), '');
}

function setup() {
  const userMode = has('--user');
  const target = userMode ? userClaude : path.join(process.cwd(), '.claude');
  const backupRoot = path.join(userClaude, 'backups', 'claude-setup-' + new Date().toISOString().replace(/[:.]/g, '-'));
  if (!userMode && path.resolve(process.cwd()) === path.resolve(os.homedir())) {
    console.error('You are in your home folder; use --user for a machine-wide install, or cd into a project first.');
    process.exit(1);
  }
  console.log(`Installing into ${target}`);
  const s = copyTree(path.join(repo, 'home'), target, readList('managed-paths.txt'), { force: has('--force'), backupRoot });
  console.log(`  ${s.added} added, ${s.replaced} replaced, ${s.same} already up to date`);
  if (s.kept.length) console.log(`  ${s.kept.length} files differ and were left alone (re-run with --force to replace): ${s.kept.slice(0, 5).join(', ')}${s.kept.length > 5 ? ', ...' : ''}`);
  if (s.replaced) console.log(`  previous versions saved in ${backupRoot}`);
  if (!has('--no-tools')) installTools();
  if (!has('--no-plugins')) installPlugins(userMode ? 'user' : 'project', process.cwd());
  console.log('\nDone. Restart Claude Code so it picks everything up.');
  if (!userMode) console.log('Commit the .claude folder so cloud sessions and other machines get it too.');
}

function exportBack() {
  const rels = readList('managed-paths.txt').filter((r) => fs.existsSync(path.join(userClaude, r)));
  for (const rel of rels) fs.rmSync(path.join(repo, 'home', rel), { recursive: true, force: true });
  copyTree(userClaude, path.join(repo, 'home'), rels, { force: true, backupRoot: os.tmpdir() });
  const added = args.slice(args.indexOf('export') + 1).filter((a) => !a.startsWith('--'));
  for (const a of added) {
    const rel = a.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    if (!fs.existsSync(path.join(userClaude, rel))) { console.error(`Not found under ~/.claude: ${rel}`); process.exit(1); }
    copyTree(userClaude, path.join(repo, 'home'), [rel], { force: true, backupRoot: os.tmpdir() });
    if (!rels.includes(rel)) rels.push(rel);
  }
  fs.writeFileSync(path.join(repo, 'managed-paths.txt'), rels.join('\n') + '\n');
  const list = JSON.parse(run('claude', ['plugin', 'list', '--json'], { quiet: true }).out || '[]');
  const plugins = list.filter((p) => p.scope === 'user' && p.enabled).map((p) => p.id).sort();
  fs.writeFileSync(path.join(repo, 'plugins.txt'), ['# plugin@marketplace, one per line.', ...plugins].join('\n') + '\n');
  const markets = JSON.parse(run('claude', ['plugin', 'marketplace', 'list', '--json'], { quiet: true }).out || '[]')
    .filter((m) => m.source === 'github' && plugins.some((p) => p.endsWith('@' + m.name)))
    .map((m) => `${m.name} ${m.repo}`).sort();
  fs.writeFileSync(path.join(repo, 'marketplaces.txt'), ['# <marketplace name> <github owner/repo>', ...markets].join('\n') + '\n');
  run('git', ['status', '--short'], { cwd: repo });
  console.log('Review, then: git commit -am "Update setup" && git push');
}

if (args[0] === 'export') exportBack(); else setup();
