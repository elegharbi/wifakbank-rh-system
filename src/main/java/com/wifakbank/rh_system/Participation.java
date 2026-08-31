package com.wifakbank.rh_system;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private LocalDateTime registrationDate;

    /**
     * PENDING, APPROVED ou REJECTED.
     *
     * Les inscriptions créées avant l'ajout de ce champ n'ont pas de valeur :
     * getStatus() les considère comme approuvées pour ne rien casser.
     */
    @Column(length = 20)
    private String status;

    /** Valeur par défaut à la création. */
    @PrePersist
    void onCreate() {
        if (status == null) {
            status = "PENDING";
        }
        if (registrationDate == null) {
            registrationDate = LocalDateTime.now();
        }
    }

    /** Jamais null : les anciennes lignes sont traitées comme acceptées. */
    public String getStatus() {
        return status == null ? "APPROVED" : status;
    }
}