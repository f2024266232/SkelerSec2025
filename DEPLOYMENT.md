# SkelerSecurity CTF Platform - Vercel Deployment Guide

## Important Note About SQLite and Vercel

⚠️ **SQLite Limitation**: Vercel uses serverless functions that don't support persistent file storage. Your current SQLite database won't work on Vercel. You need to migrate to a cloud database.

## Option 1: Quick Deploy with Neon PostgreSQL (Recommended)

### Step 1: Create a Neon Database
1. Go to [Neon.tech](https://neon.tech) and create a free account
2. Create a new database
3. Copy the connection string (it looks like: `postgresql://username:password@host/database`)

### Step 2: Switch to PostgreSQL Database
1. Update `server/db.ts` to use Neon instead of SQLite:

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

2. Update `shared/schema.ts` to use PostgreSQL types:

```typescript
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
// ... rest of your schema with PostgreSQL types
```

### Step 3: Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Vercel deployment config"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your repository
   - Add environment variable: `DATABASE_URL` = your Neon connection string

3. **Deploy**: Vercel will automatically build and deploy your app

## Option 2: Keep SQLite for Local Development Only

If you want to keep SQLite for local development but use a cloud database for production:

### Environment-Based Database Switching

Update `server/db.ts`:

```typescript
import Database from 'better-sqlite3';
import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from '@shared/schema';

if (process.env.NODE_ENV === 'production') {
  // Use Neon PostgreSQL in production
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  export const db = drizzleNeon({ client: pool, schema });
} else {
  // Use SQLite in development
  const sqlite = new Database('ctf-platform.db');
  sqlite.pragma('journal_mode = WAL');
  export const db = drizzleSQLite(sqlite, { schema });
}
```

## Current Admin Credentials

- **Username**: admin
- **Password**: SkelerSec2025!

## Environment Variables for Vercel

Set these in your Vercel dashboard:

```
DATABASE_URL=postgresql://your-neon-connection-string
NODE_ENV=production
SESSION_SECRET=your-random-secret-key
```

## Deployment Checklist

- [ ] Database migrated to Neon PostgreSQL
- [ ] Repository pushed to GitHub
- [ ] Vercel project created and connected
- [ ] Environment variables set in Vercel
- [ ] Initial deployment successful
- [ ] Admin login tested on live site
- [ ] CTF challenges working

## File Structure for Vercel

Your project already includes:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to ignore during deployment
- ✅ Build scripts configured
- ✅ API routes properly structured

## Alternative Cloud Databases

If you prefer other providers:

1. **Supabase** (PostgreSQL): Free tier available
2. **Railway** (PostgreSQL): Easy GitHub integration  
3. **Turso** (SQLite): Edge SQLite database (compatible with your current setup)

## Need Help?

If you run into issues:
1. Check Vercel function logs
2. Verify environment variables are set
3. Test database connection locally first
4. Ensure all dependencies are in `package.json`

Your SkelerSecurity CTF platform is ready for deployment! 🚀