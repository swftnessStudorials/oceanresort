package com.oceanview.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentSnapshot;
import com.oceanview.backend.dto.LoginRequest;
import com.oceanview.backend.dto.LoginResponse;
import com.oceanview.backend.exception.ApiException;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FirebaseAuthService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Firestore firestore;

    public FirebaseAuthService(Firestore firestore) {
        this.firestore = firestore;
    }

    public LoginResponse login(LoginRequest req) throws Exception {
        if (req.getEmail() == null || req.getEmail().isBlank() || req.getPassword() == null || req.getPassword().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        String apiKey = System.getenv("FIREBASE_WEB_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "FIREBASE_WEB_API_KEY is not configured");
        }

        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + apiKey;
        Map<String, Object> body = new HashMap<>();
        body.put("email", req.getEmail().trim());
        body.put("password", req.getPassword());
        body.put("returnSecureToken", true);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response;
        try {
            response = restTemplate.postForEntity(url, entity, String.class);
        } catch (HttpStatusCodeException ex) {
            String reason = extractFirebaseError(ex.getResponseBodyAsString());
            if ("INVALID_LOGIN_CREDENTIALS".equals(reason) || "EMAIL_NOT_FOUND".equals(reason) || "INVALID_PASSWORD".equals(reason)) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
            }
            if ("INVALID_API_KEY".equals(reason) || "API_KEY_INVALID".equals(reason) || reason.toUpperCase().contains("API KEY")) {
                throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Firebase API key is invalid for this project. Ensure FIREBASE_WEB_API_KEY matches the same Firebase project as the service account file.");
            }
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Firebase auth failed: " + reason);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication request failed");
        }

        JsonNode json = objectMapper.readTree(response.getBody());
        String idToken = json.path("idToken").asText(null);
        String localId = json.path("localId").asText(null);
        String email = json.path("email").asText(req.getEmail());

        if (idToken == null || localId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication failed");
        }

        String role = "staff";
        DocumentSnapshot staffDoc = firestore.collection("staff").document(localId).get().get();
        if (staffDoc.exists() && staffDoc.contains("role")) {
            role = String.valueOf(staffDoc.get("role"));
        }

        Map<String, Object> user = new HashMap<>();
        user.put("uid", localId);
        user.put("email", email);
        user.put("role", role);

        return new LoginResponse(idToken, user);
    }

    public FirebaseToken verifyAuthorization(String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Missing bearer token");
            }
            String token = authHeader.substring(7).trim();
            if (token.isEmpty()) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid bearer token");
            }
            return FirebaseAuth.getInstance().verifyIdToken(token);
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }
    }

    private String extractFirebaseError(String body) {
        if (body == null || body.isBlank()) return "UNKNOWN_ERROR";
        try {
            JsonNode json = objectMapper.readTree(body);
            return json.path("error").path("message").asText("UNKNOWN_ERROR");
        } catch (Exception e) {
            return "UNKNOWN_ERROR";
        }
    }
}
