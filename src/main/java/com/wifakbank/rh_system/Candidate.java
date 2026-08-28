package com.wifakbank.rh_system;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Le nom complet est obligatoire")
    private String fullName;

    @Email(message = "Format d'email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    private String phone;
    private String cvUrl;

    @NotBlank(message = "Le statut est obligatoire")
    private String status; // APPLIED, INTERVIEWED, SELECTED, REJECTED
    
    @ManyToOne
    @JoinColumn(name = "job_position_id")
    private JobPosition jobPosition;

    private Integer evaluationScore; // Note sur 100
    private String hrComment; // Remarques de l'entretien
}

