import fs from 'node:fs'
import path from 'node:path'
import type { Production, ProductionsFile } from '@/types/production'

// Server-only. Reads public/productions.json (the static file the
// discovery:publish pipeline emits) and provides per-play lookups.
//
// The file is read once at module init and cached for the process. In
// dev, restarting `pnpm dev` reloads it. In prod, a redeploy or a new
// process picks up the new file. v1 doesn't need cache invalidation.

const PRODUCTIONS_FILE = path.join(process.cwd(), 'public', 'productions.json')

let cached: ProductionsFile | null = null

function load(): ProductionsFile {
  if (cached) return cached
  try {
    const raw = fs.readFileSync(PRODUCTIONS_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as ProductionsFile
    cached = parsed
    return parsed
  } catch {
    cached = { productions: [], lastPublished: null }
    return cached
  }
}

export function productionsForPlay(playId: string): Production[] {
  return load()
    .productions.filter((p) => p.playId === playId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
}
