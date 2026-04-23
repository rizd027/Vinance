import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.keluargaberkah.finance',
  appName: 'KeluargaBerkah Finance',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: false,
    },
  },
};

export default config;
