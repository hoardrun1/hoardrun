// Prepare the native apps: record the web app's address for the offline screen, then copy the
// config and plugins into the iOS and Android projects.
//   npm run mobile:sync                         (uses HOARDRUN_APP_URL, default https://hoardrun.com)
//   npm run mobile:sync -- android              (one platform)
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const appUrl = (process.env.HOARDRUN_APP_URL || 'https://hoardrun.com').replace(/\/+$/, '')
if (!/^https:\/\//.test(appUrl) && !/^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+)(:\d+)?$/.test(appUrl)) {
  console.error(`HOARDRUN_APP_URL must be https (or a development address on your network): ${appUrl}`)
  process.exit(1)
}

writeFileSync(
  new URL('../mobile/www/app-url.js', import.meta.url),
  `window.HOARDRUN_URL = ${JSON.stringify(appUrl)};\n`,
)
const platform = process.argv[2]
if (platform && !['android', 'ios'].includes(platform)) {
  console.error('Platform must be android or ios')
  process.exit(1)
}
console.log(`Apps will load ${appUrl}`)
// The Capacitor command line, run with this Node and no shell
const capacitor = fileURLToPath(new URL('../node_modules/@capacitor/cli/bin/capacitor', import.meta.url))
execFileSync(process.execPath, [capacitor, 'sync', ...(platform ? [platform] : [])],
  { stdio: 'inherit', env: { ...process.env, HOARDRUN_APP_URL: appUrl } })
