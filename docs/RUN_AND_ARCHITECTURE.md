# Ocean View Resort - Run Guide and Architecture

This document explains how to run the full system and the architecture used.

## 1) System Architecture

The project uses a 3-layer architecture:

1. React Frontend (`http://localhost:3000`)
2. Java Spring Boot Backend (`http://localhost:8080`)
3. Firebase Services (Authentication + Firestore database)

### Architecture flow

- User logs in from React UI.
- React sends `POST /api/auth/login` to Java backend.
- Java backend calls Firebase Identity Toolkit API to validate email/password.
- Backend returns Firebase ID token + user payload to frontend.
- Frontend stores session and sends `Authorization: Bearer <token>` for protected API calls.
- Backend verifies token via Firebase Admin SDK.
- Backend reads/writes reservations in Firestore.

## 2) Technologies Used

- Frontend: React 18, React Router
- Backend: Java 17, Spring Boot 3, Maven
- Database/Auth: Firebase Firestore + Firebase Authentication
- Hosting mode (development): Localhost frontend + localhost backend

## 3) Folder Structure

```text
ocean-view-resort/
|-- backend/
|   |-- pom.xml
|   |-- README.md
|   `-- src/main/
|       |-- java/com/oceanview/backend/
|       |   |-- OceanViewBackendApplication.java
|       |   |-- config/
|       |   |-- controller/
|       |   |-- dto/
|       |   |-- exception/
|       |   `-- service/
|       `-- resources/
|           `-- application.properties
|-- docs/
|   `-- RUN_AND_ARCHITECTURE.md
|-- src/
|   |-- components/
|   |-- context/
|   |-- firebase/
|   |-- pages/
|   |-- App.js
|   `-- index.js
|-- .env
|-- package.json
`-- README.md
```

## 4) Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.9+
- Firebase project (`oceanview-1cebe` or your own)
- Firebase service account JSON file

## 5) Required Environment Values

### Frontend (`ocean-view-resort/.env`)

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_FIREBASE_API_KEY=your_web_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Backend (PowerShell session variables)

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH="D:\New assignment\oceanview-1cebe-firebase-adminsdk-fbsvc-a62c0c4c3b.json"
$env:FIREBASE_WEB_API_KEY="YOUR_WEB_API_KEY"
```

## 6) How to Run the System

Open two terminals.

### Terminal 1 - Start backend

```powershell
cd "D:\New assignment\ocean-view-resort\backend"
mvn spring-boot:run
```

Verify backend:

- `http://localhost:8080/api/health` should return JSON with `status: ok`.

### Terminal 2 - Start frontend

```powershell
cd "D:\New assignment\ocean-view-resort"
npm install
npm start
```

Open:

- Frontend: `http://localhost:3000`

## 7) Common Login Issue (401)

If login gives 401:

- Confirm backend has the correct `FIREBASE_WEB_API_KEY`.
- Ensure the API key belongs to the same Firebase project as the service account file.
- In Google Cloud Console, check key restrictions and allow Identity Toolkit API.
- Restart backend after changing env values.

## 8) Deployment Note

For production:

- Move backend env values to secure server environment variables.
- Do not commit service account JSON files.
- Use strict Firestore rules and HTTPS endpoints.
