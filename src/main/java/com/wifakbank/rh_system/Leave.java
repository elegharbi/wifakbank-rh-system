package com.wifakbank.rh_system;

import jakarta.persistence.*;
import lombok.*;
import com.wifakbank.rh_system.model.LeaveStatus;

@Entity
@Table(name = "leaves")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String startDate;
    private String endDate;
    private String reason;
    private String leaveType;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status;


}
