package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.ContactMessage;
import com.wifakbank.rh_system.NotificationType;
import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.model.Role;
import com.wifakbank.rh_system.repository.ContactMessageRepository;
import com.wifakbank.rh_system.repository.UserRepository;
import com.wifakbank.rh_system.service.EmailService;
import com.wifakbank.rh_system.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Formulaire de contact / consultation.
 *
 * L'envoi est public : un candidat n'a pas de compte au moment où il écrit.
 * La lecture des messages exige en revanche une authentification.
 */
@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactMessageRepository contactRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public ContactController(ContactMessageRepository contactRepository,
                             UserRepository userRepository,
                             NotificationService notificationService,
                             EmailService emailService) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    /** Réception d'un message : ouvert à tous. */
    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Map<String, String> payload) {
        String fullName = trim(payload.get("fullName"), payload.get("nomComplet"));
        String email = trim(payload.get("email"), null);
        String subject = trim(payload.get("subject"), payload.get("sujet"));
        String message = trim(payload.get("message"), null);

        if (fullName.isEmpty() || email.isEmpty() || subject.isEmpty() || message.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Nom, email, sujet et message sont obligatoires"));
        }

        ContactMessage saved = contactRepository.save(ContactMessage.builder()
                .fullName(fullName)
                .email(email)
                .subject(subject)
                .message(message)
                .status("NEW")
                .build());

        // L'expéditeur, s'il possède déjà un compte : sert d'auteur et de destinataire de l'accusé.
        Optional<User> senderAccount = userRepository.findByEmail(email);

        // 1. Le RH est prévenu, avec de quoi identifier et retrouver la demande.
        String extract = message.length() > 180 ? message.substring(0, 180) + "…" : message;
        notificationService.notifyHr(
                senderAccount.orElse(null),
                NotificationType.CONTACT_REQUEST,
                "Nouveau message : " + subject,
                fullName + " (" + email + ") a écrit : « " + extract + " »",
                "/hr/candidates",
                "CONTACT",
                saved.getId(),
                false);

        // 2. Accusé de réception à l'expéditeur.
        sendMail(email,
                "Nous avons bien reçu votre message - Wifak Bank",
                "Bonjour " + fullName + ",\n\n"
                        + "Nous avons bien reçu votre demande : « " + subject + " ».\n"
                        + "L'équipe RH vous répondra sous 48 heures ouvrables.\n\n"
                        + "Cordialement,\nL'équipe RH Wifak Bank.");

        senderAccount.ifPresent(u -> notificationService.notifyUser(
                u, null,
                NotificationType.CONTACT_ACK,
                "Message bien reçu",
                "Votre demande « " + subject + " » a été transmise à l'équipe RH. "
                        + "Une réponse vous parviendra sous 48 heures ouvrables.",
                null, "CONTACT", saved.getId(), false));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "id", saved.getId(),
                "message", "Votre demande a bien été enregistrée. Vous recevrez une confirmation par e-mail."));
    }

    /** Liste des messages reçus, pour l'espace RH. */
    @GetMapping
    public ResponseEntity<?> list(Authentication authentication) {
        if (!isHr(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès réservé aux RH"));
        }
        List<ContactMessage> all = contactRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(all);
    }

    @PutMapping("/{id}/handled")
    public ResponseEntity<?> markHandled(Authentication authentication, @PathVariable Long id) {
        if (!isHr(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès réservé aux RH"));
        }
        Optional<ContactMessage> found = contactRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Message introuvable"));
        }
        ContactMessage m = found.get();
        m.setStatus("HANDLED");
        contactRepository.save(m);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ---------- utilitaires ----------

    private boolean isHr(Authentication authentication) {
        if (authentication == null) return false;
        return userRepository.findById(Long.valueOf(authentication.getName()))
                .map(u -> u.getRole() == Role.HR || u.getRole() == Role.ADMIN)
                .orElse(false);
    }

    private String trim(String primary, String fallback) {
        String v = primary != null ? primary : fallback;
        return v == null ? "" : v.trim();
    }

    private void sendMail(String to, String subject, String body) {
        try {
            emailService.sendSimpleMessage(to, subject, body);
        } catch (Exception e) {
            // Un SMTP indisponible ne doit pas faire perdre le message.
            System.err.println("Erreur email contact : " + e.getMessage());
        }
    }
}
