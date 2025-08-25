export const SAMPLE_JSONLD = `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Hamlet",
  "startDate": "2024-03-15T19:30:00",
  "endDate": "2024-03-15T22:00:00",
  "location": {
    "@type": "Place",
    "name": "Main Theater",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Theater St",
      "addressLocality": "Stratford",
      "addressRegion": "ON"
    }
  },
  "offers": {
    "@type": "Offer",
    "lowPrice": 25,
    "highPrice": 75,
    "priceCurrency": "USD"
  }
}
</script>
`

export const SAMPLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:12345@example.com
DTSTART:20240315T193000Z
DTEND:20240315T220000Z
SUMMARY:Romeo and Juliet
DESCRIPTION:Shakespeare's timeless tragedy
LOCATION:Main Theater
URL:https://example.com/tickets
END:VEVENT
END:VCALENDAR`

export const SAMPLE_HTML = `
<html>
<head><title>Upcoming Shows</title></head>
<body>
<div class="event-card">
  <h3>Shakespeare's Hamlet</h3>
  <div class="date">March 15-20, 2024</div>
  <div class="venue">Main Theater</div>
  <a href="/tickets/hamlet" class="ticket-link">Buy Tickets</a>
</div>
</body>
</html>
`
