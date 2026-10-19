import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { slug } from 'github-slugger'
import { execute, read, root } from './helpers/runtime.mjs'

const require = createRequire(import.meta.url)
const source = read('src/git-history.ts')
const article = 'src/content/posts/zh/example.md'
const git = (cwd, ...args) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
const date = (cwd) => git(cwd, 'log', '--follow', '-1', '--format=%cI', '--', article)

function load(runGit, moduleSource = source, processContext = process) {
  const logs = []
  const api = execute(moduleSource, {
    process: processContext,
    console: {
      info: (message) => logs.push(message),
      warn: (message) => logs.push(message),
    },
    require: runGit
      ? (name) =>
          name === 'node:child_process' ? { execFile: runGit } : { promisify: (fn) => fn }
      : require,
  })
  return { ...api, logs }
}

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-git-history-'))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  const origin = path.join(directory, 'origin')
  fs.mkdirSync(origin)
  git(origin, 'init', '--quiet', '--initial-branch=main')
  git(origin, 'config', 'user.name', 'Blog date test')
  git(origin, 'config', 'user.email', 'blog-date@example.test')
  function commit(message, timestamp) {
    execFileSync(
      'git',
      [
        '-c',
        'commit.gpgsign=false',
        '-c',
        'core.hooksPath=/dev/null',
        'commit',
        '-qm',
        message,
      ],
      {
        cwd: origin,
        env: {
          ...process.env,
          GIT_AUTHOR_DATE: timestamp,
          GIT_COMMITTER_DATE: timestamp,
        },
        stdio: 'pipe',
      },
    )
  }
  fs.mkdirSync(path.dirname(path.join(origin, article)), { recursive: true })
  fs.writeFileSync(path.join(origin, article), '# Article\n')
  git(origin, 'add', '.')
  commit('Write article', '2025-02-24T12:00:00+08:00')
  fs.writeFileSync(path.join(origin, 'site.json'), '{}\n')
  git(origin, 'add', '.')
  commit('Change site configuration', '2026-10-18T23:30:55+08:00')
  const shallow = path.join(directory, 'shallow')
  git(directory, 'clone', '--quiet', '--depth=1', pathToFileURL(origin).href, shallow)
  return { directory, origin, shallow, commit }
}

test('shallow checkout recovers the full-history article date without changing HEAD', async (t) => {
  const { origin, shallow } = fixture(t)
  const head = git(shallow, 'rev-parse', 'HEAD')
  assert.notEqual(date(shallow), date(origin))
  const { ensureGitHistory, logs } = load()
  const preparation = ensureGitHistory(shallow)
  assert.equal(ensureGitHistory(shallow), preparation)
  await Promise.all([
    preparation,
    ...Array.from({ length: 22 }, () => ensureGitHistory(shallow)),
  ])
  assert.equal(git(shallow, 'rev-parse', '--is-shallow-repository'), 'false')
  assert.equal(date(shallow), date(origin))
  assert.equal(git(shallow, 'rev-parse', 'HEAD'), head)
  assert.equal(git(shallow, 'status', '--porcelain'), '')
  assert.equal(logs.filter((message) => message.includes('fetching')).length, 1)
})

test('complete history needs no remote access', async (t) => {
  const { origin } = fixture(t)
  git(origin, 'remote', 'add', 'origin', path.join(origin, 'missing-remote'))
  const { ensureGitHistory, logs } = load()
  await ensureGitHistory(origin)
  assert.deepEqual(logs, [])
})

test('failed shallow fetch rejects and remains failed for concurrent callers', async (t) => {
  const { shallow } = fixture(t)
  git(shallow, 'remote', 'set-url', 'origin', path.join(shallow, 'missing-remote'))
  const { ensureGitHistory, logs } = load()
  const preparation = ensureGitHistory(shallow)
  await assert.rejects(preparation, /Complete Git history is required/)
  assert.equal(ensureGitHistory(shallow), preparation)
  await assert.rejects(ensureGitHistory(shallow), /Complete Git history is required/)
  assert.equal(git(shallow, 'rev-parse', '--is-shallow-repository'), 'true')
  assert.equal(logs.filter((message) => message.includes('fetching')).length, 1)
})

test('source archive without Git metadata retains the published-date fallback', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-source-archive-'))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  const { getArticleModifiedDate } = load(undefined, source, {
    env: { ...process.env, LC_ALL: 'zh_CN.UTF-8', LANGUAGE: 'zh_CN' },
    cwd: () => directory,
  })
  const published = new Date('2025-02-24T12:00:00Z')
  assert.equal(
    await getArticleModifiedDate({ id: 'archive', data: { published } }),
    published,
  )
  for (const translationKey of ['constructor', 'toString', '__proto__']) {
    assert.equal(
      await getArticleModifiedDate({
        id: translationKey,
        data: { published, translationKey },
      }),
      published,
    )
  }
})

