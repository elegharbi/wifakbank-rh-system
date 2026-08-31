package com.wifakbank.rh_system.repository;

import com.wifakbank.rh_system.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndReadFalse(Long recipientId);

    /** Sert à retrouver la notification d'origine quand la demande est tranchée. */
    List<Notification> findByRelatedTypeAndRelatedId(String relatedType, Long relatedId);
}
