#!/usr/bin/env tsx
/**
 * Discover likely company websites for rows missing a URL in a CSV.
 * Usage:
 *   tsx scripts/discoverCompanyWebsites.ts path/to/companies.csv
 * Outputs: <input>_with_urls.csv and <input>_discovery.json
 */
import fs from 'fs'
import path from 'path'

if (process.argv.length < 3) {
  console.error('Usage: tsx scripts/discoverCompanyWebsites.ts <file.csv>')
  process.exit(1)
}

const infile = path.resolve(process.argv[2])
if (!fs.existsSync(infile)) { console.error('File not found:', infile); process.exit(1) }
const csv = fs.readFileSync(infile, 'utf8')

function splitCSVLine(line: string) {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i=0;i<line.length;i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; continue }
      inQuotes = !inQuotes
      continue
    }
    if (!inQuotes && ch === ',') { out.push(cur); cur = ''; continue }
    cur += ch
  }
  out.push(cur)
  return out
}

function joinCSVLine(parts: string[]) {
  return parts.map(p => {
    if (p == null) return ''
    if (p.includes(',') || p.includes('"')) return '"' + p.replace(/"/g,'""') + '"'
    return p
  }).join(',')
}

function slugify(name: string) {
  return name.toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/--+/g,'-')
}

function candidatesFor(name: string) {
  const s = slugify(name)
  const tops = ['org','com','net']
  const out: string[] = []
  if (s) {
    for (const t of tops) out.push(`${s}.${t}`)
    out.push(`${s.replace(/-(theatre|theater|festival|company|company|co|inc)$/,'')}.org`)
    out.push(`${s}theatre.org`)
    out.push(`${s}theatre.com`)
    out.push(`${s}theater.org`)
    out.push(`${s}shakespeare.org`)
    out.push(`${s}.company`)
  }
  // also try www
  return Array.from(new Set(out.flatMap(h => [h, `www.${h}`])))
}

async function probeHost(host: string, timeoutMs = 5000) {
  const url = `https://${host}`
  const ac = new AbortController()
  const id = setTimeout(() => ac.abort(), timeoutMs)
  try {
    // Try HEAD first
    const r = await fetch(url, { method: 'HEAD', signal: ac.signal, redirect: 'follow', headers: { 'User-Agent': 'ShakesFindBot/1.0 (+https://shakesfind.com)' } })
    clearTimeout(id)
    if (r.ok) return url
    // Some servers don't accept HEAD - try GET
    const r2 = await fetch(url, { method: 'GET', signal: ac.signal, redirect: 'follow', headers: { 'User-Agent': 'ShakesFindBot/1.0 (+https://shakesfind.com)' } })
    clearTimeout(id)
    if (r2.ok) return url
    return null
  } catch (err) {
    clearTimeout(id)
    return null
  }
}

async function discover(rows: string[][], headerMap: Record<string, number>) {
  const results: Record<number, { found?: string; tried: string[] }> = {}
  for (let i=1;i<rows.length;i++) {
    const row = rows[i]
    const urlIdx = headerMap['url'] ?? headerMap['website'] ?? -1
    const nameIdx = headerMap['name'] ?? 0
    const name = (row[nameIdx] || '').trim()
    const existingUrl = urlIdx >=0 ? (row[urlIdx] || '').trim() : ''
    if (!name) continue
    if (existingUrl) continue
    const cands = candidatesFor(name)
    results[i] = { tried: [] }
    for (const c of cands) {
      results[i].tried.push(c)
      const found = await probeHost(c)
      if (found) { results[i].found = found; break }
      // polite pause
      await new Promise(r=> setTimeout(r, 200))
    }
  }
  return results
}

// parse CSV
const lines = csv.split(/\r?\n/)
const header = splitCSVLine(lines[0]).map(h=> h.trim())
const headerMap: Record<string, number> = {}
for (let i=0;i<header.length;i++) headerMap[header[i].toLowerCase()] = i

const rows = lines.map(l=> splitCSVLine(l))

;(async ()=>{
  console.log('Scanning', rows.length-1, 'rows for missing URLs...')
  const report = await discover(rows, headerMap)
  // apply to rows
  for (const idxStr of Object.keys(report)) {
    const idx = Number(idxStr)
    const r = report[idx]
    if (r.found) {
      const urlIdx = headerMap['url'] ?? headerMap['website'] ?? (rows[idx].length)
      // ensure row length
      while (rows[idx].length <= urlIdx) rows[idx].push('')
      rows[idx][urlIdx] = r.found
    }
  }
  const outCsv = rows.map(r=> joinCSVLine(r)).join('\n')
  const outFile = infile.replace(/\.csv$/i,'') + '_with_urls.csv'
  const jsonFile = infile.replace(/\.csv$/i,'') + '_discovery.json'
  fs.writeFileSync(outFile, outCsv, 'utf8')
  fs.writeFileSync(jsonFile, JSON.stringify(report, null, 2), 'utf8')
  console.log('Wrote', outFile)
  console.log('Wrote', jsonFile)
})().catch(e=>{ console.error(e); process.exit(1) })
