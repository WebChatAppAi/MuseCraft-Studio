# 🏗️ Build Instructions for MuseCraft Studio

This document explains how to build MuseCraft Studio executables for different platforms.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** (20+ recommended)
- **pnpm** (version 10+)
- **Git**

### Platform-Specific Requirements

#### Windows (for .exe builds)
- **Visual Studio Build Tools** or **Visual Studio Community**
- **Windows SDK** (latest version)
- **Python 3** (for native modules)

#### macOS (for .dmg/.app builds)
- **Xcode Command Line Tools**: `xcode-select --install`
- **Apple Developer Account** (for code signing)

## 🚀 Local Development Build

### 1. Clone and Setup
```bash
git clone https://github.com/WebChatAppAi/MuseCraft-Studio.git
cd MuseCraft-Studio

# Install dependencies
pnpm install
```

### 2. Build Application
```bash
# Build the application (compile TypeScript/React)
pnpm compile:app

# Or run the full prebuild process
pnpm prebuild
```

### 3. Create Executables

#### Windows
```bash
# Standard Windows installer
pnpm build:win

# Portable Windows executable
pnpm build:win-portable
```

#### macOS
```bash
# macOS Intel (x64)
pnpm build:mac

# macOS Apple Silicon (ARM64)
pnpm build:mac-arm64
```

#### All Platforms
```bash
# Build for all supported platforms (requires all platform prerequisites)
pnpm build:all
```

## 🤖 GitHub Actions (Automated)

### Automatic Builds
The repository includes GitHub Actions workflows for automated building:

#### Triggers
- **Tag Push**: `git tag v1.0.0 && git push origin v1.0.0`
- **Manual**: GitHub Actions → "Build and Release" → "Run workflow"
- **Push to main/master**: Builds but doesn't create release

#### Available Builds
- ✅ **Windows Installer** (.exe with NSIS)
- ✅ **Windows Portable** (.exe standalone)
- ✅ **macOS Intel** (.dmg for Intel Macs)
- ✅ **macOS ARM64** (.dmg for Apple Silicon)

### Creating a Release

#### Method 1: Git Tag (Recommended)
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically build and create a release
```

#### Method 2: Manual Workflow
1. Go to **Actions** tab on GitHub
2. Select **"Build and Release MuseCraft Studio v1"**
3. Click **"Run workflow"**
4. Enter version number (e.g., `1.0.0`)
5. Choose whether to create a release
6. Click **"Run workflow"**

## 🔧 Build Configuration

### Electron Builder Configuration
The build configuration is in `electron-builder.ts`:

#### Key Settings
- **App ID**: `com.alvan.musecraft-app`
- **Product Name**: MuseCraft
- **Compression**: Maximum
- **Auto-updater**: GitHub releases

#### Supported Formats
- **Windows**: NSIS installer, Portable executable, ZIP archive
- **macOS**: DMG disk image, ZIP archive
- **Linux**: AppImage, DEB, RPM packages

### Code Signing (Optional)

#### Windows Code Signing
Set environment variables:
```bash
export WIN_CSC_LINK="path/to/certificate.p12"
export WIN_CSC_KEY_PASSWORD="certificate_password"
```

#### macOS Code Signing & Notarization
Set environment variables:
```bash
export APPLE_ID="your-apple-id@email.com"
export APPLE_ID_PASS="app-specific-password"
export APPLE_TEAM_ID="your-team-id"
export APPLE_IDENTITY="Developer ID Application: Your Name"
```

## 📂 Build Output

### Directory Structure
```
dist/
├── v1.0.0/                    # Version directory
│   ├── MuseCraft-v1.0.0-win.exe       # Windows installer
│   ├── MuseCraft-v1.0.0-win-portable.exe  # Windows portable
│   ├── MuseCraft-v1.0.0-mac.dmg       # macOS Intel
│   ├── MuseCraft-v1.0.0-mac-arm64.dmg # macOS ARM64
│   └── latest.yml              # Auto-updater metadata
```

### File Naming Convention
- **Pattern**: `MuseCraft-v{version}-{platform}.{ext}`
- **Examples**:
  - `MuseCraft-v1.0.0-win.exe`
  - `MuseCraft-v1.0.0-mac.dmg`
  - `MuseCraft-v1.0.0-mac-arm64.dmg`

## 🧪 Testing Builds

### Local Testing
```bash
# Start development version
pnpm dev

# Test production build locally
pnpm start
```

### Pre-release Testing
1. Create a pre-release tag: `v1.0.0-beta.1`
2. GitHub Actions will build and create a pre-release
3. Download and test executables
4. Create final release when ready

## 🐛 Troubleshooting

### Common Build Issues

#### "electron-builder not found"
```bash
# Reinstall dependencies
pnpm clean:dev
pnpm install
```

#### "Native modules compilation failed"
```bash
# Rebuild native modules
pnpm electron-rebuild
```

#### "Code signing failed"
```bash
# Skip code signing for testing
unset WIN_CSC_LINK
unset WIN_CSC_KEY_PASSWORD
```

#### "DMG creation failed on macOS"
```bash
# Install required tools
brew install create-dmg
```

### Build Performance Tips

#### Faster Builds
- Use `--publish never` for local builds
- Use `--dir` target for development testing
- Enable build caching in CI/CD

#### Smaller Builds
- The configuration already uses maximum compression
- Excludes development files and unnecessary modules
- Uses tree-shaking to remove unused code

## 📋 Build Checklist

Before creating a release:

- [ ] Update version in `package.json`
- [ ] Test the application locally
- [ ] Verify all dependencies are up to date
- [ ] Check that all required assets exist (icons, etc.)
- [ ] Test on target platforms if possible
- [ ] Update changelog/release notes
- [ ] Create Git tag and push
- [ ] Monitor GitHub Actions build
- [ ] Test downloaded executables
- [ ] Update documentation if needed

## 🔗 Related Links

- **Electron Builder**: [Documentation](https://www.electron.build/)
- **GitHub Actions**: [Build Workflow](.github/workflows/build-release.yml)
- **Code Signing**: [Apple Developer](https://developer.apple.com/), [Microsoft Docs](https://docs.microsoft.com/en-us/windows/win32/seccrypto/using-signtool-to-sign-a-file)

---

**🎵 Happy building! Create amazing music with MuseCraft Studio! 🎹✨**