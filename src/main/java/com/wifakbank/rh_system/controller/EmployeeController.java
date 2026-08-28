package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.Event;
import com.wifakbank.rh_system.Training;
import com.wifakbank.rh_system.repository.UserRepository;
import com.wifakbank.rh_system.repository.EventRepository;
import com.wifakbank.rh_system.repository.TrainingRepository;
import com.wifakbank.rh_system.service.LeaveService;
import com.wifakbank.rh_system.service.PointsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    private final UserRepository userRepository;
    private final PointsService pointsService;
    private final LeaveService leaveService;
    private final EventRepository eventRepository;
    private final TrainingRepository trainingRepository;

    public EmployeeController(UserRepository userRepository, PointsService pointsService, 
                              LeaveService leaveService, EventRepository eventRepository,
                              TrainingRepository trainingRepository) {
        this.userRepository = userRepository;
        this.pointsService = pointsService;
        this.leaveService = leaveService;
        this.eventRepository = eventRepository;
        this.trainingRepository = trainingRepository;
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        Optional<User> empOpt = userRepository.findById(userId);
        
        Map<String, Object> stats = new HashMap<>();
        if (empOpt.isPresent()) {
            User emp = empOpt.get();
            stats.put("employee", emp);
            
            // Total points
            int totalPoints = pointsService.getTotalPoints(userId);
            stats.put("totalPoints", totalPoints);

            // Leaves stats
            var myLeaves = leaveService.getLeavesByEmployee(userId);
            long approvedDays = myLeaves.stream()
                    .filter(l -> com.wifakbank.rh_system.model.LeaveStatus.APPROVED.equals(l.getStatus()))
                    .count();
            stats.put("remainingLeaves", Math.max(0, 30 - approvedDays));
            stats.put("totalLeaves", myLeaves.size());
            
            // Upcoming events (after now)
            List<Event> upcomingEvents = eventRepository.findAll().stream()
                    .filter(e -> e.getEventDate().isAfter(LocalDate.now().minusDays(1)))
                    .limit(5)
                    .toList();
            stats.put("upcomingEvents", upcomingEvents);
            
            // Available trainings
            List<Training> availableTrainings = trainingRepository.findAll().stream()
                    .limit(5)
                    .toList();
            stats.put("availableTrainings", availableTrainings);
            
            // Recent notifications (we can return announcements or custom list of events)
            List<String> notifications = new ArrayList<>();
            notifications.add("Bienvenue sur le portail RH de Wifak Bank.");
            notifications.add("Vos points de performance ont été mis à jour.");
            stats.put("notifications", notifications);
        } else {
            stats.put("error", "Fiche collaborateur non trouvée");
        }
        
        return ResponseEntity.ok(stats);
    }
    
    // Keep placeholder endpoints if frontend expects them, but make them return dynamic data
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        return getDashboardStats(authentication);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        Optional<User> empOpt = userRepository.findById(userId);
        if (empOpt.isPresent()) {
            return ResponseEntity.ok(Map.of("employee", empOpt.get()));
        }
        return ResponseEntity.ok(Collections.emptyMap());
    }

    @GetMapping("/payslips")
    public ResponseEntity<List<Map<String, Object>>> getPayslips() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        return ResponseEntity.ok(Collections.emptyList());
    }
}
