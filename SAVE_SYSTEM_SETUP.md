# Save System Setup Instructions

The game now includes a save system with 6-digit codes that work across all devices!

## How It Works

- Players get a **6-digit code** when they save
- Codes work on **any device** (phone, computer, etc.)
- Saves expire after **30 days**
- Local autosave is also available as backup

## Setting Up Vercel KV (Required for Cross-Device Saves)

### Step 1: Create a Vercel KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **Storage** in the sidebar
3. Click **Create Database**
4. Select **KV** (Key-Value Store)
5. Name it something like `farm-saves`
6. Select your preferred region
7. Click **Create**

### Step 2: Get Your Credentials

After creating the database:
1. You'll see **Environment Variables** section
2. Copy the values for:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### Step 3: Add to Your Project

**For Local Development:**
1. Copy `.env.local.template` to `.env.local`:
   ```bash
   copy .env.local.template .env.local
   ```
2. Edit `.env.local` and paste your credentials:
   ```
   KV_REST_API_URL="your_actual_url_here"
   KV_REST_API_TOKEN="your_actual_token_here"
   ```

**For Vercel Deployment:**
The variables are automatically added when you create the KV database!
1. Go to your project settings on Vercel
2. Navigate to **Environment Variables**
3. Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are there
4. If not, add them manually

### Step 4: Deploy!

```bash
git add .
git commit -m "Add save system with 6-digit codes"
git push
vercel --prod
```

## Features

### Welcome Splash Screen
- Shows on first visit
- Options: Continue (from autosave), Start New, or Load with Code

### Save Button
- Click the 💾 button in the top bar
- Get a 6-digit code to share/remember
- Codes work on any device!

### Auto-Save
- Game auto-saves to browser localStorage
- Acts as backup if you lose your code
- Only works on the same browser/device

## Testing Locally

1. Start your dev server: `npm run dev`
2. Visit http://localhost:3000
3. You'll see the welcome splash
4. Play and click the 💾 save button
5. You'll get a 6-digit code
6. Try loading it from a different browser!

## Troubleshooting

**Error: "Failed to save game"**
- Check that your `.env.local` file has the correct KV credentials
- Make sure Vercel KV database is created and active

**Code not working**
- Codes expire after 30 days
- Make sure you're entering all 6 digits correctly
- Check that the KV database is connected

**Welcome screen not showing**
- Clear your browser localStorage
- Or open in incognito/private mode
