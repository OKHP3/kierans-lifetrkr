import { copyFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const assetsDirectory = 'dist/assets'
const serviceWorkerPath = 'dist/sw.js'

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  })
}

const builtAssets = listFiles(assetsDirectory)
  .map(path => `./${relative('dist', path).replaceAll('\\', '/')}`)
  .sort()

const source = readFileSync(serviceWorkerPath, 'utf8')
const marker = 'const BUILT_ASSETS = []'
if (!source.includes(marker)) {
  throw new Error(`Service worker asset marker missing from ${serviceWorkerPath}`)
}

const replacement = `const BUILT_ASSETS = ${JSON.stringify(builtAssets)}`
writeFileSync(serviceWorkerPath, source.replace(marker, replacement))
copyFileSync('dist/index.html', 'dist/404.html')
console.log(`Service worker prepared with ${builtAssets.length} built app assets and Pages fallback.`)
