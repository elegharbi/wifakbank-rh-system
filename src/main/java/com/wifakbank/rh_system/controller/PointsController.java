package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.dto.LeaderboardEntry;
import com.wifakbank.rh_system.dto.PointsResponse;
import com.wifakbank.rh_system.service.PointsService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/points")
public class PointsController {

    private final PointsService pointsService;

    public PointsController(PointsService pointsService) {
        this.pointsService = pointsService;
    }

    // Get current user's total points
    @GetMapping("/me")
    public ResponseEntity<PointsResponse> getMyPoints(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName()); // assuming username is id, adjust if needed
        int total = pointsService.getTotalPoints(userId);
        return ResponseEntity.ok(new PointsResponse(total));
    }

    @GetMapping("/history")
    public ResponseEntity<List<com.wifakbank.rh_system.PointLog>> getHistory(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(pointsService.getHistory(userId));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard() {
        // top 10 by default
        return ResponseEntity.ok(pointsService.getLeaderboard(10));
    }
}
