import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wonke.pos',
  appName: 'Wonke POS',
  webDir: 'dist/public',
  android: {
    allowMixedContent: true
  }
};

export default config;
