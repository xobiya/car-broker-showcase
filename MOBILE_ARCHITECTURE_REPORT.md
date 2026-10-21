# Arif Car Sell Mobile Architecture Report

**Audit date:** 2026-10-20  
**Repository:** `xobiya/car-broker-showcase`

## Executive summary

This repository contains three related applications:

- A Vite/React web marketplace and operations console in [`frontend/`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend).
- An Express API and database adapter in [`backend/`](C:/Users/dell/Documents/Feleke/car-broker-showcase/backend).
- An existing Expo Router/React Native client in [`apps/mobile/`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile).

The product is an Ethiopian vehicle marketplace and procurement platform. Public users browse approved/sold listings; buyers save vehicles and submit leads/test-drive requests; sellers and brokers manage listings and leads; administrators manage verification, moderation, inspections, documents, reports, settings, and platform statistics.

The recommended mobile strategy is to continue with the existing **React Native + Expo** application, not to wrap the web UI with Capacitor. The web surface is highly desktop/DOM-oriented (Tailwind DOM layout, scroll animation code, file inputs, iframes, clipboard/share APIs, browser navigation, and role-specific dense dashboards). The existing mobile app has already established native equivalents for secure token storage, image/document selection, native navigation, and TanStack Query. Share domain contracts and API services, but build mobile screens as native compositions.

## 1. High-level overview and stack

### Frontend

- **React:** React 19.0.1 on web; React 19.2.3 in the mobile workspace.
- **Web build tool:** Vite 6 with `@vitejs/plugin-react` and Tailwind CSS v4 via `@tailwindcss/vite`; configured in [`frontend/vite.config.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/vite.config.ts).
- **Web routing:** `react-router-dom` 7, with lazy-loaded route components and role guards in [`frontend/src/App.tsx`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/App.tsx).
- **Styling/UI:** Tailwind utility classes, local shadcn-style primitives under [`frontend/src/components/ui/shadcn/`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/components/ui/shadcn), `lucide-react` icons, and `motion/react` animations.
- **Internationalization:** `i18next`/`react-i18next`, with English, Amharic, and Afaan Oromo message bundles under [`frontend/src/messages/`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/messages).
- **Web state:** Zustand 5 in [`frontend/src/store/index.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/store/index.ts). There is no TanStack Query or Redux in the web package.
- **SEO/analytics:** React SEO component, Vercel Analytics, and Vercel Speed Insights.

### Mobile

- **Framework:** Expo SDK 57, React Native 0.86, Expo Router, and React Native Web.
- **State/data:** React Context for the session and TanStack Query 5 for server state; see [`apps/mobile/src/features/auth/SessionContext.tsx`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/features/auth/SessionContext.tsx) and [`apps/mobile/src/features/vehicles/vehicle-queries.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/features/vehicles/vehicle-queries.ts).
- **Native capabilities already installed:** `expo-secure-store`, `expo-image-picker`, `expo-document-picker`, `expo-linking`, safe-area support, screens, and Reanimated.
- **Navigation:** File-based Expo Router routes under [`apps/mobile/app/`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/app).

### Backend and persistence

- **Runtime/framework:** Node.js/TypeScript, Express 4, bundled with esbuild for deployment.
- **Database:** MongoDB through Mongoose 9, with a database service/facade in [`backend/db/index.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/backend/db/index.ts) and schemas in [`backend/db/models.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/backend/db/models.ts).
- **Validation/security:** Zod validators, Helmet, CORS with credentials, general and auth-specific rate limits, bcryptjs password hashing, and JWT access/refresh tokens.
- **Media:** Multer receives uploads; Cloudinary is preferred when configured, with a MongoDB base64 media fallback.
- **Notifications:** Nodemailer-based email notification service in [`backend/services/notifications.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/backend/services/notifications.ts).
- **Caching:** Node-cache is used for at least the unauthenticated, unfiltered vehicle list.
- **Deployment:** Render configuration is in [`render.yaml`](C:/Users/dell/Documents/Feleke/car-broker-showcase/render.yaml); Vercel build support exists for the web build.

### Domain and personas

