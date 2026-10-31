# Arif Car Sell Mobile

Expo and React Native mobile client for Android and iOS. It uses the existing Express API and lives separately from the Vite website.

## Features currently in the app

- Browse approved vehicles from the backend.
- Search by brand, model, location and fuel type.
- View vehicle details and contact a seller by phone or WhatsApp when a number is available.
- Register, sign in and sign out using the existing JWT API.
- Sign in with Google / Firebase authentication with one tap.
- Send password recovery emails via Firebase Identity Toolkit.
- Save and remove vehicles for the signed-in account.
- Create, edit, delete, and submit seller listings for review.
- Upload up to five vehicle photos and an ownership document (Libre).
- Send buyer inquiries and test-drive requests from vehicle details.
- Manage owned-listing inquiries and test-drive status from the seller workspace.
- Edit profile details and change the account password.
- Loading, empty and error states for network requests.

The mobile seller workspace and listing form are implemented. Push-notification registration
and native device notification presentation still require additional backend/provider work.

## Project layout

```text
app/                          Expo Router routes and screen composition
src/
  components/                 Reusable UI components
  features/
    auth/                     Authentication service and session context
    vehicles/                 Vehicle API service and TanStack Query hooks
  services/                   API client, Firebase service and secure token storage
  theme/                      Design tokens
  types/                      Shared mobile domain types
  utils/                      Platform independent formatting helpers
```

## Requirements

- Node.js 22.13 or newer (required by Expo SDK 57).
- Android emulator or Expo Go on a phone. An iOS simulator requires macOS; an iPhone can use Expo Go.
- Backend environment configured in the repository root and a reachable MongoDB database.

## Expo Go compatibility

This app uses Expo SDK 57 and requires the matching Expo Go version. After updating dependencies, stop any existing Expo server and start it with `npx expo start --clear` so your phone receives a fresh SDK 57 bundle.

## Run on a phone or emulator

1. In the repository root, configure `.env` using `.env.example`, then start the backend:

   ```sh
   npm run dev
   ```

   The API listens on port `3000` and requires its database to start successfully.

2. In `apps/mobile`, install dependencies once:

   ```sh
   npm install
   ```

3. Copy `apps/mobile/.env.example` to `apps/mobile/.env` and set the API address:

   | Target           | `EXPO_PUBLIC_API_BASE_URL`      |
   | ---------------- | ------------------------------- |
   | Android emulator | `http://10.0.2.2:3000`          |
   | iOS simulator    | `http://localhost:3000`         |
   | Physical phone   | `http://<computer-LAN-IP>:3000` |

   For a phone, use the computer's Wi-Fi/LAN address, keep both devices on the same network, and allow port 3000 through the computer firewall. Do not use `localhost` on the phone; it points back to the phone itself.

4. Start Expo from `apps/mobile`:

   ```sh
   npm start
   ```

   Scan the QR code using Expo Go on the phone. With a running Android emulator, press `a` in the Expo terminal or run `npm run android`. For iOS Simulator, run `npm run ios` on a Mac. For a browser preview, run `npm run web`. Browser login tokens are kept in memory only; use a device to verify secure token storage.

If you change `.env`, restart Expo so it reloads the public API URL.

## Firebase Authentication Setup

The mobile app includes a lightweight, zero-native-dependency Firebase Auth integration in `src/services/firebase.ts` that communicates directly with the **Firebase Identity Toolkit REST API**. This allows full Email/Password, Password Reset, and Google Sign-in to run universally on Expo Go, Android APKs, iOS, and Web without native build friction.

### 1. Configure Firebase Credentials

1. Go to the [Firebase Console](https://console.firebase.google.com/) and open or create your project.
2. In **Project Settings** > **General**, scroll to **Your apps** and add a **Web** app (or copy the config if already added).
3. Under **Authentication** > **Sign-in method**, ensure **Email/Password** and **Google** are enabled.
4. Add the keys to `apps/mobile/.env`:

   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="arif-car-sell.firebaseapp.com"
   EXPO_PUBLIC_FIREBASE_PROJECT_ID="arif-car-sell"
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="arif-car-sell.appspot.com"
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
   EXPO_PUBLIC_FIREBASE_APP_ID="1:123456789012:android:abcdef123456"
   ```

### 2. Available Firebase Features

- **Google Sign-In**: Tap "Continue with Google" on the login screen to sign in with Google or select a one-tap demo account. The client verifies the account with `firebaseAuth.verifyGoogleAccount` and syncs with `/api/auth/firebase-google` on the backend.
- **Password Reset**: Tap "Forgot?" on the Sign In tab. If Firebase credentials are configured, an actual recovery link is sent to the provided email address via Firebase.
- **Account Verification**: Backend validates Google / Firebase `idToken` if provided via Google's tokeninfo API.

## Manual smoke test

1. Open Discover and confirm vehicles load from the backend.
2. Search for a brand and try the fuel filters.
3. Open a vehicle and confirm its specs and contact actions.
4. Register a test buyer account, then sign in.
5. Tap the heart on a vehicle; confirm it appears on Saved. Tap again to remove it.
6. Sign in as a seller, create a listing with photos and a Libre document, and confirm it enters pending review.
7. Open a vehicle as a buyer, submit an inquiry and test-drive request, then confirm they appear in the seller workspace.
8. Sign out and confirm the Profile screen returns to its signed-out state.
9. Stop the backend briefly and confirm the app shows a readable error and retry action.

Registration writes a user to the configured backend database. Use a test environment and test account while developing.

## Project checks

From `apps/mobile`:

```sh
npm run format:check
npm run typecheck
npx expo install --check
```

To format the app after edits, run `npm run format`. Expo SDK compatibility checks may use the locally bundled version map when the network is unavailable.

## Notes

- Access and rotating refresh tokens are stored with Expo SecureStore on native platforms. The browser preview keeps them in memory only.
- Use an HTTPS API URL for staging and production.
- JavaScript bundle export and type checking do not replace testing on physical Android and iOS devices or producing signed store builds.
