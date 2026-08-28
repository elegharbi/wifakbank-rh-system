package com.wifakbank.rh_system.dto;

public class LeaderboardEntry {
    private String username;
    private int totalPoints;

    public LeaderboardEntry() {}

    public LeaderboardEntry(String username, int totalPoints) {
        this.username = username;
        this.totalPoints = totalPoints;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }
}
