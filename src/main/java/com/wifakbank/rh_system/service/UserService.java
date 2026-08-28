package com.wifakbank.rh_system.service;

import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Page<User> getPaginatedUsers(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return userRepository.searchUsers(search, pageable);
        }
        return userRepository.findAll(pageable);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User createUser(User user) {
        // Dans un vrai projet, il faudrait hasher le mot de passe ici avec BCrypt
        return userRepository.save(user);
    }

    public User updateUser(User userDetails) {
        User user = userRepository.findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (userDetails.getFirstName() != null) user.setFirstName(userDetails.getFirstName());
        if (userDetails.getLastName() != null) user.setLastName(userDetails.getLastName());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
        if (userDetails.getPhone() != null) user.setPhone(userDetails.getPhone());
        if (userDetails.getProfileImage() != null) user.setProfileImage(userDetails.getProfileImage());
        if (userDetails.getUsername() != null) user.setUsername(userDetails.getUsername());
        if (userDetails.getDepartment() != null) user.setDepartment(userDetails.getDepartment());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
        if (userDetails.getActive() != null) user.setActive(userDetails.getActive());
        if (userDetails.getRoleEntity() != null) user.setRoleEntity(userDetails.getRoleEntity());
        
        return userRepository.save(user);
    }

    public void deleteUser(Long id) { // Hard Delete
        userRepository.deleteById(id);
    }
    
    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setDeleted(true);
        userRepository.save(user);
    }
    
    public User toggleBlockStatus(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!Boolean.TRUE.equals(user.getActive()));
        return userRepository.save(user);
    }
}

