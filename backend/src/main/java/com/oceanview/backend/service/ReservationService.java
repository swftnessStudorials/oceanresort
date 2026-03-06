package com.oceanview.backend.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.oceanview.backend.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReservationService {
    private final Firestore firestore;
    private static final String COLLECTION = "reservations";

    public ReservationService(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Map<String, Object>> getAll() throws Exception {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION).orderBy("createdAt", Query.Direction.DESCENDING).get();
        List<QueryDocumentSnapshot> docs = future.get().getDocuments();
        List<Map<String, Object>> result = new ArrayList<>();
        for (QueryDocumentSnapshot doc : docs) {
            result.add(toMap(doc));
        }
        return result;
    }

    public Map<String, Object> getById(String id) throws Exception {
        DocumentSnapshot doc = firestore.collection(COLLECTION).document(id).get().get();
        if (!doc.exists()) return null;
        return toMap(doc);
    }

    public Map<String, Object> getByNumber(String number) throws Exception {
        Query query = firestore.collection(COLLECTION).whereEqualTo("reservationNumber", number).limit(1);
        QuerySnapshot snapshot = query.get().get();
        if (snapshot.isEmpty()) return null;
        return toMap(snapshot.getDocuments().get(0));
    }

    public String add(Map<String, Object> data) throws Exception {
        validatePayload(data, true);
        data.put("status", "confirmed");
        data.put("createdAt", FieldValue.serverTimestamp());
        DocumentReference ref = firestore.collection(COLLECTION).add(data).get();
        return ref.getId();
    }

    public void update(String id, Map<String, Object> data) throws Exception {
        validatePayload(data, false);
        data.put("updatedAt", FieldValue.serverTimestamp());
        firestore.collection(COLLECTION).document(id).update(data).get();
    }

    public void updateStatus(String id, String status) throws Exception {
        if (status == null || status.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "status is required");
        }
        Map<String, Object> update = new HashMap<>();
        update.put("status", status.trim().toLowerCase());
        update.put("updatedAt", FieldValue.serverTimestamp());
        firestore.collection(COLLECTION).document(id).update(update).get();
    }

    private void validatePayload(Map<String, Object> data, boolean includeNumber) {
        List<String> required = new ArrayList<>(List.of(
                "guestName", "address", "contactNumber", "roomType", "checkIn", "checkOut"
        ));
        if (includeNumber) required.add("reservationNumber");

        for (String key : required) {
            Object value = data.get(key);
            if (value == null || String.valueOf(value).trim().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, key + " is required");
            }
        }
    }

    private Map<String, Object> toMap(DocumentSnapshot doc) {
        Map<String, Object> map = new HashMap<>(doc.getData() == null ? Map.of() : doc.getData());
        map.put("id", doc.getId());
        normalizeTimestamp(map, "createdAt");
        normalizeTimestamp(map, "updatedAt");
        return map;
    }

    private void normalizeTimestamp(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v instanceof Timestamp ts) {
            map.put(key + "Millis", ts.toDate().getTime());
            map.put(key, ts.toDate().toInstant().toString());
        }
    }
}
