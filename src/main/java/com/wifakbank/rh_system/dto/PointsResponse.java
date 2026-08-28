package com.wifakbank.rh_system.dto;

public class PointsResponse {
    private int totalPoints;

    public PointsResponse() {}

    public PointsResponse(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }
}
