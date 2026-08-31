package com.wifakbank.rh_system;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Message envoyé depuis le formulaire de contact public.
 *
 * Conservé en base pour que le RH puisse le relire depuis la notification,
 * même longtemps après réception.
 */
@Entity
@Table(name = "contact_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(nullable = false, length = 4000)
    private String message;

    /** NEW ou HANDLED. */
    @Column(length = 20)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "NEW";
        }
    }
}
