# MuseCraft Studio Build Guide

This guide explains how to build MuseCraft Studio executables for Windows, macOS, and Linux.

## Quick Start

### Prerequisites
- Node.js 18 or higher
- pnpm (recommended) or npm
- Git

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Or use the build helper script
./scripts/build.sh dev
```

## Building Executables

### Automated Builds (Recommended)
The easiest way to build Windows executables is through our automated GitHub Actions workflows:

1. **Trigger builds via GitHub Actions**:
   - Push to `main` or `develop` branch
   - Create a pull request
   - Use manual workflow dispatch in GitHub Actions tab

2. **Download built executables**:
   - Go to the Actions tab in GitHub
   - Select the latest workflow run
   - Download artifacts from the build job

### Local Builds

#### Prerequisites by Platform
- **Windows**: No additional setup required
- **macOS**: Xcode command line tools (`xcode-select --install`)
- **Linux**: No additional setup required

#### Build Commands

```bash
# Build for current platform
pnpm run prebuild
pnpm run build

# Platform-specific builds
pnpm electron-builder --win     # Windows (requires Windows OS)
pnpm electron-builder --mac     # macOS (requires macOS)
pnpm electron-builder --linux   # Linux

# Using helper script
./scripts/build.sh build        # Current platform
./scripts/build.sh build:win    # Windows
./scripts/build.sh build:mac    # macOS
./scripts/build.sh build:linux  # Linux
```

#### Cross-Platform Limitations
- **Windows builds** from Linux/macOS require Wine and are unreliable
- **macOS builds** can only be created on macOS due to code signing requirements
- **Linux builds** can be created on any platform

**Recommendation**: Use GitHub Actions for reliable cross-platform builds.

## Build Outputs

### Windows
- `musecraft-app-v{version}-win.exe` - NSIS installer
- `musecraft-app-v{version}-win.zip` - Portable ZIP

### macOS
- `musecraft-app-v{version}-mac.dmg` - DMG installer
- `musecraft-app-v{version}-mac.zip` - Portable ZIP

### Linux
- `musecraft-app-v{version}-linux.AppImage` - Portable AppImage
- `musecraft-app-v{version}-linux.deb` - Debian package
- Additional formats: rpm, pacman, freebsd

## GitHub Actions Workflows

### 1. Build Windows (`build-windows.yml`)
- Focuses specifically on Windows builds
- Runs on `windows-latest` runner
- Uploads artifacts and releases

### 2. Multi-Platform Build (`build-multi-platform.yml`)
- Builds for Windows, macOS, and Linux
- Matrix strategy for parallel builds
- Manual dispatch with platform selection

### 3. Release (`release.yml`)
- Triggered by git tags (e.g., `v1.0.0`)
- Builds all platforms and creates GitHub release
- Includes detailed release notes

## Configuration

### Electron Builder Settings
Configuration is in `electron-builder.ts`:

- **Windows**: NSIS installer + ZIP, custom installer settings
- **macOS**: DMG + ZIP, app notarization ready
- **Linux**: Multiple formats (AppImage, deb, rpm, etc.)

### Icons
Icons are located in `src/resources/build/icons/`:
- `icon.ico` - Windows icon (16x16 to 256x256)
- `icon.icns` - macOS icon (multiple resolutions)

## Troubleshooting

### Common Issues

1. **Wine requirement error on Linux**:
   ```
   wine is required, please see https://electron.build/multi-platform-build#linux
   ```
   **Solution**: Use GitHub Actions for Windows builds instead of local builds.

2. **Missing icon files**:
   **Solution**: Icons are automatically created from `src/resources/icon.png`

3. **Build fails with package.json errors**:
   **Solution**: Ensure `onlyBuiltDependenciesFile` is set in `package.json`

### Build Script Commands
```bash
./scripts/build.sh help     # Show all available commands
./scripts/build.sh clean    # Clean build artifacts
./scripts/build.sh deps     # Reinstall dependencies
./scripts/build.sh lint     # Run code linter
```

## Release Process

1. **Update version** in `package.json`
2. **Create and push a git tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. **GitHub Actions automatically**:
   - Builds all platforms
   - Creates GitHub release
   - Uploads all executables

## Development Notes

- The app uses Electron with Vite for the build system
- TypeScript configuration supports path mapping
- React with Tailwind CSS for the UI
- Cross-process architecture (main, preload, renderer)

For more details, see `dev-notes.md` and `docs/technical.md`.