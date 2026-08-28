package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.PointLog;
import com.wifakbank.rh_system.service.PerformanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = "*")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @GetMapping("/leaderboard")
    public List<User> getLeaderboard() {
        return performanceService.getLeaderboard();
    }

    @GetMapping("/rankings")
    public List<User> getAllRankings() {
        return performanceService.getAllRankings();
    }

    @GetMapping("/logs/{userId}")
    public List<PointLog> getEmployeeLogs(@PathVariable Long userId) {
        return performanceService.getEmployeeLogs(userId);
    }

    // Endpoint manuel pour les administrateurs pour ajuster les points
    @PostMapping("/adjust")
    public void adjustPoints(@RequestParam Long userId, @RequestParam Integer points, @RequestParam String reason) {
        performanceService.updateScore(userId, points, reason);
    }
}

