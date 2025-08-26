// Lightweight parser for a public Notion-exported HTML page listing companies / festivals.
// Heuristics:
// - Company name is taken from <h1>-<h4> text.
// - The next anchor tag with a non-social domain is treated as primary website.
// - Location info (City, Region, Country) optionally parsed from the same line or following paragraph.
// This can be refined once we see real Notion HTML; kept intentionally permissive & deterministic.

export interface ParsedCompany {
  name: string
  website: string
  city?: string
  region?: string
  country?: string
}

const SOCIAL_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'youtube.com',
  'tiktok.com',
  'linkedin.com',
]

export function parseCompaniesFromNotionHTML(html: string): ParsedCompany[] {
  const results: ParsedCompany[] = []
  if (!html) return results

  // Normalize whitespace for simpler regex passes
  const clean = html.replace(/\r\n?|\n+/g, '\n')

  // Match heading blocks
  const headingRegex = /<(h[1-4])[^>]*>([^<]{2,120})<\/\1>/gi
  let match: RegExpExecArray | null
  while ((match = headingRegex.exec(clean)) !== null) {
    const rawName = strip(match[2])
    if (!rawName) continue
    // Find the slice of HTML after the heading up to next heading to search for links & location
    const segmentStart = match.index + match[0].length
    const nextHeadingIdx = clean.slice(segmentStart).search(/<h[1-4][^>]*>/i)
    const segment = nextHeadingIdx === -1 ? clean.slice(segmentStart) : clean.slice(segmentStart, segmentStart + nextHeadingIdx)

    const primaryLink = extractPrimaryWebsite(segment)
    if (!primaryLink) continue
    const location = extractLocation(segment)
    results.push({ name: rawName, website: primaryLink, ...location })
  }

  // De-duplicate by normalized website host
  const seen = new Set<string>()
  return results.filter(r => {
    const host = tryGetHost(r.website)
    if (!host) return false
    if (seen.has(host)) return false
    seen.add(host)
    return true
  })
}

function extractPrimaryWebsite(segment: string): string | undefined {
  // Gather all anchors
  const anchorRegex = /<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>(.*?)<\/a>/gi
  let m: RegExpExecArray | null
  const candidates: string[] = []
  while ((m = anchorRegex.exec(segment)) !== null) {
    const href = m[1].trim()
    if (!/^https?:/i.test(href)) continue
    const host = tryGetHost(href)
    if (!host) continue
    if (SOCIAL_DOMAINS.some(sd => host.endsWith(sd))) continue
    candidates.push(normalizeWebsite(href))
  }
  return candidates[0]
}

function extractLocation(segment: string): { city?: string; region?: string; country?: string } {
  // Look for pattern after an anchor closing tag to reduce false positives (website text)
  const afterLinks = segment.split(/<\/a>/i).slice(1).join(' ')
  const text = strip(afterLinks)
  const locMatch = text.match(/([A-Za-z .'-]{2,40}),\s*([A-Z]{2})(?:,\s*([A-Z]{2}))?/) // City, ST[, CC]
  if (!locMatch) return {}
  const [, city, region, country] = locMatch
  return { city: city.trim(), region: region.trim(), country: country?.trim() || 'US' }
}

function strip(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim()
}

function normalizeWebsite(url: string): string {
  try {
    const u = new URL(url)
    u.protocol = 'https:'
    u.hash = ''
    u.search = ''
    // remove common tracking subdomains like www.
    if (u.hostname.startsWith('www.')) u.hostname = u.hostname.slice(4)
    return u.toString().replace(/\/$/, '')
  } catch {
    return url
  }
}

function tryGetHost(url: string): string | undefined {
  try { return new URL(url).hostname.replace(/^www\./,'') } catch { return }
}
