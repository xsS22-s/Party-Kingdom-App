# Party Kingdom — My Visits and Accounts

This is the full updated project, including all screens and the earlier LilyPad
integration. It does not update your local folder, GitHub, or Snack automatically.

## What's new

- **My Visits** tab: add, edit, and remove personal visit plans; upcoming/past views;
  optional booking reference; reminders 2 days, 1 day, or 2 hours before a visit.
- **Account** tab: email-code sign-up/sign-in, saved name/phone, sign-out, and
  self-service account deletion. Cloud account visits are separate from guest visits.
- **Booking / Waiver**: the LilyPad address line is removed. Back, Close, and the
  external-browser fallback remain. LilyPad still handles all actual forms,
  payments, signatures, and confirmation pages.
- Earlier changes remain: “Welcome back!” greeting and no Bingo Thursdays section.

## What works before backend setup

Guest My Visits saves on your phone. Local reminders ask permission when selected
and are scheduled on that phone. Signing in requires a configured account service.
No mock users or simulated account creation are included.

Read **ACCOUNT_SETUP.md** to connect a Party Kingdom-owned Supabase project. The
SQL is in **supabase/setup.sql**, and the two public client configuration values
belong in **src/config/account.js**. No backend was provisioned by this update.

## Apply to your project and Snack

1. Back up your current working local project and Snack.
2. Merge this ZIP's **src folder contents** into your existing `src` folder,
   preserving the folder structure. Replace matching files and include the new
   `config`, `services`, and `state` folders. All nine screens are included.
3. Replace `App.js`, `app.json`, `package.json`, and `package-lock.json` in the
   project root. Keep the documentation, `supabase`, and `tests` folders in GitHub.
4. For local development run `npm ci`, then `npx expo start`.
5. Commit/push the updated source, then import into a new Snack. Keep your old
   working Snack until the new one is tested. Never upload node_modules.
6. In Snack, retain the SDK version that already works on your phone. Native
   libraries must match that Snack SDK. This ZIP preserves the uploaded project's
   SDK 51 baseline; a newer Expo Go may need a separate SDK upgrade for local use.

New libraries:

| Library | Version in this SDK 51 project | Snack note |
| --- | --- | --- |
| @supabase/supabase-js | 2.57.4 | Use this version |
| react-native-url-polyfill | 2.0.0 | Use this version |
| @react-native-async-storage/async-storage | 1.23.1 | Use the version compatible with your Snack SDK |
| expo-secure-store | ~13.0.2 | Use the version compatible with your Snack SDK |
| expo-notifications | ~0.28.19 | Use the version compatible with your Snack SDK |

For a project already upgraded to a different Expo SDK, use `npx expo install`
for the three native libraries instead of copying SDK 51 versions blindly. These
are local notifications; this project does not register remote push tokens.

## Test on your phone

- Open Book and Waiver: no LilyPad hostname line should appear in the native
  header. The hosted page's own branding is unchanged. Back/Close/browser work.
- Add a guest visit for a future California date and time. Close/reopen the app:
  the visit should still be there. Edit it, then remove it.
- To test a reminder soon, choose a visit 2 hours and a few minutes from now in
  California time, with “2 hours before.” Allow notifications, background the
  app, and wait for the reminder. Respect differences in device settings/OS delays.
- Change the visit time: the old reminder should be replaced, not duplicated.
- Deny permission: the visit still saves, and the screen explains reminders are
  disabled. Enable them with the button or phone settings and return to the app.
- Refresh after a network outage. Guest visits remain local; account visits need
  internet. A failed cloud save must not be shown as a successful save.
- Complete the two-account, email-code, deletion, and RLS tests in ACCOUNT_SETUP.md
  after configuring the backend.

## Behavior and limits

- These are manually entered plans, not verified bookings or admission tickets.
  A LilyPad booking/reschedule/cancellation does not automatically change My Visits.
- Visits use California time even when the phone is in another time zone. Date
  input is YYYY-MM-DD; time is 24-hour HH:mm. Invalid dates and DST gaps/ambiguity
  are rejected. No reminder can be scheduled for a time already in the past.
- The app caps new visits at 50 per active list. Remove old visits as needed.
- Guest and account visits are deliberately separate. Sign out to see guest visits.
  Guest data is not automatically uploaded to an account.
- Account profile and visits sync through Supabase. This is independent of LilyPad;
  there is no autofill, single sign-on, or access to LilyPad customer records.
- Notification edits/removals made on another phone reach this phone when it next
  opens/refreshes the app. There is no background server-push synchronization.
- Sign-out/account changes remove the previous account's reminders on this phone.
  Existing reminders for the current account survive an offline cold start.
- Only native local notifications are implemented. Browser preview cannot deliver
  these phone reminders. Test on real iOS and Android devices before releasing.

## Automated validation

Run `npm test`. Tests cover California/DST date validation, encrypted session
storage and rollback, notification reconciliation, guest persistence/failure,
account separation, OTP error handling, and the updated shell. Native APIs and
Supabase are mocked in those checks. They do not establish live email delivery,
server RLS enforcement, OS notification delivery, or payment/signature success.

Expo native exports check bundling; they are not signed app builds or device tests.

## Key files

- `src/screens/VisitsScreen.js`: visit UI and editor
- `src/screens/AccountScreen.js`: email-code login and profile UI
- `src/state/AppData.js`: account/visit state and persistence
- `src/services/reminders.js`: local notification scheduling
- `src/services/visitTime.js`: California date/time validation
- `src/services/accounts.js`, `sessionStorage.js`: auth and encrypted sessions
- `src/config/account.js`: public account-service configuration
- `supabase/setup.sql`: table, row access policies, self-service deletion
- `src/components/LilyPadWebView.js`: embedded LilyPad forms
- `src/theme/colors.js`: shared palette

Before public release, complete backend setup, device testing, and the separate
SDK/release-readiness work. Other informational prices/hours remain unchanged.
