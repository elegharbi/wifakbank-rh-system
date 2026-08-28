package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
    
    @GetMapping
    public Page<User> getPaginatedUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userService.getPaginatedUsers(search, pageable);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return userService.updateUser(user);
    }

    // Hard Delete
    @DeleteMapping("/{id}/hard")
    public void hardDeleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
    
    // Soft Delete
    @DeleteMapping("/{id}")
    public void softDeleteUser(@PathVariable Long id) {
        userService.softDeleteUser(id);
    }
    
    // Block/Unblock User
    @PutMapping("/{id}/toggle-status")
    public User toggleStatus(@PathVariable Long id) {
        return userService.toggleBlockStatus(id);
    }
}

