package com.wifakbank.rh_system;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private String department;

    // ---- Champs de la candidature (formulaire public) ----
    private String address;
    private String birthDate;
    private String educationLevel;
    private String speciality;
    private String desiredPosition;
    private String motivationLetter;

    /** CV encode en base64, tel que lu par le navigateur. */
    private String cvBase64;
    private String cvFileName;
    private String cvContentType;
}

