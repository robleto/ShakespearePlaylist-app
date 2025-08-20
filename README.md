# Game Awards API

A RESTful API for board game awards data, similar to OMDB API but focused on board games. Access comprehensive award info## 🚀 Deployment

### Netlify + Supabase (Recommended)

This project is configured for deployment on Netlify with Supabase as the database:

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy Game Awards API"
git push origin main

# 2. Connect to Netlify
# - Import from GitHub
# - Set build command: npm run build
# - Set environment variables (see NETLIFY-DEPLOYMENT.md)

# 3. Set up Supabase
# - Create new project
# - Run SQL schema from supabase/schema.sql
# - Add environment variables to Netlify
```

See [NETLIFY-DEPLOYMENT.md](NETLIFY-DEPLOYMENT.md) for detailed instructions.

### Local Development

```bash
npm install
npm run dev  # Runs with nodemon for auto-restart

# Or test Netlify functions locally
netlify dev
```r gaming awards like Spiel des Jahres, Origins Awards, Diana Jones Award, and many more.

## 🚀 Quick Start

### Installation

```bash
npm install
npm start
```

The API will be available at `http://localhost:3000`

### Development

```bash
npm run dev  # Runs with nodemon for auto-restart
```

## 📋 API Endpoints

### Base URL
```
http://localhost:3000/api/
```

### Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `i` | Optional* | Award ID | `10865` |
| `t` | Optional* | Award title search | `Spiel des Jahres Winner` |
| `s` | Optional* | Search across all fields | `Catan` |
| `bgg_id` | Optional* | BoardGameGeek game ID | `13` |
| `year` | No | Filter by year | `2023` |
| `category` | No | Filter by category | `Game of the Year` |
| `award_set` | No | Filter by award set | `Spiel des Jahres` |
| `type` | No | Filter by type | `winner` or `nominee` |
| `r` | No | Response format | `json` (xml coming soon) |

*At least one of `i`, `t`, `s`, or `bgg_id` is required.

### Example Requests

#### Get award by ID
```
GET /api/?i=10865
```

#### Search for awards
```
GET /api/?s=Spiel des Jahres&year=2023
```

#### Get all awards for a specific game
```
GET /api/?bgg_id=361
```

#### Get awards by year
```
GET /api/years/2023
```

#### List all award sets
```
GET /api/awards
```

#### List all categories
```
GET /api/categories
```

## 📊 Data Structure

Each award object contains:

```json
{
  "Response": "True",
  "id": "10865",
  "slug": "1974-charles-s-roberts-best-amateur-game-winner",
  "url": "/boardgamehonor/10865/1974-charles-s-roberts-best-amateur-game-winner",
  "year": 1974,
  "title": "Charles S Roberts Best Amateur Game Winner",
  "primaryName": "",
  "alternateNames": [],
  "boardgames": [
    {
      "bggId": 18158,
      "name": "Manassas"
    }
  ],
  "awardSet": "1974 Charles S. Roberts",
  "position": "Charles S. Roberts Best Amateur Game",
  "isWinner": true,
  "isNominee": false
}
```

## 🎮 Use Cases

### For Publishers
- Track award performance across your game catalog
- Competitive analysis of award-winning games
- Marketing material for award achievements

### For Developers
- Integrate award data into gaming apps
- Build recommendation engines based on award-winning games
- Create award tracking features

### For Researchers
- Academic studies on game design trends
- Historical analysis of gaming industry recognition
- Award system comparisons across regions

### For Media
- Easy access for articles and reviews
- Award season coverage automation
- Historical context for feature pieces

## 🏗️ Architecture

- **Node.js + Express** - Fast, lightweight API server
- **In-memory data** - Lightning-fast responses (< 100ms)
- **Rate limiting** - Built-in protection against abuse
- **CORS enabled** - Ready for browser integration
- **Helmet security** - Production-ready security headers

## 🔐 Security & Rate Limiting

- Rate limiting: 100 requests per 15 minutes (configurable)
- CORS enabled for cross-origin requests
- Helmet.js for security headers
- API key validation in production

## 📈 Deployment

### Environment Variables

```bash
NODE_ENV=production
PORT=3000
DEFAULT_API_KEY=your-production-key
REQUIRE_API_KEY=true
```

### Docker (Coming Soon)

```bash
docker build -t game-awards-api .
docker run -p 3000:3000 game-awards-api
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Adding New Awards

1. Update the `enhanced-honors-complete.json` file
2. Ensure data follows the existing schema
3. Test locally before submitting PR

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Board game award data sourced from BoardGameGeek community
- Inspired by the excellent OMDB API structure
- Built for the board gaming community

## 📞 Support

- 📧 Email: support@gameawardsapi.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discord: [Board Game Developers](https://discord.gg/boardgamedev)

---

**🎲 Game Awards API** - Bringing board game award data to developers worldwide.
