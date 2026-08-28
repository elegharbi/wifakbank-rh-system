package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    // Get current authenticated user's profile
    @GetMapping("/me")
    public ResponseEntity<User> getMyProfile(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // Update current authenticated user's profile (excluding password)
    @PutMapping("/me")
    public ResponseEntity<User> updateMyProfile(@RequestBody User updated, Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        User existing = userService.getUserById(userId);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        // Update mutable fields (example: firstName, lastName, phone, department)
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setPhone(updated.getPhone());
        existing.setDepartment(updated.getDepartment());
        // Profile image handling would be via separate multipart endpoint (not implemented here)
        User saved = userService.updateUser(existing);
        return ResponseEntity.ok(saved);
    }
}
