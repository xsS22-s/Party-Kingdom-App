# Enable Party Kingdom app accounts

The app is ready to connect to Supabase Auth and its database. No backend was
created or deployed while preparing this project. Until you configure it, guest
My Visits works and the Account screen explains that sign-in is not available.
These are separate app accounts, not LilyPad accounts.

## 1. Create the account service

Create a dedicated Supabase project owned by Party Kingdom at
https://supabase.com/dashboard. Keep the database password private. You do not
need to change the website hosting or LilyPad account to do this.

## 2. Create the visits table and access rules

Open the project's SQL Editor, paste all of `supabase/setup.sql`, and run it once.
Use a fresh project: the script deliberately fails if the table already exists
rather than overwriting an existing database.

The script creates a visits table with per-user row-level security and a
`delete_my_account` function. Each signed-in user can read/change only rows with
their own user ID. Deleting an app account removes its profile and account visits.
It does not delete LilyPad records or guest visits saved on a phone.

## 3. Configure email codes

Enable the Email provider and allow new users to sign up. Keep email confirmation
enabled. This app uses emailed numeric codes, not passwords or email callback
links, so there is no custom app deep-link setup required for sign-in.

In Authentication → Email Templates, put the following code-based content in
**Magic Link**. Also update **Confirm signup** to show the code, so both new and
returning-user emails can be completed inside the app:

```html
<h2>Your Party Kingdom sign-in code</h2>
<p>Enter this code in the Party Kingdom app:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>If you did not request this code, you can ignore this email.</p>
```

Use a 6-digit code for this setup (the app also accepts 8-digit codes). Choose a
reasonable expiry such as 10 minutes. The app waits 60 seconds before allowing
resends, and Supabase applies its own server-side rate limits.

Set up **custom SMTP** for real customers. Supabase's default email service is
restricted to approved project-team addresses and has low limits; it is not a
production email sender. Configure your sender domain and SMTP credentials in
Supabase, never in the app or GitHub. Test delivery and spam-folder placement
with both a new address and an existing account.

## 4. Connect the app

Copy the project's URL and its **publishable key** (or legacy **anon** public key)
from Supabase's project connection/API settings. Edit:

`src/config/account.js`

```js
export const ACCOUNT_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  publicKey: 'YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY',
};
```

A public client key is designed to be included in an app, provided the SQL access
rules above are in place. Never use a `service_role`, `sb_secret_...` key, database
password, or SMTP password here. Do not paste those secrets into chat or Snack.

Copy the same configuration file into Snack and reload Expo Go. When requesting a
code, an unverified account may be created by the auth service; the app only signs
the user in after Supabase successfully verifies their code.

## 5. Test with two accounts before sharing

- Create account A by requesting and verifying an email code. Set its name and
  optional phone number. Save a visit.
- Close/reopen the app. A's session and profile should restore, and its visits
  should load when online. On a second phone, sign in to A and refresh My Visits.
- Sign out, create account B, and confirm A's visits/profile are not displayed.
- In a controlled API test using B's access token, try selecting/updating/deleting
  A's visit ID and inserting a row with A's user ID. RLS must deny those actions
  (reads/updates/deletes may return no rows). Never use an admin key for this test.
- Try a wrong/expired code, an unavailable network, and a resend. The app should
  show an error and never treat a failed verification as a successful sign-in.
- Delete B through Account → Delete my app account. Verify B's auth user and visits
  disappear in Supabase. A and local guest visits must remain intact.

## How data and reminders work

- Guest visits: stored on the device with AsyncStorage. No name/phone is collected
  in guest mode. Guest visits do not automatically move into an account.
- Account profile: name and optional phone stored in the authenticated user's
  Supabase metadata. Email is managed by Supabase Auth.
- Account visits: stored in Supabase under that user's ID; internet is required to
  load or change them. No offline cloud-write queue is included.
- Native sign-in tokens: stored in encrypted Expo SecureStore in small chunks;
  browser-preview sessions use sessionStorage. Clearing app/browser storage or
  reinstalling can remove local data. This is not a backup for guest visits.
- Reminders: local phone notifications. They are refreshed when the app opens or
  returns to the foreground and when visits change. Other devices need to open
  or refresh to receive edits/removal. There is no server push or background sync.
- Switching accounts/signing out cancels reminders belonging to the previous
  account on this phone; opening the new account schedules its eligible reminders.
- Closing an app with already-scheduled reminders does not require a server to
  deliver them, but OS permissions/settings govern notification delivery.
- Visit dates use America/Los_Angeles, including daylight-saving changes. Invalid,
  nonexistent, or ambiguous clock-change times are rejected.
- Nothing reads bookings from LilyPad, changes a booking, or fills LilyPad forms.

Before public release, finish the SDK upgrade/release process, configure an email
sender, publish an accurate privacy policy covering this account data, and test
notification delivery, account deletion, and RLS on real devices/backend.

Official references:
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/quickstarts/react-native
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://docs.expo.dev/versions/latest/sdk/notifications/
- https://docs.expo.dev/versions/latest/sdk/securestore/
