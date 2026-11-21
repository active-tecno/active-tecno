// Single source of truth for the deployed asset/API version.
// On Render this is the git commit; locally it falls back to package version + start time.
const APP_VERSION = (process.env.RENDER_GIT_COMMIT || '').slice(0, 8)
  || (require('./package.json').version + '-' + Math.floor(Date.now() / 60000).toString(36));
module.exports = { APP_VERSION };

// deploy-handshake verified live
