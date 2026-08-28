package com.wifakbank.rh_system.service;

import com.wifakbank.rh_system.PointLog;
import com.wifakbank.rh_system.repository.PointLogRepository;
import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.repository.UserRepository;
import com.wifakbank.rh_system.service.EmailService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PointsService {

    private final PointLogRepository pointLogRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public PointsService(PointLogRepository pointLogRepository, 
                         UserRepository userRepository, 
                         EmailService emailService) {
        this.pointLogRepository = pointLogRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    private int logsSumForUser(Long userId) {
        List<PointLog> logs = pointLogRepository.findByUserIdOrderByDateDesc(userId);
        return logs.stream().mapToInt(PointLog::getPointsChanged).sum();
    }

    @Transactional(readOnly = true)
    public int getTotalPoints(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return 0;
        }
        return logsSumForUser(userId);
    }

    @Transactional
    public PointLog addPoints(Long userId, int delta, String reason) {
        var userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = userOpt.get();
        PointLog log = PointLog.builder()
                .user(user)
                .pointsChanged(delta)
                .reason(reason)
                .date(java.time.LocalDateTime.now())
                .build();
        PointLog saved = pointLogRepository.save(log);

        // Send email notification to user
        try {
            int newTotal = logsSumForUser(user.getId());
            String subject = "Mise à jour de vos points de performance - Wifak Bank";
            String body = "Bonjour " + user.getFirstName() + " " + user.getLastName() + ",\n\n" +
                    "De nouveaux points de performance ont été enregistrés :\n" +
                    "Variation : " + (delta >= 0 ? "+" : "") + delta + " points\n" +
                    "Raison : " + reason + "\n" +
                    "Nouveau solde total : " + newTotal + " points.\n\n" +
                    "Cordialement,\nL'équipe RH Wifak Bank.";
            emailService.sendSimpleMessage(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Erreur envoi email points : " + e.getMessage());
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<PointLog> getHistory(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        return pointLogRepository.findByUserIdOrderByDateDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<com.wifakbank.rh_system.dto.LeaderboardEntry> getLeaderboard(int limit) {
        return userRepository.findAll().stream()
                .map(user -> {
                    int total = logsSumForUser(user.getId());
                    return new com.wifakbank.rh_system.dto.LeaderboardEntry(user.getFirstName() + " " + user.getLastName(), total);
                })
                .sorted((a, b) -> Integer.compare(b.getTotalPoints(), a.getTotalPoints()))
                .limit(limit)
                .collect(Collectors.toList());
    }
}
