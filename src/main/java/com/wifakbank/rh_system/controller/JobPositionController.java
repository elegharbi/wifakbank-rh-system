package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.JobPosition;
import com.wifakbank.rh_system.repository.JobPositionRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/job-positions")
@CrossOrigin(origins = "*")
public class JobPositionController {

    private final JobPositionRepository jobPositionRepository;

    public JobPositionController(JobPositionRepository jobPositionRepository) {
        this.jobPositionRepository = jobPositionRepository;
    }

    @GetMapping
    public List<JobPosition> getAll() {
        return jobPositionRepository.findAll();
    }

    @PostMapping
    public JobPosition create(@RequestBody JobPosition job) {
        if (job.getPostedDate() == null) {
            job.setPostedDate(LocalDateTime.now());
        }
        return jobPositionRepository.save(job);
    }
}

