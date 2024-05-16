import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
const { version } = packageJson

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: 'reading assistant',
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  icons: {
    128: "src/assets/icon.png",
  },
  "action": {
    "default_title": "Click to open panel"
  },
  permissions: [
    'storage',
    'contextMenus',
    'activeTab',
    'sidePanel',
    'scripting'
  ],
  options_ui: {
    page: "src/pages/options/index.html",
    open_in_tab: true,
  },
  background: {
    service_worker: 'src/pages/background/index.ts',
  },
}))