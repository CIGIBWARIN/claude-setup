#!/usr/bin/env node
// Cross-platform installer for Ingot, a Claude Code setup (Windows, macOS, Linux). No dependencies.
// Everything is a plugin, so this only writes Claude settings files and updates come from `claude plugin update`.
//
//   npx -y github:CIGIBWARIN/ingot#stable          turn Ingot on for the project in this folder (.claude/settings.json)
//   npx -y github:CIGIBWARIN/ingot#stable --user   turn it on for every project on this PC instead
// Shared tools (Node, Python, Git, ffmpeg, yt-dlp, language servers) and plugin downloads are installed once per PC either way.
//
// Options: --no-tools    skip Python / video tool / language-server installs
//          --no-plugins  skip plugin installs
//          --remove      turn Ingot off for this project (with --user: for the whole PC)
//          --prune       forget plugin registrations of project folders that were deleted
//          --project     same as the default (kept for older instructions)
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const isWin = process.platform === 'win32';
const isRoot = process.getuid?.() === 0;
// Claude Code keeps its config in CLAUDE_CONFIG_DIR when that is set.
const userClaude = process.env.CLAUDE_CONFIG_DIR ? path.resolve(process.env.CLAUDE_CONFIG_DIR) : path.join(os.homedir(), '.claude');
const adhdFlag = path.join(userClaude, '.i-have-adhd-always');
const localBin = path.join(os.homedir(), '.local', 'bin');
const localYtDlp = path.join(localBin, 'yt-dlp');
// Claude Code's native installer (on every OS) and our yt-dlp land in ~/.local/bin, which may not be on PATH yet.
process.env.PATH = `${localBin}${path.delimiter}${process.env.PATH}`;

// Everything that didn't work, as item -> how to fix it; printed together at the end.
const failures = new Map();
const fail = (what, fix) => { if (!failures.has(what)) failures.set(what, fix); };

function readList(name) {
  return fs.readFileSync(path.join(repo, name), 'utf8')
    .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

// marketplaces.txt lines: "<name> <github owner/repo>[#tag]"; a tag pins that marketplace to a tested release.
const markets = () => readList('marketplaces.txt').map((l) => {
  const [name, source] = l.split(/\s+/);
  const [repoSlug, ref] = source.split('#');
  return [name, repoSlug, ref];
});
const githubSource = (repoSlug, ref) => ({ source: 'github', repo: repoSlug, ...(ref && { ref }) });
// Marketplaces only retired plugins came from (e.g. the old claude-setup one).
const retiredMarkets = () => [...new Set(readList('retired.txt').map((p) => p.split('@')[1]))].filter((m) => !markets().some(([name]) => name === m));
const settingsFile = (scope, cwd) => scope === 'user' ? path.join(userClaude, 'settings.json') : path.join(cwd, '.claude', 'settings.json');
const samePath = (a, b) => isWin ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b);
// `claude plugin list` reports every project's installs; a project-scope entry only counts for its own folder.
const isInstalled = (list, p, scope, cwd) => list.some((i) => i.id === p && i.scope === scope &&
  (scope !== 'project' || (typeof i.projectPath === 'string' && samePath(i.projectPath, cwd))));

// shell:true so Windows .cmd shims (npm, claude) resolve; arguments are fixed strings from this repo or quoted paths.
function run(cmd, cmdArgs, opts = {}) {
  const r = spawnSync([cmd, ...cmdArgs].join(' '), { shell: true, stdio: opts.quiet ? 'pipe' : 'inherit', encoding: 'utf8', cwd: opts.cwd, maxBuffer: 1 << 26 });
  return { ok: r.status === 0, out: (r.stdout || '').trim(), code: r.status };
}

