import { Platform } from 'react-native';

/**
 * Returns `true` when the bundle is running in a browser
 * (i.e. React-Native Web / React-DOM), otherwise `false`.
 */
export const isWeb = (): boolean => Platform.OS === 'web';
