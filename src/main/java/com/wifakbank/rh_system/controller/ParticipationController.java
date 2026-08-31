package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.Participation;
import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.Event;
import com.wifakbank.rh_system.NotificationType;
import com.wifakbank.rh_system.service.NotificationService;
import com.wifakbank.rh_system.service.ParticipationService;
import com.wifakbank.rh_system.service.EmailService;
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

    private static final String NL = System.lineSeparator();

    private final ParticipationService participationService;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ParticipationRepository participationRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public ParticipationController(ParticipationService participationService, 
                                   UserRepository userRepository,
                                   EventRepository eventRepository,
                                   ParticipationRepository participationRepository,
                                   NotificationService notificationService,
                                   EmailService emailService) {
        this.participationService = participationService;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.participationRepository = participationRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
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

        boolean already = participationRepository.findAll().stream()
                .anyMatch(p -> p.getUser() != null && p.getUser().getId().equals(userId)
                        && p.getEvent() != null && p.getEvent().getId().equals(eventId));
        if (already) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vous avez déjà demandé à participer"));
        }

        Participation participation = new Participation();
        participation.setUser(user);
        participation.setEvent(event);
        participation.setRegistrationDate(LocalDateTime.now());
        participation.setStatus("PENDING");

        Participation saved = participationService.saveParticipation(participation);

        // Le RH voit la demande dans son espace Notifications.
        notificationService.notifyHr(
                user,
                NotificationType.EVENT_REQUEST,
                "Demande de participation à un événement",
                displayName(user) + " demande à participer à « " + event.getTitle() + " ».",
                "/hr/participations",
                "PARTICIPATION",
                saved.getId(),
                true);

        sendMail(user.getEmail(),
                "Demande de participation enregistree - Wifak Bank",
                "Bonjour " + displayName(user) + "," + NL + NL
                        + "Votre demande de participation a l'evenement \"" + event.getTitle()
                        + "\" a bien ete enregistree." + NL
                        + "Elle est en attente de validation par l'equipe RH." + NL + NL
                        + "Cordialement," + NL + "L'equipe RH Wifak Bank.");

        return ResponseEntity.ok(saved);
    }

    /** Décision du RH sur une demande de participation. */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        if (newStatus == null || (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Statut invalide (APPROVED ou REJECTED)"));
        }

        Optional<Participation> partOpt = participationRepository.findById(id);
        if (partOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Demande introuvable"));
        }

        Participation participation = partOpt.get();
        if (!"PENDING".equalsIgnoreCase(participation.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Cette demande a déjà été traitée (" + participation.getStatus() + ")"));
        }

        participation.setStatus(newStatus);
        Participation saved = participationRepository.save(participation);

        boolean approved = "APPROVED".equals(newStatus);
        User employee = participation.getUser();
        String eventTitle = participation.getEvent() != null ? participation.getEvent().getTitle() : "l'événement";

        notificationService.notifyUser(
                employee,
                null,
                approved ? NotificationType.EVENT_APPROVED : NotificationType.EVENT_REJECTED,
                approved ? "Participation acceptée" : "Participation refusée",
                "Votre demande de participation à « " + eventTitle + " » a été "
                        + (approved ? "acceptée." : "refusée."),
                "/events",
                "PARTICIPATION",
                saved.getId(),
                false);

        notificationService.closeRequest("PARTICIPATION", saved.getId());

        if (employee != null) {
            sendMail(employee.getEmail(),
                    "Votre participation a un evenement - Wifak Bank",
                    "Bonjour " + displayName(employee) + "," + NL + NL
                            + "Votre demande de participation a \"" + eventTitle + "\" a ete "
                            + (approved ? "acceptee" : "refusee") + "." + NL + NL
                            + "Cordialement," + NL + "L'equipe RH Wifak Bank.");
        }

        return ResponseEntity.ok(saved);
    }

    private String displayName(User u) {
        if (u == null) return "Un collaborateur";
        String first = u.getFirstName() != null ? u.getFirstName() : "";
        String last = u.getLastName() != null ? u.getLastName() : "";
        String full = (first + " " + last).trim();
        return full.isEmpty() ? u.getUsername() : full;
    }

    /** L'envoi d'e-mail ne doit jamais faire échouer la demande. */
    private void sendMail(String to, String subject, String body) {
        if (to == null || to.isBlank()) return;
        try {
            emailService.sendSimpleMessage(to, subject, body);
        } catch (Exception e) {
            System.err.println("Erreur email participation : " + e.getMessage());
        }
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
