# Party Kingdom — React Native App

Real Expo/React Native project ported from the HTML prototype. This is the
first working version — not a mockup. Booking, Open Jump tickets, and (once
you wire it up) the waiver submission all run as actual code you can install
on a phone via Expo Go.

## What's real vs. what's a placeholder

**Real / working:**
- Full navigation (bottom tabs: Home, Book, Waiver + a stack for Open Jump,
  Ultimate Bash, Team Parties, Field Trips)
- The `LilyPadWebView` component genuinely loads LilyPad's hosted pages
  inside a native WebView — this is not a simulation, `react-native-webview`
  renders a real browser engine
- Booking price calculation (weekday/weekend rates, Sunday tier pricing,
  extra-kid fees, add-ons) — all pulled from the real pricing on
  partykingdomchino.com/birthday-parties
- A real native signature pad on the Waiver screen (`react-native-signature-canvas`)

**Still placeholder — do this before shipping:**
1. **Waiver legal text** — `src/screens/WaiverScreen.js` has clearly-marked
   placeholder copy. Swap for Party Kingdom's actual attorney-reviewed waiver.
2. **Success-URL detection** — `LilyPadWebView.js` watches for URLs containing
   `thank-you`, `confirmation`, `success`, or `receipt` to know when a
   LilyPad checkout finished. Walk through a real booking and a real ticket
   purchase, note the actual confirmation URL LilyPad redirects to, and
   tighten that match.
3. **Date picker** — the party-date field on the Book screen is a plain text
   input (`YYYY-MM-DD`) so this runs without extra native config. Swap in
   `@react-native-community/datetimepicker` for a real calendar UI.
4. **Waiver/booking backend** — nothing currently persists a signed waiver
   or booking details anywhere. Decide whether that data goes to a Party
   Kingdom backend, a spreadsheet, or straight into LilyPad, then wire
   `WaiverScreen`'s `handleSubmit` and `BookScreen`'s `handleWebviewSuccess`
   accordingly.
5. **LilyPad URLs** — confirm both URLs below still match what's live before
   you ship:
   - Booking: `https://partykingdom.lilypadpos.app/public/onlinebooking/step1.php`
   - Open Jump tickets: `https://lilypadpos9.com/partykingdom/onlinesales/tickets1.php`

## Running it

You'll need Node.js installed. Then:

```bash
cd PartyKingdomApp
npm install
npx expo start
```

This prints a QR code. Install **Expo Go** from the App Store or Play Store
on your phone, scan the code, and the app opens live — no Xcode or Android
Studio required for this stage.

To eventually publish to the App Store / Play Store as a standalone app
(rather than running inside Expo Go), you'll use `eas build` — that's a
later step once the app itself is where you want it.

## Project structure

```
PartyKingdomApp/
├── App.js                       # Entry point
├── app.json                     # Expo config (name, icon, splash)
├── src/
│   ├── theme/colors.js          # Brand palette (green/purple from the logo)
│   ├── navigation/index.js      # Tab bar + stack navigation
│   ├── components/
│   │   ├── UI.js                # Shared PageHeader, PrimaryButton, Card, etc.
│   │   └── LilyPadWebView.js    # Reusable third-party checkout embed
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── BookScreen.js        # 4-step booking flow + LilyPad handoff
│   │   ├── WaiverScreen.js      # Form + native signature pad
│   │   ├── OpenJumpScreen.js    # + LilyPad ticket purchase handoff
│   │   ├── UltimateBashScreen.js
│   │   ├── TeamPartiesScreen.js
│   │   └── FieldTripsScreen.js
│   └── assets/
│       ├── logo.png             # Transparent Party Kingdom logo
│       └── jump-banner.jpg
```

## Why WebView instead of trying to call a LilyPad API

Party Kingdom doesn't have backend access to LilyPad — it's a third-party
point-of-sale system, accessed the same way the main website does: an
embedded page. `react-native-webview` is the native-app equivalent of that
iframe, except it's a full native browser engine rather than a sandboxed
frame, so it doesn't run into the `X-Frame-Options` issues an actual iframe
sometimes hits. The header/tab bar around it stays fully native; only the
checkout step itself is LilyPad's own page.
