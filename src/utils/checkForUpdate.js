import { Linking, Platform } from 'react-native';
import SpInAppUpdates, {
  IAUUpdateKind,
  AndroidInstallStatus,
} from 'sp-react-native-in-app-updates';

const inAppUpdates = new SpInAppUpdates(false);

/**
 * Checks the Play Store / App Store for a newer published version.
 * - Android: uses Google Play's official in-app update flow (Play Core).
 *   Play renders its own dialog, so there is nothing for us to show. Once the
 *   update finishes downloading it installs automatically.
 * - iOS: uses the iTunes lookup API and returns the store details, so the
 *   caller can render the app's own update popup instead of a native Alert.
 *
 * @returns {Promise<{storeVersion: string, storeUrl: string} | null>}
 *   iOS update details, or null when there is no popup to show.
 */
export const checkForAppUpdate = async () => {
  try {
    const result = await inAppUpdates.checkNeedsUpdate();

    if (!result.shouldUpdate) {
      return null;
    }

    if (Platform.OS === 'android') {
      inAppUpdates.addStatusUpdateListener(status => {
        if (status.status === AndroidInstallStatus.DOWNLOADED) {
          inAppUpdates.installUpdate();
        }
      });

      await inAppUpdates.startUpdate({
        updateType: IAUUpdateKind.FLEXIBLE,
      });

      return null;
    }

    // Strip the query string the iTunes API appends, same as the library does.
    const storeUrl = result.other?.trackViewUrl?.split('?')[0];

    if (!storeUrl) {
      console.log('APP UPDATE: no App Store URL found, skipping popup');
      return null;
    }

    return {
      storeVersion: result.storeVersion,
      storeUrl,
    };
  } catch (err) {
    console.log('APP UPDATE CHECK ERROR:', err);
    return null;
  }
};

/** Opens the app's App Store page so the user can install the update. */
export const openAppStore = async storeUrl => {
  try {
    await Linking.openURL(storeUrl);
  } catch (err) {
    console.log('APP UPDATE OPEN STORE ERROR:', err);
  }
};