The domain model in [`shared/types.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/shared/types.ts) covers users, brokers, vehicle listings, leads, sales, documents, inspections, saved vehicles, reports, and test drives.

| Persona | Primary capabilities |
|---|---|
| Visitor/buyer | Browse and filter approved vehicles, inspect details, contact sellers, save vehicles, submit leads and test-drive requests |
| Seller | Maintain vehicle listings, upload media/documents, submit listings, manage inbound activity |
| Broker | Manage inventory, leads, test drives, broker profile and sales/commission workflow |
| Administrator | Moderate listings/users/brokers, inspect vehicles, manage reports/documents/settings, view stats and audit logs |

## 2. State management and data flow

### Web

The web Zustand store contains:

- Current user and `isAuthenticated`.
- Toast queue.
- Selected vehicle and selected broker navigation state.
- Initial browse filters.
- Theme state.

The store directly reads/writes browser storage and directly mutates the document root for theme classes. This is convenient for web but is not a 1:1 native reuse candidate.

The web API layer in [`frontend/src/lib/api.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/lib/api.ts):

- Wraps `fetch` in generic `api.get/post/put/delete` helpers.
- Reads `VITE_API_BASE_URL`.
- Sends `Authorization: Bearer <token>` and `credentials: include`.
- Attempts refresh on 401 using the refresh-token cookie.
- Dispatches a browser `autobroker:unauthorized` event after session failure.
- Exposes feature services for auth, vehicles, leads, sales, brokers, users, stats, brands, audit logs, documents, inspections, saved vehicles, test drives, reports, uploads, settings, and contact.

There are no custom web data-fetching hooks beyond the auth hook. Most screens call the service objects directly and manage local loading/error state.

### Mobile

The mobile client is a better separation boundary:

- [`apps/mobile/src/services/api-client.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/services/api-client.ts) is a generic fetch client with query parameters, JSON handling, FormData support, 401 refresh, and structured errors.
- [`apps/mobile/src/features/vehicles/vehicle-service.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/features/vehicles/vehicle-service.ts) contains vehicle, lead, test-drive, and upload services.
- [`apps/mobile/src/features/vehicles/vehicle-queries.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/features/vehicles/vehicle-queries.ts) provides list/detail/infinite-list/saved/mutation hooks.
- [`apps/mobile/src/features/auth/auth-service.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/features/auth/auth-service.ts) contains auth/profile calls.
- [`apps/mobile/src/types/models.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/types/models.ts) contains mobile-side domain types.

The mobile query layer uses 20-item pagination for infinite vehicle lists. This should become the preferred data-access pattern for the web app too, or the API should expose a consistent paginated response envelope rather than returning an array whose length is used as the pagination signal.

### Recommended data-flow boundary

Create a platform-neutral package (for example `packages/domain` or `shared/`) containing:

1. API DTO types and Zod schemas.
2. URL/query parameter builders.
3. Pure formatters and business calculations.
4. Platform-neutral feature services that accept a transport/storage adapter.

Keep React hooks, navigation, toast rendering, file pickers, secure storage, and platform lifecycle behavior in each client.

## 3. Authentication and session architecture

### Current protocol

The backend issues:

- A 15-minute JWT access token.
- A 7-day rotating refresh JWT.
- HTTP-only cookies named `autobroker_token` and `autobroker_refresh_token`.

The backend accepts the access token from either the `Authorization` header or the access-token cookie, as implemented in [`backend/auth.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/backend/auth.ts). Refresh is a `POST /api/auth/refresh` operation and logout clears cookies.

### Web persistence

The web currently persists:

- `autobroker_token` in `localStorage`.
- Serialized `autobroker_user` in `localStorage`.
- `autobroker_theme` and locale-related state in browser storage.

The web client also sends cookies with requests. This creates two parallel credential paths: a browser cookie session and a locally stored bearer token. The mobile client cannot depend on the browser's HTTP-only cookie behavior in the same way.

### Mobile persistence

