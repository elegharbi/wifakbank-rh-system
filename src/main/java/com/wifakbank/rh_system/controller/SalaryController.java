package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.Salary;
import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.repository.SalaryRepository;
import com.wifakbank.rh_system.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/salaries")
@CrossOrigin(origins = "*")
public class SalaryController {

    private final SalaryRepository salaryRepository;
    private final UserRepository userRepository;

    public SalaryController(SalaryRepository salaryRepository, UserRepository userRepository) {
        this.salaryRepository = salaryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Salary> getAll() {
        return salaryRepository.findAll();
    }

    @PostMapping
    public Salary create(@RequestBody Salary salary) {
        if (salary.getPaymentDate() == null) {
            salary.setPaymentDate(LocalDateTime.now());
        }
        
        // Ensure the User is a managed entity attached to the persistence context
        if (salary.getUser() != null && salary.getUser().getId() != null) {
            User managedUser = userRepository.findById(salary.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
            salary.setUser(managedUser);
        } else {
            throw new RuntimeException("L'utilisateur (employé) est obligatoire pour générer la paie.");
        }
        
        return salaryRepository.save(salary);
    }
}