// `claude ... --json` may print a notice before the JSON; anything unreadable is reported, not guessed at.
function claudeJson(...cmdArgs) {
  const out = run('claude', [...cmdArgs, '--json'], { quiet: true }).out;
  for (const text of [out, out.slice(Math.max(0, out.search(/^\[/m)), out.lastIndexOf(']') + 1)]) {
    try { const list = JSON.parse(text); if (Array.isArray(list)) return list; } catch {}
  }
  fail(`claude ${cmdArgs.join(' ')}`, 'gave no readable answer; run: claude update, then run this command again');
  return null;
}

// Settings files are hand-edited: tolerate a BOM, and never overwrite one we could not parse.
const unreadable = new Set();
function readJson(file) {
  if (!fs.existsSync(file)) return {};
  try {
    const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
    if (!text.trim()) return {};
    const data = JSON.parse(text);
    if (data && typeof data === 'object' && !Array.isArray(data)) return data;
    throw new Error('expected a JSON object');
  } catch (e) {
    if (!unreadable.has(file)) console.log(`Could not read ${file} (${e.message}); leaving it unchanged.`);
    unreadable.add(file);
    fail(file, 'fix the JSON in it (or delete the file), then run this command again');
    return {};
  }
}

function writeJson(file, data) {
  if (unreadable.has(file)) return;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  } catch (e) {
    unreadable.add(file);
    fail(file, `could not write it (${e.code}); clear its Read-only setting or fix its permissions, then run this command again`);
  }
}

