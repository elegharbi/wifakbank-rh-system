package com.wifakbank.rh_system.service;

import com.wifakbank.rh_system.Participation;
import com.wifakbank.rh_system.repository.ParticipationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ParticipationService {

    private final ParticipationRepository participationRepository;
    private final PerformanceService performanceService;

    public ParticipationService(ParticipationRepository participationRepository, PerformanceService performanceService) {
        this.participationRepository = participationRepository;
        this.performanceService = performanceService;
    }

    public List<Participation> getAllParticipations() {
        return participationRepository.findAll();
    }

    public Participation saveParticipation(Participation participation) {
        Participation saved = participationRepository.save(participation);
        if (saved.getUser() != null) {
            performanceService.updateScore(saved.getUser().getId(), 15, "Participation à un événement");
        }
        return saved;
    }

    public void deleteParticipation(Long id) {
        participationRepository.deleteById(id);
    }
}

