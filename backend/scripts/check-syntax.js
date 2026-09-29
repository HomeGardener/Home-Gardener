import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const backendDirectory = fileURLToPath(new URL('../', import.meta.url));
const files = [join(backendDirectory, 'index.js')];

function collectJavaScript(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collectJavaScript(path);
    else if (entry.isFile() && path.endsWith('.js')) files.push(path);
  }
}

collectJavaScript(join(backendDirectory, 'src'));

const failures = files.filter((file) => {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status === 0) return false;
  process.stderr.write(result.stderr || result.stdout);
  process.stderr.write(`Syntax error in ${file}\n`);
  return true;
});

if (failures.length) process.exitCode = 1;
else console.log(`JavaScript syntax check passed (${files.length} files).`);
