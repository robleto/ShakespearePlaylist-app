#!/usr/bin/env tsx
/**
 * Orchestration script: fetch/update companies (Notion) then run scrapers.
 * Steps:
 * 1. Ingest companies from provided Notion URL or local HTML (NOTION_COMPANIES_URL env or arg)
 * 2. Run existing scrape.ts to collect productions
 * Exit code bubbles up failures from either phase.
 */
import { spawn } from 'child_process'
import path from 'path'

function runNode(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', env })
    proc.on('close', (code) => {
      if (code === 0) return resolve()
      reject(new Error(`${args.join(' ')} exited with code ${code}`))
    })
  })
}

async function main() {
  const start = Date.now()
  // Simple arg parsing: --quiet to suppress most logs; first non-flag arg is notion URL/file
  const args = process.argv.slice(2)
  const quiet = args.includes('--quiet') || process.env.QUIET === '1'
  if (quiet) process.env.QUIET = '1'
  const notionArg = args.find(a => !a.startsWith('-') && a !== '--quiet') // optional override
  const notionUrl = notionArg || process.env.NOTION_COMPANIES_URL
  if (!notionUrl) {
    if (!quiet) console.warn('⚠️  No Notion URL provided (arg or NOTION_COMPANIES_URL). Skipping ingestion phase.')
  } else {
    if (!quiet) console.log('🚚 Phase 1: Ingest companies from Notion...')
    await runNode('npx', ['tsx', path.join('scripts', 'ingestCompaniesFromNotion.ts'), notionUrl], process.env)
    if (!quiet) console.log('✅ Ingestion phase complete')
  }

  if (!quiet) console.log('🎭 Phase 2: Run scrapers...')
  await runNode('npx', ['tsx', path.join('scripts', 'scrape.ts')], process.env)
  if (!quiet) console.log('✅ Scraping phase complete')

  const ms = Date.now() - start
  if (!quiet) console.log(`🏁 Orchestration done in ${(ms/1000).toFixed(1)}s`)
}

main().catch(err => {
  console.error('💥 Orchestration failed:', err)
  process.exit(1)
})
