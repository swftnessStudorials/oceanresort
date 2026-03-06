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

## Java Backend (New Architecture)

The system now uses:
- **React frontend** for UI
- **Java Spring Boot backend** for authentication and reservation APIs
- **Firebase (same project)** as the database and auth provider

Frontend no longer reads/writes Firestore directly. All reservation operations go through the Java backend.

### Backend prerequisites

- Java 17+
- Maven 3.9+
- Firebase service account JSON file (from Firebase Console -> Project Settings -> Service accounts)
- Firebase Web API key (from Firebase Console -> Project Settings -> Your apps -> Web app -> `apiKey`)

### Backend environment variables

Set these before running backend:

```
FIREBASE_SERVICE_ACCOUNT_PATH=D:\path\to\serviceAccountKey.json
FIREBASE_WEB_API_KEY=your_firebase_web_api_key
```

You can use `backend/.env.example` as reference.

### Run backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts at `http://localhost:8080`.

Health check:

```bash
http://localhost:8080/api/health
```

### Frontend environment

Create/update `.env` in project root:

```
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

You can use `.env.example` as reference.

### Run frontend

```bash
cd ..
npm install
npm start
```

Frontend runs at `http://localhost:3000` and uses the Java backend for login + reservation APIs.

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

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` and set:

```
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

This tells React to call the Java backend instead of direct Firebase SDK calls.

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
- `src/firebase/authService.js` — Frontend auth session + backend login API calls  
- `src/firebase/reservationService.js` — Reservation API calls to Java backend  
- `src/components/Layout.js` — Header, nav, outlet (mobile menu)  
- `src/pages/` — Login, Dashboard, AddReservation, ViewReservation, Bill, Help  
- `backend/` — Java Spring Boot API using Firebase Admin SDK

## Documentation (diagrams)

In the `docs` folder at the project root:

- **USE_CASE_DIAGRAM.md** — Use cases and PlantUML for use case diagram  
- **CLASS_DIAGRAM.md** — Classes and PlantUML for class diagram  
- **SEQUENCE_DIAGRAM.md** — Sequence diagrams (Login, Add Reservation, View Reservation, Calculate Bill, Exit)  
- **RUN_AND_ARCHITECTURE.md** — End-to-end run instructions, architecture flow, and folder structure

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

1. **Set backend key correctly**  
   In [Firebase Console](https://console.firebase.google.com) → your project → **Project settings** (gear) → **General** → **Your apps** → select your **Web** app. Copy `apiKey` and set it in backend environment variable:
   `FIREBASE_WEB_API_KEY=...`

2. **Check API key restrictions**  
   In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → select your Firebase project → **Credentials** → open the API key used by your Web app.  
   - Under **Application restrictions**: for backend development, use no referrer restriction or allow server usage.
   - Under **API restrictions**: if "Restrict key" is on, ensure **Identity Toolkit API** (Firebase Auth) is in the list. Or use "Don't restrict key" for development.

3. **Enable Identity Toolkit API**  
   In [Google Cloud Console](https://console.cloud.google.com/apis/library) → search "Identity Toolkit API" → enable it for your project.

4. **Restart backend after changing env vars**  
   Stop and run `mvn spring-boot:run` again so new backend env values are loaded.

## License

For educational / assignment use as required.
