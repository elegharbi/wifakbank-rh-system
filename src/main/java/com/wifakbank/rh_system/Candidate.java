package com.wifakbank.rh_system;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

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

    // ---- Informations saisies lors de la candidature ----
    // Elles étaient collectées par le formulaire public puis perdues :
    // seul un compte utilisateur était créé.

    private String address;

    /** Date de naissance, au format ISO (aaaa-mm-jj). */
    private String birthDate;

    /** Bac, Licence, Master, Ingénieur, Doctorat… */
    private String educationLevel;

    private String speciality;

    /** Intitulé du poste souhaité, tel que saisi par le candidat. */
    private String desiredPosition;

    @Column(length = 4000)
    private String motivationLetter;

    // ---- Curriculum vitae ----

    private String cvFileName;

    private String cvContentType;

    /** Contenu du PDF. Stocké en base pour rester disponible sans dépôt de fichiers. */
    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "cv_data")
    private byte[] cvData;

    /** Compte créé en même temps que la candidature. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "APPLIED";
        }
    }

    /** Le CV est-il disponible au téléchargement ? */
    @Transient
    public boolean isHasCv() {
        return cvData != null && cvData.length > 0;
    }
}

