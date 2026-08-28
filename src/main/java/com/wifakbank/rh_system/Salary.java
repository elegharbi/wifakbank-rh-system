package com.wifakbank.rh_system;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "salaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Le montant de base est obligatoire")
    @DecimalMin(value = "0.0", message = "Le salaire de base ne peut pas être négatif")
    private Double baseAmount;

    @DecimalMin(value = "0.0", message = "Le bonus ne peut pas être négatif")
    private Double bonusAmount;

    @DecimalMin(value = "0.0", message = "Les déductions ne peuvent pas être négatives")
    private Double deductions;
    private String month;
    private String year;
    private LocalDateTime paymentDate;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


}

