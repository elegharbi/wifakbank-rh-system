package com.wifakbank.rh_system.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du rôle est obligatoire")
    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    // Rôles disponibles
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_HR = "HR";
    public static final String ROLE_EMPLOYEE = "EMPLOYEE";
    public static final String ROLE_CANDIDATE = "CANDIDATE";
    public static final String ROLE_TRAINER = "TRAINER";

    public RoleEntity(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public RoleEntity(String name) {
        this.name = name;
    }
}
