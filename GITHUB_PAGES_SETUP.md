# GitHub Pages Setup Instructions 📄

## Current Status ⚠️

The GitHub Pages deployment workflow has been **temporarily disabled** to focus on Windows builds first. This prevents the deployment errors you were seeing.

## To Enable GitHub Pages Later 🚀

### Step 1: Enable GitHub Pages in Repository Settings
1. Go to your repository: `https://github.com/WebChatAppAi/MuseCraft-Studio`
2. Click **Settings** tab
3. Scroll down to **Pages** section in left sidebar
4. Under **Source**, select **"GitHub Actions"**
5. Save the configuration

### Step 2: Re-enable the Workflow

Edit `.github/workflows/deploy-pages.yml` and restore the original triggers:

```yaml
name: Deploy MuseCraft Studio GitHub Pages v1

on:
  push:
    branches: [ "main", "master" ]
    paths:
      - 'docs/**'
      - 'preview/**' 
      - 'src/resources/**'
      - '.github/workflows/deploy-pages.yml'
  pull_request:
    branches: [ "main", "master" ]
    paths:
      - 'docs/**'
      - 'preview/**'
      - 'src/resources/**'
  workflow_dispatch:

# Remove the condition from the job:
jobs:
  deploy:
    name: Deploy to GitHub Pages
    # Remove this line: if: github.event.inputs.force_enable == 'true'
    environment:
      name: github-pages-production
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
```

### Step 3: Verify Required Files Exist

Make sure these files exist in your repository:
- ✅ `docs/index.html` - Main HTML file for the GitHub Pages site
- ✅ `preview/*.png` - Screenshot images for the demo site
- ✅ `src/resources/icon.png` - App icon

### Step 4: Test the Deployment

1. Push changes to the `main` branch
2. Go to **Actions** tab to watch the deployment
3. Once successful, visit: `https://webchatappai.github.io/MuseCraft-Studio/`

## Current Workflow Status 📊

### ✅ Active Workflows:
- **Build and Release MuseCraft Studio (Windows)** - For building Windows executables
- **Deploy MuseCraft Studio GitHub Pages** - Disabled (manual trigger only)

### 🎯 Focus Areas:
1. **Primary**: Windows executable builds working properly
2. **Secondary**: GitHub Pages demo site (when Windows builds are stable)

## Manual Testing (If Needed) 🧪

To test Pages deployment manually without enabling auto-triggers:

1. Go to **Actions** tab in your repository
2. Select **"Deploy MuseCraft Studio GitHub Pages v1 (DISABLED)"**
3. Click **"Run workflow"**
4. Set `force_enable` to **true**
5. Click **"Run workflow"**

This allows testing without enabling automatic deployments.

---

🎵 **Focus on Windows builds first, then we'll make a beautiful demo site!** 🎹✨