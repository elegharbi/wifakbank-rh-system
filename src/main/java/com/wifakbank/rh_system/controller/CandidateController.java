package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.Candidate;
import com.wifakbank.rh_system.repository.CandidateRepository;
import com.wifakbank.rh_system.service.EmailService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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

    @GetMapping
    public List<Candidate> getAll() {
        return candidateRepository.findAll();
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

