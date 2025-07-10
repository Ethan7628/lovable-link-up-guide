import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f6ef4dc4d59e4285aeeca87b499ae745',
  appName: 'BodyConnect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://f6ef4dc4-d59e-4285-aeec-a87b499ae745.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#8b5cf6',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;