# E-commerce FE Checklist

This checklist tracks missing or in-progress features for the `e_commerce_fe_citd` frontend,
based on the project specification and the existing backend.

Use `- [x]` to mark items as done.

---

## A. Global Auth & Session Management

### A1. httpClient & Auth Session

- [ ] Add **request interceptor** on the shared Axios instance to attach `Authorization: Bearer <accessToken>` from the auth store (or localStorage).
- [ ] Add **response interceptor**:
  - [ ] If `status === 401 || status === 403`:
    - [ ] Call `logout()` from the auth store.
    - [ ] Redirect to `/login` or `/` (consistent with routing).
- [ ] Ensure the interceptor safely checks `error.response` before reading `status`.
- [ ] Verify that general API errors still propagate via `Promise.reject(error)`.

### A2. Auth Store

- [ ] Auth store state includes:
  - [ ] `user: User | null`
  - [ ] `accessToken: string | null`
  - [ ] `isLoggedIn: boolean`
- [ ] Auth store actions:
  - [ ] `setAuth({ user, accessToken })` sets state and persists the token to `localStorage`.
  - [ ] `logout()` clears user, token, and `isLoggedIn`, and removes token from `localStorage`.

### A3. useAuth Hook

- [ ] `useAuth` exposes: `user`, `accessToken`, `isLoggedIn`, `login`, `logout`, `initAuth`.
- [ ] `login(credentials)`:
  - [ ] Calls `POST /auth/login`.
  - [ ] Stores the token (temporarily or in localStorage).
  - [ ] Calls `GET /auth/me` to get the current user.
  - [ ] Calls `setAuth({ user, accessToken })`.
- [ ] `initAuth()`:
  - [ ] Reads token from store or `localStorage`.
  - [ ] If token exists, calls `GET /auth/me`.
  - [ ] On success, calls `setAuth`.
  - [ ] On 401, calls `logout()`.
- [ ] `logout()`:
  - [ ] Calls auth store `logout()`.
  - [ ] Triggers redirect to login (via navigate or location reload).

### A4. App Initialization

- [ ] In the root app component, call `initAuth()` once on mount using `useEffect`.
- [ ] Ensure `initAuth` is stable (e.g., wrapped in `useCallback`) to avoid infinite loops.

### A5. Route Guard & Role-Based Access (RequireAuth)

- [ ] Create a `RequireAuth` component:
  - [ ] Props: `allowedRoles: string[]`.
  - [ ] If not logged in → redirect to `/login?from=<currentPath>`.
  - [ ] If logged in but `user.role` not in `allowedRoles` → redirect to the correct home page based on role.
- [ ] Wrap routes in `App`:
  - [ ] `/buyer/*` → `<RequireAuth allowedRoles={["BUYER"]}>`.
  - [ ] `/seller/*` → `<RequireAuth allowedRoles={["SELLER"]}>`.
  - [ ] `/provider/*` → `<RequireAuth allowedRoles={["PROVIDER"]}>`.
  - [ ] (Later) `/admin/*` → `<RequireAuth allowedRoles={["ADMIN"]}>`.

---

## B. Auth Pages (Login / Register / Forgot / Reset)

### B1. Landing & Login

- [ ] On `LandingPage` mount:
  - [ ] If already logged in and user loaded → redirect to home based on `user.role`.
- [ ] `LoginModal` / `LoginPage`:
  - [ ] Use `useAuth().login` for login.
  - [ ] On success → redirect using `getRedirectPathForRole(user.role)`.
  - [ ] Handle backend validation errors (422/400) and map them to field errors.
  - [ ] Replace "Forgot your password?" dummy link with navigation to Forgot Password screen.

### B2. Register + OTP

- [ ] Buyer/Seller/Provider register forms:
  - [ ] Call correct endpoint: `/auth/register/buyer`, `/seller`, `/provider`.
  - [ ] Map backend validation errors to fields.
  - [ ] On success, open OTP flow with the registered email.
- [ ] OTP modal / page:
  - [ ] Call `/auth/verify-otp`.
  - [ ] On success: either auto-login (if supported by BE) or redirect to `/login` with a success message.

### B3. Forgot / Reset Password

- [ ] Create **Forgot Password** page or modal:
  - [ ] Form with `email`.
  - [ ] Call `POST /auth/forgot-password`.
  - [ ] On success, show message and navigate to Reset Password screen.
- [ ] Create **Reset Password** page:
  - [ ] Fields: `email`, `otp_code`, `new_password`, `confirm_password`.
  - [ ] Validate password confirmation on the client.
  - [ ] Call `POST /auth/reset-password`.
  - [ ] On success, redirect to `/login` and show a success message.

