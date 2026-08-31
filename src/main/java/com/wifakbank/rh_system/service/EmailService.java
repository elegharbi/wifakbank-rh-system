package com.wifakbank.rh_system.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Envoi en arrière-plan.
     *
     * L'appel rendait la main seulement après la réponse du serveur SMTP :
     * une inscription ou un message de contact restait bloqué plusieurs
     * secondes, voire jusqu'au délai d'expiration si la messagerie n'est pas
     * configurée. L'action métier ne doit pas dépendre de l'e-mail.
     */
    @Async
    public void sendSimpleMessage(String to, String subject, String text) {
        if (to == null || to.isBlank()) {
            return;
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            // Messagerie non configurée : on le note sans faire échouer l'action.
            log.info("E-mail non envoyé (SMTP non configuré) : « {} » -> {}", subject, to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // Pour Gmail, l'expéditeur doit correspondre au compte authentifié.
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("E-mail envoyé : « {} » -> {}", subject, to);
        } catch (Exception e) {
            log.warn("Échec de l'envoi d'e-mail « {} » -> {} : {}", subject, to, e.getMessage());
        }
    }
}
