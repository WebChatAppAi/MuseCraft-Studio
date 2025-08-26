import type { Configuration } from 'electron-builder'

// Ensure Node.js types are available
declare const process: NodeJS.Process

import {
  main,
  name,
  version,
  resources,
  description,
  displayName,
  author as _author,
} from './package.json'

import { getDevFolder } from './src/lib/electron-app/release/utils/path'

const author = _author?.name ?? _author
const currentYear = new Date().getFullYear()
const authorInKebabCase = author.replace(/\s+/g, '-')
const appId = `com.${authorInKebabCase}.${name}`.toLowerCase()

const artifactName = [`${name}-v${version}`, '-${os}.${ext}'].join('')

export default {
  appId,
  productName: displayName,
  copyright: `Copyright © ${currentYear} — ${author}`,

  directories: {
    app: getDevFolder(main),
    output: `dist/v${version}`,
  },

  // Include Chrome in the build
  files: [
    '**/*',
    '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rcs,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
  ],

  // Add extra resources if needed
  extraResources: [
    {
      from: `${resources}/public`,
      to: 'public',
      filter: ['**/*']
    },
    {
      from: `${resources}/soundbank`,
      to: 'soundbank',
      filter: ['**/*']
    },
    {
      from: `${resources}/midi.png`,
      to: 'midi.png'
    },
    {
      from: `${resources}/icon.ico`,
      to: 'icon.ico'
    },
    {
      from: `${resources}/icon.icns`,
      to: 'icon.icns'
    },
    {
      from: `${resources}/icon.png`,
      to: 'icon.png'
    }
    // Add your custom resources here
    // {
    //   from: 'path/to/your/resource',
    //   to: 'destination',
    //   filter: ['**/*']
    // }
  ],

  mac: {
    artifactName,
    icon: `${resources}/icon.icns`,
    category: 'public.app-category.music',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    identity: process.env.APPLE_IDENTITY || null,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    darkModeSupport: true,
    extendInfo: {
      NSMicrophoneUsageDescription: 'This app requires microphone access for audio input features.',
      NSCameraUsageDescription: 'This app may use camera for future video features.',
      NSAppleEventsUsageDescription: 'This app uses Apple Events to communicate with other music applications.',
    }
  },

  linux: {
    artifactName,
    icon: `${resources}/icon.png`,
    category: 'AudioVideo',
    synopsis: description,
    target: ['AppImage', 'deb', 'pacman', 'freebsd', 'rpm'],
  },

  win: {
    artifactName,
    icon: `${resources}/icon.ico`,
    target: [
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    publisherName: 'MuseCraft Studio',
    verifyUpdateCodeSignature: false,
    requestedExecutionLevel: 'asInvoker',
    certificateFile: process.env.WIN_CSC_LINK || undefined,
    certificatePassword: process.env.WIN_CSC_KEY_PASSWORD || undefined,
  },



  portable: {
    requestExecutionLevel: 'user'
  },

  publish: [
    {
      provider: 'github',
      owner: 'WebChatAppAi',
      repo: 'MuseCraft-Studio'
    }
  ],

  // Security and signing configurations
  afterSign: process.env.CSC_LINK ? './scripts/notarize.js' : undefined,
  
  // Compression settings for smaller builds
  compression: 'maximum',
  
  // Include license
  extraMetadata: {
    license: 'PVT',
    homepage: 'https://webchatappai.github.io/MuseCraft-Studio/',
    repository: {
      type: 'git',
      url: 'https://github.com/WebChatAppAi/MuseCraft-Studio.git'
    },
    bugs: {
      url: 'https://github.com/WebChatAppAi/MuseCraft-Studio/issues'
    }
  },
} satisfies Configuration