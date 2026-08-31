package com.wifakbank.rh_system;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Notification destinée à un utilisateur précis.
 *
 * Elle est persistée : le destinataire la retrouve après reconnexion,
 * sur n'importe quel appareil. Rien n'est simulé côté navigateur.
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Celui qui reçoit la notification. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    /** Celui dont l'action est à l'origine (employé, candidat, RH). */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "actor_id")
    private User actor;

    /** Voir {@link NotificationType}. */
    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 600)
    private String message;

    /** Route Angular vers laquelle diriger le destinataire. */
    @Column(length = 200)
    private String link;

    /** Nature de l'objet concerné : TRAINING_REGISTRATION, PARTICIPATION, CONTACT. */
    @Column(name = "related_type", length = 40)
    private String relatedType;

    /** Identifiant de cet objet, pour agir directement depuis la notification. */
    @Column(name = "related_id")
    private Long relatedId;

    /** true tant que la demande attend une décision du RH. */
    @Column(name = "actionable")
    private Boolean actionable = false;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (actionable == null) {
            actionable = false;
        }
    }
}
