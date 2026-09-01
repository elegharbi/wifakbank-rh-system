package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.model.Role;
import com.wifakbank.rh_system.LoginRequest;
import com.wifakbank.rh_system.SignupRequest;
import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.repository.UserRepository;
import com.wifakbank.rh_system.repository.CandidateRepository;
import com.wifakbank.rh_system.Candidate;
import com.wifakbank.rh_system.NotificationType;
import com.wifakbank.rh_system.service.NotificationService;
import com.wifakbank.rh_system.repository.DepartmentRepository;
import com.wifakbank.rh_system.service.EmailService;
import com.wifakbank.rh_system.service.PasswordEncoderService;
import com.wifakbank.rh_system.util.JwtUtil;
import com.wifakbank.rh_system.dto.ChangePasswordRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EmailService emailService;
    private final PasswordEncoderService passwordEncoderService;
    private final JwtUtil jwtUtil;
    private final CandidateRepository candidateRepository;
    private final NotificationService notificationService;

    public AuthController(UserRepository userRepository, DepartmentRepository departmentRepository, EmailService emailService, PasswordEncoderService passwordEncoderService, JwtUtil jwtUtil, CandidateRepository candidateRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.emailService = emailService;
        this.passwordEncoderService = passwordEncoderService;
        this.jwtUtil = jwtUtil;
        this.candidateRepository = candidateRepository;
        this.notificationService = notificationService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        String input = request.getUsername() != null ? request.getUsername().trim() : "";
        Optional<User> userOptional = userRepository.findByUsername(input);
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByEmail(input);
        }
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findAll().stream()
                    .filter(u -> u.getUsername().equalsIgnoreCase(input) || u.getEmail().equalsIgnoreCase(input))
                    .findFirst();
        }
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoderService.matches(request.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());
                // Set JWT in HttpOnly cookie
                Cookie cookie = new Cookie("Authorization", token);
                cookie.setHttpOnly(false);
                cookie.setSecure(false);
                cookie.setPath("/");
                cookie.setMaxAge(24 * 60 * 60); // 1 day
                response.addCookie(cookie);
                Map<String, Object> resp = new HashMap<>();
                resp.put("message", "Connexion réussie");
                resp.put("user", user);
                resp.put("role", user.getRole());
                // Also send token in body for non‑browser clients
                resp.put("token", token);
                return ResponseEntity.ok(resp);
            }
        }
        Map<String, String> error = new HashMap<>();
        error.put("error", "Identifiants incorrects");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletResponse response, @CookieValue(value = "Authorization", required = false) String oldToken) {
        if (oldToken != null && jwtUtil.validateToken(oldToken)) {
            // Extract user id from old token
            String userIdStr = jwtUtil.getUserIdFromToken(oldToken);
            Long userId = Long.valueOf(userIdStr);
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String newToken = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());
                Cookie cookie = new Cookie("Authorization", newToken);
                cookie.setHttpOnly(false);
                cookie.setSecure(false);
                cookie.setPath("/");
                cookie.setMaxAge(24 * 60 * 60);
                response.addCookie(cookie);
                Map<String, Object> resp = new HashMap<>();
                resp.put("message", "Token refreshed");
                resp.put("token", newToken);
                return ResponseEntity.ok(resp);
            }
        }
        Map<String, String> err = new HashMap<>();
        err.put("error", "Token invalide ou absent");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
    }

    @PostMapping("/register/candidate")
    public ResponseEntity<?> registerCandidate(@RequestBody SignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username déjà pris"));
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
        }
        if (request.getPhone() != null && userRepository.findByPhone(request.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Numéro de téléphone déjà utilisé"));
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoderService.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(Role.CANDIDATE);
        userRepository.save(user);

        // La candidature elle-même : sans cela, tout ce que le candidat a
        // saisi (adresse, diplôme, spécialité, poste visé, CV, lettre)
        // était perdu et le RH ne voyait aucune candidature.
        Candidate candidate = new Candidate();
        candidate.setFullName((user.getFirstName() + " " + user.getLastName()).trim());
        candidate.setEmail(user.getEmail());
        candidate.setPhone(user.getPhone());
        candidate.setStatus("APPLIED");
        candidate.setUser(user);
        candidate.setAddress(request.getAddress());
        candidate.setBirthDate(request.getBirthDate());
        candidate.setEducationLevel(request.getEducationLevel());
        candidate.setSpeciality(request.getSpeciality());
        candidate.setDesiredPosition(request.getDesiredPosition());
        candidate.setMotivationLetter(request.getMotivationLetter());
        candidate.setCvFileName(request.getCvFileName());
        candidate.setCvContentType(request.getCvContentType());

        if (request.getCvBase64() != null && !request.getCvBase64().isBlank()) {
            try {
                String raw = request.getCvBase64();
                int comma = raw.indexOf(',');           // en-tête « data:...;base64, »
                if (comma >= 0) raw = raw.substring(comma + 1);
                candidate.setCvData(java.util.Base64.getDecoder().decode(raw));
            } catch (Exception e) {
                System.err.println("CV illisible, candidature conservée sans pièce jointe : " + e.getMessage());
            }
        }

        Candidate savedCandidate = candidateRepository.save(candidate);

        // Le RH est prévenu de la nouvelle candidature.
        notificationService.notifyHr(
                user,
                NotificationType.CONTACT_REQUEST,
                "Nouvelle candidature reçue",
                candidate.getFullName() + " a déposé une candidature"
                        + (candidate.getDesiredPosition() != null && !candidate.getDesiredPosition().isBlank()
                            ? " pour le poste de " + candidate.getDesiredPosition() : "") + ".",
                "/hr/candidates",
                "CANDIDATE",
                savedCandidate.getId(),
                false);

        String subject = "Bienvenue chez Wifak Bank - Inscription réussie";
        String message = "Bonjour " + user.getFirstName() + " " + user.getLastName() + ",\n\n" +
                "Votre inscription sur le portail RH de Wifak Bank a été effectuée avec succès.\n" +
                "Vous pouvez maintenant vous connecter avec votre nom d'utilisateur : " + user.getUsername() + "\n\n" +
                "Cordialement,\nL'équipe RH Wifak Bank.";
        try {
            emailService.sendSimpleMessage(user.getEmail(), subject, message);
        } catch (Exception e) {
            System.err.println("Erreur envoi email candidat : " + e.getMessage());
        }
        return ResponseEntity.ok(Map.of("message", "Inscription réussie en tant que candidat. Email de confirmation envoyé."));
    }

    @PostMapping("/register/hr")
    public ResponseEntity<?> addHrManager(@RequestBody SignupRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username déjà pris"));
        }
        String generatedPassword = UUID.randomUUID().toString().substring(0, 8);
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoderService.encode(generatedPassword));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(Role.HR);
        if (request.getDepartment() != null) {
            departmentRepository.findByName(request.getDepartment()).ifPresent(user::setDepartment);
        }
        userRepository.save(user);
        String subject = "Vos identifiants Wifak Bank RH";
        String message = "Bonjour " + user.getFirstName() + " " + user.getLastName() + ",\n\n" +
                "Votre compte Directeur Ressources Humaines chez Wifak Bank a été créé avec succès.\n" +
                "Voici vos identifiants de connexion :\n" +
                "- Mail : " + user.getEmail() + "\n" +
                "- Mot de passe : " + generatedPassword + "\n\n" +
                "Identifiant de connexion (Username) : " + user.getUsername() + "\n\n" +
                "Veuillez changer votre mot de passe après votre première connexion.\n\n" +
                "Cordialement,\nL'administration Wifak Bank.";
        try {
            emailService.sendSimpleMessage(user.getEmail(), subject, message);
        } catch (Exception e) {
            userRepository.delete(user);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "L'ajout a été bloqué car l'envoi de l'email a échoué. (" + e.getMessage() + ")"));
        }
        return ResponseEntity.ok(Map.of("message", "Directeur Ressources Humaines ajouté et email envoyé"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String username = request.getUsername();
        String newPassword = request.getNewPassword();
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(passwordEncoderService.encode(newPassword));
            user.setPasswordChanged(true);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour avec succès"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Utilisateur non trouvé"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "L'adresse email est obligatoire"));
        }
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String tempPassword = UUID.randomUUID().toString().substring(0, 8);
            user.setPassword(passwordEncoderService.encode(tempPassword));
            user.setPasswordChanged(false);
            userRepository.save(user);

            String subject = "Réinitialisation de votre mot de passe - Wifak Bank";
            String body = "Bonjour " + user.getFirstName() + " " + user.getLastName() + ",\n\n" +
                    "Votre mot de passe temporaire pour vous connecter au portail RH de Wifak Bank est :\n" +
                    tempPassword + "\n\n" +
                    "Veuillez vous connecter et modifier votre mot de passe immédiatement.\n\n" +
                    "Cordialement,\nL'administration Wifak Bank.";
            try {
                emailService.sendSimpleMessage(user.getEmail(), subject, body);
            } catch (Exception e) {
                System.err.println("Erreur envoi email réinitialisation : " + e.getMessage());
            }
            return ResponseEntity.ok(Map.of("message", "Un mot de passe temporaire a été envoyé par email."));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Aucun compte trouvé avec cet email"));
    }
}
