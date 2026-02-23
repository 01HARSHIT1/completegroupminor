# Vercel Deployment — Frontend Fix

## The Error You Saw

```
Running "install" command: `cd frontend && npm install`...
sh: line 1: cd: frontend: No such file or directory
```

**Cause:** Vercel was told to use `Root Directory` = `frontend`, so the build already runs inside `frontend`. The install command then tried `cd frontend` again, which fails because `frontend/frontend` does not exist.

---

## Correct Configuration

### 1. Vercel Dashboard Settings

1. Go to **Vercel Dashboard** → your project → **Settings** → **General**
2. Set **Root Directory** to `frontend`
3. Save

### 2. vercel.json (already updated)

The repo’s `vercel.json` uses commands that match a `frontend` root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

With Root Directory = `frontend`, Vercel runs these commands inside `frontend/`, so no `cd frontend` is needed.

### 3. Overrides in Vercel (optional)

If you have custom values in the Dashboard:

- **Install Command:** `npm install` (or leave default)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

---

## Summary

| Setting         | Value   |
|----------------|---------|
| Root Directory | `frontend` |
| Install Command| `npm install` |
| Build Command  | `npm run build` |
| Output Directory | `dist` |

---

## Redeploy

1. Push the updated `vercel.json` to GitHub
2. In Vercel: **Deployments** → **Redeploy** latest, or let a new push trigger a deploy
