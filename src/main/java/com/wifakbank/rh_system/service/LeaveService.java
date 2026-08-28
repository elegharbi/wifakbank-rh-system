package com.wifakbank.rh_system.service;

import com.wifakbank.rh_system.Leave;
import com.wifakbank.rh_system.dto.LeaveRequest;
import com.wifakbank.rh_system.model.LeaveStatus;
import com.wifakbank.rh_system.repository.LeaveRepository;
import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public LeaveService(LeaveRepository leaveRepository, UserRepository userRepository, EmailService emailService) {
        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Leave submitLeave(Long userId, LeaveRequest request) {
        var userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Aucun profil utilisateur trouvé pour cet utilisateur (ID=" + userId + "). Contactez l'administrateur.");
        }
        User user = userOpt.get();
        Leave leave = new Leave();
        leave.setUser(user);
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setLeaveType(request.getLeaveType() != null ? request.getLeaveType() : "Congé annuel");
        leave.setStatus(LeaveStatus.PENDING);
        Leave saved = leaveRepository.save(leave);

        // Send confirmation email
        try {
            String subject = "Confirmation de demande de congé - Wifak Bank";
            String body = "Bonjour " + user.getFirstName() + " " + user.getLastName() + ",\n\n" +
                    "Votre demande de congé du " + request.getStartDate() + " au " + request.getEndDate() + " a été soumise avec succès.\n" +
                    "Type : " + leave.getLeaveType() + "\n" +
                    "Elle est actuellement en attente de validation par les RH.\n\n" +
                    "Cordialement,\nL'équipe RH Wifak Bank.";
            emailService.sendSimpleMessage(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Erreur envoi email confirmation congé : " + e.getMessage());
        }

        return saved;
    }

    @Transactional
    public Leave changeStatus(Long leaveId, LeaveStatus newStatus) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave not found"));
        leave.setStatus(newStatus);

        // Send notification email
        try {
            String statusFr = newStatus == LeaveStatus.APPROVED ? "acceptée ✅" : "refusée ❌";
            String subject = "Mise à jour de votre demande de congé - Wifak Bank";
            String body = "Bonjour " + leave.getUser().getFirstName() + " " + leave.getUser().getLastName() + ",\n\n" +
                    "Votre demande de congé du " + leave.getStartDate() + " au " + leave.getEndDate() +
                    " a été " + statusFr + ".\n\n" +
                    "Cordialement,\nL'équipe RH Wifak Bank.";
            emailService.sendSimpleMessage(leave.getUser().getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Erreur envoi email statut congé : " + e.getMessage());
        }

        return leaveRepository.save(leave);
    }

    @Transactional(readOnly = true)
    public List<Leave> getLeavesByEmployee(Long userId) {
        var userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        return leaveRepository.findAll().stream()
                .filter(l -> l.getUser() != null && l.getUser().getId().equals(userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Leave> getPendingLeaves() {
        return leaveRepository.findAll().stream()
                .filter(l -> l.getStatus() == LeaveStatus.PENDING)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }
}
