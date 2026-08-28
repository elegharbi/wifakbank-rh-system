package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.Training;
import com.wifakbank.rh_system.TrainingRegistration;
import com.wifakbank.rh_system.repository.UserRepository;
import com.wifakbank.rh_system.repository.TrainingRepository;
import com.wifakbank.rh_system.repository.TrainingRegistrationRepository;
import com.wifakbank.rh_system.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/trainings/registrations")
@CrossOrigin(origins = "*")
public class TrainingRegistrationController {

    private final TrainingRegistrationRepository registrationRepository;
    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public TrainingRegistrationController(TrainingRegistrationRepository registrationRepository,
                                          TrainingRepository trainingRepository,
                                          UserRepository userRepository,
                                          EmailService emailService) {
        this.registrationRepository = registrationRepository;
        this.trainingRepository = trainingRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @PostMapping("/register/{trainingId}")
    public ResponseEntity<?> register(Authentication authentication, @PathVariable Long trainingId) {
        Long userId = Long.valueOf(authentication.getName());
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Fiche collaborateur non trouvée"));
        }
        User user = userOpt.get();

        Optional<Training> trainingOpt = trainingRepository.findById(trainingId);
        if (trainingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Formation non trouvée"));
        }
        Training training = trainingOpt.get();

        if (registrationRepository.existsByUserIdAndTrainingId(userId, trainingId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vous êtes déjà inscrit à cette formation"));
        }

        TrainingRegistration registration = TrainingRegistration.builder()
                .user(user)
                .training(training)
                .status("PENDING")
                .registrationDate(LocalDateTime.now())
                .build();

        TrainingRegistration saved = registrationRepository.save(registration);

        // Send email confirmation
        try {
            String subject = "Confirmation de demande de formation - Wifak Bank";
            String body = "Bonjour " + user.getFirstName() + " " + user.getLastName() + ",\n\n" +
                    "Votre demande d'inscription pour la formation \"" + training.getTitle() + "\" a été enregistrée avec succès.\n" +
                    "Elle est actuellement en cours de traitement par l'équipe RH.\n\n" +
                    "Cordialement,\nL'équipe RH Wifak Bank.";
            emailService.sendSimpleMessage(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Erreur email inscription formation : " + e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TrainingRegistration>> getMyRegistrations(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(registrationRepository.findByUserId(userId));
    }

    @GetMapping
    public ResponseEntity<List<TrainingRegistration>> getAllRegistrations() {
        return ResponseEntity.ok(registrationRepository.findAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        if (newStatus == null || (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Statut invalide (doit être APPROVED ou REJECTED)"));
        }

        Optional<TrainingRegistration> regOpt = registrationRepository.findById(id);
        if (regOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Inscription introuvable"));
        }

        TrainingRegistration registration = regOpt.get();
        registration.setStatus(newStatus);
        TrainingRegistration saved = registrationRepository.save(registration);

        // Send email notification
        try {
            User user = registration.getUser();
            Training training = registration.getTraining();
            String statusText = newStatus.equals("APPROVED") ? "acceptée" : "refusée";
            String subject = "Mise à jour de votre inscription à la formation - Wifak Bank";
            String body = "Bonjour " + (user.getFirstName() != null ? user.getFirstName() : user.getUsername()) + ",\n\n" +
                    "Votre demande d'inscription pour la formation \"" + training.getTitle() + "\" a été " + statusText + ".\n\n" +
                    "Cordialement,\nL'équipe RH Wifak Bank.";
            emailService.sendSimpleMessage(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Erreur email statut formation : " + e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }
}
