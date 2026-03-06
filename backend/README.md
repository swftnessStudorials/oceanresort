# Ocean View Resort Backend (Java)

Spring Boot backend that uses Firebase for:
- Email/password login (Firebase Auth REST API)
- Reservation CRUD (Firestore via Firebase Admin SDK)

## Requirements

- Java 17+
- Maven 3.9+
- Firebase service account JSON file
- Firebase Web API key (`apiKey` from Firebase Console web app config)

## Environment Variables

Set these before running:

```
FIREBASE_SERVICE_ACCOUNT_PATH=D:\path\to\serviceAccountKey.json
FIREBASE_WEB_API_KEY=your_firebase_web_api_key
```

## Run

```bash
cd backend
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

Health endpoint: `http://localhost:8080/api/health`
