package com.wifakbank.rh_system.service;

import com.wifakbank.rh_system.Notification;
import com.wifakbank.rh_system.User;
import com.wifakbank.rh_system.model.Role;
import com.wifakbank.rh_system.repository.NotificationRepository;
import com.wifakbank.rh_system.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Création et lecture des notifications.
 *
 * Tout passe par la base : une notification créée ici est visible par son
 * destinataire à sa prochaine consultation, quel que soit l'appareil.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // ================= Création =================

    /** Notifie un utilisateur précis. */
    @Transactional
    public Notification notifyUser(User recipient, User actor, String type,
                                   String title, String message, String link,
                                   String relatedType, Long relatedId, boolean actionable) {
        if (recipient == null) {
            log.warn("Notification '{}' ignorée : aucun destinataire", type);
            return null;
        }

        Notification n = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .relatedType(relatedType)
                .relatedId(relatedId)
                .actionable(actionable)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(n);
        log.info("Notification #{} [{}] -> {} (id={})",
                saved.getId(), type, recipient.getUsername(), recipient.getId());
        return saved;
    }

    /**
     * Notifie toute l'équipe RH.
     *
     * Les administrateurs sont inclus : sans cela, une demande resterait
     * invisible si aucun compte RH n'existe encore.
     */
    @Transactional
    public List<Notification> notifyHr(User actor, String type, String title, String message,
                                       String link, String relatedType, Long relatedId,
                                       boolean actionable) {
        List<User> recipients = userRepository.findAll().stream()
                .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
                .filter(u -> !Boolean.FALSE.equals(u.getActive()))
                .filter(u -> u.getRole() == Role.HR || u.getRole() == Role.ADMIN)
                .toList();

        if (recipients.isEmpty()) {
            log.warn("Aucun destinataire RH/ADMIN pour la notification '{}'", type);
            return List.of();
        }

        return recipients.stream()
                .map(hr -> notifyUser(hr, actor, type, title, message, link, relatedType, relatedId, actionable))
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    // ================= Lecture =================

    @Transactional(readOnly = true)
    public List<Notification> forUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    // ================= Mise à jour =================

    /** Marque comme lue, seulement si la notification appartient bien à l'utilisateur. */
    @Transactional
    public boolean markRead(Long notificationId, Long userId) {
        return notificationRepository.findById(notificationId)
                .filter(n -> n.getRecipient() != null && n.getRecipient().getId().equals(userId))
                .map(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public int markAllRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> !n.isRead())
                .toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    /**
     * Une demande vient d'être tranchée : les notifications RH correspondantes
     * ne proposent plus d'action, pour éviter une seconde décision.
     */
    @Transactional
    public void closeRequest(String relatedType, Long relatedId) {
        List<Notification> related = notificationRepository
                .findByRelatedTypeAndRelatedId(relatedType, relatedId);
        related.forEach(n -> {
            n.setActionable(false);
            n.setRead(true);
        });
        notificationRepository.saveAll(related);
    }
}
