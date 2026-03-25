import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const IS_BETA = APP_VERSION.includes('beta');
