package com.wifakbank.rh_system;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckUsers {
    public static void main(String[] args) {
        try {
            Connection c = DriverManager.getConnection(
                System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://localhost:5433/wifak_bank_rh"),
                System.getenv().getOrDefault("DB_USERNAME", "postgres"),
                System.getenv().getOrDefault("DB_PASSWORD", ""));
            Statement s = c.createStatement();
            ResultSet rs = s.executeQuery("SELECT username, password, role FROM users");
            while (rs.next()) {
                System.out.println("User: " + rs.getString("username") + " | Pass: " + rs.getString("password") + " | Role: " + rs.getString("role"));
            }
            c.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
