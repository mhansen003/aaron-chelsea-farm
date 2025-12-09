# Neon Database Setup for Save System

## ✅ You've already created the database - great!

Now you just need to:
1. Initialize the database table
2. Connect it to your project

---

## Step 1: Get Your Database URL

1. Go to your Neon Console: https://console.neon.tech
2. Select your `farm-saves` database
3. Click **Connection Details**
4. Copy the **Connection String** (it looks like):
   ```
   postgresql://username:password@ep-xxx.region.neon.tech/farm-saves?sslmode=require
   ```

---

## Step 2: Initialize the Database

Run the SQL script to create the table:

1. In Neon Console, go to **SQL Editor**
2. Copy and paste this SQL:

```sql
-- Create the saves table
CREATE TABLE IF NOT EXISTS game_saves (
  code VARCHAR(6) PRIMARY KEY,
  game_state JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expires_at ON game_saves(expires_at);
```

3. Click **Run** or press Ctrl+Enter
4. Should see: "Success! CREATE TABLE"

---

## Step 3: Add to Local Environment

1. Create `.env.local` file in your project root:
   ```bash
   copy .env.local.template .env.local
   ```

2. Edit `.env.local` and paste your connection string:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx.region.neon.tech/farm-saves?sslmode=require"
   ```

---

## Step 4: Add to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string
   - **Environments**: Production, Preview, Development (select all)
4. Click **Save**

---

## Step 5: Deploy!

```bash
git add .
git commit -m "Convert save system to use Neon database"
git push
vercel --prod
```

---

## Testing

After deployment:

1. Visit your site
2. Play a bit and click the 💾 **Save** button
3. You'll get a 6-digit code
4. Open in different browser/device
5. Enter the code - your game loads!

---

## Checking Your Database

To see saved games in Neon:

1. Go to SQL Editor in Neon Console
2. Run:
   ```sql
   SELECT code, created_at, expires_at FROM game_saves ORDER BY created_at DESC;
   ```
3. See all the save codes!

---

## Cleaning Up Old Saves

Expired saves (>30 days) are automatically filtered out when loading.

To manually delete them:
```sql
DELETE FROM game_saves WHERE expires_at < NOW();
```

---

## Troubleshooting

**Error: "relation game_saves does not exist"**
- Run the CREATE TABLE SQL in Step 2

**Error: "Failed to save game"**
- Check DATABASE_URL is correct in `.env.local` and Vercel
- Make sure connection string includes `?sslmode=require`

**Codes not working cross-device**
- Verify DATABASE_URL is set in Vercel environment variables
- Check Neon database is active (not paused)

---

**You're all set!** 🎉

The save system now uses your Neon database and codes work across all devices!
