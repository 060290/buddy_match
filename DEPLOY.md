# How to Push BuddyMatch to Production

**You are not a developer. That’s fine.** Follow these steps in order. Do not skip steps.

---

## Part 1: Put your code on GitHub

### Step 1.1 – Install Git (if needed)

1. Open **Terminal** on your Mac (press Cmd + Space, type “Terminal”, press Enter).
2. Type: `git --version` and press Enter.
3. If it says something like `git version 2.x.x`, you’re good. If it says “command not found”, install Git from: https://git-scm.com/download/mac

---

### Step 1.2 – Create a GitHub account and repo

1. Go to **https://github.com** in your browser.
2. If you don’t have an account, click **Sign up** and create one.
3. Click the **+** icon (top right) → **New repository**.
4. Repository name: type **buddy-match**.
5. Leave everything else as-is (Public, no README).
6. Click **Create repository**.

---

### Step 1.3 – Push your code from your Mac

1. Open **Terminal**.
2. Copy and paste this command, then press Enter (this goes to your project folder):

   ```
   cd /Users/ellie/Desktop/buddy_match
   ```

3. Copy and paste this, then press Enter (initializes Git):

   ```
   git init
   ```

4. Copy and paste this, then press Enter (adds your files):

   ```
   git add .
   ```

5. Copy and paste this, then press Enter (creates the first commit):

   ```
   git commit -m "Initial commit"
   ```

6. Copy and paste this, then press Enter (names the branch):

   ```
   git branch -M main
   ```

7. Replace **YOUR_GITHUB_USERNAME** with your real GitHub username (e.g. `ellie123`), then run:

   ```
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/buddy-match.git
   ```

8. Push the code to GitHub:

   ```
   git push -u origin main
   ```

9. When it asks for credentials:
   - Username: your GitHub username  
   - Password: use a **Personal Access Token** (not your normal password).  
     - Go to https://github.com/settings/tokens  
     - Click **Generate new token (classic)**  
     - Check the **repo** scope  
     - Generate and copy the token  
     - Use that token as the password when prompted  

10. If it finishes with no errors, your code is on GitHub. You can verify by opening `https://github.com/YOUR_GITHUB_USERNAME/buddy-match` in your browser.

---

## Part 2: Deploy on Railway

### Step 2.1 – Sign up for Railway

1. Go to **https://railway.app** in your browser.
2. Click **Login** → **Login with GitHub**.
3. Authorize Railway to access your GitHub account.

---

### Step 2.2 – Create a new project from GitHub

1. On Railway, click **New Project**.
2. Click **Deploy from GitHub repo**.
3. If it asks, click **Configure GitHub App** and allow Railway to access your repos.
4. Select the **buddy-match** repository.
5. Click **Deploy now** (or **Add repo**).

Railway will start building and deploying. This may take 2–5 minutes.

---

### Step 2.3 – Add your secret key

1. In your Railway project, click your service (e.g. “buddy-match”).
2. Open the **Variables** tab.
3. Click **+ New Variable** or **Add Variable**.
4. Add these two variables:

   | Variable name   | What to put                                                                 |
   |-----------------|------------------------------------------------------------------------------|
   | `JWT_SECRET`    | A long random string. Easiest way: run `openssl rand -hex 32` in Terminal and paste the result. |
   | `NODE_ENV`      | `production`                                                                 |

5. Save. Railway may redeploy automatically.

---

### Step 2.4 – Get your live URL

1. Still in your service, open the **Settings** tab.
2. Find the **Networking** or **Domains** section.
3. Click **Generate Domain** (or **Add Domain**).
4. Copy the URL it gives you (e.g. `https://buddy-match-production-xxxx.up.railway.app`).

That URL is your live app. Open it in your browser to confirm it loads.

---

## Part 3: Demo login

After the first deploy, you can log in with the demo account:

- **Email:** demo@buddymatch.example  
- **Password:** demo1234  

---

## That’s it

- Your app is live at the Railway URL.
- You can connect your GoDaddy domain later; the instructions above do not require it.
- If you change the code and want to update production: commit and push to GitHub. Railway will redeploy automatically.

---

## Troubleshooting

**Build failed**

- Check the Railway **Deployments** tab and click the failed build for error details.
- Make sure you pushed the latest code, including the `railway.toml` file.

**App loads but shows an error**

- Verify you set `JWT_SECRET` and `NODE_ENV` in Variables.
- Check the **Logs** tab in Railway for backend errors.

**“Repository not found” when pushing**

- Confirm the remote URL: `git remote -v`
- Make sure the repo exists on GitHub and your account has access.
