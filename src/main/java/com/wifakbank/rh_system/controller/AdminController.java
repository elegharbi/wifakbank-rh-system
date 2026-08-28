package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.model.RoleEntity;
import com.wifakbank.rh_system.repository.CandidateRepository;
import com.wifakbank.rh_system.repository.DepartmentRepository;
import com.wifakbank.rh_system.repository.JobPositionRepository;
import com.wifakbank.rh_system.repository.LeaveRepository;
import com.wifakbank.rh_system.repository.UserRepository;
import com.wifakbank.rh_system.repository.TrainingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRepository leaveRepository;
    private final JobPositionRepository jobPositionRepository;
    private final CandidateRepository candidateRepository;
    private final TrainingRepository trainingRepository;

    public AdminController(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           LeaveRepository leaveRepository,
                           JobPositionRepository jobPositionRepository,
                           CandidateRepository candidateRepository,
                           TrainingRepository trainingRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRepository = leaveRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.candidateRepository = candidateRepository;
        this.trainingRepository = trainingRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalUsers", userRepository.count());
        response.put("activeUsers", userRepository.countByActiveTrue());
        response.put("totalEmployees", userRepository.countByRoleEntityName(RoleEntity.ROLE_EMPLOYEE));
        response.put("totalDepartments", departmentRepository.count());
        response.put("pendingLeaves", leaveRepository.countByStatus("PENDING"));
        response.put("totalLeaves", leaveRepository.count());
        response.put("openJobOffers", jobPositionRepository.count());
        response.put("candidates", candidateRepository.count());
        response.put("totalTrainings", trainingRepository.count());
        response.put("blockedUsers", userRepository.countByActiveFalse());
        return ResponseEntity.ok(response);
    }
}
