package com.wifakbank.rh_system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/hr-managers")
@PreAuthorize("hasRole('ADMIN')")
public class HRManagerController {

    private static final List<Map<String, String>> managers = new ArrayList<>();

    static {
        // Sample data
        Map<String, String> m1 = new HashMap<>();
        m1.put("name", "Directeur Ressources Humaines");
        m1.put("username", "rh");
        m1.put("email", "rh@wifakbank.com");
        m1.put("department", "Direction des Ressources Humaines");
        managers.add(m1);
        Map<String, String> m2 = new HashMap<>();
        m2.put("name", "Directeur Ressources Humaines");
        m2.put("username", "rh_user");
        m2.put("email", "rh@wifakbank.tn");
        m2.put("department", "Ressources Humaines");
        managers.add(m2);
    }

    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addManager(@RequestBody Map<String, String> payload) {
        managers.add(payload);
        return ResponseEntity.ok(Collections.singletonMap("message", "HR manager added"));
    }

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, String>>> listManagers() {
        return ResponseEntity.ok(managers);
    }
}
