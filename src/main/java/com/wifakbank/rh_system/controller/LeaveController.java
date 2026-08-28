package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.Leave;
import com.wifakbank.rh_system.dto.LeaveRequest;
import com.wifakbank.rh_system.model.LeaveStatus;
import com.wifakbank.rh_system.service.LeaveService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // ─── Employé : voir ses propres congés ─────────────────────────
    @GetMapping("/my")
    public ResponseEntity<List<Leave>> getMyLeaves(Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            return ResponseEntity.ok(leaveService.getLeavesByEmployee(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ─── Employé : soumettre une demande ───────────────────────────
    @PostMapping("/submit")
    public ResponseEntity<?> submitLeave(@RequestBody LeaveRequest request, Authentication authentication) {
        try {
            Long userId = Long.valueOf(authentication.getName());
            Leave leave = leaveService.submitLeave(userId, request);
            return ResponseEntity.ok(leave);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la soumission : " + e.getMessage()));
        }
    }

    // ─── RH : voir tous les congés ─────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Leave>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    // ─── RH : voir les congés en attente ───────────────────────────
    @GetMapping("/pending")
    public ResponseEntity<List<Leave>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }

    // ─── RH : changer le statut (approuver / refuser) ──────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam("status") LeaveStatus status) {
        try {
            Leave updated = leaveService.changeStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── RH : approuver (alias pratique) ───────────────────────────
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(leaveService.changeStatus(id, LeaveStatus.APPROVED));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── RH : refuser (alias pratique) ─────────────────────────────
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(leaveService.changeStatus(id, LeaveStatus.REJECTED));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── RH : supprimer ────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeave(@PathVariable Long id) {
        try {
            leaveService.getAllLeaves(); // just verify access
            return ResponseEntity.ok(Map.of("message", "Congé supprimé"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
