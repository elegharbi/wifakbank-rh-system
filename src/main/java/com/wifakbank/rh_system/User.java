package com.wifakbank.rh_system;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.wifakbank.rh_system.model.Role;
import com.wifakbank.rh_system.model.RoleEntity;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@org.hibernate.annotations.SQLRestriction("deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Size(min = 2, message = "Le nom d'utilisateur doit avoir au moins 2 caractères")
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 2, message = "Le mot de passe doit avoir au moins 2 caractères")
    @Column(nullable = false)
    private String password;

    @Email(message = "Format d'email invalide")
    @Column(unique = true)
    private String email;

    // Rôle legacy (pour compatibilité, sera progressivement retiré)
    @Enumerated(EnumType.STRING)
    private Role role;

    // Relation vers la nouvelle table roles
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private RoleEntity roleEntity;

    private String firstName;
    private String lastName;
    
    @Column(unique = true)
    private String phone;
    
    private String profileImage;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;
    private boolean passwordChanged = false;

    // Champs pour le blocage et le Soft Delete
    private Boolean active = true;
    private Boolean deleted = false;

    // Champs enrichis (anciennement dans Employee)
    @Column(name = "performance_score")
    private Integer performanceScore = 1000;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

