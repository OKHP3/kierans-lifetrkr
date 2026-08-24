import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = 'src'
const files = []
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path)
    else if (/\.(tsx|jsx)$/.test(name)) files.push(path)
  }
}
walk(root)

const failures = []
for (const path of files) {
  const text = readFileSync(path, 'utf8')
  const buttons = [...text.matchAll(/<button\b[\s\S]*?>/g)]
  for (const match of buttons) {
    const tag = match[0]
    if (!/\b(aria-label|aria-labelledby|title)\s*=/.test(tag)) {
      const body = tag.replace(/<button\b|\/?>/g, '').replace(/\{[^}]*\}/g, '').trim()
      if (!body) failures.push(`${path}: button without an accessible name`)
    }
  }
  for (const match of text.matchAll(/<(input|textarea|select)\b[\s\S]*?>/g)) {
    const tag = match[0]
    if (!/\b(aria-label|aria-labelledby|id)\s*=/.test(tag)) failures.push(`${path}: ${match[1]} without an accessible name`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`Accessibility source check passed for ${files.length} JSX/TSX files.`)