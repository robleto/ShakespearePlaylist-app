import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { parseCompaniesFromNotionHTML } from '../lib/ingestion/notionCompanies'

describe('parseCompaniesFromNotionHTML', () => {
  const fixture = fs.readFileSync(path.join(__dirname, 'fixtures', 'notion-festivals.html'), 'utf8')
  const companies = parseCompaniesFromNotionHTML(fixture)

  it('extracts all companies', () => {
    expect(companies.length).toBe(3)
  })

  it('normalizes websites', () => {
    const utah = companies.find(c => c.name.includes('Utah'))!
    expect(utah.website).toBe('https://bard.org')
    const osf = companies.find(c => c.name.includes('Oregon'))!
    expect(osf.website).toBe('https://osfashland.org')
  })

  it('parses location when present', () => {
    const utah = companies.find(c => c.name.includes('Utah'))!
    expect(utah.city).toBe('Cedar City')
    expect(utah.region).toBe('UT')
  })
})
