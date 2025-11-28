import 'dotenv/config';

export default {
  expo: {
    name: 'Home-Gardener',
    slug: 'home-gardener',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/image1.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/image1.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      package: 'com.matiasdubin.homegardener',
      adaptiveIcon: {
        foregroundImage: './assets/image1.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      permissions: [
        'android.permission.CAMERA',
        'android.permission.READ_MEDIA_IMAGES'
      ],
    },
    web: {
      favicon: './assets/image1.png',
    },
    plugins: [
      'expo-secure-store'
    ]
  },
};
