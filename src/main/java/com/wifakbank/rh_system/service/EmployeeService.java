package com.wifakbank.rh_system.service;

import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployeeService {

    private final UserRepository userRepository;

    public EmployeeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllEmployees() {
        return userRepository.findAll();
    }

    public User getEmployeeById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User saveEmployee(User employee) {
        return userRepository.save(employee);
    }

    public List<java.util.Map<String, Object>> getStatsByDepartment() {
        return userRepository.countUsersByDepartment();
    }

    public void deleteEmployee(Long id) {
        userRepository.deleteById(id);
    }
}

