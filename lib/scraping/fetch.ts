import robotsParser from 'robots-parser'

interface RateLimiter {
  lastRequest: Map<string, number>
  delay: number
}

const rateLimiter: RateLimiter = {
  lastRequest: new Map(),
  delay: 1000, // 1 second between requests per domain
}

export interface FetchOptions {
  headers?: Record<string, string>
  timeout?: number
  respectRobots?: boolean
  userAgent?: string
}

export interface FetchResult {
  content: string
  status: number
  etag?: string
  lastModified?: string
  error?: string
}

const DEFAULT_USER_AGENT = 'ShakespearePlaylistBot/0.1 (contact: admin@shakespeareplaylist.com)'

export async function fetchWithPoliteness(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult> {
  const {
    headers = {},
    timeout = 10000,
    respectRobots = true,
    userAgent = DEFAULT_USER_AGENT,
  } = options

  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname

    // Check robots.txt if requested
    if (respectRobots) {
      const robotsAllowed = await checkRobots(url, userAgent)
      if (!robotsAllowed) {
        return {
          content: '',
          status: 403,
          error: 'Blocked by robots.txt',
        }
      }
    }

    // Rate limiting
    await enforceRateLimit(domain)

    // Prepare headers
    const fetchHeaders = {
      'User-Agent': userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Cache-Control': 'no-cache',
      ...headers,
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      headers: fetchHeaders,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const content = await response.text()
    
    return {
      content,
      status: response.status,
      etag: response.headers.get('etag') || undefined,
      lastModified: response.headers.get('last-modified') || undefined,
    }
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error)
    return {
      content: '',
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function fetchWithCache(
  url: string,
  etag?: string,
  lastModified?: string,
  options: FetchOptions = {}
): Promise<FetchResult> {
  const headers: Record<string, string> = { ...options.headers }

  if (etag) {
    headers['If-None-Match'] = etag
  }
  if (lastModified) {
    headers['If-Modified-Since'] = lastModified
  }

  const result = await fetchWithPoliteness(url, { ...options, headers })

  // Handle 304 Not Modified
  if (result.status === 304) {
    return {
      content: '',
      status: 304,
      etag: result.etag,
      lastModified: result.lastModified,
    }
  }

  return result
}

async function checkRobots(url: string, userAgent: string): Promise<boolean> {
  try {
    const urlObj = new URL(url)
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`

    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      // If robots.txt doesn't exist, assume allowed
      return true
    }

    const robotsText = await response.text()
    const robots = robotsParser(robotsUrl, robotsText)

    return robots.isAllowed(url, userAgent) ?? true
  } catch (error) {
    console.warn(`Failed to check robots.txt for ${url}:`, error)
    // If we can't check robots.txt, be conservative and allow
    return true
  }
}

async function enforceRateLimit(domain: string): Promise<void> {
  const lastRequest = rateLimiter.lastRequest.get(domain)
  const now = Date.now()

  if (lastRequest) {
    const timeSinceLastRequest = now - lastRequest
    if (timeSinceLastRequest < rateLimiter.delay) {
      const waitTime = rateLimiter.delay - timeSinceLastRequest
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  rateLimiter.lastRequest.set(domain, Date.now())
}

export function setRateLimit(delayMs: number): void {
  rateLimiter.delay = delayMs
}

export function clearRateLimit(): void {
  rateLimiter.lastRequest.clear()
}
