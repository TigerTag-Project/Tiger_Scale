# Firebase Setup

## TL;DR

**You don't need to set up anything.** TigerScale connects to the **TigerTag cloud** by default, which is free to use. Just sign in with Google or email when the device asks for it.

This document explains:

1. [How TigerTag cloud works](#how-tigertag-cloud-works)
2. [What's stored, what's not](#what-is-stored)
3. [Privacy policy](#privacy)
4. [How to host your own Firebase backend (advanced)](#advanced-self-hosted)

---

## How TigerTag cloud works

```
[Your TigerScale device]
  │
  │ 1. WiFi connection
  │
  ▼
[Google Firebase] (project: tigertag-connect)
  ├── Firebase Auth
  │   └── Verifies your identity (Google / email)
  │   └── Returns an idToken + refreshToken
  │
  ├── Firestore Database
  │   └── users/{your_uid}/inventory/{spool_uid}    ← spool data
  │   └── users/{your_uid}/scales/{device_mac}      ← scale heartbeat
  │   └── users/{your_uid}/racks/{rack_id}          ← shelf locations
  │
  └── Firebase Hosting
      └── tigertag-cdn.web.app/scale-auth.html      ← OAuth bridge
```

When you sign in:

1. The web UI on your TigerScale opens a popup to `tigertag-cdn.web.app/scale-auth.html`
2. That page (HTTPS, hosted by TigerTag) does the Google sign-in
3. Once you authorise, it sends the Firebase tokens back to your device via `postMessage`
4. Your device stores **only the refresh token** — not your password
5. The device uses that token to write to Firestore directly (REST API)

**Your password never leaves Google's servers** and never touches the ESP32.

---

## What is stored

In the TigerTag Firestore database (`tigertag-connect`):

- ✅ Your email and Firebase UID (so we can route data to your account)
- ✅ Per-spool data : RFID UID, weight, container weight, rack location, manufacturer/material/colour
- ✅ Per-scale data : MAC address, last heartbeat, Wi-Fi RSSI, current spool UIDs

In your local NVS (ESP32 flash):

- ✅ Your Wi-Fi credentials
- ✅ Your Firebase **refresh token** (long-lived)
- ✅ Your scale calibration factor and tare offset
- ❌ Your password — never. We never receive it on the device.

What we explicitly do NOT collect:

- ❌ Telemetry / analytics on the device
- ❌ Browsing history or other usage outside the scale
- ❌ Location data (we know your IP only when you're talking to Firebase, like any web service)

---

## Privacy

- Your inventory data is **private to your account** : Firestore security rules enforce that only you can read/write `users/{your_uid}/...`.
- You can **export your data** any time via the [Firebase REST API](https://firebase.google.com/docs/firestore/use-rest-api) using your idToken.
- You can **delete your account** by emailing privacy@tigertag.io. We will purge your `users/{uid}/...` documents and revoke your auth tokens.
- You can **sign out** from the web UI at any time : the device wipes your refresh token from NVS.

The TigerTag cloud is hosted on Google Cloud (Firebase) in the **us-central1** region.

---

## Advanced — Self-hosted

If you prefer not to use the TigerTag cloud (e.g. for an offline/local-only setup, or to run your own service for a fleet of scales), you can host your own Firebase project.

### Steps

1. **Create a Firebase project** at <https://console.firebase.google.com/>
2. **Enable services** :
   - Authentication → enable Google + Email/Password providers
   - Firestore → create a database (Native mode, region of your choice)
   - Hosting → set up a site (e.g. `mytiger.web.app`)
3. **Deploy the OAuth bridge** :
   ```bash
   git clone https://github.com/TigerTag-Project/TigerTag-Firebase-Backend
   cd TigerTag-Firebase-Backend
   # Edit .firebaserc to point to YOUR project ID
   firebase deploy --only hosting,firestore:rules
   ```
4. **Edit `src/main.cpp`** in the TigerScale repo:
   - Replace all occurrences of `tigertag-connect` with your project ID
   - Replace the `TIGERTAG_FIREBASE_WEB_API_KEY` constant with your project's Web API key (from Firebase Console → Project Settings → General → Web API Key)
5. **Edit `data/www/script.js`** :
   - Replace `AUTH_BRIDGE_URL` with your hosting URL (e.g. `https://mytiger.web.app/scale-auth.html`)
   - Replace `AUTH_BRIDGE_ORIGIN` accordingly
6. **Compile and flash** as usual

### Caveats

- You're responsible for Firebase costs (free tier covers most personal use)
- You'll need to add your hosting domain to **Authorized domains** in Firebase Auth → Settings
- You'll need to add your hosting URL to **Authorized JavaScript origins** in Google Cloud Console → Credentials → your OAuth Web Client

---

## Need help?

- 📚 [Firebase docs](https://firebase.google.com/docs)
- 💬 [Discord](https://discord.gg/3Qv5TSqnJH)
- 🐛 [Open an issue](https://github.com/TigerTag-Project/Tiger_Scale/issues)
