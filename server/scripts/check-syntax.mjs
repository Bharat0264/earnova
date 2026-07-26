import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { spawnSync } from 'child_process'

const roots = ['src', 'test']
const files = []

const walk = path => {
  for (const entry of readdirSync(path)) {
    const fullPath = join(path, entry)
    if (statSync(fullPath).isDirectory()) walk(fullPath)
    else if (fullPath.endsWith('.js') || fullPath.endsWith('.mjs')) files.push(fullPath)
  }
}

for (const root of roots) walk(root)
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}

console.log(`Syntax checked ${files.length} JavaScript modules.`)