---

## C. Buyer Side

### C1. Buyer Home

- [ ] Protect `/buyer/home` with `RequireAuth(["BUYER"])`.
- [ ] On mount:
  - [ ] Load offers (`GET /offers`) and filter by `status === "ACTIVE"`.
  - [ ] Load buyer interests (`GET /buyer-interest/my`).
  - [ ] For each interest, load related offer or adjust BE to return embedded offers.
- [ ] Handle loading and errors (401 is handled by interceptor).

### C2. Express Interest (BuyerInterest)

- [ ] Create `buyerInterestApi`:
  - [ ] `createBuyerInterest(offerId)` → `POST /buyer-interest/{offer_id}`.
  - [ ] (Optional) `checkInterest(offerId)` → `GET /buyer-interest/check?offer_id=...` if BE supports it.
- [ ] Add "Express Interest" / "Quan tâm" button on offer cards in Buyer views (`NewOffers`, `OfferHot`, etc.).
- [ ] Disable the button if the buyer already has an interest for that offer.
- [ ] After successful interest creation, update local state or refetch buyer interests.

### C3. Buyer Offer Detail

- [ ] Create `BuyerOfferDetailPage` (route `/buyer/offers/:offerId`):
  - [ ] Load offer via `GET /offers/:offerId`.
  - [ ] Show product info, images, seller incoterm, status.
  - [ ] Show whether the buyer has already expressed interest.
  - [ ] Provide actions:
    - [ ] "Express Interest" if not yet interested.
    - [ ] "Create Service Request" (navigate to SR create page).

### C4. Service Request (Buyer)

- [ ] Create `serviceRequestApi`:
  - [ ] `createServiceRequest(payload)` → `POST /service-request`.
  - [ ] `getMyServiceRequests()` → `GET /service-request/my`.
  - [ ] `getServiceRequest(id)` → `GET /service-request/:id`.
- [ ] Create `BuyerServiceRequestCreatePage` (route e.g. `/buyer/offers/:offerId/service-request/new`):
  - [ ] Form includes `buyer_incoterm` (CFR/CIF/DAP/DDP).
  - [ ] If incoterm is DAP/DDP → require warehouse & contact fields.
  - [ ] If incoterm is CFR/CIF → hide/clear warehouse/contact fields.
  - [ ] On submit, call `createServiceRequest` and redirect to SR list or offer detail.
- [ ] Create `BuyerServiceRequestListPage` and `BuyerServiceRequestDetailPage`:
  - [ ] List SRs for the current buyer.
  - [ ] Detail page shows SR info and related offer information.

### C5. Proposals & Award

- [ ] Create API helpers to work with proposals:
  - [ ] `getProposalsByServiceRequest(id)` or similar.
  - [ ] `awardProposal(proposalId)` → `POST /proposal/:id/award`.
- [ ] Create `BuyerProposalsForServiceRequestPage`:
  - [ ] Route: `/buyer/service-requests/:id/proposals`.
  - [ ] Display a list of proposals for this SR.
  - [ ] Show provider info, prices, deadlines.
  - [ ] Add "Award" button for each proposal (only if not already awarded).
- [ ] After awarding:
  - [ ] Update proposal statuses and SR/offer status in the UI.
  - [ ] Optionally show a success message.

---

## D. Seller Side

### D1. Seller Home

- [ ] Protect `/seller/home` with `RequireAuth(["SELLER"])`.
- [ ] Load seller's offers (`GET /offers/my`).
- [ ] Compute stats by status (ACTIVE, PENDING, CLOSED, LOCKED, etc.) and pass to `SellerStats`.

### D2. Seller Offers List

- [ ] Protect `/seller/offers` with `RequireAuth(["SELLER"])`.
- [ ] Display the list of seller offers using a table or cards.
- [ ] Consider server-side filters (status, search, pagination) if BE supports it.
- [ ] Add actions per offer:
  - [ ] View details (`/seller/offers/:offerId`).
  - [ ] Edit offer (only when allowed by rules).
  - [ ] Delete / archive if BE allows seller to delete certain offers.
- [ ] Show number of buyer interests per offer (via `/buyer-interest/offer/{offer_id}/count`).
- [ ] Indicate if there are service requests linked to the offer (`/service-request/offer/{offer_id}`).

### D3. Create / Edit Offer

- [ ] Use `/upload/image` to upload images to Cloudinary:
  - [ ] Implement `uploadImage(file)` API.
  - [ ] In the image uploader component, upload each file and store `{ url, public_id }` from BE.
  - [ ] Use the Cloudinary URL for displaying images.