test('missing Git is allowed, but repository read failures and unexpected depth fail', async () => {
  await load(async () => {
    throw Object.assign(new Error('Git missing'), { code: 'ENOENT' })
  }).ensureGitHistory('missing-git')
  await assert.rejects(
    load(async () => {
      throw Object.assign(new Error('Repository inaccessible'), { code: 'EACCES' })
    }).ensureGitHistory('inaccessible-repository'),
    /Repository inaccessible/,
  )
  await assert.rejects(
    load(async () => ({ stdout: 'unexpected' })).ensureGitHistory('invalid-depth'),
    /Unable to determine Git history depth/,
  )
})

test('a successful fetch must still leave a complete repository', async () => {
  for (const result of ['true', 'unexpected', new Error('Verification failed')]) {
    let checks = 0
    const { ensureGitHistory } = load(async (_command, args) => {
      if (args[0] === 'fetch') return { stdout: '' }
      if (++checks === 1) return { stdout: 'true' }
      if (result instanceof Error) throw result
      return { stdout: result }
    })
    await assert.rejects(
      ensureGitHistory('incomplete-fetch'),
      /Complete Git history is required/,
    )
  }
})

test('history errors escape the article date fallback and explicit modified still wins', async () => {
  const explicit = new Date('2026-09-07T00:00:00Z')
  const api = load(async () => {
    throw Object.assign(new Error('Repository inaccessible'), { code: 'EACCES' })
  })
  assert.equal(
    await api.getArticleModifiedDate({ id: 'explicit', data: { modified: explicit } }),
    explicit,
  )
  await assert.rejects(
    api.getArticleModifiedDate({ id: 'example', data: { published: explicit } }),
    /Repository inaccessible/,
  )
})

test('all restored dates match the original Chinese files before migration', () => {
  const { articleDateBaseline } = load()
  const verified = new Set()
  const originalPaths = git(
    root,
    'ls-tree',
    '-r',
    '--name-only',
    articleDateBaseline.historicalRevision,
    '--',
    'src/content/posts',
  ).split('\n')
  for (const originalPath of originalPaths) {
    if (!/^src\/content\/posts\/[^/]+\.md$/.test(originalPath)) continue
    const key = slug(path.basename(originalPath, '.md'))
    if (!articleDateBaseline.dates[key]) continue
    const original = git(
      root,
      'log',
      '--follow',
      '-1',
      '--format=%cI',
      articleDateBaseline.historicalRevision,
      '--',
      originalPath,
    )
    assert.equal(articleDateBaseline.dates[key], original, key)
    verified.add(key)
  }
  assert.equal(verified.size, Object.keys(articleDateBaseline.dates).length)
})

test('restored dates survive migration and later article commits update automatically', async (t) => {
  const { origin, commit } = fixture(t)
  const originalBaseline = load().articleDateBaseline
  const fixtureSource = source.replace(
    originalBaseline.revision,
    git(origin, 'rev-parse', 'HEAD'),
  )
  const { getArticleModifiedDate, articleDateBaseline } = load(undefined, fixtureSource)
  const post = {
    id: 'example',
    filePath: article,
    data: { published: new Date('2025-02-24'), translationKey: 'computer-network' },
  }
  const restored = await getArticleModifiedDate(post, origin)
  assert.equal(
    restored.toISOString(),
    new Date(articleDateBaseline.dates['computer-network']).toISOString(),
  )
  const english = {
    ...post,
    id: 'example-en',
    filePath: 'src/content/posts/en/example.md',
  }
  assert.equal(
    (await getArticleModifiedDate(english, origin)).toISOString(),
    restored.toISOString(),
  )

  fs.appendFileSync(path.join(origin, article), '\nNew article content.\n')
  git(origin, 'add', '.')
  commit('Update article', '2026-10-19T10:00:00+08:00')
  assert.equal(
    (await getArticleModifiedDate(post, origin)).toISOString(),
    new Date(date(origin)).toISOString(),
  )
  assert.equal(
    (await getArticleModifiedDate(english, origin)).toISOString(),
    restored.toISOString(),
  )
})

test('new articles and legacy paths still derive their dates from Git', async (t) => {
  const { origin } = fixture(t)
  const post = {
    id: 'new',
    filePath: article,
    data: { published: new Date('2025-01-01') },
  }
  assert.equal(
    (await load().getArticleModifiedDate(post, origin)).toISOString(),
    new Date(date(origin)).toISOString(),
  )

  const paths = []
  const api = load(async (_command, args) => {
    if (args[0] === 'rev-parse') return { stdout: 'false' }
    paths.push(args.at(-1))
    return { stdout: paths.length === 1 ? '' : '2026-04-10T10:51:39+08:00' }
  })
  await api.getArticleModifiedDate({
    ...post,
    filePath: 'src/content/posts/en/legacy.md',
  })
  assert.deepEqual(paths, [
    'src/content/posts/en/legacy.md',
    'src/content/posts/legacy-en.md',
  ])
})

test('an unavailable baseline revision fails instead of publishing a migration date', async () => {
  const api = load(async (_command, args) => {
    if (args[0] === 'rev-parse') return { stdout: 'false' }
    throw new Error('Baseline revision missing')
  })
  await assert.rejects(
    api.getArticleModifiedDate({
      id: 'existing',
      data: { published: new Date('2025-01-01'), translationKey: 'computer-network' },
    }),
    /Baseline revision missing/,
  )
})