// A read-only settings file (OneDrive, a locked checkout) would make every plugin install fail one by one.
function writable(file) {
  try {
    if (fs.existsSync(file)) fs.accessSync(file, fs.constants.W_OK);
    return true;
  } catch {
    fail(file, 'is read-only; clear its Read-only setting or fix its permissions, then run this command again');
    return false;
  }
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

// winget writes the new PATH to the registry only; reload it so re-checks see what was just installed.
// Duplicates are dropped: past about 8,000 characters cmd.exe (our shell) finds no commands at all.
function refreshPath() {
  if (!isWin) return;
  // UTF-8 output, or folders under a non-ASCII user name (C:\Users\Jürgen) come back garbled.
  const r = run('powershell', ['-NoProfile', '-Command', `"[Console]::OutputEncoding=[Text.Encoding]::UTF8; [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')"`], { quiet: true });
  if (r.ok && r.out) process.env.PATH = [...new Set(`${r.out};${process.env.PATH}`.split(';').filter(Boolean))].join(';');
}

// Only the community source: the Microsoft Store source can fail on its own (seen on a fresh Windows) and isn't needed.
const winget = (id, extra = []) => run('winget', ['install', '--id', id, '--source', 'winget', ...extra, '--silent', '--accept-package-agreements', '--accept-source-agreements']);

// sudo asks on /dev/tty, so it can still prompt under `curl | bash`, where stdin is the script pipe.
const hasTty = () => { try { fs.closeSync(fs.openSync('/dev/tty', 'r')); return true; } catch { return false; } };

// Runs a command as root on macOS/Linux; uses sudo only when it can work here, else reports the command for an admin.
function asRoot(cmd, what) {
  const full = isRoot ? cmd : cmd.split(' && ').map((c) => `sudo ${c}`).join(' && ');
  if (!isRoot && !(onPath('sudo') && (run('sudo', ['-n', 'true'], { quiet: true }).ok || process.stdin.isTTY || hasTty()))) {
    return fail(what, `ask an admin to run: ${full}`);
  }
  if (!isRoot) console.log(`Installing ${what} needs admin rights, so sudo may ask for your password.`);
  if (!run(full, []).ok) fail(what, `run: ${full}`);
}

// Installs a system package on Linux with whichever package manager exists.
function linuxInstall(pkg, what, archPkg = pkg) {
  const pm = [['apt-get', `apt-get update && apt-get install -y ${pkg}`], ['dnf', `dnf install -y ${pkg}`],
    ['pacman', `pacman -S --noconfirm ${archPkg}`], ['zypper', `zypper install -y ${pkg}`], ['apk', `apk add ${pkg}`]].find(([b]) => onPath(b));
  if (pm) asRoot(pm[1], what);
  else fail(what, `install ${pkg} with your package manager, then run this command again`);
}

// Macs without Homebrew, and Linux without sudo: Python and ffmpeg from conda-forge into ~/.local/share/ingot-tools,
// linked into ~/.local/bin. Needs no admin rights. micromamba is pinned and checked here, and it checks every package it downloads.
const micromamba = { version: '2.9.0-0', sha256: {
  'osx-arm64': 'ec2a072f028e1a7cf20f3e2e74d5a8127cf5a5f27636375b5359811565f4e5be',
  'osx-64': '1e71054bb3ac9a076e21f7ec48acfef536f9b3f1408f371a942784bf5ef83d8a',
  'linux-aarch64': '9f93b974adcb4d166996af969b6cd371287d1a3e52733704727884d9b74cb7a7',
  'linux-64': '366cd9cd8be14df1ab8ed50352a82111082a36686b2d389fdb79a92c3fafb3e3',
} };
const condaTools = { python: ['python=3.13', ['python3', 'python3.13']], ffmpeg: ['ffmpeg', ['ffmpeg', 'ffprobe']] };
function installConda(names) {
  const prefix = path.join(os.homedir(), '.local', 'share', 'ingot-tools');
  console.log(`Installing ${names.join(' and ')} from conda-forge into ${prefix}...`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ingot-'));
  try {
    const bin = path.join(tmp, 'micromamba');
    const mac = process.platform === 'darwin';
    const asset = `${mac ? 'osx' : 'linux'}-${process.arch !== 'arm64' ? '64' : mac ? 'arm64' : 'aarch64'}`;
    const url = `https://github.com/mamba-org/micromamba-releases/releases/download/${micromamba.version}/micromamba-${asset}`;
    if (!run('curl', ['-fsSL', '-o', `"${bin}"`, url]).ok) return;
    if (crypto.createHash('sha256').update(fs.readFileSync(bin)).digest('hex') !== micromamba.sha256[asset]) {
      return console.log('The micromamba download failed its checksum.');
    }
    fs.chmodSync(bin, 0o755);
    // The package cache goes with the temp folder; installed files are hard links or copies, so they stay.
    const verb = fs.existsSync(path.join(prefix, 'conda-meta')) ? 'install' : 'create';
    if (!run(`"${bin}"`, [verb, '-y', '-q', '-r', `"${path.join(tmp, 'root')}"`, '-p', `"${prefix}"`,
      '--override-channels', '-c', 'conda-forge', ...names.map((n) => condaTools[n][0])]).ok) {
      // A half-made folder would make every later `create` refuse to start.
      if (verb === 'create') fs.rmSync(prefix, { recursive: true, force: true });
      return;
    }
    fs.mkdirSync(localBin, { recursive: true });
    for (const cmd of names.flatMap((n) => condaTools[n][1])) {
      // Leave anything already there alone; it may be the user's own.
      try { fs.lstatSync(path.join(localBin, cmd)); } catch { fs.symlinkSync(path.join(prefix, 'bin', cmd), path.join(localBin, cmd)); }
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// musl systems such as Alpine can't run glibc builds (yt-dlp's linux binary, conda-forge packages).
const isMusl = () => process.platform === 'linux' && !process.report?.getReport().header.glibcVersionRuntime;

// yt-dlp's own release binary: distro packages are often too old to download from current sites.
async function installYtDlp() {
  const asset = process.platform === 'darwin' ? 'yt-dlp_macos'
    : `yt-dlp_${isMusl() ? 'musllinux' : 'linux'}${process.arch === 'arm64' ? '_aarch64' : ''}`;
  const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`;
  fs.mkdirSync(path.dirname(localYtDlp), { recursive: true });
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fs.writeFileSync(localYtDlp, Buffer.from(await res.arrayBuffer()));
  } catch {
    // Node's fetch fails behind some proxies and certificate setups where curl still works.
    const part = `${localYtDlp}.part`;
    if (run('curl', ['-fsSL', '-o', `"${part}"`, url]).ok) fs.renameSync(part, localYtDlp);
    else fs.rmSync(part, { force: true });
  }
  if (fs.existsSync(localYtDlp)) fs.chmodSync(localYtDlp, 0o755);
}

// pip and pipx also put a yt-dlp in ~/.local/bin (a script or a link), and `yt-dlp -U` refuses to update those.
function standaloneYtDlp() {
  try {
    return !fs.lstatSync(localYtDlp).isSymbolicLink() && fs.readFileSync(localYtDlp).subarray(0, 2).toString() !== '#!';
  } catch {
    return false;
  }
}

// Sites break old yt-dlp versions quickly, so every run updates the copy we installed.
function updateYtDlp(hasWinget) {
  if (hasWinget) {
    const r = run('winget', ['upgrade', '--id', 'yt-dlp.yt-dlp', '--source', 'winget', '--skip-dependencies', '--silent', '--accept-package-agreements', '--accept-source-agreements'], { quiet: true });
    // No newer version / not installed through winget / version unknown: nothing to update.
    if (!r.ok && ![0x8a15002b, 0x8a150014, 0x8a150050].includes(r.code >>> 0)) fail('yt-dlp (update)', 'run: winget upgrade --id yt-dlp.yt-dlp');
  } else if (!isWin && standaloneYtDlp() && !run(`"${localYtDlp}"`, ['--ignore-config', '-U'], { quiet: true }).ok) {
    fail('yt-dlp (update)', `run: ${localYtDlp} -U`);
  }
}

async function installTools() {
  const mac = process.platform === 'darwin', linux = process.platform === 'linux';
  const hasWinget = isWin && onPath('winget'), hasBrew = mac && onPath('brew');
  const viaWinget = (id) => hasWinget ? `run: winget install --id ${id}` : 'install "App Installer" (winget) from the Microsoft Store, then run this command again';
  // taste-skill needs Node 22+; the bootstrap scripts install it, but npx may run on an older Node.
  if (parseInt(process.versions.node, 10) < 22) fail('Node.js 22+', `this is Node ${process.versions.node}; install the LTS from https://nodejs.org/en/download`);
  // Claude Code downloads every plugin with git; minimal Linux installs often don't have it.
  if (!onPath('git')) {
    if (hasWinget) winget('Git.Git');
    else if (hasBrew) run('brew', ['install', 'git']);
    else if (linux) linuxInstall('git', 'Git');
    refreshPath();
  }
  const needPython = !findPython(), needFfmpeg = !onPath('ffmpeg'), needYtDlp = !onPath('yt-dlp');
  const conda = [];
  // Linux where sudo can't work (asRoot would only say "ask an admin"): conda-forge too, needing no admin.
  // conda-forge has glibc builds for x64 and arm64 only; elsewhere the package manager route reports what to run.
  const linuxConda = linux && (needPython || needFfmpeg) && !isRoot && ['x64', 'arm64'].includes(process.arch) && !isMusl()
    && !(onPath('sudo') && (run('sudo', ['-n', 'true'], { quiet: true }).ok || process.stdin.isTTY || hasTty()));
  if (needPython) {
    console.log('Python 3.10+ not found (needed by security-guidance and /watch).');
    if (hasWinget) winget('Python.Python.3.13', ['--scope', 'user']);
    else if (hasBrew) run('brew', ['install', 'python@3.13']);
    else if (mac || linuxConda) conda.push('python');
    else if (linux) linuxInstall('python3', 'Python 3.10+', 'python');
  }
  // ffmpeg + yt-dlp let /watch read videos locally, with no account or API key.
  if (needFfmpeg || needYtDlp) console.log('Installing video tools for /watch: ' + [needFfmpeg && 'ffmpeg', needYtDlp && 'yt-dlp'].filter(Boolean).join(', '));
  if (needFfmpeg) {
    if (hasWinget) winget('Gyan.FFmpeg.Essentials');
    else if (hasBrew) run('brew', ['install', 'ffmpeg']);
    else if (mac || linuxConda) conda.push('ffmpeg');
    else if (linux) linuxInstall('ffmpeg', 'ffmpeg');
  }
  if (conda.length) installConda(conda);
  // Without --skip-dependencies winget adds a second 500 MB FFmpeg and Deno; we already have both jobs covered.
  if (needYtDlp && hasWinget) winget('yt-dlp.yt-dlp', ['--skip-dependencies']);
  else if (needYtDlp && !isWin) await installYtDlp();
  else if (!needYtDlp) updateYtDlp(hasWinget);
  refreshPath();
  if (needPython && !findPython()) {
    fail('Python 3.10+', `install it from https://www.python.org/downloads/${isWin ? ' (tick "Add python.exe to PATH")' : ''}, then run this command again`);
  }
  if (needFfmpeg && !onPath('ffmpeg')) {
    fail('ffmpeg', isWin ? viaWinget('Gyan.FFmpeg.Essentials') : !mac ? 'install ffmpeg with your package manager'
      : hasBrew ? 'run: brew install ffmpeg' : 'Install Homebrew from https://brew.sh, then run: brew install ffmpeg');
  }
  if (needYtDlp && !onPath('yt-dlp')) {
    fail('yt-dlp', isWin ? viaWinget('yt-dlp.yt-dlp') : `download it from https://github.com/yt-dlp/yt-dlp/releases/latest to ${localYtDlp}`);
  }
  // yt-dlp needs a JavaScript runtime for some sites (YouTube). Point it at the Node we already have instead of adding Deno.
  const ytConf = isWin ? path.join(process.env.APPDATA ?? '', 'yt-dlp', 'config.txt') : path.join(os.homedir(), '.config', 'yt-dlp', 'config');
  const conf = fs.existsSync(ytConf) ? fs.readFileSync(ytConf, 'utf8') : '';
  const knowsJs = run('yt-dlp', ['--help'], { quiet: true }).out.includes('--js-runtimes');
  if (knowsJs && !conf.includes('--js-runtimes')) {
    fs.mkdirSync(path.dirname(ytConf), { recursive: true });
    fs.appendFileSync(ytConf, `${conf && !conf.endsWith('\n') ? '\n' : ''}--js-runtimes node\n`);
  } else if (!knowsJs && conf.includes('--js-runtimes node\n')) {
    // An older yt-dlp rejects its whole config over an unknown option, so drop the line an earlier run added.
    fs.writeFileSync(ytConf, conf.replace('--js-runtimes node\n', ''));
  }
  const binFor = { pyright: 'pyright', 'typescript-language-server': 'typescript-language-server', typescript: 'tsc' };
  const missingLs = () => readList('npm-globals.txt').filter((p) => !onPath(binFor[p] ?? p));
  const missing = missingLs();
  if (missing.length) {
    console.log(`Installing language servers: ${missing.join(', ')}`);
    const npm = `npm install -g ${missing.join(' ')}`;
    // A system-wide Node on Linux/macOS needs root for global installs; retry as root.
    if (!run(npm, []).ok && !isWin && !isRoot) asRoot(npm, 'language servers');
    refreshPath();
    const still = missingLs();
    if (still.length) fail('language servers', `run: npm install -g ${still.join(' ')}`);
  }
}

// Installs (or updates) every plugin at each scope, then checks with `claude plugin list` that they really are there.
function setupPlugins(scopes, cwd) {
  if (!onPath('claude')) {
    return fail('Claude Code', `run: ${isWin ? 'irm https://claude.ai/install.ps1 | iex' : 'curl -fsSL https://claude.ai/install.sh | bash'}, then run this command again`);
  }
  if (!onPath('git')) {
    return fail('Git', isWin ? 'run: winget install --id Git.Git, then run this command again'
      : process.platform === 'darwin' ? 'run: xcode-select --install, then run this command again' : 'install git with your package manager, then run this command again');
  }
  const known = new Map((claudeJson('plugin', 'marketplace', 'list') ?? []).map((m) => [m.name, m]));
  for (const [name, repoSlug, ref] of markets()) {
    const source = ref ? `${repoSlug}#${ref}` : repoSlug;
    if (known.has(name) && (known.get(name).ref ?? '') !== (ref ?? '')) repin(name, repoSlug, ref);
    else if (known.has(name)) run('claude', ['plugin', 'marketplace', 'update', name], { quiet: true });
    else if (!run('claude', ['plugin', 'marketplace', 'add', source]).ok) fail(`marketplace ${name}`, `run: claude plugin marketplace add ${source}`);
  }
  const installed = claudeJson('plugin', 'list') ?? [];
  // Whether Ingot itself (or the claude-setup plugins before it) is installed at a scope. Only that marks a setup as
  // ours: the other plugins in plugins.txt are popular, and the user may have installed them on their own.
  const ingotAt = (scope) => installed.some((i) => (i.id === 'ingot@ingot' || i.id.endsWith('@claude-setup')) &&
    isInstalled(installed, i.id, scope, cwd));
  // A PC-wide setup (from --user, or versions before per-project installs) is kept up to date too.
  if (!scopes.includes('user') && ingotAt('user')) scopes.push('user');
  const missing = (p, scope) => fail(`${p} (${scope})`, `run: claude plugin install ${p} --scope ${scope}`);
  const targets = [];
  for (const scope of scopes) {
    const file = settingsFile(scope, cwd);
    const settings = readJson(file);
    const enabled = settings.enabledPlugins ?? {};
    // claude would rewrite a settings file we could not parse; that file is already reported.
    if (unreadable.has(file) || !writable(file)) continue;
    // --remove leaves "ingot@ingot": false in a project while Ingot is still on PC-wide; installing again turns it back on.
    if (scope === 'project' && enabled['ingot@ingot'] === false) {
      delete enabled['ingot@ingot'];
      writeJson(file, settings);
    }
    // Plugins this setup used to ship: remove them so an update leaves no leftovers, but only where it was set up.
    for (const p of readList('retired.txt')) {
      if (!ingotAt(scope) || !isInstalled(installed, p, scope, cwd)) continue;
      console.log(`Removing retired plugin ${p}`);
      run('claude', ['plugin', 'uninstall', p, '--scope', scope], { quiet: true, cwd });
      // i-have-adhd was always-on only while this flag existed.
      if (p.startsWith('i-have-adhd@')) fs.rmSync(adhdFlag, { force: true });
    }
    for (const p of readList('plugins.txt')) {
      // A project that switched a plugin off (e.g. with /ingot:specialize) keeps it off.
      if (scope === 'project' && enabled[p] === false) continue;
      targets.push([p, scope]);
      console.log(`Plugin ${p} (${scope})`);
      // update makes re-running the installer the upgrade path.
      if (isInstalled(installed, p, scope, cwd)) run('claude', ['plugin', 'update', p, '--scope', scope], { quiet: true, cwd });
      else if (!run('claude', ['plugin', 'install', p, '--scope', scope], { quiet: true, cwd }).ok) missing(p, scope);
    }
  }
  const now = claudeJson('plugin', 'list');
  for (const [p, scope] of now ? targets : []) if (!isInstalled(now, p, scope, cwd)) missing(p, scope);
  // Forget a retired marketplace once nothing installed comes from it; removing it also clears its installs in other projects.
  for (const m of retiredMarkets()) {
    if (!known.has(m) || !now || now.some((i) => i.id.endsWith(`@${m}`) && !readList('retired.txt').includes(i.id))) continue;
    console.log(`Removing retired marketplace ${m}`);
    run('claude', ['plugin', 'marketplace', 'remove', m], { quiet: true });
  }
}

// Moves a marketplace to a new pinned tag. Removing and re-adding it would uninstall its plugins in every project,
// so first change the pin in place (user settings and Claude's marketplace record); fall back to remove and re-add.
function repin(name, repoSlug, ref) {
  console.log(`Pinning marketplace ${name} to ${ref ?? 'its latest version'}`);
  const userFile = settingsFile('user');
  const knownFile = path.join(userClaude, 'plugins', 'known_marketplaces.json');
  for (const [file, entry] of [[userFile, (d) => d.extraKnownMarketplaces?.[name]], [knownFile, (d) => d[name]]]) {
    const data = readJson(file);
    const e = entry(data);
    if (e?.source?.repo !== repoSlug || unreadable.has(file)) continue;
    if (ref) e.source.ref = ref; else delete e.source.ref;
    writeJson(file, data);
  }
  run('claude', ['plugin', 'marketplace', 'update', name], { quiet: true });
  const now = (claudeJson('plugin', 'marketplace', 'list') ?? []).find((m) => m.name === name);
  if (now && (now.ref ?? '') === (ref ?? '')) return;
  const source = ref ? `${repoSlug}#${ref}` : repoSlug;
  // Never trade a pin for another project's installs.
  if ((claudeJson('plugin', 'list') ?? []).some((i) => i.scope === 'project' && i.id.endsWith(`@${name}`) && !samePath(i.projectPath ?? '', process.cwd()))) {
    return fail(`marketplace ${name} (pin ${ref ?? 'latest'})`, `could not move the pin in place; run: claude plugin marketplace update ${name}, then run this command again`);
  }
  run('claude', ['plugin', 'marketplace', 'remove', name], { quiet: true });
  if (!run('claude', ['plugin', 'marketplace', 'add', source]).ok) fail(`marketplace ${name}`, `run: claude plugin marketplace add ${source}`);
}

// settings.json in this repo holds defaults (env, spinner tips); values already in the target file win.
function applySettings(file, declareMarketplaces = false) {
  const ours = readJson(path.join(repo, 'settings.json'));
  const settings = readJson(file);
  settings.env = { ...ours.env, ...settings.env };
  // Settings from before the Ingot rename: CLAUDE_SETUP_STYLE becomes INGOT_STYLE, and so on.
  for (const [k, v] of Object.entries(settings.env)) {
    if (!k.startsWith('CLAUDE_SETUP_')) continue;
    settings.env[k.replace('CLAUDE_SETUP_', 'INGOT_')] ??= v;
    delete settings.env[k];
  }
  // Our own tips are refreshed (they name our commands); tips the user wrote are kept.
  if (!settings.spinnerTipsOverride || settings.spinnerTipsOverride.tips?.some((t) => /^\/(toolkit|ingot):/.test(t))) {
    settings.spinnerTipsOverride = ours.spinnerTipsOverride;
  }
  if (declareMarketplaces) {
    // Declare the marketplaces in the project too, so cloud sessions and teammates can resolve its plugins.
    const wanted = markets();
    settings.extraKnownMarketplaces ??= {};
    for (const [name, repoSlug, ref] of wanted) {
      if (name !== 'claude-plugins-official') settings.extraKnownMarketplaces[name] = { source: githubSource(repoSlug, ref) };
    }
    for (const p of readList('retired.txt')) {
      delete settings.enabledPlugins?.[p];
      const market = p.split('@')[1];
      if (!wanted.some(([name]) => name === market)) delete settings.extraKnownMarketplaces[market];
    }
  }
  writeJson(file, settings);
}

// --remove: turn this setup off for this project (or with --user, for the whole PC). Shared tools stay installed.
// Returns whether Ingot stays on here through a PC-wide setup.
function remove(scope, cwd) {
  let pcWide = false;
  if (onPath('claude')) {
    const installed = claudeJson('plugin', 'list') ?? [];
    for (const p of readList('plugins.txt')) {
      if (isInstalled(installed, p, scope, cwd) && !run('claude', ['plugin', 'uninstall', p, '--scope', scope], { quiet: true, cwd }).ok) {
        fail(p, `run: claude plugin uninstall ${p} --scope ${scope}`);
      }
    }
    pcWide = scope === 'project' && isInstalled(installed, 'ingot@ingot', 'user', cwd);
    // Machine-wide removal also forgets the third-party marketplaces this setup added, unless a project still uses them
    // (removing a marketplace uninstalls its plugins in every project).
    const known = scope === 'user' ? new Set((claudeJson('plugin', 'marketplace', 'list') ?? []).map((m) => m.name)) : new Set();
    for (const [name] of markets()) {
      if (name === 'claude-plugins-official' || !known.has(name)) continue;
      if (installed.some((i) => i.scope === 'project' && i.id.endsWith(`@${name}`))) continue;
      if (!run('claude', ['plugin', 'marketplace', 'remove', name], { quiet: true }).ok) fail(`marketplace ${name}`, `run: claude plugin marketplace remove ${name}`);
    }
  }
  // Left behind by versions that shipped i-have-adhd.
  if (scope === 'user') fs.rmSync(adhdFlag, { force: true });
  const file = settingsFile(scope, cwd);
  if (!fs.existsSync(file) && !pcWide) return false;
  const settings = readJson(file);
  if (unreadable.has(file)) return false;
  const ours = readJson(path.join(repo, 'settings.json'));
  for (const p of readList('plugins.txt')) delete settings.enabledPlugins?.[p];
  // With Ingot also on PC-wide, switch it off here explicitly; the other plugins stay as the PC-wide setup has them.
  if (pcWide) (settings.enabledPlugins ??= {})['ingot@ingot'] = false;
  for (const [name] of markets()) delete settings.extraKnownMarketplaces?.[name];
  for (const k of Object.keys(settings.env ?? {})) if (k in (ours.env ?? {}) || /^(INGOT|CLAUDE_SETUP)_/.test(k)) delete settings.env[k];
  if (JSON.stringify(settings.spinnerTipsOverride) === JSON.stringify(ours.spinnerTipsOverride)) delete settings.spinnerTipsOverride;
  for (const k of ['enabledPlugins', 'extraKnownMarketplaces', 'env']) if (settings[k] && !Object.keys(settings[k]).length) delete settings[k];
  if (scope !== 'user' && !Object.keys(settings).length) fs.rmSync(file);
  else writeJson(file, settings);
  return pcWide;
}

// The drive or mount a path lives on. If it is missing (an unplugged disk), the folder may still exist.
const driveOf = (p) => p.match(/^\/(?:Volumes\/[^/]+|(?:run\/)?media\/[^/]+\/[^/]+|mnt\/[^/]+)/)?.[0] ?? path.parse(p).root;
const deleted = (p) => typeof p === 'string' && !fs.existsSync(p) && fs.existsSync(driveOf(p));

// --prune: drop plugin registrations left behind by project folders that were deleted.
function prune() {
  const file = path.join(userClaude, 'plugins', 'installed_plugins.json');
  if (!fs.existsSync(file)) return 'Nothing to prune.';
  const data = readJson(file);
  let dropped = 0;
  for (const [id, installs] of Object.entries(data.plugins ?? {})) {
    if (!Array.isArray(installs)) continue;
    data.plugins[id] = installs.filter((i) => !deleted(i?.projectPath) || !++dropped);
    if (!data.plugins[id].length) delete data.plugins[id];
  }
  if (dropped) {
    fs.copyFileSync(file, file + '.bak');
    writeJson(file, data);
  }
  return `Pruned ${dropped} plugin registrations for deleted projects.${dropped ? ' Backup: installed_plugins.json.bak' : ''}`;
}

// One closing block: the all-clear, or every item that didn't work with how to fix it (exit code 1).
function finish(done, header = 'Not installed:') {
  if (!failures.size) {
    console.log(done);
    process.exit(0);
  }
  console.log(`\n${header}`);
  for (const [what, fix] of failures) console.log(`  ${what}: ${fix}`);
  process.exit(1);
}

// Folders that hold files rather than being one project: the same ones the session hook never makes offers in,
// plus Windows' own folders (an admin terminal opens in System32).
function notAProject(dir) {
  const home = os.homedir();
  const personal = [home, ...['Desktop', 'Documents', 'Downloads', 'OneDrive'].map((d) => path.join(home, d))];
  if (isWin) {
    // Desktop and Documents may be moved (OneDrive backup) or have localized names (Bureaublad, Dokumente).
    const r = run('powershell', ['-NoProfile', '-Command', `"[Console]::OutputEncoding=[Text.Encoding]::UTF8; [Environment]::GetFolderPath('Desktop'); [Environment]::GetFolderPath('MyDocuments')"`], { quiet: true });
    if (r.ok) personal.push(...r.out.split(/\r?\n/).filter(Boolean));
  }
  const system = isWin && process.env.SystemRoot && path.resolve(dir).toLowerCase().startsWith(path.resolve(process.env.SystemRoot).toLowerCase());
  return system || personal.some((p) => samePath(dir, p)) || samePath(dir, path.parse(path.resolve(dir)).root) ||
    /[\\/]OneDrive[^\\/]*([\\/](Desktop|Documents|Downloads|Pictures))?$/i.test(dir);
}

const userMode = has('--user');
const cwd = process.cwd();
// Under sudo, the plugins would go to root's config and the project would get a root-owned settings file.
if (isRoot && process.env.SUDO_USER) {
  console.error('Run this without sudo. It asks for your password itself if it needs to install something.');
  process.exit(1);
}
// cmd.exe can't start in a network or WSL path (\\server\..., \\wsl.localhost\...), so every claude command would run in C:\Windows.
if (isWin && cwd.startsWith('\\\\')) {
  console.error('This folder is on a network or WSL path. Open it from a drive letter, or run the macOS/Linux install line inside WSL.');
  process.exit(1);
}
// Picks up tools installed since this terminal opened, including Claude Code itself.
refreshPath();
if (has('--prune')) finish(prune(), 'Not pruned:');
if (!userMode && notAProject(cwd)) {
  console.error(`This folder (${cwd}) holds your files rather than one project.\n` +
    'Open the terminal in a project folder first (for a new project, make a new empty folder), then run this again.\n' +
    'To turn Ingot on for every project on this PC instead, add --user.');
  process.exit(1);
}
if (has('--remove')) {
  const stillOn = remove(userMode ? 'user' : 'project', cwd);
  finish(`Removed Ingot from ${userMode ? 'every project on this PC' : 'this project'}. Shared tools (Node, Python, Git, ffmpeg, yt-dlp, language servers) were left installed.` +
    (stillOn ? '\nIngot stays on for your other projects (it was also set up for the whole PC). To turn that off too, run this again with --remove --user.' : ''), 'Not removed:');
}
if (!has('--no-tools')) await installTools();
// setupPlugins adds 'user' when a PC-wide setup already exists, so it stays current too.
const scopes = [userMode ? 'user' : 'project'];
if (!has('--no-plugins')) setupPlugins(scopes, cwd);
for (const scope of scopes) applySettings(settingsFile(scope, cwd), scope === 'project' && !has('--no-plugins'));
finish(userMode ? '\nDone. Ingot is on for every project on this PC. Open a new terminal, type claude, press Enter.'
  : '\nDone. Ingot is on for this folder. Open a new terminal here and type claude, or open this folder in the desktop app\'s Code tab.' +
    '\nIf the folder is in git, commit .claude/settings.json so teammates and cloud sessions get the same setup.');
