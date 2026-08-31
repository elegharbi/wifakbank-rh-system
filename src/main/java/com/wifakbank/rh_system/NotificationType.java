package com.wifakbank.rh_system;

/** Types de notification échangés dans l'application. */
public final class NotificationType {

    private NotificationType() { }

    // ---- Vers le RH : une demande arrive ----
    public static final String TRAINING_REQUEST = "TRAINING_REQUEST";
    public static final String EVENT_REQUEST    = "EVENT_REQUEST";
    public static final String CONTACT_REQUEST  = "CONTACT_REQUEST";

    // ---- Vers l'employé : la décision du RH ----
    public static final String TRAINING_APPROVED = "TRAINING_APPROVED";
    public static final String TRAINING_REJECTED = "TRAINING_REJECTED";
    public static final String EVENT_APPROVED    = "EVENT_APPROVED";
    public static final String EVENT_REJECTED    = "EVENT_REJECTED";

    // ---- Vers le candidat : accusé de réception ----
    public static final String CONTACT_ACK = "CONTACT_ACK";
}
