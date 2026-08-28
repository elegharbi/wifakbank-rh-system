package com.wifakbank.rh_system;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_positions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Le titre du poste est obligatoire")
    private String title;

    @NotBlank(message = "Le dÃ©partement est obligatoire")
    private String department;

    private String description;
    private String requirements;

    @NotBlank(message = "Le statut est obligatoire")
    private String status; // OPEN, CLOSED, ON_HOLD
    private LocalDateTime postedDate;
}