- [ ] Ensure payload sent to `POST /offers` includes proper `images` (Cloudinary URLs, not local blob URLs).
- [ ] Enforce validation:
  - [ ] At least 1 image and at most 5 images.
  - [ ] `cargo_ready_date` respects min date logic.
- [ ] Implement offer editing (if allowed):
  - [ ] Pre-fill form with existing data.
  - [ ] Call `PATCH /offers/:id` on submit.
  - [ ] Block editing when business rules (e.g. existing interests/SRs) forbid it.

### D4. Seller Offer Detail

- [ ] Protect `/seller/offers/:offerId` with `RequireAuth(["SELLER"])`.
- [ ] Display:
  - [ ] All offer fields and images (Cloudinary URLs).
  - [ ] Status with a badge.
  - [ ] Number of buyer interests.
  - [ ] Any lock/reject reason from Admin if available.
- [ ] Optionally, link to related Service Requests if the Seller is allowed to see them.

---

## E. Provider Side

### E1. Provider Home

- [ ] Protect `/provider/home` with `RequireAuth(["PROVIDER"])`.
- [ ] Replace mock service requests with real data from BE
  (once a provider-specific SR endpoint is available).
- [ ] Use real data to compute `openServiceRequests` and panels.

### E2. Provider Routes & Pages

- [ ] Add routes in `App`:
  - [ ] `/provider/private-offers`
  - [ ] `/provider/proposals`
  - [ ] `/provider/proposals/:id`
  - [ ] `/provider/service-requests`
- [ ] Create basic pages for each route using the existing panel components as building blocks.

### E3. Private Offer Flow

- [ ] Create `privateOfferApi`:
  - [ ] `createPrivateOffer(payload)` → `POST /private-offer`.
  - [ ] `getMyPrivateOffers()` → `GET /private-offer/my` (already in use).
- [ ] UI to create a private offer from a given SR/Offer:
  - [ ] Route like `/provider/service-requests/:id/private-offer/new`.
  - [ ] Form fields based on `PrivateOfferCreate` schema.
  - [ ] On success, navigate back to private offers list or proposals.

### E4. Proposal Flow

- [ ] Create `proposalApi`:
  - [ ] `createProposal(payload)` → `POST /proposal`.
  - [ ] `getMyProposals()` → `GET /proposal/my` (already in use).
- [ ] UI:
  - [ ] From a private offer, provide a "Send Proposal" action.
  - [ ] Proposal form for service fee, total cost, extra charges, etc.
  - [ ] After submit, update provider proposals list.

---

## F. Notifications

### F1. REST API Integration

- [ ] Create `notificationsApi`:
  - [ ] `getNotifications(params)` → `GET /notifications`.
  - [ ] `getUnreadCount()` → `GET /notifications/unread-count`.
  - [ ] `markRead(ids)` → `POST /notifications/mark-read`.

### F2. Notifications Store

- [ ] Create a Zustand store for notifications:
  - [ ] State: `items`, `unreadCount`, `isLoading`.
  - [ ] Actions: `load`, `markAsRead`, `receiveRealtimeNotification`.

### F3. WebSocket Client

- [ ] Add a `NotificationsProvider` component at a high level in the tree:
  - [ ] Connect to `/ws/notifications?token=<accessToken>`.
  - [ ] On message, parse notification and push into the notifications store.

### F4. Navbar Integration

- [ ] Replace mocked notifications in Buyer/Seller/Provider navbar:
  - [ ] Use notifications store data instead of hard-coded values.
  - [ ] Show `unreadCount` badge.
  - [ ] Call `markRead` when notifications are opened.

---

## G. User Profile

- [ ] Create `userApi`:
  - [ ] `getMe()` → `GET /users/me`.
  - [ ] `updateMe(payload)` → `PATCH /users/me`.
- [ ] Create `ProfilePage` (route `/profile`):
  - [ ] Show basic user info: name, email, role, company, phone, avatar.
  - [ ] Allow editing fields that BE permits updating.
  - [ ] Use `/upload/image` for avatar upload.
- [ ] Add "Profile" and "Logout" to the user dropdown in navbars.

---

## H. Admin (Future Work)

- [ ] Admin Offer Management:
  - [ ] List all offers.
  - [ ] Approve / lock / unlock / delete according to spec.
- [ ] Admin User Management:
  - [ ] List users, view details.
  - [ ] Activate / deactivate accounts (if supported by BE).
- [ ] Admin Dashboard:
  - [ ] Display high-level metrics (offers, users, proposals, etc.).

