package com.wifakbank.rh_system.service;

import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.PointLog;
import com.wifakbank.rh_system.repository.UserRepository;
import com.wifakbank.rh_system.repository.PointLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PerformanceService {

    private final UserRepository userRepository;
    private final PointLogRepository pointLogRepository;

    public PerformanceService(UserRepository userRepository, PointLogRepository pointLogRepository) {
        this.userRepository = userRepository;
        this.pointLogRepository = pointLogRepository;
    }

    @Transactional
    public void updateScore(Long employeeId, Integer points, String reason) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("EmployÃ© non trouvÃ©"));

        // Mise Ã  jour du score (on ne descend pas en dessous de 0)
        int newScore = employee.getPerformanceScore() + points;
        employee.setPerformanceScore(Math.max(0, newScore));
        userRepository.save(employee);

        // Enregistrement dans l'historique
        PointLog log = new PointLog();
        log.setUser(employee);
        log.setPointsChanged(points);
        log.setReason(reason);
        log.setDate(LocalDateTime.now());
        pointLogRepository.save(log);
    }

    public List<User> getLeaderboard() {
        return userRepository.findAll().stream()
                .sorted((e1, e2) -> e2.getPerformanceScore().compareTo(e1.getPerformanceScore()))
                .limit(10)
                .collect(Collectors.toList());
    }

    public List<User> getAllRankings() {
        return userRepository.findAll().stream()
                .sorted((e1, e2) -> e2.getPerformanceScore().compareTo(e1.getPerformanceScore()))
                .collect(Collectors.toList());
    }

    public List<PointLog> getEmployeeLogs(Long employeeId) {
        return pointLogRepository.findByUserIdOrderByDateDesc(employeeId);
    }
}

