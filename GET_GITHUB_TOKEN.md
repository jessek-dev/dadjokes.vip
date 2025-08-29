# 🔑 GitHub Authentication Fix

## The Issue
GitHub disabled password authentication for Git operations. You need a Personal Access Token.

## Quick Fix - Get Your Token:

1. **Go to:** https://github.com/settings/tokens
2. **Click:** "Generate new token" → "Generate new token (classic)"
3. **Settings:**
   - Name: `Dad Jokes Deploy`
   - Expiration: `30 days` (or longer)
   - **Check:** `repo` (full repository access)
4. **Click:** "Generate token"
5. **Copy the token** (it looks like `ghp_xxxxxxxxxxxx`)

## Then Push:
```bash
git push origin main
```
- Username: `jessek-dev`  
- Password: **[paste your token here]**

## Even Easier - GitHub CLI:
If you have GitHub CLI:
```bash
gh auth login
# Follow prompts, then:
git push origin main
```

## Or Manual Upload:
1. Go to: https://github.com/jessek-dev/dadjokes.vip
2. Upload files via GitHub website interface

---

**Once you push, universal links go live in 1-2 minutes! 🚀**