The mobile app stores its access token through [`apps/mobile/src/services/secure-session.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/services/secure-session.ts):

- iOS: Expo SecureStore, backed by Keychain.
- Android: Expo SecureStore, backed by encrypted native storage.
- Web preview: an in-memory token only.

The mobile client still sends `credentials: include` and attempts cookie refresh. On native devices, the refresh cookie may not be persisted or sent reliably without a native cookie manager. The current README correctly notes that native refresh renewal is incomplete.

### Required mobile auth changes

1. Choose one explicit mobile contract:
   - Prefer a native refresh-token response stored in SecureStore, or
   - Add a supported native cookie jar and verify it on both iOS and Android.
2. Do not persist the user object as the authority; rehydrate it from `/api/auth/me`.
3. Store access and refresh credentials separately if the API returns both, and rotate/delete them on logout and refresh failure.
4. Use HTTPS in all non-local environments.
5. Add device-level reauthentication/biometric policy if the product requires high-value account actions.
6. Replace the web-only unauthorized DOM event with a shared auth-session callback/event interface.

## 4. API and real-time endpoints

### Endpoint inventory by domain

#### Auth/session

`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/change-password`, and `GET /api/auth/me`.

#### Marketplace vehicles

`GET /api/vehicles`, `GET /api/vehicles/:id`, `POST /api/vehicles`, `PUT /api/vehicles/:id`, `DELETE /api/vehicles/:id`, `PUT /api/vehicles/:id/approve`, `PUT /api/vehicles/:id/reject`, and `PUT /api/vehicles/:id/submit`.

The list endpoint supports status, brand, model, condition, body type, fuel type, location, year, price bounds, free-text search, pagination (`page`/`limit`), and sorting (`price_asc`, `price_desc`, `year_desc`, `newest`). Public unauthenticated requests are restricted to approved/sold vehicles and the unfiltered public result is cached.

#### Buyer/seller/broker activity

`GET/POST /api/leads`, `PUT /api/leads/:id/status`, `GET/POST /api/test-drives`, `PUT /api/test-drives/:id/status`, `GET/POST/DELETE /api/saved-vehicles`, `POST /api/contact`, and `GET/POST /api/sales`.

#### Broker and user profile

`GET /api/brokers`, `GET /api/brokers/:id`, `PUT /api/brokers/:id`, `PUT /api/brokers/:id/approve`, `PUT /api/brokers/:id/reject`, `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, and `DELETE /api/users/:id`.

#### Operations/admin

`GET /api/payments`, `POST /api/commissions/calculate`, `GET /api/stats`, `GET /api/stats/public`, `GET /api/brands`, `GET/POST /api/audit-logs`, `GET/POST/DELETE /api/documents`, `GET/POST/PUT /api/inspections`, `GET/POST/PUT /api/reports`, and `GET/PUT /api/settings`.

#### Media

`GET /api/media/:id`, legacy `GET /uploads/:filename`, `POST /api/upload`, and `POST /api/upload/multiple`.

### Real-time audit

No WebSocket, Socket.IO, Pusher/Reverb, SSE, or subscription client was found. The application is request/response based. Notifications are email-oriented on the backend. If mobile needs timely lead, approval, or test-drive updates, add push notification registration plus a server-side notification/outbox model; do not assume the current email service is a real-time transport.

### Payload and bandwidth risks

- `GET /api/vehicles` returns enriched listing objects and can return the entire matching array when `limit` is omitted.
- Vehicle objects may include `gallery`, document URLs, video URLs, and other optional fields on every list item.
- Saved-vehicle responses embed the full vehicle object.
- The backend accepts 50 MB JSON/urlencoded bodies and persists base64 images/PDFs into MongoDB when Cloudinary is unavailable. Base64 increases transfer size and makes mobile retries expensive.
- The media endpoint reads base64 data from MongoDB and reconstructs a buffer. This is functional but less suitable for high-volume mobile image delivery than CDN-backed, resized image URLs.
- Some API records can carry long descriptions, notes, audit details, and document metadata. Mobile list endpoints should use explicit projections/summary DTOs.
- API responses are JSON; no business endpoint intentionally returns HTML. HTML is limited to the web shell/SPA and browser-oriented iframe/document previews.

Recommended API improvements: enforce a default/max page size, add `{items, page, limit, total/hasMore}` envelopes, use list/detail DTOs, provide thumbnail URLs, and move binary media fully to Cloudinary/object storage with size/type limits.

## 5. UI structure and native translation surface

### Web route/screen inventory

Routes are declared in [`frontend/src/App.tsx`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/App.tsx):

- Public/discovery: `/`, `/services`, `/browse`, `/vehicles/:id`, `/brokers/:id`, `/compare`.
- Auth: `/login`, `/register`, `/signup`.
- Account: `/profile`, `/my-account`.
- Seller/broker: `/profile?section=listings`, `/broker-dashboard`.
- Administration: `/admin`, `/admin/profile`.
- Informational/support: `/about`, `/contact`, `/terms`, `/privacy`, `/help`.
- Compatibility redirects: `/choose-role`, `/service`, `/seller-dashboard`, `/about-us`, `/contact-us`, `/trust-safety`.

Primary web surfaces include the home/marketing page, showroom filters, vehicle details, comparison, broker profiles, auth forms/modals, buyer profile, broker dashboard, admin panel, admin profile, contact/help forms, vehicle form modal, report modal, commission calculator, and document/inspection previews.

### Existing mobile route/screen inventory

The Expo client currently has:

- Tabs: Discover, Search, Favorites, Sell/Garage, Profile.
- Modal/detail routes: Login, vehicle detail, listing form, settings.
- Native vehicle cards, loading/error states, filters, saved vehicles, contact actions, and partial seller/broker lead/test-drive management.

The mobile README explicitly identifies missing capabilities: seller dashboards, full listing management/photo upload, test-drive booking UX, inquiries completion, and account editing.

### Web-only dependencies requiring adapters or redesign

| Web dependency | Evidence | Native treatment |
|---|---|---|
| DOM root and document theme mutation | [`frontend/src/main.tsx`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/main.tsx), [`frontend/src/store/index.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/store/index.ts) | Native theme provider/design tokens; no `document` |
| Browser scrolling and scroll animations | [`frontend/src/components/ui/ScrollAnimations.tsx`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/components/ui/ScrollAnimations.tsx) | `ScrollView`/`Animated`/Reanimated |
| Browser history/navigation | `BrowserRouter`, `window.location.href`, `navigate(-1)` | Expo Router and native back behavior |
| File inputs and browser `File`/`FormData` | Vehicle form, broker/admin dashboards, upload methods in [`frontend/src/lib/api.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/lib/api.ts) | `expo-image-picker`/`expo-document-picker`, URI-to-FormData adapter, compression and upload progress |
| Iframe document previews | Admin, broker, buyer, and vehicle form surfaces | Native PDF/document viewer or external system browser |
| `mailto:` and `tel:` links | Admin/profile and home surfaces | `Linking.openURL` with installed-app/error handling |
| Clipboard and Web Share | Vehicle comparison | `expo-clipboard` and React Native share/linking APIs |
| Hover states and mouse handlers | Dense admin/broker components | Press/focus/accessibility states; redesign desktop tables as cards/lists |
| SEO `dangerouslySetInnerHTML` | [`frontend/src/components/common/SEO.tsx`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/components/common/SEO.tsx) | Remove from native; use native metadata/deep-link configuration |
| Browser event bus | `autobroker:unauthorized` custom window event | Context callback or event emitter abstraction |
| Browser locale/document direction mutation | [`frontend/src/i18n/index.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/i18n/index.ts) | i18n provider, RTL-aware native styles, persisted locale adapter |

There is no evidence of browser geolocation, service workers, web payment popups, or iframe-based external payment integration in the audited source. Phone/WhatsApp-style contact behavior exists conceptually and should be routed through `Linking` on native.

## 6. Mobile readiness assessment

### Reusable assets

The following are good candidates for direct or near-direct sharing:

- [`shared/types.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/shared/types.ts), after reconciling snake_case API fields with camelCase client DTOs.
- Pure currency/date/commission calculations and constants, extracted from UI modules.
- API endpoint contracts and Zod schemas from [`backend/validators/`](C:/Users/dell/Documents/Feleke/car-broker-showcase/backend/validators).
- The feature-level service method shapes represented by [`apps/mobile/src/features/vehicles/vehicle-service.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/features/vehicles/vehicle-service.ts).
- TanStack Query keys and server-state hooks in [`apps/mobile/src/features/vehicles/vehicle-queries.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/features/vehicles/vehicle-queries.ts), with platform-neutral service imports.
- Auth DTOs and refresh semantics from [`apps/mobile/src/features/auth/auth-service.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/features/auth/auth-service.ts).
- Translation message JSON under [`frontend/src/messages/`](C:/Users/dell/Documents/Feleke/car-broker-showcase/frontend/src/messages), provided native text/layout does not depend on DOM metadata.
- Backend endpoint and permission model; no backend rewrite is required solely to support Expo.

### Required adapters

1. **Authentication storage/transport:** SecureStore-backed access/refresh token adapter and an explicit native refresh contract.
2. **Media selection/upload:** URI, MIME type, filename, compression, multipart construction, cancellation, progress, and retry.
3. **Navigation/deep links:** Map vehicle, broker, auth, and profile URLs to Expo Router paths; configure universal/app links.
4. **External actions:** Phone, email, WhatsApp, clipboard, share sheet, and document viewing through `Linking`/native modules.
5. **Notifications:** Add push token registration, permission handling, notification routing, and backend delivery state.
6. **Responsive information architecture:** Replace admin/broker tables and hover-driven controls with native list/detail/action flows.
7. **Theme and locale:** Replace DOM class/attribute mutation with providers and persisted native preferences.
8. **API DTO normalization:** Standardize naming and avoid exposing sensitive/admin fields in generic vehicle responses.

### Framework recommendation

**Choose React Native + Expo (the current `apps/mobile` approach).**

Reasons:

- The product has substantial native interaction needs: secure storage, camera/photo/document capture, deep links, push notifications, share/phone actions, and mobile-specific listing workflows.
- The web UI is not a thin responsive shell. It relies on DOM scrolling, browser file inputs, iframes, hover states, browser navigation, SEO tags, and large desktop dashboards.
- Expo Router, SecureStore, image/document pickers, and TanStack Query are already installed and exercised in the repository.
- A Capacitor wrapper would preserve the web DOM but would still need native plugins and would inherit desktop-oriented layout, large bundles, browser storage assumptions, and difficult iframe/file behavior. It is reasonable only for a short-lived “web parity” release, not the intended buyer/seller experience.

### Suggested delivery sequence

1. Formalize shared DTOs and a paginated vehicle/list endpoint.
2. Finish mobile buyer flows: details, inquiry, test-drive request, saved vehicles, profile, localization, and deep links.
3. Implement seller/broker listing creation/editing with native image/document upload and draft recovery.
4. Add broker lead/test-drive workflows and push notifications.
5. Treat admin as a responsive web console initially; add native admin screens only for high-value moderation actions.
6. Add contract tests for auth refresh, media upload, permission boundaries, pagination, and sensitive-field omission.
7. Validate on physical Android and iOS devices, including offline/intermittent-network behavior and large image uploads.

## Verification notes

This report is based on static inspection of the repository’s manifests, routes, API services, backend route declarations, auth middleware, database models, web DOM/browser API usage, and the existing mobile README/source. No new runtime behavior was introduced by this report.

## Implementation status after the audit

The repository now includes the first implementation pass for the mobile architecture:

- Native access and refresh tokens are persisted through SecureStore, with refresh-token rotation and explicit native-client negotiation.
- Mobile requests identify themselves with `X-Client-Platform: native`; browser responses do not expose refresh tokens in JSON.
- Vehicle list requests are capped at 50 items when a limit is supplied, and mobile list requests default to 20 items.
- Native phone, WhatsApp, and share helpers are available under [`apps/mobile/src/services/native-actions.ts`](C:/Users/dell/Documents/Feleke/car-broker-showcase/apps/mobile/src/services/native-actions.ts).
- Expo deep-link configuration is present for vehicle URLs.
- Authenticated device-token registration/unregistration endpoints are available at `POST/DELETE /api/devices`.
- Upload validation remains constrained to 10 MB per file and five files, with native URI multipart support.

Push delivery itself remains an environment integration: `expo-notifications` credentials, provider configuration, permission prompts, and server-side delivery workers are not present in this repository and should be added before production notification rollout.

Validation performed:

- `npm run typecheck --prefix apps/mobile` passed.
- `npm run build` passed for the web bundle and backend bundle.
- The existing test suite ran 116 tests; 114 passed. Two baseline failures remain in the existing demo-account assertion and database-index test timeout.
