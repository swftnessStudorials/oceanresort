package com.oceanview.backend.controller;

import com.oceanview.backend.service.FirebaseAuthService;
import com.oceanview.backend.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    private final FirebaseAuthService authService;
    private final ReservationService reservationService;

    public ReservationController(FirebaseAuthService authService, ReservationService reservationService) {
        this.authService = authService;
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll(@RequestHeader("Authorization") String authorization) throws Exception {
        authService.verifyAuthorization(authorization);
        return ResponseEntity.ok(reservationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String id) throws Exception {
        authService.verifyAuthorization(authorization);
        Map<String, Object> reservation = reservationService.getById(id);
        if (reservation == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(reservation);
    }

    @GetMapping("/by-number/{reservationNumber}")
    public ResponseEntity<Map<String, Object>> getByNumber(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String reservationNumber) throws Exception {
        authService.verifyAuthorization(authorization);
        Map<String, Object> reservation = reservationService.getByNumber(reservationNumber);
        if (reservation == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(reservation);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> add(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Map<String, Object> payload) throws Exception {
        authService.verifyAuthorization(authorization);
        String id = reservationService.add(payload);
        return ResponseEntity.ok(Map.of("id", id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) throws Exception {
        authService.verifyAuthorization(authorization);
        reservationService.update(id, payload);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) throws Exception {
        authService.verifyAuthorization(authorization);
        String status = payload.get("status") == null ? null : String.valueOf(payload.get("status"));
        reservationService.updateStatus(id, status);
        Map<String, Object> result = new HashMap<>();
        result.put("ok", true);
        result.put("status", status);
        return ResponseEntity.ok(result);
    }
}
