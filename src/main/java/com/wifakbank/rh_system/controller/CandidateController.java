package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.Candidate;
import com.wifakbank.rh_system.repository.CandidateRepository;
import com.wifakbank.rh_system.service.EmailService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "*")
public class CandidateController {

    private final CandidateRepository candidateRepository;
    private final EmailService emailService;

    public CandidateController(CandidateRepository candidateRepository, EmailService emailService) {
        this.candidateRepository = candidateRepository;
        this.emailService = emailService;
    }

    /**
     * Liste des candidatures.
     *
     * Vue allegee : le contenu du CV n'est pas serialise, sinon chaque
     * chargement de la liste transporterait tous les PDF.
     */
    @GetMapping
    public List<Map<String, Object>> getAll() {
        return candidateRepository.findAll().stream()
                .sorted((a, b) -> Long.compare(
                        b.getId() == null ? 0 : b.getId(),
                        a.getId() == null ? 0 : a.getId()))
                .map(this::toSummary)
                .toList();
    }

    /** Detail d'une candidature, avec la lettre de motivation. */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        Optional<Candidate> found = candidateRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidature introuvable"));
        }
        Candidate c = found.get();
        Map<String, Object> m = toSummary(c);
        m.put("motivationLetter", c.getMotivationLetter());
        m.put("hrComment", c.getHrComment());
        m.put("evaluationScore", c.getEvaluationScore());
        return ResponseEntity.ok(m);
    }

    /** Telechargement du CV. */
    @GetMapping("/{id}/cv")
    public ResponseEntity<byte[]> downloadCv(@PathVariable Long id) {
        Optional<Candidate> found = candidateRepository.findById(id);
        if (found.isEmpty() || found.get().getCvData() == null || found.get().getCvData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        Candidate c = found.get();
        String name = c.getCvFileName() != null && !c.getCvFileName().isBlank()
                ? c.getCvFileName()
                : "CV-" + c.getFullName().replaceAll("\s+", "-") + ".pdf";
        String type = c.getCvContentType() != null ? c.getCvContentType() : MediaType.APPLICATION_PDF_VALUE;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, type)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + name + "\"")
                .body(c.getCvData());
    }

    /** Mise a jour du statut et de l'avis RH. */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Candidate> found = candidateRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Candidature introuvable"));
        }
        Candidate c = found.get();
        Object status = payload.get("status");
        if (status != null) c.setStatus(status.toString());
        Object comment = payload.get("hrComment");
        if (comment != null) c.setHrComment(comment.toString());
        Object score = payload.get("evaluationScore");
        if (score != null) {
            try { c.setEvaluationScore(Integer.parseInt(score.toString())); } catch (NumberFormatException ignored) { }
        }
        candidateRepository.save(c);
        return ResponseEntity.ok(toSummary(c));
    }

    private Map<String, Object> toSummary(Candidate c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("fullName", c.getFullName());
        m.put("email", c.getEmail());
        m.put("phone", c.getPhone());
        m.put("status", c.getStatus());
        m.put("address", c.getAddress());
        m.put("birthDate", c.getBirthDate());
        m.put("educationLevel", c.getEducationLevel());
        m.put("speciality", c.getSpeciality());
        m.put("desiredPosition", c.getDesiredPosition());
        m.put("cvFileName", c.getCvFileName());
        m.put("hasCv", c.getCvData() != null && c.getCvData().length > 0);
        m.put("createdAt", c.getCreatedAt());
        m.put("jobPosition", c.getJobPosition() != null ? c.getJobPosition().getTitle() : null);
        return m;
    }

    @PostMapping
    public Candidate create(@RequestBody Candidate candidate) {
        Candidate savedCandidate = candidateRepository.save(candidate);
        
        // Envoi d'un mail de confirmation de rÃ©ception de candidature
        try {
            String subject = "Accusé de réception de candidature - Wifak Bank";
            String content = "Bonjour " + savedCandidate.getFullName() + ",\n\n" +
                    "Nous avons bien reçu votre candidature pour le poste de : " + (savedCandidate.getJobPosition() != null ? savedCandidate.getJobPosition().getTitle() : "Poste interne") + ".\n" +
                    "Nos équipes RH l'étudieront avec la plus grande attention.\n\n" +
                    "Cordialement,\nL'équipe Recrutement Wifak Bank.";
            emailService.sendSimpleMessage(savedCandidate.getEmail(), subject, content);
        } catch (Exception e) {
            System.err.println("Erreur envoi email confirmation candidature : " + e.getMessage());
        }
        
        return savedCandidate;
    }
}

