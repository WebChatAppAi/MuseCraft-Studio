const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  
  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization - not macOS build');
    return;
  }

  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASS || !process.env.APPLE_TEAM_ID) {
    console.log('Skipping notarization - Apple credentials not configured');
    console.log('To enable notarization, set APPLE_ID, APPLE_ID_PASS, and APPLE_TEAM_ID environment variables');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log('Notarizing macOS application...');
  console.log(`App path: ${appPath}`);

  try {
    await notarize({
      appBundleId: context.packager.appInfo.id,
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASS,
      teamId: process.env.APPLE_TEAM_ID,
    });
    
    console.log('✅ Notarization successful');
  } catch (error) {
    console.error('❌ Notarization failed:', error);
    // Don't fail the build if notarization fails
    // This allows builds to complete even without notarization setup
  }
};