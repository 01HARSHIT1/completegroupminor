# Push Code to GitHub - Instructions

## Quick Method (Recommended)

### Option 1: PowerShell Script
```powershell
.\PUSH_TO_GITHUB.ps1
```

### Option 2: Batch Script
```cmd
PUSH_TO_GITHUB.bat
```

---

## Manual Method

If the scripts don't work, follow these steps manually:

### Step 1: Navigate to Project Directory
```bash
cd C:\CodeData\GroupminorProject
```

### Step 2: Initialize Git (if not already done)
```bash
git init
```

### Step 3: Set Remote Repository
```bash
git remote add origin https://github.com/01HARSHIT1/Groupminor.git
```

If remote already exists:
```bash
git remote set-url origin https://github.com/01HARSHIT1/Groupminor.git
```

### Step 4: Add All Project Files
```bash
git add README.md
git add .gitignore
git add documentation/
git add hardware/
git add backend/
git add ml-models/
git add dashboard/
git add datasets/
git add *.md
git add START_PROJECT.*
```

### Step 5: Commit Changes
```bash
git commit -m "Initial commit: Smart Irrigation Digital Twin System with ML Predictive Maintenance"
```

### Step 6: Push to GitHub
```bash
git push -u origin master
```

**Note:** You may be prompted for GitHub username and password/token.

---

## GitHub Authentication

### Using Personal Access Token (Recommended)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. Use token as password when prompted

### Using GitHub CLI
```bash
gh auth login
git push -u origin master
```

---

## Troubleshooting

### Error: Permission Denied
- Check if you have write access to the repository
- Verify GitHub credentials
- Use Personal Access Token instead of password

### Error: Remote Already Exists
```bash
git remote remove origin
git remote add origin https://github.com/01HARSHIT1/Groupminor.git
```

### Error: Nothing to Commit
- Check if files are already committed
- Verify files are in the correct directory
- Check `.gitignore` isn't excluding your files

### Error: Failed to Push
- Check internet connection
- Verify repository URL is correct
- Try: `git push -u origin master --force` (use with caution)

---

## Verify Push

After pushing, check your repository:
https://github.com/01HARSHIT1/Groupminor

You should see all project files uploaded.

---

## Next Steps After Push

1. **Create README.md** (if not already created)
2. **Add .gitignore** to exclude sensitive files
3. **Create branches** for different features
4. **Set up GitHub Actions** for CI/CD (optional)

---

## Files Being Pushed

- ✅ Documentation (IEEE format, reports, PPT structure)
- ✅ Hardware (ESP32 firmware)
- ✅ Backend Server (Node.js)
- ✅ ML Models (Python training & prediction)
- ✅ Dashboard (Next.js)
- ✅ Setup guides and implementation steps
- ✅ Configuration files

---

**Need Help?** Check GitHub documentation or contact repository owner.
