package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.Participation;
import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.Event;
import com.wifakbank.rh_system.service.ParticipationService;
import com.wifakbank.rh_system.repository.UserRepository;
import com.wifakbank.rh_system.repository.EventRepository;
import com.wifakbank.rh_system.repository.ParticipationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/participations")
@CrossOrigin(origins = "*")
public class ParticipationController {

    private final ParticipationService participationService;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ParticipationRepository participationRepository;

    public ParticipationController(ParticipationService participationService, 
                                   UserRepository userRepository,
                                   EventRepository eventRepository,
                                   ParticipationRepository participationRepository) {
        this.participationService = participationService;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.participationRepository = participationRepository;
    }

    @GetMapping
    public List<Participation> getAllParticipations() {
        return participationService.getAllParticipations();
    }

    @PostMapping
    public Participation createParticipation(@RequestBody Participation participation) {
        return participationService.saveParticipation(participation);
    }

    @DeleteMapping("/{id}")
    public void deleteParticipation(@PathVariable Long id) {
        participationService.deleteParticipation(id);
    }

    @PostMapping("/register/{eventId}")
    public ResponseEntity<?> registerForEvent(Authentication authentication, @PathVariable Long eventId) {
        Long userId = Long.valueOf(authentication.getName());
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Fiche utilisateur non trouvée"));
        }
        User user = userOpt.get();

        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Événement non trouvé"));
        }
        Event event = eventOpt.get();

        Participation participation = new Participation();
        participation.setUser(user);
        participation.setEvent(event);
        participation.setRegistrationDate(LocalDateTime.now());

        Participation saved = participationService.saveParticipation(participation);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Participation>> getMyParticipations(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(participationRepository.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().getId().equals(userId))
                .toList());
    }
}
