package com.wifakbank.rh_system.controller;

import com.wifakbank.rh_system.Notification;
import com.wifakbank.rh_system.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Notifications de l'utilisateur connecté.
 *
 * Chaque route déduit le destinataire du jeton : personne ne peut lire
 * ni marquer les notifications d'un autre compte.
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private Long currentUserId(Authentication authentication) {
        return Long.valueOf(authentication.getName());
    }

    /** Vue allégée : évite de sérialiser tout l'utilisateur et son mot de passe. */
    private Map<String, Object> toView(Notification n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", n.getId());
        m.put("type", n.getType());
        m.put("title", n.getTitle());
        m.put("message", n.getMessage());
        m.put("link", n.getLink());
        m.put("relatedType", n.getRelatedType());
        m.put("relatedId", n.getRelatedId());
        m.put("actionable", Boolean.TRUE.equals(n.getActionable()));
        m.put("read", n.isRead());
        m.put("createdAt", n.getCreatedAt());

        if (n.getActor() != null) {
            Map<String, Object> actor = new LinkedHashMap<>();
            actor.put("id", n.getActor().getId());
            actor.put("username", n.getActor().getUsername());
            actor.put("firstName", n.getActor().getFirstName());
            actor.put("lastName", n.getActor().getLastName());
            actor.put("email", n.getActor().getEmail());
            m.put("actor", actor);
        }
        return m;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> myNotifications(Authentication authentication) {
        List<Map<String, Object>> list = notificationService.forUser(currentUserId(authentication))
                .stream().map(this::toView).toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> unreadCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(currentUserId(authentication))));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(Authentication authentication, @PathVariable Long id) {
        boolean ok = notificationService.markRead(id, currentUserId(authentication));
        if (!ok) {
            return ResponseEntity.status(404).body(Map.of("error", "Notification introuvable"));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllRead(Authentication authentication) {
        int n = notificationService.markAllRead(currentUserId(authentication));
        return ResponseEntity.ok(Map.of("success", true, "updated", n));
    }
}
