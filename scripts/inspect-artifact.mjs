import { existsSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join, relative } from 'node:path'

const required = [
  'dist/index.html',
  'dist/404.html',
  'dist/manifest.json',
  'dist/favicon.svg',
  'dist/icons/icon-192.png',
  'dist/icons/icon-512.png',
  'dist/og-image.png',
  'dist/sw.js',
]

const releaseIdentityPath = 'dist/release-identity.json'

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  })
}

function currentSourceIdentity() {
  try {
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    const dirty = execFileSync(
      'git',
      ['status', '--porcelain', '--untracked-files=no'],
      { encoding: 'utf8' },
    ).trim().length > 0
    return {
      commit,
      dirty,
      reviewedCommit: dirty ? `${commit}+dirty` : commit,
    }
  } catch {
    console.error('Unable to determine the reviewed source identity from git.')
    process.exit(1)
  }
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

const missing = required.filter(path => !existsSync(path))
if (missing.length) {
  console.error(`Missing deployment artifacts:\n${missing.join('\n')}`)
  process.exit(1)
}

const packageMetadata = JSON.parse(readFileSync('package.json', 'utf8'))
const lockMetadata = JSON.parse(readFileSync('package-lock.json', 'utf8'))
if (lockMetadata.version !== packageMetadata.version || lockMetadata.packages?.['']?.version !== packageMetadata.version) {
  fail(`Release version mismatch: package.json=${packageMetadata.version}, package-lock.json=${lockMetadata.version}, package root=${lockMetadata.packages?.['']?.version}`)
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
  fail('Built HTML is missing manifest or social-image metadata.')
}

const builtVersion = html.match(/<meta\s+name="lifetrkr-version"\s+content="([^"]+)"\s*\/?>/)?.[1]
if (builtVersion !== packageMetadata.version) {
  fail(`Built application version mismatch: package.json=${packageMetadata.version}, dist/index.html=${builtVersion ?? 'missing'}`)
}

if (existsSync(releaseIdentityPath)) {
  unlinkSync(releaseIdentityPath)
}

const sourceIdentity = currentSourceIdentity()
const reviewedCommit = sourceIdentity.reviewedCommit
const artifactFiles = listFiles('dist')
  .map(path => ({
    path: relative('dist', path).replaceAll('\\', '/'),
    bytes: statSync(path).size,
    sha256: sha256(path),
  }))
  .sort((left, right) => left.path.localeCompare(right.path))

const artifactIdentity = createHash('sha256')
  .update(JSON.stringify({
    applicationVersion: packageMetadata.version,
    reviewedCommit,
    files: artifactFiles,
  }))
  .digest('hex')

const releaseIdentity = {
  schemaVersion: 1,
  applicationVersion: packageMetadata.version,
  applicationVersionLabel: `v${packageMetadata.version}`,
  reviewedCommit,
  sourceCommit: sourceIdentity.commit,
  sourceTreeState: sourceIdentity.dirty ? 'dirty' : 'clean',
  artifactIdentity: `sha256:${artifactIdentity}`,
  artifactFiles,
}
writeFileSync(releaseIdentityPath, `${JSON.stringify(releaseIdentity, null, 2)}\n`)

const expectedVersion = process.env.RELEASE_EXPECTED_VERSION
const expectedCommit = process.env.RELEASE_EXPECTED_COMMIT
const expectedArtifactIdentity = process.env.RELEASE_EXPECTED_ARTIFACT_IDENTITY
const mismatches = [
  expectedVersion && expectedVersion !== releaseIdentity.applicationVersion
    ? `expected version ${expectedVersion}, got ${releaseIdentity.applicationVersion}`
    : null,
  expectedCommit && expectedCommit !== releaseIdentity.reviewedCommit
    ? `expected commit ${expectedCommit}, got ${releaseIdentity.reviewedCommit}`
    : null,
  expectedArtifactIdentity && expectedArtifactIdentity !== releaseIdentity.artifactIdentity
    ? `expected artifact identity ${expectedArtifactIdentity}, got ${releaseIdentity.artifactIdentity}`
    : null,
].filter(Boolean)
if (mismatches.length) {
  fail(`Release identity mismatch:\n${mismatches.join('\n')}`)
}

console.log(`Release validation passed.`)
console.log(`  Application version: ${releaseIdentity.applicationVersionLabel}`)
console.log(`  Reviewed commit: ${releaseIdentity.reviewedCommit}`)
console.log(`  Artifact identity: ${releaseIdentity.artifactIdentity}`)
console.log(`  Artifact report: ${releaseIdentityPath}`)
console.log(`  Deployment artifact check passed (${required.length} required files, ${(statSync('dist').isDirectory() ? 'dist/' : 'dist missing')}).`)