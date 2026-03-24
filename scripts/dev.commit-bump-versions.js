#!/usr/bin/env node
'use strict'

/**
 * This script is meant to be used as a git commit-msg hook.
 * To bump versions in package.json files based on the pattern of the commit message.
 * 
 * Patterns:
 * - <type>[(scope) | \[scope\]][!]: <description>
 *   - <type> is required.
 *   - <scope> optional and surrounded by either parentheses or square brackets for flexibility.
 *   - ! is optional.
 * 
 * Where:
 * - type: the type of the commit (feat, fix, refactor, docs, style, test, chore, ci) based on conventional commits.
 * - scope: the optional context of the commit (backend, frontend, domain) which corresponds to the package.json file to bump.
 *   - *If not specified, it will bump all the package.json files.
 * - !: optional indication of a breaking change.
 * 
 * Conditions:
 * - (fix, docs, style, chore, test, ci) will bump the patch version.
 * - (feat and refactor) will bump the minor version.
 * - If the commit message contains a breaking change indicator (!), it will bump the major version.
 * 
 * Example commit messages:
 * - `feat(backend): add new API endpoint` -> bumps minor version in packages/backend/package.json and package.json
 * - `fix: correct typo in documentation` -> bumps patch version in all package.json files
 * - `refactor(frontend)!: change component structure` -> bumps major version in packages/frontend/package.json and package.json
 * - `docs: update README` -> bumps patch version in all package.json files
 * - `chore[frontend]: update dependencies` -> bumps patch version in packages/frontend/package.json and package.json
 * 
 * Requirements:
 * - To have a commit message that follows the conventional commits format.
 * - Used by husky as a post-commit hook to automatically bump versions and amend the commit to include the version changes.
 */

const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const ROOT = resolve(__dirname, '..')

const CONTEXT_MAP = {
  backend: 'packages/backend/package.json',
  frontend: 'packages/frontend/package.json',
  domain:   'packages/domain/package.json',
}

// Pattern: <type>[(scope)|\[scope\]][!]
const COMMIT_MSG_PATTERN = /^(\w+)(?:\(([^)]+)\)|\[([^\]]+)\])?(!)?:/

function bumpVersion(version, bump) {
  const parts = version.split('.').map(Number)
  if (parts.length !== 3) return version
  const [major, minor, patch] = parts
  if (bump === 'major') return `${major + 1}.0.0`
  if (bump === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

const commitMsgFile = process.argv[2]
if (!commitMsgFile) process.exit(0)

const commitMsg = readFileSync(commitMsgFile, 'utf8').trim()

const match = commitMsg.match(COMMIT_MSG_PATTERN)
if (!match) process.exit(0)

const type = match[1]
const context = match[2] || match[3]
const breakingChange = !!match[4]

let bump = null
if (breakingChange) bump = 'major'
else if (type === 'feat' || type === 'refactor') bump = 'minor'
else if (['fix', 'docs', 'style', 'chore', 'test', 'ci'].includes(type)) bump = 'patch'

if (!bump) process.exit(0)

const targets = (context && CONTEXT_MAP[context])
  ? [CONTEXT_MAP[context], 'package.json']
  : ['package.json', ...Object.values(CONTEXT_MAP)]

const changed = []
for (const rel of targets) {
  const fullPath = resolve(ROOT, rel)
  try {
    const raw = readFileSync(fullPath, 'utf8')
    const pkg = JSON.parse(raw)
    const oldVersion = pkg.version

    pkg.version = bumpVersion(oldVersion, bump)
    const trailingNewLine = raw.endsWith('\n') ? '\n' : ''
    writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + trailingNewLine)
    process.stderr.write(`[bump] ${rel}: ${oldVersion} → ${pkg.version}\n`)
    changed.push(fullPath)
  } catch {}
}

if (changed.length > 0) process.stdout.write(changed.join('\n') + '\n')
