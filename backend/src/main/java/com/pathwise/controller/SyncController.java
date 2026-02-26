package com.pathwise.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.io.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
public class SyncController {

    private static final String DATA_FILE = "pathwise_data.json";
    private final ObjectMapper objectMapper;

    public SyncController() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    // Upload/sync data from frontend to backend
    @PostMapping("/upload")
    public ResponseEntity<?> uploadData(@RequestBody Map<String, Object> data) {
        try {
            // Save to file
            objectMapper.writeValue(new File(DATA_FILE), data);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Data synced successfully");
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to sync data: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // Download/fetch all data from backend
    @GetMapping("/download")
    public ResponseEntity<?> downloadData() {
        try {
            File file = new File(DATA_FILE);
            if (file.exists()) {
                Map<String, Object> data = objectMapper.readValue(file, Map.class);
                return ResponseEntity.ok(data);
            } else {
                // Return empty data structure if no file exists
                Map<String, Object> emptyData = new HashMap<>();
                emptyData.put("users", new ArrayList<>());
                emptyData.put("meetings", new ArrayList<>());
                emptyData.put("chats", new ArrayList<>());
                emptyData.put("testResults", new ArrayList<>());
                emptyData.put("interestAssessments", new ArrayList<>());
                emptyData.put("studentNotes", new ArrayList<>());
                emptyData.put("groups", new ArrayList<>());
                return ResponseEntity.ok(emptyData);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch data: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // Merge data - combines local and server data
    @PostMapping("/merge")
    public ResponseEntity<?> mergeData(@RequestBody Map<String, Object> localData) {
        try {
            File file = new File(DATA_FILE);
            Map<String, Object> serverData;
            
            if (file.exists()) {
                serverData = objectMapper.readValue(file, Map.class);
            } else {
                serverData = new HashMap<>();
            }
            
            // Merge users - use ID to avoid duplicates
            List<Map<String, Object>> localUsers = (List<Map<String, Object>>) localData.getOrDefault("users", new ArrayList<>());
            List<Map<String, Object>> serverUsers = (List<Map<String, Object>>) serverData.getOrDefault("users", new ArrayList<>());
            
            Map<Object, Map<String, Object>> mergedUsers = new LinkedHashMap<>();
            
            // Add server users first
            for (Map<String, Object> user : serverUsers) {
                Object id = user.get("id");
                if (id != null) {
                    mergedUsers.put(id, user);
                }
            }
            
            // Add/update with local users
            for (Map<String, Object> user : localUsers) {
                Object id = user.get("id");
                if (id != null) {
                    // If user exists, check which is newer based on createdAt or updatedAt
                    if (mergedUsers.containsKey(id)) {
                        Map<String, Object> existing = mergedUsers.get(id);
                        // Keep the one with more data or more recent update
                        if (user.size() > existing.size()) {
                            mergedUsers.put(id, user);
                        }
                    } else {
                        mergedUsers.put(id, user);
                    }
                }
            }
            
            // Similarly merge other collections
            Map<String, Object> mergedData = new HashMap<>();
            mergedData.put("users", new ArrayList<>(mergedUsers.values()));
            mergedData.put("meetings", mergeListById(
                (List<Map<String, Object>>) localData.getOrDefault("meetings", new ArrayList<>()),
                (List<Map<String, Object>>) serverData.getOrDefault("meetings", new ArrayList<>())
            ));
            mergedData.put("chats", mergeListById(
                (List<Map<String, Object>>) localData.getOrDefault("chats", new ArrayList<>()),
                (List<Map<String, Object>>) serverData.getOrDefault("chats", new ArrayList<>())
            ));
            mergedData.put("testResults", mergeListById(
                (List<Map<String, Object>>) localData.getOrDefault("testResults", new ArrayList<>()),
                (List<Map<String, Object>>) serverData.getOrDefault("testResults", new ArrayList<>())
            ));
            mergedData.put("interestAssessments", mergeListById(
                (List<Map<String, Object>>) localData.getOrDefault("interestAssessments", new ArrayList<>()),
                (List<Map<String, Object>>) serverData.getOrDefault("interestAssessments", new ArrayList<>())
            ));
            mergedData.put("studentNotes", mergeListById(
                (List<Map<String, Object>>) localData.getOrDefault("studentNotes", new ArrayList<>()),
                (List<Map<String, Object>>) serverData.getOrDefault("studentNotes", new ArrayList<>())
            ));
            mergedData.put("groups", mergeListById(
                (List<Map<String, Object>>) localData.getOrDefault("groups", new ArrayList<>()),
                (List<Map<String, Object>>) serverData.getOrDefault("groups", new ArrayList<>())
            ));
            
            // Save merged data
            objectMapper.writeValue(file, mergedData);
            
            return ResponseEntity.ok(mergedData);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to merge data: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    // Helper to merge lists by ID
    private List<Map<String, Object>> mergeListById(List<Map<String, Object>> local, List<Map<String, Object>> server) {
        Map<Object, Map<String, Object>> merged = new LinkedHashMap<>();
        
        for (Map<String, Object> item : server) {
            Object id = item.get("id");
            if (id != null) {
                merged.put(id, item);
            }
        }
        
        for (Map<String, Object> item : local) {
            Object id = item.get("id");
            if (id != null) {
                merged.put(id, item);
            }
        }
        
        return new ArrayList<>(merged.values());
    }
}
