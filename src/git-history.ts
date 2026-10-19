import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const preparations = new Map<string, Promise<boolean>>()

// Preserve the dates from before the directory migration and initial translations.
export const articleDateBaseline = {
  revision: '763699daae6f2012055a926e78f78d2fe40e63b5',
  historicalRevision: 'b1e36adafe7f9e5da4d17d075013f20c22fd3b19',
  dates: {
    algorithm: '2026-05-17T20:56:13+08:00',
    'computer-network': '2026-06-06T00:12:11+08:00',
    'hot-100': '2026-09-09T01:35:02+08:00',
    'leetcode-review': '2026-03-16T07:13:10+08:00',
    'my-fedora-journey': '2026-06-06T00:12:11+08:00',
    'network-layer': '2026-04-10T10:51:39+08:00',
    'oauth-and-oidc': '2026-09-07T16:22:40+08:00',
    'proxy-server': '2026-04-10T10:51:39+08:00',
    'why-proxy-traffic-gets-detected': '2026-04-11T13:57:49+08:00',
    'woc-2025': '2026-03-03T15:11:11+08:00',
    'hgame-2024': '2026-03-04T20:43:37+08:00',
  } as Record<string, string>,
}

async function prepareGitHistory(cwd: string): Promise<boolean> {
  const options = {
    cwd,
    timeout: 60_000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C', LANGUAGE: 'C' },
  }
  let shallow: string
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['rev-parse', '--is-shallow-repository'],
      options,
    )
    shallow = stdout.trim()
  } catch (error) {
    const gitError = error as NodeJS.ErrnoException & { stderr?: string }
    if (gitError.code === 'ENOENT' || /not a git repository/i.test(gitError.stderr ?? ''))
      return false
    throw error
  }
  if (shallow === 'false') return true
  if (shallow !== 'true')
    throw new Error('[posts] Unable to determine Git history depth.')

  console.info(
    '[posts] Shallow Git checkout detected; fetching complete article history.',
  )
  try {
    await execFileAsync('git', ['fetch', '--unshallow', '--no-tags'], options)
    const { stdout } = await execFileAsync(
      'git',
      ['rev-parse', '--is-shallow-repository'],
      options,
    )
    if (stdout.trim() !== 'false') throw new Error('Git checkout is still shallow.')
  } catch (error) {
    throw new Error(
      '[posts] Complete Git history is required for accurate updated dates. Fetch the full history before rebuilding.',
      { cause: error },
    )
  }
  console.info('[posts] Complete Git history is ready.')
  return true
}

export function ensureGitHistory(cwd = process.cwd()): Promise<boolean> {
  let preparation = preparations.get(cwd)
  if (!preparation) {
    preparation = prepareGitHistory(cwd)
    preparations.set(cwd, preparation)
  }
  return preparation
}

interface Article {
  id: string
  filePath?: string
  data: { published: Date; modified?: Date; translationKey?: string }
}

export async function getArticleModifiedDate(
  post: Article,
  cwd = process.cwd(),
): Promise<Date> {
  if (post.data.modified) return post.data.modified
  const baseline =
    post.data.translationKey &&
    Object.hasOwn(articleDateBaseline.dates, post.data.translationKey)
      ? articleDateBaseline.dates[post.data.translationKey]
      : undefined
  const fallback = baseline ? new Date(baseline) : post.data.published
  if (!(await ensureGitHistory(cwd))) {
    console.warn(
      `[posts] Git history unavailable for "${post.id}"; using its saved date.`,
    )
    return fallback
  }

  const filePath = post.filePath ?? `src/content/posts/${post.id}`
  const options = { cwd, timeout: 60_000, env: { ...process.env, LC_ALL: 'C' } }
  const logArgs = ['log', '--follow', '-1', '--format=%cI']
  if (baseline) {
    const { stdout } = await execFileAsync(
      'git',
      [...logArgs, `${articleDateBaseline.revision}..HEAD`, '--', filePath],
      options,
    )
    if (!stdout.trim()) return fallback
    const modified = new Date(stdout.trim())
    if (Number.isNaN(modified.getTime()))
      throw new Error(`[posts] Invalid Git date for "${post.id}".`)
    return modified
  }

  try {
    const legacyPath = filePath
      .replace(/\/zh\//, '/')
      .replace(/\/en\/(.*)\.(mdx?)$/, '/$1-en.$2')
    let { stdout } = await execFileAsync('git', [...logArgs, '--', filePath], options)
    if (!stdout.trim() && legacyPath !== filePath) {
      ;({ stdout } = await execFileAsync('git', [...logArgs, '--', legacyPath], options))
    }
    const modified = new Date(stdout.trim())
    if (!stdout.trim() || Number.isNaN(modified.getTime()))
      throw new Error('invalid date')
    return modified
  } catch (error) {
    console.warn(
      `[posts] Unable to derive modified date for "${post.id}"; falling back to published date.`,
      error,
    )
    return post.data.published
  }
}
