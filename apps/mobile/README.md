# Arif Car Sell Mobile

Expo and React Native mobile client for Android and iOS. It uses the existing Express API and lives separately from the Vite website.

## Features currently in the app

- Browse approved vehicles from the backend.
- Search by brand, model, location and fuel type.
- View vehicle details and contact a seller by phone or WhatsApp when a number is available.
- Register, sign in and sign out using the existing JWT API.
- Save and remove vehicles for the signed-in account.
- Loading, empty and error states for network requests.

Seller dashboards, listing management, photo upload, test drive booking, inquiries and account editing are not implemented in the mobile app yet.

## Project layout

```text
app/                          Expo Router routes and screen composition
src/
  components/                 Reusable UI components
  features/
    auth/                     Authentication service and session context
    vehicles/                 Vehicle API service and TanStack Query hooks
  services/                   API client and secure token storage
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

## Manual smoke test

1. Open Discover and confirm vehicles load from the backend.
2. Search for a brand and try the fuel filters.
3. Open a vehicle and confirm its specs and contact actions.
4. Register a test buyer account, then sign in.
5. Tap the heart on a vehicle; confirm it appears on Saved. Tap again to remove it.
6. Sign out and confirm the Profile screen returns to its signed-out state.
7. Stop the backend briefly and confirm the app shows a readable error and retry action.

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
