package com.wifakbank.rh_system.dto;

public class ChangePasswordRequest {
    private String username;
    private String newPassword;

    public ChangePasswordRequest() {}

    public ChangePasswordRequest(String username, String newPassword) {
        this.username = username;
        this.newPassword = newPassword;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
