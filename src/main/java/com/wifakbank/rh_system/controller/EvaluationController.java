package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.Evaluation;
import com.wifakbank.rh_system.repository.EvaluationRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins = "*")
public class EvaluationController {

    private final EvaluationRepository evaluationRepository;

    public EvaluationController(EvaluationRepository evaluationRepository) {
        this.evaluationRepository = evaluationRepository;
    }

    @GetMapping
    public List<Evaluation> getAll() {
        List<Evaluation> list = evaluationRepository.findAll();
        System.out.println("DEBUG: Nombre d'Ã©valuations trouvÃ©es en base: " + list.size());
        return list;
    }

    @PostMapping
    public Evaluation create(@Valid @RequestBody Evaluation evaluation) {
        System.out.println("Tentative d'enregistrement d'une évaluation pour l'utilisateur ID: " + 
            (evaluation.getUser() != null ? evaluation.getUser().getId() : "NULL"));
        
        try {
            if (evaluation.getEvaluationDate() == null) {
                evaluation.setEvaluationDate(LocalDateTime.now().toString());
            }
            return evaluationRepository.save(evaluation);
        } catch (Exception e) {
            System.err.println("ERREUR BACKEND EVALUATION: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}

