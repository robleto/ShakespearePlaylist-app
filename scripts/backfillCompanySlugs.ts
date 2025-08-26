#!/usr/bin/env tsx
/**
 * Backfill slugs for companies based on name.
 * - Normalizes to lowercase, alphanumeric-hyphen
 * - Dedupes with numeric suffix
 */
import { prisma } from '../lib/db'

function slugify(name: string) {
  return name.toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/--+/g,'-')
}

async function main() {
  const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } }) as any[]
  const existing = new Set<string>()
  for (const c of companies) {
  if ((c as any).slug) { existing.add((c as any).slug); continue }
    let base = slugify(c.name)
    let slug = base
    let i = 2
    while (existing.has(slug)) { slug = `${base}-${i++}` }
  await prisma.company.update({ where: { id: c.id }, data: { slug } as any })
    existing.add(slug)
    console.log(`Set slug ${slug} for ${c.name}`)
  }
  console.log('Done.')
}
main().catch(e=>{ console.error(e); process.exit(1) })
