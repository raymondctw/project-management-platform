# GitHub Authentication Instructions

GitHub no longer supports password authentication for Git operations. You'll need to use a personal access token (PAT) instead. Here's how to set it up:

## 1. Generate a Personal Access Token on GitHub

1. Go to GitHub.com and sign in to your account
2. Click on your profile picture in the top-right corner and select "Settings"
3. Scroll down and click on "Developer settings" in the left sidebar
4. Click on "Personal access tokens" → "Tokens (classic)"
5. Click "Generate new token" → "Generate new token (classic)"
6. Give your token a descriptive name (e.g., "Project Management Platform")
7. Select the scopes/permissions you need (at minimum, select "repo" for full repository access)
8. Click "Generate token"
9. **IMPORTANT**: Copy the token immediately! GitHub will only show it once.

## 2. Use the token for Git operations

### Option 1: Use the token in place of your password

When you push to GitHub and it asks for your password, use the personal access token instead.

### Option 2: Update the remote URL to include the token

```bash
git remote set-url origin https://USERNAME:TOKEN@github.com/raymondctw/project-management-platform.git
```

Replace `USERNAME` with your GitHub username and `TOKEN` with your personal access token.

### Option 3: Configure Git to store your credentials

```bash
git config --global credential.helper store
```

Then try pushing again. Enter your username and the token when prompted, and Git will store them for future use.

### Option 4: Use SSH authentication instead

If you prefer using SSH keys instead of HTTPS with tokens:

1. Generate an SSH key if you don't have one already:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add the SSH key to your GitHub account:
   - Copy the public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub Settings → SSH and GPG keys → New SSH key
   - Paste your key and save

3. Change your remote URL to use SSH:
   ```bash
   git remote set-url origin git@github.com:raymondctw/project-management-platform.git
   ```

4. Try pushing again:
   ```bash
   git push -u origin main
   ```
