package com.oceanview.backend.controller;

import com.google.firebase.auth.FirebaseToken;
import com.oceanview.backend.dto.LoginRequest;
import com.oceanview.backend.dto.LoginResponse;
import com.oceanview.backend.service.FirebaseAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final FirebaseAuthService authService;

    public AuthController(FirebaseAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) throws Exception {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(@RequestHeader("Authorization") String authorization) {
        FirebaseToken token = authService.verifyAuthorization(authorization);
        Map<String, Object> user = new HashMap<>();
        user.put("uid", token.getUid());
        user.put("email", token.getEmail());
        return ResponseEntity.ok(user);
    }
}
