# Ocean View Resort — Reservation System

A React-based, mobile-responsive web application for **Ocean View Resort**, Galle, to manage room reservations and guest records. It uses **Firebase** (Authentication and Firestore) for secure access and data storage.

## Features

1. **User Authentication (Login)** — Username (email) and password for secure staff access.
2. **Add New Reservation** — Store guest and booking details (reservation number, guest name, address, contact number, room type, check-in, check-out).
3. **Display Reservation Details** — Retrieve and display full booking information by reservation number.
4. **Calculate and Print Bill** — Compute total stay cost (nights × room rate + 10% tax) and print a bill.
5. **Help Section** — Guidelines for staff on using the system.
6. **Exit System** — Safe sign-out and session close.

Additional: **Dashboard** with quick actions and recent reservations list.

## Tech Stack

- **React** 18 with React Router 6
- **Firebase**: Authentication (email/password), Firestore (reservations, staff)
- Mobile-responsive layout and touch-friendly UI

## Prerequisites

- Node.js 18+ and npm
- A Firebase project ([Firebase Console](https://console.firebase.google.com))

## Setup

### 1. Clone / open project and install dependencies

```bash
cd ocean-view-resort
npm install
```

### 2. Firebase project configuration

1. Create a project in [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** → **Sign-in method** → **Email/Password** (Enable).
3. Create a **Firestore Database** (start in test mode for development; secure rules for production).
4. In **Project settings** → **Your apps**, add a **Web app** and copy the config object.

### 3. Environment variables

Copy the example env file and fill in your Firebase config:

```bash
cp .env.example .env
```

Edit `.env` and set (use the **exact** values from Firebase Console; no quotes, no spaces around `=`):

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**Important:** Use the API key from **Firebase Console** → Project settings (gear) → **Your apps** → your Web app → config (`apiKey`). Do **not** use a key created only in Google Cloud Console unless you copied it from the Firebase Web app config.

### 4. Firestore security rules (required)

1. Open [Firebase Console](https://console.firebase.google.com) → your project → **Firestore Database** → **Rules**.
2. Replace the rules with the following and click **Publish** (otherwise writes will be denied):

**Secure rules (use when Firebase Auth is working):**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reservations/{id} {
      allow read, write: if request.auth != null;
    }
    match /staff/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;
    }
  }
}
```

**If you still get "Permission denied" (development only):**  
Your Firebase Auth session may be invalid even though the app shows you as logged in. To get the app working for local development, you can **temporarily** use these rules. ⚠️ **Do not use in production** — they allow anyone to read/write your data.

1. Firebase Console → **Firestore** → **Rules**.
2. Replace with the rules below and click **Publish**.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reservations/{id} {
      allow read, write: if true;
    }
    match /staff/{userId} {
      allow read, write: if true;
    }
  }
}
```

3. Save a reservation again — it should succeed.  
4. When you fix API key restrictions and auth works properly, switch back to the **secure rules** above.

### 5. Create the first staff user

1. **Authentication** → **Users** → **Add user**: add an email and password (this is the staff “username” and password).
2. Copy the new user’s **User UID**.
3. **Firestore** → **Start collection** → Collection ID: `staff` → Document ID: paste the **User UID** → Add field: `role` (string): `staff` → Save.

Only users who have a document in the `staff` collection can log in; others get “Access denied.”

### 6. (Optional) Firestore indexes

If you use the provided `firestore.indexes.json`, deploy indexes:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# Then deploy: firebase deploy --only firestore:indexes
```

If a query fails in the app, the Firebase Console will prompt you to create the required index; you can do it from there.

### 7. Run the app

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). Log in with the staff email and password you created.

## Room rates (LKR per night)

- Standard: 8,500  
- Deluxe: 12,000  
- Suite: 18,000  
- Family: 15,000  

Tax: 10% on subtotal.

## Project structure (main)

- `src/App.js` — Routes and protected route wrapper  
- `src/context/AuthContext.js` — Auth state  
- `src/firebase/config.js` — Firebase app, auth, Firestore  
- `src/firebase/authService.js` — Login, logout, auth subscription  
- `src/firebase/reservationService.js` — Reservations and bill logic  
- `src/components/Layout.js` — Header, nav, outlet (mobile menu)  
- `src/pages/` — Login, Dashboard, AddReservation, ViewReservation, Bill, Help  

## Documentation (diagrams)

In the `docs` folder at the project root:

- **USE_CASE_DIAGRAM.md** — Use cases and PlantUML for use case diagram  
- **CLASS_DIAGRAM.md** — Classes and PlantUML for class diagram  
- **SEQUENCE_DIAGRAM.md** — Sequence diagrams (Login, Add Reservation, View Reservation, Calculate Bill, Exit)  

## Build for production

```bash
npm run build
```

Serve the `build` folder with any static host (e.g. Firebase Hosting, Netlify, Vercel).

## Troubleshooting

### "Missing or insufficient permissions" when saving a reservation

1. **Publish Firestore rules**  
   Firebase Console → **Firestore** → **Rules** → paste the rules from section 4 above → **Publish**. If rules are not published, all writes are denied.

2. **Your session may be invalid**  
   The app can show you as logged in even when Firebase Auth has cleared the session (e.g. after a token refresh failure). Firestore then sees no authenticated user and denies the write.  
   **Fix:** In Google Cloud Console, ensure your API key allows **Identity Toolkit API** (and avoid blocking token refresh). Then in the app, click **Exit System** and sign in again. After that, saving a reservation should work.

### "auth/api-key-not-valid" or "Please pass a valid API key"

1. **Use the Web app key from Firebase**  
   In [Firebase Console](https://console.firebase.google.com) → your project → **Project settings** (gear) → **General** → **Your apps** → select your **Web** app. Copy the `apiKey` from the `firebaseConfig` object (or "Config" snippet). Paste that **exact** value into `.env` as `REACT_APP_FIREBASE_API_KEY=...`. Do not use a key from **Google Cloud Console → Credentials** unless it is the same key shown for your Firebase Web app.

2. **Check API key restrictions**  
   In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → select your Firebase project → **Credentials** → open the API key used by your Web app.  
   - Under **Application restrictions**: if set to "HTTP referrers", add `http://localhost:3000/*` and `http://127.0.0.1:3000/*` so local development works.  
   - Under **API restrictions**: if "Restrict key" is on, ensure **Identity Toolkit API** (Firebase Auth) is in the list. Or use "Don't restrict key" for development.

3. **Enable Identity Toolkit API**  
   In [Google Cloud Console](https://console.cloud.google.com/apis/library) → search "Identity Toolkit API" → enable it for your project.

4. **No quotes or spaces in `.env`**  
   Use `REACT_APP_FIREBASE_API_KEY=AIza...` not `REACT_APP_FIREBASE_API_KEY="AIza..."`. Restart the dev server after changing `.env`.

## License

For educational / assignment use as required.
