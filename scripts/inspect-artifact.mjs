import { existsSync, readFileSync, statSync } from 'node:fs'

const required = [
  'dist/index.html',
  'dist/404.html',
  'dist/manifest.json',
  'dist/favicon.svg',
  'dist/icons/icon-192.png',
  'dist/icons/icon-512.png',
  'dist/og-image.png',
]

const missing = required.filter(path => !existsSync(path))
if (missing.length) {
  console.error(`Missing deployment artifacts:\n${missing.join('\n')}`)
  process.exit(1)
}

const html = readFileSync('dist/index.html', 'utf8')
const forbiddenRootAssets = [
  'href="/manifest.json"',
  'href="/favicon.svg"',
  'href="/icons/',
  'content="/og-image.png"',
  'src="/og-image.png"',
]
const broken = forbiddenRootAssets.filter(value => html.includes(value))
if (broken.length) {
  console.error(`Root-absolute Pages asset references found:\n${broken.join('\n')}`)
  process.exit(1)
}

if (!html.includes('manifest.json') || !html.includes('og-image.png')) {
  console.error('Built HTML is missing manifest or social-image metadata.')
  process.exit(1)
}

console.log(`Deployment artifact check passed (${required.length} required files, ${(statSync('dist').isDirectory() ? 'dist/' : 'dist missing')}).`)