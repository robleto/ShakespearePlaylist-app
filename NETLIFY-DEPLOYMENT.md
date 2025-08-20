# Deployment Guide: GitHub + Netlify + Supabase

This guide walks you through deploying the Game Awards API using your preferred stack.

## 🗂 Prerequisites

1. **GitHub Account** - for code repository
2. **Netlify Account** - for hosting and functions
3. **Supabase Account** - for database and API key management

## 📋 Step-by-Step Deployment

### 1. Set Up GitHub Repository

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Game Awards API"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/game-awards-api.git
git branch -M main
git push -u origin main
```

### 2. Set Up Supabase Project

1. **Create New Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and set project name: `game-awards-api`
   - Set database password and region

2. **Set Up Database Schema**
   - Go to SQL Editor in your Supabase dashboard
   - Run the contents of `supabase/schema.sql`
   - Optionally run `supabase/seed.sql` for test data

3. **Get API Keys**
   - Go to Settings → API
   - Copy your `Project URL` and `anon/public key`
   - Copy your `service_role/secret key` (for admin functions)

### 3. Deploy to Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect to GitHub and select your repository
   - Branch: `main`
   - Build command: `npm run build`
   - Publish directory: `public`

2. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following variables:

   ```
   NODE_ENV=production
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   REQUIRE_API_KEY=true
   ```

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Functions directory: `netlify/functions`
   - Publish directory: `public`

4. **Deploy**
   - Netlify will automatically deploy when you push to main
   - Your site will be available at `https://your-site-name.netlify.app`

### 4. Set Up Custom Domain (Optional)

1. **Purchase Domain** (e.g., `gameawardsapi.com`)
2. **Add Domain in Netlify**
   - Go to Domain settings
   - Add custom domain
   - Configure DNS records as instructed
3. **Enable HTTPS** (automatic with Netlify)

## 🔧 Configuration Files Explained

### `netlify.toml`
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "public"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

### Environment Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public API key for client-side access
- `SUPABASE_SERVICE_ROLE_KEY` - Secret key for admin operations
- `NODE_ENV` - Set to "production" for live site
- `REQUIRE_API_KEY` - Set to "true" to enforce API key usage

## 🧪 Testing Your Deployment

### 1. Test API Endpoints
```bash
# Health check
curl https://your-site.netlify.app/health

# Search for awards
curl "https://your-site.netlify.app/api/?s=Spiel%20des%20Jahres&year=2023"

# Get award by BGG ID
curl "https://your-site.netlify.app/api/?bgg_id=13"
```

### 2. Test API Key Generation
1. Go to `https://your-site.netlify.app/apikey`
2. Fill out the form
3. Verify you receive a valid API key
4. Test the API key with a request

### 3. Verify Database Integration
1. Check Supabase dashboard for new users and API keys
2. Monitor API usage in the `api_usage` table
3. Test rate limiting with multiple requests

## 📊 Monitoring and Analytics

### Netlify Analytics
- Go to your site dashboard → Analytics
- Monitor traffic, function invocations, and errors

### Supabase Monitoring
- Database → Logs for SQL queries
- API → Logs for function calls
- Auth → Users for API key registrations

### Custom Analytics (Optional)
```javascript
// Add to your functions for custom tracking
await supabase
  .from('api_usage')
  .insert({
    api_key: apiKey,
    endpoint: event.path,
    parameters: event.queryStringParameters,
    timestamp: new Date().toISOString()
  });
```

## 🚀 Performance Optimization

### 1. Enable Caching
Add cache headers to your functions:
```javascript
const headers = {
  'Cache-Control': 'public, max-age=300', // 5 minutes
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};
```

### 2. Optimize Function Cold Starts
- Keep functions small and focused
- Use environment variables for configuration
- Consider connection pooling for database

### 3. CDN Integration
Netlify automatically provides CDN caching. For additional performance:
- Use Netlify's Edge Functions for even faster response times
- Consider Cloudflare for additional caching layers

## 💰 Cost Management

### Free Tier Limits
- **Netlify Free**: 100GB bandwidth, 300 build minutes/month
- **Supabase Free**: 500MB database, 2GB bandwidth/month
- **GitHub Free**: Unlimited public repos

### Scaling Costs
- **Netlify Pro**: $19/month for increased limits
- **Supabase Pro**: $25/month for more database and bandwidth
- Monitor usage and upgrade as needed

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit API keys to Git
- Use different keys for development and production
- Rotate keys regularly

### 2. API Security
- Enable rate limiting in production
- Validate all input parameters
- Use HTTPS for all communication

### 3. Database Security
- Enable Row Level Security (RLS) in Supabase
- Use service role key only for admin functions
- Monitor database access logs

## 🐛 Troubleshooting

### Common Issues

1. **Functions Not Working**
   - Check function logs in Netlify dashboard
   - Verify environment variables are set
   - Test functions locally with `netlify dev`

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check database schema is properly created
   - Test connection in Supabase SQL editor

3. **CORS Errors**
   - Ensure proper headers in function responses
   - Check redirect configuration in `netlify.toml`

### Local Development
```bash
# Install dependencies
npm install

# Start local development server
netlify dev

# Test functions locally
curl http://localhost:8888/api/?s=test
```

## 📈 Next Steps

### Immediate
1. ✅ Deploy to production
2. [ ] Set up monitoring alerts
3. [ ] Create backup strategy
4. [ ] Document API for users

### Short-term
1. [ ] Add user dashboard for API key management
2. [ ] Implement usage analytics
3. [ ] Set up automated testing
4. [ ] Create developer SDKs

### Long-term
1. [ ] Scale database for growth
2. [ ] Add premium features
3. [ ] Implement ML insights
4. [ ] Expand to international awards

---

🎉 **Your Game Awards API is now live!** Share it with the board gaming community and start building your API business.
