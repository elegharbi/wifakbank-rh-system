package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.Training;
import com.wifakbank.rh_system.repository.TrainingRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/trainings")
@CrossOrigin(origins = "*")
public class TrainingController {

    private final TrainingRepository trainingRepository;

    public TrainingController(TrainingRepository trainingRepository) {
        this.trainingRepository = trainingRepository;
    }

    @GetMapping
    public List<Training> getAll() {
        return trainingRepository.findAll();
    }

    @PostMapping
    public Training create(@RequestBody Training training) {
        return trainingRepository.save(training);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) {
        System.out.println("Tentative de suppression de la formation ID: " + id);
        trainingRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public Training update(@PathVariable("id") Long id, @RequestBody Training training) {
        training.setId(id);
        return trainingRepository.save(training);
    }
}

