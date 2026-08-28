package com.wifakbank.rh_system;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trainings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Training {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String organization;
    private String description;
    private Integer durationHours;
    private String status; // PLANNED, IN_PROGRESS, COMPLETED

    /** Type de formation : ONLINE ou PRESENTIEL */
    private String trainingType;

    /** Lien URL (visible uniquement si trainingType == ONLINE) */
    private String trainingLink;

    /** Nom du chef / responsable de formation */
    private String trainerName;

    /** Date de la formation */
    private LocalDate trainingDate;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
}


