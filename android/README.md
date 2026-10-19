# PowerGuard Android app

This project packages the existing PowerGuard dashboard and its sample CSV inside a small Android WebView app. The dashboard's HTML, CSS, JavaScript, icon, manifest, service worker and CSV are copied into `app/src/main/assets/site/`.

## Download the APK

After the GitHub Actions **Build Android APK** workflow succeeds, download the latest build from the [PowerGuard Android release](https://github.com/NGAURAV951/powerguard-embedded-monitor/releases/download/android-latest/PowerGuard.apk), or open the repository's Actions tab and download the `PowerGuard-Android-APK` artifact.

The CI-produced APK is a debug build for testing and demonstration. Android may ask you to allow installation from the browser or file manager. Do not install APKs from sources you do not trust.

## Build locally

1. Install Android Studio and Android SDK platform 36.
2. Open the `android/` directory in Android Studio and allow Gradle sync to finish.
3. Run the app on an Android device or emulator, or run the Gradle task `assembleDebug`.

The GitHub Actions workflow builds with JDK 17, Gradle 8.13, Android Gradle Plugin 8.13.2 and Android SDK 36.

## Scope

The website is bundled locally, so its sample dashboard can open without a network connection. The readings are synthetic. This APK does not collect live sensor data or connect to an embedded board. The generated debug APK is not a Play Store release.
