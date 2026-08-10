import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const hooksSource = await readFile(new URL('../src/hooks/useAdmin.js', import.meta.url), 'utf8')

test('freelance admin hook declares and returns its request error state', () => {
  const hookSource = hooksSource.match(
    /export function useAdminFreelanceJobs[\s\S]*?(?=export function useAdminCAProfiles)/,
  )?.[0]

  assert.ok(hookSource)
  assert.match(hookSource, /const \[error, setError\] = useState\(null\)/)
  assert.match(hookSource, /catch \(err\)[\s\S]*setError\(err\.message\)/)
  assert.match(hookSource, /return \{ data, freelancers, total, loading, error, reload: load \}/)
})
