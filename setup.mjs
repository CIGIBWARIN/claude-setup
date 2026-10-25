#!/usr/bin/env node
// Cross-platform installer for this Claude Code setup (Windows, macOS, Linux). No dependencies.
// Everything is a plugin, so a project install only writes .claude/settings.json and updates come from `claude plugin update`.
//
//   npx -y github:CIGIBWARIN/claude-setup            enable for the current folder (.claude/settings.json, commit it)
//   npx -y github:CIGIBWARIN/claude-setup --user     enable for every project on this machine
//
// Options: --no-tools    skip Python / language-server installs
//          --no-plugins  skip plugin installs
//          --remove      undo the setup for this project (with --user: for the machine)
//          --prune       forget plugin registrations of project folders that were deleted
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

function readJson(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
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
  const hadAdhd = run('claude', ['plugin', 'list', '--json'], { quiet: true }).out.includes('"i-have-adhd@');
  for (const p of readList('plugins.txt')) {
    console.log(`Plugin ${p} (${scope})`);
    run('claude', ['plugin', 'install', p, '--scope', scope], { quiet: true, cwd });
    // install is a no-op when already present; update makes re-running the installer the upgrade path.
    run('claude', ['plugin', 'update', p, '--scope', scope], { quiet: true, cwd });
  }
  if (scope === 'project') {
    // Declare the marketplaces in the project too, so cloud sessions and teammates can resolve its plugins.
    const file = path.join(cwd, '.claude', 'settings.json');
    const settings = readJson(file);
    settings.extraKnownMarketplaces ??= {};
    for (const [name, repoSlug] of wanted) {
      if (name !== 'claude-plugins-official') settings.extraKnownMarketplaces[name] = { source: { source: 'github', repo: repoSlug } };
    }
    fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
  }
  // i-have-adhd is always-on only while this flag exists; set it on first install so updates keep a user's opt-out.
  if (!hadAdhd) {
    fs.mkdirSync(userClaude, { recursive: true });
    fs.writeFileSync(path.join(userClaude, '.i-have-adhd-always'), '');
  }
}

// settings.json in this repo holds env defaults (e.g. cheaper security reviews); existing user values win.
function applySettings(file) {
  const ours = readJson(path.join(repo, 'settings.json'));
  const settings = readJson(file);
  settings.env = { ...ours.env, ...settings.env };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
}

// --remove: undo this setup for the current project (or with --user, for the machine). Shared tools stay installed.
function remove(scope, cwd) {
  for (const p of readList('plugins.txt')) run('claude', ['plugin', 'uninstall', p, '--scope', scope], { quiet: true, cwd });
  const file = scope === 'user' ? path.join(userClaude, 'settings.json') : path.join(cwd, '.claude', 'settings.json');
  if (!fs.existsSync(file)) return;
  const settings = readJson(file);
  for (const p of readList('plugins.txt')) delete settings.enabledPlugins?.[p];
  for (const [name] of readList('marketplaces.txt').map((l) => l.split(/\s+/))) delete settings.extraKnownMarketplaces?.[name];
  for (const k of Object.keys(readJson(path.join(repo, 'settings.json')).env ?? {})) delete settings.env?.[k];
  for (const k of ['enabledPlugins', 'extraKnownMarketplaces', 'env']) if (settings[k] && !Object.keys(settings[k]).length) delete settings[k];
  if (scope !== 'user' && !Object.keys(settings).length) fs.rmSync(file);
  else fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
}

// --prune: drop plugin registrations left behind by project folders that were deleted.
function prune() {
  const file = path.join(userClaude, 'plugins', 'installed_plugins.json');
  if (!fs.existsSync(file)) return console.log('Nothing to prune.');
  const data = readJson(file);
  let dropped = 0;
  for (const [id, installs] of Object.entries(data.plugins ?? {})) {
    data.plugins[id] = installs.filter((i) => !i.projectPath || fs.existsSync(i.projectPath) || !++dropped);
    if (!data.plugins[id].length) delete data.plugins[id];
  }
  if (dropped) {
    fs.copyFileSync(file, file + '.bak');
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  }
  console.log(`Pruned ${dropped} plugin registrations for deleted projects.${dropped ? ' Backup: installed_plugins.json.bak' : ''}`);
}

const userMode = has('--user');
if (has('--prune')) { prune(); process.exit(0); }
if (!userMode && path.resolve(process.cwd()) === path.resolve(os.homedir())) {
  console.error('You are in your home folder; use --user for a machine-wide install, or cd into a project first.');
  process.exit(1);
}
if (has('--remove')) {
  remove(userMode ? 'user' : 'project', process.cwd());
  console.log('Removed claude-setup from ' + (userMode ? 'this machine' : 'this project') + '. Shared tools (Node, Python, Git, language servers) were left installed.');
  process.exit(0);
}
if (!has('--no-tools')) installTools();
if (!has('--no-plugins')) installPlugins(userMode ? 'user' : 'project', process.cwd());
applySettings(userMode ? path.join(userClaude, 'settings.json') : path.join(process.cwd(), '.claude', 'settings.json'));
console.log('\nDone. Restart Claude Code so it picks everything up.');
if (!userMode) console.log('Commit .claude/settings.json so cloud sessions and other machines get the same plugins.');
