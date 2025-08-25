#!/bin/bash

# Build script for MuseCraft Studio
# Provides easy commands for development and testing

set -e

show_help() {
    echo "MuseCraft Studio Build Helper"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development server"
    echo "  build       Build for current platform"
    echo "  prebuild    Run prebuild steps only"
    echo "  clean       Clean build artifacts"
    echo "  deps        Install dependencies"
    echo "  lint        Run linter"
    echo "  help        Show this help"
    echo ""
    echo "Cross-platform builds (requires appropriate OS):"
    echo "  build:win   Build for Windows (requires Windows or CI)"
    echo "  build:mac   Build for macOS (requires macOS or CI)"
    echo "  build:linux Build for Linux"
    echo ""
    echo "Note: Windows builds from Linux require Wine. Use GitHub Actions instead."
}

case "$1" in
    "dev")
        echo "🚀 Starting development server..."
        pnpm run dev
        ;;
    "build")
        echo "🔨 Building for current platform..."
        pnpm run prebuild
        pnpm run build
        ;;
    "build:win")
        echo "🔨 Building for Windows..."
        pnpm run prebuild
        pnpm electron-builder --win
        ;;
    "build:mac")
        echo "🔨 Building for macOS..."
        pnpm run prebuild
        pnpm electron-builder --mac
        ;;
    "build:linux")
        echo "🔨 Building for Linux..."
        pnpm run prebuild
        pnpm electron-builder --linux
        ;;
    "prebuild")
        echo "⚙️ Running prebuild steps..."
        pnpm run prebuild
        ;;
    "clean")
        echo "🧹 Cleaning build artifacts..."
        pnpm run clean:dev
        rm -rf dist/
        echo "✅ Clean complete"
        ;;
    "deps")
        echo "📦 Installing dependencies..."
        pnpm install
        ;;
    "lint")
        echo "🔍 Running linter..."
        pnpm run lint
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac